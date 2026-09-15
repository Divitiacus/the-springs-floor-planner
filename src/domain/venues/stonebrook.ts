import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

/**
 * Source-traced from the Stonebrook floor plan supplied by the user.
 * The central event floor is confirmed at 80' x 60'. Surrounding rooms,
 * walls, door positions, and door widths remain proportional source traces.
 */
export function createStonebrookConfiguration(): HallConfiguration {
  const common = {
    fixed: true as const,
    measurementStatus: "source-traced" as const,
  };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...common,
      id: "stonebrook-main-floor",
      kind: "area",
      role: "main-floor",
      label: "Main Event Floor · 80′ × 60′",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      elevation: "floor",
      shape: { type: "rectangle", x: 192, y: 60, width: 960, height: 720 },
    },
    {
      ...common,
      id: "stonebrook-upper-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 40, y: 60, width: 152, height: 206 },
    },
    {
      ...common,
      id: "stonebrook-stage",
      kind: "area",
      role: "stage",
      label: "Stage · Raised · Placement Allowed",
      placementBehavior: "allowed",
      elevation: "raised",
      shape: { type: "rectangle", x: 40, y: 266, width: 152, height: 314 },
    },
    {
      ...common,
      id: "stonebrook-lower-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 40, y: 580, width: 152, height: 200 },
    },
    {
      ...common,
      id: "stonebrook-stage-stairs",
      kind: "stairs",
      label: "Stage Stairs",
      placementBehavior: "blocked",
      x: 192,
      y: 351,
      width: 25,
      height: 141,
      orientation: "horizontal",
      treadCount: 6,
    },
    {
      ...common,
      id: "stonebrook-buffet",
      kind: "area",
      role: "catering",
      label: "Permanent Buffet",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 1152, y: 60, width: 126, height: 327 },
    },
    {
      ...common,
      id: "stonebrook-east-stairs",
      kind: "stairs",
      label: "Stairs",
      placementBehavior: "blocked",
      x: 1152,
      y: 387,
      width: 126,
      height: 70,
      orientation: "vertical",
      treadCount: 12,
    },
    {
      ...common,
      id: "stonebrook-bar",
      kind: "area",
      role: "bar",
      label: "Permanent Bar",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 1152, y: 457, width: 126, height: 323 },
    },
    ...createWalls(common),
    ...createDoors(common),
    {
      ...common,
      id: "stonebrook-ceremony-label",
      kind: "direction-label",
      label: "CEREMONY SITE",
      placementBehavior: "restricted",
      x: 780,
      y: 806,
      width: 220,
    },
  ];

  return {
    // Logical drawing envelope with comparison space; not an overall building measurement.
    physicalWidthInches: 1320,
    physicalHeightInches: 840,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Stonebrook architecture source-traced from the supplied floor plan.",
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
    wall("stonebrook-north-wall", [40, 60, 1278, 60]),
    wall("stonebrook-south-wall", [40, 780, 1278, 780]),
    wall("stonebrook-west-wall", [40, 60, 40, 780]),
    wall("stonebrook-east-wall", [1278, 60, 1278, 780]),
    wall("stonebrook-west-interior", [192, 60, 192, 780]),
    wall("stonebrook-west-upper-divider", [40, 266, 192, 266]),
    wall("stonebrook-west-lower-divider", [40, 580, 192, 580]),
    wall("stonebrook-east-interior", [1152, 60, 1152, 780]),
    wall("stonebrook-east-upper-divider", [1152, 387, 1278, 387]),
    wall("stonebrook-east-lower-divider", [1152, 457, 1278, 457]),
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
    door("stonebrook-northwest-door", 204, 60, 43, 0, "counterclockwise"),
    door("stonebrook-north-center-door-a", 627, 60, 42, 0, "counterclockwise"),
    door("stonebrook-north-center-door-b", 712, 60, 42, 180, "clockwise"),
    door("stonebrook-northeast-door", 1221, 60, 57, 0, "counterclockwise"),
    door("stonebrook-upper-closet-door", 192, 132, 43, 90, "counterclockwise"),
    door("stonebrook-lower-closet-door", 192, 720, 43, -90, "clockwise"),
    door("stonebrook-southwest-door", 192, 780, 55, 0, "clockwise"),
    door("stonebrook-south-center-door-a", 627, 780, 42, 0, "clockwise"),
    door("stonebrook-south-center-door-b", 712, 780, 42, 180, "counterclockwise"),
    door("stonebrook-southeast-door", 1221, 780, 57, 0, "clockwise"),
  ];
}
