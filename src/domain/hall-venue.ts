import type { HallCatalogEntry, LocationCatalogEntry } from "@/domain/location-catalog";
import type { VenueTemplate } from "@/domain/floorplan";

export function createHallVenueTemplate(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
): VenueTemplate {
  const { configuration } = hall;

  return {
    id: `${location.id}:${hall.id}`,
    name: `${location.name} · ${hall.name}`,
    coordinateUnit: "inches",
    physicalWidthInches: configuration.physicalWidthInches,
    physicalHeightInches: configuration.physicalHeightInches,
    physicalDimensionStatus: configuration.physicalDimensionStatus,
    hall: {
      x: 0,
      y: 0,
      width: configuration.physicalWidthInches,
      height: configuration.physicalHeightInches,
    },
    elements: [],
  };
}
