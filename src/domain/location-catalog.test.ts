import { describe, expect, it } from "vitest";
import { getHallBySlug, getLocationBySlug, SPRINGS_LOCATIONS } from "@/domain/location-catalog";

describe("location catalog", () => {
  it("defines Magnolia with exactly its two confirmed halls", () => {
    expect(SPRINGS_LOCATIONS).toHaveLength(1);
    expect(SPRINGS_LOCATIONS[0]).toMatchObject({ name: "Magnolia", slug: "magnolia" });
    expect(SPRINGS_LOCATIONS[0].halls.map((hall) => hall.name)).toEqual([
      "Pinehaven Terrace",
      "The Hidden Magnolia",
    ]);
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

  it("marks Magnolia's working dimensions and inventory as unconfirmed", () => {
    const configuration = SPRINGS_LOCATIONS[0].halls[0].configuration;
    expect(configuration).toMatchObject({
      physicalWidthInches: 960,
      physicalHeightInches: 720,
      physicalDimensionStatus: "provisional",
      inventory: {
        "round-table-60": null,
        "rectangle-table-6": null,
        "rectangle-table-8": null,
        "sweetheart-table": null,
        chairs: null,
      },
    });
  });

  it("keeps the source-traced Hidden Magnolia geometry isolated from Pinehaven", () => {
    const pinehaven = SPRINGS_LOCATIONS[0].halls[0].configuration;
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration;

    expect(pinehaven.floorplanAsset).toBeNull();
    expect(hiddenMagnolia.floorplanAsset).toMatchObject({
      source: "/venue-assets/magnolia-floor-plan-reference.png",
      locked: true,
      interactive: false,
      measurementStatus: "source-traced",
    });
  });

  it("calibrates the Hidden Magnolia main floor to exact inch coordinates", () => {
    const hiddenMagnolia = SPRINGS_LOCATIONS[0].halls[1].configuration;
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
    const elements = SPRINGS_LOCATIONS[0].halls[1].configuration.fixedArchitecturalElements;
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
    const elements = SPRINGS_LOCATIONS[0].halls[1].configuration.fixedArchitecturalElements;
    const doors = elements.filter((element) => element.kind === "door");
    const stairs = elements.filter((element) => element.kind === "stairs");

    expect(elements.some((element) => element.kind === "area" && element.shape.type === "polygon")).toBe(true);
    expect(elements.filter((element) => element.kind === "wall").length).toBeGreaterThan(0);
    expect(doors.length).toBeGreaterThan(0);
    expect(doors.every((door) => door.measurementStatus === "source-traced" && door.label.includes("provisional"))).toBe(true);
    expect(stairs).toHaveLength(2);
    expect(stairs.every((stair) => stair.treadCount > 1 && stair.placementBehavior === "blocked")).toBe(true);
  });
});
