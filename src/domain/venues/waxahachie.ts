import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const MARGIN = 60;
const HALL_X = MARGIN;
const HALL_Y = MARGIN;
const HALL_WIDTH = 90 * 12;
const HALL_HEIGHT = 63 * 12;
const HALL_RIGHT = HALL_X + HALL_WIDTH;
const HALL_BOTTOM = HALL_Y + HALL_HEIGHT;
const SIDE_OPENING_HEIGHT = 84;
const SIDE_OPENING_TOP = HALL_Y + (HALL_HEIGHT - SIDE_OPENING_HEIGHT) / 2;
const CATERING_WINDOW_TOP = HALL_Y + 108;
const BAR_WINDOW_TOP = HALL_Y + 198;
const SERVICE_WINDOW_HEIGHT = 72;
const VENDOR_KITCHEN_ENTRANCE_TOP = HALL_Y + 24;
const VENDOR_KITCHEN_ENTRANCE_WIDTH = 72;
const VENDOR_KITCHEN_ENTRANCE_BOTTOM = VENDOR_KITCHEN_ENTRANCE_TOP + VENDOR_KITCHEN_ENTRANCE_WIDTH;
const NORTH_DOUBLE_DOOR_WIDTH = 72;
const NORTH_DOUBLE_DOOR_CENTER = HALL_X + (HALL_WIDTH * 2) / 3;
const NORTH_DOUBLE_DOOR_LEFT = NORTH_DOUBLE_DOOR_CENTER - NORTH_DOUBLE_DOOR_WIDTH / 2;
const NORTH_DOUBLE_DOOR_RIGHT = NORTH_DOUBLE_DOOR_LEFT + NORTH_DOUBLE_DOOR_WIDTH;
const WALL_PIER_XS = [200, 430, 664, 896, 1122] as const;
const WALL_PIER_WIDTH = 18;
const COURTYARD_ENTRANCE_WIDTH = 96;
const COURTYARD_ENTRANCE_CENTER =
  (WALL_PIER_XS[1] + WALL_PIER_WIDTH / 2 + WALL_PIER_XS[2] + WALL_PIER_WIDTH / 2) / 2;
const COURTYARD_ENTRANCE_LEFT = COURTYARD_ENTRANCE_CENTER - COURTYARD_ENTRANCE_WIDTH / 2;
const COURTYARD_ENTRANCE_RIGHT = COURTYARD_ENTRANCE_CENTER + COURTYARD_ENTRANCE_WIDTH / 2;

type Common = { fixed: true; measurementStatus: "source-traced" };

/** Waxahachie's independent 90-by-63-foot reception hall, traced from the supplied diagram. */
export function createWaxahachieConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  return {
    physicalWidthInches: HALL_WIDTH + MARGIN * 2,
    physicalHeightInches: HALL_HEIGHT + MARGIN * 2,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "The user confirmed the main reception hall at 90 feet by 63 feet. Permanent perimeter features, centered side openings, the upper-left kitchen/vendor entrance, the north-wall double doors, and the adjacent bar and catering pass-through windows are proportionally source-traced from the supplied Waxahachie diagram; the colored furniture-layout shapes in its center are intentionally excluded.",
    planningBounds: { x: HALL_X, y: HALL_Y, width: HALL_WIDTH, height: HALL_HEIGHT },
    defaultObjectPosition: { x: HALL_X + HALL_WIDTH / 2, y: HALL_Y + HALL_HEIGHT / 2 },
    usableAreas: [mainFloorRegion()],
    voidAreas: [],
    fixedArchitecturalElements: [
      mainFloor(common),
      fireplace(common),
      ...pillars(common),
      ...perimeterWalls(common),
      ...servicePassThroughs(common),
      vendorKitchenEntranceDoor(common),
      ...northDoubleDoors(common),
      ...labels(common),
    ],
    floorplanAsset: null,
  };
}

function mainFloor(common: Common): FixedArchitectureElement {
  return {
    ...common,
    id: "waxahachie-main-reception-floor",
    kind: "area",
    role: "main-floor",
    label: "Main Reception Hall · 90′ × 63′",
    physicalNote: "User-confirmed clear planning footprint of 90 feet by 63 feet.",
    placementBehavior: "allowed",
    measurementStatus: "confirmed",
    elevation: "floor",
    showOutline: false,
    shape: { type: "rectangle", x: HALL_X, y: HALL_Y, width: HALL_WIDTH, height: HALL_HEIGHT },
  };
}

function mainFloorRegion(): VenueFloorRegion {
  return {
    id: "waxahachie-main-reception-usable-floor",
    label: "Main Reception Hall",
    kind: "usable-floor",
    placementBehavior: "allowed",
    measurementStatus: "confirmed",
    shape: { type: "rectangle", x: HALL_X, y: HALL_Y, width: HALL_WIDTH, height: HALL_HEIGHT },
  };
}

function fireplace(common: Common): FixedArchitectureElement {
  return {
    ...common,
    id: "waxahachie-fireplace",
    kind: "area",
    role: "fireplace",
    label: "FIREPLACE",
    physicalNote: "West-wall fireplace proportionally source-traced from the supplied diagram.",
    placementBehavior: "blocked",
    elevation: "floor",
    labelRotation: -90,
    shape: { type: "rectangle", x: HALL_X, y: HALL_Y + 486, width: 48, height: 168 },
  };
}

function pillars(common: Common): FixedArchitectureElement[] {
  const pillar = (id: string, x: number, y: number): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "area",
    role: "pillar",
    label: "Wall Pier",
    physicalNote: "Perimeter wall pier source-traced from the supplied diagram; dimensions are proportional.",
    placementBehavior: "blocked",
    elevation: "floor",
    showLabel: false,
    shape: { type: "rectangle", x, y, width: WALL_PIER_WIDTH, height: 24 },
  });

  return [
    ...WALL_PIER_XS.map((x, index) => pillar(`waxahachie-north-wall-pier-${index + 1}`, x, HALL_Y)),
    ...WALL_PIER_XS.map((x, index) => pillar(`waxahachie-south-wall-pier-${index + 1}`, x, HALL_BOTTOM - 24)),
  ];
}

function perimeterWalls(common: Common): FixedArchitectureElement[] {
  const wall = (id: string, points: number[]): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "wall",
    label: "Fixed wall",
    physicalNote: "Perimeter wall source-traced from the supplied diagram.",
    placementBehavior: "blocked",
    points,
  });

  const ceremonyTop = SIDE_OPENING_TOP;
  const ceremonyBottom = ceremonyTop + SIDE_OPENING_HEIGHT;
  const hallwayTop = SIDE_OPENING_TOP;
  const hallwayBottom = hallwayTop + SIDE_OPENING_HEIGHT;
  const cateringBottom = CATERING_WINDOW_TOP + SERVICE_WINDOW_HEIGHT;
  const barBottom = BAR_WINDOW_TOP + SERVICE_WINDOW_HEIGHT;

  return [
    wall("waxahachie-north-wall-west", [HALL_X, HALL_Y, NORTH_DOUBLE_DOOR_LEFT, HALL_Y]),
    wall("waxahachie-north-wall-east", [NORTH_DOUBLE_DOOR_RIGHT, HALL_Y, HALL_RIGHT, HALL_Y]),
    wall("waxahachie-east-wall-north", [HALL_RIGHT, HALL_Y, HALL_RIGHT, ceremonyTop]),
    wall("waxahachie-east-wall-south", [HALL_RIGHT, ceremonyBottom, HALL_RIGHT, HALL_BOTTOM]),
    wall("waxahachie-south-wall-east", [HALL_RIGHT, HALL_BOTTOM, COURTYARD_ENTRANCE_RIGHT, HALL_BOTTOM]),
    wall("waxahachie-south-wall-west", [COURTYARD_ENTRANCE_LEFT, HALL_BOTTOM, HALL_X, HALL_BOTTOM]),
    wall("waxahachie-west-wall-north-cap", [HALL_X, HALL_Y, HALL_X, VENDOR_KITCHEN_ENTRANCE_TOP]),
    wall("waxahachie-west-wall-below-vendor-entrance", [HALL_X, VENDOR_KITCHEN_ENTRANCE_BOTTOM, HALL_X, CATERING_WINDOW_TOP]),
    wall("waxahachie-west-wall-between-service-windows", [HALL_X, cateringBottom, HALL_X, BAR_WINDOW_TOP]),
    wall("waxahachie-west-wall-above-hallway", [HALL_X, barBottom, HALL_X, hallwayTop]),
    wall("waxahachie-west-wall-south", [HALL_X, hallwayBottom, HALL_X, HALL_BOTTOM]),
  ];
}

function servicePassThroughs(common: Common): FixedArchitectureElement[] {
  const passThrough = (id: string, label: string, y: number): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "path",
    label,
    physicalNote: `${label} is a pass-through service window rather than a floor-standing fixture.`,
    placementBehavior: "restricted",
    elevation: "floor",
    data: `M ${HALL_X} ${y} V ${y + SERVICE_WINDOW_HEIGHT}`,
    fill: "transparent",
    stroke: "#9ca69f",
    strokeWidth: 3,
  });

  return [
    passThrough("waxahachie-catering-pass-through", "Catering Pass-Through", CATERING_WINDOW_TOP),
    passThrough("waxahachie-bar-pass-through", "Bar Pass-Through", BAR_WINDOW_TOP),
  ];
}

function vendorKitchenEntranceDoor(common: Common): FixedArchitectureElement {
  return {
    ...common,
    id: "waxahachie-vendor-kitchen-entrance-door",
    kind: "door",
    label: "Vendor Entrance",
    physicalNote: "The vendor entrance is the upper-left opening from the kitchen shown in the supplied diagram; exact door-leaf dimensions are proportional.",
    placementBehavior: "restricted",
    x: HALL_X,
    y: VENDOR_KITCHEN_ENTRANCE_TOP,
    width: VENDOR_KITCHEN_ENTRANCE_WIDTH,
    rotation: 90,
    swingDirection: "clockwise",
    swingAngle: 45,
  };
}

function northDoubleDoors(common: Common): FixedArchitectureElement[] {
  const leaf = (
    id: string,
    x: number,
    rotation: number,
    swingDirection: "clockwise" | "counterclockwise",
  ): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "door",
    label: "North Double Doors",
    physicalNote: "The right-of-center north-wall opening is shown as a pair of doors in the supplied diagram; exact door-leaf dimensions are proportional.",
    placementBehavior: "restricted",
    x,
    y: HALL_Y,
    width: NORTH_DOUBLE_DOOR_WIDTH / 2,
    rotation,
    swingDirection,
    swingAngle: 45,
  });

  return [
    leaf("waxahachie-north-double-door-left", NORTH_DOUBLE_DOOR_LEFT, 0, "counterclockwise"),
    leaf("waxahachie-north-double-door-right", NORTH_DOUBLE_DOOR_RIGHT, 180, "clockwise"),
  ];
}

function labels(common: Common): FixedArchitectureElement[] {
  const text = (id: string, label: string, x: number, y: number, width: number, rotation = 0, fontSize = 9): FixedArchitectureElement => ({
    ...common,
    id,
    kind: "label",
    label,
    physicalNote: "Plan annotation.",
    placementBehavior: "restricted",
    x,
    y,
    width,
    rotation,
    fontSize,
  });

  return [
    text("waxahachie-main-hall-label", "MAIN RECEPTION HALL", HALL_X + 390, HALL_Y + 28, 300, 0, 11),
    text("waxahachie-long-dimension", "90′", HALL_RIGHT - 150, HALL_Y - 32, 100, 0, 10),
    text("waxahachie-short-dimension", "63′", HALL_RIGHT + 34, HALL_Y + 332, 90, 90, 10),
    text("waxahachie-vendor-entrance-label", "VENDOR\nENTRANCE", HALL_X - 56, VENDOR_KITCHEN_ENTRANCE_TOP + 12, 52, 0, 7),
    text("waxahachie-kitchen-label", "KITCHEN", HALL_X - 38, VENDOR_KITCHEN_ENTRANCE_BOTTOM + 8, 72, -90),
    text("waxahachie-catering-pass-through-label", "CATERING", HALL_X - 38, CATERING_WINDOW_TOP + SERVICE_WINDOW_HEIGHT, 72, -90, 8),
    text("waxahachie-bar-pass-through-label", "BAR", HALL_X - 38, BAR_WINDOW_TOP + SERVICE_WINDOW_HEIGHT, 72, -90, 8),
    text("waxahachie-hallway-label", "RESTROOMS / SUITES / HALLWAY", HALL_X + 22, SIDE_OPENING_TOP + 32, 190, 0, 8),
    text("waxahachie-tree-ceremony-label", "TREE CEREMONY ENTRANCE", HALL_RIGHT - 218, SIDE_OPENING_TOP + 32, 180, 0, 8),
    text("waxahachie-courtyard-label", "COURTYARD ENTRANCE", COURTYARD_ENTRANCE_CENTER - 105, HALL_BOTTOM - 42, 210, 0, 8),
  ];
}
