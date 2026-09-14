"use client";

import { Armchair, Camera, Circle, Heart, LayoutGrid, Martini, Music2, RectangleHorizontal, Utensils } from "lucide-react";
import type { EventObjectType } from "@/domain/floorplan";
import { OBJECT_CATALOG, type ObjectDefinition } from "@/domain/object-catalog";

const categories: ObjectDefinition["category"][] = ["Tables", "Production", "Event essentials"];

const icons = {
  round: Circle,
  rectangle: RectangleHorizontal,
  heart: Heart,
  music: Music2,
  bar: Martini,
  buffet: Utensils,
  camera: Camera,
  dance: LayoutGrid,
  chair: Armchair,
};

export function ObjectLibrary({ onAdd }: { onAdd: (type: EventObjectType) => void }) {
  return (
    <aside className="subtle-scrollbar min-h-0 overflow-y-auto bg-[#fffefa] px-4 py-5">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a958e]">Object library</p>
        <h2 className="mt-1 text-sm font-bold text-[#25352c]">Add to floorplan</h2>
        <p className="mt-1 text-[11px] leading-4 text-[#7b877f]">Click or drag an item onto the hall.</p>
      </div>

      <div className="space-y-5">
        {categories.map((category) => (
          <section key={category}>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#7b877f]">{category}</h3>
            <div className="space-y-1.5">
              {OBJECT_CATALOG.filter((item) => item.category === category).map((item) => {
                const Icon = icons[item.icon];
                return (
                  <button
                    key={item.type}
                    draggable
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:border-[#dfe5e0] hover:bg-[#f4f6f3]"
                    onClick={() => onAdd(item.type)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("application/x-springs-object", item.type);
                      event.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf2ee] text-[#456351] group-hover:bg-[#dfe9e2]">
                      <Icon size={17} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-[#35463c]">{item.name}</span>
                      <span className="mt-0.5 block text-[10px] text-[#8a958e]">{item.defaultSeats ? `${item.defaultSeats} seats` : item.resizable ? "Resizable" : "Standard size"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
