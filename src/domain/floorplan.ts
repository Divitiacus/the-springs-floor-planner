export type EventObjectType =
  | "round-table-60"
  | "rectangle-table-6"
  | "rectangle-table-8"
  | "sweetheart-table"
  | "cake-table"
  | "gift-table"
  | "dj"
  | "portable-bar"
  | "buffet"
  | "photo-booth"
  | "dance-floor"
  | "chair";

export type PhysicalObjectDimensions =
  | { status: "confirmed"; shape: "circle"; diameterInches: number }
  | { status: "partial"; shape: "rectangle"; lengthInches: number; depthInches: null }
  | { status: "unconfigured"; shape: "circle" | "rectangle" | "area"; widthInches: null; depthInches: null };

export type EventObject = {
  id: string;
  type: EventObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  physicalDimensions: PhysicalObjectDimensions;
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
  coordinateUnit: "inches";
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
  coordinateUnit: "inches";
  physicalWidthInches: number;
  physicalHeightInches: number;
  physicalDimensionStatus: "confirmed" | "provisional";
  hall: { x: number; y: number; width: number; height: number };
  elements: VenueElement[];
};

export type LegacyVenueTemplate = {
  id: string;
  name: string;
  coordinateUnit: "legacy-pixels";
  canvasWidth: number;
  canvasHeight: number;
  hall: { x: number; y: number; width: number; height: number };
  elements: VenueElement[];
};

export type StoredFloorplan = {
  schemaVersion: 2;
  layout: FloorplanLayout;
};
