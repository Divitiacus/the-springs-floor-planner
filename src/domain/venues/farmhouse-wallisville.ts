import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration } from "@/domain/location-catalog";

const MAIN_X = 40;
const MAIN_Y = 376;
const MAIN_WIDTH = 1056; // 88′
const MAIN_HEIGHT = 525; // 43′9″
const EXTENSION_X = 376;
const EXTENSION_Y = 40;
const EXTENSION_WIDTH = 384; // 32′
const EXTENSION_HEIGHT = 336; // 28′
const SERVICE_X = 760;
const SERVICE_Y = MAIN_Y + MAIN_HEIGHT;
const SERVICE_WIDTH = 336; // 28′
const SERVICE_HEIGHT = 315; // 26′3″

type Common = { fixed: true; measurementStatus: "source-traced" };

/**
 * Farmhouse geometry traced from the clean Wallisville plan supplied by the user.
 * The companion dimensioned plan confirms the major 28′ / 32′ / 28′ width bands,
 * 28′ upper extension, 43′9″ main body, and 26′3″ lower service wing.
 */
export function createFarmhouseWallisvilleConfiguration(): HallConfiguration {
  const common: Common = { fixed: true, measurementStatus: "source-traced" };

  const fixedArchitecturalElements: FixedArchitectureElement[] = [
    {
      ...area(
        common,
        "farmhouse-wallisville-main-floor",
        "main-floor",
        "Main Event Floor · 88′ × 43′9″",
        MAIN_X,
        MAIN_Y,
        MAIN_WIDTH,
        MAIN_HEIGHT,
        "allowed",
        "confirmed",
      ),
      showOutline: false,
    },
    {
      ...areaWithoutLabel(
        common,
        "farmhouse-wallisville-upper-extension",
        "event-floor-extension",
        "Event Floor Extension · 32′ × 28′",
        EXTENSION_X,
        EXTENSION_Y,
        EXTENSION_WIDTH,
        EXTENSION_HEIGHT,
        "allowed",
        "confirmed",
      ),
      showOutline: false,
    },
    areaWithoutLabel(
      common,
      "farmhouse-wallisville-service-wing",
      "catering",
      "Service Area · 28′ × 26′3″",
      SERVICE_X,
      SERVICE_Y,
      SERVICE_WIDTH,
      SERVICE_HEIGHT,
      "blocked",
      "confirmed",
    ),
    area(
      common,
      "farmhouse-wallisville-buffet",
      "buffet",
      "Permanent Buffet",
      820,
      SERVICE_Y + 58,
      54,
      192,
      "blocked",
      "confirmed",
    ),
    area(
      common,
      "farmhouse-wallisville-bar",
      "bar",
      "Permanent Bar",
      1014,
      SERVICE_Y + 63,
      36,
      108,
      "blocked",
      "confirmed",
    ),
    {
      ...common,
      id: "farmhouse-wallisville-stairs",
      kind: "stairs",
      label: "Stairs · 6′ × 16′",
      physicalNote: "The dimensioned source shows a 6-foot-wide, 16-foot-deep staircase.",
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
      x: 532,
      y: MAIN_Y + MAIN_HEIGHT - 192,
      width: 72,
      height: 192,
      orientation: "vertical",
      treadAxis: "y",
      treadCount: 10,
      curvedTop: true,
      showLabel: false,
    },
    ...createWalls(common),
    ...createDoors(common),
  ];

  return {
    physicalWidthInches: 1136,
    physicalHeightInches: 1256,
    physicalDimensionStatus: "source-traced",
    physicalDimensionNote:
      "Farmhouse major dimensions are confirmed from the supplied dimensioned plan: the main body is 88 feet wide by 43 feet 9 inches deep. Wall, door, fixture, and staircase positions are source-traced from the cleaner companion drawing. Unidentified rooms remain unlabeled.",
    fixedArchitecturalElements,
    floorplanAsset: null,
  };
}

function createWalls(common: Common): FixedArchitectureElement[] {
  return [
    wall(common, "farmhouse-wallisville-upper-extension-wall", [EXTENSION_X, MAIN_Y, EXTENSION_X, EXTENSION_Y, EXTENSION_X + EXTENSION_WIDTH, EXTENSION_Y, EXTENSION_X + EXTENSION_WIDTH, MAIN_Y]),
    wall(common, "farmhouse-wallisville-main-northwest-wall", [MAIN_X, MAIN_Y, EXTENSION_X, MAIN_Y]),
    wall(common, "farmhouse-wallisville-main-northeast-wall", [EXTENSION_X + EXTENSION_WIDTH, MAIN_Y, MAIN_X + MAIN_WIDTH, MAIN_Y]),
    wall(common, "farmhouse-wallisville-main-west-wall", [MAIN_X, MAIN_Y, MAIN_X, MAIN_Y + MAIN_HEIGHT]),
    wall(common, "farmhouse-wallisville-main-east-wall", [MAIN_X + MAIN_WIDTH, MAIN_Y, MAIN_X + MAIN_WIDTH, MAIN_Y + MAIN_HEIGHT]),
    wall(common, "farmhouse-wallisville-main-southwest-wall", [MAIN_X, MAIN_Y + MAIN_HEIGHT, 532, MAIN_Y + MAIN_HEIGHT]),
    wall(common, "farmhouse-wallisville-main-southeast-wall", [604, MAIN_Y + MAIN_HEIGHT, SERVICE_X, MAIN_Y + MAIN_HEIGHT]),
    wall(common, "farmhouse-wallisville-service-west-wall", [SERVICE_X, SERVICE_Y, SERVICE_X, SERVICE_Y + SERVICE_HEIGHT]),
    wall(common, "farmhouse-wallisville-service-east-wall", [SERVICE_X + SERVICE_WIDTH, SERVICE_Y, SERVICE_X + SERVICE_WIDTH, SERVICE_Y + SERVICE_HEIGHT]),
    wall(common, "farmhouse-wallisville-service-south-wall", [SERVICE_X, SERVICE_Y + SERVICE_HEIGHT, SERVICE_X + SERVICE_WIDTH, SERVICE_Y + SERVICE_HEIGHT]),
    wall(common, "farmhouse-wallisville-service-divider", [996, SERVICE_Y + 71, 996, SERVICE_Y + SERVICE_HEIGHT]),
  ];
}

function createDoors(common: Common): FixedArchitectureElement[] {
  return [
    door(common, "farmhouse-wallisville-west-double-door-north", MAIN_X, 581, 48, 90, "counterclockwise"),
    door(common, "farmhouse-wallisville-west-double-door-south", MAIN_X, 677, 48, -90, "clockwise"),
    door(common, "farmhouse-wallisville-east-double-door-north", MAIN_X + MAIN_WIDTH, 581, 48, 90, "clockwise"),
    door(common, "farmhouse-wallisville-east-double-door-south", MAIN_X + MAIN_WIDTH, 677, 48, -90, "counterclockwise"),
    door(common, "farmhouse-wallisville-east-service-door", MAIN_X + MAIN_WIDTH, MAIN_Y + MAIN_HEIGHT - 117, 48, 90, "clockwise"),
    door(common, "farmhouse-wallisville-service-west-door", SERVICE_X, SERVICE_Y + 123, 48, 90, "counterclockwise"),
    door(common, "farmhouse-wallisville-service-south-door", 1030, SERVICE_Y + SERVICE_HEIGHT, 48, 0, "clockwise"),
  ];
}

function area(
  common: Common,
  id: string,
  role: Extract<FixedArchitectureElement, { kind: "area" }>["role"],
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"],
  measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"],
): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...common, id, kind: "area", role, label, placementBehavior, measurementStatus, elevation: "floor", shape: { type: "rectangle", x, y, width, height } };
}

function areaWithoutLabel(
  common: Common,
  id: string,
  role: Extract<FixedArchitectureElement, { kind: "area" }>["role"],
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  placementBehavior: Extract<FixedArchitectureElement, { kind: "area" }>["placementBehavior"],
  measurementStatus: Extract<FixedArchitectureElement, { kind: "area" }>["measurementStatus"],
): Extract<FixedArchitectureElement, { kind: "area" }> {
  return { ...area(common, id, role, label, x, y, width, height, placementBehavior, measurementStatus), showLabel: false };
}

function wall(common: Common, id: string, points: number[]): FixedArchitectureElement {
  return { ...common, id, kind: "wall", label: "Fixed wall", placementBehavior: "blocked", points };
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
