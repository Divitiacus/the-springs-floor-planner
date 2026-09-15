import { describe, expect, it } from "vitest";
import { createHallVenueTemplate } from "@/domain/hall-venue";
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
});
