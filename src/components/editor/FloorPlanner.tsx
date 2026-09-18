"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ClipboardList, Download, FileUp, LayoutGrid, Printer } from "lucide-react";
import type { EventObject, EventObjectSelection } from "@/domain/floorplan";
import type { VenueTemplate } from "@/domain/floorplan";
import type { InventoryConfiguration, InventoryGrouping } from "@/domain/inventory";
import { getInventoryUsage } from "@/domain/inventory";
import { isPositionOnFloor, isRectangleFootprintOnFloor } from "@/domain/floor-regions";
import { createEmptyLayout, getLayoutStats } from "@/domain/layout-operations";
import { CHAIR_ROW_DEFAULT_PITCH, CHAIR_ROW_MAX_SEATS, OBJECT_DEFINITIONS } from "@/domain/object-catalog";
import { deserializeFloorplan, serializePortableFloorplan } from "@/domain/persistence";
import { buildServicePlan } from "@/domain/service-markers";
import { useFloorplanEditor } from "@/hooks/useFloorplanEditor";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ObjectLibrary } from "@/components/editor/ObjectLibrary";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorToolbar, type EditorMode } from "@/components/editor/EditorToolbar";
import { SpringsLogo } from "@/components/brand/SpringsLogo";
import { SeatingDetailsDialog } from "@/components/editor/SeatingDetailsDialog";
import { GuestListSheet } from "@/components/editor/GuestListSheet";
import { ServiceLegend } from "@/components/editor/ServiceLegend";

type Props = {
  venue: VenueTemplate;
  levelVenues?: VenueTemplate[];
  locationName: string;
  inventory: InventoryConfiguration;
  portalBridge?: boolean;
};

export function FloorPlanner({
  venue,
  levelVenues,
  locationName,
  inventory,
  portalBridge = false,
}: Props) {
  const availableLevels = useMemo(() => levelVenues?.length ? levelVenues : [venue], [levelVenues, venue]);
  const isMultiLevel = availableLevels.length > 1;
  const defaultLevelId = venue.levelId;
  const inventoryGrouping = useMemo<InventoryGrouping | undefined>(() => {
    const groupedLevels = availableLevels.filter((level) => level.inventoryGroupId);
    const defaultGroupId = venue.inventoryGroupId ?? groupedLevels[0]?.inventoryGroupId;
    if (!defaultGroupId) return undefined;

    const groupByLevelId: Record<string, string> = {};
    for (const level of groupedLevels) {
      if (!level.levelId || !level.inventoryGroupId) continue;
      groupByLevelId[level.levelId] = level.inventoryGroupId;
      if (level.levelId === "level-1-main-floor") groupByLevelId["main-floor"] = level.inventoryGroupId;
      if (level.levelId === "level-2-balcony") groupByLevelId.balcony = level.inventoryGroupId;
    }
    return { defaultGroupId, groupByLevelId };
  }, [availableLevels, venue.inventoryGroupId]);
  const editor = useFloorplanEditor({
    venueTemplateId: venue.id,
    inventory,
    inventoryOwner: locationName,
    inventoryGrouping,
    browserPersistence: !portalBridge,
  });
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
  const servicePlan = useMemo(() => buildServicePlan(editor.layout.objects), [editor.layout.objects]);
  const [mode, setMode] = useState<EditorMode>("select");
  const [workspaceView, setWorkspaceView] = useState<"floorplan" | "guest-list">("floorplan");
  const [zoom, setZoom] = useState(1);
  const [showReference, setShowReference] = useState(activeVenue.referenceAsset?.visibleByDefault ?? false);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [nameRequired, setNameRequired] = useState(false);
  const [detailsObjectId, setDetailsObjectId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const portalParentOriginRef = useRef<string | null>(null);
  const addObject = editor.add;
  const objectCount = activeLayout.objects.length;
  const selectedId = activeLayout.objects.some((object) => object.id === editor.selectedId) ? editor.selectedId : null;
  const removeObject = editor.remove;
  const updateObject = editor.update;
  const duplicateObject = editor.duplicate;
  const showNotice = editor.showNotice;
  const redo = editor.redo;
  const undo = editor.undo;
  const inventoryUsage = getInventoryUsage(editor.layout, inventoryGrouping, activeVenue.inventoryGroupId);
  const addOnActiveLevel = useCallback(
    (selection: EventObjectSelection, position: { x: number; y: number }) => {
      if (activeVenue.usableAreas) {
        const definition = OBJECT_DEFINITIONS[selection.type];
        const isOnFloor = selection.type === "chair-row"
          ? isRectangleFootprintOnFloor(position, definition.width, definition.height, 0, activeVenue.usableAreas, activeVenue.voidAreas ?? [])
          : isPositionOnFloor(position, activeVenue.usableAreas, activeVenue.voidAreas ?? []);
        if (!isOnFloor) {
          showNotice(selection.type === "chair-row"
            ? "Keep the entire chair row inside one usable seating area."
            : "That area is open to the floor below or outside the usable floor.");
          return;
        }
      }
      addObject(selection, position, isMultiLevel ? activeLevelId : undefined);
    },
    [activeLevelId, activeVenue.usableAreas, activeVenue.voidAreas, addObject, isMultiLevel, showNotice],
  );

  const updateOnActiveLevel = useCallback((id: string, patch: Partial<EventObject>) => {
    const object = activeLayout.objects.find((candidate) => candidate.id === id);
    const position = { x: patch.x ?? object?.x, y: patch.y ?? object?.y };
    if (activeVenue.usableAreas && object && position.x !== undefined && position.y !== undefined) {
      const deltaX = position.x - object.x;
      const deltaY = position.y - object.y;
      const movingObjects = object.linkedGroupId
        ? activeLayout.objects.filter((candidate) => candidate.linkedGroupId === object.linkedGroupId)
        : [object];
      const allOnFloor = movingObjects.every((candidate) => {
        const nextPosition = { x: candidate.x + deltaX, y: candidate.y + deltaY };
        if (candidate.type !== "chair-row") {
          return isPositionOnFloor(nextPosition, activeVenue.usableAreas ?? [], activeVenue.voidAreas ?? []);
        }
        const nextSeatCount = candidate.id === id && typeof patch.seats === "number"
          ? Math.max(2, Math.min(CHAIR_ROW_MAX_SEATS, Math.floor(patch.seats)))
          : candidate.seats;
        const nextWidth = candidate.id === id
          ? patch.width ?? (typeof patch.seats === "number" ? (nextSeatCount ?? 2) * CHAIR_ROW_DEFAULT_PITCH : candidate.width)
          : candidate.width;
        return isRectangleFootprintOnFloor(
          nextPosition,
          nextWidth,
          candidate.id === id ? patch.height ?? candidate.height : candidate.height,
          candidate.id === id ? patch.rotation ?? candidate.rotation : candidate.rotation,
          activeVenue.usableAreas ?? [],
          activeVenue.voidAreas ?? [],
        );
      });
      if (!allOnFloor) {
        showNotice(object.type === "chair-row"
          ? "Keep the entire chair row inside one usable seating area."
          : "A linked object would move outside the usable floor area.");
        return;
      }
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
    setWorkspaceView("floorplan");
    setActiveLevelId(levelId);
    editor.setSelectedId(null);
    setDetailsObjectId(null);
    setZoom(1);
    setResetViewKey((key) => key + 1);
    const nextLevel = availableLevels.find((level) => level.levelId === levelId);
    setShowReference(nextLevel?.referenceAsset?.visibleByDefault ?? false);
  };

  const detailsObject = detailsObjectId
    ? activeLayout.objects.find((object) => object.id === detailsObjectId) ?? null
    : null;

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

  useEffect(() => {
    if (!portalBridge || !editor.ready) return;

    const receivePortalPlan = (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        !event.data ||
        typeof event.data !== "object" ||
        event.data.type !== "springs-portal:load-floorplan"
      ) {
        return;
      }
      portalParentOriginRef.current = event.origin;
      const message = event.data as {
        type: "springs-portal:load-floorplan";
        payload?: unknown;
        defaultName?: unknown;
      };
      try {
        if (message.payload) {
          const imported = deserializeFloorplan(JSON.stringify(message.payload));
          if (imported.venueTemplateId !== venue.id) {
            throw new Error(
              `This saved plan belongs to a different hall. Open ${venue.name} plans here.`,
            );
          }
          editor.importLayout(imported);
        } else {
          const defaultName = typeof message.defaultName === "string"
            ? message.defaultName.trim().slice(0, 80)
            : "";
          editor.importLayout({
            ...createEmptyLayout(venue.id),
            name: defaultName,
          });
        }
        setNameRequired(false);
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to open this Event floor plan.",
        );
      }
    };

    window.addEventListener("message", receivePortalPlan);
    window.parent.postMessage({ type: "springs-floorplanner:ready" }, "*");
    return () => window.removeEventListener("message", receivePortalPlan);
  }, [editor.importLayout, editor.ready, portalBridge, venue.id, venue.name]);

  const saveToPortal = (markFinal: boolean) => {
    const eventName = requireEventName();
    if (!eventName) return;
    const parentOrigin = portalParentOriginRef.current;
    if (!portalBridge || !parentOrigin || window.parent === window) {
      editor.showNotice("Return to the Client Portal to save this plan to your Event.");
      return;
    }
    const payload = JSON.parse(serializePortableFloorplan(editor.layout)) as unknown;
    window.parent.postMessage(
      {
        type: "springs-floorplanner:save",
        payload,
        markFinal,
      },
      parentOrigin,
    );
    editor.showNotice(markFinal ? "Sending Final plan to your Event…" : "Sending plan to your Event…");
  };

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
    <main className={`floor-planner-shell floor-planner-view-${workspaceView} flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#f6f4ef]`}>
      <header className="floor-planner-header flex h-[72px] shrink-0 items-center justify-between border-b border-[#dce2dd] bg-[#fffefa] px-5">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full outline-none ring-[#8aa697] transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Return to venue selection"
          >
            <SpringsLogo />
          </Link>
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
              {portalBridge ? (
                <>
                  <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#f3f6f3]" onClick={() => saveToPortal(false)}>
                    <Download className="mt-0.5 shrink-0 text-[#456351]" size={16} />
                    <span>
                      <span className="block text-xs font-bold text-[#35463c]">Save to Event</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-[#7b877f]">Update this Client Portal floor plan slot.</span>
                    </span>
                  </button>
                  <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#fff8df]" onClick={() => saveToPortal(true)}>
                    <Download className="mt-0.5 shrink-0 text-[#8b641c]" size={16} />
                    <span>
                      <span className="block text-xs font-bold text-[#6d501b]">Save as Final</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-[#8c7957]">Make this the Event's one Final floor plan.</span>
                    </span>
                  </button>
                  <div className="my-1 border-t border-[#e4e8e4]" />
                </>
              ) : null}
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
              <p className="border-t border-[#e4e8e4] px-3 pb-1 pt-2 text-[10px] leading-4 text-[#849088]">
                {portalBridge
                  ? "Event saves are kept in your five Client Portal slots. You can still download your own copy."
                  : "Changes are also recovered automatically in this browser."}
              </p>
            </div>
          </details>
        </div>
      </header>

      <nav className="flex h-12 shrink-0 items-center justify-center border-b border-[#dce2dd] bg-[#f8f7f2] px-4" aria-label="Planner view">
        <div className="inline-flex rounded-xl border border-[#cfd7d1] bg-white p-1 shadow-sm" role="tablist">
          {availableLevels.map((level) => (
            <button
              key={level.levelId ?? level.id}
              type="button"
              role="tab"
              aria-selected={workspaceView === "floorplan" && level.levelId === activeLevelId}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${workspaceView === "floorplan" && level.levelId === activeLevelId ? "bg-[#294f3d] text-white shadow-sm" : "text-[#66736c] hover:bg-[#eef2ee]"}`}
              onClick={() => changeFloorLevel(level.levelId ?? defaultLevelId ?? "")}
            >
              <LayoutGrid size={13} /> {isMultiLevel ? level.levelName : "Floor Plan"}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={workspaceView === "guest-list"}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${workspaceView === "guest-list" ? "bg-[#294f3d] text-white shadow-sm" : "text-[#66736c] hover:bg-[#eef2ee]"}`}
            onClick={() => {
              setWorkspaceView("guest-list");
              editor.setSelectedId(null);
              setDetailsObjectId(null);
            }}
          >
            <ClipboardList size={13} /> Guest List
          </button>
        </div>
      </nav>

      {workspaceView === "guest-list" ? (
        <div className="floor-planner-workspace flex min-h-0 flex-1">
          <GuestListSheet
            objects={editor.layout.objects}
            servicePlan={servicePlan}
            eventName={editor.layout.name}
            venueName={`${locationName} · ${venue.name}`}
            onPrint={printPlan}
            onUpdateGuest={editor.updateGuest}
          />
        </div>
      ) : (
      <div className="floor-planner-workspace grid min-h-0 flex-1 grid-cols-[258px_minmax(520px,1fr)_292px]">
        <div className="floor-planner-library min-h-0 overflow-hidden [&>aside]:h-full">
          <ObjectLibrary onAdd={addCentered} inventory={inventory} usage={inventoryUsage} />
        </div>

        <section className="floor-planner-canvas flex min-w-0 flex-col border-x border-[#dce2dd]">
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
          {servicePlan.defaultLabel || servicePlan.markers.length || servicePlan.hasNoAlcohol ? (
            <div className="shrink-0 border-b border-[#dce2dd] bg-[#fffefa] px-4 py-2">
              <ServiceLegend plan={servicePlan} compact />
            </div>
          ) : null}
          <EditorCanvas
            layout={activeLayout}
            servicePlan={servicePlan}
            venue={activeVenue}
            selectedId={selectedId}
            mode={mode}
            zoom={zoom}
            showReference={showReference}
            resetViewKey={resetViewKey}
            onSelect={editor.setSelectedId}
            onAdd={addOnActiveLevel}
            onChange={updateOnActiveLevel}
            onOpenDetails={(id) => {
              editor.setSelectedId(id);
              setDetailsObjectId(id);
            }}
            onZoomChange={setZoom}
          />
          <div className="floor-planner-status flex h-9 shrink-0 items-center justify-between border-t border-[#dce2dd] bg-[#fffefa] px-4 text-[11px] text-[#6c7871]">
            <span>{mode === "pan" ? "Drag the canvas to pan" : "Click to select · Right-click a table or chair for guest details and linking"}</span>
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
            onEditSeating={() => selectedId && setDetailsObjectId(selectedId)}
          />
        </div>
      </div>
      )}

      {editor.notice ? (
        <div className="toast-in fixed bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d2923] px-4 py-2 text-xs font-semibold text-white shadow-xl">
          {editor.notice}
        </div>
      ) : null}

      {detailsObject ? (
        <SeatingDetailsDialog
          key={detailsObject.id}
          object={detailsObject}
          candidates={activeLayout.objects.filter((object) => object.id !== detailsObject.id)}
          onClose={() => setDetailsObjectId(null)}
          onSave={(seatAssignments, linkedObjectIds, linkedSeatAssignments) => {
            editor.updateDetails(detailsObject.id, seatAssignments, linkedObjectIds, linkedSeatAssignments);
            setDetailsObjectId(null);
          }}
        />
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
