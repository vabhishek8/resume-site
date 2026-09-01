import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setPct(docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="scroll-progress" style={{ width: (pct * 100) + "%" }} aria-hidden="true" />;
}
