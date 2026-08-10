import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import {
  Cpu,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Search,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Code,
  Sparkles,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DSVisualizerView: React.FC = () => {
  const { books, queue } = useLibrary();

  const [activeDsTab, setActiveDsTab] = useState<'ARRAY' | 'LINKED_LIST' | 'QUEUE'>('ARRAY');

  // Interactive Array Visualizer State
  const [arrayData, setArrayData] = useState<string[]>([
    'BK-101 (Data Struct)',
    'BK-102 (Algo CLRS)',
    'BK-103 (Clean Code)',
    'BK-104 (Maths)',
    'BK-105 (Electric)'
  ]);
  const [arraySearchKey, setArraySearchKey] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [arrayInsertValue, setArrayInsertValue] = useState('');
  const [arrayLog, setArrayLog] = useState<string[]>([
    'Initialized Contiguous Array Memory Block with 5 elements (Capacity: 8).'
  ]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Interactive Linked List Visualizer State
  const [llNodes, setLlNodes] = useState<{ id: string; label: string; address: string }[]>([
    { id: 'LL-1', label: 'BK-101 (Weiss C++)', address: '0x10A2' },
    { id: 'LL-2', label: 'BK-102 (Cormen Algo)', address: '0x2B4F' },
    { id: 'LL-3', label: 'BK-103 (Clean Code)', address: '0x3C81' }
  ]);
  const [llActiveNodeId, setLlActiveNodeId] = useState<string | null>(null);
  const [llNewVal, setLlNewVal] = useState('');
  const [llLog, setLlLog] = useState<string[]>([
    'Linked List initialized with 3 nodes connected sequentially via next pointers.'
  ]);

  // Interactive Queue Visualizer State
  const [queueItems, setQueueItems] = useState<{ id: string; student: string; book: string }[]>([
    { id: 'Q-1', student: 'Aarav Sharma', book: 'Clean Code' },
    { id: 'Q-2', student: 'Priya Patel', book: 'CLRS Algorithms' },
    { id: 'Q-3', student: 'Rohan Verma', book: 'Data Structures' }
  ]);
  const [queueStudent, setQueueStudent] = useState('');
  const [queueBook, setQueueBook] = useState('Data Structures');
  const [queueLog, setQueueLog] = useState<string[]>([
    'FIFO Queue online. Front pointer at Q-1, Rear pointer at Q-3.'
  ]);

  // Array Handlers
  const handleArrayLinearSearch = async () => {
    if (!arraySearchKey || isAnimating) return;
    setIsAnimating(true);
    setFoundIndex(null);
    setArrayLog(prev => [...prev, `🔍 Initiating Linear Search for "${arraySearchKey}"...`]);

    let found = false;
    for (let i = 0; i < arrayData.length; i++) {
      setHighlightedIndex(i);
      setArrayLog(prev => [...prev, `Step ${i + 1}: Checking Array[${i}] = "${arrayData[i]}"`]);
      await new Promise(r => setTimeout(r, 600));

      if (arrayData[i].toLowerCase().includes(arraySearchKey.toLowerCase())) {
        setFoundIndex(i);
        setArrayLog(prev => [...prev, `✅ MATCH FOUND at index [${i}] in ${i + 1} comparisons! (Time Complexity: O(N))`]);
        found = true;
        break;
      }
    }

    if (!found) {
      setArrayLog(prev => [...prev, `❌ Element "${arraySearchKey}" not found in array.`]);
    }
    setHighlightedIndex(null);
    setIsAnimating(false);
  };

  const handleArrayPush = () => {
    if (!arrayInsertValue) return;
    if (arrayData.length >= 8) {
      alert('Array Capacity reached (8 slots)!');
      return;
    }
    const newVal = arrayInsertValue;
    setArrayData(prev => [...prev, newVal]);
    setArrayInsertValue('');
    setArrayLog(prev => [...prev, `➕ Appended "${newVal}" at index [${arrayData.length}] (O(1) amortized time)`]);
  };

  const handleArrayDeleteAt = (index: number) => {
    const val = arrayData[index];
    setArrayData(prev => prev.filter((_, i) => i !== index));
    setArrayLog(prev => [...prev, `🗑️ Deleted index [${index}] ("${val}"). Shifted subsequent elements leftward (O(N) time).`]);
  };

  // Linked List Handlers
  const handleLlInsertHead = () => {
    if (!llNewVal) return;
    const newAddress = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase();
    const newNode = {
      id: 'LL-' + Math.floor(Math.random() * 1000),
      label: llNewVal,
      address: newAddress
    };
    setLlNodes(prev => [newNode, ...prev]);
    setLlNewVal('');
    setLlLog(prev => [...prev, `➕ Inserted Head Node [${newNode.label}] at address ${newAddress} (Time Complexity: O(1))`]);
  };

  const handleLlInsertTail = () => {
    if (!llNewVal) return;
    const newAddress = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase();
    const newNode = {
      id: 'LL-' + Math.floor(Math.random() * 1000),
      label: llNewVal,
      address: newAddress
    };
    setLlNodes(prev => [...prev, newNode]);
    setLlNewVal('');
    setLlLog(prev => [...prev, `➕ Appended Tail Node [${newNode.label}] at address ${newAddress} (Time Complexity: O(N) or O(1) with tail ptr)`]);
  };

  const handleLlDelete = (id: string) => {
    const target = llNodes.find(n => n.id === id);
    setLlNodes(prev => prev.filter(n => n.id !== id));
    setLlLog(prev => [...prev, `🗑️ Deleted Node [${target?.label || id}]. Pointers re-linked (O(N) search + O(1) pointer swap).`]);
  };

  const handleLlTraverse = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLlLog(prev => [...prev, `🚀 Traversing Linked List nodes sequentially from Head to NULL...`]);

    for (let i = 0; i < llNodes.length; i++) {
      setLlActiveNodeId(llNodes[i].id);
      setLlLog(prev => [...prev, `Visiting Node #${i + 1} (Addr: ${llNodes[i].address}) -> Data: "${llNodes[i].label}"`]);
      await new Promise(r => setTimeout(r, 600));
    }
    setLlActiveNodeId(null);
    setLlLog(prev => [...prev, `Reached NULL pointer. Traversal complete.`]);
    setIsAnimating(false);
  };

  // Queue Handlers
  const handleEnqueue = () => {
    if (!queueStudent) return;
    const newItem = {
      id: 'Q-' + Math.floor(100 + Math.random() * 900),
      student: queueStudent,
      book: queueBook
    };
    setQueueItems(prev => [...prev, newItem]);
    setQueueStudent('');
    setQueueLog(prev => [...prev, `📥 ENQUEUE: Pushed "${newItem.student}" to REAR of FIFO Queue (O(1) time)`]);
  };

  const handleDequeue = () => {
    if (queueItems.length === 0) {
      alert('Queue is empty!');
      return;
    }
    const front = queueItems[0];
    setQueueItems(prev => prev.slice(1));
    setQueueLog(prev => [...prev, `📤 DEQUEUE: Served FRONT item "${front.student}" for book "${front.book}" (O(1) time)`]);
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-2xl p-6 sm:p-8 border border-indigo-800/60 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Interactive Viva Visualizer
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Data Structures Demonstration</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Visualize contiguous memory arrays, node pointer chains in linked lists, and FIFO queue front/rear pointers in real-time.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
            {[
              { id: 'ARRAY', label: '1. ARRAY' },
              { id: 'LINKED_LIST', label: '2. LINKED LIST' },
              { id: 'QUEUE', label: '3. QUEUE' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDsTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDsTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------- TAB 1: ARRAY VISUALIZER ----------------- */}
      {activeDsTab === 'ARRAY' && (
        <div className="space-y-6">
          {/* Controls & Operations Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Array Data Structure Operations
              </h3>
              <div className="flex items-center gap-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                <Badge variant="indigo">Access: O(1)</Badge>
                <Badge variant="amber">Search: O(N)</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Insert Operation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Push / Insert Book Record
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={arrayInsertValue}
                    onChange={e => setArrayInsertValue(e.target.value)}
                    placeholder="Book title or ID..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleArrayPush}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow shrink-0"
                  >
                    Insert
                  </button>
                </div>
              </div>

              {/* Search Operation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Linear Search in Array
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={arraySearchKey}
                    onChange={e => setArraySearchKey(e.target.value)}
                    placeholder="Search query..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleArrayLinearSearch}
                    disabled={isAnimating}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow shrink-0 flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Contiguous Array Memory Blocks */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between">
              <span>Contiguous Memory Representation (Base Addr: 0x2000)</span>
              <span className="text-xs text-slate-400 font-mono">Length: {arrayData.length} / 8</span>
            </h4>

            {/* Array Cells Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, idx) => {
                const value = arrayData[idx];
                const isCurrent = highlightedIndex === idx;
                const isFound = foundIndex === idx;

                return (
                  <motion.div
                    key={idx}
                    animate={isCurrent ? { scale: 1.05 } : { scale: 1 }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between min-h-[110px] ${
                      isFound
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-300'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 ring-4 ring-amber-300 animate-pulse'
                        : value
                        ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70">
                      Index [{idx}]
                    </div>

                    <div className="font-bold text-xs py-2 truncate px-1">
                      {value ? value : <span className="text-slate-300 dark:text-slate-700 italic">EMPTY</span>}
                    </div>

                    <div className="text-[9px] font-mono opacity-60">
                      0x{(0x2000 + idx * 4).toString(16).toUpperCase()}
                    </div>

                    {value && !isAnimating && (
                      <button
                        onClick={() => handleArrayDeleteAt(idx)}
                        className="mt-1 text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Operation Execution Log */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Execution Log Output
              </span>
              <button onClick={() => setArrayLog([])} className="text-[10px] text-slate-400 hover:text-white">
                Clear Log
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {arrayLog.map((log, i) => (
                <div key={i} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: LINKED LIST VISUALIZER ----------------- */}
      {activeDsTab === 'LINKED_LIST' && (
        <div className="space-y-6">
          {/* Operations Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Singly Linked List Node Management
              </h3>
              <div className="flex items-center gap-2 font-mono text-xs">
                <Badge variant="indigo">Insert Head: O(1)</Badge>
                <Badge variant="amber">Traversal: O(N)</Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={llNewVal}
                onChange={e => setLlNewVal(e.target.value)}
                placeholder="New Book Node Title..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleLlInsertHead}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
              >
                Insert Head O(1)
              </button>
              <button
                onClick={handleLlInsertTail}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow"
              >
                Append Tail
              </button>
              <button
                onClick={handleLlTraverse}
                disabled={isAnimating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" /> Traverse Nodes
              </button>
            </div>
          </div>

          {/* Linked List Visual Pointer Diagram */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <div className="min-w-max flex items-center gap-4 py-4">
              <div className="px-3 py-2 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono text-xs font-bold shrink-0">
                HEAD ➔
              </div>

              {llNodes.map((node, index) => {
                const isActive = llActiveNodeId === node.id;
                const nextAddr = index < llNodes.length - 1 ? llNodes[index + 1].address : 'NULL';

                return (
                  <React.Fragment key={node.id}>
                    {index > 0 && <ArrowRight className="w-5 h-5 text-indigo-500 shrink-0" />}

                    <motion.div
                      animate={isActive ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
                      className={`p-4 rounded-2xl border min-w-[180px] shadow-md transition-all flex flex-col justify-between space-y-2 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-300 shadow-amber-500/30'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {node.address}
                        </span>
                        <button
                          onClick={() => handleLlDelete(node.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="font-bold text-xs py-1 leading-snug">{node.label}</div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">next:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{nextAddr}</span>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}

              <ArrowRight className="w-5 h-5 text-indigo-500 shrink-0" />
              <div className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold shrink-0">
                NULL
              </div>
            </div>
          </div>

          {/* Log Output */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Linked List Step Log
              </span>
              <button onClick={() => setLlLog([])} className="text-[10px] text-slate-400 hover:text-white">
                Clear Log
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {llLog.map((log, i) => (
                <div key={i} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: QUEUE VISUALIZER ----------------- */}
      {activeDsTab === 'QUEUE' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                First-In-First-Out (FIFO) Queue
              </h3>
              <div className="flex items-center gap-2 font-mono text-xs">
                <Badge variant="amber">Enqueue: O(1)</Badge>
                <Badge variant="success">Dequeue: O(1)</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={queueStudent}
                onChange={e => setQueueStudent(e.target.value)}
                placeholder="Student Name..."
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={queueBook}
                onChange={e => setQueueBook(e.target.value)}
                placeholder="Book Requested..."
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleEnqueue}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
              >
                Enqueue (Push REAR)
              </button>
            </div>
          </div>

          {/* Queue Lane Diagram */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Queue Buffer (FRONT ➔ REAR)
              </h4>
              <button
                onClick={handleDequeue}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Dequeue FRONT (Process Request)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[120px] flex items-center overflow-x-auto gap-3">
              {queueItems.length === 0 ? (
                <div className="w-full text-center text-slate-500 font-mono text-xs">
                  [QUEUE EMPTY] Enqueue items to demonstrate FIFO behavior.
                </div>
              ) : (
                queueItems.map((item, idx) => {
                  const isFront = idx === 0;
                  const isRear = idx === queueItems.length - 1;

                  return (
                    <React.Fragment key={item.id}>
                      {idx > 0 && <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />}

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`p-4 rounded-2xl border min-w-[160px] text-white shrink-0 relative flex flex-col justify-between space-y-1 ${
                          isFront
                            ? 'bg-amber-950 border-amber-500 ring-2 ring-amber-400'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-amber-400 font-bold">Pos #{idx + 1}</span>
                          {isFront && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-extrabold uppercase">
                              FRONT
                            </span>
                          )}
                          {isRear && !isFront && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white font-extrabold uppercase">
                              REAR
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-xs text-slate-100">{item.student}</div>
                        <div className="text-[10px] text-slate-400">{item.book}</div>
                      </motion.div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          {/* Queue Log */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4" /> FIFO Queue Log
              </span>
              <button onClick={() => setQueueLog([])} className="text-[10px] text-slate-400 hover:text-white">
                Clear Log
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {queueLog.map((log, i) => (
                <div key={i} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
