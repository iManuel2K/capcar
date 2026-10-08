"use client";

import { useEffect, useRef, useState } from "react";
import { loadSketchfab, type ViewerApi } from "./sketchfab-api";

export function useSketchfabViewer(id: string) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const api = useRef<ViewerApi | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [attempt, setAttempt] = useState(0);
  const active = status === "loading" || status === "ready";
  useEffect(() => {
    if (!active || !iframe.current) return;
    let cancelled = false;
    let viewer: ViewerApi | undefined;
    let ready = false;
    const stop = () => {
      try {
        viewer?.stop();
      } catch {
        /* Viewer may already be detached. */
      }
    };
    const fail = () => {
      if (cancelled) return;
      cancelled = true;
      stop();
      api.current = null;
      setStatus("error");
    };
    const timeout = window.setTimeout(() => {
      if (!ready) fail();
    }, 20_000);
    void loadSketchfab()
      .then((Constructor) => {
        if (cancelled || !iframe.current) return;
        new Constructor("1.12.1", iframe.current).init(id, {
          autostart: 1,
          ui_theme: "dark",
          // No autoplaying model soundtrack. Opening 3D is a separate opt-in.
          autospin: 0,
          error: fail,
          success: (instance) => {
            viewer = instance;
            if (cancelled) {
              stop();
              return;
            }
            api.current = instance;
            instance.addEventListener("viewerready", () => {
              if (cancelled) return;
              ready = true;
              window.clearTimeout(timeout);
              setStatus("ready");
            });
            instance.start();
          },
        });
      })
      .catch(fail);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      stop();
      api.current = null;
    };
  }, [active, attempt, id]);
  return {
    iframe,
    api,
    status,
    active,
    attempt,
    open: () => {
      setStatus("loading");
      setAttempt((value) => value + 1);
    },
    close: () => setStatus("idle"),
    fail: () => setStatus("error"),
  };
}
