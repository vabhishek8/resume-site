export default function Education() {
  return (
    <section id="education" className="section" aria-labelledby="edu-h">
      <div className="wrap">
        <p className="section-eyebrow" data-reveal>05 / Education &amp; Certifications</p>
        <h2 id="edu-h" data-reveal>Foundations</h2>

        <div className="edu-grid">
          <div className="edu-col" data-reveal>
            <h3 className="edu-col-h">Education</h3>

            <div className="edu-item">
              <div className="edu-item-head">
                <span className="edu-degree">Master of Business Analytics</span>
                <span className="edu-date">Feb 2020 - Nov 2022</span>
              </div>
              <p className="edu-school">Deakin University, Burwood, VIC</p>
              <ul className="edu-notes">
                <li>Built sentiment analysis models on customer review data using Python.</li>
                <li>Delivered descriptive analytics and visualisation solutions for multiple clients using Power BI, Tableau, Python, and Excel.</li>
              </ul>
            </div>

            <div className="edu-item">
              <div className="edu-item-head">
                <span className="edu-degree">Post Graduate Diploma in Banking and Services</span>
                <span className="edu-date">Jun 2018 - Jun 2019</span>
              </div>
              <p className="edu-school">Manipal University, Karnataka, India</p>
              <ul className="edu-notes">
                <li>Distinction, GPA 8.97. Golden Key Society member (top 15% of cohort).</li>
              </ul>
            </div>

            <div className="edu-item">
              <div className="edu-item-head">
                <span className="edu-degree">Bachelor of Computer Science and Engineering</span>
                <span className="edu-date">Sep 2014 - Jun 2018</span>
              </div>
              <p className="edu-school">Geetanjali College of Engineering and Technology, Telangana, India</p>
              <ul className="edu-notes">
                <li>Major: Software Engineering, Database Management Systems.</li>
              </ul>
            </div>
          </div>

          <div className="edu-col" data-reveal>
            <h3 className="edu-col-h">Certifications</h3>
            <div className="cert-item">
              <span className="cert-name">Azure Fundamentals (AZ-900)</span>
              <span className="cert-issuer">Microsoft · 2021</span>
            </div>
            <div className="cert-item">
              <span className="cert-name">Power BI Essential Training</span>
              <span className="cert-issuer">LinkedIn Learning · 2020</span>
            </div>

            <div className="cert-note">
              <p>Currently deepening Azure data engineering depth (Data Factory, Databricks, Synapse) toward
              Azure Data Engineer Associate&ndash;level certification.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
