import { useSyncExternalStore } from "react";
import type { LotUnit } from "@/lib/lot/ownLotPage";

type AskCardState = {
  home: LotUnit | null;
  detail: LotUnit | null;
};

let state: AskCardState = { home: null, detail: null };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function same(a: LotUnit | null, b: LotUnit | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.stock_number === b.stock_number && a.vin === b.vin;
}

export function setHomeAskUnit(unit: LotUnit | null) {
  if (same(state.home, unit)) return;
  state = { ...state, home: unit };
  emit();
}

export function setDetailAskUnit(unit: LotUnit | null) {
  if (same(state.detail, unit)) return;
  state = { ...state, detail: unit };
  emit();
}

export function readAskCard(): AskCardState {
  return state;
}

export function subscribeAskCard(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useAskCard() {
  return useSyncExternalStore(subscribeAskCard, readAskCard, readAskCard);
}
