import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin } from "lucide-react";
import { getHallBySlug, getLocationBySlug } from "@/domain/location-catalog";

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

  return (
    <main className="placeholder-page min-h-screen bg-[#f4f1ea] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-[#5d727b] transition hover:bg-white/70 hover:text-[#334b59]">
            <ArrowLeft size={15} /> Back to venue selection
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-[#334b59] font-serif text-sm font-semibold text-white">S</span>
            <span className="hidden font-serif text-sm font-semibold text-[#334b59] sm:block">The Springs</span>
          </div>
        </header>

        {location && hall ? (
          <section className="pt-12 lg:pt-16">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8358]">Floor plan workspace</p>
                <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.03em] text-[#263943] sm:text-5xl">{hall.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#708087]">
                  <span className="flex items-center gap-2"><MapPin size={14} /> {location.name}</span>
                  <span className="flex items-center gap-2"><Building2 size={14} /> {hall.name}</span>
                </div>
              </div>
              <span className="w-fit rounded-full border border-[#d4dcdd] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a898e]">Workspace preview</span>
            </div>

            <div className="floorplan-placeholder mt-9 flex min-h-[480px] items-center justify-center rounded-[24px] border border-[#dfe4e3] bg-white p-6 shadow-[0_24px_70px_rgba(50,68,76,0.1)] sm:min-h-[560px]">
              <div className="max-w-md text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full border border-[#d4dcdd] bg-[#f6f8f7] text-[#718994]"><Building2 size={22} strokeWidth={1.6} /></span>
                <h2 className="mt-5 font-serif text-2xl font-semibold text-[#304650]">Floor plan editor coming next</h2>
                <p className="mt-2 text-sm leading-6 text-[#7b898e]">
                  This is the future workspace for {hall.name}. The drawing canvas and venue configuration will be added in the next milestone.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center text-center">
            <div className="rounded-[24px] border border-white bg-white/90 p-9 shadow-[0_24px_70px_rgba(50,68,76,0.1)]">
              <h1 className="font-serif text-3xl font-semibold text-[#263943]">Choose a valid venue</h1>
              <p className="mt-3 text-sm leading-6 text-[#74848a]">Select a Springs location and hall before opening the floor plan workspace.</p>
              <Link href="/" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#334b59] px-5 text-sm font-bold text-white hover:bg-[#293f4b]">
                Select a venue <ArrowLeft className="rotate-180" size={15} />
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}
