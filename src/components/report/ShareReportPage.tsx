import type { ShareReport } from "@/lib/rv/shareReport";

const LOGO = "/assets/brand/icon-rvfax.png";

export function ShareReportPage({
  report,
  pending,
  missing,
}: {
  report: ShareReport | null;
  pending?: boolean;
  missing?: string;
}) {
  return (
    <main className="report-page" data-report-page data-report-ready={report ? "1" : undefined}>
      <header className="report-band">
        <img src={LOGO} alt="RvFAX" className="report-logo" />
        <div className="min-w-0 flex-1">
          <p className="report-brand">RvFAX</p>
          <p className="report-eyebrow">{report?.eyebrow ?? "Vehicle report"}</p>
        </div>
        {report ? <p className="report-date">{report.generatedLabel}</p> : null}
      </header>

      {pending ? (
        <p className="report-status">Opening report…</p>
      ) : null}

      {missing ? <p className="report-status">{missing}</p> : null}

      {report ? (
        <article className="report-sheet">
          <h1 className="report-title">{report.title}</h1>
          {report.photoUrl ? (
            <img src={report.photoUrl} alt="" className="report-hero" />
          ) : null}
          {report.headlines.length ? (
            <dl className="report-headlines">
              {report.headlines.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {report.sections.map((section) => (
            <section key={section.title} className="report-section">
              <h2>{section.title}</h2>
              <dl>
                {section.rows.map((row) => (
                  <div key={`${section.title}-${row.label}`}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          {report.sources ? <p className="report-sources">{report.sources}</p> : null}
          <footer className="report-foot">
            <p>{report.footerNote}</p>
            <a href={report.siteUrl}>{report.siteLabel}</a>
          </footer>
        </article>
      ) : null}
    </main>
  );
}
