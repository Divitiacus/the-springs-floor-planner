import type { ServicePlan } from "@/domain/service-markers";
import { DEFAULT_SEAT_COLOR, NO_ALCOHOL_COLOR } from "@/domain/service-markers";

const RSVP_GOLD = "#b47a12";

type Props = {
  plan: ServicePlan;
  compact?: boolean;
};

export function ServiceLegend({ plan, compact = false }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${compact ? "text-[10px]" : "text-[11px]"}`} aria-label="Service marker legend">
      <span className="font-bold uppercase tracking-[0.12em] text-[#7c8981]">Seat markers</span>
      <LegendItem color={DEFAULT_SEAT_COLOR} glow={RSVP_GOLD} label="RSVP received" />
      {plan.defaultLabel ? <LegendItem color={DEFAULT_SEAT_COLOR} label={`${plan.defaultLabel} (default)`} /> : null}
      {plan.markers.map((marker) => <LegendItem key={marker.key} color={marker.color} label={marker.label} />)}
      {plan.hasNoAlcohol ? <LegendItem color="#fffefa" outline={NO_ALCOHOL_COLOR} label="Under 21 / no alcohol" /> : null}
    </div>
  );
}

function LegendItem({ color, label, outline, glow }: { color: string; label: string; outline?: string; glow?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-[#4c5d53]">
      <span className="size-3 rounded-full border" style={{ backgroundColor: color, borderColor: outline ?? color, boxShadow: glow ? `0 0 0 2px ${glow}, 0 0 6px ${glow}` : undefined }} aria-hidden="true" />
      {label}
    </span>
  );
}
