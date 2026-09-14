import type { FloorplanLayout, StoredFloorplan } from "@/domain/floorplan";

export const STORAGE_KEY = "springs-floor-planner:v1";

export function serializeFloorplan(layout: FloorplanLayout): string {
  const stored: StoredFloorplan = { schemaVersion: 1, layout };
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
  if (stored.schemaVersion !== 1 || !stored.layout || typeof stored.layout !== "object") return false;
  return (
    typeof stored.layout.id === "string" &&
    typeof stored.layout.name === "string" &&
    typeof stored.layout.venueTemplateId === "string" &&
    Array.isArray(stored.layout.objects) &&
    stored.layout.objects.every((object) =>
      Boolean(
        object &&
          typeof object.id === "string" &&
          typeof object.type === "string" &&
          typeof object.x === "number" &&
          typeof object.y === "number" &&
          typeof object.width === "number" &&
          typeof object.height === "number" &&
          typeof object.rotation === "number",
      ),
    )
  );
}
