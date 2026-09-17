"use client";

import { ArrowDown, ArrowUp, Copy, MousePointer2, Trash2, UsersRound } from "lucide-react";
import type { EventObject } from "@/domain/floorplan";
import {
  CHAIR_ROW_MAX_SEATS,
  describePhysicalDimensions,
  getChairRowMinimumWidth,
  getObjectDisplayName,
  OBJECT_DEFINITIONS,
  TABLE_TYPES,
} from "@/domain/object-catalog";

type Props = {
  object: EventObject | null;
  onChange: (id: string, patch: Partial<EventObject>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReorder: (direction: "forward" | "backward") => void;
  onEditSeating: () => void;
};

export function PropertiesPanel({ object, onChange, onDuplicate, onDelete, onReorder, onEditSeating }: Props) {
  const definition = object ? OBJECT_DEFINITIONS[object.type] : null;
  return (
    <aside className="subtle-scrollbar min-h-0 overflow-y-auto bg-[#fffefa] px-4 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a958e]">Properties</p>
      {!object ? (
        <div className="mt-12 flex flex-col items-center px-4 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[#edf2ee] text-[#789082]"><MousePointer2 size={20} /></span>
          <h2 className="mt-4 text-sm font-bold text-[#35463c]">Nothing selected</h2>
          <p className="mt-1.5 text-xs leading-5 text-[#7b877f]">Select an event object on the floorplan to edit its details.</p>
          <div className="mt-7 w-full rounded-xl border border-[#e1e5e1] bg-[#f8f8f5] p-3 text-left text-[10px] leading-5 text-[#748078]">
            <p><kbd className="rounded border bg-white px-1.5 py-0.5 font-sans">⌘/Ctrl D</kbd> Duplicate</p>
            <p><kbd className="rounded border bg-white px-1.5 py-0.5 font-sans">Delete</kbd> Remove</p>
            <p><kbd className="rounded border bg-white px-1.5 py-0.5 font-sans">⌘/Ctrl Z</kbd> Undo</p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-5 rounded-xl border border-[#dfe5e0] bg-[#f4f7f4] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b877f]">Selected object</p>
            <p className="mt-1 text-sm font-bold text-[#294f3d]">{getObjectDisplayName(object.type, object.variant)}</p>
          </div>

          <div className="space-y-4">
            <Field label="Label">
              <input value={object.label} onChange={(event) => onChange(object.id, { label: event.target.value })} />
            </Field>

            {TABLE_TYPES.has(object.type) ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Table number">
                    <input type="number" min={1} value={object.tableNumber ?? ""} onChange={(event) => onChange(object.id, { tableNumber: numberOrZero(event.target.value) })} />
                  </Field>
                  <Field label={`Seats (max ${definition?.maximumSeats ?? "—"})`}>
                    <input type="number" min={0} max={definition?.maximumSeats} value={object.seats ?? 0} onChange={(event) => onChange(object.id, { seats: numberOrZero(event.target.value) })} />
                  </Field>
                </div>
              </div>
            ) : null}

            {object.type === "chair-row" ? (
              <Field label={`Seats in row (max ${CHAIR_ROW_MAX_SEATS})`}>
                <input
                  type="number"
                  min={2}
                  max={CHAIR_ROW_MAX_SEATS}
                  value={object.seats ?? 10}
                  onChange={(event) => onChange(object.id, { seats: numberOrZero(event.target.value) })}
                />
              </Field>
            ) : null}

            {object.seats !== undefined ? (
              <button
                type="button"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#bfcfc5] bg-[#edf3ef] text-xs font-bold text-[#385545] hover:bg-[#e3ece6]"
                onClick={onEditSeating}
              >
                <UsersRound size={15} /> Guest names &amp; links
              </button>
            ) : null}

            <div className="rounded-lg border border-[#e0e5e1] bg-[#f8f9f7] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#87928c]">Physical size</p>
              <p className="mt-1 text-xs font-semibold text-[#536158]">
                {object.type === "chair-row"
                  ? `${Math.round(object.width)} in wide · ${formatChairPitch(object)} in chair pitch`
                  : describePhysicalDimensions(object.physicalDimensions)}
              </p>
            </div>

            {definition?.resizable ? (
              <div>
                <div className={object.type === "chair-row" ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"}>
                  <Field label="Planning width">
                    <NumberInput
                      min={object.type === "chair-row" ? getChairRowMinimumWidth(object.seats) : 20}
                      value={Math.round(object.width)}
                      onValue={(width) => onChange(object.id, { width: Math.max(object.type === "chair-row" ? getChairRowMinimumWidth(object.seats) : 20, width) })}
                    />
                  </Field>
                  {object.type === "chair-row" ? null : (
                    <Field label="Planning height">
                      <NumberInput value={Math.round(object.height)} onValue={(height) => onChange(object.id, { height: Math.max(20, height) })} />
                    </Field>
                  )}
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-[#8a958e]">
                  {object.type === "chair-row"
                    ? "Drag either side handle to widen or squeeze the row. Chair legs stay aligned while the seat cushions retain a visible gap."
                    : "Display footprint only; physical measurements are not configured."}
                </p>
              </div>
            ) : null}

            <Field label="Rotation">
              <div className="relative">
                <input className="pr-8" type="number" min={-360} max={360} value={Math.round(object.rotation)} onChange={(event) => onChange(object.id, { rotation: numberOrZero(event.target.value) })} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9aa39d]">°</span>
              </div>
            </Field>
          </div>

          <div className="mt-6 border-t border-[#e2e6e2] pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8a958e]">Arrange</p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton onClick={() => onReorder("forward")}><ArrowUp size={14} /> Bring forward</ActionButton>
              <ActionButton onClick={() => onReorder("backward")}><ArrowDown size={14} /> Send backward</ActionButton>
              <ActionButton onClick={onDuplicate}><Copy size={14} /> Duplicate</ActionButton>
              <ActionButton danger onClick={onDelete}><Trash2 size={14} /> Delete</ActionButton>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-[#5e6b63]">
      <span className="mb-1.5 block">{label}</span>
      <span className="block [&_input]:h-9 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#d9dfda] [&_input]:bg-white [&_input]:px-3 [&_input]:text-xs [&_input]:font-medium [&_input]:text-[#35463c] [&_input]:shadow-sm [&_input]:disabled:bg-[#f3f4f2] [&_input]:disabled:text-[#99a19c]">
        {children}
      </span>
    </label>
  );
}

function NumberInput({ value, min = 20, disabled, onValue }: { value: number; min?: number; disabled?: boolean; onValue: (value: number) => void }) {
  return <input type="number" min={min} value={value} disabled={disabled} onChange={(event) => onValue(numberOrZero(event.target.value))} />;
}

function ActionButton({ children, danger, onClick }: { children: React.ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[10px] font-bold ${danger ? "border-[#ead8d2] text-[#a35541] hover:bg-[#f9eeeb]" : "border-[#d9dfda] text-[#526158] hover:bg-[#f3f5f3]"}`} onClick={onClick}>
      {children}
    </button>
  );
}

function numberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatChairPitch(object: EventObject) {
  const seats = Math.max(2, Math.floor(object.seats ?? 2));
  return ((object.width - object.width / seats) / (seats - 1)).toFixed(1);
}
