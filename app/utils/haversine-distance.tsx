import { ParkingLot, Coordinate } from "./types";

function calculateHaversineDistance(
  point1: Coordinate,
  point2: Coordinate
): number {
  const toRadians = (degree: number) => degree * (Math.PI / 180);

  const R = 6371;
  const lat1 = toRadians(point1.x);
  const lon1 = toRadians(point1.y);
  const lat2 = toRadians(point2.x);
  const lon2 = toRadians(point2.y);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function findNearestPoint(
  target: Coordinate,
  points: Coordinate[]
): Coordinate | null {
  if (points.length === 0) {
    return null;
  }

  let nearestPoint = points[0];
  let minDistance = calculateHaversineDistance(target, nearestPoint);

  for (const point of points) {
    const distance = calculateHaversineDistance(target, point);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }

  return nearestPoint;
}

export function locateNearestParkingLot(
  target: Coordinate,
  parkingLots: ParkingLot[]
): ParkingLot | null {
  const availableParkingLots = parkingLots.filter(
    (lot) => lot.availableSpaces > 0
  );

  const nearestPoint = findNearestPoint(
    target,
    availableParkingLots.map((lot) => lot.location)
  );

  if (!nearestPoint) {
    return null;
  }

  const nearestParkingLot = parkingLots.find(
    (lot) =>
      lot.location.x === nearestPoint.x && lot.location.y === nearestPoint.y
  );

  return nearestParkingLot ? nearestParkingLot : null;
}
