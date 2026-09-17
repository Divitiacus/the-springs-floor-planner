import type { VenueFloorRegion } from "@/domain/floorplan";

export function isPositionOnFloor(
  position: { x: number; y: number },
  usableAreas: readonly VenueFloorRegion[],
  voidAreas: readonly VenueFloorRegion[],
) {
  return usableAreas.some((region) => containsPoint(region, position)) && !voidAreas.some((region) => containsPoint(region, position));
}

export function isRectangleFootprintOnFloor(
  center: { x: number; y: number },
  width: number,
  height: number,
  rotation: number,
  usableAreas: readonly VenueFloorRegion[],
  voidAreas: readonly VenueFloorRegion[],
) {
  const columns = Math.max(2, Math.ceil(width / 24));
  const rows = Math.max(2, Math.ceil(height / 18));
  for (let column = 0; column <= columns; column += 1) {
    for (let row = 0; row <= rows; row += 1) {
      const localX = -width / 2 + (width * column) / columns;
      const localY = -height / 2 + (height * row) / rows;
      const point = rotateAroundCenter(localX, localY, rotation, center);
      if (!isPositionOnFloor(point, usableAreas, voidAreas)) return false;
    }
  }
  return true;
}

function rotateAroundCenter(x: number, y: number, degrees: number, center: { x: number; y: number }) {
  const radians = degrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: center.x + x * cosine - y * sine,
    y: center.y + x * sine + y * cosine,
  };
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
