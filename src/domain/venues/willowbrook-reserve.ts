import type { HallConfiguration, MultiLevelHallConfiguration } from "@/domain/location-catalog";
import { createStonecreekReserveConfiguration } from "@/domain/venues/stonecreek-reserve";

/**
 * Willowbrook Reserve has the same confirmed footprint as Stonecreek Reserve.
 * Keep an independent configuration so Edmond-specific measurements can diverge.
 */
export function createWillowbrookReserveConfiguration(): HallConfiguration {
  const source = createStonecreekReserveConfiguration();
  if (isMultiLevel(source)) {
    throw new Error("Stonecreek Reserve must remain a single-level source footprint.");
  }

  return {
    ...source,
    physicalDimensionNote:
      "Central event floor confirmed at 80′ × 60′; surrounding Willowbrook Reserve architecture matches the Stonecreek Reserve footprint.",
    fixedArchitecturalElements: source.fixedArchitecturalElements.map((element) => ({
      ...element,
      id: element.id.replace(/^stonecreek-reserve/, "willowbrook-reserve"),
    })),
  };
}

function isMultiLevel(configuration: HallConfiguration): configuration is MultiLevelHallConfiguration {
  return "levels" in configuration && Array.isArray(configuration.levels);
}
