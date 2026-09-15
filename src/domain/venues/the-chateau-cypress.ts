import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const HALL_X = 240;
const HALL_Y = 420;
const HALL_WIDTH = 828; // 69′
const HALL_HEIGHT = 660; // 55′
const HALL_CENTER_X = HALL_X + HALL_WIDTH / 2;

const STAGE_WIDTH = 288; // 24′
const STAGE_DEPTH = 174; // 14′6″
const STAGE_X = HALL_CENTER_X - STAGE_WIDTH / 2;
const STAGE_Y = HALL_Y + HALL_HEIGHT;

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Cypress · The Chateau, traced from the supplied downstairs, upstairs, and CAD plans.
 * Confirmed dimensions remain exact inch coordinates; unlabeled depths and curves remain
 * source-traced so the planner does not imply survey-grade precision.
 */
export function createTheChateauCypressConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...area(common, "chateau-main-floor", "main-floor", "Main Event Floor · 69′ × 55′", HALL_X, HALL_Y, HALL_WIDTH, HALL_HEIGHT, "allowed", "confirmed"),
      showOutline: false,
    },

    // Rooms and permanent service areas surrounding the planning floor.
    area(common, "chateau-west-restrooms", "closet", "Restrooms", 240, 72, 180, 138, "blocked"),
    area(common, "chateau-fireplace", "fireplace", "Fireplace", 240, 238, 96, 72, "blocked"),
    areaWithNote(common, "chateau-permanent-bar", "bar", "Permanent Bar", 240, 344, 220, 48, "blocked", "confirmed", "Confirmed 18′4″ bar length; counter depth is source-traced."),
    area(common, "chateau-east-meeting-office", "closet", "Meeting Room / Office", 1068, 70, 180, 205, "blocked"),
    areaWithNote(common, "chateau-buffet-room", "buffet", "Buffet Room", 1068, 330, 228, 288, "blocked", "confirmed", "Confirmed 19′ × 24′ room footprint."),
    area(common, "chateau-kitchen", "catering", "Kitchen", 1068, 690, 228, 185, "blocked"),
    area(common, "chateau-maintenance", "closet", "Maintenance", 1296, 420, 120, 165, "blocked"),
    area(common, "chateau-janitor", "closet", "Janitor Closet", 1296, 630, 120, 90, "blocked"),
    area(common, "chateau-vendor-drop", "catering", "Vendor Drop-Off", 1296, 765, 120, 150, "restricted"),
    area(common, "chateau-east-storage", "closet", "Storage", 1188, 930, 108, 150, "blocked"),

    // The permanent stage is fixed and raised but remains valid placement space.
    path(
      common,
      "chateau-stage",
      "Raised Stage · 24′ × 14′6″",
      `M ${STAGE_X} ${STAGE_Y} L ${STAGE_X + STAGE_WIDTH} ${STAGE_Y} C ${STAGE_X + STAGE_WIDTH} ${STAGE_Y + 96}, ${HALL_CENTER_X + 80} ${STAGE_Y + STAGE_DEPTH}, ${HALL_CENTER_X} ${STAGE_Y + STAGE_DEPTH} C ${HALL_CENTER_X - 80} ${STAGE_Y + STAGE_DEPTH}, ${STAGE_X} ${STAGE_Y + 96}, ${STAGE_X} ${STAGE_Y} Z`,
      "allowed",
      { fill: "#ddd4c4", stroke: "#8e7b61", strokeWidth: 3, elevation: "raised" },
      "confirmed",
      "Confirmed 24-foot width and 14.5-foot projection. The curved face is source-traced from the supplied plan.",
    ),
    label(common, "chateau-stage-label", "RAISED STAGE · 24′ × 14′6″", HALL_CENTER_X - 110, STAGE_Y + 82, 220, 10),

    // Circular center storage and the paired curved stair flights.
    path(common, "chateau-rotunda-storage", "Central Storage", circlePath(HALL_CENTER_X, 244, 104), "blocked", { fill: "#e7e5df", stroke: "#657169", strokeWidth: 3 }),
    label(common, "chateau-storage-label", "STORAGE", HALL_CENTER_X - 70, 238, 140, 10),
    ...createCurvedStaircase(common),
    path(common, "chateau-upper-balcony-curve", "Upper Rotunda Balcony", `M 468 112 C 520 46, 788 46, 840 112`, "restricted", { stroke: "#78827c", strokeWidth: 3 }),
    label(common, "chateau-rotunda-label", "CURVED ROTUNDA · TWIN STAIRS", HALL_CENTER_X - 150, 96, 300, 10),

    // Source-traced outline of the upstairs balcony over the downstairs hall.
    path(common, "chateau-balcony-overhead-west", "Upstairs Balcony Overhead", `M 438 ${HALL_Y} C 478 478, 414 528, 446 586 C 474 638, 416 692, 448 752 C 478 814, 420 876, 452 938 C 468 976, 442 1030, 438 ${HALL_Y + HALL_HEIGHT}`, "restricted", { stroke: "#87918b", strokeWidth: 2, dash: [10, 8], opacity: 0.8 }),
    path(common, "chateau-balcony-overhead-east", "Upstairs Balcony Overhead", `M 870 ${HALL_Y} C 830 478, 894 528, 862 586 C 834 638, 892 692, 860 752 C 830 814, 888 876, 856 938 C 840 976, 866 1030, 870 ${HALL_Y + HALL_HEIGHT}`, "restricted", { stroke: "#87918b", strokeWidth: 2, dash: [10, 8], opacity: 0.8 }),
    label(common, "chateau-balcony-label", "UPSTAIRS BALCONY OVERHEAD · 15′ SIDE DEPTH · 48′6″ RUN", 410, 950, 330, 8, -90),

    ...createPillars(common),
    ...createWalls(common),
    ...createDoors(common),
  ];

  return {
    physicalWidthInches: 1456,
    physicalHeightInches: 1294,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "The Chateau main hall is confirmed at 69′ × 55′ with a 24′ × 14.5′ raised stage. The permanent bar length, 19′ × 24′ buffet room, and upstairs 15′ by 48.5′ balcony anchors are confirmed. Curved balcony edges, rotunda, stairs, rooms without printed dimensions, doors, and pillar footprints are source-traced from the supplied diagrams and CAD views.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createCurvedStaircase(common: Common): FixedArchitectureElement[] {
  const centerY = 244;
  const innerRadius = 112;
  const outerRadius = 170;
  const elements: FixedArchitectureElement[] = [
    path(common, "chateau-west-curved-stairs", "West Curved Stairs", ringSegmentPath(HALL_CENTER_X, centerY, innerRadius, outerRadius, 130, 230), "blocked", { fill: "#e2e4df", stroke: "#657169", strokeWidth: 3 }),
    path(common, "chateau-east-curved-stairs", "East Curved Stairs", ringSegmentPath(HALL_CENTER_X, centerY, innerRadius, outerRadius, -50, 50), "blocked", { fill: "#e2e4df", stroke: "#657169", strokeWidth: 3 }),
  ];

  for (const [side, start, end] of [["west", 140, 220], ["east", -40, 40]] as const) {
    for (let angle = start; angle <= end; angle += 10) {
      const inner = polar(HALL_CENTER_X, centerY, innerRadius, angle);
      const outer = polar(HALL_CENTER_X, centerY, outerRadius, angle);
      elements.push(path(common, `chateau-${side}-stair-tread-${angle}`, "Stair Tread", `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`, "blocked", { stroke: "#7e8983", strokeWidth: 1.5 }));
    }
  }
  return elements;
}

function createPillars(common: Common): FixedArchitectureElement[] {
  const positions = [
    [240, 420], [390, 420], [540, 420], [828, 420], [1068, 420],
    [240, 540], [390, 540], [1068, 540],
    [240, 720], [390, 720], [1068, 720],
    [240, 900], [390, 900], [1068, 900],
    [240, 1080], [390, 1080], [540, 1080], [828, 1080], [1068, 1080],
  ];
  return positions.map(([x, y], index) => area(common, `chateau-pillar-${index + 1}`, "pillar", "Pillar", x - 9, y - 9, 18, 18, "blocked"));
}

function createWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "chateau-west-wall", [HALL_X, HALL_Y, HALL_X, HALL_Y + HALL_HEIGHT]),
    wall(common, "chateau-east-wall", [HALL_X + HALL_WIDTH, HALL_Y, HALL_X + HALL_WIDTH, HALL_Y + HALL_HEIGHT]),
    wall(common, "chateau-northwest-wall", [HALL_X, HALL_Y, 500, HALL_Y]),
    wall(common, "chateau-northeast-wall", [808, HALL_Y, HALL_X + HALL_WIDTH, HALL_Y]),
    wall(common, "chateau-southwest-wall", [HALL_X, HALL_Y + HALL_HEIGHT, STAGE_X - 30, HALL_Y + HALL_HEIGHT]),
    wall(common, "chateau-southeast-wall", [STAGE_X + STAGE_WIDTH + 30, HALL_Y + HALL_HEIGHT, HALL_X + HALL_WIDTH, HALL_Y + HALL_HEIGHT]),
  ];
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "chateau-west-hall-door", HALL_X, 500, 48, 90, "clockwise"),
    door(common, "chateau-garden-door-west", STAGE_X - 30, STAGE_Y, 48, 0, "clockwise"),
    door(common, "chateau-garden-door-east", STAGE_X + STAGE_WIDTH + 30, STAGE_Y, 48, 180, "counterclockwise"),
    door(common, "chateau-buffet-door", HALL_X + HALL_WIDTH, 610, 48, 90, "counterclockwise"),
    door(common, "chateau-kitchen-door", HALL_X + HALL_WIDTH, 875, 48, 90, "clockwise"),
    door(common, "chateau-main-entrance", HALL_CENTER_X - 24, 72, 48, 180, "clockwise"),
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

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed Wall", placementBehavior: "blocked", points };
}

function path(
  common: Common,
  id: string,
  pathLabel: string,
  data: string,
  placementBehavior: Extract<FixedArchitectureElement, { kind: "path" }>["placementBehavior"],
  style: Pick<Extract<FixedArchitectureElement, { kind: "path" }>, "fill" | "stroke" | "strokeWidth" | "dash" | "opacity" | "elevation">,
  measurementStatus: Extract<FixedArchitectureElement, { kind: "path" }>["measurementStatus"] = "source-traced",
  physicalNote?: string,
): Extract<FixedArchitectureElement, { kind: "path" }> {
  return { ...common, id, kind: "path", label: pathLabel, data, placementBehavior, measurementStatus, physicalNote, ...style };
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

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize = 10, rotation = 0): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize, rotation };
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

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
}
