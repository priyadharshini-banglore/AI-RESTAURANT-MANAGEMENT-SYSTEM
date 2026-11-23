import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeWasteImage } from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';
import { VisualWasteAnalysis } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { GalleryIcon } from './icons/GalleryIcon';

interface CameraAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CameraAnalysisModal: React.FC<CameraAnalysisModalProps> = ({ isOpen, onClose }) => {
    const { addVisualWasteLog, addWasteReport } = useAppContext();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<VisualWasteAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cleanup = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const setupCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access was denied. Please enable it in your browser settings.");
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setupCamera();
        } else {
            cleanup();
            setCapturedImage(null);
            setAnalysisResult(null);
            setIsLoading(false);
            setNotes('');
        }
        return cleanup;
    }, [isOpen, setupCamera, cleanup]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(dataUrl);
                cleanup();
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                    setCapturedImage(dataUrl);
                    cleanup();
                }
            };
            reader.onerror = () => {
                setError('Failed to read the image file.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setupCamera();
    };

    const handleAnalyze = async () => {
        if (!capturedImage) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const userApiKey = localStorage.getItem('restro_api_key') || localStorage.getItem('restro_gemini_api_key') || '';
            const res = await fetch('/api/analyze-waste', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId: 1,
                    imageBase64: capturedImage,
                    orderedDishes: notes ? [notes] : ['Plate Leftovers', 'Dine-In Meal'],
                    userApiKey
                })
            });

            const data = await res.json();
            if (!data.success || !data.analysis) throw new Error(data.error || 'Analysis failed');

            const result: VisualWasteAnalysis = {
                identifiedItems: [
                    ...(data.analysis.vegetables_wasted || []).map((v: any) => `${v.name} (${v.grams}g)`),
                    ...(data.analysis.foods_wasted || []).map((f: any) => `${f.name} (${f.grams}g)`)
                ],
                wasteEstimateKg: data.analysis.total_kg || 0.35,
                suggestion: (data.analysis.suggestions && data.analysis.suggestions[0]) || data.analysis.summary || 'Adjust portion sizes'
            };

            setAnalysisResult(result);
            addVisualWasteLog({
                imageBase64: capturedImage.replace(/^data:image\/\w+;base64,/, ''),
                notes: notes,
                analysis: result
            });

            if (data.report) {
                addWasteReport(data.report);
                try {
                    const ch = new BroadcastChannel('restro_orders_sync');
                    ch.postMessage({
                        type: 'WASTE_REPORT_ADDED',
                        report: data.report,
                        timestamp: Date.now()
                    });
                    ch.close();
                } catch (e) {}
            }
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError(err?.message || "Failed to analyze the image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center items-center p-3 sm:p-6 font-sans select-none animate-fade-in">
            <div className="bg-[#fffdf7] rounded-[32px] sm:rounded-[36px] border-3 border-[#3a1a0e] shadow-[6px_6px_0_#3a1a0e] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-card-bloom">
                {/* Header */}
                <div className="p-5 border-b-2 border-[#3a1a0e] bg-[#1c1613] text-[#fff4dc] flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#d6361f] border-2 border-[#3a1a0e] flex items-center justify-center text-xl shadow-xs">
                            📷
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#d6361f] text-white">
                                AI Vision
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                                Visual Waste Analyzer
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#fff4dc] border border-white/20 flex items-center justify-center font-black text-sm cursor-pointer active:scale-95 transition-transform"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-4">
                    {error && (
                        <div className="p-3.5 text-center text-xs font-bold text-rose-800 bg-rose-50 border-2 border-rose-300 rounded-2xl">
                            ⚠️ {error}
                        </div>
                    )}

                    {!capturedImage && !error && (
                        <div className="space-y-4">
                            <div className="bg-[#1c1613] rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-[#3a1a0e] shadow-inner">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button 
                                    onClick={handleCapture} 
                                    className="w-full bg-[#d6361f] hover:bg-[#ea3b21] text-[#fff4dc] font-medium text-xs uppercase tracking-wider py-3 px-4 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <CameraIcon className="h-4 w-4"/>
                                    <span>Capture Camera Shot</span>
                                </button>
                                <button 
                                    onClick={handleUploadClick} 
                                    className="w-full bg-[#fff4dc] hover:bg-[#ffeac2] text-[#3a1a0e] font-medium text-xs uppercase tracking-wider py-3 px-4 rounded-xl border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <GalleryIcon className="h-4 w-4"/>
                                    <span>Upload from Device</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {capturedImage && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <img src={capturedImage} alt="Captured waste" className="rounded-2xl w-full border-2 border-[#3a1a0e] shadow-xs object-cover max-h-56" />
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes (e.g. Table #4 half naan left)..."
                                    rows={2}
                                    className="w-full p-2.5 text-xs text-[#3a1a0e] border-2 border-[#3a1a0e] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#d6361f]/20 shadow-xs"
                                    disabled={isLoading || !!analysisResult}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handleRetake} 
                                        disabled={isLoading} 
                                        className="py-2.5 px-3 rounded-xl bg-[#fff4dc] hover:bg-[#ffeac2] text-[#3a1a0e] font-medium text-xs uppercase border-2 border-[#3a1a0e] shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                                    >
                                        Retake
                                    </button>
                                    <button 
                                        onClick={handleAnalyze} 
                                        disabled={isLoading || !!analysisResult} 
                                        className="py-2.5 px-3 rounded-xl bg-[#d6361f] hover:bg-[#ea3b21] text-white font-medium text-xs uppercase border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] cursor-pointer active:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        {isLoading ? (
                                             <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        ) : 'Analyze Waste ⚡'}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[#fff4dc] border-2 border-[#3a1a0e] p-4 rounded-2xl shadow-xs space-y-3">
                                <h3 className="font-bold text-base uppercase text-[#3a1a0e]">AI Vision Results</h3>
                                {isLoading && (
                                    <div className="text-center py-8 text-xs font-semibold text-[#3a1a0e] uppercase animate-pulse">
                                        Analyzing scrap image with Gemini...
                                    </div>
                                )}
                                {analysisResult && (
                                    <div className="space-y-3 text-xs animate-fade-in font-medium">
                                        <div>
                                            <p className="font-semibold uppercase text-slate-500 text-[10px]">Identified Items:</p>
                                            <p className="text-sm font-bold text-[#3a1a0e]">{analysisResult.identifiedItems.join(', ') || 'None'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold uppercase text-slate-500 text-[10px]">Estimated Waste:</p>
                                            <p className="font-mono text-base font-black text-[#d6361f]">{analysisResult.wasteEstimateKg.toFixed(2)} kg</p>
                                        </div>
                                        <div className="pt-2 border-t border-[#3a1a0e]/20">
                                            <p className="font-semibold uppercase text-slate-500 text-[10px]">Chef Recommendation:</p>
                                            <p className="italic text-emerald-900 font-semibold mt-0.5">"{analysisResult.suggestion}"</p>
                                        </div>
                                    </div>
                                )}
                                {!isLoading && !analysisResult && (
                                    <div className="text-xs text-slate-500 font-medium py-6 text-center">
                                        Tap <strong>Analyze Waste</strong> to classify plate remnants and generate prep quota recommendations.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default CameraAnalysisModal;