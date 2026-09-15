import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const FLOOR_X = 50;
const FLOOR_Y = 80;
const HALL_SIZE = 810; // 67′6″
const PORCH_DEPTH = 92; // 7′8″

const SECOND_FLOOR_X = 980;
const BALCONY_WIDTH = 144; // 12′
const OPENING_SIZE = HALL_SIZE - BALCONY_WIDTH * 2;

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Magnolia Manor geometry based on the measured plan supplied by the user.
 * Confirmed dimensions are stored in real inches. Elements without an explicit
 * measurement remain source-traced so the catalog does not imply false precision.
 */
export function createMagnoliaManorConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    area(
      common,
      "magnolia-manor-main-floor",
      "main-floor",
      "Main Event Floor · 67′6″ × 67′6″",
      FLOOR_X,
      FLOOR_Y,
      HALL_SIZE,
      HALL_SIZE,
      "allowed",
      "confirmed",
    ),
    area(
      common,
      "magnolia-manor-entrance-porch",
      "porch",
      "Entrance Porch · 7′8″ Deep",
      FLOOR_X,
      FLOOR_Y + HALL_SIZE,
      HALL_SIZE,
      PORCH_DEPTH,
      "restricted",
      "confirmed",
    ),

    // Confirmed permanent service fixtures.
    area(common, "magnolia-manor-bar-counter", "bar", "Permanent Bar · 16′2″ × 3′9″", 118, 158, 194, 45, "blocked", "confirmed"),
    areaWithoutLabel(common, "magnolia-manor-bar-top", "bar", "Bar Top · 21″ Deep", 118, 158, 194, 21, "blocked", "confirmed"),
    areaWithoutLabel(common, "magnolia-manor-bar-sink", "bar", "Back Sink · 6′4″ × 2′", 177, 203, 76, 24, "blocked", "confirmed"),
    area(common, "magnolia-manor-buffet", "buffet", "Permanent Buffet · 14′ × 4′", 626, 158, 168, 48, "blocked", "confirmed"),

    ...createFirstFloorStaircase(common),
    ...createFirstFloorPillars(common),
    areaPolygon(
      common,
      "magnolia-manor-fireplace",
      "fireplace",
      "Fireplace",
      [860, 424, 830, 424, 820, 448, 820, 496, 830, 520, 860, 520],
      "blocked",
    ),
    ...createFirstFloorWalls(common),
    ...createFirstFloorDoors(common),
    label(common, "magnolia-manor-first-floor-label", "FIRST FLOOR · RECEPTION HALL", 275, 100, 360, 13),
    label(common, "magnolia-manor-suite-label", "SUITE ENTRANCE", 775, 322, 120, 9, 90),

    // The second-floor balcony is displayed beside the planning floor so its
    // architecture remains legible without overlapping first-floor objects.
    areaWithoutLabel(common, "magnolia-manor-second-floor-north", "second-floor", "Second Floor · 12′ Wide", SECOND_FLOOR_X, FLOOR_Y, HALL_SIZE, BALCONY_WIDTH, "restricted", "confirmed"),
    areaWithoutLabel(common, "magnolia-manor-second-floor-south", "second-floor", "Second Floor · 12′ Wide", SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE - BALCONY_WIDTH, HALL_SIZE, BALCONY_WIDTH, "restricted", "confirmed"),
    areaWithoutLabel(common, "magnolia-manor-second-floor-west", "second-floor", "Second Floor · 12′ Wide", SECOND_FLOOR_X, FLOOR_Y + BALCONY_WIDTH, BALCONY_WIDTH, OPENING_SIZE, "restricted", "confirmed"),
    areaWithoutLabel(common, "magnolia-manor-second-floor-east", "second-floor", "Second Floor · 12′ Wide", SECOND_FLOOR_X + HALL_SIZE - BALCONY_WIDTH, FLOOR_Y + BALCONY_WIDTH, BALCONY_WIDTH, OPENING_SIZE, "restricted", "confirmed"),
    area(common, "magnolia-manor-open-to-below", "open-to-below", "Open to Floor Below", SECOND_FLOOR_X + BALCONY_WIDTH, FLOOR_Y + BALCONY_WIDTH, OPENING_SIZE, OPENING_SIZE, "blocked", "confirmed"),
    area(common, "magnolia-manor-second-floor-balcony", "porch", "Balcony · 7′8″ Deep", SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE, HALL_SIZE, PORCH_DEPTH, "restricted", "confirmed"),
    ...createSecondFloorStaircase(common),
    ...createSecondFloorPillars(common),
    areaPolygon(
      common,
      "magnolia-manor-second-floor-fireplace",
      "fireplace",
      "Fireplace",
      [SECOND_FLOOR_X + HALL_SIZE, 424, SECOND_FLOOR_X + HALL_SIZE - 30, 424, SECOND_FLOOR_X + HALL_SIZE - 40, 448, SECOND_FLOOR_X + HALL_SIZE - 40, 496, SECOND_FLOOR_X + HALL_SIZE - 30, 520, SECOND_FLOOR_X + HALL_SIZE, 520],
      "blocked",
    ),
    ...createSecondFloorWalls(common),
    label(common, "magnolia-manor-second-floor-label", "SECOND FLOOR · BALCONY", 1205, 100, 360, 13),
  ];

  return {
    physicalWidthInches: 1840,
    physicalHeightInches: 1022,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Magnolia Manor reception hall confirmed at 67′6″ × 67′6″. The second-floor balcony is 12′ wide and the entrance porch is 7′8″ deep. Staircase, bar, sink, buffet, and specified railing dimensions use confirmed measurements; doors, fireplace, and unmeasured pillar footprints are source-traced from the supplied plan.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createFirstFloorStaircase(common: Common): FixedArchitectureElement[] {
  return [
    area(common, "magnolia-manor-stair-landing", "landing", "Landing · 6′8″ × 6′7″", 415, 178, 80, 79, "blocked", "confirmed"),
    stairs(common, "magnolia-manor-bottom-flight", "Bottom Stair Flight · 9′5″ Wide", 399, 257, 113, 132, "vertical", 9, "Confirmed 113-inch width with 132-inch bottom-flight railings."),
    stairs(common, "magnolia-manor-west-flight", "Side Stair Flight", 317, 178, 98, 79, "horizontal", 8, "Confirmed 98-inch side-flight railings."),
    stairs(common, "magnolia-manor-east-flight", "Side Stair Flight", 495, 178, 98, 79, "horizontal", 8, "Confirmed 98-inch side-flight railings."),
    railing(common, "magnolia-manor-top-railing", "Top Railing · 21′8″", [325, 171, 585, 171], "Confirmed 260-inch straight railing."),
    railing(common, "magnolia-manor-bottom-railing-west", "Bottom Flight Railing · 11′", [399, 257, 399, 389], "Confirmed 132-inch railing."),
    railing(common, "magnolia-manor-bottom-railing-east", "Bottom Flight Railing · 11′", [512, 257, 512, 389], "Confirmed 132-inch railing."),
    railing(common, "magnolia-manor-side-railing-west", "Side Flight Railing · 8′2″", [317, 257, 415, 257], "Confirmed 98-inch railing."),
    railing(common, "magnolia-manor-side-railing-east", "Side Flight Railing · 8′2″", [495, 257, 593, 257], "Confirmed 98-inch railing."),
    areaWithNote(common, "magnolia-manor-stair-square", "pillar", "Stair Structure", 431, 127, 48, 48, "blocked", "source-traced", "Confirmed 48 inches wide and 52 inches tall; the displayed floor depth is source-traced because the second measurement is vertical height."),
    areaWithNote(common, "magnolia-manor-bottom-stair-pillar-west", "pillar", "Stair Pillar", 389, 379, 20, 20, "blocked", "source-traced", "Bottom pillar confirmed at 53 inches tall; footprint is source-traced."),
    areaWithNote(common, "magnolia-manor-bottom-stair-pillar-east", "pillar", "Stair Pillar", 502, 379, 20, 20, "blocked", "source-traced", "Bottom pillar confirmed at 53 inches tall; footprint is source-traced."),
  ];
}

function createSecondFloorStaircase(common: Common): FixedArchitectureElement[] {
  const dx = SECOND_FLOOR_X - FLOOR_X;
  return [
    area(common, "magnolia-manor-second-floor-stair-landing", "landing", "Landing · 6′8″ × 6′7″", 415 + dx, 178, 80, 79, "blocked", "confirmed"),
    stairs(common, "magnolia-manor-second-floor-bottom-flight", "Stair Opening · 9′5″ Wide", 399 + dx, 257, 113, 132, "vertical", 9, "Confirmed 113-inch width with 132-inch bottom-flight railings."),
    stairs(common, "magnolia-manor-second-floor-west-flight", "Side Stair Flight", 317 + dx, 178, 98, 79, "horizontal", 8, "Confirmed 98-inch side-flight railings."),
    stairs(common, "magnolia-manor-second-floor-east-flight", "Side Stair Flight", 495 + dx, 178, 98, 79, "horizontal", 8, "Confirmed 98-inch side-flight railings."),
    railing(common, "magnolia-manor-second-floor-top-railing", "Top Railing · 21′8″", [325 + dx, 171, 585 + dx, 171], "Confirmed 260-inch straight railing."),
  ];
}

function createFirstFloorPillars(common: Common): FixedArchitectureElement[] {
  const positions = [[170, 340], [690, 340], [170, 650], [690, 650], [285, 760], [575, 760]];
  return positions.map(([x, y], index) =>
    areaWithNote(common, `magnolia-manor-pillar-${index + 1}`, "pillar", "Pillar", x, y, 18, 18, "blocked", "source-traced", "Pillar footprint and source-plan position are traced. Confirmed layout relationship: 10 feet pillar-to-wall and 24 feet 2 inches between pillars on each side."),
  );
}

function createSecondFloorPillars(common: Common): FixedArchitectureElement[] {
  return createFirstFloorPillars(common).map((element, index) => {
    if (element.kind !== "area" || element.shape.type !== "rectangle") return element;
    return {
      ...element,
      id: `magnolia-manor-second-floor-pillar-${index + 1}`,
      shape: { ...element.shape, x: element.shape.x + SECOND_FLOOR_X - FLOOR_X },
    };
  });
}

function createFirstFloorWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "magnolia-manor-first-north-wall", [FLOOR_X, FLOOR_Y, FLOOR_X + HALL_SIZE, FLOOR_Y]),
    wall(common, "magnolia-manor-first-east-wall", [FLOOR_X + HALL_SIZE, FLOOR_Y, FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE]),
    wall(common, "magnolia-manor-first-south-wall", [FLOOR_X, FLOOR_Y + HALL_SIZE, FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE]),
    wall(common, "magnolia-manor-first-west-wall", [FLOOR_X, FLOOR_Y, FLOOR_X, FLOOR_Y + HALL_SIZE]),
    wall(common, "magnolia-manor-first-porch-west-wall", [FLOOR_X, FLOOR_Y + HALL_SIZE, FLOOR_X, FLOOR_Y + HALL_SIZE + PORCH_DEPTH]),
    wall(common, "magnolia-manor-first-porch-east-wall", [FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE, FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE + PORCH_DEPTH]),
    wall(common, "magnolia-manor-first-porch-south-wall", [FLOOR_X, FLOOR_Y + HALL_SIZE + PORCH_DEPTH, FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE + PORCH_DEPTH]),
  ];
}

function createSecondFloorWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "magnolia-manor-second-north-wall", [SECOND_FLOOR_X, FLOOR_Y, SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y]),
    wall(common, "magnolia-manor-second-east-wall", [SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y, SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE]),
    wall(common, "magnolia-manor-second-south-wall", [SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE, SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE]),
    wall(common, "magnolia-manor-second-west-wall", [SECOND_FLOOR_X, FLOOR_Y, SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE]),
    wall(common, "magnolia-manor-open-north-rail", [SECOND_FLOOR_X + BALCONY_WIDTH, FLOOR_Y + BALCONY_WIDTH, SECOND_FLOOR_X + HALL_SIZE - BALCONY_WIDTH, FLOOR_Y + BALCONY_WIDTH]),
    wall(common, "magnolia-manor-open-east-rail", [SECOND_FLOOR_X + HALL_SIZE - BALCONY_WIDTH, FLOOR_Y + BALCONY_WIDTH, SECOND_FLOOR_X + HALL_SIZE - BALCONY_WIDTH, FLOOR_Y + HALL_SIZE - BALCONY_WIDTH]),
    wall(common, "magnolia-manor-open-south-rail", [SECOND_FLOOR_X + BALCONY_WIDTH, FLOOR_Y + HALL_SIZE - BALCONY_WIDTH, SECOND_FLOOR_X + HALL_SIZE - BALCONY_WIDTH, FLOOR_Y + HALL_SIZE - BALCONY_WIDTH]),
    wall(common, "magnolia-manor-open-west-rail", [SECOND_FLOOR_X + BALCONY_WIDTH, FLOOR_Y + BALCONY_WIDTH, SECOND_FLOOR_X + BALCONY_WIDTH, FLOOR_Y + HALL_SIZE - BALCONY_WIDTH]),
    wall(common, "magnolia-manor-second-balcony-west-wall", [SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE, SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE + PORCH_DEPTH]),
    wall(common, "magnolia-manor-second-balcony-east-wall", [SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE, SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE + PORCH_DEPTH]),
    wall(common, "magnolia-manor-second-balcony-south-wall", [SECOND_FLOOR_X, FLOOR_Y + HALL_SIZE + PORCH_DEPTH, SECOND_FLOOR_X + HALL_SIZE, FLOOR_Y + HALL_SIZE + PORCH_DEPTH]),
  ];
}

function createFirstFloorDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "magnolia-manor-north-door", 530, FLOOR_Y, 48, 180, "clockwise"),
    door(common, "magnolia-manor-west-upper-door", FLOOR_X, 400, 48, 90, "clockwise"),
    door(common, "magnolia-manor-west-lower-door", FLOOR_X, 555, 48, 90, "counterclockwise"),
    door(common, "magnolia-manor-suite-door", FLOOR_X + HALL_SIZE, 238, 48, 90, "counterclockwise"),
    door(common, "magnolia-manor-south-door-a", 425, FLOOR_Y + HALL_SIZE, 48, 0, "clockwise"),
    door(common, "magnolia-manor-south-door-b", 473, FLOOR_Y + HALL_SIZE, 48, 180, "counterclockwise"),
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

function areaWithNote(
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
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior, measurementStatus), physicalNote };
}

function areaWithoutLabel(
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
): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior, measurementStatus), showLabel: false };
}

function areaPolygon(
  common: Common,
  id: string,
  role: Extract<FixedArchitectureElement, { kind: "area" }>["role"],
  areaLabel: string,
  points: number[],
  placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"],
): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, placementBehavior, elevation: "floor", shape: { type: "polygon", points } };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, railingLabel: string, points: number[], physicalNote: string): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: railingLabel, physicalNote, placementBehavior: "blocked", measurementStatus: "confirmed", points };
}

function stairs(
  common: Common,
  id: string,
  stairLabel: string,
  x: number,
  y: number,
  width: number,
  height: number,
  orientation: "horizontal" | "vertical",
  treadCount: number,
  physicalNote: string,
): FixedArchitectureElement {
  return { ...common, id, kind: "stairs", label: stairLabel, physicalNote, placementBehavior: "blocked", measurementStatus: "confirmed", x, y, width, height, orientation, treadCount };
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
  return { ...common, id, kind: "door", label: "Door · source-traced", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
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
