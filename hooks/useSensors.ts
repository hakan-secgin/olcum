import { useState, useEffect, useCallback } from 'react';
import { SensorData } from '../types';

interface UseSensorsReturn {
  data: SensorData;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  error: string | null;
}

export const useSensors = (): UseSensorsReturn => {
  const [data, setData] = useState<SensorData>({ alpha: 0, beta: 0, gamma: 0 });
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Android/Web Standard vs iOS WebKit differences
    // On iOS, alpha is relative unless calibration happens, but usually consistent enough for relative difference.
    // 'webkitCompassHeading' is available on iOS for true north, but standard alpha is fine for relative angle.
    
    let alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    // iOS specific property for compass heading if available (True North)
    // @ts-ignore - webkitCompassHeading is non-standard
    if (event.webkitCompassHeading) {
      // @ts-ignore
      alpha = event.webkitCompassHeading;
    }

    setData({ alpha, beta, gamma });
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('Permission denied');
        }
      } catch (e: any) {
        setError(e.message || 'Error requesting permission');
      }
    } else {
      // Non-iOS 13+ devices usually don't need permission or prompt automatically
      setHasPermission(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  return { data, hasPermission, requestPermission, error };
};