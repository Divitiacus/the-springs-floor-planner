import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  ReferenceFloorplanAsset,
} from "@/domain/floorplan";
import type { InventoryCatalog, InventoryConfiguration } from "@/domain/inventory";
import { createHeritagePineConfiguration } from "@/domain/venues/heritage-pine";
import { createHiddenMagnoliaConfiguration } from "@/domain/venues/hidden-magnolia";

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
    "sweetheart-table": 1,
    chairs: 320,
  },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "Table quantities come from the source workbook. The 320-chair total was confirmed separately for both Magnolia halls and is shared at the location level.",
  },
  additionalItems: [
    {
      sourceItemKey: "parson-table-7",
      name: "7-foot Parson Table",
      quantity: 6,
      note: "Indoors only; decor purposes only; no liquids or hot foods.",
    },
    {
      sourceItemKey: "cocktail-table-32",
      name: "32-inch Round Cocktail Table",
      quantity: 6,
      note: "Standing only.",
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
    halls: [
      {
        id: "hall_stonebrook",
        slug: "stonebrook",
        name: "Stonebrook",
        configuration: null,
      },
      {
        id: "hall_heritage_pine",
        slug: "heritage-pine",
        name: "Heritage Pine",
        configuration: createHeritagePineConfiguration(),
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
