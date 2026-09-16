import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";

/**
 * Sunset Pointe has the same confirmed footprint as Stonecreek Reserve. Keep
 * an independent configuration so Tulsa-specific measurements can diverge.
 */
export function createSunsetPointeConfiguration(): HallConfiguration {
  const source = createStonecreekReserveConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Stonecreek Reserve must remain a single-level source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Sunset Pointe architecture matches the Stonecreek Reserve footprint.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map((element) => ({
      ...element,
      id: element.id.replace(/^stonecreek-reserve/, "sunset-pointe"),
    })),
  };
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
