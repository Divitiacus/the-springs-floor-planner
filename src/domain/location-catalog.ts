export type HallConfiguration = {
  physicalDimensions?: {
    widthFeet: number;
    depthFeet: number;
  };
  baseFloorplanId?: string;
  tableInventoryProfileId?: string;
  chairInventoryProfileId?: string;
  fixedObjectSetId?: string;
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
        configuration: {},
      },
      {
        id: "hall_hidden_magnolia",
        slug: "the-hidden-magnolia",
        name: "The Hidden Magnolia",
        configuration: {},
      },
    ],
  },
];

export function getLocationBySlug(slug: string | undefined) {
  return SPRINGS_LOCATIONS.find((location) => location.slug === slug);
}

export function getHallBySlug(location: LocationCatalogEntry | undefined, slug: string | undefined) {
  return location?.halls.find((hall) => hall.slug === slug);
}
