/** One 24px outline set. Stroke follows currentColor. */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DockIcon({
  name,
}: {
  name: "home" | "facts" | "inventory" | "ask";
}) {
  return (
    <svg viewBox="0 0 24 24" className="bottom-tab-glyph" width="24" height="24" aria-hidden>
      {name === "home" ? (
        <>
          <path {...stroke} d="M4 11.1 12 4.6l8 6.5" />
          <path {...stroke} d="M6.4 10.2V19h4.1v-4.4h3v4.4h4.1V10.2" />
        </>
      ) : null}
      {name === "facts" ? <path {...stroke} d="M5 12.4 9.4 16.8 19 7.2" /> : null}
      {name === "inventory" ? (
        <>
          <path {...stroke} d="M3.4 14.8V9.4L6.5 6.4h7.8l2.3 2.5h2.2c.8 0 1.4.6 1.4 1.4v4.5" />
          <path {...stroke} d="M6.7 6.6v2.5h7.2V6.6" />
          <circle cx="7.4" cy="15.7" r="1.65" {...stroke} />
          <circle cx="16.5" cy="15.7" r="1.65" {...stroke} />
        </>
      ) : null}
      {name === "ask" ? (
        <path
          {...stroke}
          d="M12 3.6 13.4 9.2 19.1 10.6 13.4 12 12 17.6 10.6 12 4.9 10.6 10.6 9.2Z"
        />
      ) : null}
    </svg>
  );
}
