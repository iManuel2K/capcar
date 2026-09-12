"use client";

import {
  CalendarCheck,
  CarFront,
  IdCard,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useLocale, useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import type { VehiclePassportPayload } from "@/features/passport/vehicle-passport";

export function PassportIdentityDocument({
  passport,
  liveUrl,
}: {
  passport: VehiclePassportPayload;
  liveUrl?: string;
}) {
  const t = useTranslations("PublicPassport");
  const locale = useLocale();
  const title = `${passport.vehicle.productionYear} ${passport.vehicle.make} ${passport.vehicle.model}`;
  const vin =
    passport.vehicle.vin ??
    (passport.vehicle.vinLastFive
      ? `••••••••••••${passport.vehicle.vinLastFive}`
      : t("notRecorded"));
  return (
    <section className="passport-document print-surface mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#f2efe5] text-[#102c2d] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 sm:p-9 lg:p-10">
          <div className="flex items-center justify-between gap-5 border-b border-[#102c2d]/12 pb-5">
            <CapcarWordmark glow={false} />
            <span className="rounded-full border border-[#6d0101]/18 bg-[#6d0101]/6 px-3 py-1 text-[9px] font-bold tracking-[0.16em] text-[#6d0101] uppercase">
              {t("vehicleRecord")}
            </span>
          </div>
          <p className="mt-8 text-[10px] font-bold tracking-[0.18em] text-[#6d0101] uppercase">
            {t("digitalPassport")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            {title}
          </h2>
          <p className="mt-3 text-sm text-[#102c2d]/60">
            {passport.vehicle.platform} · {passport.vehicle.engineCode} ·{" "}
            {passport.vehicle.transmission}
          </p>

          <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <DataPoint
              icon={IdCard}
              label={t("vehicleIdentification")}
              value={vin}
              mono
            />
            <DataPoint
              icon={CarFront}
              label={t("recordedMileage")}
              value={`${passport.vehicle.mileage.toLocaleString(locale)} km`}
            />
            <DataPoint
              icon={CalendarCheck}
              label={t("nextInspection")}
              value={
                passport.official?.nextInspectionDate
                  ? new Date(
                      `${passport.official.nextInspectionDate}T12:00:00`,
                    ).toLocaleDateString(locale)
                  : t("notRecorded")
              }
            />
            <DataPoint
              icon={ShieldCheck}
              label={t("insurance")}
              value={passport.official?.insuranceCompany ?? t("notRecorded")}
              detail={passport.official?.insurancePolicyNumber}
            />
          </div>

          {passport.owner ? (
            <div className="mt-8 grid gap-4 rounded-2xl border border-[#102c2d]/12 bg-white/38 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-[#102c2d]/45 uppercase">
                  {t("ownerInformation")}
                </p>
                <p className="mt-2 font-semibold">{passport.owner.name}</p>
                <p className="mt-2 flex items-start gap-2 text-xs leading-5 whitespace-pre-line text-[#102c2d]/60">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {passport.owner.address}
                </p>
              </div>
              <p className="flex items-center gap-2 text-xs text-[#102c2d]/60">
                <Phone className="size-3.5" />
                {passport.owner.phone}
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#102c2d]/18 p-4 text-xs text-[#102c2d]/50">
              {t("ownerPrivate")}
            </div>
          )}
        </div>

        <div className="relative min-h-[330px] overflow-hidden bg-[#102c2d] lg:min-h-full">
          {passport.vehicle.imageUrl ? (
            <Image
              src={passport.vehicle.imageUrl}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_45%,rgba(231,45,69,0.28),transparent_34%),#102c2d]">
              <CarFront className="size-24 text-white/16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071414] via-transparent to-[#071414]/25" />
          <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4">
            <div className="text-white">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/55 uppercase">
                {t("liveVerification")}
              </p>
              <p className="mt-1 text-xs text-white/75">{t("scanRecord")}</p>
            </div>
            <div className="grid size-29 shrink-0 place-items-center rounded-xl bg-white p-2 shadow-xl">
              {liveUrl ? (
                <QRCodeSVG
                  value={liveUrl}
                  size={96}
                  level="M"
                  marginSize={1}
                  title={t("qrTitle")}
                />
              ) : (
                <span className="px-2 text-center text-[9px] leading-4 text-[#102c2d]/55">
                  {t("publishQr")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-2 border-t border-[#102c2d]/12 px-6 py-4 text-[10px] text-[#102c2d]/48 sm:flex-row sm:px-9">
        <span>
          {t("generated", {
            date: new Date(passport.generatedAt).toLocaleDateString(locale),
          })}
        </span>
        <span>{t("verifyCritical")}</span>
      </div>
    </section>
  );
}

function DataPoint({
  icon: Icon,
  label,
  value,
  detail,
  mono = false,
}: {
  icon: typeof IdCard;
  label: string;
  value: string;
  detail?: string;
  mono?: boolean;
}) {
  const t = useTranslations("PublicPassport");
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#102c2d]/7 text-[#6d0101]">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[9px] font-bold tracking-[0.12em] text-[#102c2d]/42 uppercase">
          {label}
        </p>
        <p className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
        {detail && (
          <p className="mt-1 font-mono text-[10px] text-[#102c2d]/50">
            {t("policy", { number: detail })}
          </p>
        )}
      </div>
    </div>
  );
}
