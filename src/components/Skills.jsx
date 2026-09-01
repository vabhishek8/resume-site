const GROUPS = [
  {
    title: "Data Engineering & ETL",
    items: [
      ["Pipeline Architecture (ADF)", 5],
      ["ETL / ELT Design", 5],
      ["Data Modelling & Warehousing", 4],
      ["Azure Databricks / PySpark", 4],
      ["REST API Integration", 4]
    ]
  },
  {
    title: "BI & Reporting",
    items: [
      ["Power BI (DAX & Data Modelling)", 5],
      ["Automated Refresh / Reporting Ops", 5],
      ["SSRS", 4],
      ["Tableau", 3]
    ]
  },
  {
    title: "Cloud & Azure",
    items: [
      ["Azure Data Factory", 5],
      ["Azure Data Lake Storage", 4],
      ["Azure Synapse Analytics", 4],
      ["Azure DevOps (CI/CD, Repos, Boards)", 4]
    ]
  },
  {
    title: "Languages & Tools",
    items: [
      ["SQL (T-SQL, Stored Procs, Perf Tuning)", 5],
      ["Python", 4],
      ["PySpark", 4],
      ["Git / Agile / Scrum", 4]
    ]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="section section-alt" aria-labelledby="skills-h">
      <div className="wrap">
        <p className="section-eyebrow" data-reveal>02 / Skills</p>
        <h2 id="skills-h" data-reveal>Stack &amp; depth</h2>
        <p className="section-lede" data-reveal>Grouped by function, not buzzword density. Bar length reflects relative working depth, self-assessed.</p>

        <div className="skills-grid">
          {GROUPS.map((g) => (
            <div className="skill-card" key={g.title} data-reveal>
              <h3><span className="skill-icon" aria-hidden="true">&#9670;</span> {g.title}</h3>
              <ul className="skill-bars">
                {g.items.map(([name, level]) => (
                  <li key={name} data-level={level} style={{ "--lvl": level }}>
                    <span className="skill-name">{name}</span>
                    <span className="bar"><span className="bar-fill"></span></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
