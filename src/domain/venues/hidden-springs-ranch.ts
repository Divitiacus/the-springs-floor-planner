import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";

/**
 * Hidden Springs Ranch has the same confirmed footprint as Stonecreek Reserve.
 * Keep a separate configuration so the two halls can diverge independently as
 * Denton-specific measurements become available.
 */
export function createHiddenSpringsRanchConfiguration(): HallConfiguration {
  const source = createStonecreekReserveConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Stonecreek Reserve must remain a single-level source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Hidden Springs Ranch architecture matches the Stonecreek Reserve footprint.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map((element) => ({
      ...element,
      id: element.id.replace(/^stonecreek-reserve/, "hidden-springs-ranch"),
    })),
  };
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
