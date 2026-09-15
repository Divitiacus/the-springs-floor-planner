import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

/**
 * Source-traced from the Villa Tuscana floor plan supplied by the user.
 * The central event floor is confirmed at 80' x 60'. Surrounding rooms,
 * walls, door positions, and door widths remain proportional source traces.
 */
export function createVillaTuscanaConfiguration(): HallConfiguration {
  const common = {
    fixed: true as const,
    measurementStatus: "source-traced" as const,
  };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...common,
      id: "villa-tuscana-main-floor",
      kind: "area",
      role: "main-floor",
      label: "Main Event Floor · 80′ × 60′",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      elevation: "floor",
      shape: { type: "rectangle", x: 169, y: 60, width: 960, height: 720 },
    },
    {
      ...common,
      id: "villa-tuscana-bar",
      kind: "area",
      role: "bar",
      label: "Permanent Bar",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 40, y: 60, width: 129, height: 324 },
    },
    {
      ...common,
      id: "villa-tuscana-west-stairs",
      kind: "stairs",
      label: "Stairs",
      placementBehavior: "blocked",
      x: 40,
      y: 384,
      width: 129,
      height: 73,
      orientation: "vertical",
      treadCount: 12,
    },
    {
      ...common,
      id: "villa-tuscana-buffet",
      kind: "area",
      role: "catering",
      label: "Permanent Buffet",
      placementBehavior: "blocked",
      elevation: "floor",
      labelRotation: -90,
      shape: { type: "rectangle", x: 40, y: 457, width: 129, height: 323 },
    },
    {
      ...common,
      id: "villa-tuscana-upper-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 1129, y: 60, width: 150, height: 205 },
    },
    {
      ...common,
      id: "villa-tuscana-stage",
      kind: "area",
      role: "stage",
      label: "Stage · Raised · Placement Allowed",
      placementBehavior: "allowed",
      elevation: "raised",
      shape: { type: "rectangle", x: 1129, y: 265, width: 150, height: 314 },
    },
    {
      ...common,
      id: "villa-tuscana-lower-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 1129, y: 579, width: 150, height: 201 },
    },
    {
      ...common,
      id: "villa-tuscana-stage-stairs",
      kind: "stairs",
      label: "Stage Stairs",
      placementBehavior: "blocked",
      x: 1104,
      y: 350,
      width: 25,
      height: 143,
      orientation: "horizontal",
      treadCount: 6,
    },
    ...createWalls(common),
    ...createDoors(common),
  ];

  return {
    physicalWidthInches: 1320,
    physicalHeightInches: 840,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Villa Tuscana architecture source-traced from the supplied floor plan.",
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
    wall("villa-tuscana-north-wall", [40, 60, 1279, 60]),
    wall("villa-tuscana-south-wall", [40, 780, 1279, 780]),
    wall("villa-tuscana-west-wall", [40, 60, 40, 780]),
    wall("villa-tuscana-east-wall", [1279, 60, 1279, 780]),
    wall("villa-tuscana-west-interior", [169, 60, 169, 780]),
    wall("villa-tuscana-west-upper-divider", [40, 384, 169, 384]),
    wall("villa-tuscana-west-lower-divider", [40, 457, 169, 457]),
    wall("villa-tuscana-east-interior", [1129, 60, 1129, 780]),
    wall("villa-tuscana-east-upper-divider", [1129, 265, 1279, 265]),
    wall("villa-tuscana-east-lower-divider", [1129, 579, 1279, 579]),
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
    door("villa-tuscana-northwest-door", 56, 60, 43, 0, "counterclockwise"),
    door("villa-tuscana-north-center-door-a", 608, 60, 42, 0, "counterclockwise"),
    door("villa-tuscana-north-center-door-b", 692, 60, 42, 180, "clockwise"),
    door("villa-tuscana-northeast-door", 1073, 60, 56, 0, "counterclockwise"),
    door("villa-tuscana-upper-closet-door", 1129, 133, 43, 90, "clockwise"),
    door("villa-tuscana-lower-closet-door", 1129, 719, 43, -90, "counterclockwise"),
    door("villa-tuscana-southwest-door", 56, 780, 43, 0, "clockwise"),
    door("villa-tuscana-south-center-door-a", 608, 780, 42, 0, "clockwise"),
    door("villa-tuscana-south-center-door-b", 692, 780, 42, 180, "counterclockwise"),
    door("villa-tuscana-southeast-door", 1073, 780, 56, 0, "clockwise"),
  ];
}
