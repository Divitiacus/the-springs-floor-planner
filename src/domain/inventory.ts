import type { EventObject, EventObjectType, FloorplanLayout } from "@/domain/floorplan";
import { OBJECT_DEFINITIONS, TABLE_TYPES } from "@/domain/object-catalog";

export const INVENTORY_ITEM_TYPES = [
  "round-table-48",
  "round-table-60",
  "round-table-72",
  "rectangle-table-6",
  "rectangle-table-8",
  "farmhouse-table-6",
  "parson-table-7",
  "sweetheart-table",
  "sweetheart-table-48",
  "cocktail-table-32",
  "cocktail-table-36",
  "chairs",
] as const;

export type InventoryItemType = (typeof INVENTORY_ITEM_TYPES)[number];
export type InventoryLimit = number | null;
export type InventoryConfiguration = Partial<Record<InventoryItemType, InventoryLimit>>;
export type InventoryUsage = Record<InventoryItemType, number>;

export type InventoryCatalog = {
  scope: "location-shared" | "hall";
  limits: InventoryConfiguration;
  source: {
    fileName: string;
    note: string;
  };
  additionalItems?: readonly {
    sourceItemKey: string;
    name: string;
    quantity: number;
    note?: string;
  }[];
};

export type InventoryValidationResult =
  | { valid: true }
  | { valid: false; code: "table-limit" | "chair-limit" | "seat-limit"; message: string };

export function getInventoryUsage(layout: FloorplanLayout): InventoryUsage {
  const usage: InventoryUsage = {
    "round-table-48": 0,
    "round-table-60": 0,
    "round-table-72": 0,
    "rectangle-table-6": 0,
    "rectangle-table-8": 0,
    "farmhouse-table-6": 0,
    "parson-table-7": 0,
    "sweetheart-table": 0,
    "sweetheart-table-48": 0,
    "cocktail-table-32": 0,
    "cocktail-table-36": 0,
    chairs: 0,
  };

  for (const object of layout.objects) {
    const inventoryType = getInventoryObjectType(object);
    if (inventoryType) {
      usage[inventoryType] += 1;
      if (TABLE_TYPES.has(object.type)) usage.chairs += object.seats ?? 0;
    } else if (object.type === "chair") {
      usage.chairs += 1;
    }
  }

  return usage;
}

export function validateLayoutInventory(
  layout: FloorplanLayout,
  inventory: InventoryConfiguration,
  inventoryOwner = "This location",
): InventoryValidationResult {
  for (const object of layout.objects) {
    if (!TABLE_TYPES.has(object.type)) continue;
    const maximum = OBJECT_DEFINITIONS[object.type].maximumSeats;
    if (maximum !== undefined && (object.seats ?? 0) > maximum) {
      return {
        valid: false,
        code: "seat-limit",
        message: `${OBJECT_DEFINITIONS[object.type].name} supports at most ${maximum} seats.`,
      };
    }
  }

  const usage = getInventoryUsage(layout);
  for (const type of INVENTORY_ITEM_TYPES.slice(0, -1) as readonly Exclude<InventoryItemType, "chairs">[]) {
    const limit = inventory[type];
    if (limit !== null && limit !== undefined && usage[type] > limit) {
      return {
        valid: false,
        code: "table-limit",
        message: `All ${limit} available ${INVENTORY_LABELS[type]} are already in this floorplan.`,
      };
    }
  }

  const chairLimit = inventory.chairs;
  if (chairLimit !== null && chairLimit !== undefined && usage.chairs > chairLimit) {
    return {
      valid: false,
      code: "chair-limit",
      message: `This change would require ${usage.chairs} chairs, but ${inventoryOwner} has ${chairLimit} available.`,
    };
  }

  return { valid: true };
}

type DirectInventoryObjectType = Extract<Exclude<InventoryItemType, "chairs">, EventObjectType>;

function isInventoryObject(type: EventObjectType): type is DirectInventoryObjectType {
  return (INVENTORY_ITEM_TYPES as readonly string[]).includes(type);
}

function getInventoryObjectType(object: Pick<EventObject, "type" | "variant">): Exclude<InventoryItemType, "chairs"> | null {
  if (object.type === "cocktail-table") {
    if (object.variant === "36-round") return "cocktail-table-36";
    if (object.variant === "32-round" || object.variant === undefined) return "cocktail-table-32";
    return null;
  }
  return isInventoryObject(object.type) ? object.type : null;
}

const INVENTORY_LABELS: Record<Exclude<InventoryItemType, "chairs">, string> = {
  "round-table-48": OBJECT_DEFINITIONS["round-table-48"].inventoryLabel,
  "round-table-60": OBJECT_DEFINITIONS["round-table-60"].inventoryLabel,
  "round-table-72": OBJECT_DEFINITIONS["round-table-72"].inventoryLabel,
  "rectangle-table-6": OBJECT_DEFINITIONS["rectangle-table-6"].inventoryLabel,
  "rectangle-table-8": OBJECT_DEFINITIONS["rectangle-table-8"].inventoryLabel,
  "farmhouse-table-6": OBJECT_DEFINITIONS["farmhouse-table-6"].inventoryLabel,
  "parson-table-7": OBJECT_DEFINITIONS["parson-table-7"].inventoryLabel,
  "sweetheart-table": OBJECT_DEFINITIONS["sweetheart-table"].inventoryLabel,
  "sweetheart-table-48": OBJECT_DEFINITIONS["sweetheart-table-48"].inventoryLabel,
  "cocktail-table-32": "32-inch cocktail tables",
  "cocktail-table-36": "36-inch cocktail tables",
};
