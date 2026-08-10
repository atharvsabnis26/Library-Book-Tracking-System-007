import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import {
  Search,
  BookOpen,
  User,
  Barcode,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SearchBookView: React.FC = () => {
  const { books, setActiveTab, issueBook, addToWaitingQueue } = useLibrary();

  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ID' | 'TITLE' | 'AUTHOR' | 'ISBN' | 'CATEGORY'>('ALL');

  const results = books.filter(book => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();

    switch (filterMode) {
      case 'ID':
        return book.id.toLowerCase().includes(q);
      case 'TITLE':
        return book.title.toLowerCase().includes(q);
      case 'AUTHOR':
        return book.author.toLowerCase().includes(q);
      case 'ISBN':
        return book.isbn.toLowerCase().includes(q);
      case 'CATEGORY':
        return book.category.toLowerCase().includes(q);
      default:
        return (
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.id.toLowerCase().includes(q) ||
          book.isbn.toLowerCase().includes(q) ||
          book.category.toLowerCase().includes(q)
        );
    }
  });

  return (
    <div className="space-y-6">
      {/* Search Bar Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 border border-indigo-800/50 text-white shadow-xl">
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Instant Multi-Field Search Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Search Library Catalog</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Search across {books.length} book records indexed in contiguous memory arrays.
          </p>

          {/* Search Field & Filters */}
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type Book ID (e.g., BK-101), Title, Author, ISBN, or Category..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800/90 border border-indigo-500/40 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400/60 shadow-lg"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-mono mr-1">Search Field:</span>
              {[
                { id: 'ALL', label: 'All Fields' },
                { id: 'TITLE', label: 'Book Name' },
                { id: 'AUTHOR', label: 'Author' },
                { id: 'ID', label: 'Book ID' },
                { id: 'ISBN', label: 'ISBN' },
                { id: 'CATEGORY', label: 'Category' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFilterMode(item.id as any)}
                  className={`px-3 py-1 rounded-xl font-medium transition-all ${
                    filterMode === item.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Search Results</span>
          <Badge variant="indigo">{results.length} Found</Badge>
        </h3>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Results Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-500" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No Matching Books Found</h4>
            <p className="text-xs">Try searching with different terms or select "All Fields".</p>
          </div>
        ) : (
          results.map(book => (
            <div
              key={book.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-22 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="indigo">{book.category}</Badge>
                    <span className="text-xs font-mono text-slate-400 font-bold">{book.id}</span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {book.author}
                  </p>
                  <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5" /> ISBN: {book.isbn}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      book.status === 'Available'
                        ? 'success'
                        : book.status === 'Low Stock'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {book.availableCopies} of {book.quantity} Copies Left
                  </Badge>
                </div>

                <div>
                  {book.availableCopies > 0 ? (
                    <button
                      onClick={() => setActiveTab('issue')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Issue Book
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
                    >
                      <Clock className="w-3.5 h-3.5" /> Join Waitlist
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
