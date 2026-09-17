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
  updateGuestDetails,
  updateSeatingDetails,
  updateObject,
} from "@/domain/layout-operations";
import { deserializeFloorplan, serializeFloorplan, serializePortableFloorplan } from "@/domain/persistence";
import { isObjectAvailableForInventory, OBJECT_CATALOG, OBJECT_DEFINITIONS } from "@/domain/object-catalog";

describe("floorplan object operations", () => {
  it("shows only movable event essentials in the object library catalog", () => {
    const libraryTypes = OBJECT_CATALOG
      .filter((definition) => definition.showInLibrary !== false)
      .map((definition) => definition.type);

    expect(libraryTypes).not.toContain("buffet");
    expect(libraryTypes).toContain("chair");
    expect(libraryTypes).toContain("chair-row");
    expect(OBJECT_DEFINITIONS.buffet).toBeDefined();
    expect(OBJECT_DEFINITIONS.chair).toBeDefined();
    expect(OBJECT_DEFINITIONS["portable-bar"]).toMatchObject({
      name: "Satellite Bar",
      shortLabel: "Satellite Bar",
    });
  });

  it("creates a table-chair-sized single chair with one guest seat", () => {
    const chair = createEventObject("chair", { x: 100, y: 120 }, [], "chair-1");
    const layout = addObject(createEmptyLayout(), chair);

    expect(chair).toMatchObject({
      id: "chair-1",
      label: "Chair",
      width: 10,
      height: 7,
      seats: 1,
    });
    expect(getLayoutStats(layout)).toEqual({ objectCount: 1, guestTables: 0, seats: 1 });
  });

  it("creates an adjustable chair row and refits its width when the seat count changes", () => {
    const row = createEventObject("chair-row", { x: 220, y: 240 }, [], "row-1");
    let layout = addObject(createEmptyLayout(), row);

    expect(row).toMatchObject({
      id: "row-1",
      label: "Chair Row",
      width: 180,
      height: 22,
      seats: 10,
    });

    layout = updateObject(layout, row.id, { seats: 12 });
    expect(layout.objects[0]).toMatchObject({ seats: 12, width: 216, height: 22 });
    expect(getLayoutStats(layout)).toEqual({ objectCount: 1, guestTables: 0, seats: 12 });

    layout = updateObject(layout, row.id, { width: 100, height: 80 });
    expect(layout.objects[0]).toMatchObject({ width: 168, height: 22 });
  });

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
    expect(OBJECT_DEFINITIONS["round-table-60"]).toMatchObject({
      defaultSeats: 8,
      maximumSeats: 10,
    });
  });

  it("increments table numbers based on existing guest tables", () => {
    const first = createEventObject("round-table-60", { x: 0, y: 0 }, [], "one");
    const second = createEventObject("rectangle-table-8", { x: 0, y: 0 }, [first], "two");
    expect(second.tableNumber).toBe(2);
  });

  it("offers distinct 6-foot and 8-foot rectangle tables", () => {
    expect(OBJECT_DEFINITIONS["rectangle-table-6"]).toMatchObject({
      width: 72,
      height: 30,
      resizable: false,
      physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 72, depthInches: 30 },
    });
    expect(OBJECT_DEFINITIONS["rectangle-table-8"]).toMatchObject({
      width: 96,
      height: 30,
      resizable: false,
      physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 96, depthInches: 30 },
    });

    const sixFoot = createEventObject("rectangle-table-6", { x: 0, y: 0 }, [], "six-foot");
    const eightFoot = createEventObject("rectangle-table-8", { x: 0, y: 0 }, [sixFoot], "eight-foot");
    const resized = updateObject(addObject(createEmptyLayout(), sixFoot), sixFoot.id, { width: 120, height: 48 });

    expect(sixFoot).toMatchObject({ width: 72, height: 30 });
    expect(eightFoot).toMatchObject({ width: 96, height: 30 });
    expect(resized.objects[0]).toMatchObject({ width: 72, height: 30 });
  });

  it("restores the confirmed Cypress-only 72-inch round table", () => {
    expect(OBJECT_DEFINITIONS["round-table-72"]).toMatchObject({
      width: 72,
      height: 72,
      defaultSeats: 10,
      maximumSeats: 10,
      inventoryOnly: true,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 72 },
    });
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["round-table-72"], {})).toBe(false);
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["round-table-72"], { "round-table-72": 30 })).toBe(true);
  });

  it("shows table choices only when the selected hall has positive inventory", () => {
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["round-table-60"], {})).toBe(false);
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["round-table-60"], { "round-table-60": 0 })).toBe(false);
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["round-table-60"], { "round-table-60": 32 })).toBe(true);
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["cocktail-table"], { "cocktail-table-32": 5 }, "32-round")).toBe(true);
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["cocktail-table"], { "cocktail-table-32": 5 }, "36-round")).toBe(false);
  });

  it("defines Wallisville-only 48-inch round and wooden Farmhouse tables", () => {
    expect(OBJECT_DEFINITIONS["round-table-48"]).toMatchObject({
      width: 48,
      height: 48,
      defaultSeats: 6,
      maximumSeats: 6,
      inventoryOnly: true,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 48 },
    });
    expect(OBJECT_DEFINITIONS["farmhouse-table-6"]).toMatchObject({
      name: "Wooden Farmhouse Table",
      width: 72,
      height: 30,
      defaultSeats: 8,
      maximumSeats: 8,
      inventoryOnly: true,
      physicalDimensions: { status: "confirmed", shape: "rectangle", widthInches: 72, depthInches: 30 },
    });
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["farmhouse-table-6"], {})).toBe(false);
    expect(isObjectAvailableForInventory(OBJECT_DEFINITIONS["farmhouse-table-6"], { "farmhouse-table-6": 5 })).toBe(true);
  });

  it("creates a fixed-size, non-seating Parson Table from its inventory key", () => {
    const parson = createEventObject("parson-table-7", { x: 0, y: 0 }, [], "parson");
    const resized = updateObject(addObject(createEmptyLayout(), parson), parson.id, {
      width: 120,
      height: 48,
    });

    expect(OBJECT_DEFINITIONS["parson-table-7"]).toMatchObject({
      name: "Parson Table",
      width: 84,
      height: 22,
      resizable: false,
      physicalDimensions: {
        status: "confirmed",
        shape: "rectangle",
        widthInches: 84,
        depthInches: 22,
      },
    });
    expect(parson).toMatchObject({
      type: "parson-table-7",
      label: "Parson",
      width: 84,
      height: 22,
    });
    expect(parson.tableNumber).toBeUndefined();
    expect(parson.seats).toBeUndefined();
    expect(resized.objects[0]).toMatchObject({ width: 84, height: 22 });
  });

  it("uses the confirmed 36-inch round Sweetheart Table footprint", () => {
    const sweetheart = createEventObject("sweetheart-table", { x: 0, y: 0 }, [], "sweetheart");
    const resized = updateObject(addObject(createEmptyLayout(), sweetheart), sweetheart.id, {
      width: 72,
      height: 36,
    });

    expect(sweetheart).toMatchObject({
      width: 36,
      height: 36,
      seats: 2,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 36 },
    });
    expect(OBJECT_DEFINITIONS["sweetheart-table"]).toMatchObject({ resizable: false, maximumSeats: 2 });
    expect(resized.objects[0]).toMatchObject({ width: 36, height: 36 });
  });

  it("represents Weatherford's 33-inch sweetheart and non-seating display rounds separately", () => {
    const sweetheart = createEventObject("sweetheart-table-33", { x: 0, y: 0 }, [], "sweetheart-33");
    const display = createEventObject("display-table-33", { x: 50, y: 0 }, [sweetheart], "display-33");

    expect(sweetheart).toMatchObject({
      label: '33" Sweetheart',
      width: 33,
      height: 33,
      seats: 2,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 33 },
    });
    expect(display).toMatchObject({
      label: '33" Display',
      width: 33,
      height: 33,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 33 },
    });
    expect(display.seats).toBeUndefined();
  });

  it("uses a distinct two-seat 48-inch Sweetheart Table footprint", () => {
    const sweetheart = createEventObject("sweetheart-table-48", { x: 0, y: 0 }, [], "sweetheart-48");

    expect(sweetheart).toMatchObject({
      label: '48" Sweetheart',
      width: 48,
      height: 48,
      seats: 2,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 48 },
    });
    expect(OBJECT_DEFINITIONS["sweetheart-table-48"]).toMatchObject({
      inventoryOnly: true,
      maximumSeats: 2,
    });
  });

  it("creates Tulsa's 32-inch sweetheart and half-moon tables with two seats", () => {
    const sweetheart = createEventObject("sweetheart-table-32", { x: 0, y: 0 }, [], "sweetheart-32");
    const halfMoon = createEventObject("half-moon-table", { x: 60, y: 0 }, [sweetheart], "half-moon");

    expect(sweetheart).toMatchObject({
      label: '32" Sweetheart',
      width: 32,
      height: 32,
      seats: 2,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: 32 },
    });
    expect(halfMoon).toMatchObject({
      label: "Half-Moon",
      width: 48,
      height: 24,
      seats: 2,
      physicalDimensions: { status: "unconfigured", shape: "rectangle" },
    });
  });

  it("supports venue-specific default seats without changing global rectangle capacities", () => {
    const sixFoot = createEventObject("rectangle-table-6", { x: 0, y: 0 }, [], "six-foot", undefined, 6);
    const eightFoot = createEventObject("rectangle-table-8", { x: 100, y: 0 }, [sixFoot], "eight-foot", undefined, 8);

    expect(sixFoot.seats).toBe(6);
    expect(eightFoot.seats).toBe(8);
    expect(OBJECT_DEFINITIONS["rectangle-table-6"].maximumSeats).toBe(8);
    expect(OBJECT_DEFINITIONS["rectangle-table-8"].maximumSeats).toBe(10);
  });

  it.each([
    ["32-round" as const, 32],
    ["36-round" as const, 36],
  ])("creates the confirmed %s Cocktail Table variant at %d inches round", (variant, diameter) => {
    const cocktail = createEventObject("cocktail-table", { x: 0, y: 0 }, [], variant, variant);
    const resized = updateObject(addObject(createEmptyLayout(), cocktail), cocktail.id, {
      width: 60,
      height: 60,
    });

    expect(cocktail).toMatchObject({
      variant,
      width: diameter,
      height: diameter,
      physicalDimensions: { status: "confirmed", shape: "circle", diameterInches: diameter },
    });
    expect(cocktail.seats).toBeUndefined();
    expect(cocktail.tableNumber).toBeUndefined();
    expect(resized.objects[0]).toMatchObject({ variant, width: diameter, height: diameter });
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

  it("keeps linked rectangle tables and end chairs together when one object moves", () => {
    const table = createEventObject("rectangle-table-8", { x: 200, y: 200 }, [], "table");
    const chair = createEventObject("chair", { x: 255, y: 200 }, [table], "chair");
    const unlinked = createEventObject("chair", { x: 400, y: 400 }, [table, chair], "unlinked");
    let layout = addObject(addObject(addObject(createEmptyLayout(), table), chair), unlinked);

    layout = updateSeatingDetails(layout, table.id, [], [chair.id], "linked-table-end-chair");
    layout = updateObject(layout, table.id, { x: 230, y: 215 });

    expect(layout.objects.find((object) => object.id === table.id)).toMatchObject({ x: 230, y: 215, linkedGroupId: "linked-table-end-chair" });
    expect(layout.objects.find((object) => object.id === chair.id)).toMatchObject({ x: 285, y: 215, linkedGroupId: "linked-table-end-chair" });
    const untouched = layout.objects.find((object) => object.id === unlinked.id);
    expect(untouched).toMatchObject({ x: 400, y: 400 });
    expect(untouched?.linkedGroupId).toBeUndefined();
  });

  it("snaps a newly linked chair to the nearest table end with the table's rotation", () => {
    const table = {
      ...createEventObject("rectangle-table-8", { x: 200, y: 200 }, [], "table"),
      rotation: -37,
    };
    const chair = createEventObject("chair", { x: 360, y: 260 }, [table], "chair");
    let layout = addObject(addObject(createEmptyLayout(), table), chair);

    layout = updateSeatingDetails(layout, table.id, [], [chair.id], "end-chair");

    const linkedChair = layout.objects.find((object) => object.id === chair.id);
    const radians = table.rotation * Math.PI / 180;
    expect(linkedChair).toMatchObject({ rotation: -37, linkedGroupId: "end-chair" });
    expect(linkedChair?.x).toBeCloseTo(table.x + 55 * Math.cos(radians));
    expect(linkedChair?.y).toBeCloseTo(table.y + 55 * Math.sin(radians));
  });

  it("keeps an end chair aligned and equally spaced when its table rotates", () => {
    const table = createEventObject("rectangle-table-8", { x: 200, y: 200 }, [], "table");
    const chair = createEventObject("chair", { x: 400, y: 200 }, [table], "chair");
    let layout = addObject(addObject(createEmptyLayout(), table), chair);

    layout = updateSeatingDetails(layout, table.id, [], [chair.id], "rotating-table");
    expect(layout.objects.find((object) => object.id === chair.id)).toMatchObject({ x: 255, y: 200, rotation: 0 });

    layout = updateObject(layout, table.id, { rotation: 90 });
    expect(layout.objects.find((object) => object.id === table.id)).toMatchObject({ x: 200, y: 200, rotation: 90 });
    expect(layout.objects.find((object) => object.id === chair.id)).toMatchObject({ x: 200, y: 255, rotation: 90 });
  });

  it("places two linked chairs at opposite ends of one rectangle table", () => {
    const table = createEventObject("rectangle-table-6", { x: 200, y: 200 }, [], "table");
    const leftChair = createEventObject("chair", { x: 80, y: 200 }, [table], "left-chair");
    const rightChair = createEventObject("chair", { x: 340, y: 200 }, [table, leftChair], "right-chair");
    let layout = addObject(addObject(addObject(createEmptyLayout(), table), leftChair), rightChair);

    layout = updateSeatingDetails(layout, table.id, [], [leftChair.id, rightChair.id], "two-end-chairs");

    expect(layout.objects.find((object) => object.id === leftChair.id)).toMatchObject({ x: 157, y: 200, rotation: 0 });
    expect(layout.objects.find((object) => object.id === rightChair.id)).toMatchObject({ x: 243, y: 200, rotation: 0 });
  });

  it("stores exactly one guest-name slot per current seat and removes stale names when the count drops", () => {
    const table = createEventObject("rectangle-table-8", { x: 200, y: 200 }, [], "table");
    let layout = addObject(createEmptyLayout(), table);
    layout = updateObject(layout, table.id, { seats: 7 });
    layout = updateSeatingDetails(layout, table.id, ["A", "B", "C", "D", "E", "F", "G"], [], "unused");

    expect(layout.objects[0].seatAssignments).toEqual(["A", "B", "C", "D", "E", "F", "G"]);

    layout = updateObject(layout, table.id, { seats: 5 });
    expect(layout.objects[0].seatAssignments).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("saves guest names for linked end chairs from the table details", () => {
    const table = {
      ...createEventObject("rectangle-table-8", { x: 200, y: 200 }, [], "table"),
      seats: 7,
    };
    const firstChair = createEventObject("chair", { x: 145, y: 200 }, [table], "first-chair");
    const secondChair = createEventObject("chair", { x: 255, y: 200 }, [table, firstChair], "second-chair");
    const layout = addObject(addObject(addObject(createEmptyLayout(), table), firstChair), secondChair);

    const updated = updateSeatingDetails(
      layout,
      table.id,
      ["Jason", "Audrey", "Jenny", "Paul", "Andy", "Amanda", "Mom"],
      [firstChair.id, secondChair.id],
      "nine-seat-table",
      {
        [firstChair.id]: ["Seat Eight"],
        [secondChair.id]: ["Seat Nine"],
      },
    );

    expect(updated.objects.find((object) => object.id === table.id)?.seatAssignments).toEqual(["Jason", "Audrey", "Jenny", "Paul", "Andy", "Amanda", "Mom"]);
    expect(updated.objects.find((object) => object.id === firstChair.id)).toMatchObject({ seatAssignments: ["Seat Eight"], linkedGroupId: "nine-seat-table" });
    expect(updated.objects.find((object) => object.id === secondChair.id)).toMatchObject({ seatAssignments: ["Seat Nine"], linkedGroupId: "nine-seat-table" });
  });

  it("duplicates seating objects without copying guest names or link membership", () => {
    const table = {
      ...createEventObject("rectangle-table-6", { x: 200, y: 200 }, [], "table"),
      seatAssignments: ["Alex", "Bailey"],
      seatMeals: ["Chicken", "Vegetarian"],
      seatRoles: ["VIP", "Wedding party"],
      seatNoAlcohol: [false, true],
      seatRsvpReceived: [true, false],
      linkedGroupId: "head-table",
    };
    const layout = duplicateObject(addObject(createEmptyLayout(), table), table.id, "copy");

    expect(layout.objects[1]).toMatchObject({
      id: "copy",
      seatAssignments: undefined,
      seatMeals: undefined,
      seatRoles: undefined,
      seatNoAlcohol: undefined,
      seatRsvpReceived: undefined,
      linkedGroupId: undefined,
    });
  });

  it("calculates guest table and seating totals", () => {
    const table = createEventObject("round-table-60", { x: 0, y: 0 }, [], "table");
    const sweetheart = createEventObject("sweetheart-table", { x: 0, y: 0 }, [table], "sweetheart");
    const chair = createEventObject("chair", { x: 120, y: 0 }, [table, sweetheart], "chair");
    const layout = addObject(addObject(addObject(createEmptyLayout(), table), sweetheart), chair);
    expect(getLayoutStats(layout)).toEqual({ objectCount: 3, guestTables: 1, seats: 11 });
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
    const object = {
      ...createEventObject("dance-floor", { x: 100, y: 120 }, [], "dance-floor", "12x12"),
      levelId: "level-2-balcony",
    };
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
        levelId: "level-2-balcony",
      }],
    });
  });

  it("still opens version 3 compact files without a floor assignment", () => {
    const reopened = deserializeFloorplan(
      '{"v":3,"h":"hall_the_chateau_cypress","n":"Legacy Plan","o":[["dj",null,100,120,72,72,0,"DJ",null,null,1]]}',
    );

    expect(reopened.objects[0]).toMatchObject({ type: "dj", x: 100, y: 120 });
    expect(reopened.objects[0].levelId).toBeUndefined();
  });

  it("round-trips a Parson Table through the compact editable file", () => {
    const parson = createEventObject("parson-table-7", { x: 220, y: 180 }, [], "parson");
    const layout = addObject(
      { ...createEmptyLayout("hall_sycamore_grove"), name: "Parson Layout" },
      parson,
    );
    const reopened = deserializeFloorplan(serializePortableFloorplan(layout));

    expect(reopened.objects[0]).toMatchObject({
      type: "parson-table-7",
      width: 84,
      height: 22,
      physicalDimensions: { widthInches: 84, depthInches: 22 },
    });
  });

  it("round-trips a Cocktail Table variant through the compact editable file", () => {
    const cocktail = createEventObject("cocktail-table", { x: 220, y: 180 }, [], "cocktail", "36-round");
    const layout = addObject(
      { ...createEmptyLayout("hall_sycamore_grove"), name: "Cocktail Layout" },
      cocktail,
    );
    const reopened = deserializeFloorplan(serializePortableFloorplan(layout));

    expect(reopened.objects[0]).toMatchObject({
      type: "cocktail-table",
      variant: "36-round",
      width: 36,
      height: 36,
      physicalDimensions: { shape: "circle", diameterInches: 36 },
    });
  });

  it("round-trips a single chair with its seat count and table-chair footprint", () => {
    const chair = createEventObject("chair", { x: 220, y: 180 }, [], "chair");
    const layout = addObject(
      { ...createEmptyLayout("hall_parker_manor"), name: "Extra Chair Layout" },
      chair,
    );
    const reopened = deserializeFloorplan(serializePortableFloorplan(layout));

    expect(reopened.objects[0]).toMatchObject({
      type: "chair",
      label: "Chair",
      seats: 1,
      width: 10,
      height: 7,
    });
    expect(getLayoutStats(reopened).seats).toBe(1);
  });

  it("round-trips an adjusted chair row through the compact editable file", () => {
    const row = {
      ...createEventObject("chair-row", { x: 260, y: 320 }, [], "ceremony-row"),
      width: 196,
      seats: 11,
      levelId: "ceremony-site",
    };
    const layout = addObject(
      { ...createEmptyLayout("hall_the_chateau_cypress"), name: "Ceremony Layout" },
      row,
    );
    const reopened = deserializeFloorplan(serializePortableFloorplan(layout));

    expect(reopened.objects[0]).toMatchObject({
      type: "chair-row",
      width: 196,
      height: 22,
      seats: 11,
      levelId: "ceremony-site",
    });
  });

  it("keeps each guest row tied to its exact object and seat", () => {
    const table = createEventObject("rectangle-table-8", { x: 220, y: 180 }, [], "table");
    const chair = createEventObject("chair", { x: 275, y: 180 }, [table], "chair");
    let layout = addObject(addObject(createEmptyLayout("hall_rockwall_manor"), table), chair);

    layout = updateGuestDetails(layout, table.id, 0, { name: "Jason", meal: "Chicken", role: "Best man", noAlcohol: true, rsvpReceived: true });
    layout = updateGuestDetails(layout, chair.id, 0, { name: "Jordan", meal: "Vegetarian", role: "Vendor", noAlcohol: false, rsvpReceived: false });

    expect(layout.objects.find((object) => object.id === table.id)).toMatchObject({
      seatAssignments: ["Jason", "", "", "", "", "", "", "", "", ""],
      seatMeals: ["Chicken", "", "", "", "", "", "", "", "", ""],
      seatRoles: ["Best man", "", "", "", "", "", "", "", "", ""],
      seatNoAlcohol: [true, false, false, false, false, false, false, false, false, false],
      seatRsvpReceived: [true, false, false, false, false, false, false, false, false, false],
    });
    expect(layout.objects.find((object) => object.id === chair.id)).toMatchObject({ seatAssignments: ["Jordan"] });
  });

  it("round-trips RSVP and guest service details through version 8 editable files", () => {
    const table = {
      ...createEventObject("rectangle-table-8", { x: 220, y: 180 }, [], "table"),
      seatAssignments: ["Jason", "Bailey", "Casey", "Dakota", "Emery", "Finley", "Gray", "Harper", "", ""],
      seatMeals: ["Chicken", "Vegetarian", "", "", "", "", "", "", "", ""],
      seatRoles: ["Best man", "Mother of bride", "", "", "", "", "", "", "", ""],
      seatNoAlcohol: [false, true, false, false, false, false, false, false, false, false],
      seatRsvpReceived: [true, false, true, false, false, false, false, false, false, false],
      linkedGroupId: "family-table",
    };
    const chair = {
      ...createEventObject("chair", { x: 275, y: 180 }, [table], "chair"),
      seatAssignments: ["Jordan"],
      linkedGroupId: "family-table",
    };
    const layout = addObject(
      addObject({ ...createEmptyLayout("hall_rockwall_manor"), name: "Named Seating" }, table),
      chair,
    );
    const serialized = serializePortableFloorplan(layout);
    const reopened = deserializeFloorplan(serialized);

    expect(JSON.parse(serialized).v).toBe(8);
    expect(reopened.objects).toMatchObject([
      {
        seatAssignments: table.seatAssignments,
        seatMeals: table.seatMeals,
        seatRoles: table.seatRoles,
        seatNoAlcohol: table.seatNoAlcohol,
        seatRsvpReceived: table.seatRsvpReceived,
        linkedGroupId: "family-table",
      },
      { seatAssignments: ["Jordan"], linkedGroupId: "family-table" },
    ]);
  });

  it("still opens version 7 guest files without RSVP data", () => {
    const reopened = deserializeFloorplan(
      '{"v":7,"h":"hall_rockwall_manor","n":"Service Plan","o":[["chair",null,220,180,10,7,0,"Chair",null,1,0,null,["Jason"],null,["Fish"],["Family"],[false]]]}',
    );

    expect(reopened.objects[0]).toMatchObject({
      type: "chair",
      seatAssignments: ["Jason"],
      seatMeals: ["Fish"],
      seatRoles: ["Family"],
      seatNoAlcohol: [false],
    });
    expect(reopened.objects[0].seatRsvpReceived).toBeUndefined();
  });

  it("still opens version 5 named-seating files", () => {
    const reopened = deserializeFloorplan(
      '{"v":5,"h":"hall_rockwall_manor","n":"Named Seating","o":[["chair",null,220,180,10,7,0,"Chair",null,1,0,null,["Jason"],null]]}',
    );

    expect(reopened.objects[0]).toMatchObject({ type: "chair", seatAssignments: ["Jason"] });
  });

  it("still opens version 6 guest spreadsheet files", () => {
    const reopened = deserializeFloorplan(
      '{"v":6,"h":"hall_rockwall_manor","n":"Service Plan","o":[["chair",null,220,180,10,7,0,"Chair",null,1,0,null,["Jason"],null,["Fish"],["Family"]]]}',
    );

    expect(reopened.objects[0]).toMatchObject({
      type: "chair",
      seatAssignments: ["Jason"],
      seatMeals: ["Fish"],
      seatRoles: ["Family"],
    });
    expect(reopened.objects[0].seatNoAlcohol).toBeUndefined();
  });

  it("reopens fixed rectangle tables at their current confirmed catalog size", () => {
    const table = {
      ...createEventObject("rectangle-table-6", { x: 220, y: 180 }, [], "rectangle"),
      height: 36,
    };
    const layout = addObject(
      { ...createEmptyLayout("hall_hidden_magnolia"), name: "Rectangle Layout" },
      table,
    );
    const reopened = deserializeFloorplan(serializePortableFloorplan(layout));

    expect(reopened.objects[0]).toMatchObject({
      type: "rectangle-table-6",
      width: 72,
      height: 30,
      physicalDimensions: { widthInches: 72, depthInches: 30 },
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
