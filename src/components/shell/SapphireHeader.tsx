import type { AppTab } from "./BottomTabs";
import { PAGE_COPY } from "./shellConstants";

/**
 * Flat page title. Navy on the page, no banner.
 * Sapphire is only the word FACTS.
 */
export function SapphireHeader({ tab }: { tab: AppTab }) {
  const copy = PAGE_COPY[tab] ?? PAGE_COPY.rvgrok;
  const facts = copy.title === "RvFACTS";

  return (
    <header className="tesla-page-head" data-suite-title={tab}>
      <h1 className="tesla-page-title">
        {facts ? (
          <>
            Rv<span className="tesla-facts-word">FACTS</span>
          </>
        ) : (
          copy.title
        )}
      </h1>
      {copy.line ? <p className="tesla-page-line">{copy.line}</p> : null}
    </header>
  );
}
