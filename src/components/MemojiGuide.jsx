import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../hooks/useReducedMotion.js";

gsap.registerPlugin(ScrollTrigger);

// Pose + caption per section. Only two Memoji poses exist today
// (call-me, presenting); more can slot in later without touching this map's shape.
const SECTION_GUIDE = {
  top: { pose: "callme", text: "Hey, I'm Abhishek. Scroll down." },
  about: { pose: "callme", text: "Here's what I actually do." },
  skills: { pose: "presenting", text: "This is the stack I work in." },
  experience: { pose: "presenting", text: "4+ years, real production systems." },
  projects: { pose: "presenting", text: "These pipelines actually run." },
  education: { pose: "callme", text: "Foundations, plus what I'm learning next." },
  contact: { pose: "callme", text: "Let's talk. Seriously." }
};

const POSE_SRC = {
  callme: "/img/memoji/memoji-callme.png",
  presenting: "/img/memoji/memoji-presenting.png"
};

export default function MemojiGuide() {
  const reduceMotion = useReducedMotion();
  const [pose, setPose] = useState("callme");
  const [text, setText] = useState(SECTION_GUIDE.top.text);
  const [talking, setTalking] = useState(false);
  const bubbleTimer = useRef(null);
  const guideRef = useRef();

  useEffect(() => {
    if (reduceMotion) return;

    const triggers = [];
    Object.keys(SECTION_GUIDE).forEach((id) => {
      const el = id === "top" ? document.getElementById("top") : document.getElementById(id);
      if (!el) return;

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (!self.isActive) return;
          const guide = SECTION_GUIDE[id];
          setPose(guide.pose);
          setText(guide.text);
          setTalking(true);
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
          bubbleTimer.current = setTimeout(() => setTalking(false), 2600);
        }
      });
      triggers.push(trigger);
    });

    // Gentle idle bob
    let bob;
    if (guideRef.current) {
      bob = gsap.to(guideRef.current, {
        y: -8,
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    }

    return () => {
      triggers.forEach((t) => t.kill());
      bob && bob.kill();
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className={"memoji-guide" + (talking ? " is-talking" : "")} ref={guideRef} aria-hidden="true">
      <span className="memoji-bubble">{text}</span>
      <img src={POSE_SRC[pose]} alt="" />
    </div>
  );
}
