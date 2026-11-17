---
title: "Why my AML outlier rule couldn't flag a $1M transaction: robust z-scores in DuckDB SQL"
seo_title: "AML transaction monitoring in SQL: robust outlier z-scores"
description: "A mean/stddev z-score is capped at (n-1)/sqrt(n), so my AML outlier rule went blind for low-volume customers. The median/MAD SQL fix, and what my tests still miss."
date: 2026-11-16
keyword: AML transaction monitoring SQL
repo: https://github.com/vabhishek8/aml-transaction-monitoring-pipeline
tags: [AML, SQL, DuckDB, data quality, transaction monitoring]
---

One of the five detection rules in my [AML transaction monitoring pipeline](https://github.com/vabhishek8/aml-transaction-monitoring-pipeline) looks for a transaction that is far outside a customer's own spending pattern. Not a fixed dollar threshold: a customer who averages $50 and a customer who averages $5,000 need different bars. The obvious implementation is a per-customer z-score. The obvious implementation is also mathematically incapable of doing the job for most customers, and it took a recall test to show me.

This post walks through the bug, the SQL that replaced it, and the gaps I found in my own tests while writing it up.

## The setup

The pipeline is a bronze, silver, gold flow in Python and DuckDB. A generator synthesises a retail-banking transaction feed and deliberately injects five AML typologies (structuring, layering, impossible travel, amount outliers, high-risk corridors), recording which rows it injected in an `injected_typology` column. The detection SQL in `src/gold.py` never reads that column. Only the test harness does, so I can measure recall against known ground truth the way a monitoring team validates a new rule before it touches production data.

The outlier rule is one CTE chain inside a larger risk-scoring query. Its first version was a per-customer mean and sample standard deviation, flagging anything above z = 5.

## The ceiling nobody mentions

Here is the problem. When you score a transaction against a baseline that includes that same transaction, the z-score has an upper bound that depends only on the sample size:

```
max |z| = (n - 1) / sqrt(n)
```

This is a known result (Shiffler, 1988), and it is easy to check. With a threshold of 5:

| Transactions for the customer (n) | Highest possible z |
|---|---|
| 10 | 2.85 |
| 15 | 3.61 |
| 20 | 4.25 |
| 26 | 4.90 |
| 27 | 5.00 |
| 50 | 6.93 |

A customer with 26 or fewer transactions in the window can never cross z = 5, no matter how extreme the outlier. I confirmed it with a toy case: 25 transactions around $100 and one transaction of $1,000,000 scores z = 4.90. A million dollars, invisible.

The intuition: the outlier drags the mean towards itself and inflates the standard deviation it is being divided by. The bigger the outlier, the more it inflates its own yardstick. In the test fixture, the eight customers who received an injected outlier have between 20 and 35 transactions. Four of them sit at 26 or fewer, where a flag is mathematically impossible. The other four have ceilings between 5.1 and 5.8, so the outlier would have to be close to the theoretical maximum to register at all.

The README for the repo records that the first mean/stddev version reached 20% case-level recall. When I rebuilt the naive query against the current fixture for this post, it caught 0 of 8 injected outlier customers at z > 5. The highest naive z on any injected outlier was 4.78. That is the ceiling doing exactly what the formula says.

## The fix: median and MAD

The replacement uses the median as the centre and the median absolute deviation (MAD) as the spread. Both are robust: a single extreme value barely moves either of them, so the outlier cannot hide behind its own influence. This is the code as it runs today in `src/gold.py`:

```sql
customer_median as (
    select customer_id, median(amount_aud) as cust_median
    from base
    group by customer_id
),
deviations as (
    select
        b.transaction_id,
        b.customer_id,
        b.amount_aud - cm.cust_median as signed_dev,
        abs(b.amount_aud - cm.cust_median) as abs_dev
    from base b
    join customer_median cm using (customer_id)
),
customer_mad as (
    select customer_id, median(abs_dev) as cust_mad
    from deviations
    group by customer_id
),
outlier_calc as (
    select
        d.transaction_id,
        -- 0.6745 scales MAD to be comparable to a normal-distribution stddev
        case when m.cust_mad is null or m.cust_mad < 1.0 then 0
             else 0.6745 * d.signed_dev / m.cust_mad end as amount_zscore
    from deviations d
    join customer_mad m using (customer_id)
),
amount_outlier_flagged as (
    select transaction_id from outlier_calc where amount_zscore > {AMOUNT_OUTLIER_Z_THRESHOLD}
),
```

Three decisions in there are worth calling out.

**The 0.6745 constant.** For normally distributed data, MAD is about 0.6745 standard deviations. Multiplying by it puts the robust score on the same scale as a classic z-score, so `AMOUNT_OUTLIER_Z_THRESHOLD = 5.0` means roughly the same thing it did before. Without it, you would be silently changing the threshold by a factor of about 1.5 while telling yourself you had only changed the statistic.

**Signed deviation.** The score uses `signed_dev`, not `abs_dev`, so only unusually large amounts flag. An unusually small transaction is not an AML signal for this rule. That is a deliberate scope choice, and it is visible in one column name.

**The MAD floor.** If more than half of a customer's transactions are the same amount, MAD is zero and the division blows up. The `cust_mad < 1.0 then 0` guard prevents that. It also has a cost I cover below.

After the change, the same fixture gives 8 of 8 injected outlier customers flagged, and the outlier rule fires on none of the clean transactions.

## How it is tested

The test that caught this measures recall at the case level, not the row level:

```python
@pytest.mark.parametrize("typology,flag_col", list(TYPOLOGY_TO_FLAG.items()))
def test_case_level_recall_is_perfect_on_injected_typologies(scored, typology, flag_col):
    gold_df, _, _ = scored
    injected = gold_df[gold_df["injected_typology"] == typology]
    assert len(injected) > 0, f"fixture generated zero {typology} cases -- test is meaningless"
    case_hit_rate = injected.groupby("customer_id")[flag_col].any().mean()
    assert case_hit_rate == 1.0, f"{typology}: only caught {case_hit_rate:.0%} of injected cases"
```

Two details matter. The `groupby("customer_id").any()` asks "did this scheme get an alert at all", which is what an investigator cares about. Row-level recall would penalise a structuring rule for not flagging the first small deposit, before there is any evidence. And the `len(injected) > 0` assertion stops the test from passing vacuously if a generator change ever stops injecting a typology. A recall test with no positives is not a test.

## What the tests still miss

Writing this up meant rereading my own code with a sceptical eye. Four things are not yet right.

**1. The regression guard never runs.** There is a dedicated test, `test_amount_outlier_uses_robust_stat_not_skewed_by_own_outlier`, that checks recall for customers with 15 or fewer transactions, where the original bug was worst. On the fixed test seed, the smallest injected-outlier customer has 20 transactions, so the test hits `pytest.skip` every time. The suite reports 28 passed, 1 skipped, and that one skip is the guard for the exact failure this post is about. The fix is to make the fixture deterministically inject an outlier into a low-volume customer and assert on it, or to derive the cut-off from the bound above (n of 26 or fewer) rather than an arbitrary 15. A skip in a regression test should be a failure, not a shrug.

**2. The baseline is not point-in-time.** `median(amount_aud)` is computed over every transaction the customer has in the batch, including ones that happen after the transaction being scored. For a batch backtest that is acceptable. For production scoring it is leakage: you are judging today's transaction against a baseline that contains next week. The point-in-time version is a trailing window that excludes the current row. DuckDB supports `median` as a framed window aggregate, so the shape is:

```sql
median(amount_aud) over (
    partition by customer_id
    order by timestamp
    range between interval 90 days preceding and interval 1 second preceding
) as trailing_median
```

MAD then needs the same treatment, which is more expensive because each row's deviation depends on its own trailing median. That cost is the real engineering decision, and it is the next change I want to make.

**3. The MAD floor is a blind spot.** A customer whose transactions are mostly one identical amount, a fixed subscription or a regular transfer, has MAD of zero, so every transaction scores 0 and the rule is switched off for them. That is safer than dividing by zero, but it is silent. The better behaviour is to fall back to a different spread estimate (for example a floor based on the median itself) and count how many customers are on the fallback, so the gap is observable instead of hidden.

**4. The module docstring is stale.** The header of `gold.py` still describes signal 4 as a mean/stddev z-score. The code below it is robust. In a regulated team, documentation that contradicts the implementation is a finding of its own, because the docstring is what a reviewer reads first.

## The takeaway

The lesson is not "use MAD". It is that a detection rule's statistic has properties you can reason about before you run it, and a recall test against injected ground truth is what turns that reasoning into evidence. The naive z-score looked fine in a notebook. It only failed when I asked the question an AML team would ask: of the schemes we planted, how many did we catch?

The full code, tests and a live dashboard are in the [repo](https://github.com/vabhishek8/aml-transaction-monitoring-pipeline).
