import { useCallback, useEffect, useRef, useState } from "react";
import { api, message } from "./client";
import { useLocale } from "./locale";
import type { WorkspaceIndex } from "./workspace";
export function useWorkspace(enabled = true, includeServices = false) {
  const { t } = useLocale(),
    [data, setData] = useState<WorkspaceIndex | null>(null),
    [loading, setLoading] = useState(enabled),
    [error, setError] = useState("");
  const request = useRef<AbortController | null>(null),
    generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    request.current?.abort();
    const controller = new AbortController(),
      seq = ++generation.current;
    request.current = controller;
    setLoading(true);
    setError("");
    try {
      const next = await api<WorkspaceIndex>(
        "/workspace-index" + (includeServices ? "?services=1" : ""),
        "GET",
        undefined,
        controller.signal,
      );
      if (seq === generation.current) setData(next);
    } catch (e) {
      if (seq === generation.current && !controller.signal.aborted)
        setError(t(message(e)));
    } finally {
      if (seq === generation.current) setLoading(false);
    }
  }, [enabled, t, includeServices]);
  useEffect(() => {
    if (enabled) void refresh();
    const auth = () => {
      generation.current++;
      request.current?.abort();
      setData(null);
      if (enabled) void refresh();
    };
    window.addEventListener("creative-school-auth-change", auth);
    window.addEventListener("cs-session-expired", auth);
    return () => {
      generation.current++;
      request.current?.abort();
      window.removeEventListener("creative-school-auth-change", auth);
      window.removeEventListener("cs-session-expired", auth);
    };
  }, [refresh, enabled]);
  const updateProjects = useCallback(
    (
      uid: string,
      update: (
        projects: WorkspaceIndex["projects"],
      ) => WorkspaceIndex["projects"],
    ) =>
      setData((index) =>
        index?.userId === uid
          ? { ...index, projects: update(index.projects) }
          : index,
      ),
    [],
  );
  return { data, loading, error, refresh, updateProjects };
}
