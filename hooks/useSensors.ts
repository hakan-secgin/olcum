import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData } from '../types';

interface UseSensorsReturn {
  data: SensorData;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  error: string | null;
}

// Smoothing factor (0.1 = very smooth/slow, 0.9 = very responsive/jittery)
const LERP_FACTOR = 0.15;

const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

// Handle circular interpolation for degrees (0-360)
const lerpAngle = (start: number, end: number, factor: number) => {
  const diff = end - start;
  let correctedDiff = diff;
  if (diff > 180) correctedDiff -= 360;
  if (diff < -180) correctedDiff += 360;
  return start + correctedDiff * factor;
};

export const useSensors = (): UseSensorsReturn => {
  // We keep the raw target values in a ref to decouple the render loop from the event loop if needed,
  // but for React simplicity we'll just smooth on state update.
  const [data, setData] = useState<SensorData>({ alpha: 0, beta: 0, gamma: 0 });
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store previous values for smoothing
  const prevData = useRef<SensorData>({ alpha: 0, beta: 90, gamma: 0 });

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    // iOS Webkit Compass Heading support
    // @ts-ignore
    if (event.webkitCompassHeading) {
      // @ts-ignore
      alpha = event.webkitCompassHeading;
    }

    // Apply Low Pass Filter (Smoothing)
    const smoothBeta = lerp(prevData.current.beta, beta, LERP_FACTOR);
    const smoothGamma = lerp(prevData.current.gamma, gamma, LERP_FACTOR);
    const smoothAlpha = lerpAngle(prevData.current.alpha, alpha, LERP_FACTOR);

    // Update refs
    prevData.current = {
      alpha: smoothAlpha,
      beta: smoothBeta,
      gamma: smoothGamma
    };

    // Update state
    setData({
      alpha: smoothAlpha,
      beta: smoothBeta,
      gamma: smoothGamma
    });
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('İzin reddedildi');
        }
      } catch (e: any) {
        setError(e.message || 'İzin istenirken hata oluştu');
      }
    } else {
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