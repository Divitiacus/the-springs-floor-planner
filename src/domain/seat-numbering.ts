import type { EventObject } from "@/domain/floorplan";

export type LinkedChairSeatAssignment = {
  tableId: string;
  tableNumber: number;
  firstSeatNumber: number;
};

export type SeatNumbering = {
  linkedChairSeats: Map<string, LinkedChairSeatAssignment>;
  totalSeatsByTableId: Map<string, number>;
};

export function getSeatNumbering(objects: readonly EventObject[]): SeatNumbering {
  const linkedChairSeats = new Map<string, LinkedChairSeatAssignment>();
  const totalSeatsByTableId = new Map<string, number>();
  const groups = new Map<string, EventObject[]>();

  for (const object of objects) {
    if (object.tableNumber !== undefined) {
      totalSeatsByTableId.set(object.id, seatCount(object));
    }
    if (!object.linkedGroupId) continue;
    const group = groups.get(object.linkedGroupId) ?? [];
    group.push(object);
    groups.set(object.linkedGroupId, group);
  }

  for (const group of groups.values()) {
    const tables = group
      .filter((object) => object.tableNumber !== undefined)
      .sort(byLayerThenId);
    const chairs = group
      .filter((object) => object.type === "chair")
      .sort(byLayerThenId);
    const nextSeatByTable = new Map(tables.map((table) => [table.id, seatCount(table) + 1]));

    for (const chair of chairs) {
      const table = nearestTable(chair, tables);
      if (!table || table.tableNumber === undefined) continue;

      const firstSeatNumber = nextSeatByTable.get(table.id) ?? 1;
      const linkedSeatCount = seatCount(chair);
      linkedChairSeats.set(chair.id, {
        tableId: table.id,
        tableNumber: table.tableNumber,
        firstSeatNumber,
      });
      nextSeatByTable.set(table.id, firstSeatNumber + linkedSeatCount);
      totalSeatsByTableId.set(table.id, (totalSeatsByTableId.get(table.id) ?? seatCount(table)) + linkedSeatCount);
    }
  }

  return { linkedChairSeats, totalSeatsByTableId };
}

function nearestTable(chair: EventObject, tables: readonly EventObject[]) {
  let nearest: EventObject | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const table of tables) {
    const distance = Math.hypot(chair.x - table.x, chair.y - table.y);
    if (distance < nearestDistance) {
      nearest = table;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function seatCount(object: EventObject) {
  return Math.max(0, Math.floor(object.seats ?? 0));
}

function byLayerThenId(first: EventObject, second: EventObject) {
  return first.zIndex - second.zIndex || first.id.localeCompare(second.id);
}
