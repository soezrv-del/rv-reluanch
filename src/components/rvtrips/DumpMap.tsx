import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type DumpMapPoint = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  city?: string;
  state?: string;
};

function project(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const s = Math.sin((lat * Math.PI) / 180);
  const y =
    (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
  return { x, y };
}

function fitZoom(
  pts: DumpMapPoint[],
  w: number,
  h: number,
): { z: number; minX: number; minY: number } {
  const pad = 0.12;
  for (let z = 10; z >= 3; z--) {
    const xs = pts.map((p) => project(p.lat, p.lng, z).x);
    const ys = pts.map((p) => project(p.lat, p.lng, z).y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(0.08, maxX - minX) * (1 + pad * 2);
    const spanY = Math.max(0.08, maxY - minY) * (1 + pad * 2);
    if (spanX * 256 <= w && spanY * 256 <= h) {
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      return { z, minX: cx - w / 2 / 256, minY: cy - h / 2 / 256 };
    }
  }
  const z = 3;
  const xs = pts.map((p) => project(p.lat, p.lng, z).x);
  const ys = pts.map((p) => project(p.lat, p.lng, z).y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return { z, minX: cx - w / 2 / 256, minY: cy - h / 2 / 256 };
}

export function DumpMap({
  stations,
  selectedId,
  onSelect,
  youAreHere,
}: {
  stations: DumpMapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  youAreHere?: { lat: number; lng: number } | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  const h = 220;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setW(Math.max(240, el.clientWidth));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const view = useMemo(() => {
    if (!stations.length) return null;
    return fitZoom(stations, w, h);
  }, [stations, w]);

  const tiles = useMemo(() => {
    if (!view) return [];
    const { z, minX, minY } = view;
    const maxX = minX + w / 256;
    const maxY = minY + h / 256;
    const x0 = Math.floor(minX);
    const y0 = Math.floor(minY);
    const x1 = Math.floor(maxX);
    const y1 = Math.floor(maxY);
    const n = 2 ** z;
    const out: { key: string; left: number; top: number; src: string }[] = [];
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const tx = ((x % n) + n) % n;
        if (y < 0 || y >= n) continue;
        out.push({
          key: `${z}-${tx}-${y}`,
          left: (x - minX) * 256,
          top: (y - minY) * 256,
          src: `https://tile.openstreetmap.org/${z}/${tx}/${y}.png`,
        });
      }
    }
    return out;
  }, [view, w]);

  const pins = useMemo(() => {
    if (!view) return [];
    const { z, minX, minY } = view;
    return stations.map((s) => {
      const p = project(s.lat, s.lng, z);
      return {
        ...s,
        left: (p.x - minX) * 256,
        top: (p.y - minY) * 256,
      };
    });
  }, [stations, view]);

  const here = useMemo(() => {
    if (!youAreHere || !view) return null;
    const p = project(youAreHere.lat, youAreHere.lng, view.z);
    return {
      left: (p.x - view.minX) * 256,
      top: (p.y - view.minY) * 256,
    };
  }, [youAreHere, view]);

  if (!stations.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-2xl border border-white/15 bg-black/40 text-[13px] text-white">
        No dumps to plot
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0b1a12]"
      style={{ height: h }}
    >
      <div className="absolute inset-0">
        {tiles.map((t) => (
          <img
            key={t.key}
            src={t.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute size-[256px] max-w-none"
            style={{ left: t.left, top: t.top }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

      {here ? (
        <span
          className="pointer-events-none absolute z-[2] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_12px_rgba(80,160,255,0.9)]"
          style={{ left: here.left, top: here.top }}
          title="You"
        />
      ) : null}

      {pins.map((p) => {
        const on = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            title={`${p.name}${p.city ? ` · ${p.city}, ${p.state}` : ""}`}
            onClick={() => onSelect?.(p.id)}
            className={cn(
              "absolute z-[3] -translate-x-1/2 -translate-y-full rounded-full border text-[10px] font-bold shadow-lg",
              on
                ? "border-white bg-sky-500 px-1.5 py-1 text-white"
                : "size-3.5 border-white/90 bg-sky-300 hover:scale-125",
            )}
            style={{ left: p.left, top: p.top }}
          >
            {on ? "●" : null}
          </button>
        );
      })}

      <p className="absolute bottom-1 right-2 z-[4] text-[9px] font-medium text-white/80">
        © OpenStreetMap
      </p>
    </div>
  );
}