import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createHeritagePineConfiguration } from "@/domain/venues/heritage-pine";

/**
 * Poetry Springs has the same confirmed footprint as Heritage Pine. Keep a
 * separate configuration so Rockwall-specific measurements can diverge later.
 */
export function createPoetrySpringsConfiguration(): HallConfiguration {
  const source = createHeritagePineConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Heritage Pine must remain a single-level source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Poetry Springs architecture matches the Heritage Pine footprint.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map((element) => ({
      ...element,
      id: element.id.replace(/^heritage-pine/, "poetry-springs"),
    })),
  };
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
