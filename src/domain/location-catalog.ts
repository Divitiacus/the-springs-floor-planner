import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  ReferenceFloorplanAsset,
} from "@/domain/floorplan";
import type { InventoryCatalog, InventoryConfiguration } from "@/domain/inventory";
import { feetToInches } from "@/domain/physical-units";
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
  configuration: HallConfiguration;
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
    chairs: null,
  },
  source: {
    fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx",
    note: "The source identifies Magnolia inventory but does not assign it by hall; shared at the location level pending confirmation.",
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
        configuration: createProvisionalMagnoliaConfiguration(),
      },
      {
        id: "hall_hidden_magnolia",
        slug: "the-hidden-magnolia",
        name: "The Hidden Magnolia",
        configuration: createHiddenMagnoliaConfiguration(),
      },
    ],
  },
];

function createProvisionalMagnoliaConfiguration(): HallConfiguration {
  return {
    physicalWidthInches: feetToInches(80),
    physicalHeightInches: feetToInches(60),
    physicalDimensionStatus: "provisional",
    physicalDimensionNote: "Approximate working envelope; replace when measured hall dimensions are confirmed.",
    fixedArchitecturalElements: [
      {
        id: "pinehaven-main-floor",
        kind: "area",
        role: "main-floor",
        label: "Main Event Floor",
        fixed: true,
        placementBehavior: "allowed",
        measurementStatus: "provisional",
        elevation: "floor",
        shape: { type: "rectangle", x: 0, y: 0, width: 960, height: 720 },
      },
    ],
    floorplanAsset: null,
  };
}

export function resolveInventoryConfiguration(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
): InventoryConfiguration {
  return {
    ...(location.inventory?.limits ?? {}),
    ...(hall.configuration.inventory?.limits ?? {}),
  };
}

export function getLocationBySlug(slug: string | undefined) {
  return SPRINGS_LOCATIONS.find((location) => location.slug === slug);
}

export function getHallBySlug(location: LocationCatalogEntry | undefined, slug: string | undefined) {
  return location?.halls.find((hall) => hall.slug === slug);
}
