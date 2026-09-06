import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Play } from "lucide-react";
import {
  EMPTY_MATCH_MESSAGE,
  fetchRvVideos,
  isRvVideoLibraryYear,
  MISSING_KEY_MESSAGE,
  RELATED_NOTE,
  RV_VIDEO_LIBRARY_URL,
  type RvVideoCoach,
  type RvVideoHit,
} from "@/lib/rv/rvVideos";

type Phase = "prompt" | "hidden" | "loading" | "list" | "empty" | "calm";

/**
 * Quiet opt-in. Never searches until Yes. Catalog stays SoT.
 * Known model years before 2016 stay hidden — channel coverage is ~2016+.
 */
export function RvVideoLibraryCard(coach: RvVideoCoach) {
  const identity = `${coach.year}|${coach.make}|${coach.model}|${coach.floorplan || ""}|${coach.series || ""}`;
  const covered = isRvVideoLibraryYear(coach.year);
  const [phase, setPhase] = useState<Phase>(covered ? "prompt" : "hidden");
  const [videos, setVideos] = useState<RvVideoHit[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    setPhase(isRvVideoLibraryYear(coach.year) ? "prompt" : "hidden");
    setVideos([]);
    setNote("");
  }, [identity]);

  async function onYes() {
    if (!isRvVideoLibraryYear(coach.year)) {
      setPhase("hidden");
      return;
    }
    setPhase("loading");
    setVideos([]);
    setNote("");
    const res = await fetchRvVideos(coach);
    if (!res.ok) {
      setNote(
        res.code === "missing_key" ? MISSING_KEY_MESSAGE : res.error,
      );
      setPhase("calm");
      return;
    }
    setVideos(res.videos);
    setNote(res.note);
    setPhase(res.videos.length ? "list" : "empty");
  }

  if (phase === "hidden") return null;

  if (phase === "prompt") {
    return (
      <section
        className="glass-prestige rounded-[1.15rem] px-3.5 py-3"
        data-no-export
        data-rv-video-prompt
      >
        <p className="text-[13px] font-semibold text-white">Want a video?</p>
        <p className="mt-0.5 text-[12px] leading-snug text-white/65">
          Would you like a video from RV Video Library?
        </p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => void onYes()}
            className="inline-flex min-h-11 min-w-16 items-center justify-center rounded-full border border-blue/40 bg-blue/20 px-4 text-[12px] font-bold text-white"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setPhase("hidden")}
            className="inline-flex min-h-11 min-w-16 items-center justify-center rounded-full border border-white/15 bg-black/25 px-4 text-[12px] font-semibold text-white/70"
          >
            No thanks
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="glass-prestige rounded-[1.15rem] px-3.5 py-3"
      data-no-export
      data-rv-video-results
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-[0.14em] text-white">
          RV VIDEO LIBRARY
        </p>
        <a
          href={RV_VIDEO_LIBRARY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue"
        >
          YouTube <ExternalLink className="size-3" />
        </a>
      </div>

      {phase === "loading" ? (
        <p className="flex items-center gap-2 text-[13px] text-white/80">
          <Loader2 className="size-4 animate-spin" />
          Looking on RV Video Library…
        </p>
      ) : null}

      {phase === "calm" ? (
        <p className="text-[12px] leading-snug text-white/65">{note}</p>
      ) : null}

      {phase === "empty" ? (
        <p className="text-[12px] leading-snug text-white/65">
          {note || EMPTY_MATCH_MESSAGE}
        </p>
      ) : null}

      {phase === "list" ? (
        <>
          <ul className="space-y-1.5">
            {videos.map((v) => (
              <li key={v.videoId}>
                <a
                  href={v.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-2 py-1.5"
                >
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="h-12 w-[5.25rem] shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-[5.25rem] shrink-0 items-center justify-center rounded-md bg-white/10 text-white/70">
                      <Play className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[12px] font-semibold leading-snug text-white">
                      {v.title}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-blue">
                      Open on YouTube <ExternalLink className="size-3" />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-snug text-white/50">
            {note || RELATED_NOTE}
          </p>
        </>
      ) : null}
    </section>
  );
}
