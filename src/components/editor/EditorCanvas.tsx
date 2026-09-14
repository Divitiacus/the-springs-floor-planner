"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const FloorplanCanvas = dynamic(
  () => import("@/components/editor/canvas/FloorplanCanvas").then((module) => module.FloorplanCanvas),
  { ssr: false, loading: () => <div className="grid h-full place-items-center text-xs text-[#748078]">Preparing canvas…</div> },
);

export function EditorCanvas(props: ComponentProps<typeof FloorplanCanvas>) {
  return (
    <div className="canvas-grid relative min-h-0 flex-1 overflow-hidden">
      <FloorplanCanvas key={props.resetViewKey} {...props} />
    </div>
  );
}
