import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const HALL_X = 500;
const HALL_Y = 300;
const HALL_WIDTH = 828; // 69′
const HALL_HEIGHT = 660; // 55′
const HALL_CENTER_Y = HALL_Y + HALL_HEIGHT / 2;
const ROTUNDA_X = 320;
const ROTUNDA_Y = 448;
const STAGE_WIDTH = 288; // 24′
const STAGE_DEPTH = 174; // 14′6″

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Cypress · The Chateau, traced in the same orientation as the supplied CAD plans.
 * Printed dimensions use exact inch coordinates. Unmeasured curves, walls, doors,
 * and pillar footprints remain source-traced rather than implying survey precision.
 */
export function createTheChateauCypressConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...area(common, "chateau-main-floor", "main-floor", "Main Event Floor · 69′ × 55′", HALL_X, HALL_Y, HALL_WIDTH, HALL_HEIGHT, "allowed", "confirmed"),
      showOutline: false,
    },
    path(common, "chateau-rotunda-floor", "Rotunda", rotundaFloorPath(), "allowed", {
      fill: "#f9f7f1",
      stroke: "#40544a",
      strokeWidth: 4,
    }),

    areaWithNote(common, "chateau-buffet-room", "buffet", "Buffet Room", 760, 72, 288, 228, "blocked", "confirmed", "Confirmed 24′ wide × 19′ deep room footprint."),
    area(common, "chateau-kitchen", "catering", "Kitchen", 1048, 72, 280, 228, "blocked"),
    areaWithNote(common, "chateau-permanent-bar", "bar", "Permanent Bar", 426, 740, 48, 220, "blocked", "confirmed", "Confirmed 18′4″ bar length; counter depth is source-traced."),
    path(common, "chateau-stage", "Raised Stage · 24′ × 14′6″", stagePath(), "allowed", {
      fill: "#ddd4c4",
      stroke: "#8e7b61",
      strokeWidth: 3,
      elevation: "raised",
    }, "confirmed", "Confirmed 24-foot width and 14.5-foot projection. The curved face is source-traced."),
    label(common, "chateau-stage-label", "RAISED STAGE · 24′ × 14′6″", 1360, HALL_CENTER_Y - 5, 230, 11, 90),

    ...createCurvedStaircase(common),
    path(common, "chateau-rotunda-balcony", "Curved Rotunda Balcony", "M 178 282 C 226 218 414 218 462 282", "restricted", {
      stroke: "#78827c",
      strokeWidth: 3,
    }),
    label(common, "chateau-rotunda-label", "CURVED ROTUNDA · TWIN STAIRS", 206, 248, 228, 10),

    path(common, "chateau-balcony-overhead-north", "Upstairs Balcony Overhead", "M 500 472 C 590 438 650 500 740 466 C 830 432 900 500 990 466 C 1080 432 1150 500 1240 466 C 1278 452 1304 456 1328 470", "restricted", {
      stroke: "#87918b",
      strokeWidth: 2,
      dash: [10, 8],
      opacity: 0.78,
    }),
    path(common, "chateau-balcony-overhead-south", "Upstairs Balcony Overhead", "M 500 652 C 590 686 650 624 740 658 C 830 692 900 624 990 658 C 1080 692 1150 624 1240 658 C 1278 672 1304 668 1328 654", "restricted", {
      stroke: "#87918b",
      strokeWidth: 2,
      dash: [10, 8],
      opacity: 0.78,
    }),
    label(common, "chateau-balcony-label", "UPSTAIRS BALCONY OVERHEAD · 15′ DEEP × 48′6″ RUN", 700, 548, 428, 9),

    ...createPillars(common),
    ...createWalls(common),
    ...createDoors(common),
    label(common, "chateau-courtyard-label", "COURTYARD", 1480, HALL_CENTER_Y - 6, 120, 13),
  ];

  return {
    physicalWidthInches: 1640,
    physicalHeightInches: 1040,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "The Chateau main hall is confirmed at 69′ × 55′ with a 24′ × 14.5′ raised stage. The permanent bar length, 19′ × 24′ buffet room, and upstairs 15′ by 48.5′ balcony anchors are confirmed. Unprinted curves, walls, doors, stairs, and pillar footprints are source-traced from the supplied clean CAD plans.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function rotundaFloorPath() {
  return "M 500 300 L 462 300 C 440 338 428 368 414 386 C 390 416 380 454 382 486 C 384 520 402 548 430 566 C 454 582 474 602 500 630 L 500 300 Z";
}

function stagePath() {
  const stageX = HALL_X + HALL_WIDTH;
  const top = HALL_CENTER_Y - STAGE_WIDTH / 2;
  const bottom = top + STAGE_WIDTH;
  const east = stageX + STAGE_DEPTH;
  return `M ${stageX} ${top} C ${stageX + 92} ${top}, ${east} ${HALL_CENTER_Y - 82}, ${east} ${HALL_CENTER_Y} C ${east} ${HALL_CENTER_Y + 82}, ${stageX + 92} ${bottom}, ${stageX} ${bottom} Z`;
}

function createCurvedStaircase(common: Common): FixedArchitectureElement[] {
  const innerRadius = 112;
  const outerRadius = 170;
  const elements: FixedArchitectureElement[] = [
    path(common, "chateau-upper-curved-stairs", "Upper Curved Stairs", ringSegmentPath(ROTUNDA_X, ROTUNDA_Y, innerRadius, outerRadius, 200, 320), "blocked", { fill: "#e2e4df", stroke: "#657169", strokeWidth: 3 }),
    path(common, "chateau-lower-curved-stairs", "Lower Curved Stairs", ringSegmentPath(ROTUNDA_X, ROTUNDA_Y, innerRadius, outerRadius, 40, 160), "blocked", { fill: "#e2e4df", stroke: "#657169", strokeWidth: 3 }),
  ];

  for (const [side, start, end] of [["upper", 210, 310], ["lower", 50, 150]] as const) {
    for (let angle = start; angle <= end; angle += 10) {
      const inner = polar(ROTUNDA_X, ROTUNDA_Y, innerRadius, angle);
      const outer = polar(ROTUNDA_X, ROTUNDA_Y, outerRadius, angle);
      elements.push(path(common, `chateau-${side}-stair-tread-${angle}`, "Stair Tread", `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`, "blocked", { stroke: "#7e8983", strokeWidth: 1.5 }));
    }
  }
  return elements;
}

function createPillars(common: Common): FixedArchitectureElement[] {
  const positions = [
    [500, 300], [620, 300], [850, 300], [1080, 300], [1328, 300],
    [500, 472], [690, 472], [930, 472], [1160, 472], [1328, 472],
    [500, 652], [690, 652], [930, 652], [1160, 652], [1328, 652],
    [500, 960], [760, 960], [1040, 960], [1328, 960],
  ];
  return positions.map(([x, y], index) => area(common, `chateau-pillar-${index + 1}`, "pillar", "Pillar", x - 9, y - 9, 18, 18, "blocked"));
}

function createWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "chateau-hall-north-wall", [500, 300, 760, 300, 760, 72, 1328, 72, 1328, 300]),
    wall(common, "chateau-hall-south-wall", [500, 960, 1328, 960]),
    wall(common, "chateau-hall-west-upper-wall", [500, 300, 462, 300]),
    wall(common, "chateau-hall-west-lower-wall", [500, 630, 500, 960]),
    wall(common, "chateau-hall-east-upper-wall", [1328, 300, 1328, HALL_CENTER_Y - STAGE_WIDTH / 2]),
    wall(common, "chateau-hall-east-lower-wall", [1328, HALL_CENTER_Y + STAGE_WIDTH / 2, 1328, 960]),
    wall(common, "chateau-bar-west-wall", [390, 710, 390, 960]),
    wall(common, "chateau-bar-north-wall", [390, 710, 500, 710]),
  ];
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "chateau-west-entrance-a", 178, 420, 48, 90, "clockwise"),
    door(common, "chateau-west-entrance-b", 178, 516, 48, -90, "counterclockwise"),
    door(common, "chateau-courtyard-upper", 1328, 326, 48, 90, "clockwise"),
    door(common, "chateau-courtyard-lower", 1328, 886, 48, 90, "counterclockwise"),
    door(common, "chateau-buffet-door", 820, 300, 48, 0, "clockwise"),
    door(common, "chateau-kitchen-door", 1128, 300, 48, 0, "counterclockwise"),
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

function ringSegmentPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polar(cx, cy, outerRadius, startAngle);
  const outerEnd = polar(cx, cy, outerRadius, endAngle);
  const innerEnd = polar(cx, cy, innerRadius, endAngle);
  const innerStart = polar(cx, cy, innerRadius, startAngle);
  return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y} Z`;
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
}
