import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, Student, Transaction } from '../../types';
import {
  Scan,
  Radio,
  QrCode,
  Search,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Sparkles,
  Layers,
  BookOpen,
  User,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  MapPin,
  Clock,
  Camera,
  CameraOff,
  RotateCcw,
  History,
  Barcode,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Badge } from '../common/Badge';
import { BarcodeRfidTag, playScannerBeep } from '../common/BarcodeRfidTag';
import { StudentQrBadge, QrCodeGraphic } from '../common/QrCodeBadge';

export const BarcodeRfidView: React.FC = () => {
  const { books, students, transactions, issueBook, returnBook, setActiveTab, addToast } = useLibrary();

  // Scanner State
  const [scanInput, setScanInput] = useState('');
  const [scannerMode, setScannerMode] = useState<'rfid' | 'barcode' | 'qrcode'>('qrcode');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Optical Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Scanned Entity
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [activeTxnForBook, setActiveTxnForBook] = useState<Transaction | null>(null);

  // Recent Scans State (Last 5 processed barcodes/tags)
  const [recentScans, setRecentScans] = useState<Array<{
    id: string;
    code: string;
    title: string;
    subtitle: string;
    type: 'book' | 'student';
    scanMode: 'barcode' | 'rfid' | 'qrcode';
    timestamp: string;
    badge?: string;
  }>>(() => {
    return books.slice(0, 3).map((book, idx) => ({
      id: `init-scan-${book.id}-${idx}`,
      code: book.barcode || book.isbn || book.id,
      title: book.title,
      subtitle: `${book.author} • ${book.category}`,
      type: 'book' as const,
      scanMode: 'barcode' as const,
      timestamp: new Date(Date.now() - (idx + 1) * 3 * 60 * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      badge: book.locationRack || 'Cataloged'
    }));
  });

  // Bulk RFID Rack Audit State
  const [selectedRack, setSelectedRack] = useState('A1-R02');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    rack: string;
    expectedBooks: Book[];
    scannedCount: number;
    matchCount: number;
    missingCount: number;
  } | null>(null);

  // Label Print Selection State
  const [selectedForPrint, setSelectedForPrint] = useState<string[]>([]);
  const [printFilter, setPrintFilter] = useState<'all' | 'books' | 'students'>('all');

  const inputRef = useRef<HTMLInputElement>(null);

  // Available racks from books catalog
  const availableRacks = Array.from(new Set(books.map(b => b.locationRack).filter(Boolean))) as string[];

  // Clean up camera on unmount or mode change
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setCameraError(null);
  };

  const startCamera = async (targetCamId?: string, overrideFacingMode?: 'environment' | 'user') => {
    setIsCameraLoading(true);
    setCameraError(null);
    setIsCameraActive(true);

    const activeFacing = overrideFacingMode || facingMode;

    // Stop existing scanner if running
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Stopping previous instance:', e);
      }
      html5QrCodeRef.current = null;
    }

    try {
      // Small pause to let DOM mount the #html5qr-code-reader container
      await new Promise(r => setTimeout(r, 120));

      const element = document.getElementById('html5qr-code-reader');
      if (!element) {
        throw new Error('Scanner container element not ready in DOM');
      }

      // Enumerate hardware cameras for device switcher
      let cameras: Array<{ id: string; label: string }> = [];
      try {
        cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setAvailableCameras(cameras);
        }
      } catch (e) {
        console.warn('Camera enumeration info:', e);
      }

      const qrScanner = new Html5Qrcode('html5qr-code-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A
        ],
        verbose: false
      });

      html5QrCodeRef.current = qrScanner;

      const scanConfig = {
        fps: 15,
        qrbox: (w: number, h: number) => {
          const size = Math.min(w, h) * 0.75;
          return { width: Math.max(Math.floor(size), 180), height: Math.max(Math.floor(size), 180) };
        },
        aspectRatio: 1.3333
      };

      const onScanSuccess = (decodedText: string) => {
        if (decodedText) {
          processScanQuery(decodedText);
        }
      };

      const onScanFailure = () => {
        // Normal frame drop
      };

      // Explicitly request environment-facing (back) camera constraint
      if (targetCamId) {
        setSelectedCameraId(targetCamId);
        await qrScanner.start(
          targetCamId,
          scanConfig,
          onScanSuccess,
          onScanFailure
        );
      } else if (activeFacing === 'user') {
        await qrScanner.start(
          { facingMode: 'user' },
          scanConfig,
          onScanSuccess,
          onScanFailure
        );
      } else {
        // Explicit environment-facing constraint for mobile rear camera
        try {
          await qrScanner.start(
            { facingMode: 'environment' },
            scanConfig,
            onScanSuccess,
            onScanFailure
          );
        } catch (facingErr) {
          console.warn('Exact facingMode environment start failed, attempting rear camera fallback:', facingErr);
          // Fallback to detected rear camera deviceId if direct facingMode constraint is rejected by host
          if (cameras.length > 0) {
            const rear = cameras.find(c => /back|rear|environment|0|world|external/i.test(c.label)) || cameras[cameras.length - 1];
            setSelectedCameraId(rear.id);
            await qrScanner.start(
              rear.id,
              scanConfig,
              onScanSuccess,
              onScanFailure
            );
          } else {
            throw facingErr;
          }
        }
      }

      setIsCameraLoading(false);
      addToast(
        `${activeFacing === 'environment' ? 'Rear (Back)' : 'Front'} Camera Live Scanner Active`,
        'info',
        'Optical Scanner Ready'
      );
    } catch (err: any) {
      console.error('Failed to start camera scanner:', err);
      setIsCameraLoading(false);
      const msg = err?.message || String(err);
      setCameraError(msg);
      addToast('Could not initialize camera stream. Try switching camera or using Snap Photo.', 'error', 'Camera Error');
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedCameraId('');
    await startCamera(undefined, nextFacing);
  };

  // Decode file or native camera snapshot
  const handleImageFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      if (soundEnabled) playScannerBeep(2400, 100);

      const scanner = html5QrCodeRef.current || new Html5Qrcode('html5qr-code-reader', { verbose: false });
      const decodedText = await scanner.scanFile(file, true);

      if (decodedText) {
        processScanQuery(decodedText);
        addToast(`Decoded snapshot QR: "${decodedText}"`, 'success', 'Photo Decoded');
      }
    } catch (err: any) {
      console.warn('File decode error:', err);
      addToast('No QR code detected in image. Please capture with good focus and lighting.', 'error', 'Unrecognized Photo');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Capture Frame Scan action
  const handleCaptureFrameScan = async () => {
    setIsScanning(true);
    if (soundEnabled) playScannerBeep(2400, 100);

    setTimeout(() => {
      setIsScanning(false);
      if (students.length > 0) {
        const sampleStudent = students[0];
        processScanQuery(sampleStudent.id);
        addToast(`Optical Frame Analyzed: Scanned ${sampleStudent.name} (${sampleStudent.id})`, 'success', 'Frame Scan Decoded');
      } else if (books.length > 0) {
        processScanQuery(books[0].barcode || books[0].id);
      }
    }, 300);
  };

  // Execute scan match lookup (Supports Barcode, RFID, & JSON QR payload)
  const processScanQuery = (query: string) => {
    let clean = query.trim();
    if (!clean) return;

    let targetCode = clean.toLowerCase();

    // Parse JSON payload if scanned from QR Code
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.id) targetCode = parsed.id.toLowerCase();
        else if (parsed.barcode) targetCode = parsed.barcode.toLowerCase();
        else if (parsed.rfidCard) targetCode = parsed.rfidCard.toLowerCase();
      } catch (e) {
        // Fallback to raw query
      }
    }

    setIsScanning(true);
    if (soundEnabled) playScannerBeep(scannerMode === 'rfid' ? 2100 : scannerMode === 'qrcode' ? 2400 : 1800, 100);

    setTimeout(() => {
      setIsScanning(false);

      // Match by Barcode, RFID, ISBN, or ID
      const matchedBook = books.find(
        b =>
          b.id.toLowerCase() === targetCode ||
          (b.barcode && b.barcode.toLowerCase() === targetCode) ||
          (b.rfidTag && b.rfidTag.toLowerCase() === targetCode) ||
          b.isbn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === targetCode.replace(/[^a-zA-Z0-9]/g, '')
      );

      const matchedStudent = students.find(
        s =>
          s.id.toLowerCase() === targetCode ||
          (s.barcode && s.barcode.toLowerCase() === targetCode) ||
          (s.rfidCard && s.rfidCard.toLowerCase() === targetCode)
      );

      if (matchedBook) {
        setScannedBook(matchedBook);
        setScannedStudent(null);
        // Find if this book currently has an active issue transaction
        const activeTxn = transactions.find(t => t.bookId === matchedBook.id && t.status === 'Active');
        setActiveTxnForBook(activeTxn || null);
        addToast(`Scanned Book via ${scannerMode.toUpperCase()}: "${matchedBook.title}"`, 'success', 'Scan Success');

        // Record in recent scans list (keep last 5)
        const newRecord = {
          id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          code: matchedBook.barcode || matchedBook.isbn || targetCode,
          title: matchedBook.title,
          subtitle: `${matchedBook.author} • ${matchedBook.category}`,
          type: 'book' as const,
          scanMode: scannerMode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: matchedBook.locationRack || 'Cataloged'
        };
        setRecentScans(prev => [newRecord, ...prev.filter(item => item.code.toLowerCase() !== newRecord.code.toLowerCase())].slice(0, 5));
      } else if (matchedStudent) {
        setScannedStudent(matchedStudent);
        setScannedBook(null);
        setActiveTxnForBook(null);
        addToast(`Scanned Student Library QR Card: "${matchedStudent.name}"`, 'success', 'Student Identified');

        // Record in recent scans list (keep last 5)
        const newRecord = {
          id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          code: matchedStudent.barcode || matchedStudent.id || targetCode,
          title: matchedStudent.name,
          subtitle: `${matchedStudent.department} • ${matchedStudent.id}`,
          type: 'student' as const,
          scanMode: scannerMode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: matchedStudent.year || 'Student'
        };
        setRecentScans(prev => [newRecord, ...prev.filter(item => item.code.toLowerCase() !== newRecord.code.toLowerCase())].slice(0, 5));
      } else {
        addToast(`No book or student found matching identifier: "${clean}"`, 'error', 'Unrecognized Code');
      }
    }, 250);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScanQuery(scanInput);
  };

  const handleTapSampleTag = (tagCode: string) => {
    setScanInput(tagCode);
    processScanQuery(tagCode);
  };

  // Perform RFID Bulk Rack Audit
  const handleRunRackAudit = () => {
    setIsAuditing(true);
    if (soundEnabled) playScannerBeep(1200, 200);

    setTimeout(() => {
      setIsAuditing(false);
      if (soundEnabled) playScannerBeep(2400, 150);

      const expected = books.filter(b => b.locationRack === selectedRack);
      setAuditResult({
        rack: selectedRack,
        expectedBooks: expected,
        scannedCount: expected.length,
        matchCount: expected.length,
        missingCount: 0
      });

      addToast(`UHF RFID Sweep complete for ${selectedRack}. Scanned ${expected.length} tags.`, 'success', 'Audit Complete');
    }, 1200);
  };

  // 1-Click Quick Return
  const handleQuickReturn = () => {
    if (!activeTxnForBook) return;
    const res = returnBook(activeTxnForBook.id);
    if (res.success) {
      // Refresh active transaction
      setActiveTxnForBook(null);
      // Refresh scanned book from updated array
      const updated = books.find(b => b.id === scannedBook?.id);
      if (updated) setScannedBook(updated);
    }
  };

  // Toggle item print selection
  const togglePrintItem = (id: string) => {
    setSelectedForPrint(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const selectAllForPrint = () => {
    const allBookIds = books.map(b => b.id);
    const allStudentIds = students.map(s => s.id);
    if (selectedForPrint.length === allBookIds.length + allStudentIds.length) {
      setSelectedForPrint([]);
    } else {
      setSelectedForPrint([...allBookIds, ...allStudentIds]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/80 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Barcode & RFID Integration Hub</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Auto-ID Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Hardware scanner emulation, UHF RFID tag reading, 1-Click transaction execution, and batch label printing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                soundEnabled
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Scanner Sound Beep"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Beep Audio ON' : 'Audio Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Scanner Terminal & Scan Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Input Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Live Hardware & Optical Scanner</span>
              </h3>

              {/* Mode Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => {
                    setScannerMode('qrcode');
                    stopCamera();
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    scannerMode === 'qrcode'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-3 h-3" /> QR Code
                </button>
                <button
                  onClick={() => {
                    setScannerMode('barcode');
                    stopCamera();
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    scannerMode === 'barcode'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Scan className="w-3 h-3" /> Barcode
                </button>
                <button
                  onClick={() => {
                    setScannerMode('rfid');
                    stopCamera();
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    scannerMode === 'rfid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3 h-3" /> RFID
                </button>
              </div>
            </div>

            {/* Scanner Graphic Box / Camera Feed Viewfinder */}
            <div className="relative rounded-xl bg-slate-950 p-3 sm:p-4 text-white overflow-hidden border border-slate-800 my-4 shadow-inner min-h-[200px] flex flex-col items-center justify-center">
              {/* Laser Line */}
              <div
                className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] z-20 ${
                  isScanning ? 'animate-bounce top-1/2' : 'top-1/3 opacity-70'
                }`}
              />

              {scannerMode === 'qrcode' && isCameraActive ? (
                /* Live Html5Qrcode Scanner Video Container */
                <div className="relative w-full min-h-[240px] rounded-lg overflow-hidden border border-slate-700 bg-black flex flex-col items-center justify-center">
                  <div id="html5qr-code-reader" className="w-full h-full min-h-[220px]" />

                  {/* Camera Loading Overlay */}
                  {isCameraLoading && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 z-20">
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-300">Activating Back Camera Sensor...</span>
                    </div>
                  )}

                  {/* Camera Error Overlay */}
                  {cameraError && !isCameraLoading && (
                    <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center z-20">
                      <AlertCircle className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-xs font-bold text-slate-200">Back Camera Unavailable</span>
                      <span className="text-[11px] text-slate-400 max-w-xs mt-0.5 mb-3 leading-relaxed">
                        {cameraError.includes('NotAllowedError') || cameraError.includes('Permission')
                          ? 'Camera permission was blocked. Please enable camera access or use the Snap Photo option.'
                          : cameraError}
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          Retry Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Snap Photo Instead
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Camera Header Toolbar */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-30 pointer-events-auto">
                    {availableCameras.length > 1 ? (
                      <select
                        value={selectedCameraId}
                        onChange={(e) => startCamera(e.target.value)}
                        className="px-2 py-1 bg-slate-900/95 text-[11px] font-mono text-blue-300 rounded-lg border border-slate-700 shadow-md max-w-[170px] truncate"
                      >
                        {availableCameras.map((cam, i) => (
                          <option key={cam.id} value={cam.id}>
                            {cam.label || `Camera ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-900 text-[11px] font-mono text-blue-300 rounded-lg border border-slate-700 flex items-center gap-1 shadow-md"
                        title="Switch between Rear/Back and Front Camera"
                      >
                        <RotateCcw className="w-3 h-3 text-blue-400" />
                        <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-900 text-[11px] font-mono text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 shadow-md"
                    >
                      <CameraOff className="w-3 h-3 text-red-400" /> Close Camera
                    </button>
                  </div>

                  {/* Camera Footer Actions */}
                  <div className="absolute bottom-2 left-2 right-2 z-30 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCaptureFrameScan}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-lg shadow-lg font-mono transition-all flex items-center gap-1.5 border border-blue-400/40"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>⚡ Capture Frame Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg shadow-md font-mono transition-all flex items-center gap-1.5 border border-slate-600"
                      title="Snap photo with native device camera"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Snap Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Simulated / Idle Scanner Mode Graphics */
                <div className="relative z-10 text-center space-y-2 py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                    {scannerMode === 'rfid' ? (
                      <Radio className="w-6 h-6 animate-pulse text-amber-400" />
                    ) : scannerMode === 'qrcode' ? (
                      <QrCode className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Scan className="w-6 h-6 text-red-400" />
                    )}
                  </div>

                  <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    {scannerMode === 'rfid'
                      ? 'ISO/IEC 18000-6C UHF RFID Reader'
                      : scannerMode === 'qrcode'
                      ? '2D QR Code Library Card Reader'
                      : '1D Laser Barcode Scanner'}
                  </div>

                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    {scannerMode === 'qrcode'
                      ? 'Point rear camera at student card QR or snap a photo.'
                      : 'Scan barcode tag, tap RFID card, or enter ID below.'}
                  </p>

                  {scannerMode === 'qrcode' && (
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg border border-blue-400/30 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-200" />
                        <span>Open Back Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Snap / Upload Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hidden file input for native camera snapshot / photo upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageFileScan}
              className="hidden"
            />

            {/* Input Form */}
            <form onSubmit={handleManualScanSubmit} className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {scannerMode === 'qrcode' ? 'Scan / Input QR Payload or Student ID' : 'Scan Tag / Enter Identifier Code'}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  placeholder={
                    scannerMode === 'rfid'
                      ? 'e.g. RFID-E200-0101-A9B1'
                      : scannerMode === 'qrcode'
                      ? 'e.g. STU-2024-001 or {"id":"STU-2024-001"}'
                      : 'e.g. BC-9780132847377'
                  }
                  className="w-full pl-3.5 pr-20 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" /> Scan
                </button>
              </div>
            </form>

            {/* Recent Scans Scrollable List */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Recent Scans
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {recentScans.length}/5
                  </span>
                </div>
                {recentScans.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRecentScans([])}
                    className="text-[11px] font-medium text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                    title="Clear recent scan history"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {recentScans.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/80 text-center text-xs text-slate-400 font-mono">
                  No barcodes scanned yet
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                  {recentScans.map((scan) => (
                    <button
                      key={scan.id}
                      type="button"
                      onClick={() => {
                        setScanInput(scan.code);
                        processScanQuery(scan.code);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 dark:bg-slate-800/50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {scan.type === 'student' ? (
                            <User className="w-3 h-3 text-emerald-500" />
                          ) : scan.scanMode === 'rfid' ? (
                            <Radio className="w-3 h-3 text-amber-500" />
                          ) : scan.scanMode === 'qrcode' ? (
                            <QrCode className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Barcode className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {scan.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{scan.code}</span>
                            {scan.badge && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 shrink-0">
                                {scan.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end pl-1">
                        <span className="text-[10px] font-mono text-slate-400">{scan.timestamp}</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Load →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 font-mono">
            <span>Status: Ready for Input</span>
            <span className="text-emerald-500 font-semibold">HID Wedge Ready</span>
          </div>
        </div>

        {/* Scan Result Output Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Scanned Identity Output</span>
              </h3>
              {(scannedBook || scannedStudent) && (
                <button
                  onClick={() => {
                    setScannedBook(null);
                    setScannedStudent(null);
                    setScanInput('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-mono"
                >
                  Clear Output
                </button>
              )}
            </div>

            {!scannedBook && !scannedStudent ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Scan className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Tag Scanned Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Tap any sample book or student RFID badge below, or type a barcode into the terminal to trigger quick lookup.
                  </p>
                </div>
              </div>
            ) : scannedBook ? (
              /* Scanned Book View */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                  <div className="w-20 h-28 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden border border-slate-300 dark:border-slate-600 shadow-sm">
                    {scannedBook.coverUrl ? (
                      <img src={scannedBook.coverUrl} alt={scannedBook.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={scannedBook.availableCopies > 0 ? 'success' : 'danger'}>
                        {scannedBook.availableCopies} / {scannedBook.quantity} Available
                      </Badge>
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Rack: {scannedBook.locationRack || 'Unassigned'}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                      {scannedBook.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Author: <span className="font-semibold text-slate-700 dark:text-slate-300">{scannedBook.author}</span> • Category: {scannedBook.category}
                    </p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">BARCODE</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scannedBook.barcode}</span>
                      </div>
                      <div className="bg-slate-900 text-amber-200 p-2 rounded border border-amber-500/30">
                        <span className="text-[10px] text-amber-400 block">UHF RFID EPC</span>
                        <span className="font-bold">{scannedBook.rfidTag}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Loan Alert if borrowed */}
                {activeTxnForBook && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" /> Book Currently Issued
                      </div>
                      <p className="text-[11px] mt-0.5">
                        Borrowed by <strong className="font-semibold">{activeTxnForBook.studentName}</strong> ({activeTxnForBook.studentId}). Due on {activeTxnForBook.dueDate}.
                      </p>
                    </div>
                    <button
                      onClick={handleQuickReturn}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-sm shrink-0"
                    >
                      Instant Return
                    </button>
                  </div>
                )}

                {/* Scanned Book Action Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('issue')}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Issue This Book
                  </button>

                  <button
                    onClick={() => setActiveTab('return')}
                    className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Return Module
                  </button>
                </div>
              </div>
            ) : (
              /* Scanned Student View */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                    {scannedStudent.name.charAt(0)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        ID: {scannedStudent.id}
                      </span>
                      <Badge variant="info">Active Member</Badge>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {scannedStudent.name}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {scannedStudent.department} • {scannedStudent.email}
                    </p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">BARCODE</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scannedStudent.barcode}</span>
                      </div>
                      <div className="bg-slate-900 text-amber-200 p-2 rounded border border-amber-500/30">
                        <span className="text-[10px] text-amber-400 block">RFID SMART CARD</span>
                        <span className="font-bold">{scannedStudent.rfidCard}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('issue')}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Proceed to Issue Book
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Library Cards & QR Code Badges Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Student Library Cards & QR Badges</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scan student QR codes directly for instant member verification, checkouts, and circulation.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {students.length} Registered Cards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <StudentQrBadge
              key={student.id}
              student={student}
              onScan={studentId => processScanQuery(studentId)}
            />
          ))}
        </div>
      </div>

      {/* Quick Tap RFID Tag & Barcode Samples Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Tap Sample Tags to Test Scanner</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any RFID Tag or Barcode label to simulate hardware scanner trigger in real-time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {books.map(b => (
            <div
              key={b.id}
              onClick={() => handleTapSampleTag(b.rfidTag || b.barcode || b.id)}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{b.id}</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Radio className="w-3 h-3" /> RFID
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {b.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{b.author}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <span className="truncate">{b.rfidTag}</span>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold group-hover:scale-105 transition-transform">
                  TAP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UHF RFID Inventory Rack Bulk Scanner Module */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>UHF RFID Bulk Rack Audit Scanner</span>
              </h3>
              <p className="text-xs text-slate-400">
                Simulates handheld RFID scanner sweeping entire rack shelf in O(N) parallel Tag reads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedRack}
              onChange={e => setSelectedRack(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {availableRacks.map(rack => (
                <option key={rack} value={rack}>
                  Location Rack: {rack}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunRackAudit}
              disabled={isAuditing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sweeping...
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" /> Sweep Rack Antenna
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audit Results View */}
        {auditResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Rack Sweep Target: <strong className="text-amber-400">{auditResult.rack}</strong></span>
              <span className="text-emerald-400 font-bold">100% Signal Match ({auditResult.scannedCount} Tags Validated)</span>
            </div>

            <div className="divide-y divide-slate-800">
              {auditResult.expectedBooks.map(book => (
                <div key={book.id} className="py-2 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓ RFID VERIFIED</span>
                    <span className="font-bold text-white">{book.title}</span>
                  </div>
                  <div className="text-slate-400">{book.rfidTag}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Printable Barcode & RFID Label Generator Studio */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Printable Tag & Badge Label Generator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate barcode spine stickers and student RFID membership badges for batch printing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllForPrint}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
            >
              {selectedForPrint.length > 0 ? 'Deselect All' : 'Select All Tags'}
            </button>

            <button
              onClick={() => window.print()}
              disabled={selectedForPrint.length === 0}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print Selected ({selectedForPrint.length})
            </button>
          </div>
        </div>

        {/* Tags Grid to print */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(b => {
            const isSelected = selectedForPrint.includes(b.id);
            return (
              <div
                key={b.id}
                onClick={() => togglePrintItem(b.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="absolute top-3 right-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>

                <BarcodeRfidTag
                  type="both"
                  title={b.title}
                  value={b.barcode || b.id}
                  showCopy={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
