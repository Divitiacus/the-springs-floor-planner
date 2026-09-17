export type GuestListExportRow = {
  tableLabel: string;
  displaySeatNumber: number;
  name: string;
  serviceNote: string;
  role: string;
  rsvpReceived: boolean;
  noAlcohol: boolean;
};

const CSV_HEADERS = [
  "Table",
  "Seat",
  "Guest Name",
  "RSVP Received",
  "Service Note",
  "Role / Group",
  "Under 21 / No Alcohol",
] as const;

export function serializeGuestListCsv(rows: readonly GuestListExportRow[]) {
  const exportRows = rows.filter(hasGuestDetails);
  const records = [
    CSV_HEADERS,
    ...exportRows.map((row) => [
      row.tableLabel,
      String(row.displaySeatNumber),
      row.name,
      row.rsvpReceived ? "Yes" : "",
      row.serviceNote,
      row.role,
      row.noAlcohol ? "Yes" : "",
    ]),
  ];

  return `\uFEFF${records.map((record) => record.map(escapeCsvValue).join(",")).join("\r\n")}`;
}

export function hasGuestDetails(row: Pick<GuestListExportRow, "name" | "serviceNote" | "role" | "rsvpReceived" | "noAlcohol">) {
  return Boolean(row.name.trim() || row.serviceNote.trim() || row.role.trim() || row.rsvpReceived || row.noAlcohol);
}

function escapeCsvValue(value: string) {
  const excelSafeValue = /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
  return `"${excelSafeValue.replaceAll('"', '""')}"`;
}
