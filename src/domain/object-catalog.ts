import type { EventObjectType, EventObjectVariant, PhysicalObjectDimensions } from "@/domain/floorplan";

export type ObjectVariantDefinition = {
  id: EventObjectVariant;
  name: string;
  shortLabel: string;
  width: number;
  height: number;
  physicalDimensions: PhysicalObjectDimensions;
};

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
  defaultVariant?: EventObjectVariant;
  variants?: readonly ObjectVariantDefinition[];
  regionalStyleKey?: "photo-booth";
  showInLibrary?: boolean;
  inventoryOnly?: boolean;
  icon: "round" | "rectangle" | "heart" | "music" | "bar" | "buffet" | "camera" | "dance" | "chair";
};

export const OBJECT_CATALOG: ObjectDefinition[] = [
  { type: "round-table-48", name: "48-inch Round Table", shortLabel: "48\" Round", category: "Tables", width: 48, height: 48, defaultSeats: 6, maximumSeats: 6, inventoryLabel: "48-inch round tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 48 }, resizable: false, inventoryOnly: true, icon: "round" },
  { type: "round-table-60", name: "60-inch Round Table", shortLabel: "60\" Round", category: "Tables", width: 60, height: 60, defaultSeats: 8, maximumSeats: 10, inventoryLabel: "60-inch round tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 60 }, resizable: false, icon: "round" },
  { type: "round-table-72", name: "72-inch Round Table", shortLabel: "72\" Round", category: "Tables", width: 72, height: 72, defaultSeats: 10, maximumSeats: 10, inventoryLabel: "72-inch round tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 72 }, resizable: false, inventoryOnly: true, icon: "round" },
  { type: "rectangle-table-6", name: "6-foot Rectangle Table", shortLabel: "6' Rectangle", category: "Tables", width: 72, height: 30, defaultSeats: 8, maximumSeats: 8, inventoryLabel: "6-foot rectangle tables", physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 72, depthInches: 30 }, resizable: false, icon: "rectangle" },
  { type: "rectangle-table-8", name: "8-foot Rectangle Table", shortLabel: "8' Rectangle", category: "Tables", width: 96, height: 30, defaultSeats: 10, maximumSeats: 10, inventoryLabel: "8-foot rectangle tables", physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 96, depthInches: 30 }, resizable: false, icon: "rectangle" },
  { type: "farmhouse-table-6", name: "Wooden Farmhouse Table", shortLabel: "Farmhouse", category: "Tables", width: 72, height: 30, defaultSeats: 8, maximumSeats: 8, inventoryLabel: "wooden Farmhouse tables", physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 72, depthInches: 30 }, resizable: false, inventoryOnly: true, icon: "rectangle" },
  { type: "parson-table-7", name: "Parson Table", shortLabel: "Parson", category: "Tables", width: 84, height: 22, inventoryLabel: "Parson tables", physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 84, depthInches: 22 }, resizable: false, icon: "rectangle" },
  { type: "display-table-33", name: "33-inch Display Table", shortLabel: "33\" Display", category: "Tables", width: 33, height: 33, inventoryLabel: "33-inch display tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 33 }, resizable: false, inventoryOnly: true, icon: "round" },
  { type: "sweetheart-table-33", name: "33-inch Sweetheart/Cake Table", shortLabel: "33\" Sweetheart", category: "Tables", width: 33, height: 33, defaultSeats: 2, maximumSeats: 2, inventoryLabel: "33-inch sweetheart/cake tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 33 }, resizable: false, inventoryOnly: true, icon: "heart" },
  { type: "sweetheart-table", name: "36-inch Sweetheart Table", shortLabel: "36\" Sweetheart", category: "Tables", width: 36, height: 36, defaultSeats: 2, maximumSeats: 2, inventoryLabel: "36-inch sweetheart tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 36 }, resizable: false, icon: "heart" },
  { type: "sweetheart-table-48", name: "48-inch Sweetheart Table", shortLabel: "48\" Sweetheart", category: "Tables", width: 48, height: 48, defaultSeats: 2, maximumSeats: 2, inventoryLabel: "48-inch sweetheart tables", physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 48 }, resizable: false, inventoryOnly: true, icon: "heart" },
  {
    type: "cocktail-table",
    name: "Cocktail Table",
    shortLabel: "Cocktail",
    category: "Tables",
    width: 32,
    height: 32,
    inventoryLabel: "cocktail tables",
    physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 32 },
    resizable: false,
    defaultVariant: "32-round",
    icon: "round",
    variants: [
      { id: "32-round", name: "32-inch Cocktail Table", shortLabel: "32\" Cocktail", width: 32, height: 32, physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 32 } },
      { id: "36-round", name: "36-inch Cocktail Table", shortLabel: "36\" Cocktail", width: 36, height: 36, physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 36 } },
    ],
  },
  { type: "cake-table", name: "Cake Table", shortLabel: "Cake", category: "Event essentials", width: 62, height: 62, inventoryLabel: "cake tables", physicalDimensions: { status: "unconfigured", shape: "circle", widthInches: null, depthInches: null }, resizable: false, icon: "round" },
  { type: "gift-table", name: "Gift Table", shortLabel: "Gifts", category: "Event essentials", width: 88, height: 48, inventoryLabel: "gift tables", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: true, icon: "rectangle" },
  { type: "dj", name: "DJ", shortLabel: "DJ", category: "Production", width: 72, height: 72, inventoryLabel: "DJ areas", physicalDimensions: { status: "confirmed", shape: "area", widthInches: 72, depthInches: 72 }, resizable: false, icon: "music" },
  { type: "portable-bar", name: "Satellite Bar", shortLabel: "Satellite Bar", category: "Event essentials", width: 118, height: 52, inventoryLabel: "satellite bars", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: true, icon: "bar" },
  { type: "buffet", name: "Buffet", shortLabel: "Buffet", category: "Event essentials", width: 140, height: 48, inventoryLabel: "buffets", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: true, showInLibrary: false, icon: "buffet" },
  { type: "photo-booth", name: "Photo Booth", shortLabel: "Photo Booth", category: "Production", width: 120, height: 120, inventoryLabel: "photo booths", physicalDimensions: { status: "confirmed", shape: "area", widthInches: 120, depthInches: 120 }, resizable: false, regionalStyleKey: "photo-booth", icon: "camera" },
  {
    type: "dance-floor",
    name: "Dance Floor",
    shortLabel: "Dance Floor",
    category: "Production",
    width: 192,
    height: 192,
    inventoryLabel: "dance floors",
    physicalDimensions: { status: "confirmed", shape: "area", widthInches: 192, depthInches: 192 },
    resizable: false,
    defaultVariant: "16x16",
    icon: "dance",
    variants: [
      { id: "12x12", name: "12' × 12' Dance Floor", shortLabel: "Dance Floor 12' × 12'", width: 144, height: 144, physicalDimensions: { status: "confirmed", shape: "area", widthInches: 144, depthInches: 144 } },
      { id: "16x16", name: "16' × 16' Dance Floor", shortLabel: "Dance Floor 16' × 16'", width: 192, height: 192, physicalDimensions: { status: "confirmed", shape: "area", widthInches: 192, depthInches: 192 } },
      { id: "20x20", name: "20' × 20' Dance Floor", shortLabel: "Dance Floor 20' × 20'", width: 240, height: 240, physicalDimensions: { status: "confirmed", shape: "area", widthInches: 240, depthInches: 240 } },
    ],
  },
  { type: "chair", name: "Single Chair", shortLabel: "Chair", category: "Event essentials", width: 10, height: 7, defaultSeats: 1, maximumSeats: 1, inventoryLabel: "chairs", physicalDimensions: { status: "unconfigured", shape: "rectangle", widthInches: null, depthInches: null }, resizable: false, icon: "chair" },
];

export const OBJECT_DEFINITIONS = Object.fromEntries(
  OBJECT_CATALOG.map((definition) => [definition.type, definition]),
) as Record<EventObjectType, ObjectDefinition>;

export const TABLE_TYPES = new Set<EventObjectType>([
  "round-table-48",
  "round-table-60",
  "round-table-72",
  "rectangle-table-6",
  "rectangle-table-8",
  "farmhouse-table-6",
  "sweetheart-table-33",
  "sweetheart-table",
  "sweetheart-table-48",
]);

export function isGuestTable(type: EventObjectType) {
  return type === "round-table-48" || type === "round-table-60" || type === "round-table-72" || type === "rectangle-table-6" || type === "rectangle-table-8" || type === "farmhouse-table-6";
}

export function getObjectVariant(type: EventObjectType, variant?: EventObjectVariant) {
  const variants = OBJECT_DEFINITIONS[type].variants;
  if (!variants) return undefined;
  return variants.find((candidate) => candidate.id === (variant ?? OBJECT_DEFINITIONS[type].defaultVariant));
}

export function getObjectDisplayName(type: EventObjectType, variant?: EventObjectVariant) {
  return getObjectVariant(type, variant)?.name ?? OBJECT_DEFINITIONS[type].name;
}

export function isObjectAvailableForInventory(
  definition: ObjectDefinition,
  inventory: Readonly<Record<string, unknown>>,
  variant?: EventObjectVariant,
) {
  if (definition.category !== "Tables") return true;
  const inventoryKey = definition.type === "cocktail-table"
    ? variant === "36-round" ? "cocktail-table-36" : "cocktail-table-32"
    : definition.type;
  const limit = inventory[inventoryKey];
  return typeof limit === "number" && limit > 0;
}

export function describePhysicalDimensions(source: ObjectDefinition | PhysicalObjectDimensions) {
  const dimensions = "physicalDimensions" in source ? source.physicalDimensions : source;
  if (dimensions.status === "confirmed" && dimensions.shape === "circle") return `${dimensions.diameterInches} in diameter`;
  if (dimensions.status === "confirmed") return `${dimensions.widthInches} × ${dimensions.depthInches} in`;
  if (dimensions.status === "partial") return `${dimensions.lengthInches} in long · depth not configured`;
  return "Not configured";
}
