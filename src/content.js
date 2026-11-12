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
  role: "Senior Business Intelligence Engineer", // must match the LinkedIn title exactly
  lede:
    "At Unisys in Sydney since 2022, working on data for financial-services clients. Some days that's SQL Server and SSIS on-prem, other days it's Databricks and PySpark in Azure. All of it ships through Azure DevOps.",
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
  // Numbers live inside sentences here, not in a stat strip.
  paragraphs: [
    "I started out building Power BI and SSRS reports. The refresh failures I kept chasing weren't really in the reports. They were in the SQL and DAX models underneath, so that's where I went, and over time I ended up owning the jobs, the stored procedures and the release process under them too.",
    "Some of what came out of that: a daily load that ran on VBA and batch scripts is now Python, and it finishes four hours sooner. Automating the Power BI dataset refreshes cut manual reporting effort by about 40%, and the data went from daily to near-real-time.",
    "I'd rather a pipeline fail loudly at 2 a.m. than succeed quietly with yesterday's numbers. So the checks go in before the data moves, not after someone questions a figure in a meeting. And nothing reaches PROD that hasn't been through UAT.",
    "Outside work I run three small pipelines in public. They run every day on GitHub Actions, so you can read the code and the bugs instead of taking my word for it. Before any of this I was a relationship manager in commercial banking at Axis Bank, which is why I care what a number means and not only whether it loaded."
  ]
};

// The medallion walkthrough is the architecture the three live pipelines share
// (see PROJECTS). Wording is drawn from those project descriptions.
export const MEDALLION = [
  {
    key: "src",
    label: "Sources",
    title: "Ingest",
    body: "SQL Server tables, SFTP drops, CSV and JSON files, the odd REST API. It all lands the way it arrived, and none of it is trusted yet.",
    tools: ["SQL Server", "SSIS", "SFTP / files", "REST APIs"]
  },
  {
    key: "bronze",
    label: "Bronze",
    title: "Land raw",
    body: "Raw copies, never edited. If something goes wrong further down, I want to be able to replay from here.",
    tools: ["ADLS Gen2", "Immutable storage"]
  },
  {
    key: "silver",
    label: "Silver",
    title: "Gate quality",
    body: "This is the gate. Schema, nulls, ranges and duplicates get checked, and if a check fails the write stops and the run goes red.",
    tools: ["Python", "PySpark", "pytest"]
  },
  {
    key: "gold",
    label: "Gold",
    title: "Model and compute",
    body: "The business logic lives in SQL. The Basel ratios are checked against values I worked out by hand, and the AML rules against cases I planted on purpose.",
    tools: ["DuckDB", "Synapse", "Databricks"]
  },
  {
    key: "serve",
    label: "Serve",
    title: "Deliver",
    body: "Dashboards on a daily schedule, deployed by CI. The Azure version of each one is written up in Bicep.",
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
    dates: "Mar 2025 to present",
    bullets: [
      "I own the pipelines for our financial-services engagements, from the source extract to the report. On one side that's SQL Server stored procedures, SQL Agent and SSIS. On the other it's Databricks and PySpark writing into ADLS and Synapse.",
      "Releases move DEV, SIT, UAT, PROD through Azure DevOps. I run that process, and nothing skips UAT.",
      "I write the data-quality checks at the transformation layer, the ones that catch schema drift, nulls leaking through, and SLA calculations that are quietly wrong.",
      "When a file server was retired, I swept every SQL Agent job for references to it. That turned up about 28 steps across 20 jobs, including producer and consumer pairs that had to move in the same change.",
      "Reconciled case records across 38 databases against customer and account perimeter lists, to work out what a client extract should actually contain.",
      "I lead workstreams in a team of 10+ engineers and analysts, from requirements through to production handover."
    ]
  },
  {
    role: "Business Intelligence Engineer",
    org: "Unisys",
    place: "Sydney, NSW",
    dates: "May 2024 to Mar 2025",
    bullets: [
      "Rewrote a critical daily load from VBA and batch scripts in Python. It now finishes four hours sooner.",
      "Rebuilt the SQL and DAX models behind the SLA and operational KPI reports, which ended the recurring refresh failures.",
      "Automated the Power BI dataset refreshes. About 40% less manual reporting effort, and the data moved from daily to near-real-time.",
      "Added monitoring and alerting to the critical pipelines, so fewer failures went unnoticed and the ones that happened got fixed faster."
    ]
  },
  {
    role: "Associate Business Intelligence Engineer",
    org: "Unisys",
    place: "Sydney, NSW",
    dates: "Feb 2022 to May 2024",
    bullets: [
      "Built operational reporting in Power BI, SSRS and Excel, and turned it into a monthly cycle that ran the same way every time.",
      "Wrote the T-SQL for extraction, transformation and validation, and ran UAT to check the data matched across environments before release.",
      "Wrote functional and technical specs. Mostly that meant translating between the business and the engineers."
    ]
  },
  {
    role: "Commercial Banking Relationship Manager",
    org: "Axis Bank Ltd.",
    place: "Telangana, India",
    dates: "Apr 2019 to Jan 2020",
    bullets: [
      "Beat department KPIs by 20% for five months in a row, managing trade finance and FX payment workflows for importers and exporters.",
      "This is where I learned that a regulator, a credit team and an operations desk can each want something different from the same number."
    ]
  }
];

// Each project carries the real diagram (redrawn from the Mermaid source in
// its README), and src/artifacts.js carries the real code and test output.
export const PROJECTS = [
  {
    id: "weather",
    workflow: "azure-medallion-weather-pipeline",
    flow: {
      source: ["Open-Meteo archive API", "ERA5 reanalysis"],
      bronze: ["Raw JSON", "one file per city per run"],
      gate: "schema · nulls · ranges · dupes · consistency",
      silver: ["weather_daily.parquet", "typed, de-duplicated"],
      gold: [["DuckDB SQL", "30-day rolling average and z-score"], ["Extreme heat", "90th percentile flag"]],
      serve: ["Plotly dashboard", "GitHub Pages"]
    },
    iac: "Bicep maps the same design to Data Factory, ADLS Gen2, Synapse Serverless SQL, Key Vault and Log Analytics alerting. I don't leave it running.",
    domain: "Public data, five capital cities",
    title: "AU Weather Medallion Pipeline",
    subtitle: "bronze → silver → gold",
    body:
      "Daily weather for the five largest Australian capitals, pulled from Open-Meteo. I started on the forecast endpoint, and the quality gate kept warning about null humidity, because that endpoint goes sparse beyond a short lookback. The warnings were right, so I moved to the archive endpoint. DuckDB works out 30-day rolling anomalies and flags days above the 90th percentile for heat. There's a Bicep template for the Azure version too, which I don't leave running. Paying for an always-on estate to process five rows a day would be a strange call.",
    bug: "I pointed it at the forecast endpoint first. Past a short lookback it returns sparse daily humidity, and the null check flagged it on the first runs. I changed the source, not the check.",
    metric: { value: "15", unit: "/15", label: "pytest cases passing, run before every scheduled pipeline run" },
    catchLine: "The warnings were right. I changed the source, not the check.",
    stack: ["Python", "DuckDB", "Plotly", "pytest", "GitHub Actions", "Bicep (Data Factory, ADLS Gen2, Synapse)"],
    repo: "https://github.com/vabhishek8/azure-medallion-weather-pipeline",
    live: "https://vabhishek8.github.io/azure-medallion-weather-pipeline/"
  },
  {
    id: "aml",
    workflow: "aml-transaction-monitoring-pipeline",
    flow: {
      source: ["Synthetic core-banking feed", "600 customers, about 90 days, 5 planted typologies"],
      bronze: ["Raw transaction batch", "JSONL"],
      gate: "schema · nulls · domain · range · dupes",
      silver: ["transactions.parquet", "validated"],
      gold: [["Structuring", "48h rolling window"], ["Layering", "wire in/out self-join"], ["Impossible travel", "LAG + haversine"], ["Amount outlier", "per-customer median/MAD"], ["High-risk corridor", "jurisdiction rule"]],
      goldOut: "Composite risk score, 0 to 100",
      serve: ["Alert queue", "dashboard on GitHub Pages"]
    },
    iac: "The Bicep assumes a bank's security review: private endpoints everywhere, immutable ADLS storage, Microsoft Purview and Key Vault RBAC.",
    domain: "Banking",
    title: "AML Transaction Monitoring Pipeline",
    subtitle: "five typologies, recall-tested",
    body:
      "Five AML typologies written in SQL: structuring, layering, impossible travel, amount outliers and high-risk corridors. There's no public transaction data, and there shouldn't be, so the pipeline generates its own and plants known cases in it. Then the tests check that every planted case raised an alert. My first outlier rule used the mean and standard deviation and caught one case in five, because each outlier was inflating the baseline it was being measured against. Median and MAD caught all of them. The Bicep side is written for a bank's security review, with no public network access anywhere.",
    bug: "The first outlier rule scored each transaction against the customer's mean and standard deviation. The outlier itself pulled both up, so it hid itself, and recall was 20%. Median and MAD don't move much for one extreme value, and recall went to 100%. The test meant to pin this down currently skips, because the fixed seed doesn't give any low-volume customer a planted outlier. It needs its own fixture before it guards anything.",
    metric: { value: "20→100", unit: "%", label: "outlier recall after swapping mean and standard deviation for median and MAD" },
    catchLine: "My outlier rule was measuring each outlier against itself.",
    stack: ["Python", "DuckDB (window functions, haversine SQL)", "Plotly", "pytest", "GitHub Actions", "Bicep (private endpoints, immutable ADLS, Purview, Key Vault RBAC)"],
    repo: "https://github.com/vabhishek8/aml-transaction-monitoring-pipeline",
    live: "https://vabhishek8.github.io/aml-transaction-monitoring-pipeline/"
  },
  {
    id: "basel",
    workflow: "basel-liquidity-reporting-pipeline",
    flow: {
      source: ["Synthetic daily balance sheet", "10 asset, 2 inflow, 12 liability, 2 off-balance categories"],
      bronze: ["Raw line items", "JSONL"],
      gate: "schema · domain · range · completeness",
      silver: ["balance_sheet.parquet", "validated"],
      gold: [["HQLA capping waterfall", "Level 1, 2A, 2B"], ["Net cash outflow", "runoff minus capped inflows"], ["ASF and RSF", "aggregation"]],
      goldOut: "LCR = HQLA / NCO, NSFR = ASF / RSF",
      serve: ["Dashboard", "GitHub Pages"]
    },
    iac: "The Bicep matches this workload's shape: a Synapse Dedicated SQL Pool for a fixed nightly batch, geo-redundant ADLS Gen2, and separate pending and submitted containers for a maker-checker control.",
    domain: "Regulatory reporting",
    title: "Basel III Liquidity Reporting Pipeline",
    subtitle: "LCR and NSFR",
    body:
      "LCR and NSFR for a made-up bank's daily balance sheet, following the structure of APRA APS 210. The ratios are checked against values I calculated by hand, not eyeballed for plausibility. My first HQLA cap applied the 40% Level 2 limit and missed the 15% Level 2B limit nested inside it. On a portfolio heavy in Level 2B that overstated HQLA by about $65 million, roughly 8%. The fixed version runs every day, and the wrong version is still in the code on purpose, because the regression test needs something to fail against.",
    bug: "BCBS238 paragraph 51 is two caps, not one. My first version applied only the 40% cap to Level 2A plus 2B. The fix caps Level 2B first, then caps the combined Level 2. The naive SQL stays in the file so the test has something concrete to compare against.",
    metric: { value: "$65M", unit: "", label: "HQLA overstatement caught by the hand-calculated tests (8.4%)" },
    catchLine: "The Level 2 cap is two caps. I'd only written one.",
    stack: ["Python", "DuckDB", "Plotly", "pytest", "GitHub Actions", "Bicep (Synapse Dedicated SQL Pool, ADLS Gen2 GRS, Key Vault RBAC)"],
    repo: "https://github.com/vabhishek8/basel-liquidity-reporting-pipeline",
    live: "https://vabhishek8.github.io/basel-liquidity-reporting-pipeline/"
  }
];

export const DELIVERY = [
  {
    tags: ["SQL Server", "SSIS", "Databricks"],
    title: "Pipelines on-prem and in Azure",
    body: "On the SQL Server side it's stored procedures, SQL Agent jobs and SSIS. On the Azure side it's Databricks and PySpark writing into ADLS and Synapse. Both feed a SQL model that Power BI and SSRS read from.",
    impact: "Reports read from one modelled source instead of their own ad-hoc queries."
  },
  {
    tags: ["Azure DevOps", "CI/CD", "DEV to PROD"],
    title: "Release governance for data changes",
    body: "Azure DevOps pipelines and a branching strategy that move SQL and data changes through DEV, SIT, UAT and PROD. Every production deploy is validated in UAT first.",
    impact: "Deployments run the same way every time, which is most of what makes them safe."
  },
  {
    tags: ["SQL Agent", "Dependency mapping", "Cutover"],
    title: "Retiring a file server",
    body: "A file server was being decommissioned, so I searched every SQL Agent job step for references to it. Then I split live jobs from parked ones and paired up the steps that depended on each other (bcp, sqlcmd and SSIS writers feeding email and copy steps) so each pair moved together. The search also found references to other retired hosts that a single-host search would have missed.",
    impact: "About 28 job steps across 20 jobs, repointed in one controlled change."
  },
  {
    tags: ["T-SQL", "OPENJSON", "SSRS"],
    title: "Document metadata search",
    body: "CSV and JSON files are bulk-loaded into staging, shredded with OPENJSON, de-duplicated with ROW_NUMBER() and written to an indexed table. A view layer and one search procedure sit behind an SSRS report.",
    impact: "It grew from 12 source files to 17 with a runbook and four validation gates, and the report didn't need to change."
  },
  {
    tags: ["Monitoring", "Data quality"],
    title: "Monitoring and alerting",
    body: "Alerting on the critical pipelines, so the time between a job failing and someone knowing about it is short, and there's a clear path to the cause.",
    impact: "Fewer failures that nobody noticed, and faster fixes."
  },
  {
    tags: ["Power BI", "DAX", "Automation"],
    title: "Power BI refresh automation",
    body: "Dataset refreshes and reporting data flows that people used to run by hand now run on their own.",
    impact: "About 40% less manual reporting effort. The data went from daily to near-real-time."
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

// "Now" line. Source: memory notes list DP-700 and a Jira analytics lakehouse as
// the next milestones (Sep 2026). [EDIT] Confirm both are still current, and
// bump the month, before publishing.
export const NOW = {
  month: "November 2026",
  text: "Studying for DP-700 and starting a Jira analytics lakehouse, built in public."
};

export const COLOPHON = [
  "This site is React and Vite, with GSAP for the motion. It's hosted on Azure Static Web Apps and deploys from GitHub Actions on every push, with a preview environment for each pull request. The contact form posts to an Azure Function.",
  "Archivo for the big headings, Instrument Serif for the italics, Inter for reading and JetBrains Mono for the small labels. All four are self-hosted, so nothing loads from Google.",
  "The pipeline statuses come straight from the GitHub API, fetched by your browser and cached for ten minutes. If they're missing, GitHub's hourly limit for anonymous requests probably ran out."
];

export const CONTACT = {
  lede: "Open to Azure Data Engineer / Senior Data Engineer roles. Based in Sydney, open to relocation."
};

// Scroll storytelling: the page reads as one pipeline run. Each section is a
// stage; the rail on the left shows where the visitor is in the story.
export const CHAPTERS = [
  { sel: ".hero", stage: "Raw", label: "Hello" },
  { sel: "#about", stage: "Bronze", label: "Profile" },
  { sel: "[data-medallion]", stage: "Bronze", label: "Approach" },
  { sel: "#skills", stage: "Silver", label: "Capabilities" },
  { sel: "#experience", stage: "Silver", label: "Track record" },
  { sel: "#projects", stage: "Gold", label: "Proof" },
  { sel: "#education", stage: "Gold", label: "Foundations" },
  { sel: "#contact", stage: "Serve", label: "Contact" }
];

// Figure layer: generated portrait poses (cut out, colour-matched, upscaled),
// served as transparent WebP at FIGURE.widths. Paths are bases: "<base>-<w>.webp".
export const FIGURE = {
  widths: [480, 720, 960, 1280],
  // Mobile (<900px) hero: opaque 4:5 crop on the page background, ~3x lighter
  // than the transparent 3:4 desktop asset. Files: "<hero>-m-<w>.webp".
  mobileWidths: [600, 800, 1000],
  poses: {
    hero: "/img/figure/hero",       // chest-up, facing camera (IMG_1810)
    about: "/img/figure/about",     // three-quarter, hands in pockets
    work: "/img/figure/work",       // arms crossed
    contact: "/img/figure/contact"  // buttoning the blazer
  },
  alt: "Portrait of Abhishek Vadlamudi",
  sectionPose: {
    Hello: "hero", Profile: "about", Approach: "work", Capabilities: "hero",
    "Track record": "hero", Proof: "work", Foundations: "hero", Contact: "contact"
  }
};
