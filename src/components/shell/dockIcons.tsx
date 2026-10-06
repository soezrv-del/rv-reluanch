/** One 24px outline set. Color comes from currentColor, so dark, light, and copper all work. */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DockIcon({
  name,
}: {
  name: "home" | "facts" | "inventory" | "ask" | "more";
}) {
  return (
    <svg viewBox="0 0 24 24" className="bottom-tab-glyph" width="24" height="24" aria-hidden>
      {name === "home" ? (
        <path {...stroke} d="M4 11.2 12 4.5l8 6.7V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z" />
      ) : null}
      {name === "facts" ? <polyline {...stroke} points="5 12.5 9.5 17 19 7.5" /> : null}
      {name === "inventory" ? (
        <>
          <path {...stroke} d="M3 16.2h18" />
          <path {...stroke} d="M4.2 16.2V10.2L7.2 6.6h9.6l3 3.6v5.8" />
          <path {...stroke} d="M7.2 6.6V10h9.6V6.6" />
          <circle cx="7.2" cy="16.2" r="1.35" {...stroke} />
          <circle cx="16.8" cy="16.2" r="1.35" {...stroke} />
        </>
      ) : null}
      {name === "ask" ? (
        <path {...stroke} d="M12 3.2 13.7 9.1 19.6 10.8 13.7 12.5 12 18.4 10.3 12.5 4.4 10.8 10.3 9.1z" />
      ) : null}
      {name === "more" ? (
        <>
          <circle cx="6" cy="12" r="1.15" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.15" fill="currentColor" stroke="none" />
        </>
      ) : null}
    </svg>
  );
}
