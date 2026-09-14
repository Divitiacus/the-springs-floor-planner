"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Arc, Circle, Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import type { EventObject, EventObjectType, FloorplanLayout, VenueElement, VenueTemplate } from "@/domain/floorplan";
import { OBJECT_DEFINITIONS, isGuestTable } from "@/domain/object-catalog";
import type { EditorMode } from "@/components/editor/EditorToolbar";

type Props = {
  layout: FloorplanLayout;
  venue: VenueTemplate;
  selectedId: string | null;
  mode: EditorMode;
  zoom: number;
  resetViewKey: number;
  onSelect: (id: string | null) => void;
  onAdd: (type: EventObjectType, position: { x: number; y: number }) => void;
  onChange: (id: string, patch: Partial<EventObject>) => void;
  onZoomChange: (zoom: number) => void;
};

export function FloorplanCanvas({ layout, venue, selectedId, mode, zoom, onSelect, onAdd, onChange, onZoomChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Group>());
  const [size, setSize] = useState({ width: 900, height: 650 });
  const [stagePosition, setStagePosition] = useState<{ x: number; y: number } | null>(null);

  const fitScale = useMemo(
    () => Math.min(size.width / venue.canvasWidth, size.height / venue.canvasHeight) * 0.93,
    [size, venue.canvasHeight, venue.canvasWidth],
  );
  const scale = fitScale * zoom;

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
    x: (size.width - venue.canvasWidth * fitScale) / 2,
    y: (size.height - venue.canvasHeight * fitScale) / 2,
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
    const type = event.dataTransfer.getData("application/x-springs-object") as EventObjectType;
    if (!OBJECT_DEFINITIONS[type]) return;
    const stage = stageRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!stage) return;
    onAdd(type, {
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
          <Rect x={0} y={0} width={venue.canvasWidth} height={venue.canvasHeight} fill="#eef0ed" cornerRadius={18} shadowColor="#506058" shadowBlur={28} shadowOpacity={0.13} shadowOffsetY={8} />
          <VenueLayer venue={venue} />
        </Layer>

        <Layer>
          {[...layout.objects].sort((a, b) => a.zIndex - b.zIndex).map((object) => (
            <EventObjectNode
              key={object.id}
              object={object}
              selected={object.id === selectedId}
              canDrag={mode === "select"}
              setNode={(node) => {
                if (node) nodeRefs.current.set(object.id, node);
                else nodeRefs.current.delete(object.id);
              }}
              onSelect={() => onSelect(object.id)}
              onChange={(patch) => onChange(object.id, patch)}
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
      </div>
    </div>
  );
}

function VenueLayer({ venue }: { venue: VenueTemplate }) {
  const grid = [];
  for (let x = venue.hall.x + 20; x < venue.hall.x + venue.hall.width; x += 40) {
    grid.push(<Line key={`x-${x}`} points={[x, venue.hall.y, x, venue.hall.y + venue.hall.height]} stroke="#e7e9e5" strokeWidth={1} />);
  }
  for (let y = venue.hall.y + 20; y < venue.hall.y + venue.hall.height; y += 40) {
    grid.push(<Line key={`y-${y}`} points={[venue.hall.x, y, venue.hall.x + venue.hall.width, y]} stroke="#e7e9e5" strokeWidth={1} />);
  }

  return (
    <>
      <Rect {...venue.hall} fill="#fffdfa" stroke="#405248" strokeWidth={12} cornerRadius={4} />
      {grid}
      {venue.elements.map((element) => <VenueElementNode key={element.id} element={element} />)}
      <Text x={venue.hall.x + 18} y={venue.hall.y + 16} text={venue.name.toUpperCase()} fontSize={11} fontStyle="bold" letterSpacing={1.8} fill="#8b968f" />
      <Text x={venue.hall.x + venue.hall.width - 84} y={venue.hall.y + venue.hall.height - 29} text="N ↑" fontSize={12} fontStyle="bold" fill="#7d8981" />
    </>
  );
}

function VenueElementNode({ element }: { element: VenueElement }) {
  if (element.kind === "door") {
    return (
      <Group x={element.x} y={element.y} rotation={element.rotation}>
        <Line points={[0, 0, element.width, 0]} stroke="#fffdfa" strokeWidth={16} />
        <Line points={[0, 0, element.width, -element.width]} stroke="#8c9a92" strokeWidth={2} />
        <Arc x={0} y={0} innerRadius={element.width - 1} outerRadius={element.width + 1} angle={90} rotation={-90} fill="#b2bcb6" />
        <Text x={0} y={-13} width={element.width} align="center" text={element.label} fontSize={8} fontStyle="bold" fill="#79857e" />
      </Group>
    );
  }

  const colors = {
    area: { fill: "#eef3ef", stroke: "#91a59a" },
    stage: { fill: "#e8e2d8", stroke: "#9c8d78" },
    service: { fill: "#eeeae3", stroke: "#a89e8e" },
    bar: { fill: "#dfe8e1", stroke: "#728b7b" },
  }[element.kind];

  return (
    <Group>
      <Rect x={element.x} y={element.y} width={element.width} height={element.height} fill={colors.fill} stroke={colors.stroke} strokeWidth={2} dash={element.kind === "area" ? [8, 5] : undefined} cornerRadius={element.kind === "bar" ? 30 : 5} />
      <Text x={element.x} y={element.y + element.height / 2 - 6} width={element.width} align="center" text={element.label} fontSize={10} fontStyle="bold" letterSpacing={1.1} fill="#5f6d65" />
    </Group>
  );
}

type ObjectNodeProps = {
  object: EventObject;
  selected: boolean;
  canDrag: boolean;
  setNode: (node: Konva.Group | null) => void;
  onSelect: () => void;
  onChange: (patch: Partial<EventObject>) => void;
};

function EventObjectNode({ object, selected, canDrag, setNode, onSelect, onChange }: ObjectNodeProps) {
  const isRound = object.type === "round-table-60" || object.type === "round-table-72" || object.type === "cake-table";
  const isDance = object.type === "dance-floor";
  const fill = isDance ? "#e6ded2" : object.type === "chair" ? "#60796b" : isGuestTable(object.type) ? "#fffdf7" : "#dce8e0";
  const stroke = selected ? "#294f3d" : isDance ? "#9d8e7b" : "#5e7768";

  return (
    <Group
      ref={setNode}
      x={object.x}
      y={object.y}
      rotation={object.rotation}
      draggable={canDrag}
      onClick={onSelect}
      onTap={onSelect}
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
      {isRound ? (
        <Circle radius={object.width / 2} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} shadowColor="#405047" shadowBlur={selected ? 8 : 3} shadowOpacity={0.16} />
      ) : (
        <Rect x={-object.width / 2} y={-object.height / 2} width={object.width} height={object.height} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} cornerRadius={object.type === "chair" ? 7 : isDance ? 2 : 8} shadowColor="#405047" shadowBlur={selected ? 8 : 3} shadowOpacity={0.14} />
      )}
      {isDance ? <DanceGrid width={object.width} height={object.height} /> : null}
      {isGuestTable(object.type) ? <SeatMarkers object={object} /> : null}
      {object.type !== "chair" ? (
        <>
          <Text x={-object.width / 2 + 5} y={-8} width={object.width - 10} align="center" text={object.label} fontSize={Math.min(14, Math.max(10, object.width / 9))} fontStyle="bold" fill="#33473b" ellipsis />
          {object.seats !== undefined ? <Text x={-object.width / 2 + 5} y={10} width={object.width - 10} align="center" text={`${object.seats} seats`} fontSize={9} fill="#79867e" /> : null}
        </>
      ) : null}
    </Group>
  );
}

function SeatMarkers({ object }: { object: EventObject }) {
  const count = Math.min(object.seats ?? 0, 12);
  if (!count) return null;
  if (object.type.startsWith("round-table")) {
    return <>{Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count;
      const radius = object.width / 2 + 8;
      return <Circle key={index} x={Math.cos(angle) * radius} y={Math.sin(angle) * radius} radius={4.5} fill="#9aa99f" />;
    })}</>;
  }
  const perSide = Math.ceil(count / 2);
  return <>{Array.from({ length: count }, (_, index) => {
    const top = index < perSide;
    const sideIndex = top ? index : index - perSide;
    const sideCount = top ? perSide : count - perSide;
    return <Rect key={index} x={-object.width / 2 + ((sideIndex + 1) * object.width) / (sideCount + 1) - 5} y={top ? -object.height / 2 - 9 : object.height / 2 + 2} width={10} height={7} cornerRadius={2} fill="#9aa99f" />;
  })}</>;
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
