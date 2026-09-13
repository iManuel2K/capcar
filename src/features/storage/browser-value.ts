"use client";
import { useCallback, useSyncExternalStore } from "react";
const eventName = "capcar-browser-value";
export function readBrowserValue(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
export function writeBrowserValue(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event(eventName));
}
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(eventName, listener);
  };
};
export function useBrowserValue(key: string) {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => readBrowserValue(key), [key]),
    () => "",
  );
}
