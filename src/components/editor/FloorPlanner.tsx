"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Download, FileUp, Printer } from "lucide-react";
import type { EventObject, EventObjectSelection } from "@/domain/floorplan";
import type { VenueTemplate } from "@/domain/floorplan";
import type { InventoryConfiguration } from "@/domain/inventory";
import { getInventoryUsage } from "@/domain/inventory";
import { isPositionOnFloor } from "@/domain/floor-regions";
import { getLayoutStats } from "@/domain/layout-operations";
import { deserializeFloorplan, serializePortableFloorplan } from "@/domain/persistence";
import { useFloorplanEditor } from "@/hooks/useFloorplanEditor";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorToolbar, type EditorMode } from "@/components/editor/EditorToolbar";

type Props = {
  venue: VenueTemplate;
  levelVenues?: VenueTemplate[];
  locationName: string;
  inventory: InventoryConfiguration;
};

export function FloorPlanner({ venue, levelVenues, locationName, inventory }: Props) {
  const editor = useFloorplanEditor({ venueTemplateId: venue.id, inventory, inventoryOwner: locationName });
  const availableLevels = useMemo(() => levelVenues?.length ? levelVenues : [venue], [levelVenues, venue]);
  const isMultiLevel = availableLevels.length > 1;
  const defaultLevelId = venue.levelId;
  const [activeLevelId, setActiveLevelId] = useState(defaultLevelId);
  const activeVenue = availableLevels.find((candidate) => candidate.levelId === activeLevelId) ?? venue;
  const hasToggleableReference = Boolean(activeVenue.referenceAsset && activeVenue.referenceAsset.visualRole !== "architectural-base");
  const activeLayout = useMemo(() => isMultiLevel ? {
    ...editor.layout,
    objects: editor.layout.objects.filter(
      (object) => resolveLevelId(object.levelId ?? object.floorLevelId ?? defaultLevelId) === activeLevelId,
    ),
  } : editor.layout, [activeLevelId, defaultLevelId, editor.layout, isMultiLevel]);
  const activeStats = useMemo(() => getLayoutStats(activeLayout), [activeLayout]);
  const [mode, setMode] = useState<EditorMode>("select");
  const [zoom, setZoom] = useState(1);
  const [showReference, setShowReference] = useState(activeVenue.referenceAsset?.visibleByDefault ?? false);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [nameRequired, setNameRequired] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addObject = editor.add;
  const objectCount = activeLayout.objects.length;
  const selectedId = activeLayout.objects.some((object) => object.id === editor.selectedId) ? editor.selectedId : null;
  const removeObject = editor.remove;
  const updateObject = editor.update;
  const duplicateObject = editor.duplicate;
  const showNotice = editor.showNotice;
  const redo = editor.redo;
  const undo = editor.undo;
  const inventoryUsage = getInventoryUsage(editor.layout);
  const addOnActiveLevel = useCallback(
    (selection: EventObjectSelection, position: { x: number; y: number }) => {
      if (activeVenue.usableAreas && !isPositionOnFloor(position, activeVenue.usableAreas, activeVenue.voidAreas ?? [])) {
        showNotice("That area is open to the floor below or outside the balcony walkway.");
        return;
      }
      addObject(selection, position, isMultiLevel ? activeLevelId : undefined);
    },
    [activeLevelId, activeVenue.usableAreas, activeVenue.voidAreas, addObject, isMultiLevel, showNotice],
  );

  const updateOnActiveLevel = useCallback((id: string, patch: Partial<EventObject>) => {
    const object = activeLayout.objects.find((candidate) => candidate.id === id);
    const position = { x: patch.x ?? object?.x, y: patch.y ?? object?.y };
    if (activeVenue.usableAreas && position.x !== undefined && position.y !== undefined && !isPositionOnFloor(position as { x: number; y: number }, activeVenue.usableAreas, activeVenue.voidAreas ?? [])) {
      showNotice("That area is open to the floor below or outside the balcony walkway.");
      return;
    }
    updateObject(id, patch);
  }, [activeLayout.objects, activeVenue.usableAreas, activeVenue.voidAreas, showNotice, updateObject]);

  const addCentered = useCallback(
    (selection: EventObjectSelection) => {
      const column = objectCount % 6;
      const row = Math.floor(objectCount / 6) % 4;
      const origin = activeVenue.defaultObjectPosition ?? {
        x: activeVenue.hall.x + activeVenue.hall.width * 0.25,
        y: activeVenue.hall.y + activeVenue.hall.height * 0.3,
      };
      addOnActiveLevel(selection, {
        x: origin.x + column * 72,
        y: origin.y + row * 72,
      });
    },
    [activeVenue.defaultObjectPosition, activeVenue.hall.height, activeVenue.hall.width, activeVenue.hall.x, activeVenue.hall.y, addOnActiveLevel, objectCount],
  );

  const changeFloorLevel = (levelId: string) => {
    setActiveLevelId(levelId);
    editor.setSelectedId(null);
    setZoom(1);
    setResetViewKey((key) => key + 1);
    const nextLevel = availableLevels.find((level) => level.levelId === levelId);
    setShowReference(nextLevel?.referenceAsset?.visibleByDefault ?? false);
  };

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

  const saveEditablePlan = () => {
    const eventName = requireEventName();
    if (!eventName) return;
    const blob = new Blob([serializePortableFloorplan(editor.layout)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileSlug(eventName)}-${fileSlug(venue.name)}.springsplan`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const requireEventName = () => {
    const eventName = editor.layout.name.trim();
    if (eventName) {
      if (eventName !== editor.layout.name) editor.renameLayout(eventName);
      setNameRequired(false);
      return eventName;
    }
    setNameRequired(true);
    nameInputRef.current?.focus();
    return null;
  };

  const printPlan = () => {
    if (requireEventName()) window.print();
  };

  const openSavedPlan = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = deserializeFloorplan(await file.text());
      if (imported.venueTemplateId !== venue.id) {
        throw new Error(`This saved plan belongs to a different hall. Open ${venue.name} plans here.`);
      }
      editor.importLayout(imported);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to open this saved plan.");
    }
  };

  if (!editor.ready) {
    return <div className="grid min-h-screen place-items-center bg-[#f6f4ef] text-sm text-[#66736c]">Opening floor planner…</div>;
  }

  return (
    <main className="floor-planner-shell flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#f6f4ef]">
      <header className="floor-planner-header flex h-[72px] shrink-0 items-center justify-between border-b border-[#dce2dd] bg-[#fffefa] px-5">
        <div className="flex items-center gap-4">
          <div className="grid size-10 place-items-center rounded-full bg-[#294f3d] font-serif text-lg font-semibold text-white">S</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-[19px] font-semibold tracking-[-0.01em] text-[#1d2923]">The Springs Floor Planner</h1>
              <span className="rounded-full bg-[#eaf0ec] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#54705f]">Prototype</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-[#748078]">
              <input
                ref={nameInputRef}
                aria-label="Event or client name"
                aria-invalid={nameRequired}
                maxLength={80}
                placeholder="Event or client name"
                value={editor.layout.name}
                onChange={(event) => {
                  editor.renameLayout(event.target.value);
                  if (event.target.value.trim()) setNameRequired(false);
                }}
                onBlur={() => editor.renameLayout(editor.layout.name.trim())}
                className={`w-48 border-b bg-transparent pb-0.5 text-xs font-medium outline-none transition-colors placeholder:text-[#9aa49e] ${nameRequired ? "border-[#bd684a] text-[#8f4c38]" : "border-transparent text-[#5f6d65] hover:border-[#cbd3cd] focus:border-[#547765]"}`}
              />
              <span aria-hidden="true">·</span>
              <span>{venue.name}</span>
              {isMultiLevel ? <><span aria-hidden="true">·</span><span>{activeVenue.levelName}</span></> : null}
              {nameRequired ? <span className="ml-1 font-semibold text-[#a1533d]">Enter a name to save</span> : null}
            </div>
          </div>
        </div>

        <div className="floor-planner-actions flex items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded-lg border border-[#d7ddd8] bg-white px-3 text-xs font-semibold text-[#405047] hover:bg-[#f7f8f6]" onClick={() => importInputRef.current?.click()}>
            <FileUp size={14} /> Open saved plan
          </button>
          <input
            ref={importInputRef}
            className="hidden"
            type="file"
            accept="application/json,.json,.springsplan"
            onChange={(event) => {
              void openSavedPlan(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <button className="h-9 rounded-lg border border-[#d7ddd8] bg-white px-3 text-xs font-semibold text-[#405047] hover:bg-[#f7f8f6]" onClick={editor.reset}>Reset</button>
          <details className="group relative">
            <summary className="flex h-9 list-none items-center gap-2 rounded-lg bg-[#294f3d] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1f4031] [&::-webkit-details-marker]:hidden">
              Save / Print <ChevronDown className="transition-transform group-open:rotate-180" size={14} />
            </summary>
            <div className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border border-[#d7ddd8] bg-white p-1.5 shadow-xl">
              <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#f3f6f3]" onClick={saveEditablePlan}>
                <Download className="mt-0.5 shrink-0 text-[#456351]" size={16} />
                <span>
                  <span className="block text-xs font-bold text-[#35463c]">Save editable plan</span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-[#7b877f]">Download a small file to this computer so the plan can be edited later.</span>
                </span>
              </button>
              <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#f3f6f3]" onClick={printPlan}>
                <Printer className="mt-0.5 shrink-0 text-[#456351]" size={16} />
                <span>
                  <span className="block text-xs font-bold text-[#35463c]">Print / Save as PDF</span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-[#7b877f]">Create a final copy for printing or uploading to Operations Hub.</span>
                </span>
              </button>
              <p className="border-t border-[#e4e8e4] px-3 pb-1 pt-2 text-[10px] leading-4 text-[#849088]">Changes are also recovered automatically in this browser.</p>
            </div>
          </details>
        </div>
      </header>

      <div className="floor-planner-workspace grid min-h-0 flex-1 grid-cols-[258px_minmax(520px,1fr)_292px]">
        <div className="floor-planner-library min-h-0 overflow-hidden [&>aside]:h-full">
          <ObjectLibrary onAdd={addCentered} inventory={inventory} usage={inventoryUsage} />
        </div>

        <section className="floor-planner-canvas flex min-w-0 flex-col border-x border-[#dce2dd]">
          {isMultiLevel ? (
            <div className="flex h-12 shrink-0 items-center justify-center border-b border-[#dce2dd] bg-[#f8f7f2] px-4">
              <div className="inline-flex rounded-xl border border-[#cfd7d1] bg-white p-1 shadow-sm" role="tablist" aria-label="Floor level">
                {availableLevels.map((level) => (
                  <button
                    key={level.levelId}
                    type="button"
                    role="tab"
                    aria-selected={level.levelId === activeLevelId}
                    className={`rounded-lg px-5 py-1.5 text-xs font-bold transition-colors ${level.levelId === activeLevelId ? "bg-[#294f3d] text-white shadow-sm" : "text-[#66736c] hover:bg-[#eef2ee]"}`}
                    onClick={() => level.levelId && changeFloorLevel(level.levelId)}
                  >
                    {level.levelName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <EditorToolbar
            mode={mode}
            zoom={zoom}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            hasSelection={Boolean(selectedId)}
            hasReference={hasToggleableReference}
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
            layout={activeLayout}
            venue={activeVenue}
            selectedId={selectedId}
            mode={mode}
            zoom={zoom}
            showReference={showReference}
            resetViewKey={resetViewKey}
            onSelect={editor.setSelectedId}
            onAdd={addOnActiveLevel}
            onChange={updateOnActiveLevel}
            onZoomChange={setZoom}
          />
          <div className="floor-planner-status flex h-9 shrink-0 items-center justify-between border-t border-[#dce2dd] bg-[#fffefa] px-4 text-[11px] text-[#6c7871]">
            <span>{mode === "pan" ? "Drag the canvas to pan" : "Click an object to select · Drag to move"}</span>
            <div className="flex items-center gap-4 font-semibold text-[#425148]">
              {isMultiLevel ? <span>{activeVenue.levelName}</span> : null}
              <span>{activeStats.objectCount} objects</span>
              <span>{activeStats.guestTables} guest tables</span>
              <span>{activeStats.seats} seats</span>
              <span>{activeVenue.physicalDimensionStatus === "confirmed" ? "Confirmed scale" : activeVenue.physicalDimensionStatus === "source-traced" ? "Source-traced geometry" : "Provisional scale"}</span>
            </div>
          </div>
        </section>

        <div className="floor-planner-properties min-h-0 overflow-hidden [&>aside]:h-full">
          <PropertiesPanel
            object={selectedId ? editor.selectedObject : null}
            onChange={updateOnActiveLevel}
            onDuplicate={() => editor.duplicate()}
            onDelete={() => editor.remove()}
            onReorder={editor.reorder}
          />
        </div>
      </div>

      {editor.notice ? (
        <div className="toast-in fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d2923] px-4 py-2 text-xs font-semibold text-white shadow-xl">
          {editor.notice}
        </div>
      ) : null}
    </main>
  );
}

function resolveLevelId(levelId: string | undefined) {
  if (levelId === "main-floor") return "level-1-main-floor";
  if (levelId === "balcony") return "level-2-balcony";
  return levelId;
}

function fileSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "floorplan";
}
