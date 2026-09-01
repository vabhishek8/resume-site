export default function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="exp-h">
      <div className="wrap">
        <p className="section-eyebrow" data-reveal>03 / Experience</p>
        <h2 id="exp-h" data-reveal>Track record</h2>

        <ol className="timeline">
          <li className="timeline-item" data-reveal>
            <div className="timeline-marker" aria-hidden="true"></div>
            <div className="timeline-content">
              <div className="timeline-head">
                <h3>Senior Business Intelligence Engineer</h3>
                <span className="timeline-date">Feb 2022 - Present</span>
              </div>
              <p className="timeline-org">Unisys · Sydney, NSW</p>
              <ul className="timeline-list">
                <li>Led end-to-end data engineering workstreams from requirements through production deployment, owning solution design, testing, and handover within a 10+ person engineering/analyst team.</li>
                <li>Made architectural decisions on pipeline design and data modelling patterns across Azure Data Factory, Databricks, and Azure Data Lake Storage.</li>
                <li>Architected and maintained 20+ Azure Data Factory pipelines for ingestion, transformation, and integration across multiple source systems.</li>
                <li>Designed SQL-based ETL workflows (stored procedures, views, scheduled jobs) modelling raw data into structured domain datasets consumed by Power BI and SSRS.</li>
                <li>Established CI/CD pipelines and branching strategies in Azure DevOps, standardising deployment and reducing release risk across environments.</li>
                <li>Integrated REST APIs as pipeline data sources within Azure Data Factory, ingesting external datasets into Azure Data Lake Storage.</li>
                <li>Designed and implemented monitoring and alerting frameworks for critical pipelines, reducing undetected failures and improving mean time to resolution.</li>
                <li>Automated Power BI dataset refresh pipelines, cutting manual reporting effort by ~40% and improving freshness from daily to near-real-time.</li>
                <li>Built Python and PySpark processing scripts in Databricks notebooks for large-volume data cleansing, transformation, and enrichment.</li>
              </ul>
            </div>
          </li>

          <li className="timeline-item" data-reveal>
            <div className="timeline-marker" aria-hidden="true"></div>
            <div className="timeline-content">
              <div className="timeline-head">
                <h3>Commercial Banking Relationship Manager</h3>
                <span className="timeline-date">Apr 2019 - Jan 2020</span>
              </div>
              <p className="timeline-org">Axis Bank Ltd. · Telangana, India</p>
              <ul className="timeline-list">
                <li>Exceeded department KPIs by 20% for 5 consecutive months managing trade finance and FX payment workflows across import/export channels.</li>
                <li>Translated complex financial information for diverse stakeholders, the same cross-audience communication now applied to data platform work.</li>
              </ul>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
