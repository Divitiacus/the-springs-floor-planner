# The Springs Floor Planner

A standalone Next.js application for Springs-specific wedding and event floorplans. The current milestone exposes a welcoming Location → Hall → Floor Plan entry flow; the destination route is intentionally a placeholder for the future editor.

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

- `src/domain/location-catalog.ts`: stable location and hall identifiers plus extensible hall configuration metadata.
- `src/components/start/FloorPlanStart.tsx`: dependent Location and Hall selectors and route navigation.
- `src/app/page.tsx`: the Floor Plan Designer start page.
- `src/app/floorplan/page.tsx`: the selected-venue workspace placeholder.
- `src/components/editor` and related domain modules: the earlier proof-of-concept editor remains preserved but is not mounted by the current route workflow.

The catalog currently contains Magnolia with Pinehaven Terrace and The Hidden Magnolia. Routes use stable slugs, for example `/floorplan?location=magnolia&hall=pinehaven-terrace`.
