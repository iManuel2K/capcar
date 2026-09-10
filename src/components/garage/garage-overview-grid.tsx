export type GarageOverviewData = {
  name: string;
  specs: string;
  mileage: number;
  budget: number;
  plannedCost: number;
  nextAction: string;
  serviceDue: string;
  serviceUrgent: boolean;
  demo?: boolean;
};
const number = new Intl.NumberFormat("en-GB");
const euro = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function GarageOverviewGrid({ data }: { data: GarageOverviewData }) {
  const budget = Math.max(0, data.budget);
  const planned = Math.max(0, data.plannedCost);
  const percentage = budget > 0 ? Math.min(100, (planned / budget) * 100) : 0;
  const over = budget > 0 && planned > budget;
  return (
    <section
      aria-label={`${data.name} overview`}
      className="rounded-2xl bg-[#0e1918] p-5 text-[#f3efdf] sm:p-6"
    >
      <h2 className="text-2xl font-medium tracking-tight">{data.name}</h2>
      <p className="mt-2 text-sm text-white/65">{data.specs}</p>
      {data.demo && (
        <p className="mt-2 text-xs text-amber-200">
          Demo vehicle · sample records
        </p>
      )}
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-white/65">Odometer</dt>
          <dd className="mt-1 text-xl font-medium">
            {number.format(data.mileage)} km
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/65">Build budget · planned cost</dt>
          <dd className="mt-1 font-medium">
            {budget
              ? `${euro.format(planned)} / ${euro.format(budget)}`
              : "Set a build budget"}
            {budget > 0 && (
              <>
                <progress
                  aria-label="Planned build cost against budget"
                  aria-valuetext={`${euro.format(planned)} planned against ${euro.format(budget)}`}
                  max={100}
                  value={percentage}
                  className={`mt-3 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:rounded-full ${over ? "[&::-moz-progress-bar]:bg-[#e8b45d] [&::-webkit-progress-value]:bg-[#e8b45d]" : "[&::-moz-progress-bar]:bg-[#88b6a0] [&::-webkit-progress-value]:bg-[#88b6a0]"}`}
                />
                <p
                  className={`mt-1 text-xs ${over ? "text-amber-200" : "text-white/65"}`}
                >
                  {over
                    ? `${euro.format(planned - budget)} over budget`
                    : `${euro.format(budget - planned)} available`}
                </p>
              </>
            )}
          </dd>
        </div>
        <div className="border-t border-white/10 pt-4 sm:col-span-2">
          <dt className="text-xs text-white/65">Next workshop task</dt>
          <dd className="mt-1 font-medium">
            {data.nextAction}
            <p
              className={`mt-1 text-sm ${data.serviceUrgent ? "text-amber-200" : "text-white/65"}`}
            >
              {data.serviceDue}
            </p>
          </dd>
        </div>
      </dl>
    </section>
  );
}
