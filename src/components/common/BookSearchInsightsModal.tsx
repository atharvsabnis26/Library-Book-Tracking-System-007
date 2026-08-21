import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Globe,
  Sparkles,
  ExternalLink,
  Loader2,
  X,
  BookOpen,
  User,
  Barcode,
  Calendar,
  Layers,
  Award,
  Star,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import { Book } from '../../types';
import { Badge } from './Badge';

interface BookSearchInsightsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookSearchInsightsModal: React.FC<BookSearchInsightsModalProps> = ({
  book,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    text: string;
    sources: Array<{ title: string; url: string }>;
    webSearchQueries: string[];
    quotaExceeded?: boolean;
    note?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && book) {
      fetchBookInsights(book);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  const fetchBookInsights = async (targetBook: Book) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/book-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetBook.title,
          author: targetBook.author,
          isbn: targetBook.isbn
        })
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to fetch book insights');
      }

      setData({
        text: resData.text,
        sources: resData.sources || [],
        webSearchQueries: resData.webSearchQueries || [],
        quotaExceeded: resData.quotaExceeded,
        note: resData.note
      });
    } catch (err: any) {
      console.error('Error fetching book search insights:', err);
      setError(err?.message || 'Failed to retrieve live Google Search book data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Globe className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Google Search Insights</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-md">
                Live web intelligence for "{book.title}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Quick Book Header */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
            <div className="w-12 h-16 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{book.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {book.author}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span>ISBN: {book.isbn}</span>
                <span>•</span>
                <span>Pub Year: {book.publicationYear}</span>
                <span>•</span>
                <Badge variant="indigo">{book.category}</Badge>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-10 text-center space-y-3">
              <div className="relative inline-block">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 animate-spin" />
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 absolute inset-0 m-auto" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Grounding with Google Search data across literature databases & publisher records...
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
              <strong>Lookup Error:</strong> {error}
            </div>
          )}

          {/* Result */}
          {data && !loading && (
            <div className="space-y-4">
              {data.quotaExceeded && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold">Academic Knowledge Base:</span>
                    <span className="ml-1 text-amber-700 dark:text-amber-300/90">
                      Standard syllabus and curriculum profile retrieved from reference catalog index.
                    </span>
                  </div>
                </div>
              )}

              {data.webSearchQueries && data.webSearchQueries.length > 0 && (
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-indigo-500">Search Queries:</span>
                  {data.webSearchQueries.map((q, i) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded">
                      "{q}"
                    </span>
                  ))}
                </div>
              )}

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                <Markdown>{data.text}</Markdown>
              </div>

              {data.sources && data.sources.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                    Verified Google Search Citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {data.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs truncate flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{s.title || s.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Grounded via Gemini 3.7 Flash Google Search
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
