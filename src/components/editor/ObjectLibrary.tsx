"use client";

import { Armchair, Camera, Circle, Heart, LayoutGrid, Martini, Moon, Music2, RectangleHorizontal, Utensils } from "lucide-react";
import type { EventObjectSelection, PhysicalObjectDimensions } from "@/domain/floorplan";
import { describePhysicalDimensions, isObjectAvailableForInventory, OBJECT_CATALOG, type ObjectDefinition } from "@/domain/object-catalog";
import type { InventoryConfiguration, InventoryUsage } from "@/domain/inventory";

const categories: ObjectDefinition["category"][] = ["Tables", "Production", "Event essentials"];

const icons = {
  round: Circle,
  rectangle: RectangleHorizontal,
  heart: Heart,
  "half-moon": Moon,
  music: Music2,
  bar: Martini,
  buffet: Utensils,
  camera: Camera,
  dance: LayoutGrid,
  chair: Armchair,
};

type Props = {
  onAdd: (selection: EventObjectSelection) => void;
  inventory: InventoryConfiguration;
  usage: InventoryUsage;
};

export function ObjectLibrary({ onAdd, inventory, usage }: Props) {
  return (
    <aside className="subtle-scrollbar min-h-0 overflow-y-auto overscroll-contain bg-[#fffefa] px-4 pt-5 pb-24 [scrollbar-gutter:stable]">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a958e]">Object library</p>
        <h2 className="mt-1 text-sm font-bold text-[#25352c]">Add to floorplan</h2>
        <p className="mt-1 text-[11px] leading-4 text-[#7b877f]">Click or drag an item onto the hall.</p>
      </div>

      <InventorySummary inventory={inventory} usage={usage} />

      <div className="mt-5 space-y-5">
        {categories.map((category) => (
          <section key={category}>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#7b877f]">{category}</h3>
            <div className="space-y-1.5">
              {OBJECT_CATALOG
                .filter((item) => item.category === category && item.showInLibrary !== false)
                .flatMap(getLibraryChoices)
                .filter((choice) => isObjectAvailableForInventory(choice.definition, inventory, choice.selection.variant))
                .map((choice) => {
                  const Icon = icons[choice.definition.icon];
                  const seatCount = inventory.defaultSeats?.[choice.definition.type] ?? choice.definition.defaultSeats;
                  return (
                    <button
                      key={choice.key}
                      draggable
                      className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:border-[#dfe5e0] hover:bg-[#f4f6f3]"
                      onClick={() => onAdd(choice.selection)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("application/x-springs-object", JSON.stringify(choice.selection));
                        event.dataTransfer.effectAllowed = "copy";
                      }}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf2ee] text-[#456351] group-hover:bg-[#dfe9e2]">
                        <Icon size={17} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-[#35463c]">{choice.name}</span>
                        <span className="mt-0.5 block text-[10px] text-[#8a958e]">
                          {choice.definition.type === "chair"
                            ? "1 seat · matches table-chair size"
                            : choice.definition.type === "chair-row"
                              ? `${seatCount ?? 10} seats · adjustable row`
                            : seatCount
                              ? `${seatCount} seats · ${describePhysicalDimensions(choice.physicalDimensions)}`
                              : choice.definition.resizable
                                ? "Resizable planning footprint"
                                : describePhysicalDimensions(choice.physicalDimensions)}
                        </span>
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

type LibraryChoice = {
  key: string;
  definition: ObjectDefinition;
  selection: EventObjectSelection;
  name: string;
  physicalDimensions: PhysicalObjectDimensions;
};

function getLibraryChoices(definition: ObjectDefinition): LibraryChoice[] {
  if (!definition.variants) {
    return [{
      key: definition.type,
      definition,
      selection: { type: definition.type },
      name: definition.name,
      physicalDimensions: definition.physicalDimensions,
    }];
  }

  return definition.variants.map((variant) => ({
    key: `${definition.type}:${variant.id}`,
    definition,
    selection: { type: definition.type, variant: variant.id },
    name: variant.name,
    physicalDimensions: variant.physicalDimensions,
  }));
}

function InventorySummary({ inventory, usage }: Pick<Props, "inventory" | "usage">) {
  const rows = [
    { type: "round-table-48" as const, label: '48" Round', inventoryOnly: true },
    { type: "round-table-60" as const, label: '60" Round' },
    { type: "round-table-72" as const, label: '72" Round', inventoryOnly: true },
    { type: "rectangle-table-6" as const, label: "6' Rectangle" },
    { type: "rectangle-table-8" as const, label: "8' Rectangle" },
    { type: "farmhouse-table-6" as const, label: "6' Farmhouse", inventoryOnly: true },
    { type: "farmhouse-table-8" as const, label: "8' Farmhouse", inventoryOnly: true },
    { type: "parson-table-7" as const, label: "Parson" },
    { type: "parson-table-5" as const, label: "5' Parson", inventoryOnly: true },
    { type: "side-table-wood" as const, label: "Wood Side", inventoryOnly: true },
    { type: "cocktail-table-plastic" as const, label: "Plastic Cocktail", inventoryOnly: true },
    { type: "cocktail-table-white-wood" as const, label: "White Wood Cocktail", inventoryOnly: true },
    { type: "display-table-32" as const, label: '32" Wood Top', inventoryOnly: true },
    { type: "display-table-33" as const, label: '33" Display', inventoryOnly: true },
    { type: "sweetheart-table-32" as const, label: '32" Sweetheart', inventoryOnly: true },
    { type: "sweetheart-table-33" as const, label: '33" Sweetheart', inventoryOnly: true },
    { type: "sweetheart-table" as const, label: '36" Sweetheart' },
    { type: "sweetheart-table-48" as const, label: '48" Sweetheart', inventoryOnly: true },
    { type: "half-moon-table" as const, label: "Half-Moon", inventoryOnly: true },
    { type: "cocktail-table-32" as const, label: '32" Cocktail' },
    { type: "cocktail-table-36" as const, label: '36" Cocktail' },
    { type: "chairs" as const, label: "Chairs" },
  ];

  return (
    <section className="rounded-xl border border-[#dfe5e0] bg-[#f6f8f6] p-3" aria-labelledby="inventory-heading">
      <h3 id="inventory-heading" className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#718078]">Inventory use</h3>
      <dl className="mt-2 space-y-1.5">
        {rows.filter((row) => {
          const limit = inventory[row.type];
          return typeof limit === "number" && limit > 0;
        }).map((row) => (
          <div key={row.type} className="flex items-center justify-between gap-2 text-[10px]">
            <dt className="font-semibold text-[#536158]">{row.label}</dt>
            <dd className="tabular-nums text-[#75827b]">
              {usage[row.type]} / {inventory[row.type] ?? "not configured"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
