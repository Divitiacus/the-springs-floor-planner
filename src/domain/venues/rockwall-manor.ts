import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration, SingleLevelHallConfiguration } from "@/domain/location-catalog";
import { createMagnoliaManorConfiguration } from "@/domain/venues/magnolia-manor";

const FIRST_FLOOR_LEFT = 50;
const FIRST_FLOOR_RIGHT = 860;
const SECOND_FLOOR_LEFT = 980;
const SECOND_FLOOR_RIGHT = 1790;

/**
 * Rockwall Manor uses Magnolia Manor's measured two-floor drawing, mirrored
 * horizontally to match the supplied Rockwall plan. This puts the buffet and
 * fireplace on the west, and the bar and downstairs double doors on the east.
 */
export function createRockwallManorConfiguration(): HallConfiguration {
  const source = createMagnoliaManorConfiguration();
  if (!isSingleLevel(source)) {
    throw new Error("Magnolia Manor must remain a single-canvas source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Rockwall Manor matches Magnolia Manor's confirmed 67′6″ × 67′6″ reception-hall dimensions, 12-foot second-floor balcony, and 7′8″ porch depth. The supplied Rockwall plan mirrors the service fixtures, side doors, and fireplace horizontally.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map(mirrorElement),
  };
}

function mirrorElement(element: FixedArchitectureElement): FixedArchitectureElement {
  const renamed = renameElement(element);
  const [left, right] = isSecondFloorElement(element)
    ? [SECOND_FLOOR_LEFT, SECOND_FLOOR_RIGHT]
    : [FIRST_FLOOR_LEFT, FIRST_FLOOR_RIGHT];

  switch (renamed.kind) {
    case "area":
      return {
        ...renamed,
        shape: renamed.shape.type === "rectangle"
          ? {
              ...renamed.shape,
              x: mirrorRectangleX(renamed.shape.x, renamed.shape.width, left, right),
            }
          : {
              ...renamed.shape,
              points: mirrorPoints(renamed.shape.points, left, right),
            },
      };
    case "wall":
    case "railing":
      return { ...renamed, points: mirrorPoints(renamed.points, left, right) };
    case "door":
      return {
        ...renamed,
        x: left + right - renamed.x,
        rotation: normalizeRotation(180 - renamed.rotation),
        swingDirection: renamed.swingDirection === "clockwise" ? "counterclockwise" : "clockwise",
      };
    case "stairs":
      return {
        ...renamed,
        x: mirrorRectangleX(renamed.x, renamed.width, left, right),
      };
    case "direction-label":
      return {
        ...renamed,
        x: mirrorRectangleX(renamed.x, renamed.width, left, right),
        rotation: normalizeRotation(180 - (renamed.rotation ?? 0)),
      };
    case "label":
      return {
        ...renamed,
        x: mirrorRectangleX(renamed.x, renamed.width, left, right),
        rotation: -(renamed.rotation ?? 0),
      };
    case "path":
      return renamed;
  }
}

function renameElement(element: FixedArchitectureElement): FixedArchitectureElement {
  return {
    ...element,
    id: swapHorizontalDirection(element.id.replace(/^magnolia-manor/, "rockwall-manor")),
    physicalNote: element.physicalNote?.replaceAll("Magnolia Manor", "Rockwall Manor"),
  };
}

function swapHorizontalDirection(id: string): string {
  return id
    .replaceAll("west", "horizontal-direction")
    .replaceAll("east", "west")
    .replaceAll("horizontal-direction", "east");
}

function isSecondFloorElement(element: FixedArchitectureElement): boolean {
  if (element.id.includes("second-floor") || element.id.includes("balcony") || element.id.includes("open-")) {
    return true;
  }

  if (element.kind === "area") {
    return element.shape.type === "rectangle"
      ? element.shape.x >= SECOND_FLOOR_LEFT
      : element.shape.points.some((coordinate, index) => index % 2 === 0 && coordinate >= SECOND_FLOOR_LEFT);
  }

  if (element.kind === "wall" || element.kind === "railing") {
    return element.points.some((coordinate, index) => index % 2 === 0 && coordinate >= SECOND_FLOOR_LEFT);
  }

  if (element.kind === "door" || element.kind === "stairs" || element.kind === "direction-label" || element.kind === "label") {
    return element.x >= SECOND_FLOOR_LEFT;
  }

  return false;
}

function mirrorRectangleX(x: number, width: number, left: number, right: number): number {
  return left + right - x - width;
}

function mirrorPoints(points: readonly number[], left: number, right: number): number[] {
  return points.map((coordinate, index) => index % 2 === 0 ? left + right - coordinate : coordinate);
}

function normalizeRotation(rotation: number): number {
  const normalized = ((rotation % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
}

function isSingleLevel(configuration: HallConfiguration): configuration is SingleLevelHallConfiguration {
  return !("levels" in configuration);
}
