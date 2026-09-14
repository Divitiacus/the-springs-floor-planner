import { describe, expect, it } from "vitest";
import { createHistory, redoHistory, undoHistory, commitHistory } from "@/domain/history";
import {
  addObject,
  createEmptyLayout,
  createEventObject,
  deleteObject,
  duplicateObject,
  getLayoutStats,
} from "@/domain/layout-operations";
import { deserializeFloorplan, serializeFloorplan } from "@/domain/persistence";
import { OBJECT_CATALOG, OBJECT_DEFINITIONS } from "@/domain/object-catalog";

describe("floorplan object operations", () => {
  it("creates a catalog object with sensible table defaults", () => {
    const object = createEventObject("round-table-60", { x: 240, y: 320 }, [], "table-1");
    expect(object).toMatchObject({
      id: "table-1",
      width: 60,
      height: 60,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 60 },
      tableNumber: 1,
      label: "Table 1",
      seats: 8,
    });
  });

  it("increments table numbers based on existing guest tables", () => {
    const first = createEventObject("round-table-60", { x: 0, y: 0 }, [], "one");
    const second = createEventObject("rectangle-table-8", { x: 0, y: 0 }, [first], "two");
    expect(second.tableNumber).toBe(2);
  });

  it("offers distinct 6-foot and 8-foot rectangle tables without a 72-inch round", () => {
    expect(OBJECT_CATALOG.map((definition) => definition.name)).not.toContain("72-inch Round Table");
    expect(OBJECT_DEFINITIONS["rectangle-table-6"].physicalDimensions).toMatchObject({ lengthInches: 72, depthInches: null });
    expect(OBJECT_DEFINITIONS["rectangle-table-8"].physicalDimensions).toMatchObject({ lengthInches: 96, depthInches: null });
    expect(OBJECT_DEFINITIONS["rectangle-table-8"].width).toBeGreaterThan(OBJECT_DEFINITIONS["rectangle-table-6"].width);
    expect(OBJECT_DEFINITIONS["rectangle-table-8"].height).toBe(OBJECT_DEFINITIONS["rectangle-table-6"].height);
  });

  it("duplicates and offsets an object without mutating the source", () => {
    const source = createEventObject("dance-floor", { x: 300, y: 300 }, [], "source");
    const layout = addObject(createEmptyLayout(), source);
    const duplicated = duplicateObject(layout, source.id, "copy");
    expect(duplicated.objects).toHaveLength(2);
    expect(duplicated.objects[0]).toEqual(source);
    expect(duplicated.objects[1]).toMatchObject({ id: "copy", x: 324, y: 324 });
  });

  it("gives a duplicated guest table the next available number", () => {
    const source = createEventObject("round-table-60", { x: 300, y: 300 }, [], "source");
    const layout = addObject(createEmptyLayout(), source);
    const duplicated = duplicateObject(layout, source.id, "copy");
    expect(duplicated.objects[1]).toMatchObject({ tableNumber: 2, label: "Table 2" });
  });

  it("deletes only the requested object", () => {
    const first = createEventObject("chair", { x: 10, y: 10 }, [], "first");
    const second = createEventObject("chair", { x: 20, y: 20 }, [first], "second");
    const layout = addObject(addObject(createEmptyLayout(), first), second);
    expect(deleteObject(layout, "first").objects.map((object) => object.id)).toEqual(["second"]);
  });

  it("calculates guest table and seating totals", () => {
    const table = createEventObject("round-table-60", { x: 0, y: 0 }, [], "table");
    const sweetheart = createEventObject("sweetheart-table", { x: 0, y: 0 }, [table], "sweetheart");
    const layout = addObject(addObject(createEmptyLayout(), table), sweetheart);
    expect(getLayoutStats(layout)).toEqual({ objectCount: 2, guestTables: 1, seats: 8 });
  });
});

describe("persistence", () => {
  it("round-trips structured JSON", () => {
    const object = createEventObject("buffet", { x: 100, y: 120 }, [], "buffet");
    const layout = addObject(createEmptyLayout(), object);
    expect(deserializeFloorplan(serializeFloorplan(layout))).toEqual(layout);
  });

  it("rejects malformed JSON data", () => {
    expect(() => deserializeFloorplan('{"schemaVersion":2,"layout":{}}')).toThrow(/valid Springs floorplan/);
  });
});

describe("undo and redo", () => {
  it("moves between committed states", () => {
    const history = commitHistory(createHistory("empty"), "one table");
    const undone = undoHistory(history);
    expect(undone.present).toBe("empty");
    expect(redoHistory(undone).present).toBe("one table");
  });
});
