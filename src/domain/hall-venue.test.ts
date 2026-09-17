import { describe, expect, it } from "vitest";
import { createHallVenueTemplate, createHallVenueTemplates } from "@/domain/hall-venue";
import { getHallBySlug, getLocationBySlug } from "@/domain/location-catalog";
import { createEventObject } from "@/domain/layout-operations";

describe("hall venue template", () => {
  it("loads Hidden Magnolia architecture under independently stored event objects", () => {
    const location = getLocationBySlug("magnolia");
    const hall = getHallBySlug(location, "the-hidden-magnolia");
    if (!location || !hall) throw new Error("Hidden Magnolia catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);

    expect(venue.coordinateUnit).toBe("inches");
    expect(venue.hall).toEqual({ x: 180, y: 60, width: 960, height: 720 });
    expect(venue.elements.length).toBeGreaterThan(10);
    expect(venue.referenceAsset).toBeNull();
    expect("objects" in venue).toBe(false);
  });

  it("applies the shared Magnolia source geometry to Pinehaven Terrace", () => {
    const location = getLocationBySlug("magnolia");
    const hall = getHallBySlug(location, "pinehaven-terrace");
    if (!location || !hall) throw new Error("Pinehaven catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);

    expect(venue.hall).toEqual({ x: 180, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(10);
  });

  it("keeps a 60-inch round table mathematically proportional to the calibrated floor", () => {
    const location = getLocationBySlug("magnolia");
    const hall = getHallBySlug(location, "the-hidden-magnolia");
    if (!location || !hall) throw new Error("Hidden Magnolia catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 480, y: 360 }, [], "scale-check");

    expect(table.width).toBe(60);
    expect(venue.hall.width).toBe(960);
    expect(venue.hall.height).toBe(720);
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it("loads Heritage Pine at the confirmed 80-by-60-foot scale", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "heritage-pine");
    if (!location || !hall) throw new Error("Heritage Pine catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 647, y: 420 }, [], "heritage-scale");

    expect(venue.hall).toEqual({ x: 167, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it("loads Stonebrook at the confirmed 80-by-60-foot scale", () => {
    const location = getLocationBySlug("lake-conroe");
    const hall = getHallBySlug(location, "stonebrook");
    if (!location || !hall) throw new Error("Stonebrook catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 672, y: 420 }, [], "stonebrook-scale");

    expect(venue.hall).toEqual({ x: 192, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it.each([
    ["stonecreek-reserve", { x: 192, y: 60, width: 960, height: 720 }],
    ["villa-tuscana", { x: 169, y: 60, width: 960, height: 720 }],
  ])("loads Katy's %s at the confirmed 80-by-60-foot scale", (hallSlug, expectedHall) => {
    const location = getLocationBySlug("katy");
    const hall = getHallBySlug(location, hallSlug);
    if (!location || !hall) throw new Error(`${hallSlug} catalog entry missing`);

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 660, y: 420 }, [], `${hallSlug}-scale`);

    expect(venue.hall).toEqual(expectedHall);
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it("loads Denton's Hidden Springs Ranch with the Stonecreek footprint and its own identity", () => {
    const location = getLocationBySlug("denton");
    const hall = getHallBySlug(location, "hidden-springs-ranch");
    if (!location || !hall) throw new Error("Hidden Springs Ranch catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);

    expect(venue.id).toBe("location_denton:hall_hidden_springs_ranch");
    expect(venue.name).toBe("Denton · Hidden Springs Ranch");
    expect(venue.hall).toEqual({ x: 192, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
  });

  it.each([
    ["tulsa", "sunset-pointe", "location_tulsa:hall_sunset_pointe", "Tulsa · Sunset Pointe", "sunset-pointe"],
    ["edmond", "willowbrook-reserve", "location_edmond:hall_willowbrook_reserve", "Edmond · Willowbrook Reserve", "willowbrook-reserve"],
  ])(
    "loads %s's Stonecreek-derived hall with its own identity",
    (locationSlug, hallSlug, venueId, venueName, elementPrefix) => {
      const location = getLocationBySlug(locationSlug);
      const hall = getHallBySlug(location, hallSlug);
      if (!location || !hall) throw new Error(`${hallSlug} catalog entry missing`);

      const venue = createHallVenueTemplate(location, hall);

      expect(venue.id).toBe(venueId);
      expect(venue.name).toBe(venueName);
      expect(venue.hall).toEqual({ x: 192, y: 60, width: 960, height: 720 });
      expect(venue.referenceAsset).toBeNull();
      expect(venue.elements.length).toBeGreaterThan(20);
      expect(venue.elements.every((element) => element.id.startsWith(elementPrefix))).toBe(true);
    },
  );

  it("loads McKinney's Havenstone Reserve with the Villa Tuscana footprint and its own identity", () => {
    const location = getLocationBySlug("mckinney");
    const hall = getHallBySlug(location, "havenstone-reserve");
    if (!location || !hall) throw new Error("Havenstone Reserve catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);

    expect(venue.id).toBe("location_mckinney:hall_havenstone_reserve");
    expect(venue.name).toBe("McKinney · Havenstone Reserve");
    expect(venue.hall).toEqual({ x: 169, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
    expect(venue.elements.every((element) => element.id.startsWith("havenstone-reserve"))).toBe(true);
  });

  it("loads McKinney's Tuscany Hill as two Parker Manor-derived levels", () => {
    const location = getLocationBySlug("mckinney");
    const hall = getHallBySlug(location, "tuscany-hill");
    if (!location || !hall) throw new Error("Tuscany Hill catalog entry missing");

    const downstairs = createHallVenueTemplate(location, hall, "level-1-downstairs");
    const upstairs = createHallVenueTemplate(location, hall, "level-2-upstairs");

    expect(downstairs.id).toBe("location_mckinney:hall_tuscany_hill");
    expect(downstairs.name).toBe("McKinney · Tuscany Hill");
    expect(downstairs.hall).toEqual({ x: 50, y: 80, width: 810, height: 810 });
    expect(downstairs.physicalWidthInches).toBe(910);
    expect(upstairs.hall).toEqual({ x: 50, y: 80, width: 810, height: 810 });
    expect(upstairs.physicalWidthInches).toBe(1040);
    expect(upstairs.voidAreas?.map((region) => region.id)).toEqual(["tuscany-hill-level-2-open-to-below"]);
    expect(upstairs.elements.some((element) => element.id === "tuscany-hill-upstairs-rounded-porch")).toBe(true);
  });

  it("loads Denton's Oakview Lodge at the confirmed 111-foot-4-inch room length", () => {
    const location = getLocationBySlug("denton");
    const hall = getHallBySlug(location, "oakview-lodge");
    if (!location || !hall) throw new Error("Oakview Lodge catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 720, y: 460 }, [], "oakview-scale");

    expect(venue.id).toBe("location_denton:hall_oakview_lodge");
    expect(venue.name).toBe("Denton · Oakview Lodge");
    expect(venue.hall).toEqual({ x: 50, y: 50, width: 1336, height: 826 });
    expect(venue.physicalDimensionStatus).toBe("source-traced");
    expect(venue.referenceAsset).toBeNull();
    expect(venue.usableAreas).toHaveLength(4);
    expect(venue.defaultObjectPosition).toEqual({ x: 819, y: 494 });
    expect(table.width / venue.hall.width).toBeCloseTo(60 / 1336, 12);
  });

  it("loads Alvarado Timberview Lodge as an independent measured venue", () => {
    const location = getLocationBySlug("alvarado");
    const hall = getHallBySlug(location, "timberview-lodge");
    if (!location || !hall) throw new Error("Alvarado Timberview Lodge catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const levels = createHallVenueTemplates(location, hall);
    const table = createEventObject("round-table-60", { x: 760, y: 520 }, [], "timberview-scale");

    expect(venue.id).toBe("location_alvarado:hall_timberview_lodge");
    expect(venue.name).toBe("Alvarado · Timberview Lodge");
    expect(venue.hall).toEqual({ x: 55, y: 55, width: 1403, height: 938 });
    expect(venue.physicalWidthInches).toBe(1513);
    expect(venue.physicalHeightInches).toBe(1048);
    expect(venue.physicalDimensionStatus).toBe("source-traced");
    expect(venue.referenceAsset).toBeNull();
    expect(venue.usableAreas).toHaveLength(3);
    expect(venue.defaultObjectPosition).toEqual({ x: 779, y: 515 });
    expect(table.width / 480).toBe(1 / 8);
    expect(venue.elements.every((element) => element.id.startsWith("timberview-lodge"))).toBe(true);
    expect(venue.levelId).toBe("reception");
    expect(venue.inventoryGroupId).toBe("reception");
    expect(levels.map((level) => level.levelId)).toEqual(["reception", "ceremony-site"]);
    expect(levels[1]).toMatchObject({
      levelName: "Ceremony Site",
      inventoryGroupId: "ceremony",
      hall: { x: 60, y: 50, width: 504, height: 762 },
      physicalWidthInches: 624,
      physicalHeightInches: 872,
    });
  });

  it("loads Waxahachie at the confirmed 90-by-63-foot scale", () => {
    const location = getLocationBySlug("waxahachie");
    const hall = getHallBySlug(location, "waxahachie");
    if (!location || !hall) throw new Error("Waxahachie catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-72", { x: 600, y: 438 }, [], "waxahachie-scale");

    expect(venue.id).toBe("location_waxahachie:hall_waxahachie");
    expect(venue.name).toBe("Waxahachie");
    expect(venue.hall).toEqual({ x: 60, y: 60, width: 1080, height: 756 });
    expect(venue.physicalWidthInches).toBe(1200);
    expect(venue.physicalHeightInches).toBe(876);
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.every((element) => element.id.startsWith("waxahachie"))).toBe(true);
    expect(table.width / venue.hall.width).toBe(1 / 15);
  });

  it("loads Valley View without repeating its identical location and hall name", () => {
    const location = getLocationBySlug("valley-view");
    const hall = getHallBySlug(location, "valley-view");
    if (!location || !hall) throw new Error("Valley View catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);

    expect(venue.id).toBe("location_valley_view:hall_valley_view");
    expect(venue.name).toBe("Valley View");
    expect(venue.hall).toEqual({ x: 50, y: 50, width: 1392, height: 1011 });
    expect(venue.physicalDimensionStatus).toBe("source-traced");
    expect(venue.usableAreas).toHaveLength(3);
    expect(venue.referenceAsset).toBeNull();
  });

  it("loads Rockwall's Poetry Springs with the Heritage Pine footprint and its own identity", () => {
    const location = getLocationBySlug("rockwall");
    const hall = getHallBySlug(location, "poetry-springs");
    if (!location || !hall) throw new Error("Poetry Springs catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);

    expect(venue.id).toBe("location_rockwall:hall_poetry_springs");
    expect(venue.name).toBe("Rockwall · Poetry Springs");
    expect(venue.hall).toEqual({ x: 167, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
  });

  it("loads Sycamore Grove at the confirmed 80-by-60-foot scale", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "sycamore-grove");
    if (!location || !hall) throw new Error("Sycamore Grove catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 672, y: 420 }, [], "sycamore-scale");

    expect(venue.hall).toEqual({ x: 192, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(20);
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it("loads Magnolia Manor at the confirmed 67-foot-6-inch square scale", () => {
    const location = getLocationBySlug("angleton");
    const hall = getHallBySlug(location, "magnolia-manor");
    if (!location || !hall) throw new Error("Magnolia Manor catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 455, y: 485 }, [], "manor-scale");

    expect(venue.hall).toEqual({ x: 50, y: 80, width: 810, height: 810 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.length).toBeGreaterThan(50);
    expect(table.width / venue.hall.width).toBe(2 / 27);
  });

  it("loads Weatherford's Parker Manor as two aligned floor levels", () => {
    const location = getLocationBySlug("weatherford");
    const hall = getHallBySlug(location, "parker-manor");
    if (!location || !hall) throw new Error("Parker Manor catalog entry missing");

    const downstairs = createHallVenueTemplate(location, hall, "level-1-downstairs");
    const upstairs = createHallVenueTemplate(location, hall, "level-2-upstairs");
    const levels = createHallVenueTemplates(location, hall);

    expect(levels.map((level) => level.levelId)).toEqual(["level-1-downstairs", "level-2-upstairs"]);
    expect(downstairs.id).toBe("location_weatherford:hall_parker_manor");
    expect(downstairs.name).toBe("Weatherford · Parker Manor");
    expect(downstairs.levelName).toBe("Level 1 — Downstairs");
    expect(downstairs.hall).toEqual({ x: 50, y: 80, width: 810, height: 810 });
    expect(downstairs.usableAreas).toHaveLength(1);
    expect(downstairs.voidAreas).toEqual([]);
    expect(downstairs.referenceAsset).toBeNull();

    expect(upstairs.id).toBe("location_weatherford:hall_parker_manor");
    expect(upstairs.name).toBe("Weatherford · Parker Manor");
    expect(upstairs.levelName).toBe("Level 2 — Upstairs Balcony");
    expect(upstairs.hall).toEqual({ x: 50, y: 80, width: 810, height: 810 });
    expect(upstairs.usableAreas).toHaveLength(1);
    expect(upstairs.voidAreas?.map((region) => region.id)).toEqual(["parker-manor-level-2-open-to-below"]);
    expect(upstairs.referenceAsset).toBeNull();
  });

  it("loads Weatherford's Westwood Ranch at the confirmed 80-by-60-foot scale", () => {
    const location = getLocationBySlug("weatherford");
    const hall = getHallBySlug(location, "westwood-ranch");
    if (!location || !hall) throw new Error("Westwood Ranch catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 660, y: 420 }, [], "westwood-scale");

    expect(venue.id).toBe("location_weatherford:hall_westwood_ranch");
    expect(venue.name).toBe("Weatherford · Westwood Ranch");
    expect(venue.hall).toEqual({ x: 192, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it("loads Norman's Aurora Grove with the Westwood Ranch footprint and its own identity", () => {
    const location = getLocationBySlug("norman");
    const hall = getHallBySlug(location, "aurora-grove");
    if (!location || !hall) throw new Error("Aurora Grove catalog entry missing");

    const venue = createHallVenueTemplate(location, hall);
    const table = createEventObject("round-table-60", { x: 660, y: 420 }, [], "aurora-grove-scale");

    expect(venue.id).toBe("location_norman:hall_aurora_grove");
    expect(venue.name).toBe("Norman · Aurora Grove");
    expect(venue.hall).toEqual({ x: 192, y: 60, width: 960, height: 720 });
    expect(venue.referenceAsset).toBeNull();
    expect(venue.elements.every((element) => element.id.startsWith("aurora-grove"))).toBe(true);
    expect(table.width / venue.hall.width).toBe(1 / 16);
  });

  it("resolves Cypress as four independent planning templates without concatenating architecture", () => {
    const location = getLocationBySlug("cypress");
    const hall = getHallBySlug(location, "the-chateau");
    if (!location || !hall) throw new Error("Cypress The Chateau catalog entry missing");

    const mainFloor = createHallVenueTemplate(location, hall, "level-1-main-floor");
    const balcony = createHallVenueTemplate(location, hall, "level-2-balcony");
    const ceremonySite = createHallVenueTemplate(location, hall, "ceremony-site");
    const patio = createHallVenueTemplate(location, hall, "patio");
    const levels = createHallVenueTemplates(location, hall);

    expect(levels.map((level) => level.levelId)).toEqual(["level-1-main-floor", "level-2-balcony", "ceremony-site", "patio"]);
    expect(mainFloor.levelName).toBe("Level 1 — Main Floor");
    expect(mainFloor).toMatchObject({
      coordinateUnit: "inches",
      physicalWidthInches: 1840,
      physicalHeightInches: 980,
      hall: { x: 760, y: 72, width: 660, height: 828 },
    });
    expect(mainFloor.referenceAsset).toMatchObject({
      source: "/floorplans/cypress/main-floor.jpg",
      visualRole: "architectural-base",
      x: 1.5,
      y: 17.5,
      width: 1837,
      height: 945,
      locked: true,
      interactive: false,
    });
    expect(mainFloor.referenceAsset!.width / mainFloor.referenceAsset!.height).toBeCloseTo(1837 / 945, 12);
    expect(mainFloor.elements.some((element) => element.id === "chateau-stage")).toBe(true);
    expect(mainFloor.elements.some((element) => element.id.startsWith("chateau-balcony-"))).toBe(false);
    expect(balcony.levelName).toBe("Level 2 — Balcony");
    expect(balcony).toMatchObject({
      coordinateUnit: "inches",
      physicalWidthInches: 1840,
      physicalHeightInches: 980,
    });
    expect(balcony.referenceAsset).toMatchObject({
      source: "/floorplans/cypress/balcony.jpg",
      visualRole: "architectural-base",
      x: 0,
      y: 10,
      width: 1840,
      height: 960,
      locked: true,
      interactive: false,
    });
    expect(balcony.referenceAsset!.width / balcony.referenceAsset!.height).toBeCloseTo(1840 / 960, 12);
    expect(balcony.elements.some((element) => element.id === "chateau-stage")).toBe(false);
    expect(balcony.voidAreas?.map((region) => region.id)).toEqual([
      "chateau-level-2-rotunda-void",
      "chateau-level-2-main-hall-void",
    ]);
    expect(ceremonySite).toMatchObject({
      levelName: "Ceremony Site",
      inventoryGroupId: "ceremony",
      coordinateUnit: "inches",
      physicalWidthInches: 960,
      physicalHeightInches: 780,
      hall: { x: 95, y: 55, width: 769, height: 670.5 },
      referenceAsset: null,
    });
    expect(ceremonySite.elements.some((element) => element.id === "chateau-ceremony-platform")).toBe(true);
    expect(ceremonySite.elements.some((element) => element.id === "chateau-stage")).toBe(false);
    expect(patio).toMatchObject({
      levelName: "Patio",
      inventoryGroupId: "reception",
      coordinateUnit: "inches",
      physicalWidthInches: 1040,
      physicalHeightInches: 540,
      hall: { x: 70, y: 70, width: 900, height: 348 },
      referenceAsset: null,
    });
    expect(patio.elements.some((element) => element.id === "chateau-patio-surface")).toBe(true);
    expect(patio.usableAreas?.[0]?.shape.type).toBe("polygon");
    expect(() => createHallVenueTemplate(location, hall, "roof")).toThrow(/not configured/);
  });
});
