import type {
  EventObject,
  EventObjectType,
  EventObjectVariant,
  FloorplanLayout,
  StoredFloorplan,
} from "@/domain/floorplan";
import { getObjectVariant, OBJECT_DEFINITIONS } from "@/domain/object-catalog";

export const STORAGE_KEY = "springs-floor-planner:v2";

export function serializeFloorplan(layout: FloorplanLayout): string {
  const stored: StoredFloorplan = { schemaVersion: 2, layout };
  return JSON.stringify(stored, null, 2);
}

type PortableObject = [
  type: EventObjectType,
  variant: EventObjectVariant | null,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  label: string,
  tableNumber: number | null,
  seats: number | null,
  zIndex: number,
  levelId?: string | null,
];

type PortableFloorplan = {
  v: 3 | 4;
  h: string;
  n: string;
  o: PortableObject[];
};

/** A compact, client-owned file. Catalog dimensions and transient IDs are rebuilt when opened. */
export function serializePortableFloorplan(layout: FloorplanLayout): string {
  const name = layout.name.trim();
  if (!name) throw new Error("Enter an event or client name before saving.");
  const portable: PortableFloorplan = {
    v: 4,
    h: layout.venueTemplateId,
    n: name,
    o: layout.objects.map((object) => [
      object.type,
      object.variant ?? null,
      object.x,
      object.y,
      object.width,
      object.height,
      object.rotation,
      object.label,
      object.tableNumber ?? null,
      object.seats ?? null,
      object.zIndex,
      object.levelId ?? object.floorLevelId ?? null,
    ]),
  };
  return JSON.stringify(portable);
}

export function deserializeFloorplan(value: string): FloorplanLayout {
  const parsed: unknown = JSON.parse(value);
  if (isPortableFloorplan(parsed)) return inflatePortableFloorplan(parsed);
  if (!isStoredFloorplan(parsed)) throw new Error("This file is not a valid Springs floorplan.");
  return parsed.layout;
}

function inflatePortableFloorplan(stored: PortableFloorplan): FloorplanLayout {
  return {
    id: "local-floorplan",
    name: stored.n,
    venueTemplateId: stored.h,
    coordinateUnit: "inches",
    objects: stored.o.map((entry, index) => {
      const [type, variant, x, y, width, height, rotation, label, tableNumber, seats, zIndex, levelId] = entry;
      const definition = OBJECT_DEFINITIONS[type];
      const variantDefinition = getObjectVariant(type, variant ?? undefined);
      const catalogWidth = variantDefinition?.width ?? definition.width;
      const catalogHeight = variantDefinition?.height ?? definition.height;
      const object: EventObject = {
        id: `opened-${index + 1}`,
        type,
        x,
        y,
        width: definition.resizable ? width : catalogWidth,
        height: definition.resizable ? height : catalogHeight,
        physicalDimensions: variantDefinition?.physicalDimensions ?? definition.physicalDimensions,
        rotation,
        label,
        zIndex,
      };
      if (variant) object.variant = variant;
      if (tableNumber !== null) object.tableNumber = tableNumber;
      if (seats !== null) object.seats = seats;
      if (levelId) object.levelId = levelId;
      return object;
    }),
    updatedAt: new Date().toISOString(),
  };
}

function isPortableFloorplan(value: unknown): value is PortableFloorplan {
  if (!value || typeof value !== "object") return false;
  const stored = value as Partial<PortableFloorplan>;
  return (
    (stored.v === 3 || stored.v === 4) &&
    typeof stored.h === "string" &&
    stored.h.length > 0 &&
    typeof stored.n === "string" &&
    stored.n.length > 0 &&
    Array.isArray(stored.o) &&
    stored.o.every(isPortableObject)
  );
}

function isPortableObject(value: unknown): value is PortableObject {
  if (!Array.isArray(value) || (value.length !== 11 && value.length !== 12)) return false;
  const [type, variant, x, y, width, height, rotation, label, tableNumber, seats, zIndex, levelId] = value;
  if (typeof type !== "string" || !(type in OBJECT_DEFINITIONS)) return false;
  if (variant !== null) {
    if (typeof variant !== "string") return false;
    const resolved = getObjectVariant(type as EventObjectType, variant as EventObjectVariant);
    if (!resolved || resolved.id !== variant) return false;
  }
  return (
    [x, y, width, height, rotation, zIndex].every((number) => typeof number === "number" && Number.isFinite(number)) &&
    width > 0 &&
    height > 0 &&
    typeof label === "string" &&
    (tableNumber === null || (typeof tableNumber === "number" && Number.isFinite(tableNumber))) &&
    (seats === null || (typeof seats === "number" && Number.isFinite(seats))) &&
    (levelId === undefined || levelId === null || typeof levelId === "string")
  );
}

function isStoredFloorplan(value: unknown): value is StoredFloorplan {
  if (!value || typeof value !== "object") return false;
  const stored = value as Partial<StoredFloorplan>;
  if (stored.schemaVersion !== 2 || !stored.layout || typeof stored.layout !== "object") return false;
  return (
    typeof stored.layout.id === "string" &&
    typeof stored.layout.name === "string" &&
    typeof stored.layout.venueTemplateId === "string" &&
    stored.layout.coordinateUnit === "inches" &&
    Array.isArray(stored.layout.objects) &&
    stored.layout.objects.every((object) =>
      Boolean(
        object &&
          typeof object.id === "string" &&
          typeof object.type === "string" &&
          object.type in OBJECT_DEFINITIONS &&
          typeof object.x === "number" &&
          typeof object.y === "number" &&
          typeof object.width === "number" &&
          typeof object.height === "number" &&
          Boolean(object.physicalDimensions && typeof object.physicalDimensions === "object") &&
          typeof object.rotation === "number" &&
          (object.levelId === undefined || typeof object.levelId === "string") &&
          (object.floorLevelId === undefined || typeof object.floorLevelId === "string"),
      ),
    )
  );
}
