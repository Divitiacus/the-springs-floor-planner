import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const CANVAS_MARGIN = 55;
const SOURCE_LEFT = 73;
const SOURCE_TOP = 24;
const SOURCE_RIGHT = 450;
const SOURCE_BOTTOM = 588;
const SOURCE_MAIN_LEFT = 184;
const SOURCE_MAIN_RIGHT = 377;
const CONFIRMED_MAIN_WIDTH = 480; // 40′
const SOURCE_SCALE = CONFIRMED_MAIN_WIDTH / (SOURCE_MAIN_RIGHT - SOURCE_MAIN_LEFT);

const tx = (sourceX: number) => Math.round(CANVAS_MARGIN + (sourceX - SOURCE_LEFT) * SOURCE_SCALE);
const ty = (sourceY: number) => Math.round(CANVAS_MARGIN + (sourceY - SOURCE_TOP) * SOURCE_SCALE);
const tw = (sourceLength: number) => Math.round(sourceLength * SOURCE_SCALE);

const PLAN_LEFT = tx(SOURCE_LEFT);
const PLAN_TOP = ty(SOURCE_TOP);
const PLAN_RIGHT = tx(SOURCE_RIGHT);
const PLAN_BOTTOM = ty(SOURCE_BOTTOM);
const PLAN_WIDTH = PLAN_RIGHT - PLAN_LEFT;
const PLAN_HEIGHT = PLAN_BOTTOM - PLAN_TOP;

const LOUNGE_LEFT = tx(184);
const LOUNGE_TOP = ty(24);
const LOUNGE_RIGHT = tx(377);
const LOUNGE_BOTTOM = ty(193);
const MAIN_LEFT = tx(137);
const MAIN_TOP = ty(179);
const MAIN_RIGHT = tx(351);
const MAIN_BOTTOM = ty(409);
const HEARTH_LEFT = tx(184);
const HEARTH_TOP = MAIN_BOTTOM;
const HEARTH_RIGHT = tx(377);
const HEARTH_BOTTOM = ty(563);

type Common = { fixed: true; measurementStatus: "source-traced" };

/** Alvarado's Timberview Lodge reception floor, traced independently from the supplied venue plan. */
export function createTimberviewLodgeConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const defaultObjectPosition = rotatePoint(tx(265), ty(315));
  const fixedArchitecturalElements = [
    ...createFloorAreas(common),
    bar(common),
    staircase(common),
    buffet(common),
    chairTableCloset(common),
    fireplace(common),
    ...createPillars(common),
    perimeterWall(common),
    ...createInteriorWalls(common),
    ...createDoors(common),
    ...createLabels(common),
  ].map(rotateArchitectureElement);
  fixedArchitecturalElements.push(
    label(
      common,
      "timberview-lodge-fireplace-label",
      "DOUBLE-SIDED FIREPLACE",
      PLAN_LEFT + PLAN_HEIGHT - 290,
      PLAN_TOP + PLAN_WIDTH / 2 - 15,
      240,
      9,
    ),
  );

  return {
    physicalWidthInches: PLAN_HEIGHT + CANVAS_MARGIN * 2,
    physicalHeightInches: PLAN_WIDTH + CANVAS_MARGIN * 2,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Timberview Lodge is calibrated from the supplied Alvarado plan's confirmed 40-foot reception-room width and 80-foot length, then displayed in landscape orientation with the entrance at left. The lounge, west-side bar, staircase, buffet, chair/table closet, pillars, window walls, and double-sided fireplace are independently traced from the Alvarado sources; no Denton architecture is shared.",
    planningBounds: { x: PLAN_LEFT, y: PLAN_TOP, width: PLAN_HEIGHT, height: PLAN_WIDTH },
    defaultObjectPosition,
    usableAreas: createUsableAreas().map(rotateFloorRegion),
    voidAreas: [],
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function rotatePoint(x: number, y: number) {
  return {
    x: PLAN_LEFT + y - PLAN_TOP,
    y: PLAN_TOP + PLAN_WIDTH - (x - PLAN_LEFT),
  };
}

function rotateRectangle(x: number, y: number, width: number, height: number) {
  return {
    x: PLAN_LEFT + y - PLAN_TOP,
    y: PLAN_TOP + PLAN_WIDTH - (x - PLAN_LEFT) - width,
    width: height,
    height: width,
  };
}

function rotatePoints(points: number[]) {
  const rotated: number[] = [];
  for (let index = 0; index < points.length; index += 2) {
    const point = rotatePoint(points[index], points[index + 1]);
    rotated.push(point.x, point.y);
  }
  return rotated;
}

function rotateArchitectureElement(element: FixedArchitectureElement): FixedArchitectureElement {
  if (element.kind === "area") {
    const shape = element.shape.type === "rectangle"
      ? { type: "rectangle" as const, ...rotateRectangle(element.shape.x, element.shape.y, element.shape.width, element.shape.height) }
      : { type: "polygon" as const, points: rotatePoints(element.shape.points) };
    return { ...element, shape };
  }
  if (element.kind === "wall" || element.kind === "railing") {
    return { ...element, points: rotatePoints(element.points) };
  }
  if (element.kind === "door") {
    const point = rotatePoint(element.x, element.y);
    return { ...element, ...point, rotation: (element.rotation + 270) % 360 };
  }
  if (element.kind === "stairs") {
    const rectangle = rotateRectangle(element.x, element.y, element.width, element.height);
    return {
      ...element,
      ...rectangle,
      orientation: element.orientation === "horizontal" ? "vertical" : "horizontal",
      treadAxis: element.treadAxis === "x" ? "y" : "x",
    };
  }
  if (element.kind === "label" || element.kind === "direction-label") {
    const center = rotatePoint(element.x + element.width / 2, element.y);
    return { ...element, x: center.x - element.width / 2, y: center.y, rotation: 0 };
  }
  return element;
}

function rotateFloorRegion(region: VenueFloorRegion): VenueFloorRegion {
  const shape = region.shape.type === "rectangle"
    ? { type: "rectangle" as const, ...rotateRectangle(region.shape.x, region.shape.y, region.shape.width, region.shape.height) }
    : { type: "polygon" as const, points: rotatePoints(region.shape.points) };
  return { ...region, shape };
}

function createFloorAreas(common: Common): FixedArchitectureElement[] {
  const note = "Usable reception floor source-traced from the supplied Alvarado Timberview Lodge plan.";
  return [
    floorAreaPolygon(common, "timberview-lodge-main-floor", "main-floor", coreFloorPoints(), note),
    floorArea(common, "timberview-lodge-buffet-wing-floor", "event-floor-extension", tx(351), ty(69), tx(450) - tx(351), ty(179) - ty(69), "The tiled buffet wing is source-traced from the supplied plan."),
    floorArea(common, "timberview-lodge-seating-alcove-floor", "event-floor-extension", tx(351), ty(179), tx(424) - tx(351), ty(409) - ty(179), "The former side-deck section is open to the reception room as a seating alcove, following the user's annotated correction."),
  ];
}

function createUsableAreas(): VenueFloorRegion[] {
  const common = {
    kind: "usable-floor" as const,
    placementBehavior: "allowed" as const,
    measurementStatus: "source-traced" as const,
  };
  return [
    floorRegionPolygon(common, "timberview-lodge-main-usable-floor", "Main reception floor", coreFloorPoints()),
    floorRegion(common, "timberview-lodge-buffet-wing-usable-floor", "Tiled buffet wing", tx(351), ty(69), tx(450) - tx(351), ty(179) - ty(69)),
    floorRegion(common, "timberview-lodge-seating-alcove-usable-floor", "Open seating alcove", tx(351), ty(179), tx(424) - tx(351), ty(409) - ty(179)),
  ];
}

function coreFloorPoints() {
  return [
    LOUNGE_LEFT, LOUNGE_TOP,
    LOUNGE_RIGHT, LOUNGE_TOP,
    LOUNGE_RIGHT, LOUNGE_BOTTOM,
    MAIN_RIGHT, LOUNGE_BOTTOM,
    MAIN_RIGHT, MAIN_BOTTOM,
    HEARTH_RIGHT, HEARTH_TOP,
    HEARTH_RIGHT, HEARTH_BOTTOM,
    HEARTH_LEFT, HEARTH_BOTTOM,
    HEARTH_LEFT, HEARTH_TOP,
    MAIN_LEFT, MAIN_BOTTOM,
    MAIN_LEFT, MAIN_TOP,
    LOUNGE_LEFT, MAIN_TOP,
  ];
}

function bar(common: Common): FixedArchitectureElement {
  return areaWithNote(common, "timberview-lodge-bar", "bar", "BAR", tx(73), ty(179), tx(137) - tx(73), ty(284) - ty(179), "blocked", "source-traced", "The fixed bar fills the complete west-side architectural bay and aligns with the adjacent reception wall, following the user's annotated correction; the supplied plan labels the bar at 6 feet by 15 feet.");
}

function staircase(common: Common): FixedArchitectureElement {
  return {
    ...common,
    id: "timberview-lodge-staircase",
    kind: "stairs",
    label: "Grand Staircase",
    physicalNote: "The central lounge staircase is source-traced from the supplied plan; its labeled run is 15 feet 10.5 inches.",
    placementBehavior: "blocked",
    x: tx(263),
    y: ty(99),
    width: tw(34),
    height: 190.5,
    orientation: "vertical",
    treadCount: 13,
    treadAxis: "y",
    showLabel: false,
  };
}

function buffet(common: Common): FixedArchitectureElement {
  return areaWithNote(common, "timberview-lodge-buffet", "buffet", "BUFFET\n4′2″ × 14′", tx(394), ty(91), 50, 168, "blocked", "confirmed", "The supplied plan confirms the fixed buffet at 4 feet 2 inches by 14 feet.");
}

function chairTableCloset(common: Common): FixedArchitectureElement {
  return areaWithNote(common, "timberview-lodge-chair-table-closet", "closet", "CHAIR / TABLE\nCLOSET", tx(376), ty(179), tx(424) - tx(376), ty(258) - ty(179), "blocked", "source-traced", "The chair and table closet is source-traced from the supplied plan.");
}

function fireplace(common: Common): FixedArchitectureElement {
  return areaWithNote(common, "timberview-lodge-double-sided-fireplace", "fireplace", "Double-sided fireplace", tx(251), ty(563), tx(307) - tx(251), ty(588) - ty(563), "blocked", "source-traced", "The fireplace fills the complete projecting bay, following the user's annotated correction; the supplied plan labels the inner fireplace at 10 feet 4.5 inches by 2 feet 4 inches.", false);
}

function createPillars(common: Common): FixedArchitectureElement[] {
  return [
    pillar(common, "timberview-lodge-lounge-west-pillar", tx(250), ty(67)),
    pillar(common, "timberview-lodge-lounge-east-pillar", tx(309), ty(67)),
    pillar(common, "timberview-lodge-main-west-upper-pillar", tx(183), ty(265)),
    pillar(common, "timberview-lodge-main-west-lower-pillar", tx(183), ty(333)),
    pillar(common, "timberview-lodge-main-east-pillar", tx(376), ty(332)),
  ];
}

function perimeterWall(common: Common): FixedArchitectureElement {
  return wall(common, "timberview-lodge-perimeter-wall", [
    tx(184), ty(24), tx(377), ty(24), tx(377), ty(69), tx(450), ty(69),
    tx(450), ty(179), tx(424), ty(179), tx(424), ty(409), tx(377), ty(409),
    tx(377), ty(563), tx(307), ty(563), tx(307), ty(588), tx(251), ty(588),
    tx(251), ty(563), tx(184), ty(563), tx(184), ty(409), tx(137), ty(409),
    tx(137), ty(284), tx(73), ty(284), tx(73), ty(179),
    tx(184), ty(179), tx(184), ty(24),
  ]);
}

function createInteriorWalls(common: Common): FixedArchitectureElement[] {
  return [
    railing(common, "timberview-lodge-stair-west-rail", [tx(263), ty(99), tx(263), ty(169)]),
    railing(common, "timberview-lodge-stair-east-rail", [tx(297), ty(99), tx(297), ty(169)]),
  ];
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "timberview-lodge-entrance-west-door", tx(265), ty(24), 42, 0, "clockwise", "Main entrance"),
    door(common, "timberview-lodge-entrance-east-door", tx(299), ty(24), 42, 180, "counterclockwise", "Main entrance"),
    door(common, "timberview-lodge-west-hearth-door", tx(184), ty(520), 42, 90, "counterclockwise", "Exterior door"),
    door(common, "timberview-lodge-east-hearth-door", tx(377), ty(520), 42, 90, "clockwise", "Exterior door"),
    door(common, "timberview-lodge-buffet-wing-door", tx(450), ty(76), 42, 90, "clockwise", "Service door"),
  ];
}

function createLabels(common: Common): FixedArchitectureElement[] {
  return [
    label(common, "timberview-lodge-entrance-label", "ENTRANCE", tx(243), ty(34), tw(80), 10),
    label(common, "timberview-lodge-lounge-label", "LOUNGE", tx(236), ty(77), tw(95), 12),
    label(common, "timberview-lodge-upstairs-label", "UPSTAIRS · 15′10½″", tx(250), ty(174), tw(105), 8),
    label(common, "timberview-lodge-tile-floor-label", "TILE FLOOR", tx(314), ty(117), tw(70), 9),
    label(common, "timberview-lodge-hardwood-floor-label", "HARDWOOD FLOOR", tx(225), ty(278), tw(120), 12),
    label(common, "timberview-lodge-seating-alcove-label", "SEATING ALCOVE", tx(366), ty(330), tw(82), 9),
    label(common, "timberview-lodge-west-windows-label", "WINDOWS", tx(139), ty(386), tw(70), 9),
    label(common, "timberview-lodge-main-width-label", "40′", tx(257), ty(450), tw(50), 10),
    label(common, "timberview-lodge-main-length-label", "80′", tx(337), ty(286), tw(50), 10, 90),
  ];
}

function floorRegionPolygon(common: Pick<VenueFloorRegion, "kind" | "placementBehavior" | "measurementStatus">, id: string, regionLabel: string, points: number[]): VenueFloorRegion {
  return { ...common, id, label: regionLabel, shape: { type: "polygon", points } };
}

function floorRegion(common: Pick<VenueFloorRegion, "kind" | "placementBehavior" | "measurementStatus">, id: string, regionLabel: string, x: number, y: number, width: number, height: number): VenueFloorRegion {
  return { ...common, id, label: regionLabel, shape: { type: "rectangle", x, y, width, height } };
}

function floorArea(common: Common, id: string, role: "main-floor" | "event-floor-extension", x: number, y: number, width: number, height: number, physicalNote: string): FixedArchitectureElement {
  return { ...areaWithNote(common, id, role, "Reception floor", x, y, width, height, "allowed", "source-traced", physicalNote, false), showOutline: false };
}

function floorAreaPolygon(common: Common, id: string, role: "main-floor" | "event-floor-extension", points: number[], physicalNote: string): FixedArchitectureElement {
  return { ...common, id, kind: "area", role, label: "Reception floor", physicalNote, placementBehavior: "allowed", measurementStatus: "source-traced", elevation: "floor", showLabel: false, showOutline: false, shape: { type: "polygon", points } };
}

function areaWithNote(common: Common, id: string, role: Extract<FixedArchitectureElement, { kind: "area" }>["role"], areaLabel: string, x: number, y: number, width: number, height: number, placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"], measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"], physicalNote: string, showLabel = true): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label: areaLabel, physicalNote, placementBehavior, measurementStatus, elevation: "floor", showLabel, shape: { type: "rectangle", x, y, width, height } };
}

function pillar(common: Common, id: string, x: number, y: number): FixedArchitectureElement {
  return areaWithNote(common, id, "pillar", "Pillar", x - 6, y - 6, 12, 12, "blocked", "source-traced", "Pillar position is source-traced from the supplied plan.", false);
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
}

function railing(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "railing", label: "Fixed stair railing", placementBehavior: "blocked", points };
}

function door(common: Common, id: string, x: number, y: number, width: number, rotation: number, swingDirection: "clockwise" | "counterclockwise", doorLabel: string): FixedArchitectureElement {
  return { ...common, id, kind: "door", label: doorLabel, placementBehavior: "restricted", x, y, width, rotation, swingDirection, swingAngle: 42 };
}

function label(common: Common, id: string, text: string, x: number, y: number, width: number, fontSize: number, rotation = 0): FixedArchitectureElement {
  return { ...common, id, kind: "label", label: text, placementBehavior: "restricted", x, y, width, fontSize, rotation };
}
