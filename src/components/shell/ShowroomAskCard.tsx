import { FileText, MessageCircle, MoreHorizontal } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { InventoryGlyph } from "./BottomTabs";
import { lotAskPrompt } from "@/components/lot/LotStockApp";
import { spotlightCard } from "@/lib/home/homeCoach";
import type { LotUnit } from "@/lib/lot/ownLotPage";
import "./ask-card.css";

const TABS: { id: AppTab; label: string; more?: boolean }[] = [
  { id: "rvfax", label: "Facts" },
  { id: "rvlot", label: "Inventory" },
  { id: "rvgrok", label: "Live Chat" },
  { id: "more", label: "More", more: true },
];

export function ShowroomAskCard({
  unit,
  home,
  active,
  onAsk,
  onOpen,
}: {
  unit: LotUnit;
  home: boolean;
  active: AppTab | null;
  onAsk: (prompt: string) => void;
  onOpen: (tab: AppTab) => void;
}) {
  const cells = spotlightCard(unit);
  return (
    <section className="showroom-ask-card" data-ask-card data-no-swipe>
      {cells.length > 0 ? (
        <div className="showroom-ask-strip">
          {cells.map((cell) => (
            <div key={cell.label} className="showroom-ask-cell">
              <b>{cell.value}</b>
              <span>{cell.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        className="showroom-ask-pill"
        onClick={() => onAsk(lotAskPrompt(unit))}
      >
        <span>Ask Grok</span>
      </button>
      <nav className="showroom-ask-tabs" aria-label="Suite">
        {TABS.map((tab) => {
          const on = !home && active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={
                "showroom-ask-tab" +
                (tab.more ? " is-more" : "") +
                (on ? " is-active" : "")
              }
              aria-current={on ? "page" : undefined}
              onClick={() => {
                if (tab.id === "rvgrok") onAsk(lotAskPrompt(unit));
                else onOpen(tab.id);
              }}
            >
              <TabIcon id={tab.id} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </section>
  );
}

function TabIcon({ id }: { id: AppTab }) {
  if (id === "rvfax") return <FileText strokeWidth={1.75} aria-hidden />;
  if (id === "rvlot") return <InventoryGlyph className="showroom-ask-icon" />;
  if (id === "rvgrok") return <MessageCircle strokeWidth={1.75} aria-hidden />;
  return <MoreHorizontal strokeWidth={1.75} aria-hidden />;
}
