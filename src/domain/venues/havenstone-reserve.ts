import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createVillaTuscanaConfiguration } from "@/domain/venues/villa-tuscana";

/**
 * Havenstone Reserve has the same confirmed footprint as Villa Tuscana. Keep
 * a separate configuration so McKinney-specific measurements can diverge later.
 */
export function createHavenstoneReserveConfiguration(): HallConfiguration {
  const source = createVillaTuscanaConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Villa Tuscana must remain a single-level source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Havenstone Reserve architecture matches the Villa Tuscana footprint.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map((element) => ({
      ...element,
      id: element.id.replace(/^villa-tuscana/, "havenstone-reserve"),
    })),
  };
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
