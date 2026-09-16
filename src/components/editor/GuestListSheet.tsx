"use client";

import { useMemo } from "react";
import { ClipboardList, Users } from "lucide-react";
import type { EventObject } from "@/domain/floorplan";
import type { ServicePlan } from "@/domain/service-markers";
import { DEFAULT_SEAT_COLOR, getSeatServiceColor, NO_ALCOHOL_COLOR } from "@/domain/service-markers";
import { ServiceLegend } from "@/components/editor/ServiceLegend";

type GuestPatch = { name?: string; meal?: string; role?: string; noAlcohol?: boolean };

type Props = {
  objects: readonly EventObject[];
  servicePlan: ServicePlan;
  onUpdateGuest: (objectId: string, seatIndex: number, patch: GuestPatch) => void;
};

type GuestRow = {
  objectId: string;
  seatIndex: number;
  displaySeatNumber: number;
  tableNumber?: number;
  tableLabel: string;
  name: string;
  meal: string;
  role: string;
  noAlcohol: boolean;
  serviceColor?: string;
  sortOrder: number;
};

export function GuestListSheet({ objects, servicePlan, onUpdateGuest }: Props) {
  const rows = useMemo(() => buildGuestRows(objects, servicePlan), [objects, servicePlan]);
  const namedGuests = rows.filter((row) => row.name.trim()).length;
  const noAlcoholGuests = rows.filter((row) => row.noAlcohol).length;

  return (
    <section className="guest-list-sheet flex min-h-0 flex-1 flex-col bg-[#f7f6f1]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#dce2dd] bg-[#fffefa] px-7 py-5">
        <div>
          <div className="flex items-center gap-2 text-[#294f3d]">
            <ClipboardList size={20} />
            <h2 className="font-serif text-2xl font-semibold">Guest List</h2>
          </div>
          <p className="mt-1 text-xs text-[#748078]">Keep the common service blank or repeated. Exceptions receive consistent colors automatically.</p>
        </div>
        <div className="flex gap-2">
          <SummaryBadge label="Seats" value={rows.length} />
          <SummaryBadge label="Named" value={namedGuests} />
          <SummaryBadge label="No alcohol" value={noAlcoholGuests} />
        </div>
      </header>

      {servicePlan.defaultLabel || servicePlan.markers.length || servicePlan.hasNoAlcohol ? (
        <div className="shrink-0 border-b border-[#dce2dd] bg-white px-7 py-3">
          <ServiceLegend plan={servicePlan} />
        </div>
      ) : null}

      <div className="subtle-scrollbar min-h-0 flex-1 overflow-auto p-6">
        {rows.length ? (
          <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[#d8dfda] bg-white shadow-sm">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#eaf0ec] text-[10px] font-bold uppercase tracking-[0.13em] text-[#53675b] shadow-[0_1px_0_#ccd6cf]">
                <tr>
                  <th className="w-[15%] px-4 py-3">Table / seat</th>
                  <th className="w-[24%] border-l border-[#d5ddd7] px-4 py-3">Guest name</th>
                  <th className="w-[25%] border-l border-[#d5ddd7] px-4 py-3">Service note</th>
                  <th className="w-[23%] border-l border-[#d5ddd7] px-4 py-3">Role / group</th>
                  <th className="w-[13%] border-l border-[#d5ddd7] px-3 py-3 text-center">Under 21 / no alcohol</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`${row.objectId}:${row.seatIndex}`} className={rowIndex % 2 ? "bg-[#fbfcfa]" : "bg-white"}>
                    <td className="border-t border-[#e2e7e3] px-4 py-2.5 align-middle">
                      <span className="block text-sm font-bold text-[#31473b]">{row.tableNumber ? `Table ${row.tableNumber}` : row.tableLabel}</span>
                      <span className="mt-0.5 block text-[10px] text-[#8a958e]">Seat {row.displaySeatNumber}</span>
                    </td>
                    <GuestCell
                      ariaLabel={`${row.tableLabel}, seat ${row.displaySeatNumber}, guest name`}
                      placeholder="Guest name"
                      value={row.name}
                      onChange={(value) => onUpdateGuest(row.objectId, row.seatIndex, { name: value })}
                    />
                    <ServiceCell
                      ariaLabel={`${row.tableLabel}, seat ${row.displaySeatNumber}, service note`}
                      color={row.serviceColor}
                      isDefault={Boolean(row.meal.trim() && !row.serviceColor)}
                      value={row.meal}
                      onChange={(value) => onUpdateGuest(row.objectId, row.seatIndex, { meal: value })}
                    />
                    <GuestCell
                      ariaLabel={`${row.tableLabel}, seat ${row.displaySeatNumber}, role or group`}
                      placeholder="e.g. Mother of bride, Sales team"
                      value={row.role}
                      onChange={(value) => onUpdateGuest(row.objectId, row.seatIndex, { role: value })}
                    />
                    <td className="border-l border-t border-[#e2e7e3] px-3 text-center">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-bold text-[#527180] hover:bg-[#edf7fa]">
                        <input
                          type="checkbox"
                          aria-label={`${row.tableLabel}, seat ${row.displaySeatNumber}, under 21 or no alcohol`}
                          className="size-4 accent-[#4198b5]"
                          checked={row.noAlcohol}
                          onChange={(event) => onUpdateGuest(row.objectId, row.seatIndex, { noAlcohol: event.target.checked })}
                        />
                        <span className="size-3 rounded-full border-2 bg-white" style={{ borderColor: NO_ALCOHOL_COLOR }} aria-hidden="true" />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mx-auto grid min-h-80 max-w-2xl place-items-center rounded-2xl border border-dashed border-[#cfd8d1] bg-white/70 p-10 text-center">
            <div>
              <Users className="mx-auto text-[#8da095]" size={34} />
              <h3 className="mt-4 font-serif text-xl font-semibold text-[#30463a]">No guest seats yet</h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#77847c]">Return to the floor plan and add a guest table or single chair. Its available seats will appear here automatically.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ServiceCell({ ariaLabel, color, isDefault, value, onChange }: {
  ariaLabel: string;
  color?: string;
  isDefault: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <td className="border-l border-t border-[#e2e7e3] p-1.5">
      <div className="flex items-center gap-1.5">
        <span
          className="size-3 shrink-0 rounded-full border"
          style={{ backgroundColor: color ?? DEFAULT_SEAT_COLOR, borderColor: color ?? DEFAULT_SEAT_COLOR }}
          title={isDefault ? "Default service" : value.trim() ? "Service exception" : "No service note"}
          aria-hidden="true"
        />
        <input
          aria-label={ariaLabel}
          className="h-10 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2.5 text-sm text-[#2c3f35] outline-none placeholder:text-[#adb5b0] hover:border-[#d5ddd7] hover:bg-white focus:border-[#6f8d7a] focus:bg-white focus:ring-2 focus:ring-[#8baa96]/20"
          maxLength={80}
          placeholder="Any service instruction"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </td>
  );
}

function GuestCell({ ariaLabel, placeholder, value, onChange }: {
  ariaLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <td className="border-l border-t border-[#e2e7e3] p-1.5">
      <input
        aria-label={ariaLabel}
        className="h-10 w-full rounded-md border border-transparent bg-transparent px-2.5 text-sm text-[#2c3f35] outline-none placeholder:text-[#adb5b0] hover:border-[#d5ddd7] hover:bg-white focus:border-[#6f8d7a] focus:bg-white focus:ring-2 focus:ring-[#8baa96]/20"
        maxLength={80}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </td>
  );
}

function SummaryBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-lg border border-[#dbe2dc] bg-[#f5f8f5] px-3 py-2 text-right">
      <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#819087]">{label}</span>
      <span className="mt-0.5 block text-lg font-bold leading-none text-[#355142]">{value}</span>
    </div>
  );
}

function buildGuestRows(objects: readonly EventObject[], servicePlan: ServicePlan): GuestRow[] {
  const linkedChairSeats = new Map<string, { tableNumber: number; firstSeatNumber: number }>();
  const groups = new Map<string, EventObject[]>();
  for (const object of objects) {
    if (!object.linkedGroupId) continue;
    const group = groups.get(object.linkedGroupId) ?? [];
    group.push(object);
    groups.set(object.linkedGroupId, group);
  }
  for (const group of groups.values()) {
    const tables = group.filter((object) => object.tableNumber).sort((first, second) => first.zIndex - second.zIndex);
    const chairs = group.filter((object) => object.type === "chair").sort((first, second) => first.zIndex - second.zIndex);
    const nextSeatByTable = new Map(tables.map((table) => [table.id, Math.max(0, Math.floor(table.seats ?? 0)) + 1]));
    for (const chair of chairs) {
      const table = tables.reduce<EventObject | undefined>((nearest, candidate) => {
        if (!nearest) return candidate;
        return distanceBetween(chair, candidate) < distanceBetween(chair, nearest) ? candidate : nearest;
      }, undefined);
      if (!table?.tableNumber) continue;
      const firstSeatNumber = nextSeatByTable.get(table.id) ?? 1;
      linkedChairSeats.set(chair.id, { tableNumber: table.tableNumber, firstSeatNumber });
      nextSeatByTable.set(table.id, firstSeatNumber + Math.max(0, Math.floor(chair.seats ?? 0)));
    }
  }

  return objects
    .flatMap((object) => {
      const seatCount = Math.max(0, Math.floor(object.seats ?? 0));
      const linkedChairSeat = linkedChairSeats.get(object.id);
      const tableNumber = object.tableNumber ?? linkedChairSeat?.tableNumber;
      const tableLabel = tableNumber ? `Table ${tableNumber}` : object.type === "chair" ? "Single chair" : object.label;
      return Array.from({ length: seatCount }, (_, seatIndex): GuestRow => ({
        objectId: object.id,
        seatIndex,
        displaySeatNumber: (linkedChairSeat?.firstSeatNumber ?? 1) + seatIndex,
        tableNumber,
        tableLabel,
        name: object.seatAssignments?.[seatIndex] ?? "",
        meal: object.seatMeals?.[seatIndex] ?? "",
        role: object.seatRoles?.[seatIndex] ?? "",
        noAlcohol: object.seatNoAlcohol?.[seatIndex] === true,
        serviceColor: getSeatServiceColor(object, seatIndex, servicePlan),
        sortOrder: tableNumber ?? 100000 + object.zIndex,
      }));
    })
    .sort((first, second) => first.sortOrder - second.sortOrder || first.displaySeatNumber - second.displaySeatNumber || first.objectId.localeCompare(second.objectId));
}

function distanceBetween(first: EventObject, second: EventObject) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
