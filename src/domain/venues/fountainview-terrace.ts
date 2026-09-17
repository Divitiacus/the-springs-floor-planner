import type {
  ArchitectureMeasurementStatus,
  FixedArchitectureElement,
  VenueFloorRegion,
} from "@/domain/floorplan";
import type { HallConfiguration, HallLevelConfiguration } from "@/domain/location-catalog";

const MARGIN = 60;
const FOOT = 12;

type Common = { fixed: true; measurementStatus: ArchitectureMeasurementStatus };

/** Arlington's Fountainview Terrace reception, chapel, and garden planning spaces. */
export function createFountainviewTerraceConfiguration(): HallConfiguration {
  const levels: HallLevelConfiguration[] = [
    createBallroomLevel(),
    createChapelLevel(),
    createGardenLevel(),
  ];

  return {
    levels,
    defaultLevelId: "grand-ballroom",
  };
}

function createBallroomLevel(): HallLevelConfiguration {
  const width = 86 * FOOT;
  const height = 47 * FOOT;
  const x = MARGIN;
  const y = MARGIN;
  const right = x + width;
  const bottom = y + height;
  const upperSouthWall = bottom - 36;
  const southJogX = x + 604;
  const ballroomFloorPoints = [x, y, right, y, right, bottom, southJogX, bottom, southJogX, upperSouthWall, x, upperSouthWall];
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  const elements: FixedArchitectureElement[] = [
    polygonArea(common, "fountainview-terrace-ballroom-floor", "main-floor", "GRAND BALLROOM · CAPACITY 300", ballroomFloorPoints, "allowed", "floor", false, "confirmed"),
    area(common, "fountainview-terrace-ballroom-long-bar", "bar", "BUILT-IN BAR · 11.8′ × 3′", x + 352, upperSouthWall - 36, 11.8 * FOOT, 3 * FOOT, "blocked", "floor", true, "confirmed"),
    area(common, "fountainview-terrace-ballroom-short-bar", "bar", "BUILT-IN BAR · 6.5′ × 3′", x + 508, upperSouthWall - 36, 6.5 * FOOT, 3 * FOOT, "blocked", "floor", true, "confirmed"),
    area(common, "fountainview-terrace-ballroom-buffet", "buffet", "BUILT-IN BUFFET · 14.5′ × 3.5′", right - 14.5 * FOOT - 30, bottom - 72, 14.5 * FOOT, 3.5 * FOOT, "blocked", "floor", true, "confirmed"),
    ...ballroomWalls(common, x, y, width, height),
    ...doubleDoor(common, "fountainview-terrace-ballroom-northwest-doors", x + 132, y, 72, 0, "North double doors"),
    ...doubleDoor(common, "fountainview-terrace-ballroom-northeast-doors", x + 786, y, 72, 0, "North double doors"),
    ...doubleDoor(common, "fountainview-terrace-ballroom-south-west-doors", x + 228, upperSouthWall, 72, 180, "Ballroom entrance"),
    ...doubleDoor(common, "fountainview-terrace-ballroom-south-east-doors", x + 680, bottom, 72, 180, "Ballroom entrance"),
    label(common, "fountainview-terrace-ballroom-capacity", "GRAND BALLROOM · 300 MAX", x + 366, y + 72, 300, 0, 12),
    label(common, "fountainview-terrace-ballroom-width", "86′", x + width / 2 - 40, y - 32, 80, 0, 10),
    label(common, "fountainview-terrace-ballroom-height", "47′", right + 32, y + height / 2 - 40, 80, 90, 10),
    label(common, "fountainview-terrace-ballroom-prep-kitchen-note", "PREP KITCHEN · 28′ × 17′ (ADJACENT)", x + 20, bottom + 28, 260, 0, 8),
  ];

  return {
    id: "grand-ballroom",
    slug: "grand-ballroom",
    name: "Grand Ballroom",
    inventoryGroupId: "indoor",
    physicalWidthInches: width + MARGIN * 2,
    physicalHeightInches: height + MARGIN * 2,
    physicalDimensionStatus: "confirmed",
    physicalDimensionNote:
      "The Grand Ballroom is confirmed at 86 feet by 47 feet with a 300-person maximum. The supplied split-room references are 46 by 53 feet on the buffet side (160 guests) and 40 by 47 feet on the no-buffet side (140 guests), with 16-foot and 13-foot wall openings separated by a 7-foot insert. The built-in buffet and both built-in bars use the supplied measurements. Doors, windows, perimeter offsets, and their spacing are proportionally traced from the supplied ballroom plan. The 28-by-17-foot prep kitchen is adjacent and is noted outside the usable ballroom rather than counted as event floor.",
    planningBounds: { x, y, width, height },
    defaultObjectPosition: { x: x + width / 2, y: y + height / 2 },
    usableAreas: [polygonRegion("fountainview-terrace-ballroom-usable-floor", "Grand Ballroom", ballroomFloorPoints, "confirmed")],
    voidAreas: [],
    fixedArchitecturalElements: elements,
    floorplanAsset: null,
  };
}

function ballroomWalls(common: Common, x: number, y: number, width: number, height: number) {
  const right = x + width;
  const bottom = y + height;
  const upperSouthWall = bottom - 36;
  const southJogX = x + 604;
  const result: FixedArchitectureElement[] = [];
  const northDoors = [[x + 132, x + 204], [x + 786, x + 858]] as const;
  const southWestDoor = [x + 228, x + 300] as const;
  const southDoor = [x + 680, x + 752] as const;

  const bayTop = y - 24;
  const firstBay = [x + 360, x + 510] as const;
  const secondBay = [x + 624, x + 774] as const;
  result.push(
    wall(common, "fountainview-terrace-ballroom-north-wall-1", [x, y, northDoors[0][0], y]),
    wall(common, "fountainview-terrace-ballroom-north-wall-2", [northDoors[0][1], y, firstBay[0], y]),
    wall(common, "fountainview-terrace-ballroom-north-bay-1", [firstBay[0], y, firstBay[0], bayTop, firstBay[1], bayTop, firstBay[1], y]),
    wall(common, "fountainview-terrace-ballroom-north-wall-3", [firstBay[1], y, secondBay[0], y]),
    wall(common, "fountainview-terrace-ballroom-north-bay-2", [secondBay[0], y, secondBay[0], bayTop, secondBay[1], bayTop, secondBay[1], y]),
    wall(common, "fountainview-terrace-ballroom-north-wall-4", [secondBay[1], y, northDoors[1][0], y]),
    wall(common, "fountainview-terrace-ballroom-north-wall-5", [northDoors[1][1], y, right, y]),
  );
  result.push(
    wall(common, "fountainview-terrace-ballroom-south-wall-west-1", [x, upperSouthWall, southWestDoor[0], upperSouthWall]),
    wall(common, "fountainview-terrace-ballroom-south-wall-west-2", [southWestDoor[1], upperSouthWall, southJogX, upperSouthWall, southJogX, bottom, southDoor[0], bottom]),
    wall(common, "fountainview-terrace-ballroom-south-wall-east", [southDoor[1], bottom, right, bottom]),
  );

  const windowHeight = 54;
  const windowStarts = [y + 66, y + 174, y + 282, y + 390];
  let leftCursor = y;
  windowStarts.forEach((start, index) => {
    result.push(wall(common, `fountainview-terrace-ballroom-west-wall-${index + 1}`, [x, leftCursor, x, start]));
    result.push(path(common, `fountainview-terrace-ballroom-west-window-${index + 1}`, `M ${x} ${start} V ${start + windowHeight}`, "WINDOW", "restricted", "#9da7a0", 3));
    leftCursor = start + windowHeight;
  });
  result.push(wall(common, "fountainview-terrace-ballroom-west-wall-5", [x, leftCursor, x, upperSouthWall]));

  let rightCursor = y;
  windowStarts.forEach((start, index) => {
    result.push(wall(common, `fountainview-terrace-ballroom-east-wall-${index + 1}`, [right, rightCursor, right, start]));
    result.push(path(common, `fountainview-terrace-ballroom-east-window-${index + 1}`, `M ${right} ${start} V ${start + windowHeight}`, "WINDOW", "restricted", "#9da7a0", 3));
    rightCursor = start + windowHeight;
  });
  result.push(wall(common, "fountainview-terrace-ballroom-east-wall-5", [right, rightCursor, right, bottom]));

  return result;
}

function createChapelLevel(): HallLevelConfiguration {
  const loungeWidth = 40 * FOOT;
  const chapelWidth = 55 * FOOT;
  const height = 60 * FOOT;
  const width = loungeWidth + chapelWidth;
  const x = MARGIN;
  const y = MARGIN;
  const right = x + width;
  const bottom = y + height;
  const chapelLeft = x + loungeWidth;
  const common: Common = { fixed: true, measurementStatus: "source-traced" };
  const restroomPoints = [x + 96, y + 228, x + 348, y + 228, x + 348, y + 456, x + 264, y + 456, x + 264, y + 390, x + 180, y + 390, x + 180, y + 456, x + 96, y + 456];
  const stageX = chapelLeft + 198;
  const stageWidth = 22 * FOOT;
  const stageHeight = 12 * FOOT;
  const stagePoints = [stageX, y, stageX + stageWidth, y, stageX + stageWidth, y + 108, stageX + 198, y + 122, stageX + 132, y + 126, stageX + 66, y + 122, stageX, y + 108];
  const stairLeftX = chapelLeft + 84;
  const stairTopX = chapelLeft + 126;
  const stairRightX = chapelLeft + 174;
  const stairMiddleY = bottom - 192;
  const stairTopY = bottom - 240;
  const stairBottomY = bottom - 144;
  const stairPoints = [stairLeftX, stairMiddleY, stairTopX, stairTopY, stairRightX, stairMiddleY, stairTopX, stairBottomY];
  const buildingPoints = [x, y, x + 168, y, x + 168, y + 66, x + 420, y + 66, x + 420, y, right, y, right, bottom, x, bottom];
  const loungeFloorPoints = [x, y, x + 168, y, x + 168, y + 66, x + 420, y + 66, x + 420, y, chapelLeft, y, chapelLeft, bottom, x, bottom];

  const elements: FixedArchitectureElement[] = [
    polygonArea(common, "fountainview-terrace-chapel-building-floor", "main-floor", "CHAPEL BUILDING", buildingPoints, "allowed", "floor", false),
    polygonArea(common, "fountainview-terrace-chapel-restrooms", "closet", "RESTROOMS", restroomPoints, "blocked", "floor", true),
    polygonArea(common, "fountainview-terrace-chapel-stage", "stage", "CHAPEL STAGE", stagePoints, "blocked", "raised", false, "confirmed", false),
    path(common, "fountainview-terrace-chapel-stage-face", `M ${stageX} ${y} H ${stageX + stageWidth} V ${y + 108} Q ${stageX + stageWidth / 2} ${y + stageHeight} ${stageX} ${y + 108} Z`, "Chapel Stage", "blocked", "#a7aaa8", 2, undefined, 1, "#d2d3d2"),
    area(common, "fountainview-terrace-chapel-east-service-room", "closet", "", right - 72, y, 72, 204, "blocked", "floor", false),
    area(common, "fountainview-terrace-chapel-southwest-closet", "closet", "", x, bottom - 132, 160, 132, "blocked", "floor", false),
    area(common, "fountainview-terrace-chapel-bar", "bar", "BAR", chapelLeft - 74, y + 112, 24, 66, "blocked", "floor"),
    polygonArea(common, "fountainview-terrace-chapel-lounge-triangle-fill", "closet", "", [chapelLeft, y + 222, chapelLeft - 48, y + 222, chapelLeft, y + 330], "blocked", "floor", false, "source-traced", false),
    polygonArea(common, "fountainview-terrace-chapel-stair-block", "landing", "STAIRS", stairPoints, "blocked", "floor", false),
    path(common, "fountainview-terrace-chapel-stair-treads", `M ${stairLeftX + 34} ${stairTopY + 14} L ${stairTopX + 34} ${stairMiddleY + 8} M ${stairLeftX + 26} ${stairTopY + 24} L ${stairTopX + 28} ${stairMiddleY + 20} M ${stairLeftX + 18} ${stairTopY + 34} L ${stairTopX + 20} ${stairMiddleY + 30} M ${stairLeftX + 12} ${stairTopY + 44} L ${stairTopX + 10} ${stairMiddleY + 36}`, "Angled chapel stairs", "blocked", "#7e8882", 2),
    ...chapelWallsAndRails(common, x, y, right, bottom, chapelLeft),
    ...doubleDoor(common, "fountainview-terrace-chapel-north-lounge-doors", x + 36, y, 72, 0, "North lounge doors"),
    ...doubleDoor(common, "fountainview-terrace-chapel-main-entrance", x + 228, bottom, 84, 180, "Main entrance"),
    door(common, "fountainview-terrace-chapel-restroom-door-left", x + 180, y + 390, 42, 90, "clockwise", "Restroom entrance"),
    door(common, "fountainview-terrace-chapel-restroom-door-right", x + 264, y + 390, 42, 90, "counterclockwise", "Restroom entrance"),
    door(common, "fountainview-terrace-chapel-bottom-room-door", x + 160, bottom - 132, 42, 90, "clockwise", "Lounge room door"),
    door(common, "fountainview-terrace-chapel-west-entry-upper", chapelLeft, bottom - 192, 42, 90, "clockwise", "Chapel entrance"),
    door(common, "fountainview-terrace-chapel-west-entry-lower", chapelLeft, bottom - 108, 42, 270, "counterclockwise", "Chapel entrance"),
    door(common, "fountainview-terrace-chapel-east-door", right - 96, y, 42, 0, "counterclockwise", "Chapel side door"),
    label(common, "fountainview-terrace-chapel-stage-label", "CHAPEL STAGE", stageX + 62, y + 52, 140, 0, 9),
    label(common, "fountainview-terrace-chapel-lounge-label", "LOUNGE", x + 172, y + 102, 140, 0, 10),
    label(common, "fountainview-terrace-chapel-cocktail-note", "14 COCKTAIL TABLES MAY BE PLACED IN THE LOUNGE", x + 112, y + 164, 300, 0, 8),
  ];

  return {
    id: "indoor-chapel",
    slug: "indoor-chapel",
    name: "Indoor Chapel",
    inventoryGroupId: "indoor",
    physicalWidthInches: width + MARGIN * 2,
    physicalHeightInches: height + MARGIN * 2,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "The chapel room on the right is confirmed at 55 feet by 60 feet with a 250-person ceremony maximum. The adjoining lounge wing is proportionally source-traced because its overall dimensions were not supplied. The 22-by-12-foot stage is 6 inches high. Lounge restrooms, angled staircase, bar, service room, doors, and rail alignments are traced from the supplied chapel plan. The optional curved and L-shaped ceremony aisles are not drawn as permanent architecture.",
    planningBounds: { x, y, width, height },
    defaultObjectPosition: { x: chapelLeft + 330, y: y + 390 },
    usableAreas: [
      floorRegion("fountainview-terrace-chapel-seating-floor", "Indoor Chapel Seating", chapelLeft, y, chapelWidth, height, "confirmed"),
      polygonRegion("fountainview-terrace-chapel-lounge-floor", "Chapel Lounge", loungeFloorPoints, "source-traced"),
    ],
    voidAreas: [],
    fixedArchitecturalElements: elements,
    floorplanAsset: null,
  };
}

function chapelWallsAndRails(common: Common, x: number, y: number, right: number, bottom: number, chapelLeft: number) {
  return [
    wall(common, "fountainview-terrace-chapel-north-wall-west", [x, y, x + 36, y]),
    wall(common, "fountainview-terrace-chapel-north-wall-jog", [x + 108, y, x + 168, y, x + 168, y + 66, x + 420, y + 66, x + 420, y, right - 96, y]),
    wall(common, "fountainview-terrace-chapel-north-wall-east", [right - 54, y, right, y]),
    wall(common, "fountainview-terrace-chapel-east-wall", [right, y, right, bottom]),
    wall(common, "fountainview-terrace-chapel-south-wall-east", [right, bottom, x + 312, bottom]),
    wall(common, "fountainview-terrace-chapel-south-wall-west", [x + 228, bottom, x + 160, bottom, x + 160, bottom - 132]),
    wall(common, "fountainview-terrace-chapel-bottom-room-north-wall", [x + 118, bottom - 132, x, bottom - 132]),
    wall(common, "fountainview-terrace-chapel-west-wall", [x, bottom - 132, x, y]),
    wall(common, "fountainview-terrace-chapel-upper-partition", [chapelLeft, y, chapelLeft, y + 222]),
    wall(common, "fountainview-terrace-chapel-left-enclosing-wall", [chapelLeft, y + 222, chapelLeft, bottom - 192]),
    railing(common, "fountainview-terrace-chapel-lounge-triangle", [chapelLeft, y + 222, chapelLeft - 48, y + 222, chapelLeft, y + 330], "LOUNGE ENCLOSURE", "source-traced"),
    wall(common, "fountainview-terrace-chapel-lower-partition", [chapelLeft, bottom - 108, chapelLeft, bottom]),
    railing(common, "fountainview-terrace-chapel-floor-left-return", [chapelLeft, y + 222, chapelLeft + 84, y + 222, chapelLeft + 84, y + 240], "CHAPEL FLOOR RETURN", "source-traced"),
    railing(common, "fountainview-terrace-chapel-seating-boundary-left", [chapelLeft + 84, y + 240, chapelLeft + 84, bottom - 192], "CHAPEL SEATING RAIL", "source-traced"),
    railing(common, "fountainview-terrace-chapel-seating-boundary", [chapelLeft + 126, bottom - 144, right - 102, bottom - 144, right - 72, bottom - 192, right - 72, y + 204], "CHAPEL SEATING RAIL", "source-traced"),
  ];
}

function createGardenLevel(): HallLevelConfiguration {
  const width = 60 * FOOT;
  const height = 66 * FOOT;
  const x = MARGIN;
  const y = MARGIN;
  const right = x + width;
  const bottom = y + height;
  const center = x + width / 2;
  const aisleWidth = 5 * FOOT;
  const aisleTop = y + 96;
  const aisleHeight = 58 * FOOT;
  const common: Common = { fixed: true, measurementStatus: "provisional" };
  const gazeboPoints = octagon(center, y + 48, 48);

  const elements: FixedArchitectureElement[] = [
    area(common, "fountainview-terrace-garden-left-seating", "main-floor", "GARDEN SEATING", x + 18, aisleTop + 24, width / 2 - aisleWidth / 2 - 36, aisleHeight - 48, "allowed", "floor", false),
    area(common, "fountainview-terrace-garden-right-seating", "main-floor", "GARDEN SEATING", center + aisleWidth / 2 + 18, aisleTop + 24, width / 2 - aisleWidth / 2 - 36, aisleHeight - 48, "allowed", "floor", false),
    path(common, "fountainview-terrace-garden-left-lawn", `M ${x + 18} ${aisleTop + 24} H ${center - aisleWidth / 2 - 18} V ${aisleTop + aisleHeight - 24} H ${x + 18} Z`, "Left garden seating lawn", "allowed", "#879d7b", 2, undefined, 0.5, "#dbe8d5"),
    path(common, "fountainview-terrace-garden-right-lawn", `M ${center + aisleWidth / 2 + 18} ${aisleTop + 24} H ${right - 18} V ${aisleTop + aisleHeight - 24} H ${center + aisleWidth / 2 + 18} Z`, "Right garden seating lawn", "allowed", "#879d7b", 2, undefined, 0.5, "#dbe8d5"),
    polygonArea(common, "fountainview-terrace-garden-gazebo", "stage", "GAZEBO · 8′ ACROSS", gazeboPoints, "blocked", "raised", true, "confirmed"),
    path(common, "fountainview-terrace-garden-aisle", `M ${center - aisleWidth / 2} ${aisleTop} H ${center + aisleWidth / 2} V ${aisleTop + aisleHeight} H ${center - aisleWidth / 2} Z`, "CEREMONY AISLE · 58′ × 5′", "restricted", "#cbb89d", 2, undefined, 0.42, "#e5d9c7"),
    ...gardenPerimeter(common, x, y, right, bottom),
    label(common, "fountainview-terrace-garden-title", "GARDEN CEREMONY · 250 MAX", x + 210, y + 122, 300, 0, 12),
    label(common, "fountainview-terrace-garden-chair-inventory", "OUTDOOR POOL · 300 WHITE GARDEN CHAIRS", x + 210, y + 146, 300, 0, 7),
    label(common, "fountainview-terrace-garden-aisle-label", "58′ × 5′ AISLE", center - 48, y + 430, 120, 90, 8),
    label(common, "fountainview-terrace-garden-estimate-note", "OVERALL GARDEN FOOTPRINT · PLANNING ESTIMATE", x + 192, bottom + 26, 340, 0, 8),
  ];

  return {
    id: "garden-ceremony",
    slug: "garden-ceremony",
    name: "Garden Ceremony",
    inventoryGroupId: "garden",
    physicalWidthInches: width + MARGIN * 2,
    physicalHeightInches: height + MARGIN * 2,
    physicalDimensionStatus: "provisional",
    physicalDimensionNote:
      "The garden tab is a planning estimate because the source gives no overall garden boundary. The confirmed 58-by-5-foot aisle and 8-foot-across standing-room gazebo are drawn to scale inside a provisional 60-by-66-foot planning envelope. Outdoor ceremony capacity is 250.",
    planningBounds: { x, y, width, height },
    defaultObjectPosition: { x: center - 180, y: y + 390 },
    usableAreas: [
      floorRegion("fountainview-terrace-garden-left-usable", "Left Garden Seating", x + 18, aisleTop + 24, width / 2 - aisleWidth / 2 - 36, aisleHeight - 48, "provisional"),
      floorRegion("fountainview-terrace-garden-right-usable", "Right Garden Seating", center + aisleWidth / 2 + 18, aisleTop + 24, width / 2 - aisleWidth / 2 - 36, aisleHeight - 48, "provisional"),
    ],
    voidAreas: [],
    fixedArchitecturalElements: elements,
    floorplanAsset: null,
  };
}

function gardenPerimeter(common: Common, x: number, y: number, right: number, bottom: number): FixedArchitectureElement[] {
  const entranceLeft = x + (right - x) / 2 - 48;
  const entranceRight = entranceLeft + 96;
  return [
    wall(common, "fountainview-terrace-garden-north-wall", [x, y, right, y]),
    wall(common, "fountainview-terrace-garden-east-wall", [right, y, right, bottom]),
    wall(common, "fountainview-terrace-garden-south-wall-east", [right, bottom, entranceRight, bottom]),
    wall(common, "fountainview-terrace-garden-south-wall-west", [entranceLeft, bottom, x, bottom]),
    wall(common, "fountainview-terrace-garden-west-wall", [x, bottom, x, y]),
    ...doubleDoor(common, "fountainview-terrace-garden-entry", entranceLeft, bottom, 96, 180, "Garden entrance"),
  ];
}

function area(
  common: Common,
  id: string,
  role: Extract<FixedArchitectureElement, { kind: "area" }>["role"],
  labelText: string,
  x: number,
  y: number,
  width: number,
  height: number,
  placementBehavior: "allowed" | "blocked" | "restricted",
  elevation: "floor" | "raised",
  showLabel = true,
  measurementStatus?: ArchitectureMeasurementStatus,
): FixedArchitectureElement {
  return {
    ...common,
    ...(measurementStatus ? { measurementStatus } : {}),
    id,
    kind: "area",
    role,
    label: labelText,
    physicalNote: labelText,
    placementBehavior,
    elevation,
    showLabel,
    showOutline: true,
    shape: { type: "rectangle", x, y, width, height },
  };
}

function polygonArea(
  common: Common,
  id: string,
  role: Extract<FixedArchitectureElement, { kind: "area" }>["role"],
  labelText: string,
  points: number[],
  placementBehavior: "allowed" | "blocked" | "restricted",
  elevation: "floor" | "raised",
  showLabel = true,
  measurementStatus?: ArchitectureMeasurementStatus,
  showOutline = true,
): FixedArchitectureElement {
  return {
    ...common,
    ...(measurementStatus ? { measurementStatus } : {}),
    id,
    kind: "area",
    role,
    label: labelText,
    physicalNote: labelText,
    placementBehavior,
    elevation,
    showLabel,
    showOutline,
    shape: { type: "polygon", points },
  };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return {
    ...common,
    id,
    kind: "wall",
    label: "Fixed wall",
    physicalNote: "Permanent wall proportionally traced from the supplied plan.",
    placementBehavior: "blocked",
    points,
  };
}

function railing(
  common: Common,
  id: string,
  points: number[],
  labelText: string,
  measurementStatus: ArchitectureMeasurementStatus = "source-traced",
): FixedArchitectureElement {
  return {
    ...common,
    measurementStatus,
    id,
    kind: "railing",
    label: labelText,
    physicalNote: labelText,
    placementBehavior: "blocked",
    points,
  };
}

function path(
  common: Common,
  id: string,
  data: string,
  labelText: string,
  placementBehavior: "allowed" | "blocked" | "restricted",
  stroke: string,
  strokeWidth: number,
  dash?: number[],
  opacity = 1,
  fill = "transparent",
): FixedArchitectureElement {
  return {
    ...common,
    id,
    kind: "path",
    label: labelText,
    physicalNote: labelText,
    placementBehavior,
    data,
    fill,
    stroke,
    strokeWidth,
    ...(dash ? { dash } : {}),
    opacity,
    elevation: "floor",
  };
}

function door(
  common: Common,
  id: string,
  x: number,
  y: number,
  width: number,
  rotation: number,
  swingDirection: "clockwise" | "counterclockwise",
  labelText: string,
): FixedArchitectureElement {
  return {
    ...common,
    id,
    kind: "door",
    label: labelText,
    physicalNote: `${labelText}; dimensions are proportionally traced unless otherwise noted.`,
    placementBehavior: "restricted",
    x,
    y,
    width,
    rotation,
    swingDirection,
    swingAngle: 45,
  };
}

function doubleDoor(
  common: Common,
  id: string,
  x: number,
  y: number,
  width: number,
  rotation: number,
  labelText: string,
): FixedArchitectureElement[] {
  return [
    door(common, `${id}-left`, x, y, width / 2, rotation, "counterclockwise", labelText),
    door(common, `${id}-right`, x + width, y, width / 2, rotation + 180, "clockwise", labelText),
  ];
}

function label(
  common: Common,
  id: string,
  labelText: string,
  x: number,
  y: number,
  width: number,
  rotation = 0,
  fontSize = 9,
): FixedArchitectureElement {
  return {
    ...common,
    id,
    kind: "label",
    label: labelText,
    physicalNote: "Plan annotation.",
    placementBehavior: "restricted",
    x,
    y,
    width,
    rotation,
    fontSize,
  };
}

function floorRegion(
  id: string,
  labelText: string,
  x: number,
  y: number,
  width: number,
  height: number,
  measurementStatus: ArchitectureMeasurementStatus,
): VenueFloorRegion {
  return {
    id,
    label: labelText,
    kind: "usable-floor",
    placementBehavior: "allowed",
    measurementStatus,
    shape: { type: "rectangle", x, y, width, height },
  };
}

function polygonRegion(
  id: string,
  labelText: string,
  points: number[],
  measurementStatus: ArchitectureMeasurementStatus,
): VenueFloorRegion {
  return {
    id,
    label: labelText,
    kind: "usable-floor",
    placementBehavior: "allowed",
    measurementStatus,
    shape: { type: "polygon", points },
  };
}

function octagon(centerX: number, centerY: number, radius: number) {
  const inset = radius * 0.42;
  return [
    centerX - inset, centerY - radius,
    centerX + inset, centerY - radius,
    centerX + radius, centerY - inset,
    centerX + radius, centerY + inset,
    centerX + inset, centerY + radius,
    centerX - inset, centerY + radius,
    centerX - radius, centerY + inset,
    centerX - radius, centerY - inset,
  ];
}
