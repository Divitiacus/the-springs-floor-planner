import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const CANVAS_MARGIN = 40;
const ROOM_X = CANVAS_MARGIN;
const ROOM_Y = 160;
const ROOM_LENGTH = 1336; // 111′4″, confirmed in the supplied measurement sheet.
const ROOM_WIDTH = 600; // Provisional 50′ width pending a dimensioned floor-plan drawing.
const ALCOVE_LENGTH = 374; // 31′2″, confirmed for each alcove.
const ALCOVE_DEPTH = 120; // Provisional 10′ plan depth; the supplied 12′8″ is alcove height.
const ALCOVE_X = ROOM_X + (ROOM_LENGTH - ALCOVE_LENGTH) / 2;
const NORTH_ALCOVE_Y = ROOM_Y - ALCOVE_DEPTH;
const SOUTH_ALCOVE_Y = ROOM_Y + ROOM_WIDTH;
const ROOM_CENTER_Y = ROOM_Y + ROOM_WIDTH / 2;

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Oakview Lodge is based on the supplied September 2026 measurement sheet.
 * The sheet confirms the 111′4″ reception-room length, 31′2″ alcove lengths,
 * and measured fixed features, but it does not include a drawn plan or the
 * reception-room width. The overall width, alcove depth, and fixture placement
 * therefore remain deliberately marked provisional for later field refinement.
 */
export function createOakviewLodgeConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    area(
      common,
      "oakview-lodge-main-floor",
      "main-floor",
      "Reception Room · 111′4″ long",
      ROOM_X,
      ROOM_Y,
      ROOM_LENGTH,
      ROOM_WIDTH,
      "allowed",
      "provisional",
      "The supplied measurement sheet confirms the 111′4″ room length. The 50-foot plan width is provisional because the source gives alcove height, not room width.",
    ),
    area(
      common,
      "oakview-lodge-north-alcove",
      "event-floor-extension",
      "North Alcove · 31′2″ long",
      ALCOVE_X,
      NORTH_ALCOVE_Y,
      ALCOVE_LENGTH,
      ALCOVE_DEPTH,
      "allowed",
      "provisional",
      "The 31′2″ alcove length is confirmed. Its 10-foot plan depth and centered placement are provisional; 12′8″ in the source is the alcove height.",
    ),
    area(
      common,
      "oakview-lodge-south-alcove",
      "event-floor-extension",
      "South Alcove · 31′2″ long",
      ALCOVE_X,
      SOUTH_ALCOVE_Y,
      ALCOVE_LENGTH,
      ALCOVE_DEPTH,
      "allowed",
      "provisional",
      "The 31′2″ alcove length is confirmed. Its 10-foot plan depth and centered placement are provisional; 12′8″ in the source is the alcove height.",
    ),
    area(
      common,
      "oakview-lodge-bar",
      "bar",
      "BAR TOP · 15′6″",
      ALCOVE_X + (ALCOVE_LENGTH - 186) / 2,
      NORTH_ALCOVE_Y + 36,
      186,
      48,
      "blocked",
      "source-traced",
      "The supplied sheet confirms the 15′6″ bar-top length. Its 4-foot depth follows the official Denton venue guide; placement within the alcove is provisional.",
    ),
    area(
      common,
      "oakview-lodge-catering-table",
      "buffet",
      "CATERING TABLE · 11′9½″",
      ALCOVE_X + (ALCOVE_LENGTH - 141.5) / 2,
      SOUTH_ALCOVE_Y + 42,
      141.5,
      36,
      "blocked",
      "source-traced",
      "The supplied sheet confirms the 11′9½″ length. Its 3-foot depth follows the official Denton venue guide; placement within the alcove is provisional.",
    ),
    {
      ...common,
      id: "oakview-lodge-grand-staircase",
      kind: "stairs",
      label: "Grand Staircase · 16′8″ × 6′9″",
      physicalNote:
        "The supplied sheet confirms a 16′8″ bottom-to-top railing run and 6′9″ width across the bottom. The exact plan shape and west-wall placement remain provisional.",
      placementBehavior: "blocked",
      measurementStatus: "provisional",
      x: ROOM_X,
      y: ROOM_CENTER_Y - 40.5,
      width: 200,
      height: 81,
      orientation: "vertical",
      treadAxis: "x",
      treadCount: 12,
      curvedRight: true,
      showLabel: false,
    },
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
      "source-traced",
      "The fireplace stone section is confirmed at 10′2″ long, 2′2″ wide, and 1′6″ high. Its centered east-wall placement opposite the grand staircase is provisional.",
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
      "source-traced",
      "The mantle is confirmed at 6′10½″ long by 1′2½″ deep and is centered on the measured fireplace stone section.",
    ),
    ...createWalls(common),
    label(common, "oakview-lodge-room-label", "OAKVIEW LODGE · RECEPTION ROOM", 470, 178, 476, 14),
    label(common, "oakview-lodge-stair-label", "GRAND STAIRCASE", 48, ROOM_CENTER_Y - 58, 190, 10),
  ];

  return {
    physicalWidthInches: ROOM_LENGTH + CANVAS_MARGIN * 2,
    physicalHeightInches: ROOM_WIDTH + ALCOVE_DEPTH * 2 + CANVAS_MARGIN * 2,
    physicalDimensionStatus: "provisional",
    physicalDimensionNote:
      "Oakview Lodge is calibrated to the supplied 111′4″ reception-room length. The 31′2″ alcove lengths and measured staircase, fireplace, mantle, catering-table, and bar dimensions are represented at true scale. Room width, alcove plan depth, and feature placement are provisional because the source is a measurement list rather than a drawn floor plan.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "oakview-lodge-outline", [
      ROOM_X, ROOM_Y,
      ALCOVE_X, ROOM_Y,
      ALCOVE_X, NORTH_ALCOVE_Y,
      ALCOVE_X + ALCOVE_LENGTH, NORTH_ALCOVE_Y,
      ALCOVE_X + ALCOVE_LENGTH, ROOM_Y,
      ROOM_X + ROOM_LENGTH, ROOM_Y,
      ROOM_X + ROOM_LENGTH, ROOM_Y + ROOM_WIDTH,
      ALCOVE_X + ALCOVE_LENGTH, ROOM_Y + ROOM_WIDTH,
      ALCOVE_X + ALCOVE_LENGTH, SOUTH_ALCOVE_Y + ALCOVE_DEPTH,
      ALCOVE_X, SOUTH_ALCOVE_Y + ALCOVE_DEPTH,
      ALCOVE_X, ROOM_Y + ROOM_WIDTH,
      ROOM_X, ROOM_Y + ROOM_WIDTH,
      ROOM_X, ROOM_Y,
    ]),
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

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function label(
  common: Common,
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize };
}
