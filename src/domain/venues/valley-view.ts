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
      "The overall 116-foot hall span and the labeled 40-foot, 38.5-foot, 29-foot, 21-foot, 19-foot, and 11-foot sections are calibrated from the supplied Valley View plan. Unlabeled offsets, doors, pillars, stairs, platform, pews, and mantle are proportionally source-traced.",
    planningBounds: { x: PLAN_X, y: PLAN_TOP, width: PLAN_WIDTH, height: SOUTH_TOP + SOUTH_HEIGHT - PLAN_TOP },
    defaultObjectPosition: { x: 930, y: 560 },
    usableAreas: createUsableAreas(),
    voidAreas: [],
    fixedArchitecturalElements: [
      ...createFloorAreas(common),
      ...createChapelFixtures(common),
      ...createWestStairs(common),
      area(common, "valley-view-mantle", "fireplace", "MANTLE · 13′7″ × 4′", SOUTH_X + 28, SOUTH_TOP + 24, 48, 163, "blocked", "confirmed"),
      ...createPillars(common),
      perimeterWall(common),
      ...createDoors(common),
      label(common, "valley-view-chapel-label", "CHAPEL", NORTH_X + 58, PLAN_TOP + 24, 210, 12),
      label(common, "valley-view-upstairs-label", "UPSTAIRS", 270, CENTER_TOP + 112, 150, 9),
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

function createChapelFixtures(common: Common): FixedArchitectureElement[] {
  const pews = [
    [548, 78, 77, 42], [663, 78, 76, 42], [528, 137, 34, 76], [594, 141, 78, 43],
    [686, 134, 34, 88], [570, 234, 93, 42], [635, 293, 126, 33],
  ];
  return [
    ...pews.map(([x, y, width, height], index) => pathRect(common, `valley-view-chapel-pew-${index + 1}`, x, y, width, height)),
    area(common, "valley-view-chapel-platform", "stage", "CHAPEL PLATFORM", NORTH_X, CENTER_TOP - 29, 228, 29, "blocked", "confirmed"),
  ];
}

function createWestStairs(common: Common): FixedArchitectureElement[] {
  return [
    stairs(common, "valley-view-upper-stair-flight", 282, CENTER_TOP, 99, 116, 9),
    stairs(common, "valley-view-lower-stair-flight", 282, CENTER_TOP + 264, 99, 148, 10),
    {
      ...common,
      id: "valley-view-stair-landing",
      kind: "path",
      label: "Stair landing",
      placementBehavior: "blocked",
      data: `M 282 ${CENTER_TOP + 116} L 381 ${CENTER_TOP + 116} L 381 ${CENTER_TOP + 212} L 313 ${CENTER_TOP + 212} L 282 ${CENTER_TOP + 236} Z`,
      fill: "#e0e2dd",
      stroke: "#68736d",
      strokeWidth: 2,
    },
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

function pathRect(common: Common, id: string, x: number, y: number, width: number, height: number): FixedArchitectureElement {
  return { ...common, id, kind: "path", label: "Fixed chapel pew", placementBehavior: "blocked", data: `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`, fill: "#c4c7c4", stroke: "#a9aeaa", strokeWidth: 1 };
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
