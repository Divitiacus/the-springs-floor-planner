# The Springs Floor Planner

A standalone Next.js application for Springs-specific wedding and event floorplans. The current milestone connects the Location → Hall entry flow to the preserved proof-of-concept editor with an inch-based hall coordinate system and configuration-driven inventory rules.

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

- `src/domain/location-catalog.ts`: stable location and hall identifiers plus physical hall, architecture, asset, and inventory configuration.
- `src/domain/inventory.ts`: table/seat usage calculations and centralized inventory validation.
- `src/domain/object-catalog.ts`: editor object definitions, confirmed physical measurements, and table seating limits.
- `src/domain/hall-venue.ts`: converts a selected hall configuration into the editor's inch-based venue template.
- `src/components/start/FloorPlanStart.tsx`: dependent Location and Hall selectors and route navigation.
- `src/app/page.tsx`: the Floor Plan Designer start page.
- `src/app/floorplan/page.tsx`: resolves stable route slugs and opens the selected venue workspace.
- `src/components/editor` and related domain modules: the preserved proof-of-concept editor, now supplied by hall configuration.

The catalog currently contains Magnolia with Pinehaven Terrace and The Hidden Magnolia. Their 80×60-foot planning envelope is explicitly provisional, and all inventory quantities remain unconfigured until confirmed. Routes use stable slugs, for example `/floorplan?location=magnolia&hall=pinehaven-terrace`.
