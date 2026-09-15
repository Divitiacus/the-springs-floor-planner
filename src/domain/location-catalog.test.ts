import { describe, expect, it } from "vitest";
import {
  getHallBySlug,
  getLocationBySlug,
  MAGNOLIA_INVENTORY,
  resolveInventoryConfiguration,
  SPRINGS_LOCATIONS,
} from "@/domain/location-catalog";

describe("location catalog", () => {
  it("defines Magnolia with exactly its two confirmed halls", () => {
    expect(SPRINGS_LOCATIONS).toHaveLength(2);
    expect(SPRINGS_LOCATIONS[0]).toMatchObject({ name: "Magnolia", slug: "magnolia" });
    expect(SPRINGS_LOCATIONS[0].halls.map((hall) => hall.name)).toEqual([
      "Pinehaven Terrace",
      "The Hidden Magnolia",
    ]);
  });

  it("defines Lake Conroe with its two confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("lake-conroe");
    expect(location).toMatchObject({ id: "location_lake_conroe", name: "Lake Conroe" });
    expect(location?.halls).toMatchObject([
      { id: "hall_stonebrook", slug: "stonebrook", name: "Stonebrook", configuration: null },
      { id: "hall_heritage_pine", slug: "heritage-pine", name: "Heritage Pine" },
    ]);
  });

  it("configures Heritage Pine with its confirmed floor scale and chair capacity", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "heritage-pine");
    if (!location || !hall?.configuration) throw new Error("Heritage Pine configuration missing");

    const mainFloor = hall.configuration.fixedArchitecturalElements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );

    expect(mainFloor).toMatchObject({
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 167, y: 60, width: 960, height: 720 },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual({ chairs: 320 });
  });

  it("traces Heritage Pine's identified fixed architecture without a reference image", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "heritage-pine");
    if (!hall?.configuration) throw new Error("Heritage Pine configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;

    expect(hall.configuration.floorplanAsset).toBeNull();
    expect(elements.filter((element) => element.kind === "area" && element.role === "closet")).toHaveLength(2);
    expect(elements.find((element) => element.id === "heritage-pine-buffet")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.find((element) => element.id === "heritage-pine-bar")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.find((element) => element.id === "heritage-pine-stage")).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      elevation: "raised",
    });
    expect(elements.find((element) => element.id === "heritage-pine-stage-stairs")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.filter((element) => element.kind === "door")).toHaveLength(8);
    expect(elements.some((element) => element.id === "heritage-pine-ceremony-label")).toBe(true);
  });

  it("resolves stable route slugs to human-readable catalog entries", () => {
    const location = getLocationBySlug("magnolia");
    const hall = getHallBySlug(location, "pinehaven-terrace");
    expect(location?.id).toBe("location_magnolia");
    expect(hall).toMatchObject({ id: "hall_pinehaven_terrace", name: "Pinehaven Terrace" });
  });

  it("does not resolve a hall outside the selected location", () => {
    expect(getHallBySlug(undefined, "pinehaven-terrace")).toBeUndefined();
  });

  it("shares the calibrated Magnolia geometry with Pinehaven Terrace", () => {
    const pinehaven = SPRINGS_LOCATIONS[0].halls[0].configuration!;
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration!;
    expect(pinehaven).toEqual(hiddenMagnolia);
    expect(pinehaven).toMatchObject({
      physicalWidthInches: 1320,
      physicalHeightInches: 840,
      physicalDimensionStatus: "source-traced",
    });
  });

  it("shares the source-confirmed Magnolia inventory across both halls", () => {
    const magnolia = SPRINGS_LOCATIONS[0];
    const expected = {
      "round-table-60": 32,
      "rectangle-table-6": 4,
      "rectangle-table-8": 6,
      "sweetheart-table": 1,
      chairs: 320,
    };

    expect(MAGNOLIA_INVENTORY).toMatchObject({
      scope: "location-shared",
      limits: expected,
      source: { fileName: "the_springs_table_chair_inventory_from_powerpoints.xlsx" },
    });
    for (const hall of magnolia.halls) {
      expect(hall.configuration?.inventory).toBeUndefined();
      expect(resolveInventoryConfiguration(magnolia, hall)).toEqual(expected);
    }
  });

  it("preserves unsupported Magnolia inventory rows with provenance", () => {
    expect(MAGNOLIA_INVENTORY.additionalItems).toEqual([
      expect.objectContaining({ sourceItemKey: "parson-table-7", quantity: 6 }),
      expect.objectContaining({ sourceItemKey: "cocktail-table-32", quantity: 6 }),
    ]);
  });

  it("allows a future hall inventory to override only its confirmed values", () => {
    const magnolia = SPRINGS_LOCATIONS[0];
    const baseHall = magnolia.halls[0];
    if (!baseHall.configuration) throw new Error("Magnolia hall configuration missing");
    const hallWithOverride = {
      ...baseHall,
      configuration: {
        ...baseHall.configuration,
        inventory: {
          scope: "hall" as const,
          limits: { "round-table-60": 12 },
          source: { fileName: "future-source.xlsx", note: "Confirmed for this hall." },
        },
      },
    };

    expect(resolveInventoryConfiguration(magnolia, hallWithOverride)).toEqual({
      "round-table-60": 12,
      "rectangle-table-6": 4,
      "rectangle-table-8": 6,
      "sweetheart-table": 1,
      chairs: 320,
    });
    expect(resolveInventoryConfiguration(magnolia, baseHall)["round-table-60"]).toBe(32);
  });

  it("keeps the Hidden Magnolia reference image disabled", () => {
    const pinehaven = SPRINGS_LOCATIONS[0].halls[0].configuration!;
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration!;

    expect(pinehaven.floorplanAsset).toBeNull();
    expect(hiddenMagnolia.floorplanAsset).toBeNull();
  });

  it("calibrates the Hidden Magnolia main floor to exact inch coordinates", () => {
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration!;
    const mainFloor = hiddenMagnolia.fixedArchitecturalElements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );

    expect(mainFloor).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 180, y: 60, width: 960, height: 720 },
    });
  });

  it("models fixed architecture separately from placement behavior", () => {
    const elements = SPRINGS_LOCATIONS[0].halls[1].configuration!.fixedArchitecturalElements;
    const stage = elements.find((element) => element.kind === "area" && element.role === "stage");
    const closets = elements.filter((element) => element.kind === "area" && element.role === "closet");
    const catering = elements.find((element) => element.kind === "area" && element.role === "catering");
    const bar = elements.find((element) => element.kind === "area" && element.role === "bar");
    const stairs = elements.filter((element) => element.kind === "stairs");

    expect(stage).toMatchObject({ fixed: true, placementBehavior: "allowed", elevation: "raised" });
    expect(closets).toHaveLength(2);
    for (const element of [...closets, catering, bar, ...stairs]) {
      expect(element).toMatchObject({ fixed: true, placementBehavior: "blocked" });
    }
  });

  it("provides structured polygon, wall, door, and stair rendering inputs", () => {
    const elements = SPRINGS_LOCATIONS[0].halls[1].configuration!.fixedArchitecturalElements;
    const doors = elements.filter((element) => element.kind === "door");
    const stairs = elements.filter((element) => element.kind === "stairs");

    expect(elements.some((element) => element.kind === "area" && element.shape.type === "polygon")).toBe(true);
    expect(elements.filter((element) => element.kind === "wall").length).toBeGreaterThan(0);
    expect(doors.length).toBeGreaterThan(0);
    expect(doors.every((door) => door.measurementStatus === "source-traced" && door.label.includes("provisional"))).toBe(true);
    expect(stairs).toHaveLength(2);
    expect(stairs.every((stair) => stair.treadCount > 1 && stair.placementBehavior === "blocked")).toBe(true);
  });

  it("matches the source-traced exterior door hinges and outward bottom swings", () => {
    const doors = SPRINGS_LOCATIONS[0].halls[1].configuration!.fixedArchitecturalElements.filter(
      (element) => element.kind === "door",
    );
    const bottomDoors = doors.filter((door) => door.y === 780);

    expect(bottomDoors).toMatchObject([
      { x: 180, width: 55, rotation: 0, swingDirection: "clockwise", swingAngle: 32 },
      { x: 617, width: 44, rotation: 0, swingDirection: "clockwise", swingAngle: 42 },
      { x: 705, width: 44, rotation: 180, swingDirection: "counterclockwise", swingAngle: 42 },
      { x: 1210, width: 58, rotation: 0, swingDirection: "clockwise", swingAngle: 32 },
    ]);
  });
});
