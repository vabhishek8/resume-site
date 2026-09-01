import ProjectCard3D from "./ProjectCard3D.jsx";

export default function Projects() {
  return (
    <section id="projects" className="section section-alt" aria-labelledby="proj-h">
      <div className="wrap">
        <p className="section-eyebrow" data-reveal>04 / Projects</p>
        <h2 id="proj-h" data-reveal>Selected engineering work</h2>
        <p className="section-lede" data-reveal>Framed by architecture and outcome, not by dashboard count.</p>

        <div className="project-grid">
          <article className="project-featured" data-reveal>
            <div>
              <span className="project-featured-badge"><span className="dot" aria-hidden="true"></span>Live pipeline · updates daily</span>
              <h3>AU Weather Medallion Pipeline (bronze → silver → gold)</h3>
              <p>
                A self-built, production-pattern data pipeline for five Australian capital cities: Open-Meteo archive
                ingestion, an explicit data-quality gate (schema, nulls, range, duplicate, consistency checks), DuckDB
                SQL for rolling 30-day anomaly detection and 90th-percentile extreme-heat flagging, orchestrated on a
                real daily schedule via GitHub Actions with 15 passing pytest cases. Ships with Bicep IaC mapping the
                same design to production Azure (ADF, ADLS Gen2, Synapse Serverless SQL, Key Vault, Log Analytics
                alerting), deliberately not left running 24/7, because a standing cloud estate for a portfolio-scale
                workload is a cost decision, not a demo requirement.
              </p>
              <p className="project-featured-meta">Python · DuckDB · Plotly · pytest · GitHub Actions · Bicep (ADF / ADLS Gen2 / Synapse)</p>
            </div>
            <div className="project-featured-actions">
              <a className="btn btn-primary" href="https://github.com/vabhishek8/azure-medallion-weather-pipeline" target="_blank" rel="noopener noreferrer">View on GitHub</a>
              <a className="btn btn-ghost" href="https://vabhishek8.github.io/azure-medallion-weather-pipeline/" target="_blank" rel="noopener noreferrer">Live dashboard</a>
            </div>
          </article>

          <article className="project-featured" data-reveal>
            <div>
              <span className="project-featured-badge"><span className="dot" aria-hidden="true"></span>Live pipeline · scheduled daily</span>
              <h3>AML Transaction Monitoring Pipeline (banking / financial services)</h3>
              <p>
                A rule-based transaction-monitoring pipeline built for a banking-industry pivot: detects five real
                AML typologies (structuring, layering, impossible-travel, statistical amount outliers, high-risk-corridor
                routing) in SQL, validated with case-level recall tests against a synthetic ground truth (no real
                transaction data exists publicly, correctly). A naive mean/stddev outlier check initially caught only
                20% of injected cases because the outlier was skewing its own baseline; switching to a robust
                median/MAD statistic took that to 100%, documented as a regression-guarded test, not just a fix.
                Bicep IaC is architected around what a bank's InfoSec review actually gates on: no public network
                access anywhere, immutable audit-grade storage, and Microsoft Purview for BCBS 239-aligned data
                governance.
              </p>
              <p className="project-featured-meta">Python · DuckDB (window functions, haversine SQL) · Plotly · pytest · GitHub Actions · Bicep (private endpoints, ADLS immutable storage, Purview, Key Vault RBAC)</p>
            </div>
            <div className="project-featured-actions">
              <a className="btn btn-primary" href="https://github.com/vabhishek8/aml-transaction-monitoring-pipeline" target="_blank" rel="noopener noreferrer">View on GitHub</a>
              <a className="btn btn-ghost" href="https://vabhishek8.github.io/aml-transaction-monitoring-pipeline/" target="_blank" rel="noopener noreferrer">Live dashboard</a>
            </div>
          </article>

          <article className="project-featured" data-reveal>
            <div>
              <span className="project-featured-badge"><span className="dot" aria-hidden="true"></span>Live pipeline · scheduled daily</span>
              <h3>Basel III Liquidity Reporting Pipeline (LCR / NSFR)</h3>
              <p>
                A regulatory liquidity reporting pipeline computing LCR and NSFR for a synthetic bank's daily balance
                sheet, structurally consistent with APRA APS 210 and the underlying BCBS238/BCBS295 standards, checked
                against hand-calculated golden values rather than spot-checked for plausibility. A first implementation
                of the HQLA cap applied only the 40% Level 2 total cap and missed the nested 15% Level 2B sub-cap
                required by the spec, overstating HQLA by roughly $65 million (about 8%) on a Level 2B-heavy portfolio;
                the fix is now a regression-guarded test, not just a corrected formula. Bicep IaC maps this workload's
                actual shape: a Synapse Dedicated SQL Pool for a fixed nightly batch against a hard deadline, geo-redundant
                storage, and separate pending-submission / submitted containers modelling a maker-checker control.
              </p>
              <p className="project-featured-meta">Python · DuckDB · Plotly · pytest · GitHub Actions · Bicep (Synapse Dedicated SQL Pool, ADLS Gen2 GRS, Key Vault RBAC)</p>
            </div>
            <div className="project-featured-actions">
              <a className="btn btn-primary" href="https://github.com/vabhishek8/basel-liquidity-reporting-pipeline" target="_blank" rel="noopener noreferrer">View on GitHub</a>
              <a className="btn btn-ghost" href="https://vabhishek8.github.io/basel-liquidity-reporting-pipeline/" target="_blank" rel="noopener noreferrer">Live dashboard</a>
            </div>
          </article>

          <ProjectCard3D>
            <div className="project-tag-row">
              <span className="tag">Azure Data Factory</span><span className="tag">Databricks</span><span className="tag">ADLS</span>
            </div>
            <h3>Multi-source ETL &amp; pipeline architecture</h3>
            <p>
              Architected and maintain 20+ Azure Data Factory pipelines ingesting and transforming data from multiple
              source systems into Azure Data Lake Storage, with a SQL-based modelling layer (stored procedures, views,
              scheduled jobs) turning raw data into structured domain datasets for downstream Power BI and SSRS
              consumption.
            </p>
            <p className="project-impact"><strong>Impact:</strong> reliable, trustworthy data foundation for all downstream analytics and reporting.</p>
          </ProjectCard3D>

          <ProjectCard3D>
            <div className="project-tag-row">
              <span className="tag">Azure DevOps</span><span className="tag">CI/CD</span><span className="tag">Git</span>
            </div>
            <h3>CI/CD standardisation for data engineering</h3>
            <p>
              Established CI/CD pipelines and branching strategies in Azure DevOps for data engineering artefacts,
              replacing ad-hoc deployment with a standardised process. Manage Repos and Boards to coordinate delivery
              and track work across the engineering lifecycle.
            </p>
            <p className="project-impact"><strong>Impact:</strong> standardised deployment process, reduced release risk across environments.</p>
          </ProjectCard3D>

          <ProjectCard3D>
            <div className="project-tag-row">
              <span className="tag">Observability</span><span className="tag">Incident Response</span><span className="tag">Data Quality</span>
            </div>
            <h3>Pipeline monitoring &amp; alerting framework</h3>
            <p>
              Designed and implemented end-to-end monitoring and alerting for critical data pipelines, closing the gap
              between "pipeline failed" and "someone noticed," and giving the team a structured path to root cause.
            </p>
            <p className="project-impact"><strong>Impact:</strong> reduced undetected failures, improved mean time to resolution for data incidents.</p>
          </ProjectCard3D>

          <ProjectCard3D>
            <div className="project-tag-row">
              <span className="tag">Power BI</span><span className="tag">DAX</span><span className="tag">Automation</span>
            </div>
            <h3>Power BI refresh automation</h3>
            <p>
              Automated Power BI dataset refresh pipelines and reporting data flows that were previously manual,
              rebuilding the delivery path from source to dashboard.
            </p>
            <p className="project-impact"><strong>Impact:</strong> ~40% reduction in manual reporting effort; data freshness improved from daily to near-real-time.</p>
          </ProjectCard3D>
        </div>
      </div>
    </section>
  );
}
