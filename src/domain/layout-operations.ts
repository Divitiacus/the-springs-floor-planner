import type { EventObject, EventObjectType, EventObjectVariant, FloorplanLayout } from "@/domain/floorplan";
import {
  CHAIR_ROW_DEFAULT_PITCH,
  CHAIR_ROW_DEFAULT_SEATS,
  CHAIR_ROW_HEIGHT,
  CHAIR_ROW_MAX_SEATS,
  getChairRowMinimumWidth,
  getObjectVariant,
  isGuestTable,
  OBJECT_DEFINITIONS,
  TABLE_TYPES,
} from "@/domain/object-catalog";

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
  defaultSeats?: number,
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
    seats: defaultSeats ?? definition.defaultSeats,
    zIndex: existing.length,
  };
}

export function addObject(layout: FloorplanLayout, object: EventObject): FloorplanLayout {
  return touch(layout, [...layout.objects, object]);
}

export function updateObject(layout: FloorplanLayout, id: string, patch: Partial<EventObject>): FloorplanLayout {
  const source = layout.objects.find((object) => object.id === id);
  if (!source) return layout;
  const allowedPatch = { ...patch };
  if (source.type === "chair-row" && typeof allowedPatch.seats === "number") {
    allowedPatch.seats = Math.max(2, Math.min(CHAIR_ROW_MAX_SEATS, Math.floor(allowedPatch.seats)));
    if (allowedPatch.width === undefined) allowedPatch.width = allowedPatch.seats * CHAIR_ROW_DEFAULT_PITCH;
  }
  if (!OBJECT_DEFINITIONS[source.type].resizable) {
    delete allowedPatch.width;
    delete allowedPatch.height;
    delete allowedPatch.physicalDimensions;
    delete allowedPatch.variant;
  }
  const updatedSource = constrainPhysicalFootprint({ ...source, ...allowedPatch, id });
  const deltaX = updatedSource.x - source.x;
  const deltaY = updatedSource.y - source.y;
  const deltaRotation = isRectangleLinkTable(source.type) && typeof patch.rotation === "number"
    ? updatedSource.rotation - source.rotation
    : 0;

  const objects = layout.objects.map((object) => {
    if (object.id === id) {
      return {
        ...updatedSource,
        seatAssignments: normalizeSeatAssignments(updatedSource.seatAssignments, updatedSource.seats),
        seatMeals: normalizeSeatField(updatedSource.seatMeals, updatedSource.seats),
        seatRoles: normalizeSeatField(updatedSource.seatRoles, updatedSource.seats),
        seatNoAlcohol: normalizeSeatFlag(updatedSource.seatNoAlcohol, updatedSource.seats),
        seatRsvpReceived: normalizeSeatFlag(updatedSource.seatRsvpReceived, updatedSource.seats),
      };
    }
    if (!source.linkedGroupId || object.linkedGroupId !== source.linkedGroupId) return object;
    if (deltaRotation) {
      const rotated = rotatePoint(object.x - source.x, object.y - source.y, deltaRotation);
      return {
        ...object,
        x: updatedSource.x + rotated.x,
        y: updatedSource.y + rotated.y,
        rotation: object.rotation + deltaRotation,
      };
    }
    return deltaX || deltaY ? { ...object, x: object.x + deltaX, y: object.y + deltaY } : object;
  });

  return touch(layout, snapLinkedEndChairs(objects));
}

export function updateSeatingDetails(
  layout: FloorplanLayout,
  id: string,
  seatAssignments: readonly string[],
  linkedObjectIds: readonly string[],
  groupId = crypto.randomUUID(),
  linkedSeatAssignments: Readonly<Record<string, readonly string[]>> = {},
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
    if (object.id === id) {
      return { ...next, seatAssignments: normalizeSeatAssignments(seatAssignments, object.seats) };
    }
    const linkedAssignments = linkedSeatAssignments[object.id];
    return linkedAssignments
      ? { ...next, seatAssignments: normalizeSeatAssignments(linkedAssignments, object.seats) }
      : next;
  });

  return touch(layout, snapLinkedEndChairs(removeSingletonLinkGroups(objects)));
}

export type GuestDetailsPatch = {
  name?: string;
  meal?: string;
  role?: string;
  noAlcohol?: boolean;
  rsvpReceived?: boolean;
};

export function updateGuestDetails(
  layout: FloorplanLayout,
  id: string,
  seatIndex: number,
  patch: GuestDetailsPatch,
): FloorplanLayout {
  const source = layout.objects.find((object) => object.id === id);
  const seatCount = Math.max(0, Math.floor(source?.seats ?? 0));
  if (!source || !Number.isInteger(seatIndex) || seatIndex < 0 || seatIndex >= seatCount) return layout;

  const seatAssignments = normalizeSeatAssignments(source.seatAssignments, seatCount) ?? [];
  const seatMeals = normalizeSeatField(source.seatMeals, seatCount) ?? [];
  const seatRoles = normalizeSeatField(source.seatRoles, seatCount) ?? [];
  const seatNoAlcohol = normalizeSeatFlag(source.seatNoAlcohol, seatCount) ?? [];
  const seatRsvpReceived = normalizeSeatFlag(source.seatRsvpReceived, seatCount) ?? [];
  if (patch.name !== undefined) seatAssignments[seatIndex] = patch.name.slice(0, 80);
  if (patch.meal !== undefined) seatMeals[seatIndex] = patch.meal.slice(0, 80);
  if (patch.role !== undefined) seatRoles[seatIndex] = patch.role.slice(0, 80);
  if (patch.noAlcohol !== undefined) seatNoAlcohol[seatIndex] = patch.noAlcohol;
  if (patch.rsvpReceived !== undefined) seatRsvpReceived[seatIndex] = patch.rsvpReceived;

  return touch(layout, layout.objects.map((object) => object.id === id
    ? { ...object, seatAssignments, seatMeals, seatRoles, seatNoAlcohol, seatRsvpReceived }
    : object));
}

export function normalizePhysicalFootprints(layout: FloorplanLayout): FloorplanLayout {
  return {
    ...layout,
    objects: snapLinkedEndChairs(layout.objects.map((object) => {
      const constrained = constrainPhysicalFootprint(object);
      return {
        ...constrained,
        seatAssignments: normalizeSeatAssignments(constrained.seatAssignments, constrained.seats),
        seatMeals: normalizeSeatField(constrained.seatMeals, constrained.seats),
        seatRoles: normalizeSeatField(constrained.seatRoles, constrained.seats),
        seatNoAlcohol: normalizeSeatFlag(constrained.seatNoAlcohol, constrained.seats),
        seatRsvpReceived: normalizeSeatFlag(constrained.seatRsvpReceived, constrained.seats),
      };
    })),
  };
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
    seatMeals: undefined,
    seatRoles: undefined,
    seatNoAlcohol: undefined,
    seatRsvpReceived: undefined,
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
      if (TABLE_TYPES.has(object.type)) {
        if (isGuestTable(object.type)) stats.guestTables += 1;
        stats.seats += object.seats ?? 0;
      } else if (object.type === "chair" || object.type === "chair-row") {
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
  if (object.type === "chair-row") {
    const seats = Math.max(2, Math.min(CHAIR_ROW_MAX_SEATS, Math.floor(object.seats ?? CHAIR_ROW_DEFAULT_SEATS)));
    return {
      ...object,
      seats,
      width: Math.max(getChairRowMinimumWidth(seats), object.width),
      height: CHAIR_ROW_HEIGHT,
      physicalDimensions: definition.physicalDimensions,
    };
  }
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
  return normalizeSeatField(assignments, seats);
}

function normalizeSeatField(values: readonly string[] | undefined, seats: number | undefined): string[] | undefined {
  if (seats === undefined) return undefined;
  return Array.from({ length: Math.max(0, Math.floor(seats)) }, (_, index) => values?.[index]?.slice(0, 80) ?? "");
}

function normalizeSeatFlag(values: readonly boolean[] | undefined, seats: number | undefined): boolean[] | undefined {
  if (seats === undefined) return undefined;
  return Array.from({ length: Math.max(0, Math.floor(seats)) }, (_, index) => values?.[index] === true);
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

const END_CHAIR_GAP = 2;

function snapLinkedEndChairs(objects: EventObject[]): EventObject[] {
  const groups = new Map<string, EventObject[]>();
  for (const object of objects) {
    if (!object.linkedGroupId) continue;
    const group = groups.get(object.linkedGroupId) ?? [];
    group.push(object);
    groups.set(object.linkedGroupId, group);
  }

  const snapped = new Map<string, EventObject>();
  for (const group of groups.values()) {
    const tables = group.filter((object) => isRectangleLinkTable(object.type));
    const chairs = group.filter((object) => object.type === "chair");
    if (!tables.length || !chairs.length) continue;

    const endpoints = tables.flatMap((table) => ([-1, 1] as const).map((side) => ({
      table,
      ...tableEndPosition(table, OBJECT_DEFINITIONS.chair.width, side),
    })));

    for (const chair of chairs) {
      if (!endpoints.length) break;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      endpoints.forEach((endpoint, index) => {
        const distance = Math.hypot(chair.x - endpoint.x, chair.y - endpoint.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      const [endpoint] = endpoints.splice(nearestIndex, 1);
      snapped.set(chair.id, {
        ...chair,
        x: endpoint.x,
        y: endpoint.y,
        rotation: endpoint.table.rotation,
      });
    }
  }

  return objects.map((object) => snapped.get(object.id) ?? object);
}

function tableEndPosition(table: EventObject, chairWidth: number, side: -1 | 1) {
  const offset = side * (table.width / 2 + chairWidth / 2 + END_CHAIR_GAP);
  const rotated = rotatePoint(offset, 0, table.rotation);
  return { x: table.x + rotated.x, y: table.y + rotated.y };
}

function rotatePoint(x: number, y: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: x * cosine - y * sine,
    y: x * sine + y * cosine,
  };
}

function isRectangleLinkTable(type: EventObjectType) {
  return type === "rectangle-table-6"
    || type === "rectangle-table-8"
    || type === "farmhouse-table-6"
    || type === "farmhouse-table-8";
}
