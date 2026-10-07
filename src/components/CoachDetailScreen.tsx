import { useState, type ComponentType } from "react";

/**
 * Coach detail screen (/coach/cornerstone-45d).
 *
 * The backdrop is a clean "showroom plate" cut from the approved mockup: the
 * textured wall, glossy floor, coach and its reflection, with every baked-in UI
 * element removed. It is 1008px wide; mockup rows 0-1791 sit at y=160-1951 and
 * the extra rows above/below extend the wall and floor for phones taller than
 * 9:16. All UI below is live HTML laid out in mockup pixels (see coach-screen.css).
 */
const PLATE_IMAGE = "/assets/coach/cornerstone-45d-showroom.webp";
const PLATE_WIDTH = 1008;
const PLATE_HEIGHT = 2400;

function RvMark() {
  return (
    <svg className="coach-screen__mark" viewBox="0 0 30 66" aria-hidden="true">
      <path d="M3.5 2v62M3.5 3.5 26 22 7 34.5 28 52" />
    </svg>
  );
}

function FactsIcon() {
  return (
    <svg viewBox="0 0 80 66" aria-hidden="true" className="coach-screen__icon coach-screen__icon--facts">
      <defs>
        <linearGradient id="coach-tab-check" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="0.55" stopColor="#c9ccd1" />
          <stop offset="1" stopColor="#8f939a" />
        </linearGradient>
      </defs>
      <path d="M1.5 36.5 8 31l17.5 19.5L73.5 1.5 79 4.5 28.5 64.5h-5.5z" fill="url(#coach-tab-check)" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg viewBox="0 0 130 76" aria-hidden="true" className="coach-screen__icon coach-screen__icon--inventory">
      <defs>
        <linearGradient id="coach-tab-rv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9dce1" />
          <stop offset="1" stopColor="#8d9097" />
        </linearGradient>
      </defs>
      <path
        className="rv-body"
        d="M5 58V27c0-7 3-11 10-12l44-6c22-3 38-2 48 1 10 3 15 10 17 20l3 16c1 8-2 12-9 12H5z"
        fill="url(#coach-tab-rv)"
      />
      <path className="rv-roof" d="M7 17C24 7 52 2 84 2c16 0 28 3 36 11" />
      <path className="rv-glass" d="M14 24h22v12H14zM42 21h40v15H42zM90 18h13c8 0 13 5 15 14l1 6H90z" />
      <path className="rv-stripe" d="M6 46c26-8 54-8 82 0" />
      <path className="rv-glass" d="M88 41h9v15h-9z" />
      <circle className="rv-wheel" cx="29" cy="60" r="9.5" />
      <circle className="rv-wheel" cx="100" cy="60" r="9.5" />
      <circle className="rv-hub" cx="29" cy="60" r="3.2" />
      <circle className="rv-hub" cx="100" cy="60" r="3.2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 72 74" aria-hidden="true" className="coach-screen__icon coach-screen__icon--chat">
      <path className="chat-bubble" d="M20 66.5A32 32 0 1 0 8.6 54.5L3 71z" />
      <circle cx="24" cy="36" r="4.6" />
      <circle cx="36" cy="36" r="4.6" />
      <circle cx="48" cy="36" r="4.6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 68 16" aria-hidden="true" className="coach-screen__icon coach-screen__icon--more">
      <circle cx="8" cy="8" r="7.5" />
      <circle cx="34" cy="8" r="7.5" />
      <circle cx="60" cy="8" r="7.5" />
    </svg>
  );
}

const tabs: { label: string; icon: ComponentType }[] = [
  { label: "Facts", icon: FactsIcon },
  { label: "Inventory", icon: InventoryIcon },
  { label: "Chat", icon: ChatIcon },
  { label: "More", icon: MoreIcon },
];

export function CoachDetailScreen() {
  const [activeTab, setActiveTab] = useState("Facts");

  return (
    <main className="coach-screen" aria-label="RvFOX coach detail">
      <img
        className="coach-screen__plate"
        src={PLATE_IMAGE}
        width={PLATE_WIDTH}
        height={PLATE_HEIGHT}
        alt="2026 Entegra Cornerstone 45D coach in a dark showroom"
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />

      <div className="coach-screen__stage">
        <header className="coach-screen__brand" aria-label="RvFOX">
          <RvMark />
          <span>RvFOX</span>
        </header>

        <section className="coach-screen__details" aria-labelledby="coach-title">
          <p className="coach-screen__eyebrow">2026 Entegra Coach</p>
          <h1 id="coach-title" className="coach-screen__title">Cornerstone 45D</h1>
          <p className="coach-screen__price">$1,124,963</p>
          <p className="coach-screen__stock coach-screen__stock--1">1,420 in stock</p>
          <p className="coach-screen__stock coach-screen__stock--2">Stock 45282</p>
          <p className="coach-screen__stock coach-screen__stock--3">• Fresno CA</p>
        </section>

        <button className="coach-screen__open" type="button">Open coach</button>
        <p className="coach-screen__verified">VERIFIED AND TRUE</p>

        <button className="coach-screen__ask" type="button">Ask RV Grok</button>

        <nav className="coach-screen__tabs" aria-label="Coach sections">
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`coach-screen__tab ${activeTab === label ? "is-active" : ""}`}
              aria-current={activeTab === label ? "page" : undefined}
              onClick={() => setActiveTab(label)}
            >
              <span className="coach-screen__tab-icon"><Icon /></span>
              <span className="coach-screen__tab-label">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
