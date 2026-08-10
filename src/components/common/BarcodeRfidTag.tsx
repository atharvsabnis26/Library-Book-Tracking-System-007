import React from 'react';
import { Radio, Scan, ShieldCheck, Cpu, Copy, Check } from 'lucide-react';

interface BarcodeRfidTagProps {
  value: string;
  type?: 'barcode' | 'rfid' | 'both';
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showCopy?: boolean;
  className?: string;
}

// Play scanner beep audio using Web Audio API
export const playScannerBeep = (freq = 1800, durationMs = 120) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    // Audio context fallback silent
    console.debug('Audio context disabled or blocked', e);
  }
};

// Generate CSS barcode bar widths dynamically from hash of string
const generateBarPattern = (str: string) => {
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bars = [];
  // Standard start guard
  bars.push(2, 1, 1);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bars.push((code % 3) + 1, ((code * 3) % 2) + 1, ((code * 7) % 3) + 1, ((code + i) % 2) + 1);
  }
  // Standard stop guard
  bars.push(1, 1, 2);
  return bars;
};

export const BarcodeRfidTag: React.FC<BarcodeRfidTagProps> = ({
  value,
  type = 'both',
  title,
  subtitle,
  size = 'md',
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);
  const barPattern = generateBarPattern(value);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (type === 'barcode') {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 inline-flex flex-col items-center justify-center font-mono ${className}`}>
        {title && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate max-w-full">{title}</div>}
        
        {/* Visual Barcode Lines */}
        <div className="flex items-stretch justify-center h-10 w-full px-2 py-1 bg-white rounded border border-slate-100 dark:border-slate-800 gap-[1.5px] overflow-hidden">
          {barPattern.map((width, idx) => (
            <div
              key={idx}
              style={{ width: `${width * 1.5}px` }}
              className={`h-full ${idx % 2 === 0 ? 'bg-slate-900 dark:bg-slate-100' : 'bg-transparent'}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">
          <span>{value}</span>
          {showCopy && (
            <button
              onClick={handleCopy}
              title="Copy Barcode"
              className="text-slate-400 hover:text-blue-500 transition-colors p-0.5"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'rfid') {
    return (
      <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/40 text-white rounded-xl p-3.5 inline-flex flex-col shadow-md relative overflow-hidden ${className}`}>
        {/* Chip Graphic Ornament */}
        <div className="absolute top-2 right-2 w-7 h-5 rounded border border-amber-400/60 bg-gradient-to-tr from-amber-600/30 via-yellow-500/40 to-amber-300/20 flex items-center justify-center">
          <div className="w-3 h-2 border-t border-b border-amber-300/80" />
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">
          <Radio className="w-3 h-3 animate-pulse text-amber-400" />
          <span>UHF RFID Tag</span>
        </div>

        {title && <div className="font-bold text-xs text-white truncate max-w-[180px]">{title}</div>}
        {subtitle && <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{subtitle}</div>}

        <div className="mt-2.5 pt-2 border-t border-slate-700/80 flex items-center justify-between gap-2 text-xs font-mono">
          <span className="text-amber-200 font-semibold tracking-wider">{value}</span>
          {showCopy && (
            <button
              onClick={handleCopy}
              title="Copy RFID EPC"
              className="text-slate-400 hover:text-amber-300 p-0.5"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Both / Dual Tag Label
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <div>
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Scan className="w-3 h-3" /> Auto-ID Asset Label
          </div>
          {title && <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{title}</div>}
        </div>
        <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400">
          <Radio className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Barcode side */}
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
          <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">1D BARCODE</div>
          <div className="flex items-stretch justify-center h-7 w-full px-1 bg-white rounded border border-slate-200 dark:border-slate-700 gap-[1px]">
            {barPattern.map((width, idx) => (
              <div
                key={idx}
                style={{ width: `${width * 1.2}px` }}
                className={`h-full ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`}
              />
            ))}
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">
            {value}
          </div>
        </div>

        {/* RFID side */}
        <div className="p-2 rounded-lg bg-slate-900 text-white border border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-mono text-amber-400">
            <span>UHF 860-960MHz</span>
            <Cpu className="w-3 h-3" />
          </div>
          <div className="my-1 text-[11px] font-mono font-semibold text-amber-200 truncate">
            {value.startsWith('BC-') ? value.replace('BC-', 'RFID-') : value}
          </div>
          <div className="text-[9px] text-slate-400">ISO/IEC 18000-6C</div>
        </div>
      </div>
    </div>
  );
};
