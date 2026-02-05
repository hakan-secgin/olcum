export interface Point3D {
  distance: number; // Distance from user to the point
  azimuth: number; // Alpha (compass direction) in degrees
  elevation: number; // Beta (tilt) in degrees
  timestamp: number;
}

export enum AppStep {
  CALIBRATION = 'CALIBRATION',
  PERMISSION = 'PERMISSION',
  AIM_POINT_1 = 'AIM_POINT_1',
  AIM_POINT_2 = 'AIM_POINT_2',
  RESULT = 'RESULT'
}

export interface SensorData {
  alpha: number; // Z-axis rotation (Compass 0-360)
  beta: number;  // X-axis rotation (Tilt -180 to 180)
  gamma: number; // Y-axis rotation (-90 to 90)
}