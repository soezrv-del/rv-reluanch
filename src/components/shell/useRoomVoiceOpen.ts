import { useSyncExternalStore } from "react";
import { roomVoiceIsOpen, subscribeRoomVoice } from "@/lib/rvgrok/roomAsk";

function subscribe(onStoreChange: () => void) {
  // subscribeRoomVoice emits the current phase immediately. useSyncExternalStore
  // already read that snapshot, so ignore the synchronous ping.
  let ready = false;
  const unsubscribe = subscribeRoomVoice(() => {
    if (ready) onStoreChange();
  });
  ready = true;
  return unsubscribe;
}

/** True while Live Voice is up, including after you leave the Chat screen. */
export function useRoomVoiceOpen(): boolean {
  return useSyncExternalStore(subscribe, roomVoiceIsOpen, () => false);
}
