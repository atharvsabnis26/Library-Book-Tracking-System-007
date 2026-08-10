import React from 'react';
import { QrCode, User, ShieldCheck, Copy, Check, Radio } from 'lucide-react';
import { Student } from '../../types';

interface QrCodeGraphicProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
}

// Generate a deterministic 21x21 QR module grid with standard position detection patterns
export const QrCodeGraphic: React.FC<QrCodeGraphicProps> = ({
  value,
  size = 120,
  className = '',
  fgColor = 'currentColor',
  bgColor = 'transparent'
}) => {
  const gridSize = 21; // Version 1 QR code matrix (21x21)

  // Generate matrix state
  const modules = React.useMemo(() => {
    const grid: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

    // Helper to draw Finder Pattern (7x7) at (row, col)
    const drawFinder = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 || // Outer ring
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)       // Inner 3x3 block
          ) {
            grid[startRow + r][startCol + c] = true;
          }
        }
      }
    };

    // Draw 3 finder patterns in Top-Left, Top-Right, Bottom-Left
    drawFinder(0, 0);
    drawFinder(0, gridSize - 7);
    drawFinder(gridSize - 7, 0);

    // Draw timing patterns (Row 6 and Col 6)
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        grid[6][i] = true;
        grid[i][6] = true;
      }
    }

    // Hash value to populate data modules
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder pattern zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= gridSize - 8;
        const inBottomLeft = r >= gridSize - 8 && c < 8;
        const inTiming = r === 6 || c === 6;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
          const bitVal = Math.abs((hash ^ (r * 31 + c * 17) ^ (r * c)) % 100);
          grid[r][c] = bitVal > 42; // ~58% density
        }
      }
    }

    return grid;
  }, [value]);

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`inline-block ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {modules.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.3} // slight overlap to prevent gap lines
              height={cellSize + 0.3}
              fill={fgColor}
              rx={0.5}
            />
          );
        })
      )}
    </svg>
  );
};

interface StudentQrBadgeProps {
  student: Student;
  onScan?: (studentCode: string) => void;
  showCopy?: boolean;
  className?: string;
}

export const StudentQrBadge: React.FC<StudentQrBadgeProps> = ({
  student,
  onScan,
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);
  const qrData = JSON.stringify({
    id: student.id,
    name: student.name,
    department: student.department,
    barcode: student.barcode || `BC-${student.id.replace(/-/g, '')}`,
    rfidCard: student.rfidCard || `RFID-CARD-${student.id.split('-').pop()}`,
    type: 'LIBRARY_STUDENT_CARD'
  });

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(student.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onScan && onScan(student.id)}
      className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/30 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden group ${className}`}
    >
      {/* Decorative Gradient Accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-600/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 uppercase tracking-widest">
          <QrCode className="w-3.5 h-3.5 text-blue-400" />
          <span>LIBRARY MEMBER CARD</span>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-mono font-bold">
          {student.id}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* QR Code Matrix Display */}
        <div className="bg-white p-2 rounded-xl shrink-0 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <QrCodeGraphic value={qrData} size={72} fgColor="#0f172a" />
          <span className="text-[8px] font-mono font-bold text-slate-500 mt-1">SCAN QR</span>
        </div>

        {/* Student Details */}
        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="font-bold text-sm text-white truncate group-hover:text-blue-300 transition-colors">
            {student.name}
          </h4>
          <p className="text-[11px] text-slate-300 truncate">{student.department}</p>
          <div className="text-[10px] text-slate-400 font-mono">Issued: {student.issuedCount} Books</div>

          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="truncate">RFID: {student.rfidCard}</span>
            {showCopy && (
              <button onClick={handleCopy} className="text-slate-400 hover:text-blue-400 p-0.5 shrink-0" title="Copy Student ID">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {onScan && (
        <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-blue-300">
          <span>Click to test QR Code scan</span>
          <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded group-hover:scale-105 transition-transform">
            SCAN NOW
          </span>
        </div>
      )}
    </div>
  );
};
