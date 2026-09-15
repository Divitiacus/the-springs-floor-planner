import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getHallBySlug, getLocationBySlug, resolveInventoryConfiguration } from "@/domain/location-catalog";
import { createHallVenueTemplate } from "@/domain/hall-venue";
import { FloorPlanner } from "@/components/editor/FloorPlanner";

export const metadata: Metadata = {
  title: "Floor Plan Workspace | The Springs",
};

type SearchParams = Promise<{
  location?: string | string[];
  hall?: string | string[];
}>;

export default async function FloorplanPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const locationSlug = singleValue(query.location);
  const hallSlug = singleValue(query.hall);
  const location = getLocationBySlug(locationSlug);
  const hall = getHallBySlug(location, hallSlug);

  if (location && hall?.configuration) {
    return (
      <FloorPlanner
        venue={createHallVenueTemplate(location, hall)}
        locationName={location.name}
        inventory={resolveInventoryConfiguration(location, hall)}
      />
    );
  }

  if (location && hall) {
    return (
      <main className="placeholder-page min-h-screen bg-[#f4f1ea] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
        <div className="mx-auto max-w-[1320px]">
          <header>
            <Link href="/" className="flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-[#5d727b] transition hover:bg-white/70 hover:text-[#334b59]">
              <ArrowLeft size={15} /> Back to venue selection
            </Link>
          </header>
          <section className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center text-center">
            <div className="rounded-[24px] border border-white bg-white/90 p-9 shadow-[0_24px_70px_rgba(50,68,76,0.1)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#9a8358]">Floor plan coming next</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-[#263943]">{location.name} · {hall.name}</h1>
              <p className="mt-3 text-sm leading-6 text-[#74848a]">This hall is ready in the venue selector. Its measured floor plan geometry has not been configured yet.</p>
              <Link href="/" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#334b59] px-5 text-sm font-bold text-white hover:bg-[#293f4b]">
                Choose another hall <ArrowLeft className="rotate-180" size={15} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="placeholder-page min-h-screen bg-[#f4f1ea] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-[1320px]">
        <header>
          <Link href="/" className="flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-[#5d727b] transition hover:bg-white/70 hover:text-[#334b59]">
            <ArrowLeft size={15} /> Back to venue selection
          </Link>
        </header>
        <section className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center text-center">
          <div className="rounded-[24px] border border-white bg-white/90 p-9 shadow-[0_24px_70px_rgba(50,68,76,0.1)]">
            <h1 className="font-serif text-3xl font-semibold text-[#263943]">Choose a valid venue</h1>
            <p className="mt-3 text-sm leading-6 text-[#74848a]">Select a Springs location and hall before opening the floor plan workspace.</p>
            <Link href="/" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#334b59] px-5 text-sm font-bold text-white hover:bg-[#293f4b]">
              Select a venue <ArrowLeft className="rotate-180" size={15} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
