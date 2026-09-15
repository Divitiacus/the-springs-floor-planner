import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration, HallLevelConfiguration } from "@/domain/location-catalog";

const CANVAS_WIDTH = 1740;
const CANVAS_HEIGHT = 980;

// The supplied plans are landscape drawings of the same building. In this
// orientation the confirmed 55′ hall axis is horizontal and the confirmed 69′
// axis is vertical. One coordinate unit is one physical inch on both levels.
const HALL_X = 760;
const HALL_Y = 72;
const HALL_WIDTH = 660; // 55′
const HALL_HEIGHT = 828; // 69′

const ROTUNDA_X = 530;
const ROTUNDA_Y = 365;
const STAGE_X = HALL_X + HALL_WIDTH;
const STAGE_Y = 214;
const STAGE_WIDTH = 288; // 24′
const STAGE_DEPTH = 174; // 14′6″

type Common = { fixed: true; measurementStatus: "source-traced" };

/** Cypress · The Chateau, modeled as two independent levels at one scale. */
export function createTheChateauCypressConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const mainFloorElements = createMainFloorElements(common);
  const balconyElements = createBalconyElements(common);
  const levels: HallLevelConfiguration[] = [
    {
      id: "level-1-main-floor",
      slug: "main-floor",
      name: "Level 1 — Main Floor",
      physicalWidthInches: CANVAS_WIDTH,
      physicalHeightInches: CANVAS_HEIGHT,
      physicalDimensionStatus: "source-traced",
      physicalDimensionNote:
        "Main-floor geometry is independently traced from Main Floor.jpg. Confirmed dimensions include the 55′ × 69′ event hall, 24′ × 14′6″ raised stage, 18′4″ permanent bar, and 19′ × 24′ buffet room.",
      planningBounds: { x: HALL_X, y: HALL_Y, width: HALL_WIDTH, height: HALL_HEIGHT },
      defaultObjectPosition: { x: 930, y: 390 },
      usableAreas: createMainFloorUsableAreas(),
      voidAreas: [],
      fixedArchitecturalElements: mainFloorElements,
      floorplanAsset: null,
    },
    {
      id: "level-2-balcony",
      slug: "balcony",
      name: "Level 2 — Balcony",
      physicalWidthInches: CANVAS_WIDTH,
      physicalHeightInches: CANVAS_HEIGHT,
      physicalDimensionStatus: "source-traced",
      physicalDimensionNote:
        "Balcony geometry is independently traced from Balcony.jpg. Positive regions describe the wraparound walkway; the rotunda and main-hall openings are explicit open-to-below voids.",
      planningBounds: { x: 248, y: 28, width: 1172, height: 872 },
      defaultObjectPosition: { x: 900, y: 145 },
      usableAreas: createBalconyUsableAreas(),
      voidAreas: createBalconyVoidAreas(),
      fixedArchitecturalElements: balconyElements,
      floorplanAsset: null,
    },
  ];

  return {
    levels,
    defaultLevelId: "level-1-main-floor",
  };
}

function createMainFloorElements(common: Common): FixedArchitectureElement[] {
  return [
    {
      ...area(common, "chateau-main-floor", "main-floor", "Main Event Floor", HALL_X, HALL_Y, HALL_WIDTH, HALL_HEIGHT, "allowed", "confirmed"),
      showOutline: false,
    },
    {
      ...area(common, "chateau-southwest-floor", "event-floor-extension", "", 486, 620, HALL_X - 486, 280, "allowed"),
      showOutline: false,
      showLabel: false,
    },
    path(common, "chateau-rotunda-floor", "Rotunda Floor", rotundaFloorPath(), "allowed", {
      fill: "#fffdfa",
      stroke: "#526159",
      strokeWidth: 3,
    }),
    areaWithNote(common, "chateau-buffet-room", "buffet", "Buffet Room", 760, 72, 288, 228, "blocked", "confirmed", "Confirmed 24′ wide × 19′ deep after rotating the source plan into this view."),
    area(common, "chateau-kitchen", "catering", "Kitchen", 1048, 72, 372, 228, "blocked"),
    areaWithNote(common, "chateau-permanent-bar", "bar", "Permanent Bar", 612, 674, 40, 220, "blocked", "confirmed", "Confirmed 18′4″ bar length. Counter width and curved north end are source-traced."),
    area(common, "chateau-back-bar", "bar", "", 700, 674, 30, 220, "blocked"),
    label(common, "chateau-bar-label", "BAR", 524, 770, 82, 13),
    path(common, "chateau-stage", "Raised Stage", stagePath(), "allowed", {
      fill: "#ddd4c4",
      stroke: "#8e7b61",
      strokeWidth: 3,
      elevation: "raised",
    }, "confirmed", "Confirmed 24-foot span and 14.5-foot projection."),
    label(common, "chateau-stage-label", "RAISED STAGE · 24′ × 14′6″", 1478, 242, 214, 10, 90),
    ...createCurvedStairs(common, "main", 108, 170),
    path(common, "chateau-center-column", "Rotunda Column", circlePath(ROTUNDA_X, ROTUNDA_Y, 28), "blocked", {
      fill: "#e2e4df",
      stroke: "#657169",
      strokeWidth: 2,
    }),
    ...createMainFloorPillars(common),
    ...createMainFloorWalls(common),
    ...createMainFloorDoors(common),
    label(common, "chateau-main-level-label", "LEVEL 1 · MAIN FLOOR", 330, 92, 240, 12),
    label(common, "chateau-main-floor-label", "MAIN EVENT FLOOR", 1010, 440, 220, 16),
    label(common, "chateau-rotunda-label", "ROTUNDA · TWIN STAIRS", 404, 164, 252, 10),
    label(common, "chateau-courtyard-label", "COURTYARD", 1585, 352, 120, 13),
  ];
}

function createBalconyElements(common: Common): FixedArchitectureElement[] {
  return [
    ...createCurvedStairs(common, "balcony", 148, 210),
    ...createBalconyPillars(common),
    ...createBalconyWalls(common),
    ...createBalconyDoors(common),
    label(common, "chateau-balcony-level-label", "LEVEL 2 · BALCONY", 330, 92, 240, 12),
    label(common, "chateau-rotunda-open-label", "OPEN TO\nFLOOR BELOW", 450, 340, 160, 13),
    label(common, "chateau-balcony-open-label", "OPEN TO FLOOR BELOW", 974, 432, 250, 14),
    label(common, "chateau-balcony-walkway-label", "BALCONY · OVERLOOKS MAIN FLOOR", 974, 145, 250, 12),
  ];
}

function createMainFloorUsableAreas(): VenueFloorRegion[] {
  return [
    floorRegion("chateau-level-1-event-floor", "Main Event Floor", "usable-floor", {
      type: "rectangle",
      x: HALL_X,
      y: HALL_Y,
      width: HALL_WIDTH,
      height: HALL_HEIGHT,
    }, "confirmed"),
    floorRegion("chateau-level-1-southwest-floor", "Southwest Event Floor", "usable-floor", {
      type: "rectangle",
      x: 486,
      y: 620,
      width: HALL_X - 486,
      height: 280,
    }),
    floorRegion("chateau-level-1-rotunda-floor", "Rotunda Floor", "usable-floor", {
      type: "polygon",
      points: [502, 106, 760, 106, 760, 216, 708, 216, 610, 300, 564, 365, 610, 430, 708, 514, 760, 514, 760, 620, 486, 620, 486, 548, 448, 452, 448, 292, 502, 180],
    }),
    floorRegion("chateau-level-1-stage-floor", "Raised Stage", "usable-floor", {
      type: "polygon",
      points: [1420, 214, 1504, 214, 1566, 270, 1594, 358, 1566, 446, 1504, 502, 1420, 502],
    }, "confirmed"),
  ];
}

function createBalconyUsableAreas(): VenueFloorRegion[] {
  return [
    floorRegion("chateau-level-2-main-balcony-north", "North Balcony Walkway", "usable-floor", {
      type: "polygon",
      points: [760, 72, 1420, 72, 1420, 260, 1360, 260, 1304, 260, 1220, 280, 1142, 266, 1060, 248, 982, 272, 900, 270, 828, 250, 760, 250],
    }),
    floorRegion("chateau-level-2-main-balcony-south", "South Balcony Walkway", "usable-floor", {
      type: "polygon",
      points: [760, 716, 828, 716, 900, 716, 982, 698, 1058, 716, 1140, 728, 1218, 706, 1304, 720, 1360, 720, 1420, 720, 1420, 900, 760, 900],
    }),
    floorRegion("chateau-level-2-main-balcony-west", "West Balcony Walkway", "usable-floor", {
      type: "rectangle", x: 760, y: 250, width: 68, height: 466,
    }),
    floorRegion("chateau-level-2-main-balcony-east", "East Balcony Walkway", "usable-floor", {
      type: "rectangle", x: 1360, y: 260, width: 60, height: 460,
    }),
    floorRegion("chateau-level-2-rotunda-northeast", "Rotunda Balcony Walkway", "usable-floor", {
      type: "polygon", points: ringSegmentPolygon(ROTUNDA_X, ROTUNDA_Y, 148, 210, 270, 360, 12),
    }),
    floorRegion("chateau-level-2-rotunda-southeast", "Rotunda Balcony Walkway", "usable-floor", {
      type: "polygon", points: ringSegmentPolygon(ROTUNDA_X, ROTUNDA_Y, 148, 210, 0, 90, 12),
    }),
    floorRegion("chateau-level-2-rotunda-southwest", "Rotunda Balcony Walkway", "usable-floor", {
      type: "polygon", points: ringSegmentPolygon(ROTUNDA_X, ROTUNDA_Y, 148, 210, 90, 180, 12),
    }),
    floorRegion("chateau-level-2-rotunda-northwest", "Rotunda Balcony Walkway", "usable-floor", {
      type: "polygon", points: ringSegmentPolygon(ROTUNDA_X, ROTUNDA_Y, 148, 210, 180, 270, 12),
    }),
    floorRegion("chateau-level-2-rotunda-north-connector", "North Balcony Connector", "usable-floor", {
      type: "polygon", points: [676, 100, 828, 100, 828, 250, 760, 250, 760, 202, 698, 202],
    }),
    floorRegion("chateau-level-2-rotunda-south-connector", "South Balcony Connector", "usable-floor", {
      type: "polygon", points: [698, 528, 760, 528, 760, 716, 828, 716, 828, 640, 676, 640],
    }),
  ];
}

function createBalconyVoidAreas(): VenueFloorRegion[] {
  return [
    floorRegion("chateau-level-2-rotunda-void", "Open to Main Floor Below", "open-to-below", {
      type: "polygon",
      points: circlePolygon(ROTUNDA_X, ROTUNDA_Y, 148, 36),
    }),
    floorRegion("chateau-level-2-main-hall-void", "Open to Main Floor Below", "open-to-below", {
      type: "polygon",
      points: [828, 250, 900, 270, 982, 272, 1060, 248, 1142, 266, 1220, 280, 1304, 260, 1360, 260, 1360, 720, 1304, 720, 1218, 706, 1140, 728, 1058, 716, 982, 698, 900, 716, 828, 716],
    }),
  ];
}

function rotundaFloorPath() {
  return [
    "M 760 216 L 708 216 L 610 300",
    "C 580 326 568 344 564 365 C 568 386 580 404 610 430",
    "L 708 514 L 760 514 L 760 620 L 486 620 L 486 548",
    "C 460 520 448 488 448 452 L 448 292",
    "C 448 248 468 208 502 180 L 502 106 L 760 106 Z",
  ].join(" ");
}

function stagePath() {
  const bottom = STAGE_Y + STAGE_WIDTH;
  const east = STAGE_X + STAGE_DEPTH;
  const centerY = STAGE_Y + STAGE_WIDTH / 2;
  return `M ${STAGE_X} ${STAGE_Y} C ${STAGE_X + 98} ${STAGE_Y}, ${east} ${centerY - 78}, ${east} ${centerY} C ${east} ${centerY + 78}, ${STAGE_X + 98} ${bottom}, ${STAGE_X} ${bottom} Z`;
}

function createCurvedStairs(common: Common, level: "main" | "balcony", innerRadius: number, outerRadius: number): FixedArchitectureElement[] {
  const elements: FixedArchitectureElement[] = [
    path(common, `chateau-${level}-upper-curved-stairs`, "Curved Stairs", ringSegmentPath(ROTUNDA_X, ROTUNDA_Y, innerRadius, outerRadius, 194, 284), "blocked", { fill: "#e2e4df", stroke: "#657169", strokeWidth: 3 }),
    path(common, `chateau-${level}-lower-curved-stairs`, "Curved Stairs", ringSegmentPath(ROTUNDA_X, ROTUNDA_Y, innerRadius, outerRadius, 76, 166), "blocked", { fill: "#e2e4df", stroke: "#657169", strokeWidth: 3 }),
  ];

  for (const [side, start, end] of [["upper", 202, 278], ["lower", 82, 158]] as const) {
    for (let angle = start; angle <= end; angle += 9.5) {
      const inner = polar(ROTUNDA_X, ROTUNDA_Y, innerRadius, angle);
      const outer = polar(ROTUNDA_X, ROTUNDA_Y, outerRadius, angle);
      elements.push(path(common, `chateau-${level}-${side}-stair-tread-${angle}`, "Stair Tread", `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`, "blocked", { stroke: "#7e8983", strokeWidth: 1.5 }));
    }
  }
  return elements;
}

function createMainFloorPillars(common: Common): FixedArchitectureElement[] {
  const positions = [[422, 132], [422, 602], [732, 218], [826, 218], [732, 514], [826, 514], [732, 660], [826, 660], [1024, 660], [1218, 660]];
  return positions.map(([x, y], index) => area(common, `chateau-pillar-${index + 1}`, "pillar", "Pillar", x - 10, y - 10, 20, 20, "blocked"));
}

function createBalconyPillars(common: Common): FixedArchitectureElement[] {
  const positions = [[760, 250], [760, 606], [828, 250], [828, 606], [1094, 250], [1094, 606], [1360, 250], [1360, 606]];
  return positions.map(([x, y], index) => area(common, `chateau-balcony-pillar-${index + 1}`, "pillar", "Pillar", x - 10, y - 10, 20, 20, "blocked"));
}

function createMainFloorWalls(common: Common): FixedArchitectureElement[] {
  return [
    path(common, "chateau-outer-west-wall", "Fixed Wall", "M 298 106 L 298 236 C 264 274 246 316 246 365 C 246 414 264 456 298 494 L 298 622", "blocked", { stroke: "#46564d", strokeWidth: 6 }),
    wall(common, "chateau-upper-west-wall", [298, 106, 760, 106]),
    wall(common, "chateau-buffet-north-wall", [760, 72, 1048, 72]),
    wall(common, "chateau-kitchen-north-wall", [1048, 72, 1420, 72]),
    wall(common, "chateau-kitchen-east-wall", [1420, 72, 1420, STAGE_Y]),
    wall(common, "chateau-east-wall-south", [1420, STAGE_Y + STAGE_WIDTH, 1420, 900]),
    wall(common, "chateau-south-wall", [486, 900, 1420, 900]),
    wall(common, "chateau-southwest-wall", [486, 620, 486, 900]),
    wall(common, "chateau-southwest-north-wall", [486, 620, 760, 620]),
  ];
}

function createBalconyWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "chateau-balcony-north-wall", [760, 72, 1420, 72]),
    wall(common, "chateau-balcony-east-wall", [1420, 72, 1420, 900]),
    wall(common, "chateau-balcony-south-wall", [760, 900, 1420, 900]),
    path(common, "chateau-balcony-west-outer-wall", "Fixed Wall", "M 344 214 C 264 264 248 318 248 365 C 248 414 264 468 344 518", "blocked", { stroke: "#46564d", strokeWidth: 6 }),
    path(common, "chateau-balcony-north-curved-wall", "Fixed Wall", "M 344 214 L 344 112 C 430 22 586 22 676 100 L 760 100", "blocked", { stroke: "#46564d", strokeWidth: 6 }),
    path(common, "chateau-balcony-south-curved-wall", "Fixed Wall", "M 344 518 L 344 620 C 430 708 586 708 676 640 L 760 640", "blocked", { stroke: "#46564d", strokeWidth: 6 }),
  ];
}

function createMainFloorDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "chateau-west-double-door-upper", 246, 328, 48, 90, "clockwise"),
    door(common, "chateau-west-double-door-lower", 246, 424, 48, -90, "counterclockwise"),
    door(common, "chateau-courtyard-upper-a", 1420, 126, 48, 90, "clockwise"),
    door(common, "chateau-courtyard-upper-b", 1420, 174, 48, -90, "counterclockwise"),
    door(common, "chateau-courtyard-lower-a", 1420, 532, 48, 90, "clockwise"),
    door(common, "chateau-courtyard-lower-b", 1420, 580, 48, -90, "counterclockwise"),
    door(common, "chateau-buffet-door", 828, 216, 48, 0, "clockwise"),
    door(common, "chateau-kitchen-door", 1310, 72, 48, 180, "clockwise"),
  ];
}

function createBalconyDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "chateau-balcony-west-door-upper", 248, 318, 48, 90, "clockwise"),
    door(common, "chateau-balcony-west-door-lower", 248, 414, 48, -90, "counterclockwise"),
    door(common, "chateau-balcony-north-door", 760, 100, 48, 180, "clockwise"),
    door(common, "chateau-balcony-south-door", 760, 640, 48, 0, "counterclockwise"),
  ];
}

function area(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"] = "source-traced"): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, placementBehavior, measurementStatus, elevation: "floor", shape: { type: "rectangle", x, y, width, height } };
}

function areaWithNote(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"], physicalNote: string): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...area(common, id, role, areaLabel, x, y, width, height, placementBehavior, measurementStatus), physicalNote };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed Wall", placementBehavior: "blocked", points };
}

function path(common: Common, id: string, pathLabel: string, data: string, placementBehavior: Extract<FixedArchitectureElement, { kind: "path" }>["placementBehavior"], style: Pick<Extract<FixedArchitectureElement, { kind: "path" }>, "fill" | "stroke" | "strokeWidth" | "dash" | "opacity" | "elevation">, measurementStatus: Extract<FixedArchitectureElement, { kind: "path" }>["measurementStatus"] = "source-traced", physicalNote?: string): Extract<FixedArchitectureElement, { kind: "path" }> {
  return { ...common, id, kind: "path", label: pathLabel, data, placementBehavior, measurementStatus, physicalNote, ...style };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise"): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: "Door · source-traced", placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize = 10, rotation = 0): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize, rotation };
}

function floorRegion(id: string, labelText: string, kind: VenueFloorRegion["kind"], shape: VenueFloorRegion["shape"], measurementStatus: VenueFloorRegion["measurementStatus"] = "source-traced"): VenueFloorRegion {
  return { id, label: labelText, kind, shape, measurementStatus, placementBehavior: kind === "usable-floor" ? "allowed" : "blocked" };
}

function circlePolygon(cx: number, cy: number, radius: number, segments: number) {
  return Array.from({ length: segments }, (_, index) => {
    const point = polar(cx, cy, radius, (360 * index) / segments);
    return [point.x, point.y];
  }).flat();
}

function circlePath(cx: number, cy: number, radius: number) {
  return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy} Z`;
}

function ringSegmentPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polar(cx, cy, outerRadius, startAngle);
  const outerEnd = polar(cx, cy, outerRadius, endAngle);
  const innerEnd = polar(cx, cy, innerRadius, endAngle);
  const innerStart = polar(cx, cy, innerRadius, startAngle);
  return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y} Z`;
}

function ringSegmentPolygon(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, segments: number) {
  const outer = Array.from({ length: segments + 1 }, (_, index) =>
    polar(cx, cy, outerRadius, startAngle + ((endAngle - startAngle) * index) / segments),
  );
  const inner = Array.from({ length: segments + 1 }, (_, index) =>
    polar(cx, cy, innerRadius, endAngle - ((endAngle - startAngle) * index) / segments),
  );
  return [...outer, ...inner].flatMap((point) => [point.x, point.y]);
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
}
