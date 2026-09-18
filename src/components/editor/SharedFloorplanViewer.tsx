"use client";

import { useMemo, useState } from "react";
import type { FloorplanLayout, VenueTemplate } from "@/domain/floorplan";
import { getLayoutStats } from "@/domain/layout-operations";
import { buildServicePlan } from "@/domain/service-markers";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { ServiceLegend } from "@/components/editor/ServiceLegend";
import { SpringsLogo } from "@/components/brand/SpringsLogo";

export function SharedFloorplanViewer({
  layout,
  levelVenues,
  locationName,
}: {
  layout: FloorplanLayout;
  levelVenues: VenueTemplate[];
  locationName: string;
}) {
  const [activeLevelId, setActiveLevelId] = useState(levelVenues[0]?.levelId);
  const [zoom, setZoom] = useState(1);
  const [resetViewKey, setResetViewKey] = useState(0);
  const activeVenue =
    levelVenues.find((venue) => venue.levelId === activeLevelId) ??
    levelVenues[0];
  const activeLayout = useMemo(
    () => ({
      ...layout,
      objects: layout.objects.filter(
        (object) =>
          resolveLevelId(
            object.levelId ?? object.floorLevelId ?? levelVenues[0]?.levelId,
          ) === activeVenue?.levelId,
      ),
    }),
    [activeLevelId, activeVenue?.levelId, layout, levelVenues],
  );
  const stats = useMemo(() => getLayoutStats(activeLayout), [activeLayout]);
  const servicePlan = useMemo(
    () => buildServicePlan(layout.objects),
    [layout.objects],
  );

  if (!activeVenue) return null;

  return (
    <main className="floor-planner-shell flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#f6f4ef]">
      <header className="floor-planner-header flex h-[72px] shrink-0 items-center justify-between border-b border-[#dce2dd] bg-[#fffefa] px-5">
        <div className="flex items-center gap-4">
          <SpringsLogo />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-[19px] font-semibold tracking-[-0.01em] text-[#1d2923]">
                {layout.name}
              </h1>
              <span className="rounded-full bg-[#efe6d2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#806431]">
                Shared view
              </span>
            </div>
            <div className="mt-0.5 text-xs text-[#748078]">
              {locationName} · {activeVenue.name}
            </div>
          </div>
        </div>
        <div className="text-right text-[11px] font-semibold text-[#66736c]">
          Read-only floor plan
        </div>
      </header>

      {levelVenues.length > 1 ? (
        <nav className="flex h-12 shrink-0 items-center justify-center border-b border-[#dce2dd] bg-[#f8f7f2] px-4" aria-label="Floor level">
          <div className="inline-flex rounded-xl border border-[#cfd7d1] bg-white p-1 shadow-sm">
            {levelVenues.map((level) => (
              <button
                key={level.levelId ?? level.id}
                type="button"
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                  level.levelId === activeLevelId
                    ? "bg-[#294f3d] text-white shadow-sm"
                    : "text-[#66736c] hover:bg-[#eef2ee]"
                }`}
                onClick={() => {
                  setActiveLevelId(level.levelId);
                  setZoom(1);
                  setResetViewKey((key) => key + 1);
                }}
              >
                {level.levelName}
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      {servicePlan.defaultLabel ||
      servicePlan.markers.length ||
      servicePlan.hasNoAlcohol ? (
        <div className="shrink-0 border-b border-[#dce2dd] bg-[#fffefa] px-4 py-2">
          <ServiceLegend plan={servicePlan} compact />
        </div>
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col">
        <EditorCanvas
          layout={activeLayout}
          servicePlan={servicePlan}
          venue={activeVenue}
          selectedId={null}
          mode="pan"
          zoom={zoom}
          showReference={false}
          resetViewKey={resetViewKey}
          onSelect={() => undefined}
          onAdd={() => undefined}
          onChange={() => undefined}
          onOpenDetails={() => undefined}
          onZoomChange={setZoom}
        />
        <div className="floor-planner-status flex h-9 shrink-0 items-center justify-between border-t border-[#dce2dd] bg-[#fffefa] px-4 text-[11px] text-[#6c7871]">
          <span>Scroll to zoom · Drag the canvas to pan</span>
          <div className="flex items-center gap-4 font-semibold text-[#425148]">
            {levelVenues.length > 1 ? <span>{activeVenue.levelName}</span> : null}
            <span>{stats.guestTables} guest tables</span>
            <span>{stats.seats} seats</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function resolveLevelId(levelId: string | undefined) {
  if (levelId === "main-floor") return "level-1-main-floor";
  if (levelId === "balcony") return "level-2-balcony";
  return levelId;
}
