import type { FixedArchitectureElement } from "@/domain/floorplan";
import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";

/**
 * Westwood Ranch shares Stonecreek Reserve's calibrated 80' x 60' event-floor
 * footprint. Its distinguishing feature is the broad, three-tread curved stair
 * that spans the front of the raised stage.
 */
export function createWestwoodRanchConfiguration(): HallConfiguration {
  const source = createStonecreekReserveConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Stonecreek Reserve must remain a single-level source footprint.");
  }

  const fixedArchitecturalElements = source.fixedArchitecturalElements
    .filter((element) => element.id !== "stonecreek-reserve-stage-stairs")
    .map((element) => ({
      ...element,
      id: element.id.replace(/^stonecreek-reserve/, "westwood-ranch"),
    }));

  fixedArchitecturalElements.push(...createCurvedStageSteps());

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; Westwood Ranch follows the Stonecreek Reserve footprint with a broad curved stair at the raised stage.",
    fixedArchitecturalElements,
  };
}

function createCurvedStageSteps(): FixedArchitectureElement[] {
  const common = {
    fixed: true as const,
    label: "Curved Stage Steps",
    physicalNote: "Three broad curved treads rise from the event floor to the raised stage.",
    placementBehavior: "blocked" as const,
    measurementStatus: "source-traced" as const,
    stroke: "#657169",
  };

  return [
    {
      ...common,
      id: "westwood-ranch-curved-stage-step-footprint",
      kind: "path",
      data: "M 192 263 C 258 282, 292 339, 292 420 C 292 501, 258 558, 192 577 Z",
      fill: "#e2e4df",
      stroke: "transparent",
    },
    {
      ...common,
      id: "westwood-ranch-curved-stage-step-inner",
      kind: "path",
      data: "M 192 279 C 228 296, 244 348, 244 420 C 244 492, 228 544, 192 561",
      strokeWidth: 1.5,
    },
    {
      ...common,
      id: "westwood-ranch-curved-stage-step-middle",
      kind: "path",
      data: "M 192 271 C 244 291, 268 344, 268 420 C 268 496, 244 549, 192 569",
      strokeWidth: 1.5,
    },
    {
      ...common,
      id: "westwood-ranch-curved-stage-step-outer",
      kind: "path",
      data: "M 192 263 C 258 282, 292 339, 292 420 C 292 501, 258 558, 192 577",
      strokeWidth: 2.5,
    },
  ];
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
