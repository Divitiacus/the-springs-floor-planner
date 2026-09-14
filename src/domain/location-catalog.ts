import type { InventoryConfiguration } from "@/domain/inventory";
import { feetToInches } from "@/domain/physical-units";

export type HallConfiguration = {
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: "confirmed" | "provisional";
  physicalDimensionNote?: string;
  fixedArchitecturalElements: readonly {
    id: string;
    kind: string;
    xInches: number;
    yInches: number;
  }[];
  floorplanAsset: { id: string; source: string } | null;
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
        configuration: createProvisionalMagnoliaConfiguration(),
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
    fixedArchitecturalElements: [],
    floorplanAsset: null,
    inventory: {
      "round-table-60": null,
      "rectangle-table-6": null,
      "rectangle-table-8": null,
      "sweetheart-table": null,
      chairs: null,
    },
  };
}

export function getLocationBySlug(slug: string | undefined) {
  return SPRINGS_LOCATIONS.find((location) => location.slug === slug);
}

export function getHallBySlug(location: LocationCatalogEntry | undefined, slug: string | undefined) {
  return location?.halls.find((hall) => hall.slug === slug);
}
