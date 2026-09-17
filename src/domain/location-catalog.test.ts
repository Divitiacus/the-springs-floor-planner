import { describe, expect, it } from "vitest";
import { isPositionOnFloor, isRectangleFootprintOnFloor } from "@/domain/floor-regions";
import {
  ALVARADO_TIMBERVIEW_LODGE_INVENTORY,
  ANGLETON_INVENTORY,
  CYPRESS_CHATEAU_INVENTORY,
  DENTON_INVENTORY,
  DENTON_OAKVIEW_LODGE_INVENTORY,
  EDMOND_INVENTORY,
  getHallBySlug,
  getLocationBySlug,
  KATY_INVENTORY,
  LAKE_CONROE_INVENTORY,
  MAGNOLIA_INVENTORY,
  MAGNOLIA_MANOR_INVENTORY,
  MCKINNEY_INVENTORY,
  MCKINNEY_TUSCANY_HILL_INVENTORY,
  NORMAN_INVENTORY,
  ROCKWALL_INVENTORY,
  ROCKWALL_MANOR_INVENTORY,
  isMultiLevelHallConfiguration,
  resolveInventoryConfiguration,
  SPRINGS_LOCATIONS,
  TULSA_INVENTORY,
  type HallConfiguration,
  type SingleLevelHallConfiguration,
  VALLEY_VIEW_INVENTORY,
  WALLISVILLE_FARMHOUSE_INVENTORY,
  WEATHERFORD_PARKER_MANOR_INVENTORY,
  WEATHERFORD_WESTWOOD_RANCH_INVENTORY,
  WHITE_SPARROW_INVENTORY,
} from "@/domain/location-catalog";

describe("location catalog", () => {
  it("defines Magnolia with exactly its two confirmed halls", () => {
    expect(SPRINGS_LOCATIONS).toHaveLength(16);
    expect(SPRINGS_LOCATIONS[0]).toMatchObject({ name: "Magnolia", slug: "magnolia" });
    expect(SPRINGS_LOCATIONS[0].halls.map((hall) => hall.name)).toEqual([
      "Pinehaven Terrace",
      "The Hidden Magnolia",
    ]);
  });

  it("defines Cypress The Chateau with reception levels and a separate ceremony site", () => {
    const location = getLocationBySlug("cypress");
    const hall = getHallBySlug(location, "the-chateau");
    if (!location || !hall?.configuration) throw new Error("Cypress The Chateau configuration missing");

    expect(location).toMatchObject({ id: "location_cypress", name: "Cypress" });
    expect(hall).toMatchObject({ id: "hall_the_chateau_cypress", name: "The Chateau" });
    expect(CYPRESS_CHATEAU_INVENTORY.limits).toEqual({
      "round-table-72": 30,
      "round-table-48": 2,
      "round-table-60": 20,
      "rectangle-table-6": 6,
      "rectangle-table-8": 12,
      "sweetheart-table": 1,
      "cocktail-table-36": 8,
      chairs: 320,
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(CYPRESS_CHATEAU_INVENTORY.limits);

    if (!isMultiLevelHallConfiguration(hall.configuration)) throw new Error("Cypress must use multi-level configuration");
    const levels = hall.configuration.levels;
    expect(hall.configuration.defaultLevelId).toBe("level-1-main-floor");
    expect(levels.map((level) => [level.id, level.slug, level.name])).toEqual([
      ["level-1-main-floor", "main-floor", "Level 1 — Main Floor"],
      ["level-2-balcony", "balcony", "Level 2 — Balcony"],
      ["ceremony-site", "ceremony-site", "Ceremony Site"],
      ["patio", "patio", "Patio"],
    ]);
    expect(levels.slice(0, 2).every((level) => level.physicalWidthInches === 1840 && level.physicalHeightInches === 980)).toBe(true);

    const mainFloor = levels.find((level) => level.id === "level-1-main-floor");
    if (!mainFloor) throw new Error("Cypress main-floor level missing");
    const elements = mainFloor.fixedArchitecturalElements;
    expect(elements.find((element) => element.id === "chateau-main-floor")).toMatchObject({
      kind: "area",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 660, height: 828 },
    });
    expect(elements.find((element) => element.id === "chateau-stage")).toMatchObject({
      kind: "path",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      elevation: "raised",
    });
    expect(elements.filter((element) => element.kind === "path").length).toBeGreaterThan(20);
    expect(elements.find((element) => element.id === "chateau-permanent-bar")).toMatchObject({
      role: "bar",
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
    });
    expect(elements.find((element) => element.id === "chateau-buffet-room")).toMatchObject({
      role: "buffet",
      placementBehavior: "blocked",
      shape: { type: "rectangle", width: 288, height: 228 },
    });
    expect(elements.filter((element) => element.kind === "area" && element.role === "pillar")).toHaveLength(10);
    expect(elements.find((element) => element.id === "chateau-rotunda-floor")).toMatchObject({
      kind: "path",
      placementBehavior: "allowed",
    });
    expect(elements.some((element) => element.id.includes("balcony-overhead"))).toBe(false);
    expect(elements.find((element) => element.id === "chateau-west-restrooms")).toBeUndefined();
    expect(elements.find((element) => element.id === "chateau-east-meeting-office")).toBeUndefined();
    expect(mainFloor.floorplanAsset).toMatchObject({
      source: "/floorplans/cypress/main-floor.jpg",
      sourceDocument: "Main Floor.jpg",
      visualRole: "architectural-base",
      visibleByDefault: true,
      locked: true,
      interactive: false,
    });
    expect(mainFloor.floorplanAsset!.width / mainFloor.floorplanAsset!.height).toBeCloseTo(1837 / 945, 8);

    const balcony = levels.find((level) => level.id === "level-2-balcony");
    expect(balcony?.floorplanAsset).toMatchObject({
      source: "/floorplans/cypress/balcony.jpg",
      sourceDocument: "Balcony.jpg",
      visualRole: "architectural-base",
      visibleByDefault: true,
      locked: true,
      interactive: false,
    });
    expect(balcony!.floorplanAsset!.width / balcony!.floorplanAsset!.height).toBeCloseTo(1840 / 960, 8);
    expect(balcony?.usableAreas?.find((region) => region.id === "chateau-level-2-main-balcony-north")).toMatchObject({
      kind: "usable-floor",
      placementBehavior: "allowed",
    });
    expect(balcony?.voidAreas?.find((region) => region.id === "chateau-level-2-main-hall-void")).toMatchObject({
      kind: "open-to-below",
      placementBehavior: "blocked",
    });
    expect(balcony?.voidAreas?.find((region) => region.id === "chateau-level-2-rotunda-void")).toMatchObject({
      kind: "open-to-below",
      placementBehavior: "blocked",
    });
    expect(balcony?.fixedArchitecturalElements.some((element) => element.kind === "area" && element.role === "second-floor")).toBe(false);
    expect(balcony?.fixedArchitecturalElements.some((element) => element.id === "chateau-stage")).toBe(false);
    if (!balcony) throw new Error("Cypress balcony level missing");
    expect(isPositionOnFloor({ x: 900, y: 145 }, balcony.usableAreas ?? [], balcony.voidAreas ?? [])).toBe(true);
    expect(isPositionOnFloor({ x: 1100, y: 450 }, balcony.usableAreas ?? [], balcony.voidAreas ?? [])).toBe(false);
    expect(isPositionOnFloor({ x: 530, y: 365 }, balcony.usableAreas ?? [], balcony.voidAreas ?? [])).toBe(false);

    const ceremonySite = levels.find((level) => level.id === "ceremony-site");
    if (!ceremonySite) throw new Error("Cypress ceremony site missing");
    expect(mainFloor.inventoryGroupId).toBe("reception");
    expect(balcony.inventoryGroupId).toBe("reception");
    expect(ceremonySite).toMatchObject({
      inventoryGroupId: "ceremony",
      physicalWidthInches: 960,
      physicalHeightInches: 780,
      planningBounds: { x: 95, y: 55, width: 769, height: 670.5 },
      floorplanAsset: null,
    });
    expect(ceremonySite.usableAreas?.map((region) => region.id)).toEqual([
      "chateau-ceremony-left-seating",
      "chateau-ceremony-right-seating",
    ]);
    expect(ceremonySite.fixedArchitecturalElements.find((element) => element.id === "chateau-ceremony-platform")).toMatchObject({
      kind: "path",
      placementBehavior: "blocked",
      elevation: "raised",
    });
    expect(ceremonySite.fixedArchitecturalElements.some((element) => element.label === "Wall Fountain")).toBe(false);
    expect(ceremonySite.fixedArchitecturalElements.some((element) => element.id === "chateau-ceremony-center-aisle")).toBe(false);
    expect(ceremonySite.usableAreas?.every((region) => region.shape.type === "polygon")).toBe(true);
    expect(isPositionOnFloor({ x: 260, y: 150 }, ceremonySite.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 380, y: 150 }, ceremonySite.usableAreas ?? [], [])).toBe(false);
    expect(isPositionOnFloor({ x: 580, y: 150 }, ceremonySite.usableAreas ?? [], [])).toBe(false);
    expect(isPositionOnFloor({ x: 700, y: 150 }, ceremonySite.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 260, y: 630 }, ceremonySite.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 480, y: 630 }, ceremonySite.usableAreas ?? [], [])).toBe(false);
    expect(isPositionOnFloor({ x: 260, y: 320 }, ceremonySite.usableAreas ?? [], ceremonySite.voidAreas ?? [])).toBe(true);
    expect(isPositionOnFloor({ x: 480, y: 320 }, ceremonySite.usableAreas ?? [], ceremonySite.voidAreas ?? [])).toBe(false);
    expect(isRectangleFootprintOnFloor({ x: 293, y: 320 }, 180, 22, 0, ceremonySite.usableAreas ?? [], [])).toBe(true);
    expect(isRectangleFootprintOnFloor({ x: 430, y: 320 }, 300, 22, 0, ceremonySite.usableAreas ?? [], [])).toBe(false);

    const patio = levels.find((level) => level.id === "patio");
    if (!patio) throw new Error("Cypress patio missing");
    expect(patio).toMatchObject({
      inventoryGroupId: "reception",
      physicalWidthInches: 1040,
      physicalHeightInches: 540,
      planningBounds: { x: 70, y: 70, width: 900, height: 348 },
      floorplanAsset: null,
    });
    expect(patio.usableAreas?.map((region) => region.id)).toEqual([
      "chateau-patio-main-dining-surface",
      "chateau-patio-raised-seating",
    ]);
    expect(patio.usableAreas?.[0]).toMatchObject({
      id: "chateau-patio-main-dining-surface",
      kind: "usable-floor",
      measurementStatus: "confirmed",
      shape: { type: "polygon" },
    });
    expect(patio.fixedArchitecturalElements.find((element) => element.id === "chateau-patio-building-facade")).toMatchObject({
      kind: "path",
      placementBehavior: "blocked",
    });
    expect(isPositionOnFloor({ x: 240, y: 240 }, patio.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 240, y: 350 }, patio.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 240, y: 275 }, patio.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 520, y: 250 }, patio.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 520, y: 350 }, patio.usableAreas ?? [], [])).toBe(false);
    expect(isRectangleFootprintOnFloor({ x: 260, y: 250 }, 180, 22, 0, patio.usableAreas ?? [], [])).toBe(true);
    expect(isRectangleFootprintOnFloor({ x: 520, y: 250 }, 100, 22, 0, patio.usableAreas ?? [], [])).toBe(true);
    expect(isRectangleFootprintOnFloor({ x: 520, y: 330 }, 180, 22, 0, patio.usableAreas ?? [], [])).toBe(false);
  });

  it("defines Wallisville Farmhouse with stable routing, confirmed scale, and a 250-guest planning limit", () => {
    const location = getLocationBySlug("wallisville");
    const hall = getHallBySlug(location, "farmhouse");
    if (!location || !hall?.configuration) throw new Error("Wallisville Farmhouse configuration missing");

    expect(location).toMatchObject({ id: "location_wallisville", name: "Wallisville" });
    expect(hall).toMatchObject({ id: "hall_farmhouse_wallisville", name: "Farmhouse" });
    expect(WALLISVILLE_FARMHOUSE_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-48": 2,
        "round-table-60": 30,
        "rectangle-table-6": 4,
        "rectangle-table-8": 4,
        "farmhouse-table-6": 5,
        "parson-table-7": 4,
        "cocktail-table-32": 5,
        "cocktail-table-36": 2,
        chairs: 250,
      },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual({
      "round-table-48": 2,
      "round-table-60": 30,
      "rectangle-table-6": 4,
      "rectangle-table-8": 4,
      "farmhouse-table-6": 5,
      "parson-table-7": 4,
      "cocktail-table-32": 5,
      "cocktail-table-36": 2,
      chairs: 250,
    });

    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
    expect(elements.find((element) => element.id === "farmhouse-wallisville-main-floor")).toMatchObject({
      kind: "area",
      role: "main-floor",
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      showOutline: false,
      shape: { type: "rectangle", width: 1056, height: 525 },
    });
    expect(elements.find((element) => element.id === "farmhouse-wallisville-upper-extension")).toMatchObject({
      role: "event-floor-extension",
      placementBehavior: "allowed",
      showOutline: false,
      shape: { type: "rectangle", width: 384, height: 336 },
    });
    expect(elements.find((element) => element.id === "farmhouse-wallisville-service-wing")).toMatchObject({
      role: "catering",
      placementBehavior: "blocked",
      shape: { type: "rectangle", width: 336, height: 315 },
    });
    expect(elements.find((element) => element.id === "farmhouse-wallisville-stairs")).toMatchObject({
      kind: "stairs",
      placementBehavior: "blocked",
      width: 72,
      height: 192,
      curvedTop: true,
      y: 709,
    });
    expect(hall.configuration).toMatchObject({ physicalHeightInches: 1256 });
    expect(singleLevel(hall.configuration).floorplanAsset).toBeNull();
  });

  it("defines Lake Conroe with its two confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("lake-conroe");
    expect(location).toMatchObject({ id: "location_lake_conroe", name: "Lake Conroe" });
    expect(location?.halls).toMatchObject([
      { id: "hall_stonebrook", slug: "stonebrook", name: "Stonebrook" },
      { id: "hall_heritage_pine", slug: "heritage-pine", name: "Heritage Pine" },
    ]);
  });

  it("shares the Houston-region Lake Conroe inventory across both halls", () => {
    const location = getLocationBySlug("lake-conroe");
    if (!location) throw new Error("Lake Conroe catalog entry missing");

    expect(LAKE_CONROE_INVENTORY).toMatchObject({
      scope: "location-shared",
      limits: {
        "round-table-60": 40,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "farmhouse-table-6": 0,
        "parson-table-7": 6,
        "sweetheart-table": 2,
        "cocktail-table-32": 0,
        "cocktail-table-36": 5,
        chairs: 320,
      },
    });
    const stonebrook = getHallBySlug(location, "stonebrook")!;
    const heritagePine = getHallBySlug(location, "heritage-pine")!;
    expect(resolveInventoryConfiguration(location, stonebrook)).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 2,
      "rectangle-table-8": 6,
      "farmhouse-table-6": 0,
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-32": 0,
      "cocktail-table-36": 5,
      chairs: 320,
    });
    expect(resolveInventoryConfiguration(location, heritagePine)).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 2,
      "rectangle-table-8": 6,
      "farmhouse-table-6": 0,
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-32": 0,
      "cocktail-table-36": 5,
      chairs: 320,
    });
    expect(stonebrook.configuration?.inventory).toBeUndefined();
    expect(heritagePine.configuration?.inventory).toBeUndefined();
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

  it("shares the Houston-region Katy inventory across both halls", () => {
    const location = getLocationBySlug("katy");
    if (!location) throw new Error("Katy catalog entry missing");

    expect(KATY_INVENTORY).toMatchObject({
      scope: "location-shared",
      limits: {
        "round-table-60": 32,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "farmhouse-table-6": 1,
        "parson-table-7": 6,
        "sweetheart-table": 2,
        "cocktail-table-32": 0,
        "cocktail-table-36": 5,
        chairs: 320,
      },
    });
    for (const hall of location.halls) {
      expect(hall.configuration?.inventory).toBeUndefined();
      expect(resolveInventoryConfiguration(location, hall)).toEqual({
        "round-table-60": 32,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "farmhouse-table-6": 1,
        "parson-table-7": 6,
        "sweetheart-table": 2,
        "cocktail-table-32": 0,
        "cocktail-table-36": 5,
        chairs: 320,
      });
    }
  });

  it("defines Denton with both halls and stable route slugs", () => {
    const location = getLocationBySlug("denton");
    const hall = getHallBySlug(location, "hidden-springs-ranch");
    const oakview = getHallBySlug(location, "oakview-lodge");

    expect(location).toMatchObject({ id: "location_denton", name: "Denton" });
    expect(location?.halls).toHaveLength(2);
    expect(hall).toMatchObject({
      id: "hall_hidden_springs_ranch",
      slug: "hidden-springs-ranch",
      name: "Hidden Springs Ranch",
    });
    expect(oakview).toMatchObject({
      id: "hall_oakview_lodge",
      slug: "oakview-lodge",
      name: "Oakview Lodge",
    });
  });

  it("defines Alvarado Timberview Lodge with independent temporary Lodge inventory", () => {
    const location = getLocationBySlug("alvarado");
    const hall = getHallBySlug(location, "timberview-lodge");
    if (!location || !hall?.configuration) throw new Error("Alvarado Timberview Lodge configuration missing");

    expect(location).toMatchObject({ id: "location_alvarado", slug: "alvarado", name: "Alvarado" });
    expect(hall).toMatchObject({ id: "hall_timberview_lodge", slug: "timberview-lodge", name: "Timberview Lodge" });
    expect(ALVARADO_TIMBERVIEW_LODGE_INVENTORY).not.toBe(DENTON_OAKVIEW_LODGE_INVENTORY);
    expect(ALVARADO_TIMBERVIEW_LODGE_INVENTORY.limits).not.toBe(DENTON_OAKVIEW_LODGE_INVENTORY.limits);
    expect(ALVARADO_TIMBERVIEW_LODGE_INVENTORY.limits).toEqual(DENTON_OAKVIEW_LODGE_INVENTORY.limits);
    expect(resolveInventoryConfiguration(location, hall)).toEqual(ALVARADO_TIMBERVIEW_LODGE_INVENTORY.limits);

    const configuration = singleLevel(hall.configuration);
    const elements = configuration.fixedArchitecturalElements;
    expect(configuration).toMatchObject({
      physicalWidthInches: 1513,
      physicalHeightInches: 1048,
      physicalDimensionStatus: "source-traced",
      planningBounds: { x: 55, y: 55, width: 1403, height: 938 },
      floorplanAsset: null,
    });
    expect(configuration.usableAreas).toHaveLength(3);
    expect(elements.every((element) => element.id.startsWith("timberview-lodge"))).toBe(true);
    expect(elements.some((element) => element.id.includes("oakview-lodge"))).toBe(false);
    expect(elements.find((element) => element.id === "timberview-lodge-bar")).toMatchObject({
      role: "bar",
      measurementStatus: "source-traced",
      shape: { type: "rectangle", width: 262, height: 159 },
    });
    expect(elements.find((element) => element.id === "timberview-lodge-buffet")).toMatchObject({
      role: "buffet",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 168, height: 50 },
    });
    expect(elements.find((element) => element.id === "timberview-lodge-double-sided-fireplace")).toMatchObject({
      role: "fireplace",
      measurementStatus: "source-traced",
      shape: { type: "rectangle", width: 62, height: 139 },
    });
    expect(elements.find((element) => element.id === "timberview-lodge-west-window-bar-area")).toBeUndefined();
    expect(elements.find((element) => element.id === "timberview-lodge-east-reception-wall")).toBeUndefined();
    expect(elements.find((element) => element.id === "timberview-lodge-closet-extension-wall")).toBeUndefined();
    expect(elements.filter((element) => element.kind === "door")).toHaveLength(5);
    expect(elements.filter((element) => element.kind === "door").every((element) => element.rotation % 90 === 0)).toBe(true);
    expect(isPositionOnFloor({ x: 760, y: 520 }, configuration.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 820, y: 280 }, configuration.usableAreas ?? [], [])).toBe(true);
    expect(isPositionOnFloor({ x: 650, y: 95 }, configuration.usableAreas ?? [], [])).toBe(false);
  });

  it.each([
    ["tulsa", "location_tulsa", "sunset-pointe", "hall_sunset_pointe", "Sunset Pointe", TULSA_INVENTORY, "sunset-pointe"],
    ["edmond", "location_edmond", "willowbrook-reserve", "hall_willowbrook_reserve", "Willowbrook Reserve", EDMOND_INVENTORY, "willowbrook-reserve"],
  ])(
    "defines %s with an independent Stonecreek Reserve clone and configured inventory",
    (locationSlug, locationId, hallSlug, hallId, hallName, inventory, elementPrefix) => {
      const location = getLocationBySlug(locationSlug);
      const hall = getHallBySlug(location, hallSlug);
      if (!location || !hall?.configuration) throw new Error(`${hallName} configuration missing`);

      expect(location).toMatchObject({ id: locationId, slug: locationSlug });
      expect(hall).toMatchObject({ id: hallId, slug: hallSlug, name: hallName });
      expect(inventory).toMatchObject({ scope: "hall" });
      expect(resolveInventoryConfiguration(location, hall)).toEqual(inventory.limits);

      const configuration = singleLevel(hall.configuration);
      expect(configuration).toMatchObject({
        physicalWidthInches: 1320,
        physicalHeightInches: 840,
        physicalDimensionStatus: "source-traced",
      });
      expect(configuration.fixedArchitecturalElements.find((element) => element.id === `${elementPrefix}-main-floor`)).toMatchObject({
        kind: "area",
        role: "main-floor",
        measurementStatus: "confirmed",
        shape: { type: "rectangle", x: 192, y: 60, width: 960, height: 720 },
      });
      expect(configuration.fixedArchitecturalElements.every((element) => element.id.startsWith(elementPrefix))).toBe(true);
      expect(configuration.fixedArchitecturalElements.some((element) => element.id.includes("stonecreek-reserve"))).toBe(false);
      expect(configuration.floorplanAsset).toBeNull();
    },
  );

  it("uses Sunset Pointe's confirmed Tulsa table counts and side-only rectangle seating", () => {
    const location = getLocationBySlug("tulsa");
    const hall = getHallBySlug(location, "sunset-pointe");
    if (!location || !hall) throw new Error("Sunset Pointe configuration missing");

    expect(resolveInventoryConfiguration(location, hall)).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 10,
      "rectangle-table-8": 8,
      "parson-table-7": 6,
      "sweetheart-table-32": 2,
      "half-moon-table": 1,
      "cocktail-table-32": 8,
      chairs: 320,
      defaultSeats: {
        "rectangle-table-6": 6,
        "rectangle-table-8": 8,
      },
    });
  });

  it("defines McKinney Havenstone Reserve with the Villa Tuscana footprint and inventory", () => {
    const location = getLocationBySlug("mckinney");
    const hall = getHallBySlug(location, "havenstone-reserve");
    if (!location || !hall?.configuration) throw new Error("McKinney Havenstone Reserve configuration missing");

    expect(location).toMatchObject({ id: "location_mckinney", slug: "mckinney", name: "McKinney" });
    expect(location.halls.map((candidate) => [candidate.slug, candidate.name])).toEqual([
      ["havenstone-reserve", "Havenstone Reserve"],
      ["tuscany-hill", "Tuscany Hill"],
    ]);
    expect(hall).toMatchObject({
      id: "hall_havenstone_reserve",
      slug: "havenstone-reserve",
      name: "Havenstone Reserve",
    });
    expect(MCKINNEY_INVENTORY).toMatchObject({
      scope: "hall",
      limits: KATY_INVENTORY.limits,
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(KATY_INVENTORY.limits);

    const configuration = singleLevel(hall.configuration);
    expect(configuration).toMatchObject({
      physicalWidthInches: 1320,
      physicalHeightInches: 840,
      physicalDimensionStatus: "source-traced",
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "havenstone-reserve-main-floor")).toMatchObject({
      kind: "area",
      role: "main-floor",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 169, y: 60, width: 960, height: 720 },
    });
    expect(configuration.fixedArchitecturalElements.every((element) => element.id.startsWith("havenstone-reserve"))).toBe(true);
    expect(configuration.fixedArchitecturalElements.some((element) => element.id.includes("villa-tuscana"))).toBe(false);
    expect(configuration.floorplanAsset).toBeNull();
  });

  it("defines McKinney Tuscany Hill with Parker Manor's inventory, a north fireplace, and rounded porch", () => {
    const location = getLocationBySlug("mckinney");
    const hall = getHallBySlug(location, "tuscany-hill");
    if (!location || !hall?.configuration) throw new Error("McKinney Tuscany Hill configuration missing");

    expect(hall).toMatchObject({ id: "hall_tuscany_hill", slug: "tuscany-hill", name: "Tuscany Hill" });
    expect(MCKINNEY_TUSCANY_HILL_INVENTORY).toMatchObject({
      scope: "hall",
      limits: WEATHERFORD_PARKER_MANOR_INVENTORY.limits,
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(WEATHERFORD_PARKER_MANOR_INVENTORY.limits);
    if (!isMultiLevelHallConfiguration(hall.configuration)) throw new Error("Tuscany Hill must use multi-level configuration");

    const [downstairs, upstairs] = hall.configuration.levels;
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "tuscany-hill-fireplace")).toMatchObject({
      kind: "area",
      role: "fireplace",
      label: "FIREPLACE",
      shape: { type: "rectangle", x: 392, y: 94, width: 126, height: 43 },
    });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "tuscany-hill-mantle")).toMatchObject({
      shape: { type: "rectangle", x: 391, y: 80, width: 128, height: 14 },
    });
    expect(downstairs.fixedArchitecturalElements.some((element) => element.id.includes("pavilion-door"))).toBe(false);
    expect(downstairs.fixedArchitecturalElements.some((element) => element.id.includes("main-entrance-label"))).toBe(false);
    expect(downstairs.fixedArchitecturalElements.some((element) => element.id.includes("reception-label"))).toBe(false);
    expect(downstairs.fixedArchitecturalElements.some((element) => element.id.includes("overhang-label"))).toBe(false);
    expect(downstairs.fixedArchitecturalElements.filter((element) =>
      element.id === "tuscany-hill-main-entrance-west" || element.id === "tuscany-hill-main-entrance-east"
    )).toMatchObject([
      { x: 407, y: 890, width: 48, rotation: 0, swingDirection: "clockwise" },
      { x: 503, y: 890, width: 48, rotation: 180, swingDirection: "counterclockwise" },
    ]);
    expect(downstairs.fixedArchitecturalElements.filter((element) =>
      element.id === "tuscany-hill-main-entrance-north" || element.id === "tuscany-hill-main-entrance-south"
    )).toMatchObject([
      { x: 860, y: 485, width: 48, rotation: -90, swingDirection: "clockwise" },
      { x: 860, y: 485, width: 48, rotation: 90, swingDirection: "counterclockwise" },
    ]);
    expect(downstairs.fixedArchitecturalElements.some((element) => element.id.includes("rounded-porch"))).toBe(false);
    expect(upstairs.physicalWidthInches).toBe(1040);
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "tuscany-hill-upstairs-rounded-porch")).toMatchObject({
      kind: "path",
      placementBehavior: "restricted",
    });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "tuscany-hill-upstairs-porch-door")).toMatchObject({
      kind: "door",
      x: 860,
      rotation: 90,
    });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "tuscany-hill-upstairs-fireplace")).toMatchObject({
      label: "FIREPLACE",
      shape: { type: "rectangle", x: 392, y: 80, width: 126, height: 43 },
    });
    expect(upstairs.fixedArchitecturalElements.some((element) => element.id === "tuscany-hill-upstairs-label")).toBe(false);
    expect(upstairs.fixedArchitecturalElements.some((element) => element.id.includes("full-balcony"))).toBe(false);
    expect(upstairs.fixedArchitecturalElements.some((element) => element.id.includes("juliet-balcony"))).toBe(false);
    expect(upstairs.voidAreas?.map((region) => region.id)).toEqual(["tuscany-hill-level-2-open-to-below"]);
    expect(hall.configuration.levels.every((level) =>
      level.fixedArchitecturalElements.every((element) => element.id.startsWith("tuscany-hill")),
    )).toBe(true);
  });

  it("defines Valley View with its traced floor shape and supplied table inventory", () => {
    const location = getLocationBySlug("valley-view");
    const hall = getHallBySlug(location, "valley-view");
    if (!location || !hall?.configuration) throw new Error("Valley View configuration missing");

    expect(location).toMatchObject({ id: "location_valley_view", slug: "valley-view", name: "Valley View" });
    expect(hall).toMatchObject({ id: "hall_valley_view", slug: "valley-view", name: "Valley View" });
    expect(VALLEY_VIEW_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-60": 28,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "parson-table-7": 2,
        "sweetheart-table": 2,
        "cocktail-table-32": 6,
        chairs: 224,
      },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(VALLEY_VIEW_INVENTORY.limits);
    expect(resolveInventoryConfiguration(location, hall).chairs).toBe(224);

    const configuration = singleLevel(hall.configuration);
    expect(configuration).toMatchObject({
      physicalWidthInches: 1492,
      physicalHeightInches: 1111,
      physicalDimensionStatus: "source-traced",
      planningBounds: { x: 50, y: 50, width: 1392, height: 1011 },
    });
    expect(configuration.usableAreas).toHaveLength(3);
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-main-floor")).toMatchObject({
      kind: "area",
      role: "main-floor",
      placementBehavior: "allowed",
      showOutline: false,
      shape: { type: "rectangle", x: 50, y: 351, width: 1392, height: 412 },
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-north-floor")).toMatchObject({
      role: "event-floor-extension",
      shape: { type: "rectangle", x: 523, y: 50, width: 798, height: 301 },
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-south-floor")).toMatchObject({
      role: "event-floor-extension",
      shape: { type: "rectangle", x: 764, y: 763, width: 557, height: 298 },
    });
    expect(configuration.fixedArchitecturalElements.filter((element) => element.kind === "area" && element.role === "pillar")).toHaveLength(4);
    expect(configuration.fixedArchitecturalElements.filter((element) => element.id.startsWith("valley-view-suite-fixture-"))).toHaveLength(6);
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-suite-fixture-1")).toMatchObject({
      kind: "path",
      data: "M 575 50 H 652 V 92 H 575 Z",
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-suite-fixture-3")).toMatchObject({
      kind: "path",
      data: "M 586 152 H 664 V 194 H 586 Z",
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-suite-fixture-6")).toMatchObject({
      kind: "path",
      data: "M 635 289 H 747 V 322 H 635 Z",
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-suite-platform")).toMatchObject({
      kind: "path",
      label: "Fixed platform",
      fill: "#fffdfa",
    });
    expect(configuration.fixedArchitecturalElements.find((element) => element.id === "valley-view-upper-stair-landing")).toMatchObject({
      kind: "path",
      data: "M 381 351 H 431 V 467 H 381 Z",
    });
    expect(configuration.fixedArchitecturalElements.some((element) => element.label.toLowerCase().includes("chapel"))).toBe(false);
    expect(configuration.fixedArchitecturalElements.every((element) => element.id.startsWith("valley-view"))).toBe(true);
    expect(configuration.floorplanAsset).toBeNull();
  });

  it("gives Hidden Springs Ranch its confirmed Denton inventory and architecture IDs", () => {
    const location = getLocationBySlug("denton");
    const hall = getHallBySlug(location, "hidden-springs-ranch");
    if (!location || !hall?.configuration) throw new Error("Denton Hidden Springs Ranch configuration missing");

    expect(DENTON_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-60": 40,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "farmhouse-table-6": 0,
        "parson-table-7": 6,
        "sweetheart-table": 2,
        "sweetheart-table-48": 1,
        "cocktail-table-32": 6,
        "cocktail-table-36": 0,
        chairs: 320,
      },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(DENTON_INVENTORY.limits);

    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
    expect(elements.every((element) => element.id.startsWith("hidden-springs-ranch"))).toBe(true);
    expect(elements.some((element) => element.id.includes("stonecreek-reserve"))).toBe(false);
  });

  it("gives Oakview Lodge its confirmed 224-seat inventory and measured fixed features", () => {
    const location = getLocationBySlug("denton");
    const hall = getHallBySlug(location, "oakview-lodge");
    if (!location || !hall?.configuration) throw new Error("Denton Oakview Lodge configuration missing");

    expect(DENTON_OAKVIEW_LODGE_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-60": 28,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "farmhouse-table-6": 0,
        "parson-table-7": 5,
        "sweetheart-table": 2,
        "sweetheart-table-48": 1,
        "cocktail-table-32": 6,
        "cocktail-table-36": 0,
        chairs: 224,
      },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(DENTON_OAKVIEW_LODGE_INVENTORY.limits);

    const configuration = singleLevel(hall.configuration);
    const elements = configuration.fixedArchitecturalElements;
    expect(configuration).toMatchObject({
      physicalWidthInches: 1436,
      physicalHeightInches: 926,
      physicalDimensionStatus: "source-traced",
      planningBounds: { x: 50, y: 50, width: 1336, height: 826 },
    });
    expect(elements.every((element) => element.id.startsWith("oakview-lodge"))).toBe(true);
    expect(elements.find((element) => element.id === "oakview-lodge-main-floor")).toMatchObject({
      measurementStatus: "source-traced",
      showOutline: false,
      shape: { type: "rectangle", x: 50, y: 212, width: 1336, height: 533 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-buffet-wing-floor")).toMatchObject({
      showOutline: false,
      shape: { type: "rectangle", x: 170, y: 50, width: 264, height: 162 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-upper-alcove-floor")).toMatchObject({
      showOutline: false,
      shape: { type: "rectangle", x: 633, y: 82, width: 364, height: 130 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-south-alcove-floor")).toMatchObject({
      showOutline: false,
      shape: { type: "rectangle", x: 624, y: 745, width: 374, height: 131 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-buffet")).toMatchObject({
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 141.5, height: 36 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-bar")).toMatchObject({
      measurementStatus: "source-traced",
      role: "bar",
      label: "BAR",
      shape: { type: "rectangle", width: 85, height: 117 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-center-stair-flight")).toMatchObject({
      kind: "stairs",
      width: 132,
      height: 89,
    });
    expect(elements.find((element) => element.id === "oakview-lodge-upper-stair-flight")).toBeUndefined();
    expect(elements.find((element) => element.id === "oakview-lodge-stair-landing")).toBeUndefined();
    expect(elements.find((element) => element.id === "oakview-lodge-upstairs-label")).toMatchObject({
      kind: "label",
      label: "UPSTAIRS",
    });
    expect(elements.find((element) => element.id === "oakview-lodge-lower-stair-flight")).toBeUndefined();
    expect(elements.find((element) => element.id === "oakview-lodge-stair-west-rail")).toBeUndefined();
    expect(elements.find((element) => element.id === "oakview-lodge-room-label")).toBeUndefined();
    expect(elements.find((element) => element.id === "oakview-lodge-alcove-label")).toBeUndefined();
    expect(elements.find((element) => element.id === "oakview-lodge-kitchen-door")).toMatchObject({ kind: "door" });
    expect(elements.filter((element) => element.id.includes("patio-door"))).toHaveLength(4);
    expect(elements.find((element) => element.id === "oakview-lodge-perimeter-wall")).toMatchObject({ kind: "wall" });
    expect(configuration.usableAreas).toHaveLength(4);
    expect(elements.find((element) => element.id === "oakview-lodge-fireplace-stone")).toMatchObject({
      shape: { type: "rectangle", width: 26, height: 122 },
    });
    expect(elements.find((element) => element.id === "oakview-lodge-mantle")).toMatchObject({
      shape: { type: "rectangle", width: 14.5, height: 82.5 },
    });
  });

  it("defines Rockwall with both confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("rockwall");
    const hall = getHallBySlug(location, "poetry-springs");

    expect(location).toMatchObject({ id: "location_rockwall", name: "Rockwall" });
    expect(location?.halls).toMatchObject([
      { id: "hall_poetry_springs", slug: "poetry-springs", name: "Poetry Springs" },
      { id: "hall_rockwall_manor", slug: "rockwall-manor", name: "Rockwall Manor" },
    ]);
    expect(hall).toMatchObject({
      id: "hall_poetry_springs",
      slug: "poetry-springs",
      name: "Poetry Springs",
    });
  });

  it("gives Poetry Springs the Heritage Pine inventory and Rockwall-specific architecture IDs", () => {
    const location = getLocationBySlug("rockwall");
    const hall = getHallBySlug(location, "poetry-springs");
    if (!location || !hall?.configuration) throw new Error("Rockwall Poetry Springs configuration missing");

    expect(ROCKWALL_INVENTORY).toMatchObject({
      scope: "hall",
      limits: { ...LAKE_CONROE_INVENTORY.limits, chairs: 320 },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(LAKE_CONROE_INVENTORY.limits);

    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
    expect(elements.every((element) => element.id.startsWith("poetry-springs"))).toBe(true);
    expect(elements.some((element) => element.id.includes("heritage-pine"))).toBe(false);
  });

  it("defines Angleton with both confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("angleton");
    expect(location).toMatchObject({ id: "location_angleton", name: "Angleton" });
    expect(location?.halls).toMatchObject([
      { id: "hall_sycamore_grove", slug: "sycamore-grove", name: "Sycamore Grove" },
      { id: "hall_magnolia_manor", slug: "magnolia-manor", name: "Magnolia Manor" },
    ]);
  });

  it("defines Weatherford with both confirmed halls and stable route slugs", () => {
    const location = getLocationBySlug("weatherford");

    expect(location).toMatchObject({ id: "location_weatherford", name: "Weatherford" });
    expect(location?.halls).toMatchObject([
      { id: "hall_parker_manor", slug: "parker-manor", name: "Parker Manor" },
      { id: "hall_westwood_ranch", slug: "westwood-ranch", name: "Westwood Ranch" },
    ]);
  });

  it("gives Westwood Ranch its supplied table counts and curved stage steps", () => {
    const location = getLocationBySlug("weatherford");
    const hall = getHallBySlug(location, "westwood-ranch");
    if (!location || !hall?.configuration) throw new Error("Weatherford Westwood Ranch configuration missing");

    expect(WEATHERFORD_WESTWOOD_RANCH_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-60": 40,
        "rectangle-table-6": 4,
        "rectangle-table-8": 6,
        "parson-table-7": 7,
        "sweetheart-table-33": 3,
        "sweetheart-table-48": 1,
        "cocktail-table-32": 5,
        chairs: 320,
      },
      source: { fileName: "Westwood Ranch table count.pdf" },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(WEATHERFORD_WESTWOOD_RANCH_INVENTORY.limits);

    const configuration = singleLevel(hall.configuration);
    const mainFloor = configuration.fixedArchitecturalElements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );
    const curvedSteps = configuration.fixedArchitecturalElements.filter(
      (element) => element.kind === "path" && element.id.startsWith("westwood-ranch-curved-stage-step"),
    );

    expect(mainFloor).toMatchObject({ shape: { x: 192, y: 60, width: 960, height: 720 } });
    expect(curvedSteps).toHaveLength(4);
    expect(curvedSteps.every((element) => element.placementBehavior === "blocked")).toBe(true);
    expect(configuration.fixedArchitecturalElements.some((element) => element.id.includes("stonecreek-reserve"))).toBe(false);
    expect(configuration.fixedArchitecturalElements.some((element) => element.kind === "stairs" && element.id.includes("stage"))).toBe(false);
  });

  it("mirrors Magnolia Manor's architecture and inventory for Rockwall Manor", () => {
    const location = getLocationBySlug("rockwall");
    const hall = getHallBySlug(location, "rockwall-manor");
    if (!location || !hall?.configuration) throw new Error("Rockwall Manor configuration missing");

    expect(ROCKWALL_MANOR_INVENTORY).toMatchObject({
      scope: "hall",
      limits: { ...MAGNOLIA_MANOR_INVENTORY.limits, chairs: 320 },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(MAGNOLIA_MANOR_INVENTORY.limits);

    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
    expect(elements.every((element) => element.id.startsWith("rockwall-manor"))).toBe(true);
    expect(elements.some((element) => element.id.includes("magnolia-manor"))).toBe(false);
    expect(elements.find((element) => element.id === "rockwall-manor-bar-counter")).toMatchObject({
      shape: { type: "rectangle", x: 598, width: 194 },
    });
    expect(elements.find((element) => element.id === "rockwall-manor-buffet")).toMatchObject({
      shape: { type: "rectangle", x: 116, width: 168 },
    });
    expect(elements.find((element) => element.id === "rockwall-manor-fireplace")).toMatchObject({
      shape: { type: "polygon", points: [50, 424, 80, 424, 90, 448, 90, 496, 80, 520, 50, 520] },
    });
    expect(elements.filter((element) => element.id.startsWith("rockwall-manor-east-double-door"))).toMatchObject([
      { x: 860, y: 437, rotation: 90, swingDirection: "counterclockwise" },
      { x: 860, y: 533, rotation: -90, swingDirection: "clockwise" },
    ]);
    expect(elements.find((element) => element.id === "rockwall-manor-second-floor-fireplace")).toMatchObject({
      shape: { type: "polygon", points: [980, 424, 1010, 424, 1020, 448, 1020, 496, 1010, 520, 980, 520] },
    });
  });

  it("defines Norman Aurora Grove with independent inventory and curved stage steps", () => {
    const location = getLocationBySlug("norman");
    const hall = getHallBySlug(location, "aurora-grove");
    if (!location || !hall?.configuration) throw new Error("Norman Aurora Grove configuration missing");

    expect(location).toMatchObject({ id: "location_norman", slug: "norman", name: "Norman" });
    expect(hall).toMatchObject({ id: "hall_aurora_grove", slug: "aurora-grove", name: "Aurora Grove" });
    expect(NORMAN_INVENTORY.scope).toBe("hall");
    expect(NORMAN_INVENTORY.limits).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 8,
      "rectangle-table-8": 10,
      "parson-table-7": 6,
      "sweetheart-table-32": 3,
      "cocktail-table-32": 6,
      chairs: 320,
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(NORMAN_INVENTORY.limits);
    expect(NORMAN_INVENTORY.limits).not.toEqual(KATY_INVENTORY.limits);
    expect(NORMAN_INVENTORY.limits).not.toEqual(WEATHERFORD_WESTWOOD_RANCH_INVENTORY.limits);

    const configuration = singleLevel(hall.configuration);
    const mainFloor = configuration.fixedArchitecturalElements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );
    const curvedSteps = configuration.fixedArchitecturalElements.filter(
      (element) => element.kind === "path" && element.id.startsWith("aurora-grove-curved-stage-step"),
    );

    expect(configuration).toMatchObject({ physicalWidthInches: 1320, physicalHeightInches: 840 });
    expect(mainFloor).toMatchObject({
      id: "aurora-grove-main-floor",
      shape: { x: 192, y: 60, width: 960, height: 720 },
    });
    expect(curvedSteps).toHaveLength(4);
    expect(configuration.fixedArchitecturalElements.every((element) => element.id.startsWith("aurora-grove"))).toBe(true);
    expect(configuration.fixedArchitecturalElements.some((element) => element.id.includes("westwood-ranch"))).toBe(false);
    expect(configuration.floorplanAsset).toBeNull();
  });

  it("models Parker Manor's confirmed plan measurements and supplied table counts", () => {
    const location = getLocationBySlug("weatherford");
    const hall = getHallBySlug(location, "parker-manor");
    if (!location || !hall?.configuration) throw new Error("Weatherford Parker Manor configuration missing");

    expect(WEATHERFORD_PARKER_MANOR_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-60": 30,
        "rectangle-table-6": 4,
        "rectangle-table-8": 12,
        "display-table-33": 4,
        "sweetheart-table-33": 3,
        "sweetheart-table-48": 1,
        "cocktail-table-32": 7,
        chairs: 320,
      },
      source: { fileName: "Parker Manor table count.pdf" },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(WEATHERFORD_PARKER_MANOR_INVENTORY.limits);

    if (!isMultiLevelHallConfiguration(hall.configuration)) throw new Error("Parker Manor must use multi-level configuration");
    expect(hall.configuration.defaultLevelId).toBe("level-1-downstairs");
    expect(hall.configuration.levels.map((level) => [level.id, level.slug])).toEqual([
      ["level-1-downstairs", "downstairs"],
      ["level-2-upstairs", "upstairs"],
    ]);

    const [downstairs, upstairs] = hall.configuration.levels;
    expect(downstairs.planningBounds).toEqual({ x: 50, y: 80, width: 810, height: 810 });
    expect(downstairs.usableAreas).toEqual([
      expect.objectContaining({
        id: "parker-manor-level-1-reception-floor",
        placementBehavior: "allowed",
        shape: { type: "rectangle", x: 50, y: 80, width: 810, height: 810 },
      }),
    ]);
    expect(downstairs.voidAreas).toEqual([]);
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-buffet")).toMatchObject({ shape: { x: 136, y: 134, width: 36, height: 192 } });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-bar")).toMatchObject({ shape: { x: 124, y: 641, width: 48, height: 168 } });
    expect(downstairs.fixedArchitecturalElements.some((element) => element.id === "parker-manor-balcony-overhang")).toBe(false);
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-mantle")).toMatchObject({ shape: { x: 703, y: 439, width: 14, height: 92 } });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-fireplace")).toMatchObject({ shape: { x: 717, y: 440, width: 43, height: 90 } });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-pavilion-door-west")).toMatchObject({
      kind: "door",
      x: 407,
      y: 80,
      rotation: 0,
      swingDirection: "counterclockwise",
    });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-pavilion-door-east")).toMatchObject({
      kind: "door",
      x: 503,
      y: 80,
      rotation: 180,
      swingDirection: "clockwise",
    });
    expect(downstairs.fixedArchitecturalElements.filter((element) => element.kind === "stairs")).toHaveLength(3);
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-downstairs-stairs-landing")).toMatchObject({
      role: "landing",
      shape: { type: "rectangle", x: 132, y: 445, width: 50, height: 81 },
    });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-downstairs-stairs-east-flight")).toMatchObject({
      kind: "stairs",
      x: 182,
      y: 428,
      width: 84,
      height: 114,
      orientation: "horizontal",
      curvedRight: true,
    });
    const downstairsPillars = downstairs.fixedArchitecturalElements.filter(
      (element) => element.kind === "area" && element.role === "pillar",
    );
    expect(downstairsPillars).toHaveLength(8);
    expect(downstairsPillars.every((pillar) => {
      if (pillar.kind !== "area" || pillar.shape.type !== "rectangle") return false;
      const centerX = pillar.shape.x + pillar.shape.width / 2;
      const centerY = pillar.shape.y + pillar.shape.height / 2;
      return centerX === 193 || centerX === 717 || centerY === 223 || centerY === 747;
    })).toBe(true);

    expect(upstairs.usableAreas).toEqual([
      expect.objectContaining({
        id: "parker-manor-level-2-upper-floor",
        placementBehavior: "allowed",
        shape: { type: "rectangle", x: 50, y: 80, width: 810, height: 810 },
      }),
    ]);
    expect(upstairs.voidAreas).toEqual([
      expect.objectContaining({
        id: "parker-manor-level-2-open-to-below",
        placementBehavior: "blocked",
        shape: {
          type: "polygon",
          points: [193, 223, 717, 223, 717, 747, 193, 747, 193, 542, 266, 542, 266, 428, 193, 428],
        },
      }),
    ]);
    expect(isPositionOnFloor({ x: 455, y: 150 }, upstairs.usableAreas ?? [], upstairs.voidAreas ?? [])).toBe(true);
    expect(isPositionOnFloor({ x: 455, y: 500 }, upstairs.usableAreas ?? [], upstairs.voidAreas ?? [])).toBe(false);
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-full-balcony-door-west")).toMatchObject({
      kind: "door",
      x: 407,
      rotation: 0,
      swingDirection: "counterclockwise",
    });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-full-balcony-door-east")).toMatchObject({
      kind: "door",
      x: 503,
      rotation: 180,
      swingDirection: "clockwise",
    });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-upstairs-fireplace")).toMatchObject({ shape: { x: 717, y: 440, width: 43 } });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-upstairs-pillar-3")).toMatchObject({ shape: { x: 184, y: 302 } });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "parker-manor-upstairs-pillar-4")).toMatchObject({ shape: { x: 708, y: 302 } });
    expect(upstairs.fixedArchitecturalElements.filter((element) => element.kind === "stairs")).toHaveLength(3);
    expect(upstairs.fixedArchitecturalElements.some((element) => element.id.includes("buffet") || element.id.includes("bar"))).toBe(false);
    expect([...downstairs.fixedArchitecturalElements, ...upstairs.fixedArchitecturalElements].every((element) => element.id.startsWith("parker-manor"))).toBe(true);
  });

  it("keeps each confirmed Angleton hall inventory separate", () => {
    const location = getLocationBySlug("angleton");
    const sycamoreGrove = getHallBySlug(location, "sycamore-grove");
    const magnoliaManor = getHallBySlug(location, "magnolia-manor");
    if (!location || !sycamoreGrove || !magnoliaManor) throw new Error("Angleton catalog entry missing");

    expect(ANGLETON_INVENTORY).toMatchObject({
      scope: "hall",
      limits: {
        "round-table-60": 40,
        "rectangle-table-6": 2,
        "rectangle-table-8": 6,
        "farmhouse-table-6": 0,
        "parson-table-7": 6,
        "sweetheart-table": 2,
        "cocktail-table-32": 5,
        "cocktail-table-36": 0,
        chairs: 320,
      },
    });
    expect(location.inventory).toBeUndefined();
    expect(sycamoreGrove.configuration?.inventory).toBe(ANGLETON_INVENTORY);
    expect(resolveInventoryConfiguration(location, sycamoreGrove)).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 2,
      "rectangle-table-8": 6,
      "farmhouse-table-6": 0,
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-32": 5,
      "cocktail-table-36": 0,
      chairs: 320,
    });
    expect(magnoliaManor.configuration?.inventory).toBe(MAGNOLIA_MANOR_INVENTORY);
    expect(resolveInventoryConfiguration(location, magnoliaManor)).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 2,
      "rectangle-table-8": 6,
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-32": 10,
      "cocktail-table-36": 0,
      chairs: 320,
    });
  });

  it("models Magnolia Manor from its confirmed 67-foot-6-inch measurements", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;

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
    expect(singleLevel(hall.configuration).floorplanAsset).toBeNull();
  });

  it("stores Magnolia Manor's confirmed permanent fixture dimensions", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;

    expect(elements.find((element) => element.id === "magnolia-manor-bar-counter")).toMatchObject({
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 194, height: 45 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-bar-counter")?.physicalNote).toContain("top section is 21 inches deep");
    expect(elements.find((element) => element.id === "magnolia-manor-bar-counter")?.physicalNote).toContain("back sink area is 6′4″ × 2′");
    expect(elements.find((element) => element.id === "magnolia-manor-bar-top")).toBeUndefined();
    expect(elements.find((element) => element.id === "magnolia-manor-bar-sink")).toBeUndefined();
    expect(elements.find((element) => element.id === "magnolia-manor-buffet")).toMatchObject({
      placementBehavior: "blocked",
      shape: { type: "rectangle", width: 168, height: 48 },
    });
  });

  it("represents Magnolia Manor's staircase measurements and structural pillars", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;

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
    expect(elements.find((element) => element.id === "magnolia-manor-bottom-flight")?.physicalNote).toContain("53 inches tall");
    expect(elements.find((element) => element.id.startsWith("magnolia-manor-bottom-stair-pillar"))).toBeUndefined();
    expect(elements.find((element) => element.id === "magnolia-manor-stair-square")).toBeUndefined();
    expect(singleLevel(hall.configuration).physicalDimensionNote).toContain("intentionally not modeled");
    expect(elements.find((element) => element.id === "magnolia-manor-suite-label")).toBeUndefined();
  });

  it("keeps Magnolia Manor's 12-foot second floor separate from its blocked open-to-below", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
    const secondFloor = elements.filter((element) => element.kind === "area" && element.role === "second-floor");

    expect(secondFloor).toHaveLength(1);
    expect(secondFloor[0]).toMatchObject({
      showLabel: false,
      shape: { type: "rectangle", x: 980, y: 80, width: 810, height: 810 },
    });
    expect(elements.find((element) => element.id === "magnolia-manor-open-to-below")).toMatchObject({
      placementBehavior: "blocked",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", width: 522, height: 522 },
    });
  });

  it("uses connected outward-swinging double doors and keeps second-floor pillars on the balcony", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;

    expect(elements.filter((element) => element.id.startsWith("magnolia-manor-west-double-door"))).toMatchObject([
      { x: 50, y: 437, width: 48, rotation: 90, swingDirection: "clockwise" },
      { x: 50, y: 533, width: 48, rotation: -90, swingDirection: "counterclockwise" },
    ]);
    expect(elements.filter((element) => element.id.startsWith("magnolia-manor-balcony-double-door"))).toMatchObject([
      { x: 1337, y: 890, width: 48, rotation: 0, swingDirection: "clockwise" },
      { x: 1433, y: 890, width: 48, rotation: 180, swingDirection: "counterclockwise" },
    ]);

    const rightPillars = [2, 4].map((number) =>
      elements.find((element) => element.id === `magnolia-manor-second-floor-pillar-${number}`),
    );
    expect(rightPillars).toMatchObject([
      { shape: { type: "rectangle", x: 1652, width: 18 } },
      { shape: { type: "rectangle", x: 1652, width: 18 } },
    ]);
  });

  it("renders Magnolia Manor's lower stair flight with a scaled curved profile", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!hall?.configuration) throw new Error("Magnolia Manor configuration missing");

    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
    expect(elements.find(
      (element) => element.id === "magnolia-manor-bottom-flight",
    )).toMatchObject({ treadAxis: "y", curvedBottom: true, showLabel: false });
    expect(elements.findIndex((element) => element.id === "magnolia-manor-open-north-rail")).toBeLessThan(
      elements.findIndex((element) => element.id === "magnolia-manor-second-floor-bottom-flight"),
    );
  });

  it("configures Sycamore Grove with its exact floor scale and raised usable stage", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "sycamore-grove");
    if (!hall?.configuration) throw new Error("Sycamore Grove configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
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
    expect(singleLevel(hall.configuration).floorplanAsset).toBeNull();
  });

  it.each([
    ["stonecreek-reserve", "stonecreek-reserve", 192],
    ["villa-tuscana", "villa-tuscana", 169],
  ])("configures %s with an exact floor scale and raised usable stage", (hallSlug, idPrefix, x) => {
    const location = getLocationBySlug("katy");
    const hall = getHallBySlug(location, hallSlug);
    if (!hall?.configuration) throw new Error(`${hallSlug} configuration missing`);
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
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
    expect(singleLevel(hall.configuration).floorplanAsset).toBeNull();
  });

  it("configures Stonebrook with its confirmed floor scale and raised stage", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "stonebrook");
    if (!hall?.configuration) throw new Error("Stonebrook configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;
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
    expect(singleLevel(hall.configuration).floorplanAsset).toBeNull();
  });

  it("configures Heritage Pine with its confirmed floor scale and chair capacity", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "heritage-pine");
    if (!location || !hall?.configuration) throw new Error("Heritage Pine configuration missing");

    const mainFloor = singleLevel(hall.configuration).fixedArchitecturalElements.find(
      (element) => element.kind === "area" && element.role === "main-floor",
    );

    expect(mainFloor).toMatchObject({
      placementBehavior: "allowed",
      measurementStatus: "confirmed",
      shape: { type: "rectangle", x: 167, y: 60, width: 960, height: 720 },
    });
    expect(resolveInventoryConfiguration(location, hall)).toEqual({
      "round-table-60": 40,
      "rectangle-table-6": 2,
      "rectangle-table-8": 6,
      "farmhouse-table-6": 0,
      "parson-table-7": 6,
      "sweetheart-table": 2,
      "cocktail-table-32": 0,
      "cocktail-table-36": 5,
      chairs: 320,
    });
  });

  it("traces Heritage Pine's identified fixed architecture without a reference image", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "heritage-pine");
    if (!hall?.configuration) throw new Error("Heritage Pine configuration missing");
    const elements = singleLevel(hall.configuration).fixedArchitecturalElements;

    expect(singleLevel(hall.configuration).floorplanAsset).toBeNull();
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
      "farmhouse-table-6": 0,
      "parson-table-7": 6,
      "sweetheart-table": 1,
      "cocktail-table-32": 6,
      "cocktail-table-36": 0,
      chairs: 320,
    };

    expect(MAGNOLIA_INVENTORY).toMatchObject({
      scope: "location-shared",
      limits: expected,
      source: { fileName: "springs-inventory.xlsx" },
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
      "farmhouse-table-6": 0,
      "parson-table-7": 6,
      "sweetheart-table": 1,
      "cocktail-table-32": 6,
      "cocktail-table-36": 0,
      chairs: 320,
    });
    expect(resolveInventoryConfiguration(magnolia, baseHall)["round-table-60"]).toBe(32);
  });

  it("keeps the Hidden Magnolia reference image disabled", () => {
    const pinehaven = SPRINGS_LOCATIONS[0].halls[0].configuration!;
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration!;

    expect(singleLevel(pinehaven).floorplanAsset).toBeNull();
    expect(singleLevel(hiddenMagnolia).floorplanAsset).toBeNull();
  });

  it("calibrates the Hidden Magnolia main floor to exact inch coordinates", () => {
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration!;
    const mainFloor = singleLevel(hiddenMagnolia).fixedArchitecturalElements.find(
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
    const elements = singleLevel(SPRINGS_LOCATIONS[0].halls[1].configuration).fixedArchitecturalElements;
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
    const elements = singleLevel(SPRINGS_LOCATIONS[0].halls[1].configuration).fixedArchitecturalElements;
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
    const doors = singleLevel(SPRINGS_LOCATIONS[0].halls[1].configuration).fixedArchitecturalElements.filter(
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

  it("defines White Sparrow as a two-level hall with its exact supplied inventory", () => {
    const location = getLocationBySlug("white-sparrow");
    const hall = getHallBySlug(location, "white-sparrow");
    if (!location || !hall?.configuration) throw new Error("White Sparrow configuration missing");

    expect(location).toMatchObject({ id: "location_white_sparrow", name: "White Sparrow" });
    expect(hall).toMatchObject({ id: "hall_white_sparrow", name: "White Sparrow" });
    expect(resolveInventoryConfiguration(location, hall)).toEqual(WHITE_SPARROW_INVENTORY.limits);
    expect(WHITE_SPARROW_INVENTORY.limits).toMatchObject({
      "round-table-60": 28,
      "round-table-48": 1,
      "rectangle-table-8": 4,
      "rectangle-table-6": 2,
      "farmhouse-table-8": 8,
      "farmhouse-table-6": 1,
      "parson-table-5": 2,
      "side-table-wood": 2,
      "cocktail-table-plastic": 4,
      "cocktail-table-white-wood": 5,
      "display-table-32": 1,
      chairs: 200,
    });

    if (!isMultiLevelHallConfiguration(hall.configuration)) throw new Error("White Sparrow must be multi-level");
    expect(hall.configuration.defaultLevelId).toBe("level-1-reception-hall");
    const [downstairs, upstairs] = hall.configuration.levels;
    expect(downstairs).toMatchObject({
      id: "level-1-reception-hall",
      planningBounds: { x: 780, y: 90, width: 720, height: 480 },
    });
    expect(upstairs).toMatchObject({
      id: "level-2-upstairs-balcony",
      planningBounds: { x: 404, y: 90, width: 376, height: 360 },
    });
    expect(upstairs.voidAreas?.[0]).toMatchObject({
      shape: { type: "rectangle", x: 780, y: 90, width: 720, height: 480 },
    });
    expect(isPositionOnFloor({ x: 520, y: 250 }, upstairs.usableAreas ?? [], upstairs.voidAreas ?? [])).toBe(true);
    expect(isPositionOnFloor({ x: 1000, y: 350 }, upstairs.usableAreas ?? [], upstairs.voidAreas ?? [])).toBe(false);

    const kitchen = downstairs.fixedArchitecturalElements.find((element) => element.id === "white-sparrow-kitchen");
    const storage = downstairs.fixedArchitecturalElements.find((element) => element.id === "white-sparrow-storage");
    const bar = downstairs.fixedArchitecturalElements.find((element) => element.id === "white-sparrow-bar");
    expect(kitchen).toMatchObject({ shape: { type: "rectangle", width: 250, height: 175 } });
    expect(storage).toMatchObject({ shape: { type: "rectangle", width: 155, height: 175 } });
    expect(bar).toMatchObject({
      kind: "area",
      role: "bar",
      placementBehavior: "blocked",
      shape: { type: "polygon", points: [465, 140, 610, 140, 610, 90, 640, 90, 640, 180, 465, 180] },
    });
    expect(downstairs.fixedArchitecturalElements.find((element) => element.id === "white-sparrow-restroom-under-stairs")).toMatchObject({
      kind: "area",
      label: "RESTROOM\nUNDER STAIRS",
      placementBehavior: "blocked",
    });
    expect(upstairs.fixedArchitecturalElements.find((element) => element.id === "white-sparrow-upstairs-grooms-suite")).toMatchObject({
      kind: "area",
      label: "GROOM'S SUITE",
      shape: { type: "rectangle", width: 344, height: 190 },
    });
  });
});

function singleLevel(configuration: HallConfiguration | null): SingleLevelHallConfiguration {
  if (!configuration || isMultiLevelHallConfiguration(configuration)) {
    throw new Error("Expected a configured single-level hall");
  }
  return configuration;
}
