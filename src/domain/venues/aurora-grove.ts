import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createWestwoodRanchConfiguration } from "@/domain/venues/westwood-ranch";

/**
 * Aurora Grove has the same confirmed footprint and curved stage steps as
 * Westwood Ranch. Keep an independent configuration for Norman-specific edits.
 */
export function createAuroraGroveConfiguration(): HallConfiguration {
  const source = createWestwoodRanchConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Westwood Ranch must remain a single-level source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; Aurora Grove matches the Westwood Ranch footprint and broad curved stage steps.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map((element) => ({
      ...element,
      id: element.id.replace(/^westwood-ranch/, "aurora-grove"),
    })),
  };
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
