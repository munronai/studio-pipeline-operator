"use client";

import { useEffect, useState } from "react";

/** Type-on effect. Resets whenever `text` changes (i.e. on scene change). */
export function useTypewriter(
  text: string,
  { speed = 28, startDelay = 0 }: { speed?: number; startDelay?: number } = {}
) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setOut("");
    setDone(false);
    let i = 0;
    let raf = 0;
    const startTimer = setTimeout(() => {
      const tick = () => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          setDone(true);
          return;
        }
        raf = window.setTimeout(tick, speed);
      };
      tick();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(raf);
    };
  }, [text, speed, startDelay]);

  return { out, done };
}
