import { describe, expect, it } from "vitest";
import { createHistory, redoHistory, undoHistory, commitHistory } from "@/domain/history";
import {
  addObject,
  createEmptyLayout,
  createEventObject,
  deleteObject,
  duplicateObject,
  getLayoutStats,
  normalizePhysicalFootprints,
  updateObject,
} from "@/domain/layout-operations";
import { deserializeFloorplan, serializeFloorplan, serializePortableFloorplan } from "@/domain/persistence";
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

  it("uses the confirmed DJ and Photo Booth footprints", () => {
    const dj = createEventObject("dj", { x: 0, y: 0 }, [], "dj");
    const photoBooth = createEventObject("photo-booth", { x: 0, y: 0 }, [], "photo-booth");

    expect(dj).toMatchObject({ width: 72, height: 72, physicalDimensions: { status: "confirmed", widthInches: 72, depthInches: 72 } });
    expect(photoBooth).toMatchObject({ width: 120, height: 120, physicalDimensions: { status: "confirmed", widthInches: 120, depthInches: 120 } });
    expect(OBJECT_DEFINITIONS.dj.resizable).toBe(false);
    expect(OBJECT_DEFINITIONS["photo-booth"]).toMatchObject({ resizable: false, regionalStyleKey: "photo-booth" });
  });

  it.each([
    ["12x12" as const, 144],
    ["16x16" as const, 192],
    ["20x20" as const, 240],
  ])("creates the approved %s Dance Floor at %d inches square", (variant, size) => {
    const danceFloor = createEventObject("dance-floor", { x: 0, y: 0 }, [], variant, variant);

    expect(danceFloor).toMatchObject({
      variant,
      width: size,
      height: size,
      physicalDimensions: { status: "confirmed", shape: "area", widthInches: size, depthInches: size },
    });
  });

  it("does not permit arbitrary resizing of an approved Dance Floor variant", () => {
    const danceFloor = createEventObject("dance-floor", { x: 0, y: 0 }, [], "dance-floor", "12x12");
    const layout = addObject(createEmptyLayout(), danceFloor);
    const attemptedResize = updateObject(layout, danceFloor.id, { width: 175, height: 181 });

    expect(attemptedResize.objects[0]).toMatchObject({ variant: "12x12", width: 144, height: 144 });
    expect(OBJECT_DEFINITIONS["dance-floor"].resizable).toBe(false);
  });

  it("normalizes legacy saved production footprints to confirmed catalog sizes", () => {
    const legacyDanceFloor = {
      ...createEventObject("dance-floor", { x: 0, y: 0 }, [], "legacy"),
      variant: undefined,
      width: 260,
      height: 220,
      physicalDimensions: { status: "unconfigured", shape: "area", widthInches: null, depthInches: null } as const,
    };
    const normalized = normalizePhysicalFootprints(addObject(createEmptyLayout(), legacyDanceFloor));

    expect(normalized.objects[0]).toMatchObject({
      variant: "16x16",
      width: 192,
      height: 192,
      physicalDimensions: { status: "confirmed", widthInches: 192, depthInches: 192 },
    });
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

  it("creates a compact editable file and rebuilds derived object data when opened", () => {
    const object = createEventObject("dance-floor", { x: 100, y: 120 }, [], "dance-floor", "12x12");
    const layout = addObject({ ...createEmptyLayout("hall_hidden_magnolia"), name: "Taylor Reception" }, object);
    const portable = serializePortableFloorplan(layout);
    const reopened = deserializeFloorplan(portable);

    expect(portable.length).toBeLessThan(serializeFloorplan(layout).length);
    expect(portable).not.toContain("physicalDimensions");
    expect(portable).not.toContain('"id"');
    expect(reopened).toMatchObject({
      name: layout.name,
      venueTemplateId: "hall_hidden_magnolia",
      objects: [{
        type: "dance-floor",
        variant: "12x12",
        width: 144,
        height: 144,
        physicalDimensions: { widthInches: 144, depthInches: 144 },
      }],
    });
  });

  it("rejects malformed compact editable files", () => {
    expect(() => deserializeFloorplan('{"v":3,"h":"hall","n":"Plan","o":[["dj"]]}')).toThrow(/valid Springs floorplan/);
  });

  it("requires an event or client name before creating an editable file", () => {
    expect(createEmptyLayout().name).toBe("");
    expect(() => serializePortableFloorplan(createEmptyLayout())).toThrow(/event or client name/i);
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
