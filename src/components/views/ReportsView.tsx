import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Layers } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { books, transactions, queue } = useLibrary();

  // 1. Available vs Issued copies
  const totalQty = books.reduce((acc, b) => acc + b.quantity, 0);
  const totalAvail = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const totalIssued = totalQty - totalAvail;

  const availVsIssuedData = [
    { name: 'Available Copies', value: totalAvail, color: '#10b981' },
    { name: 'Issued Loans', value: totalIssued, color: '#3b82f6' }
  ];

  // 2. Category-wise books count
  const categoryCounts: Record<string, { total: number; avail: number }> = {};
  books.forEach(b => {
    if (!categoryCounts[b.category]) {
      categoryCounts[b.category] = { total: 0, avail: 0 };
    }
    categoryCounts[b.category].total += b.quantity;
    categoryCounts[b.category].avail += b.availableCopies;
  });

  const categoryData = Object.entries(categoryCounts).map(([cat, stats]) => ({
    category: cat.length > 12 ? cat.substring(0, 10) + '...' : cat,
    Total: stats.total,
    Available: stats.avail,
    Issued: stats.total - stats.avail
  }));

  // 3. Most issued books (from transactions count)
  const bookTxnCount: Record<string, { title: string; count: number }> = {};
  transactions.forEach(t => {
    if (!bookTxnCount[t.bookId]) {
      bookTxnCount[t.bookId] = { title: t.bookTitle, count: 0 };
    }
    bookTxnCount[t.bookId].count += 1;
  });

  const mostIssuedData = Object.values(bookTxnCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => ({
      title: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
      Loans: item.count
    }));

  // 4. Daily transactions mock/trend
  const dailyTxnData = [
    { day: 'Mon', Issues: 4, Returns: 3 },
    { day: 'Tue', Issues: 6, Returns: 2 },
    { day: 'Wed', Issues: 8, Returns: 5 },
    { day: 'Thu', Issues: 5, Returns: 4 },
    { day: 'Fri', Issues: 9, Returns: 6 },
    { day: 'Sat', Issues: 3, Returns: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analytics & System Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing inventory metrics, loan distribution, and queue backlog trends.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Available vs Issued Donut */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-500" />
            Inventory Status (Available vs Issued)
          </h4>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={availVsIssuedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {availVsIssuedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Books Count by Category
          </h4>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="category" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Issued" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Most Issued Books */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            Most Demanded / Issued Books
          </h4>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostIssuedData} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={10} />
                <YAxis dataKey="title" type="category" stroke="#888888" fontSize={10} width={110} />
                <Tooltip />
                <Bar dataKey="Loans" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Transactions Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Daily Transaction Activity Trend
          </h4>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTxnData}>
                <XAxis dataKey="day" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Issues" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Returns" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
