import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Skills from "./components/Skills.jsx";
import Experience from "./components/Experience.jsx";
import Projects from "./components/Projects.jsx";
import Education from "./components/Education.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import MemojiGuide from "./components/MemojiGuide.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import { useSiteEffects } from "./hooks/useSiteEffects.js";

export default function App() {
  useSiteEffects();

  return (
    <>
      <ScrollProgress />
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="bg-grid" aria-hidden="true"></div>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <MemojiGuide />
    </>
  );
}
