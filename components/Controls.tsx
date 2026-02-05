import React, { useState } from 'react';
import { AppStep, SensorData, Point3D } from '../types';
import { formatDistance, calculateDistanceToPoint } from '../utils/math';
import { RefreshCcw, Check, Settings, Camera } from 'lucide-react';

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
  const [showHeightSlider, setShowHeightSlider] = useState(false);
  
  // Real-time estimated distance
  const currentEstDistance = calculateDistanceToPoint(deviceHeight, sensorData.beta);

  if (step === AppStep.PERMISSION) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
        <div className="text-center max-w-sm">
          <div className="bg-blue-600/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
             <Camera className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">AR Ölçüm Pro</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Mesafe ölçümü yapabilmek için uygulamanın kameraya ve cihaz sensörlerine (jiroskop) erişmesi gerekiyor.
          </p>
          <button
            onClick={onRequestPermission}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-900/50"
          >
            Başla ve İzin Ver
          </button>
        </div>
      </div>
    );
  }

  // Calibration is now integrated via the slider button, but we keep this just in case logic routes here initially
  if (step === AppStep.CALIBRATION) {
     // Auto-skip calibration screen to main view, handled in App.tsx typically, 
     // but if we land here, show a simple start.
     return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80">
            <button onClick={onNextStep} className="bg-white text-black px-8 py-3 rounded-xl font-bold">
                Ölçüme Başla
            </button>
        </div>
     );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
      {/* Top Bar: Controls */}
      <div className="pt-safe-top p-4 bg-gradient-to-b from-black/90 to-transparent pointer-events-auto">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setShowHeightSlider(!showHeightSlider)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-colors ${showHeightSlider ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800/60 border-gray-600 text-gray-300'}`}
          >
            <Settings size={16} />
            <span className="text-sm font-bold">Kamera Yüksekliği: {deviceHeight} cm</span>
          </button>

          <button onClick={onReset} className="p-3 bg-gray-800/60 rounded-full backdrop-blur-md text-white/80 hover:bg-gray-700 border border-gray-600">
            <RefreshCcw size={18} />
          </button>
        </div>

        {/* Height Slider Dropdown */}
        {showHeightSlider && (
           <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 p-4 rounded-2xl mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-bold">
                <span>Bel (100cm)</span>
                <span>Göz (160cm)</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="220" 
                value={deviceHeight} 
                onChange={(e) => setDeviceHeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-blue-300 mt-2 text-center">
                Telefonu yerden ne kadar yukarıda tuttuğunuzu ayarlayın.
              </p>
           </div>
        )}
        
        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
             <span className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${step === AppStep.AIM_POINT_1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800/50 text-gray-500'}`}>
              Nokta A
             </span>
             <span className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${step === AppStep.AIM_POINT_2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800/50 text-gray-500'}`}>
              Nokta B
             </span>
        </div>
        
        <p className="mt-4 text-center text-lg font-medium text-white drop-shadow-md bg-black/30 backdrop-blur-sm rounded-lg py-1">
          {step === AppStep.AIM_POINT_1 && "Başlangıç noktasını hedefleyin"}
          {step === AppStep.AIM_POINT_2 && "Bitiş noktasını hedefleyin"}
          {step === AppStep.RESULT && "Ölçüm Tamamlandı"}
        </p>
      </div>

      {/* Center: Crosshair & Real-time Debug */}
      <div className="flex-1 flex items-center justify-center relative">
        {step !== AppStep.RESULT && (
          <>
            {/* Dynamic Crosshair */}
            <div className="relative flex items-center justify-center opacity-90 transition-transform duration-100" style={{ transform: `rotate(${-sensorData.gamma}deg)` }}>
               <div className="absolute w-[2px] h-8 bg-white/90 shadow-sm"></div>
               <div className="absolute h-[2px] w-8 bg-white/90 shadow-sm"></div>
               {/* Stability Indicator Ring */}
               <div className="absolute w-12 h-12 border-2 border-white/40 rounded-full"></div>
               <div className="absolute inset-0 border border-white/20 rounded-full animate-pulse-ring"></div>
            </div>
            
            {/* Live Distance Label near crosshair */}
            <div className="absolute mt-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-mono text-cyan-400 border border-cyan-500/30 shadow-xl">
              {formatDistance(currentEstDistance)}
            </div>
            
            {/* Tilt Warning */}
            {sensorData.beta > 85 && (
               <div className="absolute -mt-24 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold animate-bounce shadow-lg">
                 Yere doğru tutun!
               </div>
            )}
          </>
        )}
      </div>

      {/* Bottom: Action Buttons & Results */}
      <div className="pb-safe-bottom p-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-auto">
        {step === AppStep.RESULT ? (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 text-center animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Ölçülen Mesafe</p>
            <div className="text-6xl font-bold text-white mb-6 tracking-tight tabular-nums">
              {result !== null ? formatDistance(result) : '--'}
            </div>
            <button 
              onClick={onReset} 
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw size={20} /> Yeni Ölçüm
            </button>
          </div>
        ) : (
          <button
            onClick={onNextStep}
            disabled={sensorData.beta > 88} // Disable if looking at horizon
            className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold text-xl py-6 rounded-3xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 flex items-center justify-center gap-3 border-t border-blue-400/20"
          >
            {step === AppStep.AIM_POINT_1 ? (
              <>Nokta A'yı İşaretle <Check size={24} /></>
            ) : (
              <>Nokta B'yi İşaretle <Check size={24} /></>
            )}
          </button>
        )}
        
        {/* Debug Info */}
        {step !== AppStep.RESULT && (
           <div className="mt-4 flex justify-between text-[10px] text-gray-600 font-mono opacity-60">
             <span>Eğim: {Math.round(sensorData.beta)}°</span>
             <span>Yön: {Math.round(sensorData.alpha)}°</span>
           </div>
        )}
      </div>
    </div>
  );
};