import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

/**
 * Source-traced from the Heritage Pine floor plan supplied by the user.
 * The central event floor is confirmed at 80' x 60'. Surrounding rooms,
 * walls, door positions, and door widths remain proportional source traces.
 */
export function createHeritagePineConfiguration(): HallConfiguration {
  const common = {
    fixed: true as const,
    measurementStatus: "source-traced" as const,
  };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...common,
      id: "heritage-pine-main-floor",
      kind: "area",
      role: "main-floor",
      label: "Main Event Floor · 80′ × 60′",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      elevation: "floor",
      shape: { type: "rectangle", x: 167, y: 60, width: 960, height: 720 },
    },
    {
      ...common,
      id: "heritage-pine-buffet",
      kind: "area",
      role: "catering",
      label: "Permanent Buffet",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 40, y: 60, width: 127, height: 326 },
    },
    {
      ...common,
      id: "heritage-pine-west-stairs",
      kind: "stairs",
      label: "Stairs",
      placementBehavior: "blocked",
      x: 40,
      y: 386,
      width: 127,
      height: 70,
      orientation: "vertical",
      treadCount: 12,
    },
    {
      ...common,
      id: "heritage-pine-bar",
      kind: "area",
      role: "bar",
      label: "Permanent Bar",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 40, y: 456, width: 127, height: 324 },
    },
    {
      ...common,
      id: "heritage-pine-upper-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 1127, y: 60, width: 152, height: 204 },
    },
    {
      ...common,
      id: "heritage-pine-stage",
      kind: "area",
      role: "stage",
      label: "Stage · Raised · Placement Allowed",
      placementBehavior: "allowed",
      elevation: "raised",
      shape: { type: "rectangle", x: 1127, y: 264, width: 152, height: 315 },
    },
    {
      ...common,
      id: "heritage-pine-lower-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 1127, y: 579, width: 152, height: 201 },
    },
    {
      ...common,
      id: "heritage-pine-stage-stairs",
      kind: "stairs",
      label: "Stage Stairs",
      placementBehavior: "blocked",
      x: 1102,
      y: 350,
      width: 25,
      height: 144,
      orientation: "horizontal",
      treadCount: 6,
    },
    ...createWalls(common),
    ...createDoors(common),
    {
      ...common,
      id: "heritage-pine-ceremony-label",
      kind: "direction-label",
      label: "CEREMONY SITE",
      placementBehavior: "restricted",
      x: 690,
      y: 806,
      width: 250,
    },
  ];

  return {
    // Logical drawing envelope with comparison space; not an overall building measurement.
    physicalWidthInches: 1320,
    physicalHeightInches: 840,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Heritage Pine architecture source-traced from the supplied floor plan.",
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
    wall("heritage-pine-north-wall", [40, 60, 1279, 60]),
    wall("heritage-pine-south-wall", [40, 780, 1279, 780]),
    wall("heritage-pine-west-wall", [40, 60, 40, 780]),
    wall("heritage-pine-east-wall", [1279, 60, 1279, 780]),
    wall("heritage-pine-west-interior", [167, 60, 167, 780]),
    wall("heritage-pine-west-upper-divider", [40, 386, 167, 386]),
    wall("heritage-pine-west-lower-divider", [40, 456, 167, 456]),
    wall("heritage-pine-east-interior", [1127, 60, 1127, 780]),
    wall("heritage-pine-east-upper-divider", [1127, 264, 1279, 264]),
    wall("heritage-pine-east-lower-divider", [1127, 579, 1279, 579]),
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
    swingAngle = 42,
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
    door("heritage-pine-northwest-door", 98, 60, 43, 180, "clockwise"),
    door("heritage-pine-northeast-door", 1070, 60, 43, 0, "counterclockwise"),
    door("heritage-pine-upper-closet-door", 1127, 130, 43, 90, "clockwise"),
    door("heritage-pine-lower-closet-door", 1127, 717, 43, -90, "counterclockwise"),
    door("heritage-pine-southwest-door", 56, 780, 43, 0, "clockwise"),
    door("heritage-pine-south-center-door-a", 606, 780, 42, 0, "clockwise"),
    door("heritage-pine-south-center-door-b", 690, 780, 42, 180, "counterclockwise"),
    door("heritage-pine-southeast-door", 1070, 780, 43, 0, "clockwise"),
  ];
}
