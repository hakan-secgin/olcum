import { Point3D } from '../types';

export const toRad = (deg: number): number => (deg * Math.PI) / 180;
export const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Calculates the ground distance from the user's feet to the target point.
 * Assumes the user is standing and the phone is 'deviceHeight' cm from the ground.
 * Uses the device tilt (beta).
 * 
 * Formula: distance = height * tan(tilt_angle)
 * Note: Beta is usually 90 degrees when upright. As we tilt down, beta decreases.
 * We want the angle from the vertical axis if we assume phone is perpendicular to floor at 0 distance.
 * However, simpler mental model:
 * If Beta = 0 (flat), distance is 0 (looking at feet).
 * If Beta = 45, distance = height.
 * If Beta = 85 (horizon), distance is far.
 */
export const calculateDistanceToPoint = (deviceHeightCm: number, beta: number): number => {
  // Clamp beta to avoid infinity or negative distances
  // Practical range for measuring floor: 10 degrees to 85 degrees
  const clampedBeta = Math.max(5, Math.min(beta, 88));
  
  const angleInRad = toRad(clampedBeta);
  return deviceHeightCm * Math.tan(angleInRad);
};

/**
 * Calculates the distance between two points on the 2D floor plane using polar coordinates.
 * We have distance to P1 (r1), distance to P2 (r2), and the angle between them (deltaAlpha).
 * 
 * Law of Cosines: c^2 = a^2 + b^2 - 2ab * cos(C)
 */
export const calculateDistanceBetweenPoints = (p1: Point3D, p2: Point3D): number => {
  const r1 = p1.distance;
  const r2 = p2.distance;
  
  // Calculate shortest angle difference
  let angleDiff = Math.abs(p1.azimuth - p2.azimuth);
  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff;
  }
  
  const angleDiffRad = toRad(angleDiff);
  
  // c = sqrt(r1^2 + r2^2 - 2*r1*r2*cos(theta))
  const distanceSquared = (r1 * r1) + (r2 * r2) - (2 * r1 * r2 * Math.cos(angleDiffRad));
  
  return Math.sqrt(distanceSquared);
};

export const formatDistance = (cm: number): string => {
  if (cm >= 100) {
    return `${(cm / 100).toFixed(2)} m`;
  }
  return `${Math.round(cm)} cm`;
};