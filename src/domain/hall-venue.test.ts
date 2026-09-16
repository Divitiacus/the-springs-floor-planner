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

  it("resolves Cypress as two independent venue templates without concatenating architecture", () => {
    const location = getLocationBySlug("cypress");
    const hall = getHallBySlug(location, "the-chateau");
    if (!location || !hall) throw new Error("Cypress The Chateau catalog entry missing");

    const mainFloor = createHallVenueTemplate(location, hall, "level-1-main-floor");
    const balcony = createHallVenueTemplate(location, hall, "level-2-balcony");
    const levels = createHallVenueTemplates(location, hall);

    expect(levels.map((level) => level.levelId)).toEqual(["level-1-main-floor", "level-2-balcony"]);
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
    expect(() => createHallVenueTemplate(location, hall, "roof")).toThrow(/not configured/);
  });
});
