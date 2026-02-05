import React from 'react';
import { AppStep, SensorData, Point3D } from '../types';
import { formatDistance, calculateDistanceToPoint } from '../utils/math';
import { RefreshCcw, Check, ArrowRight } from 'lucide-react';

interface ControlsProps {
  step: AppStep;
  deviceHeight: number;
  setDeviceHeight: (h: number) => void;
  sensorData: SensorData;
  onNextStep: () => void;
  onReset: () => void;
  p1: Point3D | null;
  p2: Point3D | null;
  result: number | null;
  onRequestPermission: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  step,
  deviceHeight,
  setDeviceHeight,
  sensorData,
  onNextStep,
  onReset,
  p1,
  result,
  onRequestPermission
}) => {
  
  // Real-time estimated distance to the center crosshair based on current tilt
  const currentEstDistance = calculateDistanceToPoint(deviceHeight, sensorData.beta);

  if (step === AppStep.PERMISSION) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-4">AR Measure</h1>
          <p className="text-gray-300 mb-8">
            This app needs access to your camera and device sensors (gyroscope) to measure distances.
          </p>
          <button
            onClick={onRequestPermission}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95"
          >
            Start & Grant Access
          </button>
        </div>
      </div>
    );
  }

  if (step === AppStep.CALIBRATION) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-3xl w-full max-w-xs shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">Calibration</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter the height of your phone from the floor (approx. your eye level minus 10cm, or chest height).
          </p>
          
          <div className="mb-6">
            <label className="block text-gray-500 text-xs uppercase font-bold mb-2">Phone Height (cm)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={deviceHeight}
                onChange={(e) => setDeviceHeight(Number(e.target.value))}
                className="w-full bg-gray-800 text-white text-2xl font-mono p-4 rounded-xl border border-gray-600 focus:border-blue-500 outline-none text-center"
              />
              <span className="text-gray-400 font-bold">cm</span>
            </div>
          </div>

          <button
            onClick={onNextStep}
            className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            Ready <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
      {/* Top Bar: Instructions */}
      <div className="pt-safe-top p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
        <div className="flex justify-between items-start">
          <div>
             <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${step === AppStep.AIM_POINT_1 ? 'bg-blue-600' : 'bg-gray-700 text-gray-400'}`}>
              Step 1: Point A
             </span>
             <span className="mx-1 text-gray-500">→</span>
             <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${step === AppStep.AIM_POINT_2 ? 'bg-blue-600' : 'bg-gray-700 text-gray-400'}`}>
              Step 2: Point B
             </span>
          </div>
          <button onClick={onReset} className="p-2 bg-gray-800/50 rounded-full backdrop-blur-md text-white/80 hover:bg-gray-700">
            <RefreshCcw size={18} />
          </button>
        </div>
        
        <p className="mt-2 text-lg font-medium text-white drop-shadow-md">
          {step === AppStep.AIM_POINT_1 && "Aim crosshair at the first point on the floor."}
          {step === AppStep.AIM_POINT_2 && "Rotate and aim at the second point."}
          {step === AppStep.RESULT && "Measurement Complete"}
        </p>
      </div>

      {/* Center: Crosshair & Real-time Debug */}
      <div className="flex-1 flex items-center justify-center relative">
        {step !== AppStep.RESULT && (
          <>
            {/* Crosshair */}
            <div className="relative w-16 h-16 flex items-center justify-center opacity-90">
               <div className="absolute w-1 h-6 bg-white/90 rounded-full shadow-sm"></div>
               <div className="absolute h-1 w-6 bg-white/90 rounded-full shadow-sm"></div>
               <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-pulse-ring"></div>
            </div>
            
            {/* Live Distance Label near crosshair */}
            <div className="absolute mt-24 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-mono text-cyan-400 border border-cyan-500/30">
              Floor Dist: {formatDistance(currentEstDistance)}
            </div>
            
            {/* Tilt Warning */}
            {sensorData.beta > 85 && (
               <div className="absolute -mt-24 bg-red-500/80 px-3 py-1 rounded text-xs font-bold animate-bounce">
                 Point at the floor!
               </div>
            )}
          </>
        )}
      </div>

      {/* Bottom: Action Buttons & Results */}
      <div className="pb-safe-bottom p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
        {step === AppStep.RESULT ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center animate-in slide-in-from-bottom-10 fade-in duration-300">
            <p className="text-gray-300 text-sm uppercase tracking-wider mb-2">Calculated Distance</p>
            <div className="text-5xl font-bold text-white mb-4 tracking-tight">
              {result !== null ? formatDistance(result) : '--'}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onReset} 
                className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                New Measurement
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onNextStep}
            disabled={sensorData.beta > 88} // Disable if looking at horizon
            className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white font-bold text-xl py-6 rounded-3xl shadow-lg shadow-blue-900/50 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            {step === AppStep.AIM_POINT_1 ? (
              <>Capture Point A <Check size={24} /></>
            ) : (
              <>Capture Point B <Check size={24} /></>
            )}
          </button>
        )}
        
        {/* Debug Info (Optional, small) */}
        {step !== AppStep.RESULT && (
           <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-mono">
             <span>Tilt: {Math.round(sensorData.beta)}°</span>
             <span>Azimuth: {Math.round(sensorData.alpha)}°</span>
           </div>
        )}
      </div>
    </div>
  );
};