export default function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="wrap hero-inner">
        <div className="hero-text">
          <p className="eyebrow" data-reveal>Sydney, AU &middot; Open to relocation</p>
          <h1 data-reveal>Building data platforms that don't fall over at 2&nbsp;a.m.</h1>
          <p className="hero-role" data-reveal>
            Senior Business Intelligence Engineer&ensp;<span className="arrow" aria-hidden="true">&rarr;</span>&ensp;Azure Data Engineer
          </p>
          <p className="hero-lede" data-reveal>
            4+ years architecting ETL/ELT pipelines, data models, and CI/CD-governed delivery on Microsoft Azure
            (Azure Data Factory, Databricks, Data Lake Storage, and Synapse) for teams that need the data to just be there, correctly, on time.
          </p>
          <div className="hero-actions" data-reveal>
            <a className="btn btn-primary" href="#experience">View experience</a>
            <a className="btn btn-ghost" href="#contact">Get in touch</a>
          </div>
        </div>

        <div className="hero-portrait" data-reveal>
          <div className="portrait-frame">
            <img src="/img/portrait.jpg" alt="Portrait of Abhishek Vadlamudi" width="720" height="960" loading="eager" fetchPriority="high" />
          </div>
        </div>
      </div>

      <p className="hero-scroll-cue" aria-hidden="true">Scroll</p>
    </section>
  );
}
