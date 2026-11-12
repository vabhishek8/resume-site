// Generated from the three public pipeline repos (cloned and run locally on
// 12 Nov 2026). Code excerpts are byte-exact copies of the linked line ranges,
// pinned to a commit SHA so the links never drift. Test output is real pytest
// output from that run (Python 3.10, pytest 9.2, DuckDB 1.5.6; the repos pin
// pytest 9.1.1 and DuckDB 1.5.5, which is what CI uses).
// To refresh: re-clone, re-run pytest -v, and regenerate. Don't hand-edit.
export const ARTIFACTS_RUN = { date: "12 Nov 2026", python: "3.10", pytest: "9.2" };
export const ARTIFACTS = {
  "weather": {
    "repo": "azure-medallion-weather-pipeline",
    "sha": "b192949d42dd73b17cbf42430bd1ba05cc34ed15",
    "excerpts": [
      {
        "file": "src/ingest.py",
        "a": 1,
        "b": 11,
        "lang": "python",
        "url": "https://github.com/vabhishek8/azure-medallion-weather-pipeline/blob/b192949d42dd73b17cbf42430bd1ba05cc34ed15/src/ingest.py#L1-L11",
        "code": "\"\"\"\nBronze layer: raw ingestion from Open-Meteo's historical archive API\n(ERA5/ERA5-Land reanalysis), not the forecast endpoint.\n\nThis was a deliberate correction after testing: the forecast endpoint's\n`past_days` parameter returns sparse/null daily aggregates for humidity and\nother fields beyond a short lookback window -- a real data-quality footgun\nthat the quality-check layer (src/quality_checks.py) is designed to catch,\nnot paper over. The archive endpoint returns complete, reanalysis-grade\ndaily aggregates with roughly a 1-day publication lag, so bronze always\nrequests up to `yesterday`, not `today`."
      },
      {
        "file": "src/quality_checks.py",
        "a": 82,
        "b": 89,
        "lang": "python",
        "url": "https://github.com/vabhishek8/azure-medallion-weather-pipeline/blob/b192949d42dd73b17cbf42430bd1ba05cc34ed15/src/quality_checks.py#L82-L89",
        "code": "def check_nulls(df: pd.DataFrame, report: QualityReport) -> None:\n    if df.empty:\n        return\n    for col in REQUIRED_COLUMNS & set(df.columns):\n        n_null = int(df[col].isna().sum())\n        if n_null:\n            severity = \"error\" if col in (\"city\", \"date\") else \"warning\"\n            report.add(\"nulls\", severity, f\"{col} has {n_null} null value(s)\")"
      }
    ],
    "tests": {
      "summary": [
        "...............                                                          [100%]",
        "15 passed in 0.71s"
      ],
      "named": [
        "tests/test_quality_checks.py::test_duplicate_city_date_fails PASSED",
        "tests/test_quality_checks.py::test_inverted_temps_fails PASSED",
        "tests/test_quality_checks.py::test_non_required_null_is_warning_not_error PASSED",
        "tests/test_quality_checks.py::test_null_city_is_error PASSED"
      ]
    }
  },
  "aml": {
    "repo": "aml-transaction-monitoring-pipeline",
    "sha": "fdd3d9d4bdc47974c62a7a96586781ff682a5ad8",
    "excerpts": [
      {
        "file": "src/gold.py",
        "a": 147,
        "b": 162,
        "lang": "sql",
        "url": "https://github.com/vabhishek8/aml-transaction-monitoring-pipeline/blob/fdd3d9d4bdc47974c62a7a96586781ff682a5ad8/src/gold.py#L147-L162",
        "code": "customer_mad as (\n    select customer_id, median(abs_dev) as cust_mad\n    from deviations\n    group by customer_id\n),\noutlier_calc as (\n    select\n        d.transaction_id,\n        -- 0.6745 scales MAD to be comparable to a normal-distribution stddev\n        case when m.cust_mad is null or m.cust_mad < 1.0 then 0\n             else 0.6745 * d.signed_dev / m.cust_mad end as amount_zscore\n    from deviations d\n    join customer_mad m using (customer_id)\n),\namount_outlier_flagged as (\n    select transaction_id from outlier_calc where amount_zscore > {AMOUNT_OUTLIER_Z_THRESHOLD}"
      }
    ],
    "tests": {
      "summary": [
        "...............s.............                                            [100%]",
        "SKIPPED [1] tests/test_gold.py:95: no low-volume customers received an injected outlier in this seed",
        "28 passed, 1 skipped in 0.93s"
      ],
      "named": [
        "tests/test_gold.py::test_case_level_recall_is_perfect_on_injected_typologies[structuring-flag_structuring] PASSED",
        "tests/test_gold.py::test_case_level_recall_is_perfect_on_injected_typologies[layering-flag_layering] PASSED",
        "tests/test_gold.py::test_case_level_recall_is_perfect_on_injected_typologies[impossible_travel-flag_impossible_travel] PASSED",
        "tests/test_gold.py::test_case_level_recall_is_perfect_on_injected_typologies[amount_outlier-flag_amount_outlier] PASSED",
        "tests/test_gold.py::test_case_level_recall_is_perfect_on_injected_typologies[high_risk_corridor-flag_high_risk_corridor] PASSED",
        "tests/test_gold.py::test_false_positive_rate_on_clean_transactions_is_low PASSED",
        "tests/test_gold.py::test_risk_score_bounded_0_to_100 PASSED",
        "tests/test_gold.py::test_alert_queue_only_contains_scores_above_threshold PASSED",
        "tests/test_gold.py::test_customer_summary_only_lists_customers_with_alerts PASSED",
        "tests/test_gold.py::test_amount_outlier_uses_robust_stat_not_skewed_by_own_outlier SKIPPED"
      ]
    }
  },
  "basel": {
    "repo": "basel-liquidity-reporting-pipeline",
    "sha": "4fc0634c0aaf3b903b5ba849a82ce64193cda53b",
    "excerpts": [
      {
        "file": "src/gold.py",
        "a": 96,
        "b": 109,
        "lang": "sql",
        "url": "https://github.com/vabhishek8/basel-liquidity-reporting-pipeline/blob/4fc0634c0aaf3b903b5ba849a82ce64193cda53b/src/gold.py#L96-L109",
        "code": "    -- Step 1: cap Level 2B on its own, relative to Level 1 (BCBS238 par 51,\n    -- Level 2B <= 15% of total HQLA, expressed as a ratio to Level 1 to\n    -- avoid a circular definition of \"total HQLA\").\n    least(raw_level2b, level1_hqla * {LEVEL_2B_TO_LEVEL_1_RATIO}) as adjusted_level2b,\n    -- Step 2: cap combined Level 2 (2A + already-capped 2B), relative to\n    -- Level 1 (Level 2 total <= 40% of total HQLA).\n    least(\n        raw_level2a + least(raw_level2b, level1_hqla * {LEVEL_2B_TO_LEVEL_1_RATIO}),\n        level1_hqla * {LEVEL_2_TO_LEVEL_1_RATIO}\n    ) as adjusted_level2,\n    level1_hqla + least(\n        raw_level2a + least(raw_level2b, level1_hqla * {LEVEL_2B_TO_LEVEL_1_RATIO}),\n        level1_hqla * {LEVEL_2_TO_LEVEL_1_RATIO}\n    ) as total_hqla,"
      },
      {
        "file": "src/gold.py",
        "a": 129,
        "b": 135,
        "lang": "sql",
        "url": "https://github.com/vabhishek8/basel-liquidity-reporting-pipeline/blob/4fc0634c0aaf3b903b5ba849a82ce64193cda53b/src/gold.py#L129-L135",
        "code": "NAIVE_HQLA_SQL = _COMPONENTS_CTE + f\"\"\"\nselect\n    reporting_date,\n    level1_hqla,\n    least(raw_level2a + raw_level2b, level1_hqla * {LEVEL_2_TO_LEVEL_1_RATIO}) as naive_adjusted_level2,\n    level1_hqla + least(raw_level2a + raw_level2b, level1_hqla * {LEVEL_2_TO_LEVEL_1_RATIO}) as naive_total_hqla\nfrom components"
      }
    ],
    "tests": {
      "summary": [
        ".......................                                                  [100%]",
        "23 passed in 0.74s"
      ],
      "named": [
        "tests/test_gold.py::test_lcr_matches_hand_calculation PASSED",
        "tests/test_gold.py::test_nsfr_matches_hand_calculation PASSED",
        "tests/test_gold.py::test_baseline_day_is_above_regulatory_minimum PASSED",
        "tests/test_gold.py::test_deposit_run_breaches_lcr_but_not_nsfr PASSED",
        "tests/test_gold.py::test_hqla_waterfall_not_naive_single_cap PASSED",
        "tests/test_gold.py::test_lcr_and_nsfr_bounded_and_positive PASSED"
      ]
    }
  }
};
