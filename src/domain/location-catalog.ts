import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  ReferenceFloorplanAsset,
} from "@/domain/floorplan";
import type { InventoryCatalog, InventoryConfiguration } from "@/domain/inventory";
import { createHeritagePineConfiguration } from "@/domain/venues/heritage-pine";
import { createHiddenMagnoliaConfiguration } from "@/domain/venues/hidden-magnolia";
import { createMagnoliaManorConfiguration } from "@/domain/venues/magnolia-manor";
import { createStonebrookConfiguration } from "@/domain/venues/stonebrook";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";
import { createSycamoreGroveConfiguration } from "@/domain/venues/sycamore-grove";
import { createVillaTuscanaConfiguration } from "@/domain/venues/villa-tuscana";

export type HallConfiguration = {
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly FixedArchitectureElement[];
  floorplanAsset: ReferenceFloorplanAsset | null;
  inventory?: InventoryCatalog;
  sampleLayoutIds?: readonly string[];
};

export type HallCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  configuration: HallConfiguration | null;
};

export type LocationCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  inventory?: InventoryCatalog;
  halls: readonly HallCatalogEntry[];
};

export const MAGNOLIA_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: {
    "round-table-60": 32,
    "rectangle-table-6": 4,
    "rectangle-table-8": 6,
    "parson-table-7": 6,
    "sweetheart-table": 1,
    "cocktail-table-32": 6,
    chairs: 320,
  },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "Table quantities come from the source workbook. Sweetheart tables use the separately confirmed 36-inch round footprint. The 320-chair total was confirmed separately for both Magnolia halls and is shared at the location level.",
  },
};

export const LAKE_CONROE_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: { "parson-table-7": 6, "sweetheart-table": 2, chairs: 320 },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "The source workbook confirms 6 Parson tables and 2 sweetheart tables for each Lake Conroe hall. Sweetheart tables use the separately confirmed 36-inch round footprint. The 320-chair total was confirmed separately.",
  },
};

export const KATY_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: { "parson-table-7": 5, "sweetheart-table": 2, chairs: 320 },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "The source workbook confirms 5 Parson tables and 2 sweetheart tables shared across both Katy halls. Sweetheart tables use the separately confirmed 36-inch round footprint. Cocktail table quantity is confirmed, but its diameter is not stated. The 320-chair total was confirmed separately.",
  },
  additionalItems: [
    {
      sourceItemKey: "cocktail-table",
      name: "Cocktail Table",
      quantity: 5,
      note: "Physical size is not stated, so this quantity is not assigned to a scaled cocktail-table variant.",
    },
  ],
};

export const ANGLETON_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { "parson-table-7": 6, "sweetheart-table": 2, "cocktail-table-36": 5, chairs: 320 },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "The source workbook confirms 6 Parson tables, 2 two-seat rounds, and 5 36-inch cocktail tables for Sycamore Grove. Sweetheart tables use the separately confirmed 36-inch round footprint. The 320-chair total was confirmed separately for Sycamore Grove. Magnolia Manor inventory is not yet configured.",
  },
};

const HERITAGE_PINE_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { "cocktail-table-36": 5 },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "The source workbook confirms 5 36-inch round cocktail tables for Heritage Pine.",
  },
};

const STONEBROOK_COCKTAIL_SOURCE: InventoryCatalog = {
  scope: "hall",
  limits: {},
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "The source workbook confirms 5 highboy cocktail tables for Stonebrook, but does not state their diameter.",
  },
  additionalItems: [
    {
      sourceItemKey: "cocktail-table",
      name: "Highboy Cocktail Table",
      quantity: 5,
      note: "Physical size is not stated, so this quantity is not assigned to a scaled cocktail-table variant.",
    },
  ],
};

export const SPRINGS_LOCATIONS: readonly LocationCatalogEntry[] = [
  {
    id: "location_magnolia",
    slug: "magnolia",
    name: "Magnolia",
    inventory: MAGNOLIA_INVENTORY,
    halls: [
      {
        id: "hall_pinehaven_terrace",
        slug: "pinehaven-terrace",
        name: "Pinehaven Terrace",
        configuration: createHiddenMagnoliaConfiguration(),
      },
      {
        id: "hall_hidden_magnolia",
        slug: "the-hidden-magnolia",
        name: "The Hidden Magnolia",
        configuration: createHiddenMagnoliaConfiguration(),
      },
    ],
  },
  {
    id: "location_lake_conroe",
    slug: "lake-conroe",
    name: "Lake Conroe",
    inventory: LAKE_CONROE_INVENTORY,
    halls: [
      {
        id: "hall_stonebrook",
        slug: "stonebrook",
        name: "Stonebrook",
        configuration: { ...createStonebrookConfiguration(), inventory: STONEBROOK_COCKTAIL_SOURCE },
      },
      {
        id: "hall_heritage_pine",
        slug: "heritage-pine",
        name: "Heritage Pine",
        configuration: { ...createHeritagePineConfiguration(), inventory: HERITAGE_PINE_INVENTORY },
      },
    ],
  },
  {
    id: "location_katy",
    slug: "katy",
    name: "Katy",
    inventory: KATY_INVENTORY,
    halls: [
      {
        id: "hall_stonecreek_reserve",
        slug: "stonecreek-reserve",
        name: "Stonecreek Reserve",
        configuration: createStonecreekReserveConfiguration(),
      },
      {
        id: "hall_villa_tuscana",
        slug: "villa-tuscana",
        name: "Villa Tuscana",
        configuration: createVillaTuscanaConfiguration(),
      },
    ],
  },
  {
    id: "location_angleton",
    slug: "angleton",
    name: "Angleton",
    halls: [
      {
        id: "hall_sycamore_grove",
        slug: "sycamore-grove",
        name: "Sycamore Grove",
        configuration: { ...createSycamoreGroveConfiguration(), inventory: ANGLETON_INVENTORY },
      },
      {
        id: "hall_magnolia_manor",
        slug: "magnolia-manor",
        name: "Magnolia Manor",
        configuration: createMagnoliaManorConfiguration(),
      },
    ],
  },
];

export function resolveInventoryConfiguration(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
): InventoryConfiguration {
  return {
    ...(location.inventory?.limits ?? {}),
    ...(hall.configuration?.inventory?.limits ?? {}),
  };
}

export function getLocationBySlug(slug: string | undefined) {
  return SPRINGS_LOCATIONS.find((location) => location.slug === slug);
}

export function getHallBySlug(location: LocationCatalogEntry | undefined, slug: string | undefined) {
  return location?.halls.find((hall) => hall.slug === slug);
}
