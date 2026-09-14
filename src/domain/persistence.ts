import type { FloorplanLayout, StoredFloorplan } from "@/domain/floorplan";
import { OBJECT_DEFINITIONS } from "@/domain/object-catalog";

export const STORAGE_KEY = "springs-floor-planner:v2";

export function serializeFloorplan(layout: FloorplanLayout): string {
  const stored: StoredFloorplan = { schemaVersion: 2, layout };
  return JSON.stringify(stored, null, 2);
}

export function deserializeFloorplan(value: string): FloorplanLayout {
  const parsed: unknown = JSON.parse(value);
  if (!isStoredFloorplan(parsed)) throw new Error("This file is not a valid Springs floorplan.");
  return parsed.layout;
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
          typeof object.rotation === "number",
      ),
    )
  );
}
