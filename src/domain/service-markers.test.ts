import { describe, expect, it } from "vitest";
import { createEventObject } from "@/domain/layout-operations";
import { buildServicePlan, getSeatServiceColor, NO_ALCOHOL_COLOR } from "@/domain/service-markers";

describe("service markers", () => {
  it("keeps a true majority neutral and assigns colors to the exceptions", () => {
    const table = {
      ...createEventObject("round-table-60", { x: 100, y: 100 }, [], "table"),
      seatMeals: ["House", "House", "House", "House", "House", "House", "Fish", "Vegetarian"],
      seatNoAlcohol: [false, true, false, false, false, false, false, false],
    };

    const plan = buildServicePlan([table]);

    expect(plan.defaultLabel).toBe("House");
    expect(plan.markers.map((marker) => marker.label)).toEqual(["Fish", "Vegetarian"]);
    expect(plan.hasNoAlcohol).toBe(true);
    expect(getSeatServiceColor(table, 0, plan)).toBeUndefined();
    expect(getSeatServiceColor(table, 6, plan)).toBe(plan.markers[0].color);
    expect(NO_ALCOHOL_COLOR).toBe("#67b7d1");
  });

  it("treats nonblank notes as exceptions when blank seats are the default", () => {
    const table = {
      ...createEventObject("round-table-60", { x: 100, y: 100 }, [], "table"),
      seatMeals: ["", "", "", "", "", "", "Allergy", "Vendor"],
    };

    const plan = buildServicePlan([table]);

    expect(plan.defaultLabel).toBeUndefined();
    expect(plan.markers.map((marker) => marker.label)).toEqual(["Allergy", "Vendor"]);
    expect(getSeatServiceColor(table, 6, plan)).toBeTruthy();
  });

  it("finds the usual service from assigned guests instead of counting unused chairs", () => {
    const table = {
      ...createEventObject("rectangle-table-8", { x: 100, y: 100 }, [], "table"),
      seats: 10,
      seatAssignments: ["A", "B", "C", "D"],
      seatMeals: ["House", "House", "House", "Fish"],
    };

    const plan = buildServicePlan([table]);

    expect(plan.defaultLabel).toBe("House");
    expect(plan.markers.map((marker) => marker.label)).toEqual(["Fish"]);
  });
});
