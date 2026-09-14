export type EventObjectType =
  | "round-table-60"
  | "round-table-72"
  | "rectangle-table-6"
  | "sweetheart-table"
  | "cake-table"
  | "gift-table"
  | "dj"
  | "portable-bar"
  | "buffet"
  | "photo-booth"
  | "dance-floor"
  | "chair";

export type EventObject = {
  id: string;
  type: EventObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  tableNumber?: number;
  seats?: number;
  zIndex: number;
};

export type FloorplanLayout = {
  id: string;
  name: string;
  venueTemplateId: string;
  objects: EventObject[];
  updatedAt: string;
};

export type VenueElement =
  | {
      id: string;
      kind: "area" | "stage" | "service" | "bar";
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
    }
  | {
      id: string;
      kind: "door";
      x: number;
      y: number;
      width: number;
      rotation: number;
      label: string;
    };

export type VenueTemplate = {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  hall: { x: number; y: number; width: number; height: number };
  elements: VenueElement[];
};

export type StoredFloorplan = {
  schemaVersion: 1;
  layout: FloorplanLayout;
};
