import { Header, Footer, ScrollProgress, Cursor, Marquee, StoryRail } from "./components/Chrome.jsx";
import { CaseStudy, useCaseStudy } from "./components/CaseStudy.jsx";
import Hero from "./components/Hero.jsx";
import Figure from "./components/Figure.jsx";
import { About, Medallion, Skills, Experience, Projects, Education, Contact } from "./components/Sections.jsx";
import { useSiteEffects } from "./hooks/useSiteEffects.js";

export default function App() {
  useSiteEffects();
  const cases = useCaseStudy();

  return (
    <>
      <ScrollProgress />
      <Cursor />
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="grain" aria-hidden="true"></div>
      <Header />
      <Figure />
      <main id="main">
        <Hero />
        <About />
        <Medallion />
        <Skills />
        <Marquee />
        <Experience />
        <Projects onOpenCase={cases.open} />
        <Education />
        <Contact />
      </main>
      <Footer />
      <StoryRail />
      {cases.openId ? <CaseStudy id={cases.openId} onClose={cases.close} /> : null}
    </>
  );
}
