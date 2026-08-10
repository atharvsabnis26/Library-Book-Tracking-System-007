import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  History,
  Cpu,
  Users,
  BarChart3,
  ShieldCheck,
  Library,
  Layers,
  ChevronRight,
  Radio,
  Scan,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, queue } = useLibrary();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, dsBadge: 'Overview' },
    { id: 'barcode_rfid', label: 'Barcode & RFID Hub', icon: Radio, dsBadge: 'Auto-ID', highlight: true },
    { id: 'books', label: 'Book Management', icon: BookOpen, dsBadge: 'Array / LL' },
    { id: 'search', label: 'Search Book', icon: Search, dsBadge: 'Binary Search' },
    { id: 'issue', label: 'Issue Book', icon: ArrowUpRight, dsBadge: 'Transaction' },
    { id: 'return', label: 'Return Book', icon: ArrowDownLeft, dsBadge: 'Update' },
    {
      id: 'queue',
      label: 'Waiting Queue',
      icon: Clock,
      dsBadge: 'FIFO Queue',
      counter: queue.filter(q => q.status === 'Waiting').length
    },
    { id: 'transactions', label: 'Transaction History', icon: History, dsBadge: 'Audit Log' },
    { id: 'ds_visualizer', label: 'DS Visualizer', icon: Cpu, dsBadge: 'Interactive' },
    { id: 'students', label: 'Student Management', icon: Users, dsBadge: 'Array' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, dsBadge: 'Charts' },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, dsBadge: 'Control' }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1e293b] text-slate-300 border-r border-slate-800 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">LibroTrack</h1>
              <p className="text-[11px] text-blue-400 font-medium flex items-center gap-1 mt-1">
                <Layers className="w-3 h-3" /> DS College System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                    : item.highlight
                    ? 'bg-blue-950/40 text-blue-400 hover:bg-slate-800 border border-blue-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-blue-400'
                        : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.counter !== undefined && item.counter > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {item.counter}
                    </span>
                  )}
                  {item.dsBadge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isActive
                          ? 'bg-blue-800/80 text-blue-100 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.dsBadge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Info / System Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/40">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-blue-600/80 flex items-center justify-center font-bold text-xs text-white shrink-0">
              AU
            </div>
            <div className="text-xs min-w-0">
              <p className="text-white font-medium truncate">Admin User</p>
              <p className="text-slate-400 text-[11px] truncate">System Manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
