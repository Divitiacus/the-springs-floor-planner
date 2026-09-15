import type { HallCatalogEntry, LocationCatalogEntry } from "@/domain/location-catalog";
import type { FixedArchitectureElement, VenueTemplate } from "@/domain/floorplan";

export function createHallVenueTemplate(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
): VenueTemplate {
  const { configuration } = hall;
  if (!configuration) throw new Error(`Hall ${hall.id} does not have floor plan geometry yet.`);
  const mainFloor = configuration.fixedArchitecturalElements.find(
    (element): element is Extract<FixedArchitectureElement, { kind: "area" }> =>
      element.kind === "area" && element.role === "main-floor",
  );

  if (!mainFloor || mainFloor.shape.type !== "rectangle") {
    throw new Error(`Hall ${hall.id} must define a rectangular main event floor.`);
  }

  return {
    id: `${location.id}:${hall.id}`,
    name: `${location.name} · ${hall.name}`,
    coordinateUnit: "inches",
    physicalWidthInches: configuration.physicalWidthInches,
    physicalHeightInches: configuration.physicalHeightInches,
    physicalDimensionStatus: configuration.physicalDimensionStatus,
    hall: {
      x: mainFloor.shape.x,
      y: mainFloor.shape.y,
      width: mainFloor.shape.width,
      height: mainFloor.shape.height,
    },
    elements: [...configuration.fixedArchitecturalElements],
    referenceAsset: configuration.floorplanAsset,
  };
}
