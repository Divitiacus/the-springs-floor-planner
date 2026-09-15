"use client";

import { Copy, Eye, EyeOff, Hand, MousePointer2, Redo2, RotateCcw, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";

export type EditorMode = "select" | "pan";

type Props = {
  mode: EditorMode;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasReference: boolean;
  showReference: boolean;
  onModeChange: (mode: EditorMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onZoomChange: (zoom: number) => void;
  onResetView: () => void;
  onToggleReference: () => void;
};

export function EditorToolbar(props: Props) {
  return (
    <div className="floor-planner-toolbar flex h-12 shrink-0 items-center justify-between border-b border-[#dce2dd] bg-[#fffefa] px-3">
      <div className="flex items-center gap-1">
        <ToolButton label="Select (V)" active={props.mode === "select"} onClick={() => props.onModeChange("select")}><MousePointer2 size={15} /></ToolButton>
        <ToolButton label="Pan (H)" active={props.mode === "pan"} onClick={() => props.onModeChange("pan")}><Hand size={15} /></ToolButton>
        <Divider />
        <ToolButton label="Undo" disabled={!props.canUndo} onClick={props.onUndo}><Undo2 size={15} /></ToolButton>
        <ToolButton label="Redo" disabled={!props.canRedo} onClick={props.onRedo}><Redo2 size={15} /></ToolButton>
        <Divider />
        <ToolButton label="Duplicate" disabled={!props.hasSelection} onClick={props.onDuplicate}><Copy size={15} /></ToolButton>
        <ToolButton label="Delete" disabled={!props.hasSelection} danger onClick={props.onDelete}><Trash2 size={15} /></ToolButton>
      </div>

      <div className="flex items-center gap-1">
        {props.hasReference ? (
          <>
            <ToolButton label={props.showReference ? "Hide source reference" : "Show source reference"} active={props.showReference} onClick={props.onToggleReference}>
              {props.showReference ? <Eye size={15} /> : <EyeOff size={15} />}
            </ToolButton>
            <Divider />
          </>
        ) : null}
        <ToolButton label="Zoom out" onClick={() => props.onZoomChange(Math.max(0.55, props.zoom - 0.1))}><ZoomOut size={15} /></ToolButton>
        <span className="w-12 text-center text-[11px] font-semibold tabular-nums text-[#55635b]">{Math.round(props.zoom * 100)}%</span>
        <ToolButton label="Zoom in" onClick={() => props.onZoomChange(Math.min(2.2, props.zoom + 0.1))}><ZoomIn size={15} /></ToolButton>
        <ToolButton label="Fit view" onClick={props.onResetView}><RotateCcw size={14} /></ToolButton>
      </div>
    </div>
  );
}

function ToolButton({ children, label, active, disabled, danger, onClick }: { children: React.ReactNode; label: string; active?: boolean; disabled?: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md transition-colors ${active ? "bg-[#e4ece7] text-[#294f3d]" : danger ? "text-[#8d5142] hover:bg-[#f8ece8]" : "text-[#59675f] hover:bg-[#f0f3f0]"} disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[#dce2dd]" />;
}
