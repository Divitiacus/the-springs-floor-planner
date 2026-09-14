import type { EventObjectType } from "@/domain/floorplan";

export type ObjectDefinition = {
  type: EventObjectType;
  name: string;
  shortLabel: string;
  category: "Tables" | "Production" | "Event essentials";
  width: number;
  height: number;
  defaultSeats?: number;
  resizable: boolean;
  icon: "round" | "rectangle" | "heart" | "music" | "bar" | "buffet" | "camera" | "dance" | "chair";
};

export const OBJECT_CATALOG: ObjectDefinition[] = [
  { type: "round-table-60", name: "60-inch Round Table", shortLabel: "60\" Round", category: "Tables", width: 92, height: 92, defaultSeats: 8, resizable: false, icon: "round" },
  { type: "rectangle-table-6", name: "6-foot Rectangle Table", shortLabel: "6' Rectangle", category: "Tables", width: 132, height: 60, defaultSeats: 8, resizable: false, icon: "rectangle" },
  { type: "rectangle-table-8", name: "8-foot Rectangle Table", shortLabel: "8' Rectangle", category: "Tables", width: 168, height: 60, defaultSeats: 10, resizable: false, icon: "rectangle" },
  { type: "sweetheart-table", name: "Sweetheart Table", shortLabel: "Sweetheart", category: "Tables", width: 102, height: 54, defaultSeats: 2, resizable: false, icon: "heart" },
  { type: "cake-table", name: "Cake Table", shortLabel: "Cake", category: "Event essentials", width: 62, height: 62, resizable: false, icon: "round" },
  { type: "gift-table", name: "Gift Table", shortLabel: "Gifts", category: "Event essentials", width: 88, height: 48, resizable: true, icon: "rectangle" },
  { type: "dj", name: "DJ", shortLabel: "DJ", category: "Production", width: 100, height: 58, resizable: true, icon: "music" },
  { type: "portable-bar", name: "Bar", shortLabel: "Bar", category: "Event essentials", width: 118, height: 52, resizable: true, icon: "bar" },
  { type: "buffet", name: "Buffet", shortLabel: "Buffet", category: "Event essentials", width: 140, height: 48, resizable: true, icon: "buffet" },
  { type: "photo-booth", name: "Photo Booth", shortLabel: "Photo Booth", category: "Production", width: 92, height: 76, resizable: true, icon: "camera" },
  { type: "dance-floor", name: "Dance Floor", shortLabel: "Dance Floor", category: "Production", width: 260, height: 220, resizable: true, icon: "dance" },
  { type: "chair", name: "Generic Chair", shortLabel: "Chair", category: "Event essentials", width: 30, height: 34, resizable: false, icon: "chair" },
];

export const OBJECT_DEFINITIONS = Object.fromEntries(
  OBJECT_CATALOG.map((definition) => [definition.type, definition]),
) as Record<EventObjectType, ObjectDefinition>;

export const TABLE_TYPES = new Set<EventObjectType>([
  "round-table-60",
  "rectangle-table-6",
  "rectangle-table-8",
  "sweetheart-table",
]);

export function isGuestTable(type: EventObjectType) {
  return type === "round-table-60" || type === "rectangle-table-6" || type === "rectangle-table-8";
}
