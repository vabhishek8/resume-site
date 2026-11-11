// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all site copy. Edit here, not in components.
// Rule for this file: every claim must be backed by production work, a public
// repo, or a document Abhishek can produce in an interview. No ADF claims:
// Azure Data Factory appears only where a public repo's Bicep IaC targets it.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: { first: "Abhishek", last: "Vadlamudi" },
  location: "Sydney, AU",
  availability: "Open to relocation",
  tagline: { plain: "Building data platforms that", italic: "don't fall over at 2 a.m." },
  role: { from: "Senior Business Intelligence Engineer", to: "Azure Data Engineer" },
  lede:
    "4+ years at Unisys engineering the data layer behind financial-services reporting: SQL Server and SSIS pipelines on-prem, Databricks and PySpark over ADLS and Synapse in Azure, and Azure DevOps-governed releases from DEV to PROD. Correct, on time, and loud when something breaks.",
  linkedin: "https://linkedin.com/in/abhishekvadlamudi",
  linkedinLabel: "linkedin.com/in/abhishekvadlamudi",
  github: "https://github.com/vabhishek8",
  githubLabel: "github.com/vabhishek8",
  locationLong: "Sydney, NSW, Australia"
};

export const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" }
];

export const ABOUT = {
  paragraphs: [
    "I'm a Senior Business Intelligence Engineer at Unisys in Sydney. Since February 2022 I've moved steadily from building reports to engineering the layer underneath them: ingestion, transformation, data models, and the release process that keeps them honest. Most of that work serves financial-services clients, where a wrong number is an incident, not a typo.",
    "Day to day that means SQL Server (T-SQL, stored procedures, SQL Agent, SSIS) and SSRS on the on-prem side, and Azure Databricks with PySpark over Azure Data Lake Storage and Synapse on the platform side, all released through Azure DevOps CI/CD. I design for failure modes first: validation gates before data moves downstream, monitoring that alerts before stakeholders do, and environment separation so nothing reaches PROD untested. A pipeline that fails silently is worse than one that fails loudly.",
    "Outside work I build public, production-pattern pipelines (medallion weather, AML transaction monitoring, Basel III liquidity) with tests, scheduled runs and Bicep IaC, so the engineering can be inspected, not just claimed. And I translate across the room: specs for engineers, runbooks for operations, and plain answers for stakeholders who just need to know the numbers are right."
  ],
  stats: [
    { to: 4, suffix: "+", label: "Years engineering data & BI at Unisys (since Feb 2022)" },
    { to: 4, suffix: "h", label: "Cut from a critical daily load by moving it from VBA/batch to Python" },
    { to: 40, prefix: "~", suffix: "%", label: "Less manual reporting effort after automating Power BI refresh pipelines" },
    { to: 3, label: "Public production-pattern pipelines running on a daily schedule" }
  ]
};

// The medallion walkthrough is the architecture the three live pipelines share
// (see PROJECTS). Wording is drawn from those project descriptions.
export const MEDALLION = [
  {
    key: "src",
    label: "Sources",
    title: "Ingest",
    body: "Databases, SFTP drops, CSV/JSON files and REST APIs land as-is. Nothing is trusted yet.",
    tools: ["SQL Server", "SSIS", "SFTP / files", "REST APIs"]
  },
  {
    key: "bronze",
    label: "Bronze",
    title: "Land raw",
    body: "Immutable, audit-grade raw storage. Nothing transformed, everything replayable.",
    tools: ["ADLS Gen2", "Immutable storage"]
  },
  {
    key: "silver",
    label: "Silver",
    title: "Gate quality",
    body: "An explicit data-quality gate: schema, nulls, range, duplicate and consistency checks, before anything moves downstream.",
    tools: ["Python", "PySpark", "pytest"]
  },
  {
    key: "gold",
    label: "Gold",
    title: "Model & compute",
    body: "Business logic in SQL: rolling anomaly windows, AML typologies, LCR / NSFR, each checked against golden values.",
    tools: ["DuckDB", "Synapse", "Databricks"]
  },
  {
    key: "serve",
    label: "Serve",
    title: "Deliver",
    body: "Dashboards and reports on a real schedule, deployed through CI/CD with IaC behind it.",
    tools: ["Power BI", "Plotly", "GitHub Actions", "Bicep"]
  }
];

// Capability groups, not self-ratings. Each tool carries where it is evidenced:
// "prod"  = used in production at Unisys
// "built" = built and tested in a public repo (github.com/vabhishek8)
export const SKILLS = [
  {
    title: "Ingestion & integration",
    items: [["SSIS packages", "prod"], ["SFTP & file extracts (CSV / JSON)", "prod"], ["PowerShell SqlBulkCopy loads", "prod"], ["REST API ingestion", "built"]]
  },
  {
    title: "Transformation & modelling",
    items: [["T-SQL: stored procedures, views, OPENJSON", "prod"], ["PySpark on Azure Databricks", "prod"], ["Python", "prod"], ["DuckDB SQL: window functions", "built"]]
  },
  {
    title: "Lakehouse & warehouse",
    items: [["Azure Data Lake Storage Gen2", "prod"], ["Azure Synapse Analytics", "prod"], ["SQL Server", "prod"], ["Medallion: bronze / silver / gold", "built"]]
  },
  {
    title: "Orchestration & scheduling",
    items: [["SQL Server Agent jobs", "prod"], ["SSRS subscriptions", "prod"], ["GitHub Actions schedules", "built"]]
  },
  {
    title: "Reliability & data quality",
    items: [["Validation gates & reconciliation", "prod"], ["Monitoring & alerting", "prod"], ["Query performance tuning", "prod"], ["pytest regression tests", "built"]]
  },
  {
    title: "CI/CD, IaC & governance",
    items: [["Azure DevOps: Repos, Pipelines, Boards", "prod"], ["DEV → SIT → UAT → PROD release control", "prod"], ["Git branching strategies", "prod"], ["Bicep: private endpoints, Key Vault RBAC, Purview", "built"]]
  },
  {
    title: "Semantic layer & BI",
    items: [["Power BI: DAX & data modelling", "prod"], ["SSRS", "prod"], ["Automated dataset refresh", "prod"], ["Plotly dashboards", "built"]]
  }
];

export const MARQUEE = [
  "SQL Server", "SSIS", "Databricks", "ADLS Gen2", "Synapse", "PySpark", "T-SQL",
  "Power BI", "DAX", "SSRS", "Azure DevOps", "Bicep", "DuckDB", "pytest", "GitHub Actions"
];

// Unisys titles and dates follow the LinkedIn progression (Associate, then BI
// Engineer, then Senior). Confirm the two internal promotion dates against
// LinkedIn before publishing.
export const EXPERIENCE = [
  {
    role: "Senior Business Intelligence Engineer",
    org: "Unisys",
    place: "Sydney, NSW",
    dates: "Mar 2025 to Present",
    bullets: [
      "Own the end-to-end pipeline lifecycle for financial-services client engagements: source extraction, transformation, validation, and delivery into reporting layers on SQL Server and Azure.",
      "Build and maintain production pipelines across SQL Server (stored procedures, SQL Agent, SSIS) and Azure Databricks / PySpark, landing data in Azure Data Lake Storage and Synapse.",
      "Run release governance across DEV, SIT, UAT and PROD through Azure DevOps CI/CD and branching strategies, with UAT validation before anything reaches production.",
      "Define data-quality checks at the transformation layer that catch schema drift, null propagation and SLA calculation errors before they reach downstream consumers.",
      "Led an estate-wide cutover off a decommissioned file server: traced ~28 SQL Agent job steps across ~20 jobs, including coupled producer → consumer steps that had to move together.",
      "Reconcile case records across 38 databases against customer and account perimeter lists to scope client data extracts.",
      "Lead end-to-end workstreams within a 10+ person engineering and analyst team, from requirements through production deployment and handover."
    ]
  },
  {
    role: "Business Intelligence Engineer",
    org: "Unisys",
    place: "Sydney, NSW",
    dates: "May 2024 to Mar 2025",
    bullets: [
      "Migrated a critical daily load from VBA and batch scripts to Python, cutting its runtime by 4 hours.",
      "Rebuilt the SQL and DAX models behind SLA and operational KPI reporting, eliminating recurring refresh failures.",
      "Automated Power BI dataset refresh pipelines and reporting data flows: ~40% less manual reporting effort, and data freshness from daily to near-real-time.",
      "Implemented monitoring and alerting for critical pipelines, reducing undetected failures and improving mean time to resolution."
    ]
  },
  {
    role: "Associate Business Intelligence Engineer",
    org: "Unisys",
    place: "Sydney, NSW",
    dates: "Feb 2022 to May 2024",
    bullets: [
      "Built and automated operational reporting in Power BI, SSRS and Excel, establishing repeatable monthly delivery cycles.",
      "Wrote T-SQL for extraction, transformation and validation, and ran UAT to verify data across environments before release.",
      "Documented functional and technical specifications, bridging business stakeholders and engineering."
    ]
  },
  {
    role: "Commercial Banking Relationship Manager",
    org: "Axis Bank Ltd.",
    place: "Telangana, India",
    dates: "Apr 2019 to Jan 2020",
    bullets: [
      "Exceeded department KPIs by 20% for 5 consecutive months managing trade finance and FX payment workflows across import/export channels.",
      "The banking-domain grounding behind my data work: I know what a regulator, a credit team and an operations desk each need from the same number."
    ]
  }
];

export const PROJECTS = [
  {
    id: "weather",
    badge: "Live pipeline · updates daily",
    domain: "Platform pattern",
    title: "AU Weather Medallion Pipeline",
    subtitle: "bronze → silver → gold",
    body:
      "A self-built, production-pattern data pipeline for five Australian capital cities: Open-Meteo archive ingestion, an explicit data-quality gate (schema, nulls, range, duplicate, consistency checks), DuckDB SQL for rolling 30-day anomaly detection and 90th-percentile extreme-heat flagging, orchestrated on a real daily schedule via GitHub Actions with 15 passing pytest cases. Ships with Bicep IaC that maps the same design to production Azure (Data Factory, ADLS Gen2, Synapse Serverless SQL, Key Vault, Log Analytics alerting), authored but deliberately not left running 24/7, because a standing cloud estate for a portfolio-scale workload is a cost decision, not a demo requirement.",
    metric: { value: "15", unit: "/15", label: "pytest cases passing on a daily GitHub Actions schedule" },
    catchLine: "Cloud estate designed in Bicep, deliberately not left running: cost is a design decision.",
    stack: ["Python", "DuckDB", "Plotly", "pytest", "GitHub Actions", "Bicep IaC (Data Factory / ADLS Gen2 / Synapse)"],
    repo: "https://github.com/vabhishek8/azure-medallion-weather-pipeline",
    live: "https://vabhishek8.github.io/azure-medallion-weather-pipeline/"
  },
  {
    id: "aml",
    badge: "Live pipeline · scheduled daily",
    domain: "Banking / financial services",
    title: "AML Transaction Monitoring Pipeline",
    subtitle: "five typologies, recall-tested",
    body:
      "A rule-based transaction-monitoring pipeline built for a banking-industry pivot: detects five real AML typologies (structuring, layering, impossible-travel, statistical amount outliers, high-risk-corridor routing) in SQL, validated with case-level recall tests against a synthetic ground truth (no real transaction data exists publicly, correctly). A naive mean/stddev outlier check initially caught only 20% of injected cases because the outlier was skewing its own baseline; switching to a robust median/MAD statistic took that to 100%, documented as a regression-guarded test, not just a fix. Bicep IaC is architected around what a bank's InfoSec review actually gates on: no public network access anywhere, immutable audit-grade storage, and Microsoft Purview for BCBS 239-aligned data governance.",
    metric: { value: "20→100", unit: "%", label: "outlier recall after swapping mean/stddev for robust median/MAD" },
    catchLine: "The outlier was skewing its own baseline. Fixed, then regression-guarded.",
    stack: ["Python", "DuckDB (window functions, haversine SQL)", "Plotly", "pytest", "GitHub Actions", "Bicep (private endpoints, ADLS immutable storage, Purview, Key Vault RBAC)"],
    repo: "https://github.com/vabhishek8/aml-transaction-monitoring-pipeline",
    live: "https://vabhishek8.github.io/aml-transaction-monitoring-pipeline/"
  },
  {
    id: "basel",
    badge: "Live pipeline · scheduled daily",
    domain: "Regulatory reporting",
    title: "Basel III Liquidity Reporting Pipeline",
    subtitle: "LCR / NSFR",
    body:
      "A regulatory liquidity reporting pipeline computing LCR and NSFR for a synthetic bank's daily balance sheet, structurally consistent with APRA APS 210 and the underlying BCBS238/BCBS295 standards, checked against hand-calculated golden values rather than spot-checked for plausibility. A first implementation of the HQLA cap applied only the 40% Level 2 total cap and missed the nested 15% Level 2B sub-cap required by the spec, overstating HQLA by roughly $65 million (about 8%) on a Level 2B-heavy portfolio; the fix is now a regression-guarded test, not just a corrected formula. Bicep IaC maps this workload's actual shape: a Synapse Dedicated SQL Pool for a fixed nightly batch against a hard deadline, geo-redundant storage, and separate pending-submission / submitted containers modelling a maker-checker control.",
    metric: { value: "$65M", unit: "", label: "HQLA overstatement caught by golden-value tests (~8%)" },
    catchLine: "Missed nested 15% Level 2B sub-cap, caught against hand-calculated golden values.",
    stack: ["Python", "DuckDB", "Plotly", "pytest", "GitHub Actions", "Bicep (Synapse Dedicated SQL Pool, ADLS Gen2 GRS, Key Vault RBAC)"],
    repo: "https://github.com/vabhishek8/basel-liquidity-reporting-pipeline",
    live: "https://vabhishek8.github.io/basel-liquidity-reporting-pipeline/"
  }
];

export const DELIVERY = [
  {
    tags: ["SQL Server", "SSIS", "Databricks"],
    title: "Pipeline engineering, on-prem to Azure",
    body: "Production pipelines that ingest and transform data from multiple source systems: SQL Server stored procedures, SQL Agent jobs and SSIS on the database side, Databricks / PySpark into Azure Data Lake Storage and Synapse on the platform side, with a SQL modelling layer that turns raw data into domain datasets for Power BI and SSRS.",
    impact: "One modelled source of truth for downstream reporting, instead of ad-hoc queries."
  },
  {
    tags: ["Azure DevOps", "CI/CD", "DEV → PROD"],
    title: "Release governance for data artefacts",
    body: "CI/CD pipelines and branching strategies in Azure DevOps, with environment separation across DEV, SIT, UAT and PROD, and UAT validation before every production deployment.",
    impact: "Standardised deployments and lower release risk across environments."
  },
  {
    tags: ["SQL Agent", "Dependency mapping", "Cutover"],
    title: "Estate-wide file-server decommission",
    body: "Swept every SQL Agent job step for references to a retiring host, then separated live jobs from parked ones and mapped coupled producer → consumer steps (bcp, sqlcmd and SSIS writers feeding email and copy steps) so each pair cut over together. The sweep also found references to other decommissioned hosts that a single-host search would have missed.",
    impact: "~28 job steps across ~20 jobs re-pointed as one controlled change."
  },
  {
    tags: ["T-SQL", "OPENJSON", "SSRS"],
    title: "Document metadata search pipeline",
    body: "Layered pipeline: bulk-loaded CSV/JSON staging, OPENJSON shredding with ROW_NUMBER() de-duplication, an indexed target table, a view layer and a catch-all search procedure behind an SSRS report.",
    impact: "Scaled from 12 to 17 source files through a standard runbook and four validation gates, with no report changes."
  },
  {
    tags: ["Observability", "Data quality"],
    title: "Pipeline monitoring & alerting",
    body: "End-to-end monitoring and alerting for critical data pipelines, closing the gap between “pipeline failed” and “someone noticed,” with a structured path to root cause.",
    impact: "Fewer undetected failures and faster mean time to resolution."
  },
  {
    tags: ["Power BI", "DAX", "Automation"],
    title: "Power BI refresh automation",
    body: "Automated dataset refresh pipelines and reporting data flows that were previously manual, rebuilding the delivery path from source to dashboard.",
    impact: "~40% less manual reporting effort; freshness from daily to near-real-time."
  }
];

export const EDUCATION = [
  {
    degree: "Master of Business Analytics",
    school: "Deakin University, Burwood, VIC",
    dates: "Feb 2020 to Nov 2022",
    notes: [
      "Built sentiment analysis models on customer review data using Python.",
      "Delivered descriptive analytics and visualisation solutions for multiple clients using Power BI, Tableau, Python, and Excel."
    ]
  },
  {
    degree: "Post Graduate Diploma in Banking and Services",
    school: "Manipal University, Karnataka, India",
    dates: "Jun 2018 to Jun 2019",
    notes: ["Distinction, GPA 8.97. Golden Key Society member (top 15% of cohort)."]
  },
  {
    degree: "Bachelor of Computer Science and Engineering",
    school: "Geetanjali College of Engineering and Technology, Telangana, India",
    dates: "Sep 2014 to Jun 2018",
    notes: ["Major: Software Engineering, Database Management Systems."]
  }
];

export const CERTS = [
  { name: "Azure Fundamentals (AZ-900)", issuer: "Microsoft", year: "2021" },
  { name: "Power BI Essential Training", issuer: "LinkedIn Learning", year: "2020" }
];

export const CERT_NOTE =
  "Next: DP-700 (Microsoft Fabric Data Engineer Associate), plus a Jira analytics lakehouse built in public.";

export const CONTACT = {
  lede: "Open to Azure Data Engineer / Senior Data Engineer roles. Based in Sydney, open to relocation."
};
