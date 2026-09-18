import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ACCESS_CHANGED_EVENT,
  readDevicePhone,
  writeDevicePhone,
} from "@/lib/access/devicePhone";
import { normalizePhoneE164 } from "@/lib/access/phone";
import { AccessSheets, type AccessSheetId } from "./AccessSheets";

export type AccessStatus =
  | "unset"
  | "checking"
  | "allowed"
  | "denied"
  | "error";

type AccessContextValue = {
  phone: string | null;
  allowed: boolean;
  status: AccessStatus;
  sheet: AccessSheetId;
  setPhone: (raw: string | null) => void;
  refresh: () => void;
  requestFunctional: () => void;
  openPhone: () => void;
  openRequest: () => void;
  openAdmin: () => void;
  closeSheet: () => void;
  /** Run `fn` only when whitelisted; otherwise open the request path. */
  guard: (fn?: () => void) => boolean;
};

const AccessContext = createContext<AccessContextValue>({
  phone: null,
  allowed: false,
  status: "unset",
  sheet: null,
  setPhone: () => {},
  refresh: () => {},
  requestFunctional: () => {},
  openPhone: () => {},
  openRequest: () => {},
  openAdmin: () => {},
  closeSheet: () => {},
  guard: () => false,
});

export function useAccess(): AccessContextValue {
  return useContext(AccessContext);
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState<string | null>(() => readDevicePhone());
  const [allowed, setAllowed] = useState(false);
  const [status, setStatus] = useState<AccessStatus>(() =>
    readDevicePhone() ? "checking" : "unset",
  );
  const [sheet, setSheet] = useState<AccessSheetId>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const sync = () => setPhoneState(readDevicePhone());
    window.addEventListener(ACCESS_CHANGED_EVENT, sync);
    const open = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id === "phone" || id === "request" || id === "admin") setSheet(id);
      if (id === "close") setSheet(null);
    };
    window.addEventListener("rvfox-access-open", open);
    return () => {
      window.removeEventListener(ACCESS_CHANGED_EVENT, sync);
      window.removeEventListener("rvfox-access-open", open);
    };
  }, []);

  useEffect(() => {
    const current = readDevicePhone();
    setPhoneState(current);
    if (!current) {
      setAllowed(false);
      setStatus("unset");
      return;
    }
    const ctrl = new AbortController();
    setStatus("checking");
    fetch(`/api/access/status?phone=${encodeURIComponent(current)}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((j: { allowed?: boolean }) => {
        if (ctrl.signal.aborted) return;
        setAllowed(Boolean(j.allowed));
        setStatus(j.allowed ? "allowed" : "denied");
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setAllowed(false);
        setStatus("error");
      });
    return () => ctrl.abort();
  }, [phone, tick]);

  const setPhone = useCallback((raw: string | null) => {
    const next = writeDevicePhone(raw);
    setPhoneState(next);
  }, []);

  const openPhone = useCallback(() => setSheet("phone"), []);
  const openRequest = useCallback(() => setSheet("request"), []);
  const openAdmin = useCallback(() => setSheet("admin"), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const requestFunctional = useCallback(() => {
    if (!readDevicePhone()) setSheet("phone");
    else setSheet("request");
  }, []);

  const guard = useCallback(
    (fn?: () => void) => {
      if (allowed) {
        fn?.();
        return true;
      }
      requestFunctional();
      return false;
    },
    [allowed, requestFunctional],
  );

  const value = useMemo(
    () => ({
      phone,
      allowed,
      status,
      sheet,
      setPhone,
      refresh,
      requestFunctional,
      openPhone,
      openRequest,
      openAdmin,
      closeSheet,
      guard,
    }),
    [
      phone,
      allowed,
      status,
      sheet,
      setPhone,
      refresh,
      requestFunctional,
      openPhone,
      openRequest,
      openAdmin,
      closeSheet,
      guard,
    ],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

/** Mount inside `.app-shell` so sheets cover the suite, not a new height wrapper. */
export function AccessGateSheets() {
  const access = useAccess();
  return (
    <AccessSheets
      sheet={access.sheet}
      phone={access.phone}
      allowed={access.allowed}
      status={access.status}
      onClose={access.closeSheet}
      onSavePhone={(raw) => {
        const n = normalizePhoneE164(raw);
        if (!n) return false;
        access.setPhone(n);
        return true;
      }}
      onRequested={() => {
        access.refresh();
      }}
    />
  );
}
