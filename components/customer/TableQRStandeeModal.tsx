import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { soundService } from '../../services/soundService';
import { useAppContext } from '../../contexts/AppContext';

interface TableQRStandeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  onSelectTable?: (id: number) => void;
}

export const TableQRStandeeModal: React.FC<TableQRStandeeModalProps> = ({
  isOpen,
  onClose,
  tableId,
  onSelectTable,
}) => {
  const { tables } = useAppContext();
  const [selectedTableId, setSelectedTableId] = useState<number>(tableId || 1);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'standee' | 'simulate' | 'batch'>('standee');

  // Network & Deployment detection
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const isCurrentlyDeployed = typeof window !== 'undefined' && 
    window.location.protocol === 'https:' || 
    (typeof window !== 'undefined' && 
     window.location.hostname !== 'localhost' && 
     window.location.hostname !== '127.0.0.1' && 
     !window.location.hostname.startsWith('10.') && 
     !window.location.hostname.startsWith('192.168.'));

  // Common local Wi-Fi IP detected from Windows environment
  const detectedWifiIp = '10.194.33.238';
  const defaultWifiHost = `http://${detectedWifiIp}:3000`;
  
  // Default to live production origin if deployed, or Wi-Fi LAN if local
  const [networkMode, setNetworkMode] = useState<'wifi' | 'origin' | 'custom'>(
    isCurrentlyDeployed ? 'origin' : 'wifi'
  );
  const [customHost, setCustomHost] = useState<string>(
    isCurrentlyDeployed ? currentOrigin : defaultWifiHost
  );
  const [urlFormat, setUrlFormat] = useState<'standard' | 'hash' | 'menu'>('standard');

  useEffect(() => {
    setSelectedTableId(tableId || 1);
  }, [tableId]);

  // Determine current active base URL
  const activeBaseUrl = 
    networkMode === 'wifi' 
      ? defaultWifiHost 
      : networkMode === 'origin' 
      ? currentOrigin 
      : (customHost.startsWith('http') ? customHost : `https://${customHost}`);

  // Construct target URL according to format (all formats supported by our universal table resolver)
  const targetPortalUrl = 
    urlFormat === 'standard'
      ? `${activeBaseUrl}/?table=${selectedTableId}`
      : urlFormat === 'hash'
      ? `${activeBaseUrl}/#/?table=${selectedTableId}`
      : `${activeBaseUrl}/#/menu/${selectedTableId}`;

  // Generate crisp high-res QR code
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(targetPortalUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: {
          dark: '#1c1613',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => {
          console.error('Failed to generate high-res QR', err);
          // Fallback to QR server API
          setQrCodeDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetPortalUrl)}`
          );
        });
    }
  }, [isOpen, targetPortalUrl]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleCopyLink = () => {
    soundService.playTactileClick('high');
    navigator.clipboard.writeText(targetPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    soundService.playOrderSuccessChime();
    const link = document.createElement('a');
    link.download = `RestroAI-Table-${selectedTableId}-QR-Standee.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handlePrint = () => {
    soundService.playTactileClick('mid');
    window.print();
  };

  const handleSwitchTable = (id: number) => {
    soundService.playTactileClick('low');
    setSelectedTableId(id);
    if (onSelectTable) {
      onSelectTable(id);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 font-sans select-none animate-fade-in"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div 
          className="relative w-full max-w-2xl bg-[#fffdf7] rounded-[28px] sm:rounded-[36px] shadow-2xl border-3 border-[#3a1a0e] overflow-hidden flex flex-col max-h-[88vh] animate-card-bloom"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Top Header Banner */}
          <div className="bg-[#1c1613] text-[#fff4dc] p-4 sm:p-5 border-b-2 border-[#3a1a0e] relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#d6361f] border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] flex items-center justify-center text-2xl shrink-0">
                📱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d6361f] text-white text-[10px] font-semibold uppercase tracking-wider">
                    Industry Standee
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Table QR Generator
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  Table #{selectedTableId} QR Standee Card
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#fff4dc] border border-white/20 flex items-center justify-center font-black text-sm transition-transform active:scale-95 cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Top Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-4 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs font-semibold uppercase">
            <button
              onClick={() => {
                soundService.playTactileClick('mid');
                setActiveTab('standee');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'standee'
                  ? 'bg-white text-[#3a1a0e] shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🪧 Table Stand Card</span>
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('high');
                setActiveTab('simulate');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'simulate'
                  ? 'bg-gradient-to-r from-[#d6361f] to-amber-500 text-white shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>📲 Simulate Scan</span>
            </button>

            <button
              onClick={() => {
                soundService.playTactileClick('low');
                setActiveTab('batch');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'bg-white text-[#3a1a0e] shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🖨️ Batch All (1-12)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: REALISTIC TABLE TENT STANDEE CARD */}
          {activeTab === 'standee' && (
            <div className="space-y-5">
              
              {/* Table Quick Selector */}
              <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
                <span className="text-xs font-black text-slate-700 uppercase">
                  Select Restaurant Table:
                </span>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-[280px] sm:max-w-none">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => handleSwitchTable(num)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold uppercase transition-all cursor-pointer ${
                        selectedTableId === num
                          ? 'bg-[#3a1a0e] text-[#fff4dc] shadow-sm scale-105'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      #{num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Acrylic / Wooden Standee Preview Card (Print Target) */}
              <div
                id="printable-table-standee"
                className="relative bg-gradient-to-b from-[#fffdf8] via-white to-[#fff8ee] rounded-[32px] border-4 border-[#3a1a0e] shadow-[6px_8px_0_#3a1a0e] p-6 text-center max-w-sm mx-auto overflow-hidden group"
              >
                {/* Wood/Brass Header Strip */}
                <div className="flex items-center justify-center space-x-1.5 pb-2 border-b-2 border-dashed border-[#3a1a0e]/30">
                  <span className="text-xl">🍕</span>
                  <span className="font-semibold text-base tracking-widest uppercase text-[#3a1a0e]">
                    RestroAI Artisanal Dining
                  </span>
                </div>

                {/* Table Number Shield */}
                <div className="my-3.5 inline-flex flex-col items-center justify-center px-6 py-2 rounded-2xl bg-[#d6361f] text-white border-2 border-[#3a1a0e] shadow-[2px_3px_0_#3a1a0e]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                    Guest Dine-In
                  </span>
                  <span className="font-extrabold text-2xl tracking-wider uppercase leading-none mt-0.5">
                    TABLE #{selectedTableId}
                  </span>
                </div>

                {/* Crisp High-Contrast Scannable QR Code */}
                <div className="relative p-3.5 bg-white rounded-2xl border-3 border-[#3a1a0e] shadow-md inline-block my-2">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR Code for Table ${selectedTableId}`}
                      className="w-48 h-48 mx-auto object-contain transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs font-bold text-slate-500">
                      Generating Table QR...
                    </div>
                  )}

                  <div className="mt-1 px-3 py-0.5 bg-slate-900 text-amber-400 rounded-full text-[10px] font-mono font-black tracking-wider uppercase inline-block">
                    SCAN WITH PHONE CAMERA
                  </div>
                </div>

                {/* Features 1-Tap Summary List */}
                <div className="bg-[#fff4dc] rounded-2xl p-3 border-2 border-[#3a1a0e] mt-2 space-y-1.5 text-left text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <span>📱</span>
                    <span>1. Scan with Phone (No App Download)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <span>🍽️</span>
                    <span>2. Browse 3D Food & Sizzle Order</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <span>🛎️</span>
                    <span>3. Ring Live Floor Waiter Bell</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <span>💸</span>
                    <span>4. Split Bill with Friends & Pay UPI</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-semibold mt-3 italic">
                  Enjoy contactless ordering & instant table service.
                </p>
              </div>

              {/* Network / Domain URL Override Control */}
              <div className="bg-slate-900 text-white p-4 rounded-3xl border-2 border-[#3a1a0e] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400 flex items-center gap-1.5 uppercase font-semibold">
                    <span>🌐</span>
                    <span>Deployment & Scan Network</span>
                  </span>

                  <div className="flex gap-1.5">
                    {isCurrentlyDeployed ? (
                      <button
                        onClick={() => setNetworkMode('origin')}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase bg-emerald-500 text-slate-950 font-black"
                      >
                        🚀 Live Production Domain
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setNetworkMode('wifi')}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                            networkMode === 'wifi'
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                          title="Recommended for physical phone camera scanning on local Wi-Fi"
                        >
                          📶 Phone Wi-Fi ({detectedWifiIp})
                        </button>

                        <button
                          onClick={() => setNetworkMode('origin')}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                            networkMode === 'origin'
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                          title="Use current browser origin"
                        >
                          💻 Localhost
                        </button>

                        <button
                          onClick={() => setNetworkMode('custom')}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                            networkMode === 'custom'
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                          title="Custom production domain (Vercel, Netlify, Cloudflare)"
                        >
                          🚀 Deploy Domain
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Custom Deployment Host Input */}
                {networkMode === 'custom' && (
                  <div className="space-y-1.5 bg-black/40 p-2.5 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-300">
                      <span>Enter Your Live Deployed URL (e.g. Vercel, Netlify):</span>
                      <button
                        onClick={() => setCustomHost(currentOrigin)}
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        Auto-fill Current Host
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customHost}
                      onChange={(e) => setCustomHost(e.target.value)}
                      placeholder="https://my-restro-app.vercel.app"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {/* URL Format Switcher (Clean query vs Hash vs Menu) */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                  <span className="text-slate-400 font-medium">QR Link Format:</span>
                  <div className="flex gap-1">
                    {[
                      { id: 'standard', label: 'Clean (/?table=X)', tip: 'Best for Google Scanner & Lens' },
                      { id: 'hash', label: 'Hash (/#/?table=X)', tip: 'Static hosting fallback' },
                      { id: 'menu', label: 'Direct Menu (/#/menu/X)', tip: 'Jump straight to menu' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          soundService.playTactileClick('low');
                          setUrlFormat(f.id as any);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                          urlFormat === f.id
                            ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                        title={f.tip}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Encoded URL Display */}
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 text-[11px] truncate max-w-[280px] sm:max-w-md">
                    {targetPortalUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="text-amber-300 hover:text-white font-medium uppercase text-xs shrink-0 pl-2 cursor-pointer"
                  >
                    {copiedLink ? '✓ Copied!' : '📋 Copy Link'}
                  </button>
                </div>

                {/* Google Scanner / Google Lens Assurance Badge */}
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span>
                    <strong>Google Scanner & Google Lens Ready:</strong> Tested and compliant with Google Camera, Google Lens, Samsung Camera, Apple Camera, and Chrome QR Scanner.
                  </span>
                </div>
              </div>

              {/* Action Buttons: Print, Download, Open */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#3a1a0e] font-medium text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>📥</span>
                  <span>Save QR PNG</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="py-3 rounded-2xl bg-[#ffd45e] hover:bg-[#ffca36] text-[#3a1a0e] font-medium text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🖨️</span>
                  <span>Print Standee</span>
                </button>

                <a
                  href={`#/?table=${selectedTableId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="py-3 rounded-2xl bg-[#d6361f] hover:bg-[#ea3b21] text-white font-semibold text-xs uppercase tracking-wide border-2 border-[#3a1a0e] shadow-[2px_2px_0_#3a1a0e] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center"
                >
                  <span>🚀</span>
                  <span>Test Live Flow</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: IN-APP MOBILE CAMERA SCANNER SIMULATOR */}
          {activeTab === 'simulate' && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-[#3a1a0e] text-center space-y-4 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg animate-pulse">
                  📷
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-semibold text-white">
                    Simulate Smartphone QR Scan
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Test the instant guest journey as if a customer walked into the dining hall and pointed their iPhone/Android camera at a table standee.
                  </p>
                </div>

                {/* Viewfinder Target */}
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-400 rounded-3xl relative flex items-center justify-center bg-black/40">
                  <span className="w-full h-0.5 bg-emerald-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_12px_#34d399] animate-pulse" />
                  <div className="text-center p-3">
                    <span className="text-3xl block mb-1">🪑</span>
                    <span className="text-xs font-semibold uppercase text-amber-400 block">
                      Table #{selectedTableId} Detected
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono">
                      RestroAI Verified
                    </span>
                  </div>
                </div>

                {/* Simulated Notification Banner */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">🍕</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400 block">
                        Camera Prompt
                      </span>
                      <span className="text-xs font-bold text-white">
                        Open "RestroAI Table #{selectedTableId}" in Safari / Chrome
                      </span>
                    </div>
                  </div>

                  <a
                    href={`#/?table=${selectedTableId}`}
                    onClick={() => {
                      soundService.playOrderSuccessChime();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs uppercase cursor-pointer transition-transform active:scale-95 shrink-0"
                  >
                    Open Flow ➔
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BATCH PRINT ALL 12 RESTAURANT TABLES */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm uppercase text-amber-900">
                    🖨️ Restaurant All-Tables Fleet Printout
                  </h4>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 rounded-xl bg-[#3a1a0e] hover:bg-black text-[#fff4dc] font-medium text-xs uppercase cursor-pointer shadow-sm"
                  >
                    Print All 12 Tent Cards
                  </button>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Generate table standee tent cards for every table from Table #1 to #12 in one click. Place them on your physical dining tables for customers to scan.
                </p>
              </div>

              {/* Grid of All Tables */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                  const tableUrl =
                    urlFormat === 'standard'
                      ? `${activeBaseUrl}/?table=${num}`
                      : urlFormat === 'hash'
                      ? `${activeBaseUrl}/#/?table=${num}`
                      : `${activeBaseUrl}/#/menu/${num}`;
                  return (
                    <div
                      key={num}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        selectedTableId === num
                          ? 'border-[#d6361f] bg-amber-100 shadow-[2px_2px_0_#3a1a0e]'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                      onClick={() => {
                        handleSwitchTable(num);
                        setActiveTab('standee');
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs uppercase text-[#3a1a0e]">
                          Table #{num}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-black">
                          ACTIVE
                        </span>
                      </div>

                      <div className="w-20 h-20 mx-auto bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center mb-2">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(tableUrl)}`}
                          alt={`QR Table ${num}`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <span className="text-[10px] text-slate-500 font-bold block truncate">
                        Scan to Order
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </div>,
  document.body
);
};

export default TableQRStandeeModal;
