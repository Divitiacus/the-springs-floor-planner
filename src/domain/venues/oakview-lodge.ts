import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const CANVAS_MARGIN = 50;
const SOURCE_LEFT = 109;
const SOURCE_TOP = 75;
const SOURCE_RIGHT = 1118;
const SOURCE_BOTTOM = 699;
const CONFIRMED_ROOM_LENGTH = 1336; // 111′4″
const SOURCE_SCALE = CONFIRMED_ROOM_LENGTH / (SOURCE_RIGHT - SOURCE_LEFT);

const tx = (sourceX: number) => Math.round(CANVAS_MARGIN + (sourceX - SOURCE_LEFT) * SOURCE_SCALE);
const ty = (sourceY: number) => Math.round(CANVAS_MARGIN + (sourceY - SOURCE_TOP) * SOURCE_SCALE);
const tw = (sourceWidth: number) => Math.round(sourceWidth * SOURCE_SCALE);

const PLAN_LEFT = tx(SOURCE_LEFT);
const PLAN_TOP = ty(SOURCE_TOP);
const PLAN_WIDTH = CONFIRMED_ROOM_LENGTH;
const PLAN_HEIGHT = ty(SOURCE_BOTTOM) - PLAN_TOP;
const MAIN_TOP = ty(197);
const MAIN_BOTTOM = ty(600);
const MAIN_HEIGHT = MAIN_BOTTOM - MAIN_TOP;
const EAST_WALL = tx(SOURCE_RIGHT);
const ALCOVE_WIDTH = 374; // 31′2″, confirmed in the measurement sheet.
const ALCOVE_CENTER_X = tx(684);
const ALCOVE_LEFT = Math.round(ALCOVE_CENTER_X - ALCOVE_WIDTH / 2);
const ALCOVE_RIGHT = ALCOVE_LEFT + ALCOVE_WIDTH;
const ALCOVE_TOP = MAIN_BOTTOM;
const ALCOVE_BOTTOM = ty(SOURCE_BOTTOM);

type Common = { fixed: true; measurementStatus: "source-traced" };

/** Oakview Lodge's ground-floor seating footprint, traced from the supplied plan. */
export function createOakviewLodgeConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  return {
    physicalWidthInches: PLAN_WIDTH + CANVAS_MARGIN * 2,
    physicalHeightInches: PLAN_HEIGHT + CANVAS_MARGIN * 2,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Oakview Lodge is calibrated to the confirmed 111′4″ reception-room length. The stepped buffet wing, recessed north wall, west stair/bar group, east fireplace, pillars, and exterior openings are proportionally traced from the supplied complete ground-floor plan. The kitchen, patio, suites, and open-air second floor are intentionally excluded.",
    planningBounds: { x: PLAN_LEFT, y: PLAN_TOP, width: PLAN_WIDTH, height: PLAN_HEIGHT },
    defaultObjectPosition: { x: tx(690), y: ty(410) },
    usableAreas: createUsableAreas(),
    voidAreas: [],
    fixedArchitecturalElements: [
      ...createFloorAreas(common),
      buffet(common),
      ...createWestStairGroup(common),
      ...createFireplace(common),
      ...createPillars(common),
      perimeterWall(common),
      ...createDoors(common),
      label(common, "oakview-lodge-buffet-label", "BUFFET · 11′9½″", tx(230), ty(108), tw(150), 9),
      label(common, "oakview-lodge-kitchen-label", "TO KITCHEN", tx(172), ty(45), tw(120), 10),
      label(common, "oakview-lodge-patio-label", "TO PATIO", tx(1005), ty(530), tw(105), 10),
      label(common, "oakview-lodge-main-entry-label", "MAIN ENTRANCE", tx(62), ty(405), tw(110), 10, -90),
      label(common, "oakview-lodge-upstairs-label", "UPSTAIRS", tx(263), ty(389), tx(363) - tx(263), 8),
    ],
    floorplanAsset: null,
  };
}

function createFloorAreas(common: Common): FixedArchitectureElement[] {
  const note = "Usable reception floor traced from the supplied complete ground-floor plan.";
  return [
    floorArea(common, "oakview-lodge-main-floor", "main-floor", PLAN_LEFT, MAIN_TOP, PLAN_WIDTH, MAIN_HEIGHT, note),
    floorArea(common, "oakview-lodge-buffet-wing-floor", "event-floor-extension", tx(200), PLAN_TOP, tx(399) - tx(200), MAIN_TOP - PLAN_TOP, note),
    floorArea(common, "oakview-lodge-upper-alcove-floor", "event-floor-extension", tx(549), ty(99), tx(824) - tx(549), MAIN_TOP - ty(99), note),
    floorArea(common, "oakview-lodge-south-alcove-floor", "event-floor-extension", ALCOVE_LEFT, ALCOVE_TOP, ALCOVE_WIDTH, ALCOVE_BOTTOM - ALCOVE_TOP, "The 31′2″ alcove width is confirmed by the measurement sheet; its depth and south-wall position are source-traced from the supplied plan."),
  ];
}

function createUsableAreas(): VenueFloorRegion[] {
  const common = { kind: "usable-floor" as const, placementBehavior: "allowed" as const, measurementStatus: "source-traced" as const };
  return [
    { ...common, id: "oakview-lodge-main-usable-floor", label: "Main reception floor", shape: { type: "rectangle" as const, x: PLAN_LEFT, y: MAIN_TOP, width: PLAN_WIDTH, height: MAIN_HEIGHT } },
    { ...common, id: "oakview-lodge-buffet-wing-usable-floor", label: "Buffet wing", shape: { type: "rectangle" as const, x: tx(200), y: PLAN_TOP, width: tx(399) - tx(200), height: MAIN_TOP - PLAN_TOP } },
    { ...common, id: "oakview-lodge-upper-alcove-usable-floor", label: "Upper reception alcove", shape: { type: "rectangle" as const, x: tx(549), y: ty(99), width: tx(824) - tx(549), height: MAIN_TOP - ty(99) } },
    { ...common, id: "oakview-lodge-south-alcove-usable-floor", label: "South alcove", shape: { type: "rectangle" as const, x: ALCOVE_LEFT, y: ALCOVE_TOP, width: ALCOVE_WIDTH, height: ALCOVE_BOTTOM - ALCOVE_TOP } },
  ];
}

function buffet(common: Common): FixedArchitectureElement {
  return areaWithNote(common, "oakview-lodge-buffet", "buffet", "BUFFET · 11′9½″", tx(240), ty(123), 141.5, 36, "blocked", "confirmed", "The measurement sheet confirms the 11′9½″ catering-table length; its three-foot depth and position in the northwest wing follow the venue guide and supplied plan.", false);
}

function createWestStairGroup(common: Common): FixedArchitectureElement[] {
  const note = "Ground-floor footprint of the west staircase traced from the supplied plan; the open-air second floor is not included.";
  return [
    areaWithNote(common, "oakview-lodge-bar", "bar", "BAR", tx(199), ty(347), tx(263) - tx(199), ty(435) - ty(347), "blocked", "source-traced", "The supplied plan identifies this fixed block at the west stair group as the bar."),
    stairs(common, "oakview-lodge-center-stair-flight", tx(263), ty(357), tx(363) - tx(263), ty(424) - ty(357), "vertical", 10, "x", note),
    railing(common, "oakview-lodge-stair-center-north-rail", [tx(263), ty(357), tx(363), ty(357)]),
    railing(common, "oakview-lodge-stair-center-south-rail", [tx(263), ty(424), tx(363), ty(424)]),
  ];
}

function createFireplace(common: Common): FixedArchitectureElement[] {
  const centerY = ty(399);
  return [
    areaWithNote(common, "oakview-lodge-fireplace-stone", "fireplace", "FIREPLACE · 10′2″", EAST_WALL - 26, centerY - 61, 26, 122, "blocked", "confirmed", "The fireplace stone is confirmed at 10′2″ long by 2′2″ deep and is centered on the east wall as shown in the supplied plan."),
    areaWithNote(common, "oakview-lodge-mantle", "fireplace", "MANTLE · 6′10½″", EAST_WALL - 40.5, centerY - 41.25, 14.5, 82.5, "blocked", "confirmed", "The mantle is confirmed at 6′10½″ long by 1′2½″ deep and is centered on the fireplace."),
  ];
}

function createPillars(common: Common): FixedArchitectureElement[] {
  return [
    pillar(common, "oakview-lodge-northwest-pillar", tx(251), ty(191)),
    pillar(common, "oakview-lodge-north-stair-pillar", tx(338), ty(191)),
    pillar(common, "oakview-lodge-upper-center-pillar", tx(678), ty(191)),
    pillar(common, "oakview-lodge-lower-center-pillar", tx(678), ty(592)),
  ];
}

function perimeterWall(common: Common): FixedArchitectureElement {
  return wall(common, "oakview-lodge-perimeter-wall", [
    tx(200), ty(75), tx(399), ty(75), tx(399), ty(197), tx(549), ty(197),
    tx(549), ty(99), tx(824), ty(99), tx(824), ty(197), tx(1118), ty(197),
    tx(1118), ty(600), ALCOVE_RIGHT, ty(600), ALCOVE_RIGHT, ty(699), ALCOVE_LEFT, ty(699),
    ALCOVE_LEFT, ty(600), tx(109), ty(600), tx(109), ty(193), tx(200), ty(193), tx(200), ty(75),
  ]);
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "oakview-lodge-kitchen-door", tx(210), ty(75), 44, 0, "clockwise"),
    door(common, "oakview-lodge-main-entrance-north", tx(109), ty(366), 48, 90, "counterclockwise"),
    door(common, "oakview-lodge-main-entrance-south", tx(109), ty(438), 48, -90, "clockwise"),
    door(common, "oakview-lodge-service-door-west", tx(413), ty(197), 44, 0, "clockwise"),
    door(common, "oakview-lodge-service-door-east", tx(479), ty(197), 44, 180, "counterclockwise"),
    door(common, "oakview-lodge-upper-patio-door-west", tx(1013), ty(197), 44, 0, "clockwise"),
    door(common, "oakview-lodge-upper-patio-door-east", tx(1079), ty(197), 44, 180, "counterclockwise"),
    door(common, "oakview-lodge-lower-patio-door-west", tx(1013), ty(600), 44, 0, "counterclockwise"),
    door(common, "oakview-lodge-lower-patio-door-east", tx(1079), ty(600), 44, 180, "clockwise"),
  ];
}

function floorArea(common: Common, id: string, role: "main-floor" | "event-floor-extension", x: number, y: number, width: number, height: number, physicalNote: string): FixedArchitectureElement {
  return { ...areaWithNote(common, id, role, "Reception floor", x, y, width, height, "allowed", "source-traced", physicalNote, false), showOutline: false, showLabel: false };
}

function areaWithNote(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"], physicalNote: string, showLabel = true): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, physicalNote, placementBehavior, measurementStatus, elevation: "floor", showLabel, shape: { type: "rectangle", x, y, width, height } };
}

function stairs(common: Common, id: string, x: number, y: number, width: number, height: number, orientation: "horizontal" | "vertical", treadCount: number, treadAxis: "x" | "y", physicalNote: string): FixedArchitectureElement {
  return { ...common, id, kind: "stairs", label: "Grand Staircase", physicalNote, placementBehavior: "blocked", x, y, width, height, orientation, treadCount, treadAxis, showLabel: false };
}

function pillar(common: Common, id: string, x: number, y: number): FixedArchitectureElement {
  return areaWithNote(common, id, "pillar", "Pillar", x, y, 18, 18, "blocked", "source-traced", "Pillar position is source-traced from the supplied plan.", false);
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: "Fixed stair railing", placementBehavior: "blocked", points };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise"): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: id.includes("kitchen") ? "Kitchen door" : "Exterior door", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize: number, rotation = 0): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize, rotation };
}
