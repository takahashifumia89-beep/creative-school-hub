import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, message, type User } from "./client";
import type { Localized } from "./locale";
type Session = {
  user: User | null;
  loading: boolean;
  error: Localized | null;
  refresh: () => Promise<void>;
};
const Context = createContext<Session | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<Localized | null>(null);
  const request = useRef<AbortController | null>(null),
    generation = useRef(0),
    current = useRef(user);
  current.current = user;
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController(),
      seq = ++generation.current;
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const r = await api<{ user: User }>(
        "/me",
        "GET",
        undefined,
        controller.signal,
      );
      if (seq === generation.current) setUser(r.user);
    } catch (e) {
      if (seq !== generation.current || controller.signal.aborted) return;
      if (e instanceof ApiError && e.status === 401) setUser(null);
      else setError(message(e));
    } finally {
      if (seq === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const changed = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === null || (detail?.id && detail.id !== current.current?.id))
        setUser(null);
      void refresh();
    };
    const expired = () => {
      setUser(null);
      void refresh();
    };
    window.addEventListener("creative-school-auth-change", changed);
    window.addEventListener("cs-session-expired", expired);
    return () => {
      generation.current++;
      request.current?.abort();
      window.removeEventListener("creative-school-auth-change", changed);
      window.removeEventListener("cs-session-expired", expired);
    };
  }, [refresh]);
  const value = useMemo(
    () => ({ user, loading, error, refresh }),
    [user, loading, error, refresh],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw Error("SessionProvider is required");
  return value;
}
