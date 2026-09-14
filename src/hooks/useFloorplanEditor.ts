"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventObject, EventObjectType, FloorplanLayout } from "@/domain/floorplan";
import { commitHistory, createHistory, redoHistory, undoHistory } from "@/domain/history";
import {
  addObject,
  createEmptyLayout,
  createEventObject,
  deleteObject,
  duplicateObject,
  getLayoutStats,
  reorderObject,
  updateObject,
} from "@/domain/layout-operations";
import { deserializeFloorplan, serializeFloorplan, STORAGE_KEY } from "@/domain/persistence";

export function useFloorplanEditor() {
  const [history, setHistory] = useState(() => createHistory(createEmptyLayout()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const layout = history.present;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setHistory(createHistory(deserializeFloorplan(stored)));
      } catch {
        setNotice("Saved plan could not be read; opened a fresh plan.");
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const commit = useCallback((next: FloorplanLayout) => {
    setHistory((current) => commitHistory(current, next));
  }, []);

  const add = useCallback(
    (type: EventObjectType, position: { x: number; y: number }) => {
      const object = createEventObject(type, position, layout.objects);
      commit(addObject(layout, object));
      setSelectedId(object.id);
    },
    [commit, layout],
  );

  const update = useCallback(
    (id: string, patch: Partial<EventObject>) => commit(updateObject(layout, id, patch)),
    [commit, layout],
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
      commit(next);
      setSelectedId(next.objects.at(-1)?.id ?? null);
    },
    [commit, layout, selectedId],
  );

  const reorder = useCallback(
    (direction: "forward" | "backward") => {
      if (selectedId) commit(reorderObject(layout, selectedId, direction));
    },
    [commit, layout, selectedId],
  );

  const undo = useCallback(() => setHistory((current) => undoHistory(current)), []);
  const redo = useCallback(() => setHistory((current) => redoHistory(current)), []);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, serializeFloorplan(layout));
    setNotice("Floorplan saved locally");
  }, [layout]);

  const reset = useCallback(() => {
    if (!window.confirm("Reset this layout? All event objects will be removed.")) return;
    const fresh = createEmptyLayout();
    localStorage.removeItem(STORAGE_KEY);
    setHistory(createHistory(fresh));
    setSelectedId(null);
    setNotice("Reset to the venue template");
  }, []);

  const importLayout = useCallback((imported: FloorplanLayout) => {
    setHistory(createHistory(imported));
    setSelectedId(null);
    setNotice("Floorplan JSON imported");
  }, []);

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
    save,
    reset,
    importLayout,
  };
}
