---
title: "How to test AML detection rules when production has no labels"
seo_title: "Testing AML detection rules with synthetic ground truth"
description: "Inject known AML typologies, keep the label out of the detection SQL, and measure recall by case, not row. What that caught, and what it still hides."
date: 2026-11-23
keyword: test AML detection rules synthetic data
repo: https://github.com/vabhishek8/aml-transaction-monitoring-pipeline
tags: [AML, testing, synthetic data, DuckDB, transaction monitoring]
---

A transaction monitoring rule has an awkward property: in production you never find out about the cases it missed. Nobody files a ticket saying "this was structuring and you did not alert." Investigated alerts give you a precision signal, slowly. Recall, the number you most want before a rule goes live, has no natural source at all.

My [AML transaction monitoring pipeline](https://github.com/vabhishek8/aml-transaction-monitoring-pipeline) handles that by generating its own ground truth. This post covers how that works, the two design rules that make it trustworthy, and what I found when I pushed the tests harder than the CI suite does.

## Inject the cases you want to catch

The bronze layer is a synthetic retail-banking feed. Most of it is ordinary customer activity, and on top of that the generator plants five typologies: structuring, layering, impossible travel, amount outliers and high-risk corridors. Every planted row carries the name of its typology in an `injected_typology` column. Normal rows carry `None`.

Each typology is a small, readable function. Layering, for example, is a large inbound wire followed within hours by an outbound wire of a similar amount:

```python
ts_in = _random_timestamp(start, end - timedelta(hours=6), rng)
amount = rng.uniform(8_000, 60_000)
# ... wire_in row, injected_typology = "layering"
ts_out = ts_in + timedelta(hours=rng.uniform(0.5, 5))
# ... wire_out row for amount * rng.uniform(0.85, 0.99)
```

The volume of each typology scales with the batch, with a floor so a small test batch still has something to find:

```python
rows += inject_structuring(customers, start, end, max(6, n_normal // 1500), rng)
rows += inject_layering(customers, start, end, max(6, n_normal // 1800), rng)
rows += inject_impossible_travel(customers, start, end, max(6, n_normal // 1800), rng)
rows += inject_amount_outliers(customers, start, end, max(8, n_normal // 1200), rng, np_rng)
rows += inject_high_risk_corridor(customers, start, end, max(6, n_normal // 2000), rng)
```

The test fixture uses 8,000 normal transactions across 300 customers and 90 days, seed 7. That produces 61 planted rows across 32 cases.

## Rule 1: the detection SQL must never read the label

This is the whole game. If `src/gold.py` can see `injected_typology`, every recall number is meaningless. A real detection system has no oracle column at inference time, so the test harness must be the only consumer of it.

In the repo that rule was enforced by a docstring:

> gold-layer detection logic never reads this column; it re-derives everything from the transaction fields alone

A docstring is a promise, not a control. So I wrote a test that makes it mechanical: score the same batch three times, once with the label intact, once with it nulled and once with it shuffled across rows, then assert every detection output is identical.

```python
@pytest.mark.parametrize("mutation", ["nulled", "shuffled"])
def test_detection_output_does_not_depend_on_label(tmp_path, mutation):
    batch = generate_batch(n_customers=300, n_normal=8000, days=90, seed=7)
    baseline = _score(batch, tmp_path / "baseline")

    mutated = batch.copy()
    if mutation == "nulled":
        mutated["injected_typology"] = None
    else:
        mutated["injected_typology"] = (
            mutated["injected_typology"].sample(frac=1.0, random_state=1).to_numpy()
        )

    pd.testing.assert_frame_equal(baseline, _score(mutated, tmp_path / mutation))
```

`_score` runs silver and gold and returns the flag columns, `amount_zscore` and `risk_score`, indexed by `transaction_id`. Against the current code it passes. To check it can fail, I added `or injected_typology = 'amount_outlier'` to the high-risk corridor CTE and reran it: both cases failed. A guard you have never seen fail is not a guard. [CONFIRM: commit link once the test is merged into the AML repo]

One thing the test does not cover: the gold query still selects `b.injected_typology` into its output so the recall tests can group by it. Passing the label through is harmless today, but it means the column sits right next to the detection logic. The cleaner design is to keep ground truth in its own file keyed by `transaction_id` and join it only inside the tests.

## Rule 2: measure recall per case, not per row

Here is the core recall test:

```python
@pytest.mark.parametrize("typology,flag_col", list(TYPOLOGY_TO_FLAG.items()))
def test_case_level_recall_is_perfect_on_injected_typologies(scored, typology, flag_col):
    gold_df, _, _ = scored
    injected = gold_df[gold_df["injected_typology"] == typology]
    assert len(injected) > 0, f"fixture generated zero {typology} cases -- test is meaningless"
    case_hit_rate = injected.groupby("customer_id")[flag_col].any().mean()
    assert case_hit_rate == 1.0, f"{typology}: only caught {case_hit_rate:.0%} of injected cases"
```

Two details matter. The `len(injected) > 0` assertion stops the test passing vacuously when a seed happens to plant nothing. And the `groupby("customer_id")[flag_col].any()` asks "did this scheme get flagged at least once", not "was every leg flagged".

Row-level recall would be the wrong metric, and the numbers show why:

| Typology | Planted rows | Cases | Row recall | Case recall |
|---|---|---|---|---|
| Structuring | 23 | 6 | 56.5% | 100% |
| Layering | 12 | 6 | 100% | 100% |
| Impossible travel | 12 | 6 | 58.3% | 100% |
| Amount outlier | 8 | 8 | 100% | 100% |
| High-risk corridor | 6 | 6 | 100% | 100% |

Structuring sits at 56.5% by design. The rule fires when the rolling 48-hour window holds at least three sub-threshold cash deposits:

```sql
where deposit_count_48h >= 3 and deposit_sum_48h >= {CTR_THRESHOLD_AUD} * 0.9
```

The first two deposits of a scheme can never meet that, because at their point in time there is no evidence yet. Impossible travel is similar: the rule compares each transaction with the customer's previous one via `LAG`, so the first leg of a Sydney to London pair usually has nothing suspicious behind it. A row-level recall test would fail both rules for behaving correctly, and the easy way to make it pass would be to flag retroactively, which no real monitoring system can do at the time a transaction arrives.

## The false-positive test, and what "false" means here

```python
assert fp_rate < 0.12, f"false-positive rate too high: {fp_rate:.2%}"
```

On the fixture, 7.59% of the 8,000 clean rows raise at least one flag. Most of that is not error. The high-risk corridor rule flags 520 clean rows (6.5%) because they route through a high-risk jurisdiction or merchant category. That is the rule doing exactly what its policy says. The other four rules together flag 115 clean rows (1.44%), and 101 of those are impossible travel, a side effect of the generator sending 8% of ordinary transactions to a random city at a random time.

Across eight seeds the blended rate stays between 7.49% and 8.19%, so the 12% bar has around four points of headroom. The weakness is that it is one blended number. Layering's false-positive rate on the fixture is 0.15%. A bug that multiplied it by twenty would still not break the 12% bar, because the corridor rule's volume hides it. Per-rule budgets would catch that; one shared budget will not.

## What the tests still do not tell me

Writing this up, I ran the pipeline outside the CI fixture and found three gaps.

**1. Flag recall is not alert recall.** The tests assert on flag columns. An analyst works from the alert queue, which only contains rows with `risk_score >= 40`. The score is a weighted sum:

```sql
least(100,
    (sf.transaction_id is not null)::int * 30 +
    (lf.transaction_id is not null)::int * 30 +
    (itf.transaction_id is not null)::int * 35 +
    (aof.transaction_id is not null)::int * 15 +
    (hrf.transaction_id is not null)::int * 10 +
    case b.customer_risk_tier when 'high' then 10 when 'medium' then 4 else 0 end
) as risk_score
```

An amount outlier on its own scores 15, plus at most 10 for a high-risk customer: 25, which can never reach 40. On the fixture, 0 of 8 planted outliers reach the alert queue, as do 1 of 6 corridor cases and 5 of 6 impossible travel cases. Meanwhile 39 of the 71 alerts are clean rows, 21 of them impossible travel plus corridor for low-risk customers. Every flag-level test is green, and an analyst would never see the outlier cases. That may be an acceptable weighting decision, but right now it is an accidental one, and no test describes it.

**2. One seed is one sample.** The suite pins seed 7. I reran the case-level recall check on seeds 1, 2, 3, 4, 5, 11, 42 and 2026. Four typologies held at 100% everywhere. Amount outliers dropped to 62.5% on seed 5 (5 of 8) and 87.5% on seed 42. The four misses scored z between 4.47 and 4.99, just under the 5.0 threshold. The generator plants outliers at 6 to 11 times the customer's configured standard deviation, but the rule estimates spread from 16 to 29 observed transactions using MAD, and on a sample that small the estimate can land well above the configured value. The test passes because seed 7 happens not to produce one of those customers.

**3. The ground truth is mine.** I wrote the typologies and I wrote the rules, so 100% recall partly measures agreement between two things built from the same mental model. Synthetic injection is good for catching regressions and logic errors. It says nothing about schemes I did not think to generate. Production validation needs ground truth from outside the author: investigator outcomes, and SME-reviewed samples drawn from below the alert threshold.

## What I would change next

In order of value for effort:

1. Merge the label-blindness test so Rule 1 is enforced in CI, not just described.
2. Add alert-level recall assertions per typology, or document which typologies are allowed to flag without alerting. Either is fine; silence is not.
3. Parametrise the recall test over several seeds and accept a floor (say 85%) instead of 100% on one seed, so the suite reports variability rather than hiding it.
4. Replace the single 12% false-positive bar with a budget per rule.
5. Move ground truth out of the bronze rows into a separate file joined only by the tests.

None of this needs production data. That is the real argument for the approach: you can find out a lot about whether a detection rule works long before it sees a live transaction, as long as the test harness is the only thing that knows the answers.

The code is in [aml-transaction-monitoring-pipeline](https://github.com/vabhishek8/aml-transaction-monitoring-pipeline). The numbers above come from `generate_batch(n_customers=300, n_normal=8000, days=90, seed=7)` against `main` as of 17 November 2026.
