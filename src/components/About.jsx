import PipelineFlow from "./PipelineFlow.jsx";

const STATS = [
  { to: 4, suffix: "+", label: "Years in data & BI engineering" },
  { to: 20, suffix: "+", label: "Azure Data Factory pipelines architected & maintained" },
  { to: 10, suffix: "+", label: "Person engineering/analyst team coordinated" },
  { to: 40, prefix: "~", suffix: "%", label: "Reduction in manual reporting effort via automated refresh pipelines" }
];

export default function About() {
  return (
    <section id="about" className="section about-section" aria-labelledby="about-h">
      <div className="wrap">
        <p className="section-eyebrow" data-reveal>01 / About</p>
        <h2 id="about-h" data-reveal>Engineering the platform, not just the report</h2>

        <div className="about-grid">
          <div className="about-copy" data-reveal>
            <p>
              I'm a Senior Business Intelligence Engineer based in Sydney with 4+ years designing, building, and
              optimising enterprise data platforms on Microsoft Azure. At Unisys, I've led end-to-end data engineering
              workstreams, from requirements through to production deployment, and made the architectural calls on
              pipeline design, data modelling, and integration patterns for a 10+ person engineering and analyst team.
            </p>
            <p>
              My work sits across Azure Data Factory, Databricks, Azure Data Lake Storage, and Synapse Analytics on the
              engineering side, with SQL, Python, and PySpark doing the transformation heavy-lifting. On the delivery
              side, I've established CI/CD practices in Azure DevOps and built monitoring frameworks that catch failures
              before they become incidents, because a pipeline that fails silently is worse than one that fails loudly.
            </p>
            <p>
              I also translate across the room: functional specs for engineers, support plans for operations, and plain
              answers for stakeholders who just want to know if the numbers are right. That combination, architecture
              depth plus the ability to explain it, is what I bring to a Data Engineer role.
            </p>
          </div>

          <div className="about-stats" data-reveal>
            {STATS.map((s) => (
              <div className="stat-card" key={s.label}>
                <span className="stat-num" data-count-to={s.to} data-prefix={s.prefix || ""} data-suffix={s.suffix || ""}>
                  {(s.prefix || "") + s.to + (s.suffix || "")}
                </span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-flow" data-reveal>
          <div className="about-flow-head">
            <p className="about-flow-label">Pipeline architecture, in one line</p>
            <span className="about-flow-hint">scroll to trace it</span>
          </div>
          <PipelineFlow />
        </div>
      </div>
    </section>
  );
}
