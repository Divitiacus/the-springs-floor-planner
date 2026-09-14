export const INCHES_PER_FOOT = 12;

export function feetToInches(feet: number): number {
  return feet * INCHES_PER_FOOT;
}

export function inchesToFeet(inches: number): number {
  return inches / INCHES_PER_FOOT;
}
