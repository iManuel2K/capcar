"use client";

import Link from "next/link";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { PriceWatchMonitor } from "@/components/builds/price-watch-monitor";
import { GarageSidebar } from "@/components/garage/garage-sidebar";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";
import { useNotifications } from "@/features/notifications/use-notifications";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { LanguageSelector } from "@/components/i18n/language-selector";

export function GarageShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("GarageNav");
  const navigation = useTranslations("Navigation");
  const pathname = usePathname();
  const notifications = useNotifications();
  const { vehicles } = useVehicles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(272);
  const desktopSidebar = useRef<HTMLElement>(null);
  const resizeSidebar = (width: number) =>
    setSidebarWidth(Math.min(360, Math.max(240, width)));
  const mobileDrawer = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const unread = notifications.filter((item) => !item.readAt).length;
  const vehicleMatch = pathname.match(/^\/garage\/([^/]+)/);
  const vehicleId =
    vehicleMatch?.[1] && vehicleMatch[1] !== "new"
      ? vehicleMatch[1]
      : undefined;
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const vehicleLabel = vehicle
    ? `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`
    : undefined;
  const vehicleMeta = vehicle
    ? [vehicle.platform, vehicle.engineCode].filter(Boolean).join(" · ")
    : undefined;

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = mobileDrawer.current;
    const trigger = menuButton.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      trigger?.focus();
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  if (pathname === "/garage/new")
    return (
      <div className="capcar-editorial-grid bg-background text-foreground min-h-dvh">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" aria-label={navigation("home")} className="rounded-lg">
            <CapcarWordmark />
          </Link>
          <LanguageSelector />
        </header>
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    );

  return (
    <div
      style={
        {
          "--garage-sidebar-width": `${vehicleId ? sidebarWidth : 272}px`,
        } as React.CSSProperties
      }
      className="capcar-editorial-grid bg-background text-foreground min-h-dvh lg:grid lg:grid-cols-[var(--garage-sidebar-width)_minmax(0,1fr)]"
    >
      <PriceWatchMonitor />

      <aside
        ref={desktopSidebar}
        className="sticky top-0 hidden h-dvh min-h-0 border-r border-white/7 lg:flex lg:flex-col"
      >
        <div className="min-h-0 flex-1">
          <GarageSidebar
            pathname={pathname}
            vehicleId={vehicleId}
            vehicleLabel={vehicleLabel}
            vehicleMeta={vehicleMeta}
            unread={unread}
          />
        </div>
        {vehicleId && (
          <>
            <div className="bg-background flex shrink-0 items-center justify-between gap-2 border-t border-white/8 px-3">
              <span className="text-muted-foreground text-xs">
                {t("sidebarWidth")}
              </span>
              <div className="flex">
                <button
                  type="button"
                  aria-label={t("narrowerSidebar")}
                  disabled={sidebarWidth <= 240}
                  onClick={() => resizeSidebar(sidebarWidth - 24)}
                  className="hover:bg-primary/10 focus-visible:outline-primary grid size-11 place-items-center rounded-lg disabled:opacity-40"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={t("widerSidebar")}
                  disabled={sidebarWidth >= 360}
                  onClick={() => resizeSidebar(sidebarWidth + 24)}
                  className="hover:bg-primary/10 focus-visible:outline-primary grid size-11 place-items-center rounded-lg disabled:opacity-40"
                >
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
            <div
              role="separator"
              aria-label={t("sidebarWidth")}
              aria-orientation="vertical"
              aria-valuemin={240}
              aria-valuemax={360}
              aria-valuenow={sidebarWidth}
              tabIndex={0}
              className="hover:bg-primary/25 focus-visible:bg-primary/25 focus-visible:outline-primary absolute inset-y-0 -right-1 z-50 w-2 cursor-col-resize touch-none focus-visible:outline-2"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  resizeSidebar(
                    event.clientX -
                      (desktopSidebar.current?.getBoundingClientRect().left ??
                        0),
                  );
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onKeyDown={(event) => {
                const width =
                  event.key === "ArrowLeft"
                    ? sidebarWidth - 12
                    : event.key === "ArrowRight"
                      ? sidebarWidth + 12
                      : event.key === "Home"
                        ? 240
                        : event.key === "End"
                          ? 360
                          : null;
                if (width !== null) {
                  event.preventDefault();
                  resizeSidebar(width);
                }
              }}
            />
          </>
        )}
      </aside>

      <div className="min-w-0">
        <header className="bg-background/90 sticky top-0 z-40 border-b border-white/8 shadow-[0_12px_40px_rgba(0,0,0,.12)] backdrop-blur-2xl">
          <div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-7">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                ref={menuButton}
                type="button"
                aria-label={t("open")}
                aria-expanded={mobileOpen}
                aria-controls="mobile-garage-navigation"
                onClick={() => setMobileOpen(true)}
                className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-white/70 transition hover:bg-white/[0.075]"
              >
                <Menu className="size-4" />
              </button>
              <CapcarWordmark />
            </div>

            <div className="hidden min-w-0 lg:block">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.15em] uppercase">
                {vehicleId ? t("vehicleWorkspace") : t("garage")}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white/72">
                {vehicleLabel ?? t("allVehicles")}
              </p>
            </div>

            <div className="hidden w-full max-w-sm xl:block">
              <GlobalPartsSearch theme="dark" />
            </div>
            <span className="text-muted-foreground ml-auto hidden text-xs tracking-[0.12em] uppercase sm:inline lg:hidden">
              {vehicleLabel ?? t("garage")}
            </span>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-[1500px] px-4 py-7 pb-12 sm:px-7 sm:py-10"
        >
          <div className="capcar-page-enter min-w-0">{children}</div>
        </main>
      </div>

      {mobileOpen && (
        <dialog
          ref={mobileDrawer}
          aria-label={t("mobile")}
          onCancel={(event) => {
            event.preventDefault();
            setMobileOpen(false);
          }}
          className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent lg:hidden"
        >
          <button
            type="button"
            aria-label={t("closeBackdrop")}
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-[#050306]/68 backdrop-blur-sm"
          />
          <div
            id="mobile-garage-navigation"
            className="absolute inset-y-0 left-0 w-[min(88vw,18rem)] border-r border-white/8 shadow-[28px_0_90px_rgba(0,0,0,.5)]"
          >
            <GarageSidebar
              pathname={pathname}
              vehicleId={vehicleId}
              vehicleLabel={vehicleLabel}
              vehicleMeta={vehicleMeta}
              unread={unread}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
