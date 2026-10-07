import { useState } from "react";
import { BusFront, Check, MessageCircle, MoreHorizontal } from "lucide-react";

const HERO_IMAGE =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero2-COjNTBGQ4RucqUzybSe0GxAPZxl1m5.jpg";

const tabs = [
  { label: "Facts", icon: Check },
  { label: "Inventory", icon: BusFront },
  { label: "Chat", icon: MessageCircle },
  { label: "More", icon: MoreHorizontal },
];

export function CoachDetailScreen() {
  const [activeTab, setActiveTab] = useState("Facts");

  return (
    <main className="coach-screen" aria-label="RvFOX coach detail">
      <img className="coach-screen__art" src={HERO_IMAGE} alt="2026 Entegra Cornerstone 45D coach in a dark showroom" />
      <div className="coach-screen__veil" aria-hidden="true" />

      <header className="coach-screen__brand" aria-label="RvFOX">
        <span className="coach-screen__mark" aria-hidden="true">R</span>
        <span>RvFOX</span>
      </header>

      <section className="coach-screen__details" aria-labelledby="coach-title">
        <p className="coach-screen__eyebrow">2026 Entegra Coach</p>
        <h1 id="coach-title">Cornerstone 45D</h1>
        <p className="coach-screen__price">$1,124,963</p>
        <p className="coach-screen__stock">1,420 in stock<br />Stock 45282<br />• Fresno CA</p>
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
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
