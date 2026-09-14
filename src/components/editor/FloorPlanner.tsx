"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { EventObjectSelection } from "@/domain/floorplan";
import type { VenueTemplate } from "@/domain/floorplan";
import type { InventoryConfiguration } from "@/domain/inventory";
import { getInventoryUsage } from "@/domain/inventory";
import { deserializeFloorplan, serializeFloorplan } from "@/domain/persistence";
import { useFloorplanEditor } from "@/hooks/useFloorplanEditor";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorToolbar, type EditorMode } from "@/components/editor/EditorToolbar";

type Props = {
  venue: VenueTemplate;
  locationName: string;
  inventory: InventoryConfiguration;
};

export function FloorPlanner({ venue, locationName, inventory }: Props) {
  const editor = useFloorplanEditor({ venueTemplateId: venue.id, inventory, inventoryOwner: locationName });
  const [mode, setMode] = useState<EditorMode>("select");
  const [zoom, setZoom] = useState(1);
  const [showReference, setShowReference] = useState(venue.referenceAsset?.visibleByDefault ?? false);
  const [resetViewKey, setResetViewKey] = useState(0);
  const importInputRef = useRef<HTMLInputElement>(null);
  const addObject = editor.add;
  const objectCount = editor.layout.objects.length;
  const selectedId = editor.selectedId;
  const removeObject = editor.remove;
  const duplicateObject = editor.duplicate;
  const redo = editor.redo;
  const undo = editor.undo;
  const inventoryUsage = getInventoryUsage(editor.layout);

  const addCentered = useCallback(
    (selection: EventObjectSelection) => {
      const column = objectCount % 6;
      const row = Math.floor(objectCount / 6) % 4;
      addObject(selection, {
        x: venue.hall.x + venue.hall.width * 0.25 + column * 72,
        y: venue.hall.y + venue.hall.height * 0.3 + row * 72,
      });
    },
    [addObject, objectCount, venue.hall.height, venue.hall.width, venue.hall.x, venue.hall.y],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select") || target?.isContentEditable) return;
      const modifier = event.ctrlKey || event.metaKey;
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        removeObject();
      } else if (modifier && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateObject();
      } else if (modifier && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
      } else if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      } else if (event.key === "v") {
        setMode("select");
      } else if (event.key === "h") {
        setMode("pan");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [duplicateObject, redo, removeObject, selectedId, undo]);

  const exportJson = () => {
    const blob = new Blob([serializeFloorplan(editor.layout)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "springs-floorplan.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      editor.importLayout(deserializeFloorplan(await file.text()));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to import floorplan.");
    }
  };

  if (!editor.ready) {
    return <div className="grid min-h-screen place-items-center bg-[#f6f4ef] text-sm text-[#66736c]">Opening floor planner…</div>;
  }

  return (
    <main className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#f6f4ef]">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#dce2dd] bg-[#fffefa] px-5">
        <div className="flex items-center gap-4">
          <div className="grid size-10 place-items-center rounded-full bg-[#294f3d] font-serif text-lg font-semibold text-white">S</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-[19px] font-semibold tracking-[-0.01em] text-[#1d2923]">The Springs Floor Planner</h1>
              <span className="rounded-full bg-[#eaf0ec] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#54705f]">Prototype</span>
            </div>
            <p className="mt-0.5 text-xs text-[#748078]">{editor.layout.name} · {venue.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded-lg border border-[#d7ddd8] bg-white px-3 text-xs font-semibold text-[#405047] hover:bg-[#f7f8f6]" onClick={exportJson}>
            <Download size={14} /> Export JSON
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-[#d7ddd8] bg-white px-3 text-xs font-semibold text-[#405047] hover:bg-[#f7f8f6]" onClick={() => importInputRef.current?.click()}>
            <Upload size={14} /> Import
          </button>
          <input ref={importInputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void onImport(event.target.files?.[0])} />
          <button className="h-9 rounded-lg border border-[#d7ddd8] bg-white px-3 text-xs font-semibold text-[#405047] hover:bg-[#f7f8f6]" onClick={editor.reset}>Reset</button>
          <button className="h-9 rounded-lg bg-[#294f3d] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1f4031]" onClick={editor.save}>Save floorplan</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[258px_minmax(520px,1fr)_292px]">
        <ObjectLibrary onAdd={addCentered} inventory={inventory} usage={inventoryUsage} />

        <section className="flex min-w-0 flex-col border-x border-[#dce2dd]">
          <EditorToolbar
            mode={mode}
            zoom={zoom}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            hasSelection={Boolean(editor.selectedId)}
            hasReference={Boolean(venue.referenceAsset)}
            showReference={showReference}
            onModeChange={setMode}
            onUndo={editor.undo}
            onRedo={editor.redo}
            onDuplicate={() => editor.duplicate()}
            onDelete={() => editor.remove()}
            onZoomChange={setZoom}
            onResetView={() => { setZoom(1); setResetViewKey((key) => key + 1); }}
            onToggleReference={() => setShowReference((visible) => !visible)}
          />
          <EditorCanvas
            layout={editor.layout}
            venue={venue}
            selectedId={editor.selectedId}
            mode={mode}
            zoom={zoom}
            showReference={showReference}
            resetViewKey={resetViewKey}
            onSelect={editor.setSelectedId}
            onAdd={editor.add}
            onChange={editor.update}
            onZoomChange={setZoom}
          />
          <div className="flex h-9 shrink-0 items-center justify-between border-t border-[#dce2dd] bg-[#fffefa] px-4 text-[11px] text-[#6c7871]">
            <span>{mode === "pan" ? "Drag the canvas to pan" : "Click an object to select · Drag to move"}</span>
            <div className="flex items-center gap-4 font-semibold text-[#425148]">
              <span>{editor.stats.objectCount} objects</span>
              <span>{editor.stats.guestTables} guest tables</span>
              <span>{editor.stats.seats} seats</span>
              <span>{venue.physicalDimensionStatus === "confirmed" ? "Confirmed scale" : venue.physicalDimensionStatus === "source-traced" ? "Source-traced geometry" : "Provisional scale"}</span>
            </div>
          </div>
        </section>

        <PropertiesPanel
          object={editor.selectedObject}
          onChange={editor.update}
          onDuplicate={() => editor.duplicate()}
          onDelete={() => editor.remove()}
          onReorder={editor.reorder}
        />
      </div>

      {editor.notice ? (
        <div className="toast-in fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d2923] px-4 py-2 text-xs font-semibold text-white shadow-xl">
          {editor.notice}
        </div>
      ) : null}
    </main>
  );
}
