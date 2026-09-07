"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  Bell,
  House,
  Layers3,
  Plus,
  ShoppingBag,
  UserCircle,
  Wrench,
  Menu,
} from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { useNotifications } from "@/features/notifications/use-notifications";

export function GarageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const notifications = useNotifications();
  const unread = notifications.filter((item) => !item.readAt).length;
  const vehicleMatch = pathname.match(/^\/garage\/([^/]+)/);
  const vehicleId =
    vehicleMatch?.[1] && vehicleMatch[1] !== "new"
      ? vehicleMatch[1]
      : undefined;
  const maintenanceHref = vehicleId
    ? `/garage/${vehicleId}/maintenance`
    : undefined;
  const buildsHref = vehicleId ? `/garage/${vehicleId}/builds` : undefined;
  const partsHref = vehicleId ? `/garage/${vehicleId}/parts` : undefined;
  const timelineHref = vehicleId ? `/garage/${vehicleId}/timeline` : undefined;

  return (
    <div className="min-h-dvh bg-[#0b0e0c] text-[#f4f5f2]">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0e0c]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-4 sm:px-7">
          <Link
            href="/"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e72d45]"
          >
            <CapcarWordmark />
          </Link>
          <nav
            aria-label="Garage navigation"
            className="hidden items-center gap-1 sm:flex"
          >
            <NavLink
              href="/garage"
              active={pathname === "/garage"}
              icon={House}
            >
              Garage
            </NavLink>
            {maintenanceHref ? (
              <NavLink
                href={maintenanceHref}
                active={pathname.endsWith("/maintenance")}
                icon={Wrench}
              >
                Maintenance
              </NavLink>
            ) : (
              <DisabledNav>Maintenance</DisabledNav>
            )}
            {buildsHref ? (
              <NavLink
                href={buildsHref}
                active={pathname.startsWith(buildsHref)}
                icon={Layers3}
              >
                Builds
              </NavLink>
            ) : (
              <DisabledNav>Builds</DisabledNav>
            )}
            {partsHref ? (
              <NavLink
                href={partsHref}
                active={pathname.startsWith(partsHref)}
                icon={ShoppingBag}
              >
                Parts
              </NavLink>
            ) : (
              <DisabledNav>Parts</DisabledNav>
            )}
            {timelineHref ? (
              <NavLink
                href={timelineHref}
                active={pathname.startsWith(timelineHref)}
                icon={Clock3}
              >
                Timeline
              </NavLink>
            ) : (
              <DisabledNav>Timeline</DisabledNav>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#e72d45]/20 bg-[#e72d45]/8 px-3 py-1.5 text-xs text-[#a9c7ff] md:inline-flex">
              Capcar Beta
            </span>
            <Link aria-label={`${unread} unread notifications`} className="relative grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60" href="/notifications">
              <Bell className="size-4" />
              {unread > 0 && <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#e72d45] px-1 text-[10px] font-bold text-[#07101d]">{Math.min(unread, 9)}{unread > 9 ? "+" : ""}</span>}
            </Link>
            <Link
              aria-label="Account and sync"
              className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60"
              href="/account"
            >
              <UserCircle className="size-4" />
            </Link>
            {vehicleId && (
              <details className="relative hidden md:block">
                <summary aria-label="More vehicle tools" className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 marker:hidden">
                  <Menu className="size-4" />
                </summary>
                <div className="absolute top-12 right-0 z-50 grid w-52 gap-1 rounded-2xl border border-white/10 bg-[#151515] p-2 shadow-2xl">
                  <MoreLink href={`/garage/${vehicleId}/passport`}>Vehicle Passport</MoreLink>
                  <MoreLink href={`/garage/${vehicleId}/costs`}>Cost analytics</MoreLink>
                  <MoreLink href={`/garage/${vehicleId}/wishlist`}>Part wishlist</MoreLink>
                  <MoreLink href={`/garage/${vehicleId}/diagnostics`}>Diagnostic log</MoreLink>
                  <MoreLink href={`/garage/${vehicleId}/specialists`}>Specialists</MoreLink>
                </div>
              </details>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 sm:py-12">
        {children}
      </main>

      <nav
        aria-label="Mobile garage navigation"
        className="fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between rounded-2xl border border-white/10 bg-[#151916]/95 p-2 shadow-2xl backdrop-blur-xl sm:hidden"
      >
        <MobileLink href="/garage" active={pathname === "/garage"} icon={House}>
          Garage
        </MobileLink>
        {vehicleId &&
        maintenanceHref &&
        buildsHref &&
        partsHref &&
        timelineHref ? (
          <>
            <MobileLink
              href={maintenanceHref}
              active={pathname.endsWith("/maintenance")}
              icon={Wrench}
            >
              Service
            </MobileLink>
            <MobileLink
              href={buildsHref}
              active={pathname.startsWith(buildsHref)}
              icon={Layers3}
            >
              Builds
            </MobileLink>
            <MobileLink
              href={partsHref}
              active={pathname.startsWith(partsHref)}
              icon={ShoppingBag}
            >
              Parts
            </MobileLink>
            <MobileLink
              href={timelineHref}
              active={pathname.startsWith(timelineHref)}
              icon={Clock3}
            >
              History
            </MobileLink>
          </>
        ) : (
          <>
            <Link
              className="mx-2 grid size-12 place-items-center rounded-xl bg-[#e72d45] text-[#07101d]"
              href="/garage/new"
              aria-label="Add vehicle"
            >
              <Plus className="size-5" />
            </Link>
            <span className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] text-white/30">
              <Layers3 className="size-4" /> Builds
            </span>
          </>
        )}
      </nav>
    </div>
  );
}

function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="rounded-xl px-3 py-2.5 text-sm text-white/55 transition hover:bg-white/6 hover:text-white">{children}</Link>;
}

function NavLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: typeof House;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${active ? "bg-white/8 text-white" : "text-white/55 hover:text-white"}`}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}
function DisabledNav({ children }: { children: React.ReactNode }) {
  return (
    <span className="cursor-not-allowed rounded-xl px-4 py-2 text-sm text-white/35">
      {children}
    </span>
  );
}
function MobileLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: typeof House;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[10px] ${active ? "bg-white/7 text-white" : "text-white/45"}`}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}
