"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Arc, Circle, Group, Image as KonvaImage, Layer, Line, Path, Rect, Stage, Text, Transformer } from "react-konva";
import type {
  EventObject,
  EventObjectSelection,
  FixedArchitectureElement,
  FloorplanLayout,
  ReferenceFloorplanAsset,
  VenueFloorRegion,
  VenueTemplate,
} from "@/domain/floorplan";
import { OBJECT_DEFINITIONS, isGuestTable, TABLE_TYPES } from "@/domain/object-catalog";
import type { ServicePlan } from "@/domain/service-markers";
import { DEFAULT_SEAT_COLOR, getSeatServiceColor, NO_ALCOHOL_COLOR } from "@/domain/service-markers";
import type { EditorMode } from "@/components/editor/EditorToolbar";

type Props = {
  layout: FloorplanLayout;
  servicePlan: ServicePlan;
  venue: VenueTemplate;
  selectedId: string | null;
  mode: EditorMode;
  zoom: number;
  showReference: boolean;
  resetViewKey: number;
  onSelect: (id: string | null) => void;
  onAdd: (selection: EventObjectSelection, position: { x: number; y: number }) => void;
  onChange: (id: string, patch: Partial<EventObject>) => void;
  onOpenDetails: (id: string) => void;
  onZoomChange: (zoom: number) => void;
};

export function FloorplanCanvas({ layout, servicePlan, venue, selectedId, mode, zoom, showReference, onSelect, onAdd, onChange, onOpenDetails, onZoomChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Group>());
  const [size, setSize] = useState({ width: 900, height: 650 });
  const [stagePosition, setStagePosition] = useState<{ x: number; y: number } | null>(null);

  const fitScale = useMemo(
    () => Math.min(size.width / venue.physicalWidthInches, size.height / venue.physicalHeightInches) * 0.93,
    [size, venue.physicalHeightInches, venue.physicalWidthInches],
  );
  const scale = fitScale * zoom;
  const hasArchitecturalBase = venue.referenceAsset?.visualRole === "architectural-base";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resize = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    resize.observe(container);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const node = selectedId ? nodeRefs.current.get(selectedId) : undefined;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [layout.objects, selectedId]);

  const selected = layout.objects.find((object) => object.id === selectedId);
  const resizable = selected ? OBJECT_DEFINITIONS[selected.type].resizable : false;
  const position = stagePosition ?? {
    x: (size.width - venue.physicalWidthInches * fitScale) / 2,
    y: (size.height - venue.physicalHeightInches * fitScale) / 2,
  };

  const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;
    const point = { x: (pointer.x - stage.x()) / scale, y: (pointer.y - stage.y()) / scale };
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const nextZoom = Math.min(2.2, Math.max(0.55, zoom * (direction > 0 ? 1.08 : 1 / 1.08)));
    const nextScale = fitScale * nextZoom;
    setStagePosition({ x: pointer.x - point.x * nextScale, y: pointer.y - point.y * nextScale });
    onZoomChange(nextZoom);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData("application/x-springs-object");
    const selection = parseObjectSelection(payload);
    if (!selection || !OBJECT_DEFINITIONS[selection.type]) return;
    const stage = stageRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!stage) return;
    onAdd(selection, {
      x: (event.clientX - rect.left - stage.x()) / scale,
      y: (event.clientY - rect.top - stage.y()) / scale,
    });
  };

  return (
    <div ref={containerRef} className="h-full w-full" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        draggable={mode === "pan"}
        onDragEnd={(event) => {
          if (event.target === event.currentTarget) {
            setStagePosition({ x: event.target.x(), y: event.target.y() });
          }
        }}
        onWheel={handleWheel}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) onSelect(null);
        }}
      >
        <Layer listening={false}>
          <Rect x={0} y={0} width={venue.physicalWidthInches} height={venue.physicalHeightInches} fill="#edf0ec" cornerRadius={12} shadowColor="#506058" shadowBlur={28} shadowOpacity={0.13} shadowOffsetY={8} />
          {(hasArchitecturalBase || showReference) && venue.referenceAsset ? <ReferenceUnderlay asset={venue.referenceAsset} /> : null}
          {hasArchitecturalBase ? null : <VenueLayer venue={venue} />}
        </Layer>

        <Layer>
          {[...layout.objects].sort((a, b) => a.zIndex - b.zIndex).map((object) => (
            <EventObjectNode
              key={object.id}
              object={object}
              servicePlan={servicePlan}
              selected={object.id === selectedId}
              canDrag={mode === "select"}
              setNode={(node) => {
                if (node) nodeRefs.current.set(object.id, node);
                else nodeRefs.current.delete(object.id);
              }}
              onSelect={() => onSelect(object.id)}
              onChange={(patch) => onChange(object.id, patch)}
              onOpenDetails={() => onOpenDetails(object.id)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            resizeEnabled={resizable}
            keepRatio={selected?.type.startsWith("round-table") ?? false}
            enabledAnchors={resizable ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"] : []}
            anchorFill="#fffefa"
            anchorStroke="#294f3d"
            anchorSize={10}
            borderStroke="#294f3d"
            borderStrokeWidth={2}
            rotateAnchorOffset={24}
            boundBoxFunc={(oldBox, newBox) => newBox.width < 24 || newBox.height < 24 ? oldBox : newBox}
          />
        </Layer>
      </Stage>
      <div className="pointer-events-none absolute bottom-12 left-4 rounded-md border border-[#d7ddd8] bg-[#fffefa]/95 px-2.5 py-1.5 text-[10px] font-semibold text-[#67736c] shadow-sm">
        {mode === "pan" ? "Pan mode · H" : "Select mode · V"}
        {hasArchitecturalBase ? " · Original source plan" : venue.referenceAsset ? ` · Reference ${showReference ? "on" : "off"}` : ""}
      </div>
    </div>
  );
}

function ReferenceUnderlay({ asset }: { asset: ReferenceFloorplanAsset }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = asset.source;
    return () => {
      nextImage.onload = null;
    };
  }, [asset.source]);

  if (!image) return null;
  return (
    <KonvaImage
      image={image}
      x={asset.x}
      y={asset.y}
      width={asset.width}
      height={asset.height}
      opacity={asset.opacity}
      listening={false}
    />
  );
}

function VenueLayer({ venue }: { venue: VenueTemplate }) {
  const floorAreaRoles = new Set(["main-floor", "event-floor-extension", "porch", "second-floor", "open-to-below"]);
  const gridAreaRoles = new Set(["main-floor", "event-floor-extension"]);
  const floorElements = venue.elements.filter((element) => element.kind === "area" && floorAreaRoles.has(element.role));
  // Vector-only venues can use explicit floor pieces for the drawing while
  // usableAreas independently enforce their irregular placement boundary.
  const useVectorFloor = venue.referenceAsset === null && floorElements.length > 0;
  const grid = venue.elements.flatMap((element) => {
    if (element.kind !== "area" || !gridAreaRoles.has(element.role) || element.shape.type !== "rectangle") return [];

    const { x, y, width, height } = element.shape;
    const lines = [];
    for (let gridX = firstGridLineAfter(x, venue.hall.x); gridX < x + width; gridX += 60) {
      lines.push(<Line key={`${element.id}-grid-x-${gridX}`} points={[gridX, y, gridX, y + height]} stroke="#e7e9e5" strokeWidth={1} />);
    }
    for (let gridY = firstGridLineAfter(y, venue.hall.y); gridY < y + height; gridY += 60) {
      lines.push(<Line key={`${element.id}-grid-y-${gridY}`} points={[x, gridY, x + width, gridY]} stroke="#e7e9e5" strokeWidth={1} />);
    }
    return lines;
  });

  return (
    <>
      {!useVectorFloor && venue.usableAreas ? venue.usableAreas.map((region) => (
        <FloorRegionNode key={region.id} region={region} />
      )) : floorElements.map((element) => (
        <FixedArchitectureNode key={element.id} element={element} />
      ))}
      {useVectorFloor || !venue.usableAreas ? grid : null}
      {venue.voidAreas?.map((region) => (
        <FloorRegionNode key={region.id} region={region} />
      ))}
      {venue.elements.filter((element) => element.kind === "area" && !floorAreaRoles.has(element.role) && element.role !== "landing").map((element) => (
        <FixedArchitectureNode key={element.id} element={element} />
      ))}
      {venue.elements.filter((element) => element.kind === "wall" || element.kind === "railing" || element.kind === "path").map((element) => (
        <FixedArchitectureNode key={element.id} element={element} />
      ))}
      {venue.elements.filter((element) => element.kind === "area" && element.role === "landing").map((element) => (
        <FixedArchitectureNode key={element.id} element={element} />
      ))}
      {venue.elements.filter((element) => element.kind !== "area" && element.kind !== "wall" && element.kind !== "railing" && element.kind !== "path").map((element) => (
        <FixedArchitectureNode key={element.id} element={element} />
      ))}
      <Text x={venue.hall.x + 18} y={venue.hall.y + 16} text={venue.name.toUpperCase()} fontSize={11} fontStyle="bold" letterSpacing={1.8} fill="#8b968f" />
      <Text
        x={venue.hall.x + 18}
        y={venue.hall.y + 34}
        text={`${formatFeetAndInches(venue.hall.width)} × ${formatFeetAndInches(venue.hall.height)} ${venue.levelName ? "LEVEL VIEW" : "MAIN FLOOR"}`}
        fontSize={9}
        fontStyle="bold"
        letterSpacing={1.1}
        fill="#9aa49e"
      />
    </>
  );
}

function FloorRegionNode({ region }: { region: VenueFloorRegion }) {
  const isVoid = region.kind === "open-to-below";
  const fill = isVoid ? "#fffdfa" : "#eef0ec";
  const stroke = isVoid ? "#8a958e" : "#526159";
  if (region.shape.type === "rectangle") {
    return <Rect {...region.shape} fill={fill} stroke={stroke} strokeWidth={isVoid ? 3 : 2} dash={isVoid ? [8, 7] : undefined} />;
  }
  return <Line points={region.shape.points} closed fill={fill} stroke={stroke} strokeWidth={isVoid ? 3 : 2} dash={isVoid ? [8, 7] : undefined} lineJoin="round" />;
}

function firstGridLineAfter(minimum: number, origin: number) {
  const spacing = 60;
  const aligned = origin + Math.ceil((minimum - origin) / spacing) * spacing;
  return aligned <= minimum ? aligned + spacing : aligned;
}

function formatFeetAndInches(inches: number) {
  const feet = Math.floor(inches / 12);
  const remainder = Math.round(inches - feet * 12);
  return remainder ? `${feet}′${remainder}″` : `${feet}′`;
}

function FixedArchitectureNode({ element }: { element: FixedArchitectureElement }) {
  if (element.kind === "wall") {
    return <Line points={element.points} stroke="#46564d" strokeWidth={7} lineCap="square" lineJoin="miter" />;
  }

  if (element.kind === "railing") {
    return <Line points={element.points} stroke="#78827c" strokeWidth={3} lineCap="square" lineJoin="miter" />;
  }

  if (element.kind === "path") {
    return (
      <Path
        data={element.data}
        fill={element.fill}
        stroke={element.stroke ?? "#657169"}
        strokeWidth={element.strokeWidth ?? 2}
        dash={element.dash}
        opacity={element.opacity ?? 1}
        shadowColor={element.elevation === "raised" ? "#594b39" : undefined}
        shadowBlur={element.elevation === "raised" ? 10 : 0}
        shadowOffsetX={element.elevation === "raised" ? 5 : 0}
        shadowOffsetY={element.elevation === "raised" ? 5 : 0}
        shadowOpacity={element.elevation === "raised" ? 0.22 : 0}
      />
    );
  }

  if (element.kind === "door") {
    const swingSign = element.swingDirection === "clockwise" ? 1 : -1;
    const swingAngle = element.swingAngle ?? 90;
    const swingRadians = (swingAngle * Math.PI) / 180;
    return (
      <Group x={element.x} y={element.y} rotation={element.rotation}>
        <Line points={[0, 0, element.width, 0]} stroke="#fffdfa" strokeWidth={12} />
        <Line points={[0, 0, Math.cos(swingRadians) * element.width, Math.sin(swingRadians) * element.width * swingSign]} stroke="#78877f" strokeWidth={2} />
        <Arc
          x={0}
          y={0}
          innerRadius={element.width - 1}
          outerRadius={element.width + 1}
          angle={swingAngle}
          rotation={swingSign > 0 ? 0 : -swingAngle}
          fill="#a8b3ad"
        />
      </Group>
    );
  }

  if (element.kind === "stairs") {
    const treads = Array.from({ length: element.treadCount + 1 }, (_, index) => {
      const ratio = index / element.treadCount;
      const treadAxis = element.treadAxis ?? (element.orientation === "vertical" ? "x" : "y");
      const flare = element.curvedBottom && treadAxis === "y" && ratio > 0.72
        ? ((ratio - 0.72) / 0.28) * 18
        : element.curvedTop && treadAxis === "y" && ratio < 0.28
          ? ((0.28 - ratio) / 0.28) * 18
          : 0;
      const horizontalFlare = element.curvedRight && treadAxis === "x" && ratio > 0.72
        ? ((ratio - 0.72) / 0.28) * 18
        : 0;
      const points = treadAxis === "x"
        ? [element.x + element.width * ratio, element.y - horizontalFlare, element.x + element.width * ratio, element.y + element.height + horizontalFlare]
        : [element.x - flare, element.y + element.height * ratio, element.x + element.width + flare, element.y + element.height * ratio];
      return <Line key={index} points={points} stroke="#7e8983" strokeWidth={1.5} />;
    });
    const stairShape = element.curvedTop ? (
      <Path
        data={`M ${element.x - 18} ${element.y} C ${element.x - 10} ${element.y + 5}, ${element.x} ${element.y + 11}, ${element.x} ${element.y + 25} L ${element.x} ${element.y + element.height} L ${element.x + element.width} ${element.y + element.height} L ${element.x + element.width} ${element.y + 25} C ${element.x + element.width} ${element.y + 11}, ${element.x + element.width + 10} ${element.y + 5}, ${element.x + element.width + 18} ${element.y} Z`}
        fill="#e2e4df"
        stroke="#657169"
        strokeWidth={2}
      />
    ) : element.curvedBottom ? (
      <Path
        data={`M ${element.x} ${element.y} L ${element.x + element.width} ${element.y} L ${element.x + element.width} ${element.y + element.height - 25} C ${element.x + element.width} ${element.y + element.height - 11}, ${element.x + element.width + 10} ${element.y + element.height - 5}, ${element.x + element.width + 18} ${element.y + element.height} L ${element.x - 18} ${element.y + element.height} C ${element.x - 10} ${element.y + element.height - 5}, ${element.x} ${element.y + element.height - 11}, ${element.x} ${element.y + element.height - 25} Z`}
        fill="#e2e4df"
        stroke="#657169"
        strokeWidth={2}
      />
    ) : element.curvedRight ? (
      <Path
        data={`M ${element.x} ${element.y} L ${element.x + element.width - 25} ${element.y} C ${element.x + element.width - 11} ${element.y}, ${element.x + element.width - 5} ${element.y - 10}, ${element.x + element.width} ${element.y - 18} L ${element.x + element.width} ${element.y + element.height + 18} C ${element.x + element.width - 5} ${element.y + element.height + 10}, ${element.x + element.width - 11} ${element.y + element.height}, ${element.x + element.width - 25} ${element.y + element.height} L ${element.x} ${element.y + element.height} Z`}
        fill="#e2e4df"
        stroke="#657169"
        strokeWidth={2}
      />
    ) : (
      <Rect x={element.x} y={element.y} width={element.width} height={element.height} fill="#e2e4df" stroke="#657169" strokeWidth={2} />
    );
    return (
      <Group>
        {stairShape}
        {treads}
        {element.showLabel !== false ? <Text x={element.x} y={element.y + element.height / 2 - 5} width={element.width} align="center" text="STAIRS" fontSize={8} fontStyle="bold" fill="#59655e" /> : null}
      </Group>
    );
  }

  if (element.kind === "direction-label") {
    return <Text x={element.x} y={element.y} width={element.width} rotation={element.rotation ?? 0} align="center" text={`↕  ${element.label}  ↕`} fontSize={11} fontStyle="bold" letterSpacing={1.5} fill="#65736b" />;
  }

  if (element.kind === "label") {
    return <Text x={element.x} y={element.y} width={element.width} rotation={element.rotation ?? 0} align="center" text={element.label.toUpperCase()} fontSize={element.fontSize ?? 10} fontStyle="bold" letterSpacing={1.2} fill="#65736b" />;
  }

  const colors = {
    "main-floor": { fill: "#fffdfa", stroke: "#526159" },
    "event-floor-extension": { fill: "#fffdfa", stroke: "#526159" },
    stage: { fill: "#ddd4c4", stroke: "#8e7b61" },
    closet: { fill: "#e7e5df", stroke: "#858a84" },
    catering: { fill: "#ede8df", stroke: "#998e7f" },
    bar: { fill: "#dce7df", stroke: "#687f70" },
    buffet: { fill: "#e8e0d3", stroke: "#8e7c66" },
    porch: { fill: "#e4e7e2", stroke: "#7b8680" },
    "second-floor": { fill: "#eef0ec", stroke: "#7c8881" },
    "open-to-below": { fill: "#f5f3ee", stroke: "#a5aaa5" },
    pillar: { fill: "#69736d", stroke: "#4d5751" },
    fireplace: { fill: "#d6d1c8", stroke: "#7e7569" },
    landing: { fill: "#e0e2dd", stroke: "#68736d" },
  }[element.role];

  const shape = element.shape.type === "rectangle" ? (
    <Rect
      x={element.shape.x}
      y={element.shape.y}
      width={element.shape.width}
      height={element.shape.height}
      fill={colors.fill}
      stroke={element.showOutline === false ? undefined : colors.stroke}
      strokeWidth={element.showOutline === false ? 0 : element.role === "main-floor" ? 3 : 2}
      shadowColor={element.elevation === "raised" ? "#594b39" : undefined}
      shadowBlur={element.elevation === "raised" ? 10 : 0}
      shadowOffsetX={element.elevation === "raised" ? 5 : 0}
      shadowOffsetY={element.elevation === "raised" ? 5 : 0}
      shadowOpacity={element.elevation === "raised" ? 0.22 : 0}
    />
  ) : (
    <Line
      points={element.shape.points}
      closed
      fill={colors.fill}
      stroke={element.showOutline === false ? undefined : colors.stroke}
      strokeWidth={element.showOutline === false ? 0 : 2}
      shadowColor={element.elevation === "raised" ? "#594b39" : undefined}
      shadowBlur={element.elevation === "raised" ? 10 : 0}
      shadowOffsetX={element.elevation === "raised" ? 5 : 0}
      shadowOffsetY={element.elevation === "raised" ? 5 : 0}
      shadowOpacity={element.elevation === "raised" ? 0.22 : 0}
    />
  );

  const bounds = getAreaBounds(element);
  const isCompact = bounds.width < 190;

  return (
    <Group>
      {shape}
      {element.role !== "main-floor" && element.role !== "pillar" && element.showLabel !== false ? (
        element.labelRotation ? (
          <Text
            x={bounds.x + 8}
            y={bounds.y + bounds.height - 8}
            width={Math.max(20, bounds.height - 16)}
            rotation={element.labelRotation}
            align="center"
            text={element.label.toUpperCase()}
            fontSize={8}
            fontStyle="bold"
            letterSpacing={0.8}
            fill="#536158"
          />
        ) : (
          <Text
            x={bounds.x + 8}
            y={bounds.y + bounds.height / 2 - (isCompact ? 18 : 7)}
            width={Math.max(20, bounds.width - 16)}
            align="center"
            text={element.label.toUpperCase()}
            fontSize={isCompact ? 8 : 10}
            lineHeight={1.35}
            fontStyle="bold"
            letterSpacing={isCompact ? 0.6 : 1.1}
            fill="#536158"
          />
        )
      ) : null}
    </Group>
  );
}

function getAreaBounds(element: Extract<FixedArchitectureElement, { kind: "area" }>) {
  if (element.shape.type === "rectangle") return element.shape;
  const xs = element.shape.points.filter((_, index) => index % 2 === 0);
  const ys = element.shape.points.filter((_, index) => index % 2 === 1);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

type ObjectNodeProps = {
  object: EventObject;
  servicePlan: ServicePlan;
  selected: boolean;
  canDrag: boolean;
  setNode: (node: Konva.Group | null) => void;
  onSelect: () => void;
  onChange: (patch: Partial<EventObject>) => void;
  onOpenDetails: () => void;
};

function EventObjectNode({ object, servicePlan, selected, canDrag, setNode, onSelect, onChange, onOpenDetails }: ObjectNodeProps) {
  const isRound = object.physicalDimensions.shape === "circle";
  const isDance = object.type === "dance-floor";
  const isChair = object.type === "chair";
  const isHalfMoon = object.type === "half-moon-table";
  const chairNoAlcohol = isChair && object.seatNoAlcohol?.[0] === true;
  const chairServiceColor = isChair ? getSeatServiceColor(object, 0, servicePlan) : undefined;
  const fill = isDance ? "#e6ded2" : isChair ? chairServiceColor ?? DEFAULT_SEAT_COLOR : isGuestTable(object.type) ? "#fffdf7" : "#dce8e0";
  const stroke = chairNoAlcohol ? NO_ALCOHOL_COLOR : selected ? "#294f3d" : isDance ? "#9d8e7b" : "#5e7768";

  return (
    <Group
      ref={setNode}
      x={object.x}
      y={object.y}
      rotation={object.rotation}
      draggable={canDrag}
      onClick={onSelect}
      onTap={onSelect}
      onContextMenu={(event) => {
        event.evt.preventDefault();
        if (object.seats !== undefined) {
          onSelect();
          onOpenDetails();
        }
      }}
      onDragEnd={(event) => onChange({ x: snap(event.target.x()), y: snap(event.target.y()) })}
      onTransformEnd={(event) => {
        const node = event.target;
        const patch = {
          x: snap(node.x()),
          y: snap(node.y()),
          rotation: Math.round(node.rotation()),
          width: Math.max(20, object.width * node.scaleX()),
          height: Math.max(20, object.height * node.scaleY()),
        };
        node.scaleX(1);
        node.scaleY(1);
        onChange(patch);
      }}
    >
      {isChair ? <Rect x={-12} y={-12} width={24} height={24} fill="transparent" /> : null}
      {isHalfMoon ? (
        <Path
          data={`M ${-object.width / 2} ${object.height / 2} A ${object.width / 2} ${object.height} 0 0 1 ${object.width / 2} ${object.height / 2} L ${-object.width / 2} ${object.height / 2} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected ? 3 : 2}
          shadowColor="#405047"
          shadowBlur={selected ? 8 : 3}
          shadowOpacity={0.16}
        />
      ) : isRound ? (
        <Circle radius={object.width / 2} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} shadowColor="#405047" shadowBlur={selected ? 8 : 3} shadowOpacity={0.16} />
      ) : (
        <Rect x={-object.width / 2} y={-object.height / 2} width={object.width} height={object.height} fill={fill} stroke={stroke} strokeWidth={chairNoAlcohol ? 3 : selected ? 2 : isChair ? 0 : 2} cornerRadius={isChair ? 2 : isDance ? 2 : 8} shadowColor="#405047" shadowBlur={selected ? 8 : isChair ? 0 : 3} shadowOpacity={0.14} />
      )}
      {isDance ? <DanceGrid width={object.width} height={object.height} /> : null}
      {TABLE_TYPES.has(object.type) ? <SeatMarkers object={object} servicePlan={servicePlan} /> : null}
      {!isChair ? (
        <>
          <Text x={-object.width / 2 + 5} y={-8} width={object.width - 10} align="center" text={object.label} fontSize={Math.min(14, Math.max(10, object.width / 9))} fontStyle="bold" fill="#33473b" ellipsis />
          {object.seats !== undefined ? <Text x={-object.width / 2 + 5} y={10} width={object.width - 10} align="center" text={`${object.seats} seats`} fontSize={9} fill="#79867e" /> : null}
        </>
      ) : null}
    </Group>
  );
}

function SeatMarkers({ object, servicePlan }: { object: EventObject; servicePlan: ServicePlan }) {
  const count = Math.min(object.seats ?? 0, 12);
  if (!count) return null;
  if (object.type === "half-moon-table") {
    return <>{Array.from({ length: count }, (_, index) => {
      const style = getSeatMarkerStyle(object, index, servicePlan);
      return (
        <Rect
          key={index}
          x={-object.width / 2 + ((index + 1) * object.width) / (count + 1) - 5}
          y={object.height / 2 + 2}
          width={10}
          height={7}
          cornerRadius={2}
          {...style}
        />
      );
    })}</>;
  }
  if (object.physicalDimensions.shape === "circle") {
    return <>{Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count;
      const radius = object.width / 2 + 8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const style = getSeatMarkerStyle(object, index, servicePlan);
      return (
        <Circle key={index} x={x} y={y} radius={4.5} {...style} />
      );
    })}</>;
  }
  const perSide = Math.ceil(count / 2);
  return <>{Array.from({ length: count }, (_, index) => {
    const top = index < perSide;
    const sideIndex = top ? index : index - perSide;
    const sideCount = top ? perSide : count - perSide;
    const x = -object.width / 2 + ((sideIndex + 1) * object.width) / (sideCount + 1);
    const style = getSeatMarkerStyle(object, index, servicePlan);
    return (
      <Rect key={index} x={x - 5} y={top ? -object.height / 2 - 9 : object.height / 2 + 2} width={10} height={7} cornerRadius={2} {...style} />
    );
  })}</>;
}

function getSeatMarkerStyle(object: EventObject, seatIndex: number, servicePlan: ServicePlan) {
  const noAlcohol = object.seatNoAlcohol?.[seatIndex] === true;
  return {
    fill: getSeatServiceColor(object, seatIndex, servicePlan) ?? DEFAULT_SEAT_COLOR,
    stroke: noAlcohol ? NO_ALCOHOL_COLOR : undefined,
    strokeWidth: noAlcohol ? 2.5 : 0,
  };
}

function DanceGrid({ width, height }: { width: number; height: number }) {
  const lines = [];
  for (let x = -width / 2 + 28; x < width / 2; x += 28) lines.push(<Line key={`x${x}`} points={[x, -height / 2, x, height / 2]} stroke="#c9bcaa" strokeWidth={1} />);
  for (let y = -height / 2 + 28; y < height / 2; y += 28) lines.push(<Line key={`y${y}`} points={[-width / 2, y, width / 2, y]} stroke="#c9bcaa" strokeWidth={1} />);
  return <>{lines}</>;
}

function snap(value: number) {
  return Math.round(value / 5) * 5;
}

function parseObjectSelection(payload: string): EventObjectSelection | null {
  try {
    const parsed = JSON.parse(payload) as Partial<EventObjectSelection>;
    return parsed.type && parsed.type in OBJECT_DEFINITIONS
      ? { type: parsed.type, variant: parsed.variant }
      : null;
  } catch {
    return payload in OBJECT_DEFINITIONS ? { type: payload as EventObjectSelection["type"] } : null;
  }
}
