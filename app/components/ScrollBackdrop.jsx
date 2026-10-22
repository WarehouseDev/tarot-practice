"use client";

import { useEffect, useRef, useState } from "react";

const STARS = [
  { x: 8, y: 12, size: 1.5, op: 0.35, duration: 5, delay: 0, depth: 0.15 },
  { x: 22, y: 40, size: 1, op: 0.2, duration: 7, delay: 1, depth: 0.3 },
  { x: 55, y: 8, size: 2, op: 0.4, duration: 4, delay: 0.5, depth: 0.1 },
  { x: 72, y: 25, size: 1.5, op: 0.3, duration: 6, delay: 2, depth: 0.25 },
  { x: 88, y: 55, size: 1, op: 0.25, duration: 8, delay: 1.5, depth: 0.4 },
  { x: 15, y: 70, size: 2, op: 0.35, duration: 5, delay: 3, depth: 0.2 },
  { x: 35, y: 85, size: 1, op: 0.2, duration: 9, delay: 0.8, depth: 0.35 },
  { x: 65, y: 78, size: 1.5, op: 0.3, duration: 4.5, delay: 1.2, depth: 0.15 },
  { x: 90, y: 90, size: 2, op: 0.25, duration: 7, delay: 2.5, depth: 0.3 },
  { x: 48, y: 18, size: 1, op: 0.4, duration: 6, delay: 0.3, depth: 0.45 },
  { x: 80, y: 12, size: 1.5, op: 0.3, duration: 5.5, delay: 1.8, depth: 0.2 },
  { x: 5, y: 92, size: 1, op: 0.2, duration: 8, delay: 0.6, depth: 0.3 },
  { x: 42, y: 62, size: 2, op: 0.15, duration: 10, delay: 3.5, depth: 0.1 },
  { x: 95, y: 38, size: 1, op: 0.35, duration: 4, delay: 1, depth: 0.4 },
  { x: 28, y: 22, size: 1.5, op: 0.3, duration: 6.5, delay: 2.2, depth: 0.25 },
  { x: 60, y: 50, size: 1, op: 0.2, duration: 7.5, delay: 0.9, depth: 0.35 },
  { x: 18, y: 55, size: 1.5, op: 0.28, duration: 5.2, delay: 1.4, depth: 0.2 },
  { x: 77, y: 68, size: 1, op: 0.22, duration: 8.5, delay: 2.8, depth: 0.45 },
  { x: 33, y: 35, size: 2, op: 0.18, duration: 11, delay: 0.4, depth: 0.15 },
  { x: 52, y: 90, size: 1, op: 0.32, duration: 4.8, delay: 3.2, depth: 0.3 },
  { x: 12, y: 30, size: 1, op: 0.25, duration: 6.8, delay: 0.2, depth: 0.4 },
  { x: 68, y: 5, size: 1.5, op: 0.3, duration: 5.8, delay: 2.6, depth: 0.2 },
  { x: 85, y: 80, size: 1, op: 0.2, duration: 9.5, delay: 1.1, depth: 0.35 },
  { x: 40, y: 75, size: 1.5, op: 0.28, duration: 6.2, delay: 3.8, depth: 0.15 },
];

/*
  ANIMACIJA PRI OTVARANJU STRANICE — 3 faze:

  Faza 0 — "skupljanje" (0–350ms)
    Sve počinje skupljeno u centru (scale 0.05, opacity 0).
    Brzo fade-in na opacity 1 ali i dalje mali scale.

  Faza 1 — "eksplozija" (350–950ms)
    Elementi eksplodiraju prema van — scale se povećava na 1.08
    (lagano prekoračenje) pa nazad na 1.0 (spring efekat).
    Zvezde skaču na finalne pozicije, linije se razvlače,
    mesec se pojavljuje gore desno.

  Faza 2 — "sletanje + fade-out overlaya" (950–1600ms)
    Backdrop ostaje na mestu. Crni overlay koji je prekrivao
    sadržaj stranice fade-outuje → sadržaj se otkriva.
    Posle ovoga ScrollBackdrop radi normalno (paralaks na scroll).
*/

// Trajanja u ms
const T_BURST_START = 0;
const T_BURST_END = 950;
const T_REVEAL_END = 1650;

export default function ScrollBackdrop() {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  // Intro animation state
  const [introPhase, setIntroPhase] = useState("gather"); // "gather" | "burst" | "done"
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  useEffect(() => {
    // Poštovanje prefers-reduced-motion — preskoči animaciju
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroPhase("done");
      setOverlayOpacity(0);
      return;
    }

    // Faza 1: "gather" odmah, pa odmah kreni na "burst"
    const burstTimer = setTimeout(() => {
      setIntroPhase("burst");
    }, T_BURST_START + 50); // mali delay da browser slika initial frame

    // Faza 2: završi burst, počni overlay fade-out
    const doneTimer = setTimeout(() => {
      setIntroPhase("done");
    }, T_BURST_END);

    // Overlay fade-out: animira se CSS-om, ali JS kontroliše kad počne
    // Overlay počinje fade-out pri kraju burst faze (malo ranije nego done)
    const overlayTimer = setTimeout(() => {
      setOverlayOpacity(0);
    }, T_BURST_END - 100);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(doneTimer);
      clearTimeout(overlayTimer);
    };
  }, []);

  // Scroll paralaks (aktivan samo kad je intro gotov)
  useEffect(() => {
    if (introPhase !== "done") return;

    function onScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [introPhase]);

  // Compute transform per-element based on intro phase + scroll
  const isDone = introPhase === "done";
  const isBurst = introPhase === "burst";
  const isGather = introPhase === "gather";

  // Backdrop wrapper scale tokom introa
  const backdropScale = isGather ? 0.06 : isBurst ? 1.05 : 1;
  const backdropOpacity = isGather ? 0 : 1;

  // Scroll-driven transforms (samo kad je intro gotov)
  const lineScrollRotation = isDone ? scrollY * 0.015 : 0;
  const moonOffset = isDone ? scrollY * 0.08 : 0;
  const moonScrollRotation = isDone ? scrollY * 0.03 : 0;

  // Intro rotacije — nezavisne od scrolla, aktivne samo tokom burst faze.
  // Linije počinju jako zarotirana (120°) pa se "namotavaju" na finalnu poziciju (0°).
  // Mesec ulazi sa rotacijom od -200° (dolazi iz orbit-a, okreće se unazad).
  const lineIntroRotation = isGather ? 120 : 0;
  const moonIntroRotation = isGather ? -200 : 0;

  // Finalni transform koji kombinuje intro + scroll rotaciju
  const lineRotation = lineIntroRotation + lineScrollRotation;
  const moonRotation = moonIntroRotation + moonScrollRotation;

  // Transition string per faza
  const gatherTransition = "opacity 0.08s ease-out, transform 0.08s ease-out";
  const burstTransition =
    "opacity 0.3s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
  const doneTransition = "transform 0.05s linear"; // scroll paralaks — brzo, bez lag-a

  const backdropTransition = isDone
    ? doneTransition
    : isBurst
      ? burstTransition
      : gatherTransition;

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          OVERLAY — crni sloj koji se otkriva pri pokretanju.
          z-index 50 — iznad svega (nav, hero, sve).
          Fade-outuje se na kraju burst faze.
         ═══════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "#0B0D14",
          opacity: overlayOpacity,
          transition:
            overlayOpacity === 0
              ? `opacity ${T_REVEAL_END - T_BURST_END + 100}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : "none",
          pointerEvents: overlayOpacity > 0.05 ? "auto" : "none",
        }}
      />

      {/* ═══════════════════════════════════════════════════
          BACKDROP — zvezde, mesec, linije.
          Tokom introa: z-index 60 (iznad overlaya) da se vide
          tokom animacije dok je overlay ispod.
          Posle introa: z-index 0 (normalan, iza sadržaja).
         ═══════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: isDone ? 0 : 60,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: backdropOpacity,
          transform: `scale(${backdropScale})`,
          transformOrigin: "50% 50%",
          transition: backdropTransition,
        }}
      >
        {/* Zvezde */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {STARS.map((s, i) => {
            const paralaxY = isDone ? -scrollY * s.depth : 0;
            return (
              <span
                key={i}
                className="animate-twinkle"
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  background: "#E8E0D0",
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  "--op": s.op,
                  "--d": `${s.duration}s`,
                  "--delay": isDone ? `${s.delay}s` : "0s",
                  transform: `translateY(${paralaxY}px)`,
                  // Tokom introa zaustavi twinkle — tek posle introa pusti animaciju
                  animationPlayState: isDone ? "running" : "paused",
                }}
              />
            );
          })}
        </div>

        {/* Mesečevi krugovi */}
        <div
          style={{
            position: "absolute",
            right: "-80px",
            top: "64px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            border: "0.5px solid rgba(201, 169, 110, 0.18)",
            zIndex: 1,
            transform: `translateY(${-moonOffset}px) rotate(${moonRotation}deg)`,
            // Intro: lagana rotacija zajedno sa burst-om
            // Done: brzi scroll paralaks bez lag-a
            transition: isDone
              ? doneTransition
              : isBurst
                ? "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "24px",
              borderRadius: "50%",
              border: "0.5px solid rgba(201, 169, 110, 0.11)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "60px",
              borderRadius: "50%",
              border: "0.5px solid rgba(201, 169, 110, 0.07)",
            }}
          />
        </div>

        {/* Lučni krug dole-levo */}
        <div
          style={{
            position: "absolute",
            left: "-96px",
            bottom: "80px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            border: "0.5px solid rgba(232, 224, 208, 0.055)",
            zIndex: 1,
            transform: `translateY(${moonOffset * 0.6}px)`,
            transition: isDone ? doneTransition : undefined,
          }}
        />

        {/* Dijagonalne linije */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            opacity: 0.14,
            transform: `rotate(${lineRotation}deg)`,
            transformOrigin: "50% 50%",
            // Intro: rotacija se "namotava" iz 120° → 0° tokom bursta
            // Done: brzi scroll paralaks
            transition: isDone
              ? doneTransition
              : isBurst
                ? "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
          }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          {/*
            Tokom introa: strokeDasharray animira "crtanje" linije.
            Kad je done: linija je normalna (bez dash).
          */}
          <line
            x1="0"
            y1="220"
            x2="1440"
            y2="400"
            stroke="#C9A96E"
            strokeWidth="0.5"
            strokeDasharray={isDone ? "none" : "2000"}
            strokeDashoffset={isGather ? "2000" : "0"}
            style={{
              transition: isBurst
                ? "stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          />
          <line
            x1="1440"
            y1="80"
            x2="0"
            y2="540"
            stroke="#C9A96E"
            strokeWidth="0.5"
            strokeDasharray={isDone ? "none" : "2000"}
            strokeDashoffset={isGather ? "2000" : "0"}
            style={{
              transition: isBurst
                ? "stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.08s"
                : "none",
            }}
          />
        </svg>
      </div>
    </>
  );
}
