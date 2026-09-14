import type { EventObjectType, PhysicalObjectDimensions } from "@/domain/floorplan";

export type ObjectDefinition = {
  type: EventObjectType;
  name: string;
  shortLabel: string;
  category: "Tables" | "Production" | "Event essentials";
  /** Editor footprint only. Use physicalDimensions for trusted measurements. */
  width: number;
  height: number;
  defaultSeats?: number;
  maximumSeats?: number;
  inventoryLabel: string;
  physicalDimensions: PhysicalObjectDimensions;
  resizable: boolean;
  icon: "round" | "rectangle" | "heart" | "music" | "bar" | "buffet" | "camera" | "dance" | "chair";
};

export const OBJECT_CATALOG: ObjectDefinition[] = [
  { type: "round-table-60", name: "60-inch Round Table", shortLabel: "60\" Round", category: "Tables", width: 60, height: 60, defaultSeats: 8, maximumSeats: 8, inventoryLabel: "60-inch round tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 60 }, resizable: false, icon: "round" },
  { type: "rectangle-table-6", name: "6-foot Rectangle Table", shortLabel: "6' Rectangle", category: "Tables", width: 72, height: 36, defaultSeats: 8, maximumSeats: 8, inventoryLabel: "6-foot rectangle tables", physicalDimensions: { status: "partial", shape: "rectangle", lengthInches: 72, depthInches: null }, resizable: false, icon: "rectangle" },
  { type: "rectangle-table-8", name: "8-foot Rectangle Table", shortLabel: "8' Rectangle", category: "Tables", width: 96, height: 36, defaultSeats: 10, maximumSeats: 10, inventoryLabel: "8-foot rectangle tables", physicalDimensions: { status: "partial", shape: "rectangle", lengthInches: 96, depthInches: null }, resizable: false, icon: "rectangle" },
  { type: "sweetheart-table", name: "Sweetheart Table", shortLabel: "Sweetheart", category: "Tables", width: 72, height: 36, defaultSeats: 2, maximumSeats: 2, inventoryLabel: "sweetheart tables", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: false, icon: "heart" },
  { type: "cake-table", name: "Cake Table", shortLabel: "Cake", category: "Event essentials", width: 62, height: 62, inventoryLabel: "cake tables", physicalDimensions: { status: "unconfigured", shape: "circle", widthInches: null, depthInches: null }, resizable: false, icon: "round" },
  { type: "gift-table", name: "Gift Table", shortLabel: "Gifts", category: "Event essentials", width: 88, height: 48, inventoryLabel: "gift tables", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: true, icon: "rectangle" },
  { type: "dj", name: "DJ", shortLabel: "DJ", category: "Production", width: 100, height: 58, inventoryLabel: "DJ areas", physicalDimensions: { status: "unconfigured", shape: "area", widthInches: null, depthInches: null }, resizable: true, icon: "music" },
  { type: "portable-bar", name: "Bar", shortLabel: "Bar", category: "Event essentials", width: 118, height: 52, inventoryLabel: "bars", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: true, icon: "bar" },
  { type: "buffet", name: "Buffet", shortLabel: "Buffet", category: "Event essentials", width: 140, height: 48, inventoryLabel: "buffets", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: true, icon: "buffet" },
  { type: "photo-booth", name: "Photo Booth", shortLabel: "Photo Booth", category: "Production", width: 92, height: 76, inventoryLabel: "photo booths", physicalDimensions: { status: "unconfigured", shape: "area", widthInches: null, depthInches: null }, resizable: true, icon: "camera" },
  { type: "dance-floor", name: "Dance Floor", shortLabel: "Dance Floor", category: "Production", width: 260, height: 220, inventoryLabel: "dance floors", physicalDimensions: { status: "unconfigured", shape: "area", widthInches: null, depthInches: null }, resizable: true, icon: "dance" },
  { type: "chair", name: "Generic Chair", shortLabel: "Chair", category: "Event essentials", width: 30, height: 34, inventoryLabel: "chairs", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: false, icon: "chair" },
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

export function describePhysicalDimensions(definition: ObjectDefinition) {
  const dimensions = definition.physicalDimensions;
  if (dimensions.status === "confirmed") return `${dimensions.diameterInches} in diameter`;
  if (dimensions.status === "partial") return `${dimensions.lengthInches} in long · depth not configured`;
  return "Not configured";
}
