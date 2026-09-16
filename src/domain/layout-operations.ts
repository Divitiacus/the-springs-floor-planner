import type { EventObject, EventObjectType, EventObjectVariant, FloorplanLayout } from "@/domain/floorplan";
import { getObjectVariant, isGuestTable, OBJECT_DEFINITIONS } from "@/domain/object-catalog";

const now = () => new Date().toISOString();

export function createEmptyLayout(venueTemplateId = "unconfigured-physical-venue"): FloorplanLayout {
  return {
    id: "local-floorplan",
    name: "",
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
  variant?: EventObjectVariant,
): EventObject {
  const definition = OBJECT_DEFINITIONS[type];
  const variantDefinition = getObjectVariant(type, variant);
  const tableNumber = isGuestTable(type)
    ? Math.max(0, ...existing.filter((item) => isGuestTable(item.type)).map((item) => item.tableNumber ?? 0)) + 1
    : undefined;

  return {
    id,
    type,
    variant: variantDefinition?.id,
    x: position.x,
    y: position.y,
    width: variantDefinition?.width ?? definition.width,
    height: variantDefinition?.height ?? definition.height,
    physicalDimensions: variantDefinition?.physicalDimensions ?? definition.physicalDimensions,
    rotation: 0,
    label: isGuestTable(type) ? `Table ${tableNumber}` : variantDefinition?.shortLabel ?? definition.shortLabel,
    tableNumber,
    seats: definition.defaultSeats,
    zIndex: existing.length,
  };
}

export function addObject(layout: FloorplanLayout, object: EventObject): FloorplanLayout {
  return touch(layout, [...layout.objects, object]);
}

export function updateObject(layout: FloorplanLayout, id: string, patch: Partial<EventObject>): FloorplanLayout {
  const source = layout.objects.find((object) => object.id === id);
  if (!source) return layout;
  const deltaX = typeof patch.x === "number" ? patch.x - source.x : 0;
  const deltaY = typeof patch.y === "number" ? patch.y - source.y : 0;

  return touch(layout, layout.objects.map((object) => {
    if (object.id !== id) {
      return source.linkedGroupId && object.linkedGroupId === source.linkedGroupId && (deltaX || deltaY)
        ? { ...object, x: object.x + deltaX, y: object.y + deltaY }
        : object;
    }
    const allowedPatch = { ...patch };
    if (!OBJECT_DEFINITIONS[object.type].resizable) {
      delete allowedPatch.width;
      delete allowedPatch.height;
      delete allowedPatch.physicalDimensions;
      delete allowedPatch.variant;
    }
    const updated = constrainPhysicalFootprint({ ...object, ...allowedPatch, id });
    return {
      ...updated,
      seatAssignments: normalizeSeatAssignments(updated.seatAssignments, updated.seats),
    };
  }));
}

export function updateSeatingDetails(
  layout: FloorplanLayout,
  id: string,
  seatAssignments: readonly string[],
  linkedObjectIds: readonly string[],
  groupId = crypto.randomUUID(),
): FloorplanLayout {
  const source = layout.objects.find((object) => object.id === id);
  if (!source) return layout;

  const requestedIds = new Set([id, ...linkedObjectIds]);
  const targetGroupId = requestedIds.size > 1 ? groupId : undefined;
  const previousGroupId = source.linkedGroupId;
  const objects = layout.objects.map((object) => {
    const wasInEditedGroup = Boolean(previousGroupId && object.linkedGroupId === previousGroupId);
    const isRequested = requestedIds.has(object.id);
    const next = {
      ...object,
      ...(wasInEditedGroup || isRequested ? { linkedGroupId: isRequested ? targetGroupId : undefined } : {}),
    };
    return object.id === id
      ? { ...next, seatAssignments: normalizeSeatAssignments(seatAssignments, object.seats) }
      : next;
  });

  return touch(layout, removeSingletonLinkGroups(objects));
}

export function normalizePhysicalFootprints(layout: FloorplanLayout): FloorplanLayout {
  return { ...layout, objects: layout.objects.map(constrainPhysicalFootprint) };
}

export function deleteObject(layout: FloorplanLayout, id: string): FloorplanLayout {
  return touch(layout, removeSingletonLinkGroups(layout.objects.filter((object) => object.id !== id)));
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
    seatAssignments: undefined,
    linkedGroupId: undefined,
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
      } else if (object.type === "chair") {
        stats.seats += object.seats ?? 1;
      }
      return stats;
    },
    { objectCount: layout.objects.length, guestTables: 0, seats: 0 },
  );
}

function touch(layout: FloorplanLayout, objects: EventObject[]): FloorplanLayout {
  return { ...layout, objects, updatedAt: now() };
}

function constrainPhysicalFootprint(object: EventObject): EventObject {
  const definition = OBJECT_DEFINITIONS[object.type];
  if (definition.resizable) return object;
  const variantDefinition = getObjectVariant(object.type, object.variant);
  return {
    ...object,
    variant: variantDefinition?.id,
    width: variantDefinition?.width ?? definition.width,
    height: variantDefinition?.height ?? definition.height,
    physicalDimensions: variantDefinition?.physicalDimensions ?? definition.physicalDimensions,
  };
}

function normalizeSeatAssignments(assignments: readonly string[] | undefined, seats: number | undefined): string[] | undefined {
  if (seats === undefined) return undefined;
  return Array.from({ length: Math.max(0, Math.floor(seats)) }, (_, index) => assignments?.[index]?.slice(0, 80) ?? "");
}

function removeSingletonLinkGroups(objects: EventObject[]): EventObject[] {
  const counts = new Map<string, number>();
  for (const object of objects) {
    if (object.linkedGroupId) counts.set(object.linkedGroupId, (counts.get(object.linkedGroupId) ?? 0) + 1);
  }
  return objects.map((object) => object.linkedGroupId && counts.get(object.linkedGroupId) === 1
    ? { ...object, linkedGroupId: undefined }
    : object);
}
