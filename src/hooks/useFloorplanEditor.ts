"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventObject, EventObjectSelection, FloorplanLayout } from "@/domain/floorplan";
import { commitHistory, createHistory, redoHistory, undoHistory } from "@/domain/history";
import {
  addObject,
  createEmptyLayout,
  createEventObject,
  deleteObject,
  duplicateObject,
  getLayoutStats,
  normalizePhysicalFootprints,
  reorderObject,
  updateObject,
} from "@/domain/layout-operations";
import { deserializeFloorplan, serializeFloorplan, STORAGE_KEY } from "@/domain/persistence";
import type { InventoryConfiguration } from "@/domain/inventory";
import { validateLayoutInventory } from "@/domain/inventory";

type EditorConfiguration = {
  venueTemplateId: string;
  inventory: InventoryConfiguration;
  inventoryOwner: string;
};

export function useFloorplanEditor({ venueTemplateId, inventory, inventoryOwner }: EditorConfiguration) {
  const storageKey = `${STORAGE_KEY}:${venueTemplateId}`;
  const [history, setHistory] = useState(() => createHistory(createEmptyLayout(venueTemplateId)));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const layout = history.present;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedLayout = deserializeFloorplan(stored);
          const savedLayout = normalizePhysicalFootprints({
            ...parsedLayout,
            name: parsedLayout.name === "Miller–Reed Wedding" ? "" : parsedLayout.name,
          });
          const validation = validateLayoutInventory(savedLayout, inventory, inventoryOwner);
          if (!validation.valid) throw new Error(validation.message);
          setHistory(createHistory(savedLayout));
        }
      } catch {
        setNotice("Saved plan could not be read; opened a fresh plan.");
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [inventory, inventoryOwner, storageKey]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, serializeFloorplan(layout));
  }, [layout, ready, storageKey]);

  const commit = useCallback((next: FloorplanLayout) => {
    setHistory((current) => commitHistory(current, next));
  }, []);

  const commitValidated = useCallback((next: FloorplanLayout) => {
    const validation = validateLayoutInventory(next, inventory, inventoryOwner);
    if (!validation.valid) {
      setNotice(validation.message);
      return false;
    }
    commit(next);
    return true;
  }, [commit, inventory, inventoryOwner]);

  const add = useCallback(
    (selection: EventObjectSelection, position: { x: number; y: number }) => {
      const object = createEventObject(selection.type, position, layout.objects, undefined, selection.variant);
      if (commitValidated(addObject(layout, object))) setSelectedId(object.id);
    },
    [commitValidated, layout],
  );

  const update = useCallback(
    (id: string, patch: Partial<EventObject>) => {
      commitValidated(updateObject(layout, id, patch));
    },
    [commitValidated, layout],
  );

  const remove = useCallback(
    (id = selectedId) => {
      if (!id) return;
      commit(deleteObject(layout, id));
      setSelectedId(null);
    },
    [commit, layout, selectedId],
  );

  const duplicate = useCallback(
    (id = selectedId) => {
      if (!id) return;
      const next = duplicateObject(layout, id);
      if (commitValidated(next)) setSelectedId(next.objects.at(-1)?.id ?? null);
    },
    [commitValidated, layout, selectedId],
  );

  const reorder = useCallback(
    (direction: "forward" | "backward") => {
      if (selectedId) commit(reorderObject(layout, selectedId, direction));
    },
    [commit, layout, selectedId],
  );

  const undo = useCallback(() => setHistory((current) => undoHistory(current)), []);
  const redo = useCallback(() => setHistory((current) => redoHistory(current)), []);

  const renameLayout = useCallback((name: string) => {
    const updatedAt = new Date().toISOString();
    const rename = (source: FloorplanLayout) => ({ ...source, name, updatedAt });
    setHistory((current) => ({
      past: current.past.map(rename),
      present: rename(current.present),
      future: current.future.map(rename),
    }));
  }, []);

  const reset = useCallback(() => {
    if (!window.confirm("Reset this layout? All event objects will be removed.")) return;
    const fresh = createEmptyLayout(venueTemplateId);
    localStorage.removeItem(storageKey);
    setHistory(createHistory(fresh));
    setSelectedId(null);
    setNotice("Reset to the venue template");
  }, [storageKey, venueTemplateId]);

  const importLayout = useCallback((imported: FloorplanLayout) => {
    const normalized = normalizePhysicalFootprints(imported);
    const validation = validateLayoutInventory(normalized, inventory, inventoryOwner);
    if (!validation.valid) {
      setNotice(validation.message);
      return false;
    }
    setHistory(createHistory(normalized));
    setSelectedId(null);
    setNotice("Saved plan opened");
    return true;
  }, [inventory, inventoryOwner]);

  return {
    layout,
    selectedId,
    selectedObject: layout.objects.find((object) => object.id === selectedId) ?? null,
    stats: useMemo(() => getLayoutStats(layout), [layout]),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    ready,
    notice,
    setSelectedId,
    add,
    update,
    remove,
    duplicate,
    reorder,
    undo,
    redo,
    renameLayout,
    reset,
    importLayout,
  };
}
