import type { FixedArchitectureElement, VenueFloorRegion } from "@/domain/floorplan";
import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createParkerManorConfiguration } from "@/domain/venues/parker-manor";

const HALL_RIGHT = 860;
const HALL_TOP = 80;
const HALL_CENTER_Y = 485;
const FIREPLACE_WIDTH = 126; // 10′6″, called out on the supplied downstairs plan.
const FIREPLACE_X = 455 - FIREPLACE_WIDTH / 2;

/**
 * Tuscany Hill shares Parker Manor's two-level footprint. Its fireplace moves
 * to the north wall, and its upstairs level has the rounded east porch shown
 * on the supplied McKinney plan.
 */
export function createTuscanyHillConfiguration(): HallConfiguration {
  const source = createParkerManorConfiguration();
  if (!isMultiLevel(source)) {
    throw new Error("Parker Manor must remain a multi-level source footprint.");
  }

  return {
    defaultLevelId: source.defaultLevelId,
    levels: source.levels.map((level) => {
      const isUpstairs = level.id === "level-2-upstairs";
      return {
        ...level,
        physicalWidthInches: isUpstairs ? 1040 : level.physicalWidthInches,
        physicalDimensionNote: isUpstairs
          ? "Tuscany Hill uses Parker Manor's confirmed 67′6″ hall footprint, with its fireplace on the north wall and a source-traced rounded porch projecting from the east side of the upstairs floor."
          : "Tuscany Hill uses Parker Manor's confirmed 67′6″ hall footprint, with its fireplace relocated to the north wall as shown on the supplied McKinney plan.",
        usableAreas: renameRegions(level.usableAreas),
        voidAreas: renameRegions(level.voidAreas),
        fixedArchitecturalElements: createLevelElements(level.fixedArchitecturalElements, isUpstairs),
      };
    }),
  };
}

function createLevelElements(
  sourceElements: readonly FixedArchitectureElement[],
  isUpstairs: boolean,
): FixedArchitectureElement[] {
  const removedSourceIds = new Set([
    "parker-manor-mantle",
    "parker-manor-fireplace",
    "parker-manor-upstairs-fireplace",
    "parker-manor-pavilion-door-west",
    "parker-manor-pavilion-door-east",
    "parker-manor-reception-label",
    "parker-manor-overhang-label",
    "parker-manor-main-entrance-label",
    "parker-manor-upstairs-label",
    "parker-manor-full-balcony",
    "parker-manor-juliet-balcony",
    "parker-manor-full-balcony-door-west",
    "parker-manor-full-balcony-door-east",
    "parker-manor-juliet-balcony-door-west",
    "parker-manor-juliet-balcony-door-east",
    "parker-manor-full-balcony-label",
    "parker-manor-juliet-balcony-label",
  ]);
  const elements = sourceElements
    .filter((element) => !removedSourceIds.has(element.id))
    .map(renameElement)
    .map((element) => relocateLevelLabel(element));

  return [
    ...(isUpstairs ? [roundedPorch(), porchDoor(), porchLabel()] : []),
    ...elements,
    ...(isUpstairs
      ? [northFireplace("tuscany-hill-upstairs-fireplace", HALL_TOP)]
      : [northMantle(), northFireplace("tuscany-hill-fireplace", HALL_TOP + 14), ...rightEntranceDoors()]),
  ];
}

function renameElement(element: FixedArchitectureElement): FixedArchitectureElement {
  return { ...element, id: element.id.replace(/^parker-manor/, "tuscany-hill") };
}

function relocateLevelLabel(element: FixedArchitectureElement): FixedArchitectureElement {
  if (element.kind !== "label") return element;
  if (element.id === "tuscany-hill-downstairs-label") {
    return { ...element, y: 150 };
  }
  return element;
}

function northMantle(): FixedArchitectureElement {
  return {
    fixed: true,
    measurementStatus: "source-traced",
    id: "tuscany-hill-mantle",
    kind: "area",
    role: "fireplace",
    label: "MANTLE",
    placementBehavior: "blocked",
    elevation: "floor",
    physicalNote: "Tuscany Hill's fireplace and mantle are centered on the north wall.",
    shape: { type: "rectangle", x: FIREPLACE_X - 1, y: HALL_TOP, width: FIREPLACE_WIDTH + 2, height: 14 },
  };
}

function northFireplace(id: string, y: number): FixedArchitectureElement {
  return {
    fixed: true,
    measurementStatus: "source-traced",
    id,
    kind: "area",
    role: "fireplace",
    label: "FIREPLACE",
    placementBehavior: "blocked",
    elevation: "floor",
    physicalNote: "The supplied Tuscany Hill plans place the fireplace at the center of the north wall.",
    shape: { type: "rectangle", x: FIREPLACE_X, y, width: FIREPLACE_WIDTH, height: 43 },
  };
}

function rightEntranceDoors(): FixedArchitectureElement[] {
  return [
    rightEntranceDoor("tuscany-hill-main-entrance-north", HALL_CENTER_Y, -90, "clockwise"),
    rightEntranceDoor("tuscany-hill-main-entrance-south", HALL_CENTER_Y, 90, "counterclockwise"),
  ];
}

function rightEntranceDoor(
  id: string,
  y: number,
  rotation: number,
  swingDirection: "clockwise" | "counterclockwise",
): FixedArchitectureElement {
  return {
    fixed: true,
    measurementStatus: "source-traced",
    id,
    kind: "door",
    label: "Main entrance door",
    placementBehavior: "restricted",
    x: HALL_RIGHT,
    y,
    width: 48,
    rotation,
    swingDirection,
    swingAngle: 42,
  };
}

function roundedPorch(): FixedArchitectureElement {
  return {
    fixed: true,
    measurementStatus: "source-traced",
    id: "tuscany-hill-upstairs-rounded-porch",
    kind: "path",
    label: "Rounded Porch",
    placementBehavior: "restricted",
    data: `M ${HALL_RIGHT} 350 C 934 350, 993 410, 993 485 C 993 560, 934 620, ${HALL_RIGHT} 620 Z`,
    fill: "#fffdfa",
    stroke: "#526159",
    strokeWidth: 4,
  };
}

function porchDoor(): FixedArchitectureElement {
  return {
    fixed: true,
    measurementStatus: "source-traced",
    id: "tuscany-hill-upstairs-porch-door",
    kind: "door",
    label: "Door to rounded porch",
    placementBehavior: "restricted",
    x: HALL_RIGHT,
    y: 461,
    width: 48,
    rotation: 90,
    swingDirection: "clockwise",
    swingAngle: 42,
  };
}

function porchLabel(): FixedArchitectureElement {
  return {
    fixed: true,
    measurementStatus: "source-traced",
    id: "tuscany-hill-upstairs-porch-label",
    kind: "label",
    label: "ROUNDED PORCH",
    placementBehavior: "restricted",
    x: 920,
    y: 425,
    width: 120,
    rotation: 90,
    fontSize: 12,
  };
}

function renameRegions(regions: readonly VenueFloorRegion[] | undefined): VenueFloorRegion[] | undefined {
  return regions?.map((region) => ({
    ...region,
    id: region.id.replace(/^parker-manor/, "tuscany-hill"),
  }));
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
