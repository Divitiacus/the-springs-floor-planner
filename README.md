# The Springs Floor Planner

A standalone proof of concept for building Springs-specific wedding and event floorplans. The prototype keeps permanent venue geometry separate from draggable event objects and saves the structured layout locally in the browser.

## Start locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Architecture

- `src/domain`: floorplan types, object catalog, sample venue template, immutable layout operations, history, and persistence.
- `src/hooks/useFloorplanEditor.ts`: client editor orchestration and local save/load.
- `src/components/editor`: application shell, object library, toolbar, properties inspector, and dynamically loaded canvas boundary.
- `src/components/editor/canvas`: locked venue rendering and editable Konva object layer.
- `src/app`: App Router entry point and visual system.

The stored JSON has a schema version and a `layout` containing a venue template ID plus independently editable event objects. Browser storage uses the key `springs-floor-planner:v1`. The venue itself is not duplicated into every layout, so a later venue-template catalog can replace the sample cleanly.
