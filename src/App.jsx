import { Header, Footer, Preloader, ScrollProgress, Cursor, Marquee } from "./components/Chrome.jsx";
import Hero from "./components/Hero.jsx";
import Portrait from "./components/Portrait.jsx";
import { About, Medallion, Skills, Experience, Projects, Education, Contact } from "./components/Sections.jsx";
import { useSiteEffects } from "./hooks/useSiteEffects.js";

export default function App() {
  useSiteEffects();

  return (
    <>
      <Preloader />
      <ScrollProgress />
      <Cursor />
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="grain" aria-hidden="true"></div>
      <Header />
      <Portrait />
      <main id="main">
        <Hero />
        <About />
        <Medallion />
        <Skills />
        <Marquee />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
