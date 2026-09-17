"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link2, Unlink, Users, X } from "lucide-react";
import type { EventObject } from "@/domain/floorplan";
import { getObjectDisplayName, isLinkableSeatingObject } from "@/domain/object-catalog";
import { getSeatNumbering } from "@/domain/seat-numbering";

type Props = {
  object: EventObject;
  candidates: readonly EventObject[];
  onClose: () => void;
  onSave: (
    seatAssignments: string[],
    linkedObjectIds: string[],
    linkedSeatAssignments: Readonly<Record<string, string[]>>,
  ) => void;
};

export function SeatingDetailsDialog({ object, candidates, onClose, onSave }: Props) {
  const seatCount = Math.max(0, Math.floor(object.seats ?? 0));
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [seatAssignments, setSeatAssignments] = useState(() =>
    Array.from({ length: seatCount }, (_, index) => object.seatAssignments?.[index] ?? ""),
  );
  const [linkedIds, setLinkedIds] = useState(() => new Set(
    object.linkedGroupId
      ? candidates.filter((candidate) => candidate.linkedGroupId === object.linkedGroupId).map((candidate) => candidate.id)
      : [],
  ));
  const [linkedSeatAssignments, setLinkedSeatAssignments] = useState<Record<string, string[]>>(() => Object.fromEntries(
    candidates.map((candidate) => [
      candidate.id,
      Array.from(
        { length: Math.max(0, Math.floor(candidate.seats ?? 0)) },
        (_, index) => candidate.seatAssignments?.[index] ?? "",
      ),
    ]),
  ));
  const canLink = isLinkableSeatingObject(object.type);
  const linkCandidates = useMemo(
    () => canLink ? candidates.filter((candidate) => isLinkableSeatingObject(candidate.type)) : [],
    [canLink, candidates],
  );
  const linkedChairSeats = useMemo(() => {
    if (object.tableNumber === undefined) return [];
    const pendingGroupId = "pending-seat-details";
    const pendingObjects = [
      { ...object, linkedGroupId: pendingGroupId },
      ...candidates.map((candidate) => ({
        ...candidate,
        linkedGroupId: linkedIds.has(candidate.id) ? pendingGroupId : undefined,
      })),
    ];
    const numbering = getSeatNumbering(pendingObjects);

    return candidates
      .filter((candidate) => candidate.type === "chair" && linkedIds.has(candidate.id))
      .flatMap((candidate) => {
        const assignment = numbering.linkedChairSeats.get(candidate.id);
        if (!assignment || assignment.tableId !== object.id) return [];
        const candidateSeatCount = Math.max(0, Math.floor(candidate.seats ?? 0));
        return Array.from({ length: candidateSeatCount }, (_, seatIndex) => ({
          objectId: candidate.id,
          seatIndex,
          displaySeatNumber: assignment.firstSeatNumber + seatIndex,
        }));
      })
      .sort((first, second) => first.displaySeatNumber - second.displaySeatNumber || first.objectId.localeCompare(second.objectId));
  }, [candidates, linkedIds, object]);
  const totalSeatCount = seatCount + linkedChairSeats.length;

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const attachedChairIds = new Set(linkedChairSeats.map((seat) => seat.objectId));
    onSave(
      seatAssignments.map((name) => name.trim()),
      [...linkedIds],
      Object.fromEntries(
        [...attachedChairIds].map((objectId) => [
          objectId,
          (linkedSeatAssignments[objectId] ?? []).map((name) => name.trim()),
        ]),
      ),
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1d2923]/45 p-5 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="seating-details-title"
        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/80 bg-[#fffefa] shadow-[0_30px_90px_rgba(20,35,27,0.32)]"
        onSubmit={submit}
      >
        <header className="flex items-start justify-between border-b border-[#e0e5e1] px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a958e]">Seating details</p>
            <h2 id="seating-details-title" className="mt-1 font-serif text-2xl font-semibold text-[#24372d]">{object.label}</h2>
            <p className="mt-1 text-xs text-[#76837b]">{getObjectDisplayName(object.type, object.variant)}</p>
          </div>
          <button type="button" className="grid size-9 place-items-center rounded-full text-[#6f7d75] hover:bg-[#eef2ee]" onClick={onClose} aria-label="Close seating details">
            <X size={18} />
          </button>
        </header>

        <div className="subtle-scrollbar grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <section>
            <div className="flex items-center gap-2 text-[#385545]">
              <Users size={17} />
              <h3 className="text-sm font-bold">Guest names</h3>
              <span className="rounded-full bg-[#e8f0eb] px-2 py-0.5 text-[10px] font-bold">{totalSeatCount} {totalSeatCount === 1 ? "seat" : "seats"}</span>
            </div>
            {seatCount ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {seatAssignments.map((name, index) => (
                  <label key={index} className="block text-[11px] font-semibold text-[#5c6a62]">
                    <span className="mb-1.5 block">Seat {index + 1}</span>
                    <input
                      ref={index === 0 ? firstInputRef : undefined}
                      value={name}
                      maxLength={80}
                      placeholder="Guest name"
                      className="h-10 w-full rounded-lg border border-[#d8dfda] bg-white px-3 text-sm text-[#2e4036] outline-none transition focus:border-[#688773] focus:ring-2 focus:ring-[#8baa96]/20"
                      onChange={(event) => setSeatAssignments((current) => current.map((value, seatIndex) => seatIndex === index ? event.target.value : value))}
                    />
                  </label>
                ))}
                {linkedChairSeats.map(({ objectId, seatIndex, displaySeatNumber }) => (
                  <label key={`${objectId}:${seatIndex}`} className="block text-[11px] font-semibold text-[#5c6a62]">
                    <span className="mb-1.5 flex items-center gap-1.5">
                      Seat {displaySeatNumber}
                      <span className="rounded-full bg-[#edf2ef] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#718078]">Linked chair</span>
                    </span>
                    <input
                      value={linkedSeatAssignments[objectId]?.[seatIndex] ?? ""}
                      maxLength={80}
                      placeholder="Guest name"
                      className="h-10 w-full rounded-lg border border-[#b9c9bf] bg-[#f8fbf9] px-3 text-sm text-[#2e4036] outline-none transition focus:border-[#688773] focus:ring-2 focus:ring-[#8baa96]/20"
                      onChange={(event) => setLinkedSeatAssignments((current) => ({
                        ...current,
                        [objectId]: (current[objectId] ?? []).map((value, linkedSeatIndex) => linkedSeatIndex === seatIndex ? event.target.value : value),
                      }))}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-[#d9dfdb] bg-[#f7f8f5] p-4 text-xs leading-5 text-[#77847c]">This object has no assigned seats. Set its seat count in the Properties panel first.</p>
            )}
            {totalSeatCount > 1 ? (
              <p className="mt-3 text-[10px] leading-4 text-[#87938c]">Seat numbers match the visible chair markers. Linked end chairs continue after the table’s built-in seats.</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-[#dfe5e0] bg-[#f5f7f4] p-4">
            <div className="flex items-center gap-2 text-[#385545]">
              <Link2 size={16} />
              <h3 className="text-sm font-bold">Move together</h3>
            </div>
            {canLink ? (
              <>
                <p className="mt-2 text-[11px] leading-5 text-[#748078]">Link rectangle tables and end chairs. Their spacing stays fixed whenever any linked item moves.</p>
                {linkCandidates.length ? (
                  <div className="mt-3 space-y-2">
                    {linkCandidates.map((candidate) => (
                      <label key={candidate.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#dce2dd] bg-white px-3 py-2.5 hover:border-[#9fb3a7]">
                        <input
                          type="checkbox"
                          checked={linkedIds.has(candidate.id)}
                          className="size-4 accent-[#294f3d]"
                          onChange={(event) => setLinkedIds((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(candidate.id);
                            else next.delete(candidate.id);
                            return next;
                          })}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-[#405047]">{candidate.label}</span>
                          <span className="block truncate text-[10px] text-[#839087]">{getObjectDisplayName(candidate.type, candidate.variant)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[11px] text-[#849087]">Add another rectangle table or single chair to this floor to link it.</p>
                )}
                {linkedIds.size ? (
                  <button type="button" className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#8f594b] hover:text-[#713f33]" onClick={() => setLinkedIds(new Set())}>
                    <Unlink size={13} /> Unlink all
                  </button>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-[11px] leading-5 text-[#7a867f]">Linking is available for rectangle tables, farmhouse tables, and single chairs.</p>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-[#e0e5e1] bg-[#fafaf7] px-6 py-4">
          <p className="hidden text-[10px] text-[#839087] sm:block">Right-click the object anytime to edit these details.</p>
          <div className="ml-auto flex gap-2">
            <button type="button" className="h-10 rounded-lg border border-[#d4dbd6] bg-white px-4 text-xs font-bold text-[#536158] hover:bg-[#f3f5f3]" onClick={onClose}>Cancel</button>
            <button type="submit" className="h-10 rounded-lg bg-[#294f3d] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#1f4031]">Save details</button>
          </div>
        </footer>
      </form>
    </div>
  );
}
