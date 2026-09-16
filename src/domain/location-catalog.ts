import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  ReferenceFloorplanAsset,
  VenueFloorRegion,
} from "@/domain/floorplan";
import type { InventoryCatalog, InventoryConfiguration } from "@/domain/inventory";
import { createHeritagePineConfiguration } from "@/domain/venues/heritage-pine";
import { createHiddenMagnoliaConfiguration } from "@/domain/venues/hidden-magnolia";
import { createHiddenSpringsRanchConfiguration } from "@/domain/venues/hidden-springs-ranch";
import { createMagnoliaManorConfiguration } from "@/domain/venues/magnolia-manor";
import { createStonebrookConfiguration } from "@/domain/venues/stonebrook";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";
import { createSycamoreGroveConfiguration } from "@/domain/venues/sycamore-grove";
import { createVillaTuscanaConfiguration } from "@/domain/venues/villa-tuscana";
import { createFarmhouseWallisvilleConfiguration } from "@/domain/venues/farmhouse-wallisville";
import { createTheChateauCypressConfiguration } from "@/domain/venues/the-chateau-cypress";

export type HallLevelConfiguration = {
  id: string;
  slug: string;
  name: string;
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly FixedArchitectureElement[];
  floorplanAsset: ReferenceFloorplanAsset | null;
  usableAreas?: readonly VenueFloorRegion[];
  voidAreas?: readonly VenueFloorRegion[];
  planningBounds?: { x: number; y: number; width: number; height: number };
  defaultObjectPosition?: { x: number; y: number };
};

type HallConfigurationShared = {
  inventory?: InventoryCatalog;
  sampleLayoutIds?: readonly string[];
};

export type SingleLevelHallConfiguration = HallConfigurationShared & {
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly FixedArchitectureElement[];
  floorplanAsset: ReferenceFloorplanAsset | null;
  levels?: never;
  defaultLevelId?: never;
};

export type MultiLevelHallConfiguration = HallConfigurationShared & {
  levels: readonly HallLevelConfiguration[];
  defaultLevelId: string;
};

export type HallConfiguration = SingleLevelHallConfiguration | MultiLevelHallConfiguration;

export function isMultiLevelHallConfiguration(
  configuration: HallConfiguration,
): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}

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
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 1,
    "cocktail-table-32": 6,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the same table and chair quantities for both Magnolia halls.",
  },
};

export const LAKE_CONROE_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 0,
    "cocktail-table-36": 5,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the same table and chair quantities for Stonebrook and Heritage Pine.",
  },
};

export const KATY_INVENTORY: InventoryCatalog = {
  scope: "location-shared",
  limits: {
    "round-table-60": 32,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 1,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 0,
    "cocktail-table-36": 5,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the same table and chair quantities for Stonecreek Reserve and Villa Tuscana.",
  },
};

export const DENTON_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: { ...KATY_INVENTORY.limits },
  source: {
    fileName: "user-confirmed",
    note: "Hidden Springs Ranch matches Stonecreek Reserve's planning inventory and 320-chair guest capacity.",
  },
};

export const ANGLETON_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "farmhouse-table-6": 0,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 5,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms these quantities specifically for Sycamore Grove.",
  },
};

export const MAGNOLIA_MANOR_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-60": 40,
    "rectangle-table-6": 2,
    "rectangle-table-8": 6,
    "parson-table-7": 6,
    "sweetheart-table": 2,
    "cocktail-table-32": 10,
    "cocktail-table-36": 0,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms these quantities specifically for Magnolia Manor.",
  },
};

export const WALLISVILLE_FARMHOUSE_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-48": 2,
    "round-table-60": 30,
    "rectangle-table-6": 4,
    "rectangle-table-8": 4,
    "farmhouse-table-6": 5,
    "parson-table-7": 4,
    "cocktail-table-32": 5,
    "cocktail-table-36": 2,
    chairs: 250,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the Wallisville Farmhouse table and chair quantities, including five wooden Farmhouse tables.",
  },
};

export const CYPRESS_CHATEAU_INVENTORY: InventoryCatalog = {
  scope: "hall",
  limits: {
    "round-table-72": 30,
    "round-table-48": 2,
    "round-table-60": 20,
    "rectangle-table-6": 6,
    "rectangle-table-8": 12,
    "sweetheart-table": 1,
    "cocktail-table-36": 8,
    chairs: 320,
  },
  source: {
    fileName: "springs-inventory.xlsx",
    note: "The Houston-region inventory workbook confirms the selectable table quantities and 320 chairs for The Chateau, including 30 72-inch round tables.",
  },
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
        configuration: createStonebrookConfiguration(),
      },
      {
        id: "hall_heritage_pine",
        slug: "heritage-pine",
        name: "Heritage Pine",
        configuration: createHeritagePineConfiguration(),
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
    id: "location_denton",
    slug: "denton",
    name: "Denton",
    halls: [
      {
        id: "hall_hidden_springs_ranch",
        slug: "hidden-springs-ranch",
        name: "Hidden Springs Ranch",
        configuration: {
          ...createHiddenSpringsRanchConfiguration(),
          inventory: DENTON_INVENTORY,
        },
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
        configuration: { ...createMagnoliaManorConfiguration(), inventory: MAGNOLIA_MANOR_INVENTORY },
      },
    ],
  },
  {
    id: "location_wallisville",
    slug: "wallisville",
    name: "Wallisville",
    halls: [
      {
        id: "hall_farmhouse_wallisville",
        slug: "farmhouse",
        name: "Farmhouse",
        configuration: {
          ...createFarmhouseWallisvilleConfiguration(),
          inventory: WALLISVILLE_FARMHOUSE_INVENTORY,
        },
      },
    ],
  },
  {
    id: "location_cypress",
    slug: "cypress",
    name: "Cypress",
    halls: [
      {
        id: "hall_the_chateau_cypress",
        slug: "the-chateau",
        name: "The Chateau",
        configuration: {
          ...createTheChateauCypressConfiguration(),
          inventory: CYPRESS_CHATEAU_INVENTORY,
        },
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
