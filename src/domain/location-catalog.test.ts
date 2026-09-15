import { describe, expect, it } from "vitest";
import {
  ANGLETON_INVENTORY,
  getHallBySlug,
  getLocationBySlug,
  KATY_INVENTORY,
  LAKE_CONROE_INVENTORY,
  MAGNOLIA_INVENTORY,
  resolveInventoryConfiguration,
  SPRINGS_LOCATIONS,
} from "@/domain/location-catalog";

describe("location catalog", () => {
  it("defines Magnolia with exactly its two confirmed halls", () => {
    expect(SPRINGS_LOCATIONS).toHaveLength(4);
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
      { id: "hall_stonebrook", slug: "stonebrook", name: "Stonebrook" },
      { id: "hall_heritage_pine", slug: "heritage-pine", name: "Heritage Pine" },
    ]);
  });

  it("shares the confirmed 320-chair Lake Conroe inventory across both halls", () => {
    const location = getLocationBySlug("lake-conroe");
    if (!location) throw new Error("Lake Conroe catalog entry missing");

    expect(LAKE_CONROE_INVENTORY).toMatchObject({
      scope: "location-shared",
      limits: { "parson-table-7": 6, "sweetheart-table": 2, chairs: 320 },
    });
    const stonebrook = getHallBySlug(location, "stonebrook")!;
    const heritagePine = getHallBySlug(location, "heritage-pine")!;
    expect(resolveInventoryConfiguration(location, stonebrook)).toEqual({
      "parson-table-7": 6,
      "sweetheart-table": 2,
      chairs: 320,
    });
    expect(resolveInventoryConfiguration(location, heritagePine)).toEqual({
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-36": 5,
      chairs: 320,
    });
    expect(stonebrook.configuration?.inventory?.additionalItems).toEqual([
      expect.objectContaining({ sourceItemKey: "cocktail-table", quantity: 5 }),
    ]);
  });

  it("defines Katy with its two confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("katy");
    expect(location).toMatchObject({ id: "location_katy", name: "Katy" });
    expect(location?.halls).toMatchObject([
      {
        id: "hall_stonecreek_reserve",
        slug: "stonecreek-reserve",
        name: "Stonecreek Reserve",
      },
      { id: "hall_villa_tuscana", slug: "villa-tuscana", name: "Villa Tuscana" },
    ]);
  });

  it("shares the confirmed 320-chair Katy inventory across both halls", () => {
    const location = getLocationBySlug("katy");
    if (!location) throw new Error("Katy catalog entry missing");

    expect(KATY_INVENTORY).toMatchObject({
      scope: "location-shared",
      limits: { "parson-table-7": 5, "sweetheart-table": 2, chairs: 320 },
    });
    expect(KATY_INVENTORY.additionalItems).toEqual([
      expect.objectContaining({ sourceItemKey: "cocktail-table", quantity: 5 }),
    ]);
    for (const hall of location.halls) {
      expect(hall.configuration?.inventory).toBeUndefined();
      expect(resolveInventoryConfiguration(location, hall)).toEqual({
        "parson-table-7": 5,
        "sweetheart-table": 2,
        chairs: 320,
      });
    }
  });

  it("defines Angleton with both confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("angleton");
    expect(location).toMatchObject({ id: "location_angleton", name: "Angleton" });
    expect(location?.halls).toMatchObject([
      { id: "hall_sycamore_grove", slug: "sycamore-grove", name: "Sycamore Grove" },
      { id: "hall_magnolia_manor", slug: "magnolia-manor", name: "Magnolia Manor" },
    ]);
  });

  it("keeps Sycamore Grove inventory hall-specific until Magnolia Manor inventory is confirmed", () => {
    const location = getLocationBySlug("angleton");
    const sycamoreGrove = getHallBySlug(location, "sycamore-grove");
    const magnoliaManor = getHallBySlug(location, "magnolia-manor");
    if (!location || !sycamoreGrove || !magnoliaManor) throw new Error("Angleton catalog entry missing");

    expect(ANGLETON_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "parson-table-7": 6,
        "sweetheart-table": 2,
        "cocktail-table-36": 5,
        chairs: 320,
      },
    });
    expect(location.inventory).toBeUndefined();
    expect(sycamoreGrove.configuration?.inventory).toBe(ANGLETON_INVENTORY);
    expect(resolveInventoryConfiguration(location, sycamoreGrove)).toEqual({
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-36": 5,
      chairs: 320,
    });
    expect(magnoliaManor.configuration?.inventory).toBeUndefined();
    expect(resolveInventoryConfiguration(location, magnoliaManor)).toEqual({});
  });

  it("models Magnolia Manor from its confirmed 67-foot-6-inch measurements", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;

    expect(elements.find((element) => element.id === "magnolia-manor-main-floor")).toMatchObject({
      kind: "area",
      role: "main-floor",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 50, y: 80, width: 810, height: 810 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-entrance-porch")).toMatchObject({
      kind: "area",
      role: "porch",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", height: 92 },
    });
    expect(hall.configuration.floorplanAsset).toBeNull();
  });

  it("stores Magnolia Manor's confirmed permanent fixture dimensions", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;

    expect(elements.find((element) => element.id === "magnolia-manor-bar-counter")).toMatchObject({
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 194, height: 45 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-bar-top")).toMatchObject({
      shape: { type: "rectangle", width: 194, height: 21 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-bar-sink")).toMatchObject({
      shape: { type: "rectangle", width: 76, height: 24 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-buffet")).toMatchObject({
      placementBehavior: "blocked",
      shape: { type: "rectangle", width: 168, height: 48 },
    });
  });

  it("represents Magnolia Manor's staircase measurements and structural pillars", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;

    expect(elements.find((element) => element.id === "magnolia-manor-stair-landing")).toMatchObject({
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 80, height: 79 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-bottom-flight")).toMatchObject({
      width: 113,
      height: 132,
      placementBehavior: "blocked",
    });
    expect(elements.find((element) => element.id === "magnolia-manor-top-railing")).toMatchObject({
      kind: "railing",
      measurementStatus: "confirmed",
      points: [325, 171, 585, 171],
    });
    const hallPillars = elements.filter((element) => element.id.match(/^magnolia-manor-pillar-\d+$/));
    expect(hallPillars).toHaveLength(6);
    expect(hallPillars.every((element) => element.physicalNote?.includes("24 feet 2 inches"))).toBe(true);
    expect(elements.find((element) => element.id === "magnolia-manor-bottom-stair-pillar-west")?.physicalNote).toContain("53 inches tall");
  });

  it("keeps Magnolia Manor's 12-foot second floor separate from its blocked open-to-below", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;
    const secondFloor = elements.filter((element) => element.kind === "area" && element.role === "second-floor");

    expect(secondFloor).toHaveLength(4);
    expect(secondFloor).toEqual(expect.arrayContaining([
      expect.objectContaining({ shape: expect.objectContaining({ width: 810, height: 144 }) }),
      expect.objectContaining({ shape: expect.objectContaining({ width: 144, height: 522 }) }),
    ]));
    expect(elements.find((element) => element.id === "magnolia-manor-open-to-below")).toMatchObject({
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 522, height: 522 },
    });
  });

  it("configures Sycamore Grove with its exact floor scale and raised usable stage", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "sycamore-grove");
    if (!hall?.configuration) throw new Error("Sycamore Grove configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;
    const mainFloor = elements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );

    expect(mainFloor).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 192, y: 60, width: 960, height: 720 },
    });
    expect(elements.find((element) => element.id === "sycamore-grove-stage")).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      elevation: "raised",
    });
    expect(elements.find((element) => element.id === "sycamore-grove-stage-stairs")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.filter((element) => element.kind === "area" && element.role === "closet")).toHaveLength(2);
    expect(elements.find((element) => element.kind === "area" && element.role === "bar")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.find((element) => element.kind === "area" && element.role === "catering")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.filter((element) => element.kind === "stairs")).toHaveLength(2);
    expect(elements.filter((element) => element.kind === "door")).toHaveLength(10);
    expect(elements.filter((element) => element.kind === "direction-label")).toHaveLength(2);
    expect(hall.configuration.floorplanAsset).toBeNull();
  });

  it.each([
    ["stonecreek-reserve", "stonecreek-reserve", 192],
    ["villa-tuscana", "villa-tuscana", 169],
  ])("configures %s with an exact floor scale and raised usable stage", (hallSlug, idPrefix, x) => {
    const location = getLocationBySlug("katy");
    const hall = getHallBySlug(location, hallSlug);
    if (!hall?.configuration) throw new Error(`${hallSlug} configuration missing`);
    const elements = hall.configuration.fixedArchitecturalElements;
    const mainFloor = elements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );

    expect(mainFloor).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x, y: 60, width: 960, height: 720 },
    });
    expect(elements.find((element) => element.id === `${idPrefix}-stage`)).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      elevation: "raised",
    });
    expect(elements.find((element) => element.id === `${idPrefix}-stage-stairs`)).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.filter((element) => element.kind === "area" && element.role === "closet")).toHaveLength(2);
    expect(elements.find((element) => element.kind === "area" && element.role === "bar")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.find((element) => element.kind === "area" && element.role === "catering")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.filter((element) => element.kind === "stairs")).toHaveLength(2);
    expect(elements.filter((element) => element.kind === "door")).toHaveLength(10);
    expect(hall.configuration.floorplanAsset).toBeNull();
  });

  it("configures Stonebrook with its confirmed floor scale and raised stage", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "stonebrook");
    if (!hall?.configuration) throw new Error("Stonebrook configuration missing");
    const elements = hall.configuration.fixedArchitecturalElements;
    const mainFloor = elements.find((element) => element.kind === "area" && element.role === "main-floor");

    expect(mainFloor).toMatchObject({
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 192, y: 60, width: 960, height: 720 },
    });
    expect(elements.find((element) => element.id === "stonebrook-stage")).toMatchObject({
      fixed: true,
      placementBehavior: "allowed",
      elevation: "raised",
    });
    expect(elements.find((element) => element.id === "stonebrook-stage-stairs")).toMatchObject({
      fixed: true,
      placementBehavior: "blocked",
    });
    expect(elements.filter((element) => element.kind === "area" && element.role === "closet")).toHaveLength(2);
    expect(elements.filter((element) => element.kind === "door")).toHaveLength(10);
    expect(hall.configuration.floorplanAsset).toBeNull();
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
    expect(resolveInventoryConfiguration(location, hall)).toEqual({
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-36": 5,
      chairs: 320,
    });
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
      "parson-table-7": 6,
      "sweetheart-table": 1,
      "cocktail-table-32": 6,
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

  it("promotes Magnolia's confirmed Cocktail Tables into selectable inventory", () => {
    expect(MAGNOLIA_INVENTORY.limits["cocktail-table-32"]).toBe(6);
    expect(MAGNOLIA_INVENTORY.additionalItems).toBeUndefined();
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
      "parson-table-7": 6,
      "sweetheart-table": 1,
      "cocktail-table-32": 6,
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
