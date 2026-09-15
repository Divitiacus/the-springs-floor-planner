"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ChevronDown, MapPin } from "lucide-react";
import { SPRINGS_LOCATIONS } from "@/domain/location-catalog";

const SORTED_SPRINGS_LOCATIONS = [...SPRINGS_LOCATIONS].sort((left, right) => left.name.localeCompare(right.name));

export function FloorPlanStart() {
  const router = useRouter();
  const locationSelectRef = useRef<HTMLSelectElement>(null);
  const [locationSlug, setLocationSlug] = useState("");
  const [hallSlug, setHallSlug] = useState("");
  const selectedLocation = SORTED_SPRINGS_LOCATIONS.find((location) => location.slug === locationSlug);
  const canOpen = Boolean(selectedLocation && hallSlug);

  const selectLocation = useCallback((slug: string) => {
    setLocationSlug(slug);
    setHallSlug("");
  }, []);

  useEffect(() => {
    const syncRestoredLocation = () => {
      const restoredSlug = locationSelectRef.current?.value;
      if (
        restoredSlug &&
        restoredSlug !== locationSlug &&
        SORTED_SPRINGS_LOCATIONS.some((location) => location.slug === restoredSlug)
      ) {
        selectLocation(restoredSlug);
      }
    };

    syncRestoredLocation();
    const frame = window.requestAnimationFrame(syncRestoredLocation);
    const restoreMonitor = window.setInterval(syncRestoredLocation, 500);
    window.addEventListener("pageshow", syncRestoredLocation);
    window.addEventListener("focus", syncRestoredLocation);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(restoreMonitor);
      window.removeEventListener("pageshow", syncRestoredLocation);
      window.removeEventListener("focus", syncRestoredLocation);
    };
  }, [locationSlug, selectLocation]);

  const openFloorPlan = () => {
    if (!canOpen) return;
    const query = new URLSearchParams({ location: locationSlug, hall: hallSlug });
    router.push(`/floorplan?${query.toString()}`);
  };

  return (
    <main className="start-page relative min-h-screen overflow-hidden bg-[#f4f1ea]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-20 size-72 rounded-full bg-[#9aaeb9]/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-80 rounded-full bg-[#b59a62]/10 blur-3xl" />
        <div className="start-page-grid absolute inset-0 opacity-45" />
      </div>

      <header className="relative mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-7 sm:px-10 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="The Springs Floor Plan Designer home">
          <span className="grid size-10 place-items-center rounded-full bg-[#334b59] font-serif text-lg font-semibold text-white shadow-sm">S</span>
          <span>
            <span className="block font-serif text-[17px] font-semibold tracking-[-0.01em] text-[#283942]">The Springs</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#8b969b]">Events</span>
          </span>
        </Link>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a969c] sm:block">Venue planning tools</span>
      </header>

      <section className="relative mx-auto grid w-full max-w-[1180px] items-center gap-12 px-6 pb-16 pt-8 sm:px-10 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(430px,0.72fr)] lg:px-12 lg:pb-24 lg:pt-0">
        <div className="max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-[#b59a62]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#927a4f]">Thoughtful layouts, beautiful events</span>
          </div>
          <h1 className="font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.035em] text-[#263943] sm:text-6xl lg:text-[68px]">
            Floor Plan<br />Designer
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-7 text-[#687980]">
            Select a location and hall to begin creating a floor plan.
          </p>
          <div className="mt-10 flex items-center gap-3 text-xs text-[#7e8c91]">
            <span className="grid size-8 place-items-center rounded-full border border-[#cfd6d8] bg-white/60 text-[#607985]"><MapPin size={14} /></span>
            <span>Purpose-built for The Springs venues</span>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_80px_rgba(50,68,76,0.14)] backdrop-blur-sm sm:p-8">
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#9a8358]">Begin a floor plan</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.02em] text-[#2e414b]">Choose your venue</h2>
            <p className="mt-2 text-sm leading-6 text-[#78878d]">We’ll prepare the correct hall workspace for you.</p>
          </div>

          <div className="space-y-5">
            <SelectField icon={<MapPin size={16} />} label="Location" htmlFor="location-select">
              <select
                ref={locationSelectRef}
                id="location-select"
                autoComplete="off"
                value={locationSlug}
                onChange={(event) => selectLocation(event.target.value)}
              >
                <option value="">Select a location</option>
                {SORTED_SPRINGS_LOCATIONS.map((location) => (
                  <option key={location.id} value={location.slug}>{location.name}</option>
                ))}
              </select>
            </SelectField>

            <SelectField icon={<Building2 size={16} />} label="Hall" htmlFor="hall-select">
              <select
                key={locationSlug || "no-location"}
                id="hall-select"
                value={hallSlug}
                disabled={!selectedLocation}
                onChange={(event) => setHallSlug(event.target.value)}
              >
                <option value="">{selectedLocation ? "Select a hall" : "Select a location first"}</option>
                {selectedLocation?.halls.map((hall) => (
                  <option key={hall.id} value={hall.slug}>{hall.name}</option>
                ))}
              </select>
            </SelectField>
          </div>

          <button
            type="button"
            disabled={!canOpen}
            onClick={openFloorPlan}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#334b59] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(51,75,89,0.22)] transition hover:bg-[#293f4b] disabled:cursor-not-allowed disabled:bg-[#d9dddc] disabled:text-[#929b9b] disabled:shadow-none"
          >
            Open Floor Plan <ArrowRight size={16} />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#edf0ef] pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9aa3a5]">
            <span className="size-1.5 rounded-full bg-[#b59a62]" />
            {SPRINGS_LOCATIONS.length} Springs locations available
          </div>
        </div>
      </section>
    </main>
  );
}

function SelectField({ icon, label, htmlFor, children }: { icon: React.ReactNode; label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-xs font-bold text-[#495e68]">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#78909b]">{icon}</span>
        <div className="[&_select]:h-12 [&_select]:w-full [&_select]:appearance-none [&_select]:rounded-xl [&_select]:border [&_select]:border-[#d9e0e1] [&_select]:bg-[#fbfcfb] [&_select]:pl-11 [&_select]:pr-10 [&_select]:text-sm [&_select]:font-semibold [&_select]:text-[#354b55] [&_select]:shadow-sm [&_select]:transition [&_select]:hover:border-[#bfcacc] [&_select]:focus:border-[#718b97] [&_select]:focus:outline-none [&_select]:focus:ring-2 [&_select]:focus:ring-[#9cafb7]/20 [&_select]:disabled:cursor-not-allowed [&_select]:disabled:bg-[#f0f2f0] [&_select]:disabled:text-[#a5adad]">
          {children}
        </div>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#809096]" size={15} />
      </div>
    </div>
  );
}
