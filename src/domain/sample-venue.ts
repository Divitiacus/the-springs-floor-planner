import type { LegacyVenueTemplate } from "@/domain/floorplan";

/** Preserved POC template. It is intentionally not used as Magnolia geometry. */
export const SAMPLE_VENUE: LegacyVenueTemplate = {
  id: "cedar-springs-hall-v1",
  name: "Cedar Springs Hall",
  coordinateUnit: "legacy-pixels",
  canvasWidth: 1320,
  canvasHeight: 820,
  hall: { x: 70, y: 70, width: 1180, height: 680 },
  elements: [
    { id: "stage", kind: "stage", x: 472, y: 88, width: 376, height: 96, label: "FOCAL STAGE" },
    { id: "bar", kind: "bar", x: 92, y: 244, width: 82, height: 238, label: "PERMANENT BAR" },
    { id: "kitchen", kind: "service", x: 988, y: 88, width: 240, height: 142, label: "KITCHEN / SERVICE" },
    { id: "patio", kind: "area", x: 456, y: 666, width: 408, height: 66, label: "COVERED PATIO" },
    { id: "entrance", kind: "door", x: 610, y: 744, width: 100, rotation: 0, label: "MAIN ENTRANCE" },
    { id: "service-door", kind: "door", x: 1218, y: 294, width: 72, rotation: 90, label: "SERVICE" },
    { id: "patio-door-left", kind: "door", x: 486, y: 744, width: 72, rotation: 0, label: "PATIO" },
    { id: "patio-door-right", kind: "door", x: 762, y: 744, width: 72, rotation: 0, label: "PATIO" },
  ],
};
