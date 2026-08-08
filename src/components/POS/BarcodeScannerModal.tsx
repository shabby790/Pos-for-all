import React, { useState, useEffect, useRef } from 'react';
import { Camera, Barcode, CheckCircle, X, Search, AlertCircle, StopCircle, PlayCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { sounds } from '../../utils/sound';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [manualCode, setManualCode] = useState('');
  const [simulatedScanSuccess, setSimulatedScanSuccess] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen && isCameraActive) {
      setCameraError(null);
      const scannerId = "html5qr-code-full-region";
      
      const qrScanner = new Html5Qrcode(scannerId);
      html5QrcodeRef.current = qrScanner;

      qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          sounds.playBeep();
          setSimulatedScanSuccess(decodedText);
          setTimeout(() => {
            onScan(decodedText);
            stopCamera();
            setSimulatedScanSuccess(null);
            onClose();
          }, 300);
        },
        (errorMessage) => {
          // ignore transient scan errors frame by frame
        }
      ).catch((err) => {
        console.error("Camera scanner start error:", err);
        setCameraError("Could not access mobile camera. Please check camera permissions or use hardware scanner / manual entry.");
        setIsCameraActive(false);
      });

      return () => {
        if (qrScanner.isScanning) {
          qrScanner.stop().catch(console.error);
        }
      };
    }
  }, [isOpen, isCameraActive]);

  const stopCamera = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current.stop().then(() => {
        setIsCameraActive(false);
      }).catch(err => {
        console.error("Failed to stop camera scanner", err);
        setIsCameraActive(false);
      });
    } else {
      setIsCameraActive(false);
    }
  };

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      sounds.playBeep();
      onScan(manualCode.trim());
      setManualCode('');
      stopCamera();
      onClose();
    }
  };

  const sampleBarcodes = [
    { code: '896400010101', name: 'Milkpak 1L' },
    { code: '896400010102', name: 'Tapal Tea 450g' },
    { code: '896400010103', name: 'Pepsi 1.5L' },
    { code: '896400010104', name: 'Lays Masala' },
    { code: '896400010107', name: 'USB C Cable' }
  ];

  const handleSimulateScan = (code: string) => {
    sounds.playBeep();
    setSimulatedScanSuccess(code);
    setTimeout(() => {
      onScan(code);
      setSimulatedScanSuccess(null);
      stopCamera();
      onClose();
    }, 400);
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
            <Barcode className="w-5 h-5" /> Barcode & QR Code Reader
          </h3>
          <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder & Scanner Section */}
        <div className="relative min-h-[220px] bg-slate-950 border-2 border-dashed border-emerald-500/50 rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 mb-4">
          
          <div id="html5qr-code-full-region" className={`w-full h-full ${!isCameraActive ? 'hidden' : ''}`} />

          {!isCameraActive && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Camera className="w-12 h-12 text-slate-500" />
              <div>
                <p className="text-xs font-bold text-slate-200">Mobile Camera or Hardware USB Scanner</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Point camera at product barcode or scan directly using a barcode gun
                </p>
              </div>
              
              <button
                onClick={() => setIsCameraActive(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <PlayCircle className="w-4 h-4" /> Start Phone Camera Scanner
              </button>
            </div>
          )}

          {isCameraActive && (
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 bg-red-950/80 border border-red-500/50 text-red-300 px-2.5 py-1 rounded-lg text-[11px] font-bold z-10 flex items-center gap-1"
            >
              <StopCircle className="w-3.5 h-3.5" /> Stop Camera
            </button>
          )}

          {cameraError && (
            <div className="m-3 p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {simulatedScanSuccess && (
            <div className="absolute inset-0 bg-emerald-950/90 z-20 flex flex-col items-center justify-center gap-2 text-emerald-300 font-bold text-sm animate-fade-in">
              <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
              <span>Scanned Barcode: {simulatedScanSuccess}</span>
            </div>
          )}
        </div>

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Manual Barcode / SKU Entry (or Hardware Gun Scanner Input)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="Scan or type barcode (e.g. 896400010101)..."
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
            >
              Add Item
            </button>
          </div>
        </form>

        {/* Quick Test Barcode Buttons */}
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">Sample Inventory Barcodes (Click to test):</p>
          <div className="flex flex-wrap gap-1.5">
            {sampleBarcodes.map(b => (
              <button
                key={b.code}
                onClick={() => handleSimulateScan(b.code)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] px-2.5 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{b.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
