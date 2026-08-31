import React, { useState, useRef } from 'react';
import { Sliders, ZoomIn, ZoomOut, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';

interface MriVisualizerProps {
  originalUrl: string;
  heatmapUrl: string;
  overlayUrl: string;
  localizationUrl: string;
  tumorType: string;
  viewMode: 'original' | 'heatmap' | 'overlay' | 'segmentation';
  predictionId: number;
}

export const MriVisualizer: React.FC<MriVisualizerProps> = ({
  originalUrl,
  heatmapUrl,
  overlayUrl,
  localizationUrl,
  tumorType,
  viewMode,
  predictionId
}) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(true);

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleZoom = (factor: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + factor)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.current.x);
    setPanY(e.clientY - dragStart.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Select active image source from backend depending on viewMode
  const getActiveImgSrc = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000';
    if (viewMode === 'original') return `${baseUrl}${originalUrl}`;
    if (viewMode === 'heatmap') return `${baseUrl}${heatmapUrl}`;
    if (viewMode === 'overlay') return `${baseUrl}${overlayUrl}`;
    if (viewMode === 'segmentation') return `${baseUrl}${localizationUrl}`;
    return `${baseUrl}${overlayUrl}`;
  };

  return (
    <div className="flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      {/* PACS Header Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-300 text-xs">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-blue-500" />
          <span className="font-semibold tracking-wide font-mono text-[11px]">PACS VIEWPORT #1</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
            {tumorType === 'No Tumor' ? 'NORMAL_SCAN' : `TUMOR_${tumorType.toUpperCase().replace(' ', '_')}`}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => handleZoom(0.1)} 
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => handleZoom(-0.1)} 
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleReset} 
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Reset Grid"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main image Viewport */}
      <div 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex items-center justify-center h-[450px] w-full bg-black cursor-grab select-none overflow-hidden ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        <img 
          src={getActiveImgSrc()} 
          alt="MRI Diagnostic" 
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(false)}
          className="max-w-full max-h-full object-contain pointer-events-none transition-all duration-75"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`
          }}
        />

        {/* Viewport Info Overlays */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 leading-normal pointer-events-none bg-black/60 p-2 rounded backdrop-blur-sm border border-emerald-950/20">
          <div>PATIENT ID: PT-{predictionId}</div>
          <div>SCAN_MODE: MRI_T2_FLAIR</div>
          <div>ZOOM: {(zoom * 100).toFixed(0)}%</div>
          <div>MODE: {viewMode.toUpperCase()}</div>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400 leading-normal text-right pointer-events-none bg-black/60 p-2 rounded backdrop-blur-sm border border-emerald-950/20">
          <div>WL: 500 / WW: 1200</div>
          <div>BRIGHTNESS: {brightness}%</div>
          <div>CONTRAST: {contrast}%</div>
          <div>XAI ATTR: GRAD-CAM v1.0</div>
        </div>

        {!imgLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
            <ImageIcon className="w-8 h-8 animate-pulse text-slate-600 mb-2" />
            <span className="text-xs">Failed to load MRI scan URL. Check backend connection.</span>
          </div>
        )}
      </div>

      {/* Radiology Controls Panel */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="w-14">Contrast</span>
          <input 
            type="range" 
            min="50" 
            max="200" 
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value))}
            className="flex-grow accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="w-8 text-right font-mono text-slate-300">{contrast}%</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="w-14">Brightness</span>
          <input 
            type="range" 
            min="50" 
            max="200" 
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="flex-grow accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="w-8 text-right font-mono text-slate-300">{brightness}%</span>
        </div>
      </div>
    </div>
  );
};
