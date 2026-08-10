import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import {
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Users,
  Clock,
  History,
  GraduationCap,
  Download,
  Upload,
  Cpu,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { books, students, transactions, queue, resetAllData, setActiveTab, addToast } = useLibrary();

  const [expandedQaIndex, setExpandedQaIndex] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: 'Q1. How is the Array Data Structure used in this Library Management System?',
      a: 'Arrays store master book records and student profiles in contiguous memory locations. They provide O(1) constant time direct indexed access. Sequential operations like scanning and filtering operate in O(N) linear time.'
    },
    {
      q: 'Q2. Why use a Linked List for Book Inventory Management?',
      a: 'A Linked List dynamically manages book inventory nodes without fixed memory reallocation. Insertion at the Head is achieved in O(1) time without shifting elements, making it ideal for frequent additions and deletions.'
    },
    {
      q: 'Q3. Explain the First-In-First-Out (FIFO) Queue implementation for book waiting requests.',
      a: 'When a book has 0 available copies, student requests are pushed (Enqueued) to the REAR of the Queue. When a book is returned or processed, the FRONT item is Dequeued and allocated the book. Both Enqueue and Dequeue run in O(1) time.'
    },
    {
      q: 'Q4. What is the Time and Space Complexity of Searching a book by ID?',
      a: 'Linear search across un-indexed fields is O(N). If sorted by Book ID, Binary Search achieves O(log N) time complexity. Space complexity for stored records is O(N).'
    },
    {
      q: 'Q5. How does state persistence work across page refreshes in this app?',
      a: 'All Array collections, Linked List node data, and Queue states are synchronized into client-side LocalStorage in JSON format, ensuring data persistence without requiring external database server dependencies.'
    }
  ];

  const exportBackup = () => {
    const data = { books, students, transactions, queue };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library_ds_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Exported Library Data JSON Backup', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-indigo-800/50 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">System Admin Panel</h3>
            <p className="text-xs text-slate-300">
              System controls, data backup/restore, and Data Structures viva defense materials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON
          </button>
          <button
            onClick={resetAllData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Data
          </button>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('books')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-mono font-bold text-slate-400">{books.length} Books</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
            Book Inventory
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Array & Linked List Storage</p>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-400">{students.length} Members</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
            Student Registry
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Member Directory</p>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-mono font-bold text-slate-400">
              {queue.filter(q => q.status === 'Waiting').length} Pending
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
            Queue Manager
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">FIFO Book Waitlists</p>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <History className="w-5 h-5 text-sky-500" />
            <span className="text-xs font-mono font-bold text-slate-400">{transactions.length} Logs</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
            Audit Trail
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Transaction History</p>
        </button>
      </div>

      {/* Data Structures Viva Defense Q&A Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              College Viva & Defense Cheat Sheet (Data Structures)
            </h3>
          </div>
          <Badge variant="indigo">5 Core Questions</Badge>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((qa, index) => {
            const isExpanded = expandedQaIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedQaIndex(isExpanded ? null : index)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3 text-left font-bold text-sm text-slate-900 dark:text-slate-100"
                >
                  <span>{qa.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 py-3.5 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {qa.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
