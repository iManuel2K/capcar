"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpenCheck,
  Bot,
  CarFront,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Database,
  FileBadge2,
  Gauge,
  Heart,
  House,
  Layers3,
  MapPinned,
  Plus,
  SearchCheck,
  Settings2,
  ShieldQuestion,
  ShoppingBag,
  Stethoscope,
  UserCircle,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { LanguageSelector } from "@/components/i18n/language-selector";

type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function GarageSidebar({
  pathname,
  vehicleId,
  vehicleLabel,
  vehicleMeta,
  unread,
  onNavigate,
  onClose,
}: {
  pathname: string;
  vehicleId?: string;
  vehicleLabel?: string;
  vehicleMeta?: string;
  unread: number;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const t = useTranslations("GarageNav");
  const coreItems: SidebarItem[] = vehicleId
    ? [
        {
          href: `/garage/${vehicleId}`,
          label: t("overview"),
          icon: Gauge,
          exact: true,
        },
        {
          href: `/garage/${vehicleId}/builds`,
          label: t("builds"),
          icon: Layers3,
        },
        {
          href: `/garage/${vehicleId}/parts`,
          label: t("parts"),
          icon: ShoppingBag,
        },
        {
          href: `/garage/${vehicleId}/maintenance`,
          label: t("maintenance"),
          icon: Wrench,
        },
        {
          href: `/garage/${vehicleId}/passport`,
          label: t("passport"),
          icon: FileBadge2,
        },
      ]
    : [];
  const moreItems: SidebarItem[] = vehicleId
    ? [
        {
          href: `/garage/${vehicleId}/wishlist`,
          label: t("wishlist"),
          icon: Heart,
        },
        {
          href: `/garage/${vehicleId}/costs`,
          label: t("costs"),
          icon: CircleDollarSign,
        },
        {
          href: `/garage/${vehicleId}/diagnostics`,
          label: t("diagnostics"),
          icon: Stethoscope,
        },
        {
          href: `/garage/${vehicleId}/timeline`,
          label: t("timeline"),
          icon: Clock3,
        },
        {
          href: `/garage/${vehicleId}/guides`,
          label: t("guides"),
          icon: BookOpenCheck,
        },
        {
          href: `/garage/${vehicleId}/known-problems`,
          label: t("knownProblems"),
          icon: ShieldQuestion,
        },
        {
          href: `/garage/${vehicleId}/tuning`,
          label: t("tuning"),
          icon: Settings2,
        },
        {
          href: `/garage/${vehicleId}/copilot`,
          label: t("copilot"),
          icon: Bot,
        },
        {
          href: `/garage/${vehicleId}/specialists`,
          label: t("specialists"),
          icon: SearchCheck,
        },
        {
          href: `/garage/${vehicleId}/data-sources`,
          label: t("dataSources"),
          icon: Database,
        },
      ]
    : [];
  const moreActive = moreItems.some((item) => isActive(pathname, item));

  return (
    <div className="capcar-editorial-grid bg-background text-foreground flex h-full min-h-0 flex-col">
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-white/7 px-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <CapcarWordmark />
        </Link>
        {onClose ? (
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground grid size-11 place-items-center rounded-xl border border-white/8 transition hover:bg-white/6"
          >
            <X className="size-4" />
          </button>
        ) : (
          <span className="border-primary/25 bg-primary/12 text-primary rounded-full border px-2 py-1 text-xs font-semibold tracking-[0.08em] uppercase">
            {t("beta")}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/garage"
          onClick={onNavigate}
          aria-current={pathname === "/garage" ? "page" : undefined}
          className="hover:text-foreground mb-3 flex min-h-11 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 text-sm text-white/62 transition hover:bg-white/6"
        >
          <House className="size-4" />
          <span>{t("garage")}</span>
        </Link>

        {vehicleId ? (
          <div className="mb-5 rounded-2xl border border-white/9 bg-white/[0.035] p-3 shadow-[0_12px_32px_rgba(0,0,0,.12)]">
            <div className="flex items-center gap-3">
              <span className="bg-primary/14 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                <CarFront className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words text-white/88">
                  {vehicleLabel ?? t("activeVehicle")}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs break-words">
                  {vehicleMeta ?? t("vehicleWorkspace")}
                </p>
              </div>
            </div>
            <Link
              href="/garage/new"
              onClick={onNavigate}
              className="text-muted-foreground hover:text-foreground mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/8 text-xs font-semibold transition hover:bg-white/5"
            >
              <Plus className="size-3.5" /> {t("add")}
            </Link>
          </div>
        ) : (
          <Link
            href="/garage/new"
            onClick={onNavigate}
            className="bg-primary text-primary-foreground hover:bg-primary mb-5 flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-[0_10px_26px_rgba(184,199,217,.22)] transition hover:-translate-y-0.5"
          >
            <Plus className="size-4" /> {t("add")}
          </Link>
        )}

        {vehicleId && (
          <>
            <p className="text-muted-foreground px-3 pb-2 text-xs font-semibold tracking-[0.16em] uppercase">
              {t("core")}
            </p>
            <nav aria-label={t("vehicleNavigation")} className="grid gap-1">
              {coreItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item)}
                  onNavigate={onNavigate}
                />
              ))}
            </nav>

            <details
              key={moreActive ? pathname : "garage-more-tools"}
              open={moreActive || undefined}
              className="group mt-3"
            >
              <summary className="text-muted-foreground flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-3 text-xs font-semibold transition hover:bg-white/5 hover:text-white/70 [&::-webkit-details-marker]:hidden">
                <span>{t("more")}</span>
                <ChevronDown className="size-3.5 transition group-open:rotate-180" />
              </summary>
              <nav
                aria-label={t("more")}
                className="mt-1 grid gap-1 border-l border-white/8 pl-2"
              >
                {moreItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item)}
                    onNavigate={onNavigate}
                  />
                ))}
              </nav>
            </details>
          </>
        )}

        <div className="mt-5 border-t border-white/7 pt-4">
          <p className="text-muted-foreground px-3 pb-2 text-xs font-semibold tracking-[0.16em] uppercase">
            {t("explore")}
          </p>
          <SidebarLink
            item={{ href: "/roadbook", label: t("roadbook"), icon: MapPinned }}
            active={pathname === "/roadbook"}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/7 p-3">
        <div className="grid grid-cols-2 gap-1">
          <UtilityLink
            href="/notifications"
            icon={Bell}
            label={t("notificationsShort")}
            accessibleLabel={t("notifications", { count: unread })}
            badge={unread}
            onNavigate={onNavigate}
          />
          <UtilityLink
            href="/account"
            icon={UserCircle}
            label={t("accountShort")}
            onNavigate={onNavigate}
          />
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl border border-white/7 px-3 py-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.1em] uppercase">
            {t("language")}
          </span>
          <LanguageSelector compact direction="up" align="end" />
        </div>
      </div>
    </div>
  );
}

function isActive(pathname: string, item: SidebarItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: SidebarItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "text-foreground bg-white/[0.075]" : "text-muted-foreground hover:bg-white/[0.045] hover:text-white/82"}`}
    >
      {active && (
        <span className="bg-primary text-primary-foreground absolute top-2 bottom-2 left-0 w-0.5 rounded-full" />
      )}
      <Icon
        aria-hidden="true"
        className={`size-4 shrink-0 transition ${active ? "text-primary" : "text-muted-foreground group-hover:text-white/65"}`}
      />
      <span className="min-w-0 leading-5 break-words">{item.label}</span>
    </Link>
  );
}

function UtilityLink({
  href,
  icon: Icon,
  label,
  accessibleLabel,
  badge = 0,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  accessibleLabel?: string;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={accessibleLabel}
      className="text-muted-foreground hover:text-foreground relative flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition hover:bg-white/5"
    >
      <Icon aria-hidden="true" className="size-4" /> {label}
      {badge > 0 && (
        <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full px-1 text-xs">
          {Math.min(badge, 9)}
          {badge > 9 ? "+" : ""}
        </span>
      )}
    </Link>
  );
}
