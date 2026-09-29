/** Saved coach-knowledge value. Brochure rows do not use this. */
export function VerifiedFromWeb({
  sourceUrl,
  foundAt,
}: {
  sourceUrl?: string;
  foundAt?: string;
}) {
  return (
    <span className="verified-from-web" data-verified-from-web>
      <span className="verified-from-web-label">Verified from web</span>
      {sourceUrl ? (
        <a
          className="verified-from-web-link"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          source
        </a>
      ) : null}
      {foundAt ? (
        <time className="verified-from-web-date" dateTime={foundAt}>
          {foundAt}
        </time>
      ) : null}
    </span>
  );
}
