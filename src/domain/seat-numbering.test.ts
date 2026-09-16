import { describe, expect, it } from "vitest";
import { createEventObject } from "@/domain/layout-operations";
import { getSeatNumbering } from "@/domain/seat-numbering";

describe("seat numbering", () => {
  it("continues a seven-seat table through two linked end chairs", () => {
    const table = {
      ...createEventObject("rectangle-table-8", { x: 200, y: 200 }, [], "table"),
      seats: 7,
      linkedGroupId: "family-table",
      zIndex: 1,
    };
    const leftChair = {
      ...createEventObject("chair", { x: 145, y: 200 }, [table], "left-chair"),
      linkedGroupId: "family-table",
      zIndex: 2,
    };
    const rightChair = {
      ...createEventObject("chair", { x: 255, y: 200 }, [table, leftChair], "right-chair"),
      linkedGroupId: "family-table",
      zIndex: 3,
    };

    const numbering = getSeatNumbering([table, leftChair, rightChair]);

    expect(numbering.linkedChairSeats.get(leftChair.id)).toMatchObject({ tableId: table.id, tableNumber: 1, firstSeatNumber: 8 });
    expect(numbering.linkedChairSeats.get(rightChair.id)).toMatchObject({ tableId: table.id, tableNumber: 1, firstSeatNumber: 9 });
    expect(numbering.totalSeatsByTableId.get(table.id)).toBe(9);
  });

  it("assigns a linked chair to the nearest table in a combined group", () => {
    const firstTable = {
      ...createEventObject("rectangle-table-6", { x: 100, y: 100 }, [], "first-table"),
      linkedGroupId: "combined-table",
      zIndex: 1,
    };
    const secondTable = {
      ...createEventObject("rectangle-table-6", { x: 300, y: 100 }, [firstTable], "second-table"),
      linkedGroupId: "combined-table",
      zIndex: 2,
    };
    const chair = {
      ...createEventObject("chair", { x: 350, y: 100 }, [firstTable, secondTable], "chair"),
      linkedGroupId: "combined-table",
      zIndex: 3,
    };

    const numbering = getSeatNumbering([firstTable, secondTable, chair]);

    expect(numbering.linkedChairSeats.get(chair.id)).toMatchObject({
      tableId: secondTable.id,
      tableNumber: secondTable.tableNumber,
      firstSeatNumber: (secondTable.seats ?? 0) + 1,
    });
  });
});
