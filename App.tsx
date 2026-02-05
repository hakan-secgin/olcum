import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { Controls } from './components/Controls';
import { useSensors } from './hooks/useSensors';
import { AppStep, Point3D } from './types';
import { calculateDistanceToPoint, calculateDistanceBetweenPoints } from './utils/math';

const DEFAULT_HEIGHT_CM = 150; // Approx holding height

const App: React.FC = () => {
  const { data: sensorData, hasPermission, requestPermission } = useSensors();
  const [step, setStep] = useState<AppStep>(AppStep.PERMISSION);
  const [deviceHeight, setDeviceHeight] = useState<number>(DEFAULT_HEIGHT_CM);
  
  // Measurement State
  const [p1, setP1] = useState<Point3D | null>(null);
  const [p2, setP2] = useState<Point3D | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleNextStep = () => {
    // If not permitted yet, Request Permission handles the first interaction
    if (!hasPermission) {
      requestPermission().then(() => {
        setStep(AppStep.CALIBRATION);
      });
      return;
    }

    if (step === AppStep.CALIBRATION) {
      setStep(AppStep.AIM_POINT_1);
      return;
    }

    const currentDist = calculateDistanceToPoint(deviceHeight, sensorData.beta);
    
    const currentPoint: Point3D = {
      distance: currentDist,
      azimuth: sensorData.alpha,
      elevation: sensorData.beta,
      timestamp: Date.now()
    };

    if (step === AppStep.AIM_POINT_1) {
      setP1(currentPoint);
      setStep(AppStep.AIM_POINT_2);
    } else if (step === AppStep.AIM_POINT_2 && p1) {
      setP2(currentPoint);
      const dist = calculateDistanceBetweenPoints(p1, currentPoint);
      setResult(dist);
      setStep(AppStep.RESULT);
    }
  };

  const handleReset = () => {
    setP1(null);
    setP2(null);
    setResult(null);
    setStep(AppStep.AIM_POINT_1);
  };

  const handleRequestPermission = () => {
    requestPermission().then(() => {
       // After permission, go to calibration
       setStep(AppStep.CALIBRATION);
    });
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Background Camera Layer */}
      {hasPermission && <CameraView />}

      {/* UI Overlay Layer */}
      <Controls 
        step={hasPermission && step === AppStep.PERMISSION ? AppStep.CALIBRATION : step}
        deviceHeight={deviceHeight}
        setDeviceHeight={setDeviceHeight}
        sensorData={sensorData}
        onNextStep={handleNextStep}
        onReset={handleReset}
        p1={p1}
        p2={p2}
        result={result}
        onRequestPermission={handleRequestPermission}
      />
    </div>
  );
};

export default App;