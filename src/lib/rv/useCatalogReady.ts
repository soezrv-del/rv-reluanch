import { useEffect, useState } from "react";
import {
  ensureCatalogLoaded,
  isCatalogLoaded,
  subscribeCatalogLoaded,
} from "./catalogLoad";

/** Kicks the dynamic catalog import and re-renders when the full module is ready. */
export function useCatalogReady(): { ready: boolean; gen: number } {
  const [state, setState] = useState(() => ({
    ready: isCatalogLoaded(),
    gen: isCatalogLoaded() ? 1 : 0,
  }));

  useEffect(() => {
    let live = true;
    const unsub = subscribeCatalogLoaded(() => {
      if (live) setState({ ready: true, gen: 1 });
    });
    void ensureCatalogLoaded()
      .then(() => {
        if (live) setState({ ready: true, gen: 1 });
      })
      .catch((err) => {
        console.error("[RvFOX] catalog load failed", err);
      });
    return () => {
      live = false;
      unsub();
    };
  }, []);

  return state;
}
