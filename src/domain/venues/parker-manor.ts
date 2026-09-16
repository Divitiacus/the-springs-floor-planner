import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const FLOOR_X = 50;
const FLOOR_Y = 80;
const HALL_SIZE = 810; // 67′6″
const SECOND_FLOOR_X = 980;

const BALCONY_SIDE_WIDTH = 88; // 7′4″
const BALCONY_NORTH_DEPTH = 139; // 11′7″
const STAIR_WIDTH = 138; // 11′6″
const STAIR_HEIGHT = 277; // 23′1″

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Parker Manor geometry traced from the measured downstairs and upstairs
 * drawings supplied by the user. Explicit dimensions are stored in inches;
 * unlabelled positions remain source-traced.
 */
export function createParkerManorConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    area(common, "parker-manor-main-floor", "main-floor", "Main Event Floor · 67′6″ × 67′6″", FLOOR_X, FLOOR_Y, HALL_SIZE, HALL_SIZE, "allowed", "confirmed"),
    areaWithNote(common, "parker-manor-buffet", "buffet", "Buffet · 16′ × 3′", FLOOR_X, 120, 36, 192, "blocked", "confirmed", "The supplied downstairs plan confirms a 16-foot length and 3-foot depth."),
    areaWithNote(common, "parker-manor-bar", "bar", "Bar · 14′ × 4′", FLOOR_X, 700, 48, 168, "blocked", "confirmed", "The supplied downstairs plan confirms a 14-foot length and 4-foot depth."),
    stairs(common, "parker-manor-downstairs-stairs", "Downstairs Staircase", 110, 335, STAIR_WIDTH, STAIR_HEIGHT, "Confirmed overall stair envelope is 11′6″ × 23′1″; the inner plan labels show 8′2″ and 10′2″ spans."),
    areaWithNote(common, "parker-manor-mantle", "fireplace", "Mantle · 7′8″ Wide", 803, 389, 14, 92, "blocked", "confirmed", "Mantle is 14 inches deep, 7 feet 8 inches wide, and 7 feet from the floor."),
    areaWithNote(common, "parker-manor-fireplace", "fireplace", "Fireplace", 817, 390, 43, 90, "blocked", "confirmed", "The fireplace projection is shown as 3′7″ by 7′6″ on the supplied plan."),
    ...createPillars(common, "parker-manor-pillar", 0),
    overheadPath(common, "parker-manor-balcony-overhang", `M 138 219 L 772 219 L 772 802 L 138 802 Z`),
    ...createHallWalls(common, FLOOR_X),
    ...createGroundFloorDoors(common),
    label(common, "parker-manor-downstairs-label", "DOWNSTAIRS · RECEPTION HALL", 270, 105, 370, 13),
    label(common, "parker-manor-main-entrance-label", "MAIN ENTRANCE", 300, 855, 310, 12),

    areaWithoutLabel(common, "parker-manor-second-floor", "second-floor", "Upstairs Balcony", SECOND_FLOOR_X, FLOOR_Y, HALL_SIZE, HALL_SIZE, "restricted", "confirmed"),
    areaWithNote(
      common,
      "parker-manor-open-to-downstairs",
      "open-to-below",
      "Open to Downstairs",
      SECOND_FLOOR_X + BALCONY_SIDE_WIDTH,
      FLOOR_Y + BALCONY_NORTH_DEPTH,
      HALL_SIZE - BALCONY_SIDE_WIDTH * 2,
      HALL_SIZE - BALCONY_NORTH_DEPTH - BALCONY_SIDE_WIDTH,
      "blocked",
      "source-traced",
      "Upstairs plan confirms an 11′7″ north balcony depth and 7′4″ side balcony width; the remaining opening outline is source-traced.",
    ),
    areaWithoutLabel(common, "parker-manor-full-balcony", "porch", "Full Balcony", SECOND_FLOOR_X, 8, HALL_SIZE, 72, "restricted", "source-traced"),
    areaWithoutLabel(common, "parker-manor-juliet-balcony", "porch", "Juliet Balcony", SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE, HALL_SIZE, 72, "restricted", "source-traced"),
    stairs(common, "parker-manor-upstairs-stairs", "Upstairs Stair Opening", SECOND_FLOOR_X + 60, 335, STAIR_WIDTH, STAIR_HEIGHT, "The upstairs stair opening follows the measured downstairs stair envelope."),
    areaWithNote(common, "parker-manor-upstairs-fireplace", "fireplace", "Fireplace", SECOND_FLOOR_X + 767, 390, 43, 90, "blocked", "confirmed", "The upstairs plan preserves the confirmed fireplace projection."),
    ...createPillars(common, "parker-manor-upstairs-pillar", SECOND_FLOOR_X - FLOOR_X),
    ...createHallWalls(common, SECOND_FLOOR_X),
    ...createOpeningRails(common),
    ...createBalconyDoors(common),
    label(common, "parker-manor-upstairs-label", "UPSTAIRS · BALCONY", 1205, 105, 360, 13),
    label(common, "parker-manor-full-balcony-label", "FULL BALCONY", 1230, 34, 310, 12),
    label(common, "parker-manor-juliet-balcony-label", "JULIET BALCONY", 1220, 910, 330, 12),
  ];

  return {
    physicalWidthInches: 1840,
    physicalHeightInches: 980,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Parker Manor is confirmed at 67′6″ × 67′6″. Buffet, bar, stair envelope, mantle, fireplace, pillar spacing, and labeled upstairs balcony dimensions come from the supplied measured plans; unlabelled placements are source-traced.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createPillars(common: Common, idPrefix: string, dx: number): FixedArchitectureElement[] {
  const positions = [[170, 258], [690, 258], [170, 430], [690, 430], [170, 650], [690, 650], [285, 780], [575, 780]];
  return positions.map(([x, y], index) =>
    areaWithNote(common, `${idPrefix}-${index + 1}`, "pillar", "Pillar", x + dx, y, 18, 18, "blocked", "source-traced", "Pillar footprint is source-traced. The supplied plan confirms 24′2″ between the paired interior pillars and 10 feet to the east wall."),
  );
}

function createHallWalls(common: Common, x: number): FixedArchitectureElement[] {
  return [
    wall(common, `${x === FLOOR_X ? "parker-manor-first" : "parker-manor-second"}-north-wall`, [x, FLOOR_Y, x + HALL_SIZE, FLOOR_Y]),
    wall(common, `${x === FLOOR_X ? "parker-manor-first" : "parker-manor-second"}-east-wall`, [x + HALL_SIZE, FLOOR_Y, x + HALL_SIZE, FLOOR_Y + HALL_SIZE]),
    wall(common, `${x === FLOOR_X ? "parker-manor-first" : "parker-manor-second"}-south-wall`, [x, FLOOR_Y + HALL_SIZE, x + HALL_SIZE, FLOOR_Y + HALL_SIZE]),
    wall(common, `${x === FLOOR_X ? "parker-manor-first" : "parker-manor-second"}-west-wall`, [x, FLOOR_Y, x, FLOOR_Y + HALL_SIZE]),
  ];
}

function createOpeningRails(common: Common): FixedArchitectureElement[] {
  const left = SECOND_FLOOR_X + BALCONY_SIDE_WIDTH;
  const right = SECOND_FLOOR_X + HALL_SIZE - BALCONY_SIDE_WIDTH;
  const top = FLOOR_Y + BALCONY_NORTH_DEPTH;
  const bottom = FLOOR_Y + HALL_SIZE - BALCONY_SIDE_WIDTH;
  return [
    railing(common, "parker-manor-opening-north-rail", [left, top, right, top]),
    railing(common, "parker-manor-opening-east-rail", [right, top, right, bottom]),
    railing(common, "parker-manor-opening-south-rail", [left, bottom, right, bottom]),
    railing(common, "parker-manor-opening-west-rail", [left, top, left, bottom]),
  ];
}

function createGroundFloorDoors(common: Common): FixedArchitectureElement[] {
  const center = FLOOR_X + HALL_SIZE / 2;
  return [
    door(common, "parker-manor-north-door-west", center - 48, FLOOR_Y, 48, 180, "clockwise"),
    door(common, "parker-manor-north-door-east", center + 48, FLOOR_Y, 48, 0, "counterclockwise"),
    door(common, "parker-manor-main-entrance-west", center - 48, FLOOR_Y + HALL_SIZE, 48, 0, "clockwise"),
    door(common, "parker-manor-main-entrance-east", center + 48, FLOOR_Y + HALL_SIZE, 48, 180, "counterclockwise"),
  ];
}

function createBalconyDoors(common: Common): FixedArchitectureElement[] {
  const center = SECOND_FLOOR_X + HALL_SIZE / 2;
  return [
    door(common, "parker-manor-full-balcony-door-west", center - 48, FLOOR_Y, 48, 180, "clockwise"),
    door(common, "parker-manor-full-balcony-door-east", center + 48, FLOOR_Y, 48, 0, "counterclockwise"),
    door(common, "parker-manor-juliet-balcony-door-west", center - 48, FLOOR_Y + HALL_SIZE, 48, 0, "clockwise"),
    door(common, "parker-manor-juliet-balcony-door-east", center + 48, FLOOR_Y + HALL_SIZE, 48, 180, "counterclockwise"),
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
  measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"] = "source-traced",
): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, placementBehavior, measurementStatus, elevation: "floor", shape: { type: "rectangle", x, y, width, height } };
}

function areaWithNote(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"], physicalNote: string) {
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior, measurementStatus), physicalNote };
}

function areaWithoutLabel(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"]) {
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior, measurementStatus), showLabel: false };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: "Fixed balcony railing", placementBehavior: "blocked", points };
}

function overheadPath(common: Common, id: string, data: string): FixedArchitectureElement {
  return { ...common, id, kind: "path", label: "Balcony Overhang", placementBehavior: "restricted", data, stroke: "#718078", strokeWidth: 2, dash: [12, 8], opacity: 0.85 };
}

function stairs(common: Common, id: string, stairLabel: string, x: number, y: number, width: number, height: number, physicalNote: string): FixedArchitectureElement {
  return { ...common, id, kind: "stairs", label: stairLabel, physicalNote, placementBehavior: "blocked", measurementStatus: "confirmed", x, y, width, height, orientation: "vertical", treadCount: 14, treadAxis: "y", curvedBottom: true, showLabel: false };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise"): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: "Door · source-traced", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize: number): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize };
}
