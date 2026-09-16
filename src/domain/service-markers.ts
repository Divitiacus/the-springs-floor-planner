import type { EventObject } from "@/domain/floorplan";

export const NO_ALCOHOL_COLOR = "#67b7d1";
export const DEFAULT_SEAT_COLOR = "#9aa99f";

const SERVICE_COLORS = [
  "#d77a63",
  "#9a7db8",
  "#d3a43d",
  "#6e9f7b",
  "#c96f8a",
  "#4e9b91",
  "#b67b4f",
  "#858fbd",
] as const;

export type ServiceMarker = {
  key: string;
  label: string;
  color: string;
};

export type ServicePlan = {
  defaultKey?: string;
  defaultLabel?: string;
  markers: ServiceMarker[];
  colorByKey: Readonly<Record<string, string>>;
  hasNoAlcohol: boolean;
};

export function buildServicePlan(objects: readonly EventObject[]): ServicePlan {
  const counts = new Map<string, { count: number; label: string }>();
  let activeSeats = 0;
  let hasNoAlcohol = false;

  for (const object of objects) {
    const seatCount = Math.max(0, Math.floor(object.seats ?? 0));
    for (let seatIndex = 0; seatIndex < seatCount; seatIndex += 1) {
      const label = object.seatMeals?.[seatIndex]?.trim() ?? "";
      const guestName = object.seatAssignments?.[seatIndex]?.trim() ?? "";
      if (label || guestName) activeSeats += 1;
      const key = normalizeServiceKey(label);
      if (key) {
        const existing = counts.get(key);
        counts.set(key, { count: (existing?.count ?? 0) + 1, label: existing?.label ?? label });
      }
      if (object.seatNoAlcohol?.[seatIndex]) hasNoAlcohol = true;
    }
  }

  let defaultEntry: [string, { count: number; label: string }] | undefined;
  for (const entry of counts) {
    if (entry[1].count > activeSeats / 2 && (!defaultEntry || entry[1].count > defaultEntry[1].count)) {
      defaultEntry = entry;
    }
  }

  const serviceEntries = [...counts.entries()]
    .filter(([key]) => key !== defaultEntry?.[0])
    .sort(([first], [second]) => first.localeCompare(second));
  const markers = serviceEntries.map(([key, entry], index) => ({
    key,
    label: entry.label,
    color: SERVICE_COLORS[index % SERVICE_COLORS.length],
  }));

  return {
    defaultKey: defaultEntry?.[0],
    defaultLabel: defaultEntry?.[1].label,
    markers,
    colorByKey: Object.fromEntries(markers.map((marker) => [marker.key, marker.color])),
    hasNoAlcohol,
  };
}

export function getSeatServiceColor(object: EventObject, seatIndex: number, plan: ServicePlan) {
  const key = normalizeServiceKey(object.seatMeals?.[seatIndex] ?? "");
  return key ? plan.colorByKey[key] : undefined;
}

export function normalizeServiceKey(value: string) {
  return value.trim().toLocaleLowerCase();
}
