import { notFound } from "next/navigation";
import { SharedFloorplanViewer } from "@/components/editor/SharedFloorplanViewer";
import { deserializeFloorplan } from "@/domain/persistence";
import { getLocationHallByVenueTemplateId } from "@/domain/location-catalog";
import { createHallVenueTemplates } from "@/domain/hall-venue";

export const dynamic = "force-dynamic";

type PublicPlanResponse = {
  plan?: {
    planName: string;
    venueTemplateId: string;
    schemaVersion: number;
    payload: unknown;
    isFinal: boolean;
    updatedAt: string;
  };
};

function shareApiOrigin() {
  return (
    process.env.FLOORPLAN_SHARE_API_ORIGIN ??
    "https://the-springs-event-operations-hub.vercel.app"
  ).replace(/\/+$/u, "");
}

export default async function SharedFloorplanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/iu.test(token)) notFound();

  let response: Response;
  try {
    response = await fetch(
      `${shareApiOrigin()}/api/public/floorplans/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
  } catch {
    notFound();
  }
  if (!response.ok) notFound();

  const body = (await response.json()) as PublicPlanResponse;
  if (!body.plan) notFound();

  let layout;
  try {
    layout = deserializeFloorplan(JSON.stringify(body.plan.payload));
  } catch {
    notFound();
  }
  const resolved = getLocationHallByVenueTemplateId(layout.venueTemplateId);
  if (!resolved?.hall.configuration) notFound();

  return (
    <SharedFloorplanViewer
      layout={layout}
      levelVenues={createHallVenueTemplates(resolved.location, resolved.hall)}
      locationName={resolved.location.name}
    />
  );
}
