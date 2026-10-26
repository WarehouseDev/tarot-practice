"use client";
// Importujemo potrebne hook-ove
import { useState, useEffect } from "react";

import Image from "next/image";

// Importujemo naše komponente
import Hero from "./components/Hero";
import ScrollBackdrop from "./components/ScrollBackdrop";

// Importujemo podatke o kartama
import tarotData from "../data/tarot-data.json";

// Pozicije karata za Keltski krst
const positions = [
  { top: "25%", left: "25%", z: 10, w: "25%", h: "33.33%" }, // 1. Present
  {
    top: "37.5%",
    left: "23.5%",
    z: 20,
    transform: "rotate(90deg)",
    w: "25%",
    h: "33.33%",
  }, // 2. Challenge
  { top: "50%", left: "25%", z: 5, w: "25%", h: "33.33%" }, // 3. Basis
  { top: "25%", left: "0%", z: 5, w: "25%", h: "33.33%" }, // 4. Recent past
  { top: "0%", left: "25%", z: 5, w: "25%", h: "33.33%" }, // 5. Possible outcome
  { top: "25%", left: "50%", z: 5, w: "25%", h: "33.33%" }, // 6. Near future
  { top: "60%", left: "75%", z: 5, w: "25%", h: "25%" }, // 10. Outcome
  { top: "40%", left: "75%", z: 5, w: "25%", h: "25%" }, // 9. Hopes & Fears
  { top: "20%", left: "75%", z: 5, w: "25%", h: "25%" }, // 8. Environment
  { top: "0%", left: "75%", z: 5, w: "25%", h: "25%" }, // 7. You (self)
];

// GLAVNA  KOMPONENTNA FUNKCIJA
export default function HomePage() {
  // Stanje koje prati korake aplikacije
  const [appStep, setAppStep] = useState("selection");
  // Stanje za otvaranje karata
  const [openingCards, setOpeningCards] = useState(false);
  // Stanje za izabrane karte
  const [selectedCards, setSelectedCards] = useState([]);
  // Stanje za greške
  const [error, setError] = useState(null);
  // Stanje za pitanje korisnika
  const [question, setQuestion] = useState("");
  // Stanje za ime korisnika
  const [name, setName] = useState("");
  // Stanje za tip otvaranja
  const [spreadType, setSpreadType] = useState(null);
  // Stanje za animaciju okretanja karata
  const [isFlipped, setIsFlipped] = useState(false);

  // Broj karata po metodi otvaranja
  const SPREAD_COUNTS = {
    single: 1,
    "three-card": 3,
    "celtic-cross": 10,
  };

  // Nasumično bira `count` jedinstvenih karata iz špila (Fisher–Yates)
  // i svakoj dodeljuje nasumičnu orijentaciju
  const drawRandomCards = (deck, count) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count).map((card) => ({
      ...card,
      orientation: Math.random() < 0.7 ? "upright" : "reversed",
    }));
  };

  // --- useEffect za pokretanje animacije okretanja karata ---
  // Pokreće se kada se appStep promeni na 'results'
  useEffect(() => {
    if (appStep === "results") {
      // 1. Odmah skroluj na vrh ekrana čim pređemo na rezultate
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Dajemo Reactu 1200ms da renderuje poleđine pre nego što pokrenemo okretanje
      const flipTimer = setTimeout(() => {
        setIsFlipped(true);
      }, 1200);
      return () => clearTimeout(flipTimer);
    }
  }, [appStep]); // Zavisnost je samo appStep

  // --- Funkcija za prelazak na biranje karata ---
  const handleDrawingCards = () => {
    setIsFlipped(false); // Resetuj flip stanje

    const count = SPREAD_COUNTS[spreadType] ?? 3;
    setSelectedCards(drawRandomCards(tarotData, count));

    setAppStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lista dostupnih metoda otvaranja
  const spreads = [
    {
      id: "single",
      name: "Jedna Karta",
      description: "Brzi dnevni uvid ili odgovor",
      img: "/logo_wands.png",
    },
    {
      id: "three-card",
      name: "Tri Karte",
      description: "Prošlost, Sadašnjost, Budućnost",
      img: "/logo_cups.png",
    },
    {
      id: "celtic-cross",
      name: "Keltski Krst",
      description: "Dubinska analiza situacije",
      img: "/logo_swords.png",
    },
  ];

  // --- GLAVNI RENDER ---
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollBackdrop />

      <main>
        <div className="w-full max-w-3xl mx-auto">
          {/* --- KORAK 1: BIRANJE METODE --- */}
          {appStep === "selection" && (
            <div className="text-center mb-8 animate-fade-in print:hidden">
              <Hero />
              <div className="relative z-10 px-5 sm:px-10 pb-16 sm:pb-20">
                <div className="max-w-[620px] mx-auto mb-12">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="tarot-question"
                      className="block text-[11px] uppercase tracking-[0.2em] text-gold/70 mb-3"
                    >
                      Tvoje pitanje
                    </label>
                    <div className="mb-3">
                      <label
                        htmlFor="name-picker"
                        className="text-[11px] uppercase tracking-[0.2em] text-gold/70"
                      >
                        Ime
                      </label>
                      <input
                        id="name-picker"
                        className="rounded-md text-[11px] border ml-2 p-1 transition-all duration-300 border-gold/60 -translate-y-0.5 bg-ink text-cream/50 placeholder:text-cream/20 outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <textarea
                    id="tarot-question"
                    rows={3}
                    placeholder="Šta me muči, čemu se nadam, kuda idem..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-white/[0.03] border border-gold/25 rounded text-lg font-serif italic font-light text-cream placeholder:text-cream/20 placeholder:italic px-5 py-4 outline-none transition-colors duration-300 tracking-wide resize-y focus:border-gold/55 focus:bg-gold/[0.04]"
                  />

                  <p className="font-serif text-center text-xl sm:text-3xl font-light leading-[1.1] text-[#F0E8D8] mt-9 mb-5 -tracking-[0.01em]">
                    Tvoja metoda <em className="italic text-gold">otvaranja</em>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {spreads.map((spread) => (
                      <div
                        key={spread.id}
                        onClick={() => {
                          setSpreadType(spread.id);
                          setOpeningCards(true);
                        }}
                        className={`group relative flex flex-col items-center justify-center overflow-hidden text-center rounded-lg border px-4 pt-6 pb-5 transition-all duration-300 cursor-pointer ${
                          spreadType === spread.id
                            ? "border-gold/60 -translate-y-0.5 bg-white/[0.025]"
                            : "border-cream/10 bg-white/[0.025] hover:border-gold/40 hover:-translate-y-0.5"
                        }`}
                      >
                        <Image
                          src={spread.img}
                          alt={`logo ${spread.name}`}
                          width={50}
                          height={50}
                          className="mb-3 group-hover:scale-110 transition-transform "
                        />
                        <p className="relative font-serif text-base text-cream mb-1.5">
                          {spread.name}
                        </p>
                        <p className="relative text-[11px] text-cream/40 tracking-wide leading-relaxed">
                          {spread.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="min-h-16 mb-16 flex items-center justify-center">
                    <button
                      onClick={handleDrawingCards}
                      className={`inline-block bg-transparent border border-gold/60 text-gold mt-6 mb-8  px-12 py-3.5 font-serif text-[17px] tracking-[0.12em] uppercase rounded-sm transition-all duration-300 hover:bg-gold/10 hover:border-gold hover:shadow-[0_0_40px_rgba(201,169,110,0.15)] cursor-pointer ${
                        openingCards ? "opacity-100 block" : "opacity-0 hidden"
                      }`}
                    >
                      Izvuci Karte
                    </button>
                  </div>
                </div>
              </div>

              {/* Prikaz greške ako postoji */}
              {error && (
                <div className="mt-4 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* --- KORAK 2: PRIKAZ REZULTATA --- */}
          {appStep === "results" && (
            <div className="results lg:min-w-3xl mt-8 animate-fade-in">
              {/* Pitanje korisnika */}
              {question && (
                <div className="mb-8 pb-6 text-center">
                  <h4 className="text-[10px] uppercase font-sans text-cream/50 mb-2 tracking-[0.3em]">
                    {name ? `${name} pita:` : `Tvoje Pitanje:`}
                  </h4>
                  <p className="text-2xl italic text-cream font-serif leading-relaxed">
                    &quot;{question}&quot;
                  </p>
                  <div className="flex items-center gap-4 justify-center mt-2">
                    <span className="flex-1 h-px divider-line" />
                    <span className="text-gold text-xs opacity-70">◆</span>
                    <span className="flex-1 h-px divider-line" />
                  </div>
                </div>
              )}

              {/* --- Prikaz Izabranih Karata --- */}
              <div
                className={`relative flex flex-wrap justify-center gap-4 sm:gap-6 print:hidden ${
                  spreadType === "celtic-cross" ? "min-h-screen" : null
                }`}
              >
                {selectedCards.map((card, index) => (
                  // Koristimo card.name kao ključ jer je jedinstven
                  <div
                    key={card.name}
                    style={
                      spreadType === "celtic-cross"
                        ? {
                            width: positions[index].w,
                            height: positions[index].h,
                            top: positions[index].top,
                            left: positions[index].left,
                            zIndex: positions[index].z,
                            transform: positions[index].transform || "none",
                            transition: "opacity 0.5s ease-in-out",
                          }
                        : {}
                    }
                    className={`perspective-1000 group ${
                      spreadType === "celtic-cross" ? "absolute " : null
                    }`}
                  >
                    <div
                      className={`perspective-[1000px]  md:w-36 lg:w-54  md:h-56 lg:h-84
                      ${spreadType === "single" ? "w-54 h-84" : spreadType === "three-card" ? "w-36 h-56" : "w-32 h-50"}`}
                    >
                      <div
                        className={`relative w-full h-full transition-transform duration-1000 [transform-style:preserve-3d] ${
                          isFlipped ? "[transform:rotateY(180deg)]" : ""
                        }`}
                      >
                        {/* Poleđina karte */}
                        <div className="absolute inset-0 [backface-visibility:hidden] rounded-4xl overflow-hidden">
                          <Image
                            src="/cards/back_card.png"
                            alt="Poleđina karte"
                            width={423}
                            height={666}
                            className="w-full h-full object-cover select-none"
                          />
                        </div>

                        {/* Lice karte */}
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-4xl overflow-hidden">
                          <Image
                            src={card.image_url}
                            alt={card.name}
                            width={423}
                            height={666}
                            className={`w-full h-full object-cover select-none ${
                              card.orientation === "reversed"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- Lista Izvučenih Karata (prikazuje se odmah) --- */}
              <div className="mt-8 p-6 select-none  print:hidden">
                <div className="flex items-center gap-4 justify-center mb-7">
                  <span className="flex-1 h-px divider-line" />
                  <span className="text-gold text-xs opacity-70">◆</span>
                  <span className="flex-1 h-px divider-line" />
                </div>
                <h3 className="font-serif text-xl sm:text-3xl font-light leading-[1.1] text-cream  mb-2 -tracking-[0.01em]">
                  Izvučene karte:
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedCards.map((card, index) => (
                    <li key={index} className="text-sm sm:text-lg">
                      <span className="font-semibold text-gold">
                        {card.name}
                      </span>
                      <span className="text-sm text-cream/50">
                        {" "}
                        -{" "}
                        {card.orientation === "reversed"
                          ? "(Obrnuto)"
                          : "(Uspravno)"}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* --- Dugme: UVEK VIDLJIVO NA KRAJU --- */}
              <div className="mt-10 text-center print:hidden">
                <button
                  onClick={() => {
                    setAppStep("selection");
                    setSelectedCards([]);
                    setIsFlipped(false);
                    setOpeningCards(false);
                    setError(null);
                    setQuestion("");
                    setName("");
                    setSpreadType(null);
                  }}
                  className="inline-block bg-transparent border border-gold/60 text-gold mt-1 mb-8  px-12 py-3.5 font-serif text-[17px] tracking-[0.12em] uppercase rounded-sm transition-all duration-300 hover:bg-gold/10 hover:border-gold hover:shadow-[0_0_40px_rgba(201,169,110,0.15)] cursor-pointer"
                >
                  Izvlači ponovo
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
