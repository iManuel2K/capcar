"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import Link from "@/components/i18n/public-link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackAnalytics } from "@/features/analytics/client";
import type {
  RetailItem,
  RetailRequest,
} from "@/features/retail/retail-contracts";
import { saveRetailItem } from "@/features/retail/save-retail-item";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  bodyStyles,
  minimumProductionYear,
  type Vehicle,
  vehicleInputSchema,
} from "@/features/vehicles/vehicle-schema";
import {
  announceVehicleChange,
  findVehicle,
  saveVehicle,
} from "@/features/vehicles/vehicle-storage";
import { announceWishlistChange } from "@/features/wishlist/wishlist-storage";
import { actionClass, fieldClass } from "./community-shell";

type SearchVehicle = RetailRequest["vehicle"];

function sameSearchVehicle(vehicle: Vehicle, searchVehicle: SearchVehicle) {
  return Boolean(
    searchVehicle &&
    vehicle.make === searchVehicle.make &&
    vehicle.model === searchVehicle.model &&
    vehicle.productionYear === searchVehicle.productionYear &&
    vehicle.platform === searchVehicle.platform &&
    vehicle.bodyStyle === searchVehicle.bodyStyle &&
    vehicle.engineCode === searchVehicle.engineCode &&
    vehicle.transmission === searchVehicle.transmission,
  );
}

function vehicleName(vehicle: Vehicle) {
  const identity = `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`;
  return vehicle.nickname ? `${identity} · ${vehicle.nickname}` : identity;
}

const primaryClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50";

export function RetailSaveDialog({
  item,
  checkedAt,
  searchVehicle,
  onClose,
}: {
  item: RetailItem;
  checkedAt: string;
  searchVehicle?: SearchVehicle;
  onClose: () => void;
}) {
  const t = useTranslations("RetailSave");
  const locale = useLocale();
  const selectId = useId();
  const confirmationRef = useRef<HTMLParagraphElement>(null);
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState(
    () =>
      vehicles.find((vehicle) => sameSearchVehicle(vehicle, searchVehicle))
        ?.id ?? (vehicles.length === 1 ? vehicles[0].id : ""),
  );
  const [creating, setCreating] = useState(false);
  const [savedVehicle, setSavedVehicle] = useState<Vehicle>();
  const [saveError, setSaveError] = useState(false);
  const selected = vehicles.find((vehicle) => vehicle.id === vehicleId);
  const match =
    selected && sameSearchVehicle(selected, searchVehicle)
      ? item.vehicleMatch
      : undefined;
  const status = match?.status ?? "unverified";
  const mismatchFields = match?.mismatchedAxes.map((axis) => t(`axes.${axis}`));
  const mismatchList = mismatchFields?.length
    ? new Intl.ListFormat(locale).format(mismatchFields)
    : "";
  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: item.currency,
  }).format(item.price);

  useEffect(() => {
    if (savedVehicle) confirmationRef.current?.focus();
  }, [savedVehicle]);

  function save() {
    if (!selected) return;
    try {
      const storage = window.localStorage;
      const currentVehicle = findVehicle(selected.id, storage);
      if (!currentVehicle) throw new Error("Vehicle not found");
      saveRetailItem(item, currentVehicle.id, checkedAt, storage);
      announceWishlistChange();
      setSavedVehicle(currentVehicle);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:max-w-lg sm:p-6"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {savedVehicle ? t("savedTitle") : t("title")}
          </DialogTitle>
          <DialogDescription>
            {savedVehicle
              ? t("savedDescription", { vehicle: vehicleName(savedVehicle) })
              : t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="border-foreground/12 bg-card min-w-0 rounded-xl border p-3">
          <p className="font-medium wrap-anywhere">{item.title}</p>
          <p className="text-muted-foreground mt-1 text-sm wrap-anywhere">
            {item.retailer ? `${item.retailer} · ${price}` : price}
          </p>
        </div>

        {savedVehicle ? (
          <>
            <p
              ref={confirmationRef}
              role="status"
              tabIndex={-1}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              {t("savedStatus")}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <DialogClose className={actionClass}>{t("done")}</DialogClose>
              <Link
                className={primaryClass}
                href={`/garage/${savedVehicle.id}/wishlist`}
              >
                {t("viewWishlist")}
              </Link>
            </div>
          </>
        ) : creating ? (
          <NewVehicleForm
            onBack={() => setCreating(false)}
            onCreated={(vehicle) => {
              setVehicleId(vehicle.id);
              setSaveError(false);
              setCreating(false);
            }}
          />
        ) : (
          <>
            {vehicles.length ? (
              <div>
                <label className="font-medium" htmlFor={selectId}>
                  {t("vehicle")}
                </label>
                <select
                  id={selectId}
                  className={fieldClass}
                  value={selected ? selected.id : ""}
                  onChange={(event) => {
                    setVehicleId(event.target.value);
                    setSaveError(false);
                  }}
                >
                  <option value="">{t("chooseVehicle")}</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicleName(vehicle)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {vehicles.length > 0 && (
              <button
                type="button"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-1 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                onClick={() => setCreating(true)}
              >
                <Plus className="size-4" aria-hidden="true" />
                {t("addVehicle")}
              </button>
            )}

            {selected && (
              <div
                className="border-foreground/12 rounded-xl border p-3"
                aria-live="polite"
              >
                <p className="font-semibold">{t(`fitment.${status}.title`)}</p>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  {t(`fitment.${status}.description`)}
                </p>
                {status === "mismatch" && mismatchList && (
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    {t("mismatchDetails", { fields: mismatchList })}
                  </p>
                )}
              </div>
            )}

            {saveError && (
              <p role="alert" className="text-destructive">
                {t("saveError")}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <DialogClose className={actionClass}>{t("cancel")}</DialogClose>
              {vehicles.length ? (
                <button
                  type="button"
                  className={primaryClass}
                  disabled={!selected}
                  onClick={save}
                >
                  {t("save")}
                </button>
              ) : (
                <button
                  type="button"
                  className={primaryClass}
                  onClick={() => setCreating(true)}
                >
                  {t("addVehicle")}
                </button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewVehicleForm({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (vehicle: Vehicle) => void;
}) {
  const t = useTranslations("RetailSave");
  const [error, setError] = useState<"invalidVehicle" | "createError">();
  const makeRef = useRef<HTMLInputElement>(null);

  useEffect(() => makeRef.current?.focus(), []);

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    const input = vehicleInputSchema.safeParse({
      make: value("make"),
      model: value("model"),
      productionYear: value("productionYear"),
      platform: value("platform") || "UNKNOWN",
      engineCode: value("engineCode") || "UNKNOWN",
      bodyStyle: value("bodyStyle") || "Unknown",
      transmission: "Unknown",
      mileage: 0,
      mileageKnown: false,
    });
    if (!input.success) {
      setError("invalidVehicle");
      return;
    }
    try {
      const vehicle = saveVehicle(input.data, window.localStorage);
      announceVehicleChange();
      trackAnalytics("vehicle_added");
      onCreated(vehicle);
    } catch {
      setError("createError");
    }
  }

  return (
    <form
      className="grid gap-3"
      onChange={() => error && setError(undefined)}
      onSubmit={create}
    >
      <h3 className="font-semibold">{t("addVehicle")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          {t("make")}
          <input
            ref={makeRef}
            name="make"
            className={fieldClass}
            required
            minLength={2}
            maxLength={40}
          />
        </label>
        <label>
          {t("model")}
          <input name="model" className={fieldClass} required maxLength={40} />
        </label>
        <label>
          {t("productionYear")}
          <input
            name="productionYear"
            className={fieldClass}
            type="number"
            inputMode="numeric"
            required
            min={minimumProductionYear}
            max={2027}
          />
        </label>
      </div>
      <details className="border-foreground/12 rounded-xl border px-3">
        <summary className="min-h-11 cursor-pointer py-3 font-medium">
          {t("optionalDetails")}
        </summary>
        <div className="grid gap-3 pb-3 sm:grid-cols-2">
          <label>
            {t("platform")}
            <input
              name="platform"
              className={fieldClass}
              minLength={2}
              maxLength={12}
            />
          </label>
          <label>
            {t("engineCode")}
            <input
              name="engineCode"
              className={fieldClass}
              minLength={2}
              maxLength={20}
            />
          </label>
          <label>
            {t("bodyStyle")}
            <select
              name="bodyStyle"
              className={fieldClass}
              defaultValue="Unknown"
            >
              {bodyStyles.map((bodyStyle) => (
                <option key={bodyStyle} value={bodyStyle}>
                  {t(`bodyStyles.${bodyStyle}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>
      {error && (
        <p role="alert" className="text-destructive">
          {t(error)}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={actionClass} onClick={onBack}>
          {t("back")}
        </button>
        <button type="submit" className={primaryClass}>
          {t("createVehicle")}
        </button>
      </div>
    </form>
  );
}
