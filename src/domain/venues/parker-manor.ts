import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration, HallLevelConfiguration } from "@/domain/location-catalog";

const CANVAS_WIDTH = 910;
const CANVAS_HEIGHT = 980;
const HALL_X = 50;
const HALL_Y = 80;
const HALL_SIZE = 810; // 67′6″

const OPENING_LEFT = 138;
const OPENING_RIGHT = 772;
const OPENING_TOP = 219;
const OPENING_BOTTOM = 802;
const STAIR_GROUP_X = 128;
const STAIR_NOTCH_RIGHT = STAIR_GROUP_X + 138;
const STAIR_NOTCH_TOP = 415;
const STAIR_NOTCH_BOTTOM = 529;
const FIREPLACE_Y = (STAIR_NOTCH_TOP + STAIR_NOTCH_BOTTOM) / 2 - 45;
const MANTLE_Y = FIREPLACE_Y - 1;
const UPPER_RIGHT_PILLAR_Y = 300;
const SERVICE_RIGHT = OPENING_LEFT - 10;

type Common = { fixed: true; measurementStatus: "source-traced" };

/** Parker Manor, modeled as two vertically aligned levels of one building. */
export function createParkerManorConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const levels: HallLevelConfiguration[] = [
    {
      id: "level-1-downstairs",
      slug: "downstairs",
      name: "Level 1 — Downstairs",
      physicalWidthInches: CANVAS_WIDTH,
      physicalHeightInches: CANVAS_HEIGHT,
      physicalDimensionStatus: "source-traced",
      physicalDimensionNote:
        "Parker Manor has one confirmed 67′6″ square exterior footprint. Level 1 is a continuous walkable reception floor.",
      planningBounds: { x: HALL_X, y: HALL_Y, width: HALL_SIZE, height: HALL_SIZE },
      defaultObjectPosition: { x: 455, y: 520 },
      usableAreas: createDownstairsUsableAreas(),
      voidAreas: [],
      fixedArchitecturalElements: createDownstairsElements(common),
      floorplanAsset: null,
    },
    {
      id: "level-2-upstairs",
      slug: "upstairs",
      name: "Level 2 — Upstairs Balcony",
      physicalWidthInches: CANVAS_WIDTH,
      physicalHeightInches: CANVAS_HEIGHT,
      physicalDimensionStatus: "source-traced",
      physicalDimensionNote:
        "Level 2 uses the same 67′6″ exterior footprint. Its walkable floor is the perimeter balcony around a genuine open-to-below void. The source labels the north balcony depth as 11′7″ and the east walkway as 7′4″; other edges are source-traced.",
      planningBounds: { x: HALL_X, y: HALL_Y, width: HALL_SIZE, height: HALL_SIZE },
      defaultObjectPosition: { x: 455, y: 150 },
      usableAreas: createUpstairsUsableAreas(),
      voidAreas: createUpstairsVoidAreas(),
      fixedArchitecturalElements: createUpstairsElements(common),
      floorplanAsset: null,
    },
  ];

  return { levels, defaultLevelId: "level-1-downstairs" };
}

function createDownstairsElements(common: Common): FixedArchitectureElement[] {
  return [
    areaWithNote(common, "parker-manor-buffet", "buffet", "BUFFET · 16′ × 3′", SERVICE_RIGHT - 36, 134, 36, 192, "blocked", "confirmed", "The supplied downstairs plan confirms a 16-foot length and 3-foot depth. Its placement follows Magnolia Manor's service-and-stair group rotated 90 degrees counterclockwise, set back to the west of the pillar line above the stairs."),
    areaWithNote(common, "parker-manor-bar", "bar", "BAR · 14′ × 4′", SERVICE_RIGHT - 48, 641, 48, 168, "blocked", "confirmed", "The supplied downstairs plan confirms a 14-foot length and 4-foot depth. Its placement follows Magnolia Manor's service-and-stair group rotated 90 degrees counterclockwise, set back to the west of the pillar line below the stairs."),
    ...createAlignedStaircase(common, "downstairs"),
    areaWithNote(common, "parker-manor-mantle", "fireplace", "MANTLE · 7′8″", OPENING_RIGHT - 14, MANTLE_Y, 14, 92, "blocked", "confirmed", "Mantle is 14 inches deep, 7 feet 8 inches wide, and 7 feet from the floor. It is centered on the east edge of the upper-floor projection directly opposite the west stair group."),
    areaWithNote(common, "parker-manor-fireplace", "fireplace", "FIREPLACE", OPENING_RIGHT, FIREPLACE_Y, 43, 90, "blocked", "confirmed", "The fireplace projection is shown as 3′7″ by 7′6″. It is centered beneath the east edge of the upper floor, directly opposite the west stair group and away from the exterior wall."),
    ...createPillars(common, "parker-manor-downstairs-pillar"),
    ...createHallWalls(common, "downstairs"),
    ...createDownstairsDoors(common),
    label(common, "parker-manor-downstairs-label", "LEVEL 1 · DOWNSTAIRS", 285, 105, 340, 15),
    label(common, "parker-manor-reception-label", "RECEPTION HALL", 300, 470, 310, 18),
    label(common, "parker-manor-overhang-label", "BALCONY ABOVE", 320, 245, 270, 12),
    label(common, "parker-manor-main-entrance-label", "MAIN ENTRANCE", 300, 855, 310, 12),
  ];
}

function createUpstairsElements(common: Common): FixedArchitectureElement[] {
  return [
    areaWithoutLabel(common, "parker-manor-full-balcony", "porch", "Full Exterior Balcony", HALL_X, 8, HALL_SIZE, 72, "restricted"),
    areaWithoutLabel(common, "parker-manor-juliet-balcony", "porch", "Juliet Balcony", HALL_X, HALL_Y + HALL_SIZE, HALL_SIZE, 72, "restricted"),
    ...createAlignedStaircase(common, "upstairs"),
    areaWithNote(common, "parker-manor-upstairs-fireplace", "fireplace", "FIREPLACE", OPENING_RIGHT, FIREPLACE_Y, 43, 90, "blocked", "confirmed", "The upstairs drawing centers the fireplace projection on the east edge of the central opening, directly opposite the west stair group."),
    ...createPillars(common, "parker-manor-upstairs-pillar"),
    ...createHallWalls(common, "upstairs"),
    ...createOpeningRails(common),
    ...createUpstairsDoors(common),
    label(common, "parker-manor-upstairs-label", "LEVEL 2 · WALKABLE UPPER FLOOR", 245, 105, 420, 15),
    label(common, "parker-manor-open-label", "OPEN TO BELOW\nNO FLOOR", 310, 475, 290, 18),
    label(common, "parker-manor-full-balcony-label", "FULL EXTERIOR BALCONY", 235, 34, 440, 14),
    label(common, "parker-manor-juliet-balcony-label", "JULIET BALCONY", 300, 910, 310, 13),
  ];
}

function createDownstairsUsableAreas(): VenueFloorRegion[] {
  return [floorRegion("parker-manor-level-1-reception-floor", "Downstairs Reception Floor", "usable-floor", {
    type: "rectangle",
    x: HALL_X,
    y: HALL_Y,
    width: HALL_SIZE,
    height: HALL_SIZE,
  }, "confirmed")];
}

function createUpstairsUsableAreas(): VenueFloorRegion[] {
  // The positive floor is one continuous seating/setup footprint. The explicit
  // open-to-below polygon subtracts the center, avoiding false seam lines where
  // separate walkway rectangles would otherwise meet.
  return [floorRegion("parker-manor-level-2-upper-floor", "Walkable Upper Floor", "usable-floor", {
    type: "rectangle",
    x: HALL_X,
    y: HALL_Y,
    width: HALL_SIZE,
    height: HALL_SIZE,
  })];
}

function createUpstairsVoidAreas(): VenueFloorRegion[] {
  return [floorRegion("parker-manor-level-2-open-to-below", "Open to Reception Floor Below", "open-to-below", {
    type: "polygon",
    points: [
      OPENING_LEFT, OPENING_TOP,
      OPENING_RIGHT, OPENING_TOP,
      OPENING_RIGHT, OPENING_BOTTOM,
      OPENING_LEFT, OPENING_BOTTOM,
      OPENING_LEFT, STAIR_NOTCH_BOTTOM,
      STAIR_NOTCH_RIGHT, STAIR_NOTCH_BOTTOM,
      STAIR_NOTCH_RIGHT, STAIR_NOTCH_TOP,
      OPENING_LEFT, STAIR_NOTCH_TOP,
    ],
  })];
}

function createAlignedStaircase(common: Common, level: "downstairs" | "upstairs"): FixedArchitectureElement[] {
  const note = "One west-side staircase connects both levels. Its confirmed overall envelope is 11′6″ × 23′1″; its three-flight form follows the Manor stair arrangement and the source-labeled 8′2″ and 10′2″ internal spans.";
  return [
    areaWithNote(common, `parker-manor-${level}-stairs-landing`, "landing", "STAIR LANDING", STAIR_GROUP_X + 4, 432, 50, 81, "blocked", "source-traced", note),
    stairs(common, `parker-manor-${level}-stairs-north-flight`, "North Stair Flight", STAIR_GROUP_X + 4, 334, 50, 98, "vertical", 8, "y", note),
    stairs(common, `parker-manor-${level}-stairs-south-flight`, "South Stair Flight", STAIR_GROUP_X + 4, 513, 50, 98, "vertical", 8, "y", note),
    stairs(common, `parker-manor-${level}-stairs-east-flight`, "Center Stair Flight", STAIR_GROUP_X + 54, STAIR_NOTCH_TOP, 84, STAIR_NOTCH_BOTTOM - STAIR_NOTCH_TOP, "horizontal", 9, "x", note, true),
    railing(common, `parker-manor-${level}-stairs-west-rail`, [STAIR_GROUP_X, 342, STAIR_GROUP_X, 603]),
    railing(common, `parker-manor-${level}-stairs-north-rail`, [STAIR_GROUP_X + 54, 334, STAIR_GROUP_X + 54, STAIR_NOTCH_TOP]),
    railing(common, `parker-manor-${level}-stairs-south-rail`, [STAIR_GROUP_X + 54, STAIR_NOTCH_BOTTOM, STAIR_GROUP_X + 54, 611]),
    railing(common, `parker-manor-${level}-stairs-east-upper-rail`, [STAIR_GROUP_X + 54, STAIR_NOTCH_TOP, STAIR_NOTCH_RIGHT, STAIR_NOTCH_TOP]),
    railing(common, `parker-manor-${level}-stairs-east-lower-rail`, [STAIR_GROUP_X + 54, STAIR_NOTCH_BOTTOM, STAIR_NOTCH_RIGHT, STAIR_NOTCH_BOTTOM]),
  ];
}

function createPillars(common: Common, idPrefix: string): FixedArchitectureElement[] {
  const positions = [
    [285, OPENING_TOP - 9], [575, OPENING_TOP - 9],
    [OPENING_LEFT - 9, 430], [OPENING_RIGHT - 9, UPPER_RIGHT_PILLAR_Y],
    [OPENING_LEFT - 9, 650], [OPENING_RIGHT - 9, 650],
    [285, OPENING_BOTTOM - 9], [575, OPENING_BOTTOM - 9],
  ];
  return positions.map(([x, y], index) =>
    areaWithNote(common, `${idPrefix}-${index + 1}`, "pillar", "Pillar", x, y, 18, 18, "blocked", "source-traced", "Pillar footprint is source-traced. The supplied downstairs plan confirms 24′2″ between the paired interior pillars and 10 feet to the east wall."),
  );
}

function createHallWalls(common: Common, level: "downstairs" | "upstairs"): FixedArchitectureElement[] {
  const prefix = `parker-manor-${level}`;
  return [
    wall(common, `${prefix}-north-wall`, [HALL_X, HALL_Y, HALL_X + HALL_SIZE, HALL_Y]),
    wall(common, `${prefix}-east-wall`, [HALL_X + HALL_SIZE, HALL_Y, HALL_X + HALL_SIZE, HALL_Y + HALL_SIZE]),
    wall(common, `${prefix}-south-wall`, [HALL_X, HALL_Y + HALL_SIZE, HALL_X + HALL_SIZE, HALL_Y + HALL_SIZE]),
    wall(common, `${prefix}-west-wall`, [HALL_X, HALL_Y, HALL_X, HALL_Y + HALL_SIZE]),
  ];
}

function createOpeningRails(common: Common): FixedArchitectureElement[] {
  return [
    railing(common, "parker-manor-opening-north-rail", [OPENING_LEFT, OPENING_TOP, OPENING_RIGHT, OPENING_TOP]),
    railing(common, "parker-manor-opening-east-rail", [OPENING_RIGHT, OPENING_TOP, OPENING_RIGHT, OPENING_BOTTOM]),
    railing(common, "parker-manor-opening-south-rail", [OPENING_LEFT, OPENING_BOTTOM, OPENING_RIGHT, OPENING_BOTTOM]),
    railing(common, "parker-manor-opening-west-upper-rail", [OPENING_LEFT, OPENING_TOP, OPENING_LEFT, STAIR_NOTCH_TOP]),
    railing(common, "parker-manor-opening-stair-north-rail", [OPENING_LEFT, STAIR_NOTCH_TOP, STAIR_NOTCH_RIGHT, STAIR_NOTCH_TOP]),
    railing(common, "parker-manor-opening-stair-east-rail", [STAIR_NOTCH_RIGHT, STAIR_NOTCH_TOP, STAIR_NOTCH_RIGHT, STAIR_NOTCH_BOTTOM]),
    railing(common, "parker-manor-opening-stair-south-rail", [STAIR_NOTCH_RIGHT, STAIR_NOTCH_BOTTOM, OPENING_LEFT, STAIR_NOTCH_BOTTOM]),
    railing(common, "parker-manor-opening-west-lower-rail", [OPENING_LEFT, STAIR_NOTCH_BOTTOM, OPENING_LEFT, OPENING_BOTTOM]),
  ];
}

function createDownstairsDoors(common: Common): FixedArchitectureElement[] {
  const center = HALL_X + HALL_SIZE / 2;
  return [
    door(common, "parker-manor-pavilion-door-west", center - 48, HALL_Y, 48, 0, "counterclockwise"),
    door(common, "parker-manor-pavilion-door-east", center + 48, HALL_Y, 48, 180, "clockwise"),
    door(common, "parker-manor-main-entrance-west", center - 48, HALL_Y + HALL_SIZE, 48, 0, "clockwise"),
    door(common, "parker-manor-main-entrance-east", center + 48, HALL_Y + HALL_SIZE, 48, 180, "counterclockwise"),
  ];
}

function createUpstairsDoors(common: Common): FixedArchitectureElement[] {
  const center = HALL_X + HALL_SIZE / 2;
  return [
    door(common, "parker-manor-full-balcony-door-west", center - 48, HALL_Y, 48, 0, "counterclockwise"),
    door(common, "parker-manor-full-balcony-door-east", center + 48, HALL_Y, 48, 180, "clockwise"),
    door(common, "parker-manor-juliet-balcony-door-west", center - 48, HALL_Y + HALL_SIZE, 48, 0, "clockwise"),
    door(common, "parker-manor-juliet-balcony-door-east", center + 48, HALL_Y + HALL_SIZE, 48, 180, "counterclockwise"),
  ];
}

function area(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"] = "source-traced"): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, placementBehavior, measurementStatus, elevation: "floor", shape: { type: "rectangle", x, y, width, height } };
}

function areaWithNote(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"], physicalNote: string) {
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior, measurementStatus), physicalNote };
}

function areaWithoutLabel(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"]) {
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior), showLabel: false };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: "Fixed balcony railing", placementBehavior: "blocked", points };
}

function stairs(common: Common, id: string, stairLabel: string, x: number, y: number, width: number, height: number, orientation: "horizontal" | "vertical", treadCount: number, treadAxis: "x" | "y", physicalNote: string, curvedRight = false): FixedArchitectureElement {
  return { ...common, id, kind: "stairs", label: stairLabel, physicalNote, placementBehavior: "blocked", measurementStatus: "source-traced", x, y, width, height, orientation, treadCount, treadAxis, curvedRight, showLabel: false };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise"): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: "Door · source-traced", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize: number): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize };
}

function floorRegion(id: string, labelText: string, kind: VenueFloorRegion["kind"], shape: VenueFloorRegion["shape"], measurementStatus: VenueFloorRegion["measurementStatus"] = "source-traced"): VenueFloorRegion {
  return { id, label: labelText, kind, shape, measurementStatus, placementBehavior: kind === "usable-floor" ? "allowed" : "blocked" };
}
