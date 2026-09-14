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
});
