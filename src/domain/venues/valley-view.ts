import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const PLAN_X = 50;
const PLAN_TOP = 50;
const PLAN_WIDTH = 1392; // 116′, confirmed on the supplied plan.
const CENTER_TOP = 351;
const CENTER_HEIGHT = 412;
const NORTH_X = 523;
const NORTH_WIDTH = 798;
const NORTH_HEIGHT = CENTER_TOP - PLAN_TOP;
const SOUTH_X = 764;
const SOUTH_TOP = CENTER_TOP + CENTER_HEIGHT;
const SOUTH_WIDTH = 557;
const SOUTH_HEIGHT = 298;

type Common = { fixed: true; measurementStatus: "source-traced" };

/** Valley View's single hall, traced from the dimensioned plan supplied by the user. */
export function createValleyViewConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  return {
    physicalWidthInches: 1492,
    physicalHeightInches: 1111,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "The overall 116-foot hall span and the labeled 40-foot, 38.5-foot, 29-foot, 21-foot, 19-foot, and 11-foot sections are calibrated from the supplied Valley View plan. Unlabeled offsets, doors, pillars, stairs, fixed furnishings, platform, and mantle are proportionally source-traced.",
    planningBounds: { x: PLAN_X, y: PLAN_TOP, width: PLAN_WIDTH, height: SOUTH_TOP + SOUTH_HEIGHT - PLAN_TOP },
    defaultObjectPosition: { x: 930, y: 560 },
    usableAreas: createUsableAreas(),
    voidAreas: [],
    fixedArchitecturalElements: [
      ...createFloorAreas(common),
      ...createSuiteAccessFixtures(common),
      ...createWestStairs(common),
      area(common, "valley-view-mantle", "fireplace", "MANTLE · 13′7″ × 4′", SOUTH_X + 28, SOUTH_TOP + 24, 48, 163, "blocked", "confirmed"),
      ...createPillars(common),
      perimeterWall(common),
      ...createDoors(common),
      label(common, "valley-view-upstairs-label", "UPSTAIRS", 278, CENTER_TOP + 145, 144, 9),
    ],
    floorplanAsset: null,
  };
}

function createFloorAreas(common: Common): FixedArchitectureElement[] {
  return [
    floor(common, "valley-view-main-floor", "main-floor", PLAN_X, CENTER_TOP, PLAN_WIDTH, CENTER_HEIGHT),
    floor(common, "valley-view-north-floor", "event-floor-extension", NORTH_X, PLAN_TOP, NORTH_WIDTH, NORTH_HEIGHT),
    floor(common, "valley-view-south-floor", "event-floor-extension", SOUTH_X, SOUTH_TOP, SOUTH_WIDTH, SOUTH_HEIGHT),
  ];
}

function createUsableAreas(): VenueFloorRegion[] {
  const common = { kind: "usable-floor" as const, placementBehavior: "allowed" as const, measurementStatus: "source-traced" as const };
  return [
    { ...common, id: "valley-view-main-usable-floor", label: "Main event floor", shape: { type: "rectangle" as const, x: PLAN_X, y: CENTER_TOP, width: PLAN_WIDTH, height: CENTER_HEIGHT } },
    { ...common, id: "valley-view-north-usable-floor", label: "North event floor", shape: { type: "rectangle" as const, x: NORTH_X, y: PLAN_TOP, width: NORTH_WIDTH, height: NORTH_HEIGHT } },
    { ...common, id: "valley-view-south-usable-floor", label: "South event floor", shape: { type: "rectangle" as const, x: SOUTH_X, y: SOUTH_TOP, width: SOUTH_WIDTH, height: SOUTH_HEIGHT } },
  ];
}

function createSuiteAccessFixtures(common: Common): FixedArchitectureElement[] {
  const fixtures = [
    [635, 50, 77, 42],
    [528, 137, 34, 76],
    [574, 152, 78, 42],
    [686, 137, 34, 76],
    [570, 230, 93, 42],
    [635, 289, 112, 33],
  ];
  return [
    ...fixtures.map(([x, y, width, height], index) =>
      pathRect(common, `valley-view-suite-fixture-${index + 1}`, x, y, width, height),
    ),
    {
      ...common,
      id: "valley-view-suite-platform",
      kind: "path",
      label: "Fixed platform",
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
      data: `M ${NORTH_X} ${CENTER_TOP - 29} H ${NORTH_X + 228} V ${CENTER_TOP} H ${NORTH_X} Z`,
      fill: "#fffdfa",
      stroke: "#68736d",
      strokeWidth: 2,
    },
  ];
}

function createWestStairs(common: Common): FixedArchitectureElement[] {
  return [
    stairs(common, "valley-view-upper-stair-flight", 282, CENTER_TOP, 99, 116, 9),
    pathRect(common, "valley-view-upper-stair-landing", 381, CENTER_TOP, 50, 116, "#e2e4df"),
    stairLine(common, "valley-view-upper-stair-turn", `M 381 ${CENTER_TOP + 116} L 282 ${CENTER_TOP + 154}`),
    stairLine(common, "valley-view-lower-stair-turn", `M 282 ${CENTER_TOP + 254} L 381 ${CENTER_TOP + 294} H 431 V ${CENTER_TOP + 412}`),
    stairs(common, "valley-view-lower-stair-flight", 282, CENTER_TOP + 294, 99, 118, 9),
  ];
}

function createPillars(common: Common): FixedArchitectureElement[] {
  return [
    pillar(common, "valley-view-pillar-northwest", 930, CENTER_TOP - 10),
    pillar(common, "valley-view-pillar-northeast", 1116, CENTER_TOP - 10),
    pillar(common, "valley-view-pillar-southwest", 930, CENTER_TOP + CENTER_HEIGHT - 10),
    pillar(common, "valley-view-pillar-southeast", 1116, CENTER_TOP + CENTER_HEIGHT - 10),
  ];
}

function perimeterWall(common: Common): FixedArchitectureElement {
  return wall(common, "valley-view-perimeter-wall", [
    NORTH_X, PLAN_TOP, NORTH_X + NORTH_WIDTH, PLAN_TOP,
    NORTH_X + NORTH_WIDTH, CENTER_TOP, PLAN_X + PLAN_WIDTH, CENTER_TOP,
    PLAN_X + PLAN_WIDTH, CENTER_TOP + CENTER_HEIGHT,
    SOUTH_X + SOUTH_WIDTH, CENTER_TOP + CENTER_HEIGHT,
    SOUTH_X + SOUTH_WIDTH, SOUTH_TOP + SOUTH_HEIGHT,
    SOUTH_X, SOUTH_TOP + SOUTH_HEIGHT,
    SOUTH_X, CENTER_TOP + CENTER_HEIGHT,
    PLAN_X, CENTER_TOP + CENTER_HEIGHT,
    PLAN_X, CENTER_TOP,
    NORTH_X, CENTER_TOP,
    NORTH_X, PLAN_TOP,
  ]);
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "valley-view-west-door-north", PLAN_X, 526, 48, 90, "counterclockwise"),
    door(common, "valley-view-west-door-south", PLAN_X, 622, 48, -90, "clockwise"),
    door(common, "valley-view-east-door-north", PLAN_X + PLAN_WIDTH, 526, 48, 90, "clockwise"),
    door(common, "valley-view-east-door-south", PLAN_X + PLAN_WIDTH, 622, 48, -90, "counterclockwise"),
    door(common, "valley-view-north-door-west-a", 735, PLAN_TOP, 42, 0, "counterclockwise"),
    door(common, "valley-view-north-door-west-b", 819, PLAN_TOP, 42, 180, "clockwise"),
    door(common, "valley-view-north-door-east-a", 1215, PLAN_TOP, 42, 0, "counterclockwise"),
    door(common, "valley-view-north-door-east-b", 1299, PLAN_TOP, 42, 180, "clockwise"),
    door(common, "valley-view-south-side-door", SOUTH_X + SOUTH_WIDTH, SOUTH_TOP + 86, 48, 90, "clockwise"),
  ];
}

function floor(common: Common, id: string, role: "main-floor" | "event-floor-extension", x: number, y: number, width: number, height: number): FixedArchitectureElement {
  return { ...area(common, id, role, "Event floor", x, y, width, height, "allowed", "source-traced"), showOutline: false, showLabel: false };
}

function area(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"]): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, placementBehavior, measurementStatus, elevation: role === "stage" ? "raised" : "floor", shape: { type: "rectangle", x, y, width, height } };
}

function pillar(common: Common, id: string, x: number, y: number): FixedArchitectureElement {
  return area(common, id, "pillar", "Pillar", x, y, 20, 20, "blocked", "source-traced");
}

function stairs(common: Common, id: string, x: number, y: number, width: number, height: number, treadCount: number): FixedArchitectureElement {
  return { ...common, id, kind: "stairs", label: "Stairs", placementBehavior: "blocked", x, y, width, height, orientation: "horizontal", treadAxis: "y", treadCount, showLabel: false };
}

function pathRect(common: Common, id: string, x: number, y: number, width: number, height: number, fill = "#c4c7c4"): FixedArchitectureElement {
  return { ...common, id, kind: "path", label: "Fixed furnishing", placementBehavior: "blocked", data: `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`, fill, stroke: "#a9aeaa", strokeWidth: 1 };
}

function stairLine(common: Common, id: string, data: string): FixedArchitectureElement {
  return { ...common, id, kind: "path", label: "Stair boundary", placementBehavior: "blocked", data, stroke: "#68736d", strokeWidth: 2 };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise"): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: "Door · source-traced", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize: number): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize };
}
