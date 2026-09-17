import { describe, expect, it } from "vitest";
import { serializeGuestListCsv } from "@/domain/guest-list-export";

describe("guest list CSV export", () => {
  it("exports populated guest rows with catering and bar details", () => {
    const csv = serializeGuestListCsv([
      {
        tableLabel: "Table 3",
        displaySeatNumber: 2,
        name: 'Jordan "J" Smith',
        serviceNote: "Fish, gluten free",
        role: "Mother of bride",
        rsvpReceived: true,
        noAlcohol: true,
      },
      {
        tableLabel: "Table 3",
        displaySeatNumber: 3,
        name: "",
        serviceNote: "",
        role: "",
        rsvpReceived: false,
        noAlcohol: false,
      },
    ]);

    expect(csv).toContain('"Table","Seat","Guest Name","RSVP Received","Service Note","Role / Group","Under 21 / No Alcohol"');
    expect(csv).toContain('"Table 3","2","Jordan ""J"" Smith","Yes","Fish, gluten free","Mother of bride","Yes"');
    expect(csv).not.toContain('"Table 3","3"');
  });

  it("prevents spreadsheet formulas from executing", () => {
    const csv = serializeGuestListCsv([
      {
        tableLabel: "Table 1",
        displaySeatNumber: 1,
        name: "=HYPERLINK(\"bad\")",
        serviceNote: "",
        role: "",
        rsvpReceived: false,
        noAlcohol: false,
      },
    ]);

    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  });
});
