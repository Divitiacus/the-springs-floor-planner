import type { EventObjectType, FloorplanLayout } from "@/domain/floorplan";
import { OBJECT_DEFINITIONS, TABLE_TYPES } from "@/domain/object-catalog";

export const INVENTORY_ITEM_TYPES = [
  "round-table-60",
  "rectangle-table-6",
  "rectangle-table-8",
  "sweetheart-table",
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
    "round-table-60": 0,
    "rectangle-table-6": 0,
    "rectangle-table-8": 0,
    "sweetheart-table": 0,
    chairs: 0,
  };

  for (const object of layout.objects) {
    if (isInventoryTable(object.type)) {
      usage[object.type] += 1;
      usage.chairs += object.seats ?? 0;
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
  for (const type of INVENTORY_ITEM_TYPES.slice(0, 4) as readonly Exclude<InventoryItemType, "chairs">[]) {
    const limit = inventory[type];
    if (limit !== null && limit !== undefined && usage[type] > limit) {
      return {
        valid: false,
        code: "table-limit",
        message: `All ${limit} available ${OBJECT_DEFINITIONS[type].inventoryLabel} are already in this floorplan.`,
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

function isInventoryTable(type: EventObjectType): type is Exclude<InventoryItemType, "chairs"> {
  return TABLE_TYPES.has(type);
}
