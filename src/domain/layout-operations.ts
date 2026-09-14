import type { EventObject, EventObjectType, FloorplanLayout } from "@/domain/floorplan";
import { isGuestTable, OBJECT_DEFINITIONS } from "@/domain/object-catalog";

const now = () => new Date().toISOString();

export function createEmptyLayout(venueTemplateId = "unconfigured-physical-venue"): FloorplanLayout {
  return {
    id: "local-floorplan",
    name: "Miller–Reed Wedding",
    venueTemplateId,
    coordinateUnit: "inches",
    objects: [],
    updatedAt: now(),
  };
}

export function createEventObject(
  type: EventObjectType,
  position: { x: number; y: number },
  existing: EventObject[] = [],
  id = crypto.randomUUID(),
): EventObject {
  const definition = OBJECT_DEFINITIONS[type];
  const tableNumber = isGuestTable(type)
    ? Math.max(0, ...existing.filter((item) => isGuestTable(item.type)).map((item) => item.tableNumber ?? 0)) + 1
    : undefined;

  return {
    id,
    type,
    x: position.x,
    y: position.y,
    width: definition.width,
    height: definition.height,
    physicalDimensions: definition.physicalDimensions,
    rotation: 0,
    label: isGuestTable(type) ? `Table ${tableNumber}` : definition.shortLabel,
    tableNumber,
    seats: definition.defaultSeats,
    zIndex: existing.length,
  };
}

export function addObject(layout: FloorplanLayout, object: EventObject): FloorplanLayout {
  return touch(layout, [...layout.objects, object]);
}

export function updateObject(layout: FloorplanLayout, id: string, patch: Partial<EventObject>): FloorplanLayout {
  return touch(layout, layout.objects.map((object) => (object.id === id ? { ...object, ...patch, id } : object)));
}

export function deleteObject(layout: FloorplanLayout, id: string): FloorplanLayout {
  return touch(layout, layout.objects.filter((object) => object.id !== id));
}

export function duplicateObject(layout: FloorplanLayout, id: string, newId = crypto.randomUUID()): FloorplanLayout {
  const source = layout.objects.find((object) => object.id === id);
  if (!source) return layout;
  const nextTableNumber = isGuestTable(source.type)
    ? Math.max(0, ...layout.objects.filter((object) => isGuestTable(object.type)).map((object) => object.tableNumber ?? 0)) + 1
    : undefined;
  const copy: EventObject = {
    ...source,
    id: newId,
    x: source.x + 24,
    y: source.y + 24,
    zIndex: layout.objects.length,
    label: nextTableNumber ? `Table ${nextTableNumber}` : source.label.endsWith(" copy") ? source.label : `${source.label} copy`,
    tableNumber: nextTableNumber ?? source.tableNumber,
  };
  return touch(layout, [...layout.objects, copy]);
}

export function reorderObject(layout: FloorplanLayout, id: string, direction: "forward" | "backward"): FloorplanLayout {
  const ordered = [...layout.objects].sort((a, b) => a.zIndex - b.zIndex);
  const index = ordered.findIndex((object) => object.id === id);
  const swapWith = direction === "forward" ? index + 1 : index - 1;
  if (index < 0 || swapWith < 0 || swapWith >= ordered.length) return layout;
  [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];
  return touch(layout, ordered.map((object, zIndex) => ({ ...object, zIndex })));
}

export function getLayoutStats(layout: FloorplanLayout) {
  return layout.objects.reduce(
    (stats, object) => {
      if (isGuestTable(object.type)) {
        stats.guestTables += 1;
        stats.seats += object.seats ?? 0;
      }
      return stats;
    },
    { objectCount: layout.objects.length, guestTables: 0, seats: 0 },
  );
}

function touch(layout: FloorplanLayout, objects: EventObject[]): FloorplanLayout {
  return { ...layout, objects, updatedAt: now() };
}
