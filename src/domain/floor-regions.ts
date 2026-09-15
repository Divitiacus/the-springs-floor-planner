import type { VenueFloorRegion } from "@/domain/floorplan";

export function isPositionOnFloor(
  position: { x: number; y: number },
  usableAreas: readonly VenueFloorRegion[],
  voidAreas: readonly VenueFloorRegion[],
) {
  return usableAreas.some((region) => containsPoint(region, position)) && !voidAreas.some((region) => containsPoint(region, position));
}

function containsPoint(region: VenueFloorRegion, point: { x: number; y: number }) {
  if (region.shape.type === "rectangle") {
    return point.x >= region.shape.x && point.x <= region.shape.x + region.shape.width && point.y >= region.shape.y && point.y <= region.shape.y + region.shape.height;
  }

  const { points } = region.shape;
  let inside = false;
  for (let index = 0, previous = points.length - 2; index < points.length; previous = index, index += 2) {
    const x = points[index];
    const y = points[index + 1];
    const previousX = points[previous];
    const previousY = points[previous + 1];
    if ((y > point.y) !== (previousY > point.y) && point.x < ((previousX - x) * (point.y - y)) / (previousY - y) + x) inside = !inside;
  }
  return inside;
}
