import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Table } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, table }) => {
  const { tables } = useAppContext();
  const [currentTable, setCurrentTable] = useState<Table>(table || { id: 1, status: 'Free' as any, chairs: 4 });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const [customHost, setCustomHost] = useState<string>(currentOrigin);
  const [portalUrl, setPortalUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (table) {
      setCurrentTable(table);
    }
  }, [table]);

  useEffect(() => {
    if (isOpen && currentTable) {
      const baseUrl = customHost 
        ? (customHost.startsWith('http') ? customHost : `http://${customHost}`) 
        : window.location.origin;
        
      const targetUrl = `${baseUrl}${window.location.pathname}#/?table=${currentTable.id}`;
      setPortalUrl(targetUrl);

      QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR code', err);
        setQrCodeDataUrl(null);
      });
    } else {
      setQrCodeDataUrl(null);
    }
  }, [isOpen, currentTable, customHost]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen || !table) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-[#0F172A]/95 border-2 border-indigo-500/80 rounded-3xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] w-full max-w-lg text-center p-6 sm:p-8 overflow-y-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-600" />

        <div className="flex justify-between items-center mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloudflare Secure Tunnel Ready</span>
            </span>
            <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
                ✕
            </button>
        </div>

        {/* Standee Header & Table Selector */}
        <div className="mb-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400">Select Table:</span>
                <select
                    value={currentTable.id}
                    onChange={(e) => {
                        const newId = Number(e.target.value);
                        const matched = tables.find(t => t.id === newId) || { id: newId, status: 'Free' as any, chairs: 4 };
                        setCurrentTable(matched);
                    }}
                    className="bg-slate-800 text-emerald-400 border border-slate-700 rounded-xl px-3 py-1 text-sm font-black font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>Table #{num}</option>
                    ))}
                </select>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Table #{currentTable.id} Smart Menu</h2>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                📍 Pure Black & White High-Contrast QR Code
            </p>
        </div>

        {/* QR Code Frame */}
        <div className="p-5 bg-white rounded-3xl border-4 border-slate-900 inline-block shadow-2xl relative group mb-4">
            {qrCodeDataUrl ? (
                <div className="p-2 bg-white rounded-xl">
                    <img src={qrCodeDataUrl} alt={`QR Code for Table ${currentTable.id} self-ordering portal`} className="w-60 h-60 mx-auto object-contain" />
                </div>
            ) : (
                <div className="w-60 h-60 flex items-center justify-center text-slate-700 text-xs font-bold">
                    Generating High-Contrast QR...
                </div>
            )}
            <div className="mt-2 px-4 py-1 bg-black text-white rounded-full text-[11px] font-mono font-black shadow-md tracking-wider">
                RESTRO-AI • TABLE {currentTable.id}
            </div>
        </div>

        {/* Network Mode Configuration Field */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-3 mb-6">
            <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mb-1">
                    <span>🔗 Exact URL encoded inside QR Code:</span>
                    <button 
                      onClick={handleCopyUrl}
                      className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                    >
                        {isCopied ? '✅ Copied!' : '📋 Copy Link'}
                    </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 break-all border border-slate-800 font-extrabold">
                    {portalUrl}
                </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <span>🌐 Network URL / IP Override:</span>
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCustomHost(currentOrigin)}
                            className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 hover:bg-emerald-900 font-mono"
                        >
                            Current Origin ({window.location.host})
                        </button>
                        <button
                            onClick={() => setCustomHost(`http://${window.location.hostname}:3000`)}
                            className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 hover:bg-indigo-900 font-mono"
                        >
                            Local Host
                        </button>
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mb-2">
                    • <strong className="text-emerald-300">Default Origin:</strong> Uses <code className="text-slate-300">{currentOrigin}</code>.<br/>
                    • <strong className="text-indigo-300">Mobile Phone Scanning:</strong> Make sure your phone is connected to the same Wi-Fi network (or use your PC's LAN IP / tunnel).
                </p>
                <input
                    type="text"
                    value={customHost}
                    onChange={e => setCustomHost(e.target.value)}
                    placeholder="Enter current domain, Wi-Fi IP, or tunnel..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-extrabold focus:outline-none focus:border-indigo-500"
                />
            </div>
        </div>

        {/* Action Controls for Testing & Printing */}
        <div className="space-y-3">
            <a
                href={`#/?table=${currentTable.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center space-x-2 block"
            >
                <span>🍽️ Open Table #{currentTable.id} · Menu & Order</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => window.print()}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🖨️ Print Stand Card</span>
                </button>
                <button 
                  onClick={onClose} 
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl border border-slate-700/80 transition-colors"
                >
                  Close Window
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;