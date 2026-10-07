"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { PriceWatchMonitor } from "@/components/builds/price-watch-monitor";
import { GarageSidebar } from "@/components/garage/garage-sidebar";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";
import { useNotifications } from "@/features/notifications/use-notifications";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function GarageShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("GarageNav");
  const pathname = usePathname();
  const notifications = useNotifications();
  const { vehicles } = useVehicles();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  return (
    <div className="capcar-editorial-grid min-h-dvh bg-[#07191b] text-[#f4f5f2] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <PriceWatchMonitor />

      <aside className="sticky top-0 hidden h-dvh border-r border-white/7 lg:block">
        <GarageSidebar
          pathname={pathname}
          vehicleId={vehicleId}
          vehicleLabel={vehicleLabel}
          vehicleMeta={vehicleMeta}
          unread={unread}
        />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-white/8 bg-[#07191b]/90 shadow-[0_12px_40px_rgba(0,0,0,.12)] backdrop-blur-2xl">
          <div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-7">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                ref={menuButton}
                type="button"
                aria-label={t("open")}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-white/70 transition hover:bg-white/[0.075]"
              >
                <Menu className="size-4" />
              </button>
              <CapcarWordmark />
            </div>

            <div className="hidden min-w-0 lg:block">
              <p className="text-[9px] font-semibold tracking-[0.15em] text-white/28 uppercase">
                {vehicleId ? t("vehicleWorkspace") : t("garage")}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white/72">
                {vehicleLabel ?? t("allVehicles")}
              </p>
            </div>

            <div className="hidden w-full max-w-sm xl:block">
              <GlobalPartsSearch theme="dark" />
            </div>
            <span className="ml-auto hidden text-[10px] tracking-[0.12em] text-white/24 uppercase sm:inline lg:hidden">
              {vehicleLabel ?? t("garage")}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 pb-12 sm:px-7 sm:py-10">
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
          <div className="absolute inset-y-0 left-0 w-[min(88vw,18rem)] border-r border-white/8 shadow-[28px_0_90px_rgba(0,0,0,.5)]">
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
