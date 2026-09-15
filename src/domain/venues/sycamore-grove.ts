import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

/**
 * Source-traced from the Sycamore Grove floor plan supplied by the user.
 * The central event floor is confirmed at 80' x 60'. Surrounding rooms,
 * walls, door positions, and door widths remain proportional source traces.
 */
export function createSycamoreGroveConfiguration(): HallConfiguration {
  const common = {
    fixed: true as const,
    measurementStatus: "source-traced" as const,
  };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...common,
      id: "sycamore-grove-main-floor",
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
      id: "sycamore-grove-upper-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 40, y: 60, width: 152, height: 204 },
    },
    {
      ...common,
      id: "sycamore-grove-stage",
      kind: "area",
      role: "stage",
      label: "Stage · Raised · Placement Allowed",
      placementBehavior: "allowed",
      elevation: "raised",
      shape: { type: "rectangle", x: 40, y: 264, width: 152, height: 312 },
    },
    {
      ...common,
      id: "sycamore-grove-lower-closet",
      kind: "area",
      role: "closet",
      label: "Table / Chair Closet",
      placementBehavior: "blocked",
      elevation: "floor",
      shape: { type: "rectangle", x: 40, y: 576, width: 152, height: 204 },
    },
    {
      ...common,
      id: "sycamore-grove-stage-stairs",
      kind: "stairs",
      label: "Stage Stairs",
      placementBehavior: "blocked",
      x: 192,
      y: 349,
      width: 25,
      height: 142,
      orientation: "horizontal",
      treadCount: 6,
    },
    {
      ...common,
      id: "sycamore-grove-bar",
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
      id: "sycamore-grove-east-stairs",
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
      id: "sycamore-grove-buffet",
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
    {
      ...common,
      id: "sycamore-grove-ceremony-label",
      kind: "direction-label",
      label: "CEREMONY SITE",
      placementBehavior: "restricted",
      x: 520,
      y: 20,
      width: 280,
    },
    {
      ...common,
      id: "sycamore-grove-front-label",
      kind: "direction-label",
      label: "FRONT OF HALL",
      placementBehavior: "restricted",
      x: 650,
      y: 806,
      width: 180,
    },
  ];

  return {
    physicalWidthInches: 1320,
    physicalHeightInches: 840,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Sycamore Grove architecture source-traced from the supplied floor plan.",
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
    wall("sycamore-grove-north-wall", [40, 60, 1279, 60]),
    wall("sycamore-grove-south-wall", [40, 780, 1279, 780]),
    wall("sycamore-grove-west-wall", [40, 60, 40, 780]),
    wall("sycamore-grove-east-wall", [1279, 60, 1279, 780]),
    wall("sycamore-grove-west-interior", [192, 60, 192, 780]),
    wall("sycamore-grove-west-upper-divider", [40, 264, 192, 264]),
    wall("sycamore-grove-west-lower-divider", [40, 576, 192, 576]),
    wall("sycamore-grove-east-interior", [1152, 60, 1152, 780]),
    wall("sycamore-grove-east-upper-divider", [1152, 386, 1279, 386]),
    wall("sycamore-grove-east-lower-divider", [1152, 455, 1279, 455]),
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
    door("sycamore-grove-northwest-door", 204, 60, 43, 0, "counterclockwise"),
    door("sycamore-grove-north-center-door-a", 627, 60, 42, 0, "counterclockwise"),
    door("sycamore-grove-north-center-door-b", 712, 60, 42, 180, "clockwise"),
    door("sycamore-grove-northeast-door", 1221, 60, 57, 0, "counterclockwise"),
    door("sycamore-grove-upper-closet-door", 192, 132, 43, 90, "counterclockwise"),
    door("sycamore-grove-lower-closet-door", 192, 670, 43, -90, "clockwise"),
    door("sycamore-grove-southwest-door", 204, 780, 43, 0, "clockwise"),
    door("sycamore-grove-south-center-door-a", 627, 780, 42, 0, "clockwise"),
    door("sycamore-grove-south-center-door-b", 712, 780, 42, 180, "counterclockwise"),
    door("sycamore-grove-southeast-door", 1221, 780, 57, 0, "clockwise"),
  ];
}
