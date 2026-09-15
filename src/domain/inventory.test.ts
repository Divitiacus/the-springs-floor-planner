import { describe, expect, it } from "vitest";
import { addObject, createEmptyLayout, createEventObject, duplicateObject, updateObject } from "@/domain/layout-operations";
import { getInventoryUsage, validateLayoutInventory, type InventoryConfiguration } from "@/domain/inventory";
import { getHallBySlug, getLocationBySlug, resolveInventoryConfiguration } from "@/domain/location-catalog";
import { deserializeFloorplan, serializeFloorplan } from "@/domain/persistence";
import { feetToInches, inchesToFeet } from "@/domain/physical-units";

const noLimits: InventoryConfiguration = {
  "round-table-60": null,
  "rectangle-table-6": null,
  "rectangle-table-8": null,
  "parson-table-7": null,
  "sweetheart-table": null,
  chairs: null,
};

const magnolia = getLocationBySlug("magnolia")!;
const hiddenMagnolia = getHallBySlug(magnolia, "the-hidden-magnolia")!;
const magnoliaInventory = resolveInventoryConfiguration(magnolia, hiddenMagnolia);

function createLayoutWith(type: Parameters<typeof createEventObject>[0], count: number) {
  let layout = createEmptyLayout();
  for (let index = 0; index < count; index += 1) {
    const object = createEventObject(type, { x: index * 12, y: 0 }, layout.objects, `${type}-${index}`);
    layout = addObject(layout, object);
  }
  return layout;
}

describe("physical units", () => {
  it("converts feet and inches without changing the canonical value", () => {
    expect(feetToInches(6)).toBe(72);
    expect(feetToInches(8)).toBe(96);
    expect(inchesToFeet(960)).toBe(80);
  });
});

describe("inventory validation", () => {
  it("rejects a table added beyond its configured inventory", () => {
    const first = createEventObject("round-table-60", { x: 0, y: 0 }, [], "one");
    const second = createEventObject("round-table-60", { x: 80, y: 0 }, [first], "two");
    const layout = addObject(addObject(createEmptyLayout(), first), second);

    expect(validateLayoutInventory(layout, { "round-table-60": 1 })).toMatchObject({
      valid: false,
      code: "table-limit",
    });
  });

  it("does not allow duplication to bypass table inventory", () => {
    const table = createEventObject("rectangle-table-6", { x: 0, y: 0 }, [], "one");
    const duplicated = duplicateObject(addObject(createEmptyLayout(), table), table.id, "two");

    expect(validateLayoutInventory(duplicated, { "rectangle-table-6": 1 })).toMatchObject({
      valid: false,
      code: "table-limit",
    });
  });

  it("tracks Parson Tables without adding chairs and enforces their hall availability", () => {
    const layout = createLayoutWith("parson-table-7", 2);

    expect(getInventoryUsage(layout)).toMatchObject({ "parson-table-7": 2, chairs: 0 });
    expect(validateLayoutInventory(layout, { "parson-table-7": 1 })).toMatchObject({
      valid: false,
      code: "table-limit",
      message: "All 1 available Parson tables are already in this floorplan.",
    });
  });

  it("does not allow duplication beyond Magnolia's shared inventory", () => {
    const layout = createLayoutWith("round-table-60", 32);
    const duplicated = duplicateObject(layout, layout.objects[0].id, "over-limit-copy");

    expect(validateLayoutInventory(duplicated, magnoliaInventory, "Magnolia")).toMatchObject({
      valid: false,
      code: "table-limit",
    });
  });

  it("calculates chairs from table seats plus individual chair objects", () => {
    const table = createEventObject("rectangle-table-8", { x: 0, y: 0 }, [], "table");
    const sweetheart = createEventObject("sweetheart-table", { x: 100, y: 0 }, [table], "sweetheart");
    const chair = createEventObject("chair", { x: 200, y: 0 }, [table, sweetheart], "chair");
    const layout = addObject(addObject(addObject(createEmptyLayout(), table), sweetheart), chair);

    expect(getInventoryUsage(layout).chairs).toBe(13);
  });

  it("blocks a seat increase that exceeds chair inventory", () => {
    const table = createEventObject("round-table-60", { x: 0, y: 0 }, [], "table");
    const layout = addObject(createEmptyLayout(), { ...table, seats: 7 });
    const increased = updateObject(layout, table.id, { seats: 8 });

    expect(validateLayoutInventory(layout, { chairs: 7 }, "Magnolia")).toEqual({ valid: true });
    expect(validateLayoutInventory(increased, { chairs: 7 }, "Magnolia")).toMatchObject({
      valid: false,
      code: "chair-limit",
      message: "This change would require 8 chairs, but Magnolia has 7 available.",
    });
  });

  it.each([
    ["round-table-60", 10],
    ["rectangle-table-6", 8],
    ["rectangle-table-8", 10],
    ["sweetheart-table", 2],
  ] as const)("enforces the %s seating maximum", (type, maximum) => {
    const table = createEventObject(type, { x: 0, y: 0 }, [], "table");
    const layout = addObject(createEmptyLayout(), { ...table, seats: maximum + 1 });

    expect(validateLayoutInventory(layout, noLimits)).toMatchObject({ valid: false, code: "seat-limit" });
  });

  it("validates imported JSON against inventory before it is accepted", () => {
    const table = createEventObject("rectangle-table-8", { x: 0, y: 0 }, [], "table");
    const imported = deserializeFloorplan(serializeFloorplan(addObject(createEmptyLayout(), table)));

    expect(validateLayoutInventory(imported, { "rectangle-table-8": 0 })).toMatchObject({
      valid: false,
      code: "table-limit",
    });
  });

  it("rejects imported JSON beyond Magnolia's shared inventory", () => {
    const imported = deserializeFloorplan(serializeFloorplan(createLayoutWith("rectangle-table-6", 5)));

    expect(validateLayoutInventory(imported, magnoliaInventory, "Magnolia")).toMatchObject({
      valid: false,
      code: "table-limit",
    });
  });

  it("treats null and omitted inventory limits as unconfigured", () => {
    const table = createEventObject("round-table-60", { x: 0, y: 0 }, [], "table");
    const layout = duplicateObject(addObject(createEmptyLayout(), table), table.id, "copy");

    expect(validateLayoutInventory(layout, noLimits)).toEqual({ valid: true });
    expect(validateLayoutInventory(layout, {})).toEqual({ valid: true });
  });

  it("enforces Magnolia's confirmed shared total of 320 chairs", () => {
    const allowedLayout = createLayoutWith("chair", 320);
    const overLimitLayout = createLayoutWith("chair", 321);

    expect(magnoliaInventory.chairs).toBe(320);
    expect(validateLayoutInventory(allowedLayout, magnoliaInventory, "Magnolia")).toEqual({ valid: true });
    expect(validateLayoutInventory(overLimitLayout, magnoliaInventory, "Magnolia")).toMatchObject({
      valid: false,
      code: "chair-limit",
      message: "This change would require 321 chairs, but Magnolia has 320 available.",
    });
  });
});
