import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

/**
 * Source-traced from the Stonecreek Reserve floor plan supplied by the user.
 * The central event floor is confirmed at 80' x 60'. Surrounding rooms,
 * walls, door positions, and door widths remain proportional source traces.
 */
export function createStonecreekReserveConfiguration(): HallConfiguration {
  const common = {
    fixed: true as const,
    measurementStatus: "source-traced" as const,
  };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...common,
      id: "stonecreek-reserve-main-floor",
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
      id: "stonecreek-reserve-upper-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 40, y: 60, width: 152, height: 203 },
    },
    {
      ...common,
      id: "stonecreek-reserve-stage",
      kind: "area",
      role: "stage",
      label: "Stage · Raised · Placement Allowed",
      placementBehavior: "allowed",
      elevation: "raised",
      shape: { type: "rectangle", x: 40, y: 263, width: 152, height: 314 },
    },
    {
      ...common,
      id: "stonecreek-reserve-lower-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 40, y: 577, width: 152, height: 203 },
    },
    {
      ...common,
      id: "stonecreek-reserve-stage-stairs",
      kind: "stairs",
      label: "Stage Stairs",
      placementBehavior: "blocked",
      x: 192,
      y: 350,
      width: 25,
      height: 144,
      orientation: "horizontal",
      treadCount: 6,
    },
    {
      ...common,
      id: "stonecreek-reserve-bar",
      kind: "area",
      role: "bar",
      label: "Permanent Bar",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 1152, y: 60, width: 127, height: 326 },
    },
    {
      ...common,
      id: "stonecreek-reserve-east-stairs",
      kind: "stairs",
      label: "Stairs",
      placementBehavior: "blocked",
      x: 1152,
      y: 386,
      width: 127,
      height: 69,
      orientation: "vertical",
      treadCount: 12,
    },
    {
      ...common,
      id: "stonecreek-reserve-buffet",
      kind: "area",
      role: "catering",
      label: "Permanent Buffet",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 1152, y: 455, width: 127, height: 325 },
    },
    ...createWalls(common),
    ...createDoors(common),
  ];

  return {
    physicalWidthInches: 1320,
    physicalHeightInches: 840,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Stonecreek Reserve architecture source-traced from the supplied floor plan.",
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
    wall("stonecreek-reserve-north-wall", [40, 60, 1279, 60]),
    wall("stonecreek-reserve-south-wall", [40, 780, 1279, 780]),
    wall("stonecreek-reserve-west-wall", [40, 60, 40, 780]),
    wall("stonecreek-reserve-east-wall", [1279, 60, 1279, 780]),
    wall("stonecreek-reserve-west-interior", [192, 60, 192, 780]),
    wall("stonecreek-reserve-west-upper-divider", [40, 263, 192, 263]),
    wall("stonecreek-reserve-west-lower-divider", [40, 577, 192, 577]),
    wall("stonecreek-reserve-east-interior", [1152, 60, 1152, 780]),
    wall("stonecreek-reserve-east-upper-divider", [1152, 386, 1279, 386]),
    wall("stonecreek-reserve-east-lower-divider", [1152, 455, 1279, 455]),
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
    door("stonecreek-reserve-northwest-door", 204, 60, 43, 0, "counterclockwise"),
    door("stonecreek-reserve-north-center-door-a", 628, 60, 42, 0, "counterclockwise"),
    door("stonecreek-reserve-north-center-door-b", 713, 60, 42, 180, "clockwise"),
    door("stonecreek-reserve-northeast-door", 1220, 60, 57, 0, "counterclockwise"),
    door("stonecreek-reserve-upper-closet-door", 192, 132, 43, 90, "counterclockwise"),
    door("stonecreek-reserve-lower-closet-door", 192, 720, 43, -90, "clockwise"),
    door("stonecreek-reserve-southwest-door", 204, 780, 43, 0, "clockwise"),
    door("stonecreek-reserve-south-center-door-a", 628, 780, 42, 0, "clockwise"),
    door("stonecreek-reserve-south-center-door-b", 713, 780, 42, 180, "counterclockwise"),
    door("stonecreek-reserve-southeast-door", 1220, 780, 57, 0, "clockwise"),
  ];
}
