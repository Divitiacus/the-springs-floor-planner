import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  ReferenceFloorplanAsset,
} from "@/domain/floorplan";
import type { InventoryConfiguration } from "@/domain/inventory";
import { feetToInches } from "@/domain/physical-units";
import { createHiddenMagnoliaConfiguration } from "@/domain/venues/hidden-magnolia";

export type HallConfiguration = {
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly FixedArchitectureElement[];
  floorplanAsset: ReferenceFloorplanAsset | null;
  inventory: InventoryConfiguration;
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
  halls: readonly HallCatalogEntry[];
};

const MAGNOLIA_INVENTORY: InventoryConfiguration = {
  "round-table-60": null,
  "rectangle-table-6": null,
  "rectangle-table-8": null,
  "sweetheart-table": null,
  chairs: null,
};

export const SPRINGS_LOCATIONS: readonly LocationCatalogEntry[] = [
  {
    id: "location_magnolia",
    slug: "magnolia",
    name: "Magnolia",
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
        configuration: createHiddenMagnoliaConfiguration(MAGNOLIA_INVENTORY),
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
    inventory: MAGNOLIA_INVENTORY,
  };
}

export function getLocationBySlug(slug: string | undefined) {
  return SPRINGS_LOCATIONS.find((location) => location.slug === slug);
}

export function getHallBySlug(location: LocationCatalogEntry | undefined, slug: string | undefined) {
  return location?.halls.find((hall) => hall.slug === slug);
}
