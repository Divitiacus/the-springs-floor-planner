import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration, HallLevelConfiguration } from "@/domain/location-catalog";

const CANVAS_WIDTH = 1340;
const CANVAS_HEIGHT = 660;
const HALL_X = 560;
const HALL_Y = 90;
const HALL_WIDTH = 720; // 60 feet
const HALL_HEIGHT = 480; // 40 feet
// The supplied second-floor slide is rotated relative to the first floor.
// These coordinates represent that level turned 180 degrees so the void and
// connecting stairs align with the reception hall below.
const BALCONY_X = HALL_X - 376;
const BALCONY_Y = HALL_Y;
const BALCONY_WIDTH = 376; // 31 feet 4 inches
const BALCONY_HEIGHT = 360;

type Common = { fixed: true; measurementStatus: "source-traced" };

/** White Sparrow, traced as two levels from the user-supplied planning drawings. */
export function createWhiteSparrowConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const levels: HallLevelConfiguration[] = [
    {
      id: "level-1-reception-hall",
      slug: "reception-hall",
      name: "Level 1 — Reception Hall",
      physicalWidthInches: CANVAS_WIDTH,
      physicalHeightInches: CANVAS_HEIGHT,
      physicalDimensionStatus: "source-traced",
      physicalDimensionNote:
        "The main reception room is confirmed at 60′ × 40′. Service rooms, the fixed bar, doors, and stairs are proportionally traced from the supplied first-floor plan.",
      planningBounds: { x: HALL_X, y: HALL_Y, width: HALL_WIDTH, height: HALL_HEIGHT },
      defaultObjectPosition: { x: HALL_X + HALL_WIDTH / 2, y: HALL_Y + HALL_HEIGHT / 2 },
      usableAreas: [floorRegion("white-sparrow-main-usable-floor", "Main Reception Hall", "usable-floor", {
        type: "rectangle",
        x: HALL_X,
        y: HALL_Y,
        width: HALL_WIDTH,
        height: HALL_HEIGHT,
      }, "confirmed")],
      voidAreas: [],
      fixedArchitecturalElements: createDownstairsElements(common),
      floorplanAsset: null,
    },
    {
      id: "level-2-upstairs-balcony",
      slug: "upstairs-balcony",
      name: "Level 2 — Upstairs Balcony",
      physicalWidthInches: CANVAS_WIDTH,
      physicalHeightInches: CANVAS_HEIGHT,
      physicalDimensionStatus: "source-traced",
      physicalDimensionNote:
        "The usable upstairs balcony has a confirmed 31′4″ span. Only the source-highlighted balcony rectangle is furniture-eligible; the large west section is open to the reception hall below.",
      planningBounds: { x: BALCONY_X, y: BALCONY_Y, width: BALCONY_WIDTH, height: BALCONY_HEIGHT },
      defaultObjectPosition: { x: BALCONY_X + BALCONY_WIDTH / 2, y: BALCONY_Y + BALCONY_HEIGHT / 2 },
      usableAreas: [floorRegion("white-sparrow-balcony-usable-floor", "Upstairs Balcony", "usable-floor", {
        type: "rectangle",
        x: BALCONY_X,
        y: BALCONY_Y,
        width: BALCONY_WIDTH,
        height: BALCONY_HEIGHT,
      }, "confirmed")],
      voidAreas: [floorRegion("white-sparrow-reception-void", "Open to Reception Hall Below", "open-to-below", {
        type: "rectangle",
        x: HALL_X,
        y: HALL_Y,
        width: HALL_WIDTH,
        height: HALL_HEIGHT,
      }, "confirmed")],
      fixedArchitecturalElements: createUpstairsElements(common),
      floorplanAsset: null,
    },
  ];

  return { levels, defaultLevelId: "level-1-reception-hall" };
}

function createDownstairsElements(common: Common): FixedArchitectureElement[] {
  return [
    floor(common, "white-sparrow-main-floor", "MAIN RECEPTION HALL · 60′ × 40′", HALL_X, HALL_Y, HALL_WIDTH, HALL_HEIGHT, "confirmed"),
    blockedArea(common, "white-sparrow-service-wing", "catering", "SERVICE AREA", 60, HALL_Y, HALL_X - 60, HALL_HEIGHT, false),
    blockedArea(common, "white-sparrow-kitchen", "catering", "KITCHEN", 60, HALL_Y, 250, 175),
    blockedArea(common, "white-sparrow-storage", "closet", "STORAGE", 310, HALL_Y, 155, 175),
    blockedArea(common, "white-sparrow-bar", "bar", "BAR", 405, 132, 155, 42),
    blockedArea(common, "white-sparrow-office", "closet", "OFFICE", 60, 395, 205, 175),
    blockedArea(common, "white-sparrow-restroom-west", "closet", "RESTROOM", 265, 395, 135, 175),
    blockedArea(common, "white-sparrow-restroom-east", "closet", "RESTROOM", 430, 395, 130, 175),
    stairs(common, "white-sparrow-downstairs-stairs-south", 430, 470, 130, 100, "horizontal", 10, "x"),
    stairs(common, "white-sparrow-downstairs-stairs-east", 505, 380, 55, 90, "vertical", 7, "y"),
    wall(common, "white-sparrow-hall-north-wall", [HALL_X, HALL_Y, HALL_X + HALL_WIDTH, HALL_Y]),
    wall(common, "white-sparrow-hall-east-wall", [HALL_X + HALL_WIDTH, HALL_Y, HALL_X + HALL_WIDTH, HALL_Y + HALL_HEIGHT]),
    wall(common, "white-sparrow-hall-south-wall", [HALL_X, HALL_Y + HALL_HEIGHT, HALL_X + HALL_WIDTH, HALL_Y + HALL_HEIGHT]),
    wall(common, "white-sparrow-hall-west-wall", [HALL_X, HALL_Y, HALL_X, HALL_Y + HALL_HEIGHT]),
    door(common, "white-sparrow-west-door-north", HALL_X, 282, 42, 90, "clockwise"),
    door(common, "white-sparrow-west-door-south", HALL_X, 366, 42, -90, "counterclockwise"),
    door(common, "white-sparrow-east-door-north", HALL_X + HALL_WIDTH, 282, 42, 90, "counterclockwise"),
    door(common, "white-sparrow-east-door-south", HALL_X + HALL_WIDTH, 366, 42, -90, "clockwise"),
    label(common, "white-sparrow-main-hall-label", "MAIN RECEPTION HALL\n60′ × 40′", HALL_X + 220, 305, 280, 18),
  ];
}

function createUpstairsElements(common: Common): FixedArchitectureElement[] {
  return [
    floor(common, "white-sparrow-upstairs-balcony", "UPSTAIRS BALCONY · 31′4″", BALCONY_X, BALCONY_Y, BALCONY_WIDTH, BALCONY_HEIGHT, "confirmed"),
    blockedArea(common, "white-sparrow-upstairs-suite-wing", "closet", "SUITES / SUPPORT AREA", 40, HALL_Y, BALCONY_X - 40, HALL_HEIGHT, false),
    blockedArea(common, "white-sparrow-upstairs-stair-landing", "landing", "STAIR LANDING", 430, 380, 75, 90, false),
    stairs(common, "white-sparrow-upstairs-east-flight", 505, 380, 55, 90, "vertical", 7, "y"),
    stairs(common, "white-sparrow-upstairs-south-flight", 430, 470, 130, 100, "horizontal", 10, "x"),
    wall(common, "white-sparrow-balcony-west-wall", [BALCONY_X, BALCONY_Y, BALCONY_X, BALCONY_Y + BALCONY_HEIGHT]),
    railing(common, "white-sparrow-balcony-north-rail", [BALCONY_X, BALCONY_Y, BALCONY_X + BALCONY_WIDTH, BALCONY_Y]),
    railing(common, "white-sparrow-balcony-south-rail", [BALCONY_X, BALCONY_Y + BALCONY_HEIGHT, BALCONY_X + BALCONY_WIDTH, BALCONY_Y + BALCONY_HEIGHT]),
    railing(common, "white-sparrow-balcony-east-rail", [BALCONY_X + BALCONY_WIDTH, BALCONY_Y, BALCONY_X + BALCONY_WIDTH, BALCONY_Y + BALCONY_HEIGHT]),
    wall(common, "white-sparrow-upstairs-north-wall", [40, HALL_Y, HALL_X + HALL_WIDTH, HALL_Y]),
    wall(common, "white-sparrow-upstairs-west-wall", [40, HALL_Y, 40, HALL_Y + HALL_HEIGHT]),
    wall(common, "white-sparrow-upstairs-south-wall", [40, HALL_Y + HALL_HEIGHT, HALL_X + HALL_WIDTH, HALL_Y + HALL_HEIGHT]),
    wall(common, "white-sparrow-upstairs-east-wall", [HALL_X + HALL_WIDTH, HALL_Y, HALL_X + HALL_WIDTH, HALL_Y + HALL_HEIGHT]),
    label(common, "white-sparrow-open-below-label", "OPEN TO RECEPTION HALL BELOW", HALL_X + 170, HALL_Y + 220, 380, 18),
    label(common, "white-sparrow-balcony-label", "UPSTAIRS BALCONY\n31′4″", BALCONY_X + 60, BALCONY_Y + 150, 256, 17),
  ];
}

function floor(common: Common, id: string, areaLabel: string, x: number, y: number, width: number, height: number, measurementStatus: "confirmed" | "source-traced"): FixedArchitectureElement {
  return { ...common, id, kind: "area", role: "main-floor", label: areaLabel, placementBehavior: "allowed", measurementStatus, elevation: "floor", shape: { type: "rectangle", x, y, width, height }, showLabel: false, showOutline: false };
}

function blockedArea(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, showLabel = true): FixedArchitectureElement {
  return { ...common, id, kind: "area", role, label: areaLabel, placementBehavior: "blocked", elevation: "floor", shape: { type: "rectangle", x, y, width, height }, showLabel };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: "Fixed balcony railing", placementBehavior: "blocked", points };
}

function stairs(common: Common, id: string, x: number, y: number, width: number, height: number, orientation: "horizontal" | "vertical", treadCount: number, treadAxis: "x" | "y"): FixedArchitectureElement {
  return { ...common, id, kind: "stairs", label: "Stairs", placementBehavior: "blocked", x, y, width, height, orientation, treadCount, treadAxis, showLabel: false };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise"): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: "Double-door leaf · source-traced", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize: number): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize };
}

function floorRegion(id: string, labelText: string, kind: VenueFloorRegion["kind"], shape: VenueFloorRegion["shape"], measurementStatus: VenueFloorRegion["measurementStatus"] = "source-traced"): VenueFloorRegion {
  return { id, label: labelText, kind, shape, measurementStatus, placementBehavior: kind === "usable-floor" ? "allowed" : "blocked" };
}
