"use client";
import { useLocale } from "next-intl";
import { isAppLocale } from "@/i18n/config";
import { garageCopy } from "./copy";
export function useGarageCopy() {
  const locale = useLocale();
  return garageCopy[isAppLocale(locale) ? locale : "en"];
}
