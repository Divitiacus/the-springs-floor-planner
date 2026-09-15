import type { FixedArchitectureElement, VenueFloorRegion, VenueTemplate } from "@/domain/floorplan";
import {
  isMultiLevelHallConfiguration,
  type HallCatalogEntry,
  type HallLevelConfiguration,
  type LocationCatalogEntry,
} from "@/domain/location-catalog";

export function createHallVenueTemplate(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
  levelId?: string,
): VenueTemplate {
  const { configuration } = hall;
  if (!configuration) throw new Error(`Hall ${hall.id} does not have floor plan geometry yet.`);

  const level = resolveHallLevel(configuration, levelId);
  const hallBounds = level.planningBounds ?? findMainFloorBounds(level.fixedArchitecturalElements) ?? findRegionBounds(level.usableAreas);
  if (!hallBounds) throw new Error(`Hall ${hall.id} level ${level.id} must define planning bounds or usable floor geometry.`);

  return {
    id: `${location.id}:${hall.id}`,
    name: `${location.name} · ${hall.name}`,
    levelId: level.id,
    levelSlug: level.slug,
    levelName: level.name,
    coordinateUnit: "inches",
    physicalWidthInches: level.physicalWidthInches,
    physicalHeightInches: level.physicalHeightInches,
    physicalDimensionStatus: level.physicalDimensionStatus,
    hall: { ...hallBounds },
    elements: [...level.fixedArchitecturalElements],
    usableAreas: level.usableAreas ? [...level.usableAreas] : undefined,
    voidAreas: level.voidAreas ? [...level.voidAreas] : undefined,
    defaultObjectPosition: level.defaultObjectPosition ? { ...level.defaultObjectPosition } : undefined,
    referenceAsset: level.floorplanAsset,
  };
}

export function createHallVenueTemplates(
  location: LocationCatalogEntry,
  hall: HallCatalogEntry,
): VenueTemplate[] {
  const { configuration } = hall;
  if (!configuration) throw new Error(`Hall ${hall.id} does not have floor plan geometry yet.`);
  if (!isMultiLevelHallConfiguration(configuration)) return [createHallVenueTemplate(location, hall)];

  const orderedLevelIds = [
    configuration.defaultLevelId,
    ...configuration.levels.filter((level) => level.id !== configuration.defaultLevelId).map((level) => level.id),
  ];
  return orderedLevelIds.map((id) => createHallVenueTemplate(location, hall, id));
}

function resolveHallLevel(
  configuration: NonNullable<HallCatalogEntry["configuration"]>,
  levelId?: string,
): HallLevelConfiguration {
  if (isMultiLevelHallConfiguration(configuration)) {
    const requestedId = levelId ?? configuration.defaultLevelId;
    const level = configuration.levels.find((candidate) => candidate.id === requestedId);
    if (!level) throw new Error(`Floor level ${requestedId} is not configured for this hall.`);
    return level;
  }

  return {
    id: "main-floor",
    slug: "main-floor",
    name: "Main Floor",
    physicalWidthInches: configuration.physicalWidthInches,
    physicalHeightInches: configuration.physicalHeightInches,
    physicalDimensionStatus: configuration.physicalDimensionStatus,
    physicalDimensionNote: configuration.physicalDimensionNote,
    fixedArchitecturalElements: configuration.fixedArchitecturalElements,
    floorplanAsset: configuration.floorplanAsset,
  };
}

function findMainFloorBounds(elements: readonly FixedArchitectureElement[]) {
  const mainFloor = elements.find(
    (element): element is Extract<FixedArchitectureElement, { kind: "area" }> =>
      element.kind === "area" && element.role === "main-floor" && element.shape.type === "rectangle",
  );
  if (!mainFloor || mainFloor.shape.type !== "rectangle") return undefined;
  const { x, y, width, height } = mainFloor.shape;
  return { x, y, width, height };
}

function findRegionBounds(regions: readonly VenueFloorRegion[] | undefined) {
  if (!regions?.length) return undefined;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const region of regions) {
    if (region.shape.type === "rectangle") {
      xs.push(region.shape.x, region.shape.x + region.shape.width);
      ys.push(region.shape.y, region.shape.y + region.shape.height);
    } else {
      region.shape.points.forEach((value, index) => (index % 2 === 0 ? xs : ys).push(value));
    }
  }
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}
