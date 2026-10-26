"use client";

// Adapted for CapCar from Unlumen UI's Favicon Search by Léo.
// https://ui.unlumen.com/components/favicon-search — see docs/unlumen-favicon-search.md.
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Globe, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function extractDomain(input: string): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  try {
    const url = new URL(text.includes("://") ? text : `https://${text}`);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    const host = url.hostname.replace(/^www\./, "");
    if (
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
      host.length > 253
    )
      return null;
    if (/\.(?:local|internal|test|example|invalid|localhost)$/.test(host))
      return null;
    return host;
  } catch {
    return null;
  }
}

export function getFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

type Props = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  clearLabel: string;
  inputClassName?: string;
};

function SiteIcon({ domain }: { domain: string | null }) {
  const [state, setState] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );
  return (
    <>
      {domain && state !== "error" ? (
        <>
          {state === "loading" && <Globe className="size-[18px]" />}
          {/* External favicon is a small decorative image; no Next image proxy or referrer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFaviconUrl(domain)}
            alt=""
            width={20}
            height={20}
            referrerPolicy="no-referrer"
            className={cn(
              "absolute size-5 rounded-sm object-contain",
              state !== "ready" && "opacity-0",
            )}
            onLoad={() => setState("ready")}
            onError={() => setState("error")}
          />
        </>
      ) : (
        <Search className="size-[18px]" />
      )}
    </>
  );
}

export const FaviconSearch = React.forwardRef<HTMLInputElement, Props>(
  function FaviconSearch(
    {
      value: controlled,
      defaultValue = "",
      onChange,
      clearLabel,
      className,
      inputClassName,
      ...inputProps
    },
    ref,
  ) {
    const localRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);
    const [internal, setInternal] = React.useState(defaultValue);
    const value = controlled ?? internal;
    const [settled, setSettled] = React.useState("");
    const reduced = useReducedMotion();
    React.useEffect(() => {
      const timer = setTimeout(() => setSettled(value), 350);
      return () => clearTimeout(timer);
    }, [value]);
    const domain =
      extractDomain(value) === extractDomain(settled)
        ? extractDomain(settled)
        : null;
    const update = (next: string) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    };
    return (
      <div
        className={cn("relative flex w-full min-w-0 items-center", className)}
      >
        <div
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-3.5 flex size-5 items-center justify-center"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={domain ?? "search"}
              className="relative flex size-5 items-center justify-center"
              initial={reduced ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
            >
              <SiteIcon key={domain ?? "search"} domain={domain} />
            </motion.span>
          </AnimatePresence>
        </div>
        <input
          {...inputProps}
          ref={localRef}
          type="search"
          value={value}
          onChange={(event) => update(event.target.value)}
          className={cn(
            "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-12 w-full min-w-0 rounded-xl border py-2.5 pr-12 pl-11 text-base outline-none focus-visible:ring-2 [&::-webkit-search-cancel-button]:appearance-none",
            inputClassName,
          )}
        />
        {value.length > 0 && !inputProps.disabled && !inputProps.readOnly && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => {
              update("");
              localRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-primary absolute right-0 flex size-12 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);
