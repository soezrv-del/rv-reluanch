import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACCESS_REQUEST_EVENT } from "@/lib/access/constants";
import {
  checkAccessPhone,
  readStoredPhone,
  storePhone,
  type AccessCheckResult,
} from "@/lib/access/client";
import { RequestAccessSheet } from "./RequestAccessSheet";

type AccessStatus = "unknown" | "checking" | "full" | "admin" | "browse";

type AccessContextValue = {
  status: AccessStatus;
  allowed: boolean;
  isAdmin: boolean;
  phone: string;
  name: string;
  requestOpen: boolean;
  openRequest: (reason?: string) => void;
  closeRequest: () => void;
  /** Identity check only — unlocks iff already on the list. */
  identify: (phone: string) => Promise<AccessCheckResult>;
  /** If listed, run fn. Otherwise open the request sheet and return false. */
  guard: (fn?: () => void, reason?: string) => boolean;
};

const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccess(): AccessContextValue {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    throw new Error("useAccess must be used inside AccessProvider");
  }
  return ctx;
}

export function useAccessOptional(): AccessContextValue | null {
  return useContext(AccessContext);
}

function statusFrom(result: AccessCheckResult): AccessStatus {
  if (result.isAdmin) return "admin";
  if (result.allowed) return "full";
  return "browse";
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<AccessStatus>("unknown");
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestReason, setRequestReason] = useState("");

  const applyResult = useCallback((result: AccessCheckResult, raw: string) => {
    const cred = (result.phoneDigits || result.phoneE164 || raw).trim();
    setPhone(cred);
    setName(result.name);
    setIsAdmin(result.isAdmin);
    setStatus(statusFrom(result));
    // Only persist an approved number — accessHeaders must be able to send it.
    if (result.allowed && cred) storePhone(cred);
  }, []);

  const identify = useCallback(
    async (raw: string) => {
      setStatus("checking");
      const result = await checkAccessPhone(raw);
      applyResult(result, raw);
      return result;
    },
    [applyResult],
  );

  useEffect(() => {
    const stored = readStoredPhone();
    if (!stored) {
      setStatus("browse");
      return;
    }
    void identify(stored).catch(() => setStatus("browse"));
  }, [identify]);

  const openRequest = useCallback((reason?: string) => {
    setRequestReason(reason || "");
    setRequestOpen(true);
  }, []);

  const closeRequest = useCallback(() => {
    setRequestOpen(false);
    setRequestReason("");
  }, []);

  const allowed = status === "full" || status === "admin";

  const guard = useCallback(
    (fn?: () => void, reason?: string) => {
      if (allowed) {
        fn?.();
        return true;
      }
      openRequest(reason);
      return false;
    },
    [allowed, openRequest],
  );

  useEffect(() => {
    const onNeed = (event: Event) => {
      const reason =
        event instanceof CustomEvent &&
        typeof event.detail?.reason === "string" &&
        event.detail.reason.trim()
          ? event.detail.reason.trim()
          : "Enter your approved number to unlock live research.";
      openRequest(reason);
    };
    window.addEventListener(ACCESS_REQUEST_EVENT, onNeed);
    return () => window.removeEventListener(ACCESS_REQUEST_EVENT, onNeed);
  }, [openRequest]);

  const value = useMemo<AccessContextValue>(
    () => ({
      status,
      allowed,
      isAdmin,
      phone,
      name,
      requestOpen,
      openRequest,
      closeRequest,
      identify,
      guard,
    }),
    [
      status,
      allowed,
      isAdmin,
      phone,
      name,
      requestOpen,
      openRequest,
      closeRequest,
      identify,
      guard,
    ],
  );

  return (
    <AccessContext.Provider value={value}>
      <div className="relative h-full min-h-0">
        {children}
        <RequestAccessSheet
          open={requestOpen}
          onClose={closeRequest}
          reason={requestReason}
          defaultPhone={phone}
          onIdentify={identify}
        />
      </div>
    </AccessContext.Provider>
  );
}
