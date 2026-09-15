import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

/**
 * Source-traced from Magnolia Floor Plan_.pdf. The 80' × 60' central event floor
 * is the only confirmed dimensional anchor. Surrounding geometry is proportional
 * to that anchor and remains provisional until field measurements are available.
 */
export function createHiddenMagnoliaConfiguration(): HallConfiguration {
  const common = {
    fixed: true as const,
    measurementStatus: "source-traced" as const,
  };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...common,
      id: "hidden-magnolia-main-floor",
      kind: "area",
      role: "main-floor",
      label: "Main Event Floor · 80′ × 60′",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      elevation: "floor",
      shape: { type: "rectangle", x: 180, y: 60, width: 960, height: 720 },
    },
    {
      ...common,
      id: "hidden-magnolia-upper-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "polygon", points: [28, 60, 180, 60, 180, 264, 28, 264] },
    },
    {
      ...common,
      id: "hidden-magnolia-stage",
      kind: "area",
      role: "stage",
      label: "Stage · Raised · Placement Allowed",
      placementBehavior: "allowed",
      elevation: "raised",
      shape: { type: "polygon", points: [28, 264, 180, 264, 180, 580, 28, 580] },
    },
    {
      ...common,
      id: "hidden-magnolia-lower-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "polygon", points: [28, 580, 180, 580, 180, 780, 28, 780] },
    },
    {
      ...common,
      id: "hidden-magnolia-catering",
      kind: "area",
      role: "catering",
      label: "Catering / Service",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "polygon", points: [1140, 60, 1268, 60, 1268, 386, 1140, 386] },
    },
    {
      ...common,
      id: "hidden-magnolia-bar",
      kind: "area",
      role: "bar",
      label: "Permanent Bar",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 1182, y: 505, width: 42, height: 205 },
    },
    {
      ...common,
      id: "hidden-magnolia-stage-stairs",
      kind: "stairs",
      label: "Stage Stairs",
      placementBehavior: "blocked",
      x: 180,
      y: 352,
      width: 24,
      height: 142,
      orientation: "horizontal",
      treadCount: 6,
    },
    {
      ...common,
      id: "hidden-magnolia-east-stairs",
      kind: "stairs",
      label: "Stairs",
      placementBehavior: "blocked",
      x: 1140,
      y: 386,
      width: 128,
      height: 71,
      orientation: "vertical",
      treadCount: 6,
    },
    ...createWalls(common),
    ...createDoors(common),
    {
      ...common,
      id: "hidden-magnolia-parking-label",
      kind: "direction-label",
      label: "TO PARKING LOT",
      placementBehavior: "restricted",
      x: 554,
      y: 15,
      width: 212,
    },
    {
      ...common,
      id: "hidden-magnolia-ceremony-label",
      kind: "direction-label",
      label: "TO CEREMONY SITE",
      placementBehavior: "restricted",
      x: 544,
      y: 806,
      width: 232,
    },
  ];

  return {
    // Logical drawing envelope with comparison space; not an overall building measurement.
    physicalWidthInches: 1320,
    physicalHeightInches: 840,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding architecture source-traced and provisional.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createWalls(
  common: { fixed: true; measurementStatus: "source-traced" },
): FixedArchitectureElement[] {
  const wall = (id: string, points: number[]): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "wall",
    label: "Fixed wall",
    placementBehavior: "blocked",
    points,
  });

  return [
    wall("hidden-magnolia-north-wall", [28, 60, 1268, 60]),
    wall("hidden-magnolia-south-wall", [28, 780, 1268, 780]),
    wall("hidden-magnolia-west-wall", [28, 60, 28, 780]),
    wall("hidden-magnolia-east-wall", [1268, 60, 1268, 780]),
    wall("hidden-magnolia-west-upper-divider", [28, 264, 180, 264]),
    wall("hidden-magnolia-west-lower-divider", [28, 580, 180, 580]),
    wall("hidden-magnolia-west-interior", [180, 60, 180, 352, 180, 494, 180, 780]),
    wall("hidden-magnolia-east-interior", [1140, 60, 1140, 780]),
    wall("hidden-magnolia-east-stair-top", [1140, 386, 1268, 386]),
    wall("hidden-magnolia-east-stair-bottom", [1140, 457, 1268, 457]),
  ];
}

function createDoors(
  common: { fixed: true; measurementStatus: "source-traced" },
): FixedArchitectureElement[] {
  const door = (
    id: string,
    x: number,
    y: number,
    width: number,
    rotation: number,
    swingDirection: "clockwise" | "counterclockwise",
    swingAngle?: number,
  ): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "door",
    label: "Door · width provisional",
    placementBehavior: "restricted",
    x,
    y,
    width,
    rotation,
    swingDirection,
    swingAngle,
  });

  return [
    door("hidden-magnolia-northwest-door", 180, 60, 55, 0, "counterclockwise", 32),
    door("hidden-magnolia-north-center-door-a", 617, 60, 44, 0, "counterclockwise", 42),
    door("hidden-magnolia-north-center-door-b", 705, 60, 44, 180, "clockwise", 42),
    door("hidden-magnolia-northeast-door", 1210, 60, 58, 0, "counterclockwise", 32),
    door("hidden-magnolia-southwest-door", 180, 780, 55, 0, "clockwise", 32),
    door("hidden-magnolia-south-center-door-a", 617, 780, 44, 0, "clockwise", 42),
    door("hidden-magnolia-south-center-door-b", 705, 780, 44, 180, "counterclockwise", 42),
    door("hidden-magnolia-southeast-door", 1210, 780, 58, 0, "clockwise", 32),
    door("hidden-magnolia-upper-closet-door", 180, 131, 46, 90, "clockwise"),
    door("hidden-magnolia-lower-closet-door", 180, 673, 46, 90, "counterclockwise"),
  ];
}
