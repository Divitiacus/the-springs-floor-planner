export type EventObjectType =
  | "round-table-60"
  | "rectangle-table-6"
  | "rectangle-table-8"
  | "parson-table-7"
  | "sweetheart-table"
  | "cocktail-table"
  | "cake-table"
  | "gift-table"
  | "dj"
  | "portable-bar"
  | "buffet"
  | "photo-booth"
  | "dance-floor"
  | "chair";

export type DanceFloorVariant = "12x12" | "16x16" | "20x20";
export type CocktailTableVariant = "32-round" | "36-round";
export type EventObjectVariant = DanceFloorVariant | CocktailTableVariant;

export type EventObjectSelection = {
  type: EventObjectType;
  variant?: EventObjectVariant;
};

export type PhysicalObjectDimensions =
  | { status: "confirmed"; shape: "circle"; diameterInches: number }
  | { status: "confirmed"; shape: "rectangle" | "area"; widthInches: number; depthInches: number }
  | { status: "partial"; shape: "rectangle"; lengthInches: number; depthInches: null }
  | { status: "unconfigured"; shape: "circle" | "rectangle" | "area"; widthInches: null; depthInches: null };

export type EventObject = {
  id: string;
  type: EventObjectType;
  variant?: EventObjectVariant;
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

export type PlacementBehavior = "allowed" | "blocked" | "restricted";
export type ArchitectureMeasurementStatus = "confirmed" | "source-traced" | "provisional";

type FixedArchitectureBase = {
  id: string;
  label: string;
  physicalNote?: string;
  fixed: true;
  placementBehavior: PlacementBehavior;
  measurementStatus: ArchitectureMeasurementStatus;
};

export type FixedArchitectureElement =
  | (FixedArchitectureBase & {
      kind: "area";
      role:
        | "main-floor"
        | "stage"
        | "closet"
        | "catering"
        | "bar"
        | "buffet"
        | "porch"
        | "second-floor"
        | "open-to-below"
        | "pillar"
        | "fireplace"
        | "landing";
      shape:
        | { type: "rectangle"; x: number; y: number; width: number; height: number }
        | { type: "polygon"; points: number[] };
      elevation: "floor" | "raised";
      labelRotation?: number;
      showLabel?: boolean;
    })
  | (FixedArchitectureBase & {
      kind: "wall";
      points: number[];
    })
  | (FixedArchitectureBase & {
      kind: "railing";
      points: number[];
    })
  | (FixedArchitectureBase & {
      kind: "door";
      x: number;
      y: number;
      width: number;
      rotation: number;
      swingDirection: "clockwise" | "counterclockwise";
      swingAngle?: number;
    })
  | (FixedArchitectureBase & {
      kind: "stairs";
      x: number;
      y: number;
      width: number;
      height: number;
      orientation: "horizontal" | "vertical";
      treadCount: number;
      treadAxis?: "x" | "y";
      curvedBottom?: boolean;
      showLabel?: boolean;
    })
  | (FixedArchitectureBase & {
      kind: "direction-label";
      x: number;
      y: number;
      width: number;
      rotation?: number;
    })
  | (FixedArchitectureBase & {
      kind: "label";
      x: number;
      y: number;
      width: number;
      rotation?: number;
      fontSize?: number;
    });

export type ReferenceFloorplanAsset = {
  id: string;
  source: string;
  sourceDocument: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visibleByDefault: boolean;
  locked: true;
  interactive: false;
  measurementStatus: "source-traced";
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
  physicalDimensionStatus: ArchitectureMeasurementStatus;
  hall: { x: number; y: number; width: number; height: number };
  elements: FixedArchitectureElement[];
  referenceAsset: ReferenceFloorplanAsset | null;
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
