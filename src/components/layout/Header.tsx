import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Menu, Sun, Moon, Search, Layers, GraduationCap, RotateCcw, Radio } from 'lucide-react';
import { OfflineSyncBadge } from '../common/OfflineSyncBadge';

interface HeaderProps {
  onToggleSidebar: () => void;
  showVivaBanner: boolean;
  onToggleVivaBanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  showVivaBanner,
  onToggleVivaBanner
}) => {
  const { activeTab, setActiveTab, darkMode, setDarkMode, books, queue, resetAllData } = useLibrary();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'barcode_rfid': return 'Barcode & RFID Integration';
      case 'books': return 'Book Inventory Management';
      case 'search': return 'Search Book Catalog';
      case 'issue': return 'Issue Book Transaction';
      case 'return': return 'Return Book Processing';
      case 'queue': return 'Waiting Queue (FIFO)';
      case 'transactions': return 'Transaction Audit Log';
      case 'ds_visualizer': return 'Data Structures Visualizer';
      case 'students': return 'Student Registry';
      case 'reports': return 'Reports & Analytics';
      case 'admin': return 'System Admin Panel';
      default: return 'Library System';
    }
  };

  const totalCopies = books.reduce((acc, b) => acc + b.quantity, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const waitingCount = queue.filter(q => q.status === 'Waiting').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              {getTitle()}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              Overview of book inventory and pending transactions.
            </p>
          </div>
        </div>

        {/* Right Section / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick RFID/Barcode Hub Button */}
          <button
            onClick={() => setActiveTab('barcode_rfid')}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-semibold hover:bg-amber-500/20 transition-colors shadow-sm"
          >
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>RFID / Barcode</span>
          </button>

          {/* Search Book Quick Button */}
          <button
            onClick={() => setActiveTab('search')}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search Book</span>
          </button>

          {/* Add New Book Primary Button */}
          <button
            onClick={() => setActiveTab('books')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none transition-all"
          >
            <span>+ Add New Book</span>
          </button>

          {/* Offline Sync Status Badge & Manager */}
          <OfflineSyncBadge />

          {/* Quick Stats Pill */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-300">
              Avail: <strong className="text-emerald-600 dark:text-emerald-400">{availableCopies}</strong>/{totalCopies}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-600 dark:text-slate-300">
              Queue: <strong className="text-blue-600 dark:text-blue-400">{waitingCount}</strong>
            </span>
          </div>

          {/* Viva Banner Toggle Button */}
          <button
            onClick={onToggleVivaBanner}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showVivaBanner
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Viva Guidance</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetAllData}
            title="Reset to Initial Demo Data"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
