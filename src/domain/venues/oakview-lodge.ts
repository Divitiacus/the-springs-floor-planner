import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const CANVAS_MARGIN = 55;
const ROOM_X = CANVAS_MARGIN;
const ROOM_Y = 80;
const ROOM_LENGTH = 1336; // 111′4″, confirmed in the supplied measurement sheet.
const SOURCE_ROOM_LENGTH = 1008;
const SOURCE_ROOM_WIDTH = 501;
const ROOM_WIDTH = Math.round((ROOM_LENGTH * SOURCE_ROOM_WIDTH) / SOURCE_ROOM_LENGTH); // 55′4″ source-traced.
const ROOM_CENTER_Y = ROOM_Y + ROOM_WIDTH / 2;

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Oakview Lodge uses the confirmed dimensions from the supplied measurement
 * sheet and the ground-floor plan supplied by the user. Only the reception
 * floor is modeled: the kitchen, patio, and open-air second floor are excluded.
 */
export function createOakviewLodgeConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const bar = area(
    common,
    "oakview-lodge-bar",
    "bar",
    "BAR TOP · 15′6″",
    ROOM_X + 136,
    ROOM_Y + 135,
    48,
    186,
    "blocked",
    "confirmed",
    "The bar top is confirmed at 15′6″ long. The official venue guide supplies its 4-foot depth. The supplied floor plan places it beneath the upper west stair flight.",
  );
  bar.labelRotation = -90;

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    area(
      common,
      "oakview-lodge-main-floor",
      "main-floor",
      "Reception Room · 111′4″ × 55′4″",
      ROOM_X,
      ROOM_Y,
      ROOM_LENGTH,
      ROOM_WIDTH,
      "allowed",
      "source-traced",
      "The 111′4″ room length is confirmed by the measurement sheet. The 55′4″ width is source-traced proportionally from the supplied ground-floor plan.",
    ),
    area(
      common,
      "oakview-lodge-buffet",
      "buffet",
      "BUFFET · 11′9½″",
      ROOM_X + 172,
      ROOM_Y + 33,
      141.5,
      36,
      "blocked",
      "confirmed",
      "The supplied measurement sheet confirms the 11′9½″ catering-table length. Its 3-foot depth follows the official venue guide, and its upper-left placement is traced from the supplied floor plan.",
    ),
    bar,
    ...createWestStairGroup(common),
    area(
      common,
      "oakview-lodge-fireplace-stone",
      "fireplace",
      "FIREPLACE · 10′2″",
      ROOM_X + ROOM_LENGTH - 26,
      ROOM_CENTER_Y - 61,
      26,
      122,
      "blocked",
      "confirmed",
      "The fireplace stone section is confirmed at 10′2″ long, 2′2″ wide, and 1′6″ high. Its centered east-wall position is source-traced from the supplied plan.",
    ),
    area(
      common,
      "oakview-lodge-mantle",
      "fireplace",
      "MANTLE · 6′10½″",
      ROOM_X + ROOM_LENGTH - 40.5,
      ROOM_CENTER_Y - 41.25,
      14.5,
      82.5,
      "blocked",
      "confirmed",
      "The mantle is confirmed at 6′10½″ long by 1′2½″ deep and is centered on the measured fireplace stone section.",
    ),
    pillar(common, "oakview-lodge-upper-center-pillar", ROOM_X + 752, ROOM_Y + 122),
    pillar(common, "oakview-lodge-lower-center-pillar", ROOM_X + 752, ROOM_Y + ROOM_WIDTH - 18),
    ...createWalls(common),
    ...createDoors(common),
    label(common, "oakview-lodge-room-label", "OAKVIEW LODGE · RECEPTION ROOM", 500, 100, 446, 14),
    label(common, "oakview-lodge-under-stair-bar-label", "BAR UNDER STAIRS · 15′6″", ROOM_X + 190, ROOM_Y + 185, 190, 9, 90),
    label(common, "oakview-lodge-kitchen-label", "TO KITCHEN", ROOM_X + 86, 44, 160, 10),
    label(common, "oakview-lodge-patio-label", "TO PATIO", ROOM_X + ROOM_LENGTH - 160, ROOM_CENTER_Y + 150, 150, 10),
  ];

  return {
    physicalWidthInches: ROOM_LENGTH + CANVAS_MARGIN * 2,
    physicalHeightInches: ROOM_WIDTH + ROOM_Y + 80,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Oakview Lodge is calibrated to the confirmed 111′4″ reception-room length. Its 55′4″ width, wall openings, pillars, and fixture positions are source-traced from the supplied ground-floor plan. The kitchen, patio, and open-air second floor are intentionally excluded from the seating chart.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createWestStairGroup(common: Common): FixedArchitectureElement[] {
  const note =
    "The supplied plan shows the west grand stair rising to an open-air second floor. Only its blocked ground-floor footprint is rendered; the upper floor itself is intentionally omitted.";
  return [
    stairs(common, "oakview-lodge-upper-stair-flight", ROOM_X + 118, ROOM_Y + 126, 82, 204, "horizontal", 11, "y", note),
    area(
      common,
      "oakview-lodge-stair-landing",
      "landing",
      "STAIR LANDING",
      ROOM_X + 118,
      ROOM_CENTER_Y - 45,
      82,
      90,
      "blocked",
      "source-traced",
      note,
    ),
    stairs(common, "oakview-lodge-center-stair-flight", ROOM_X + 200, ROOM_CENTER_Y - 45, 133, 90, "vertical", 10, "x", note),
    stairs(common, "oakview-lodge-lower-stair-flight", ROOM_X + 118, ROOM_CENTER_Y + 45, 82, 219, "horizontal", 12, "y", note),
    railing(common, "oakview-lodge-stair-west-rail", [ROOM_X + 112, ROOM_Y + 126, ROOM_X + 112, ROOM_Y + ROOM_WIDTH]),
    railing(common, "oakview-lodge-stair-center-north-rail", [ROOM_X + 200, ROOM_CENTER_Y - 45, ROOM_X + 333, ROOM_CENTER_Y - 45]),
    railing(common, "oakview-lodge-stair-center-south-rail", [ROOM_X + 200, ROOM_CENTER_Y + 45, ROOM_X + 333, ROOM_CENTER_Y + 45]),
  ];
}

function createWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "oakview-lodge-north-wall", [ROOM_X, ROOM_Y, ROOM_X + ROOM_LENGTH, ROOM_Y]),
    wall(common, "oakview-lodge-east-wall", [ROOM_X + ROOM_LENGTH, ROOM_Y, ROOM_X + ROOM_LENGTH, ROOM_Y + ROOM_WIDTH]),
    wall(common, "oakview-lodge-south-wall", [ROOM_X, ROOM_Y + ROOM_WIDTH, ROOM_X + ROOM_LENGTH, ROOM_Y + ROOM_WIDTH]),
    wall(common, "oakview-lodge-west-wall", [ROOM_X, ROOM_Y, ROOM_X, ROOM_Y + ROOM_WIDTH]),
  ];
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "oakview-lodge-kitchen-door", ROOM_X + 132, ROOM_Y, 44, 0, "clockwise"),
    door(common, "oakview-lodge-main-entrance-north", ROOM_X, ROOM_CENTER_Y - 48, 48, 90, "counterclockwise"),
    door(common, "oakview-lodge-main-entrance-south", ROOM_X, ROOM_CENTER_Y + 48, 48, -90, "clockwise"),
    door(common, "oakview-lodge-patio-door-north", ROOM_X + ROOM_LENGTH, ROOM_CENTER_Y - 174, 48, 90, "clockwise"),
    door(common, "oakview-lodge-patio-door-south", ROOM_X + ROOM_LENGTH, ROOM_CENTER_Y + 174, 48, -90, "counterclockwise"),
  ];
}

function area(
  common: Common,
  id: string,
  role: Extract<FixedArchitectureElement, { kind: "area" }>["role"],
  areaLabel: string,
  x: number,
  y: number,
  width: number,
  height: number,
  placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"],
  measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"],
  physicalNote: string,
): Extract<FixedArchitectureElement, { kind: "area" }> {
  return {
    ...common,
    id,
    kind: "area",
    role,
    label: areaLabel,
    physicalNote,
    placementBehavior,
    measurementStatus,
    elevation: "floor",
    shape: { type: "rectangle", x, y, width, height },
  };
}

function stairs(
  common: Common,
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  orientation: "horizontal" | "vertical",
  treadCount: number,
  treadAxis: "x" | "y",
  physicalNote: string,
): FixedArchitectureElement {
  return {
    ...common,
    id,
    kind: "stairs",
    label: "Grand Staircase",
    physicalNote,
    placementBehavior: "blocked",
    x,
    y,
    width,
    height,
    orientation,
    treadCount,
    treadAxis,
    showLabel: false,
  };
}

function pillar(common: Common, id: string, x: number, y: number): FixedArchitectureElement {
  return area(common, id, "pillar", "Pillar", x, y, 18, 18, "blocked", "source-traced", "Pillar position is source-traced from the supplied ground-floor plan.");
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: "Fixed stair railing", placementBehavior: "blocked", points };
}

function door(
  common: Common,
  id: string,
  x: number,
  y: number,
  width: number,
  rotation: number,
  swingDirection: "clockwise" | "counterclockwise",
): FixedArchitectureElement {
  return {
    ...common,
    id,
    kind: "door",
    label: id.includes("kitchen") ? "Kitchen door" : "Exterior door",
    placementBehavior: "restricted",
    x,
    y,
    width,
    rotation,
    swingDirection,
    swingAngle: 42,
  };
}

function label(
  common: Common,
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  rotation = 0,
): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize, rotation };
}
