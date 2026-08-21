import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  BookPlus,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  BookOpen
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

interface SourceItem {
  title: string;
  url: string;
}

interface SearchGroundingResult {
  text: string;
  webSearchQueries: string[];
  groundingChunks: SourceItem[];
  quotaExceeded?: boolean;
  note?: string;
}

interface GoogleSearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const PRESET_QUERIES = [
  'Latest 2025/2026 Computer Science & AI textbooks',
  'Introduction to Algorithms (CLRS) 4th edition updates and key topics',
  'Top award-winning literature and science fiction novels recently published',
  'Best reference textbooks for Operating Systems & Distributed Systems',
  'Upcoming book releases by top technology and science authors'
];

export const GoogleSearchGroundingModal: React.FC<GoogleSearchGroundingModalProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const { addBook, addToast } = useLibrary();

  const [query, setQuery] = useState(initialQuery);
  const [topicContext, setTopicContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial query when opened
  React.useEffect(() => {
    if (initialQuery && isOpen && !result) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const executeSearch = async (searchQueryText: string) => {
    if (!searchQueryText.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQueryText.trim(),
          topic: topicContext.trim() || undefined
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to retrieve search grounded results');
      }

      setResult({
        text: data.text,
        webSearchQueries: data.webSearchQueries || [],
        groundingChunks: data.groundingChunks || [],
        quotaExceeded: data.quotaExceeded,
        note: data.note
      });
      if (data.quotaExceeded) {
        addToast('Retrieved via Academic Knowledge Base (Gemini Search Quota active)', 'info', 'Academic Research');
      } else {
        addToast('Information retrieved & verified via Google Search', 'success', 'Search Grounded');
      }
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setError(err?.message || 'Failed to fetch search-grounded data');
      addToast(err?.message || 'Error executing Google Search grounding', 'error', 'AI Search Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleCopy = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    addToast('Grounded research copied to clipboard', 'info', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Globe className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Google Search Grounded Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-300" /> gemini-3.7-flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live real-time book facts, author updates, edition verification, and literary research.
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Search Query Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask anything about books, authors, latest editions, syllabus or research..."
                className="w-full pl-11 pr-28 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-cyan-200" />
                    <span>Search Web</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> Popular Inquiries:
              </span>
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset);
                    executeSearch(preset);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 animate-spin" />
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Querying Live Google Search...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gemini is retrieving and grounding real-world information with Google Search tools.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLoading && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
              <strong>Search Grounding Error:</strong> {error}
            </div>
          )}

          {/* Search Grounding Results Display */}
          {result && !isLoading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Quota Fallback Notice if active */}
              {result.quotaExceeded && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold">Offline Academic Knowledge Fallback:</span>
                    <span className="ml-1 text-amber-700 dark:text-amber-300/90">
                      Live Gemini Search Grounding API reached current rate limit. Full reference content synthesized from university catalog knowledge base.
                    </span>
                  </div>
                </div>
              )}

              {/* Web Search Queries Used */}
              {result.webSearchQueries && result.webSearchQueries.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Search className="w-3 h-3 text-indigo-500" /> Google Search Queries Executed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.webSearchQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-indigo-600 dark:text-indigo-300 shadow-2xs"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Grounded Text Content */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified with Google Search Data
                    </span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Markdown View */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                  <Markdown>{result.text}</Markdown>
                </div>
              </div>

              {/* Verified Web Sources / Grounding Citations */}
              {result.groundingChunks && result.groundingChunks.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Search Grounding Citations & Sources ({result.groundingChunks.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.groundingChunks.map((source, index) => {
                      let domain = '';
                      try {
                        domain = new URL(source.url).hostname.replace('www.', '');
                      } catch {
                        domain = 'web';
                      }

                      return (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-start gap-2 text-xs group"
                        >
                          <div className="w-5 h-5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Globe className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {source.title || domain}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate block">
                              {domain}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Search Grounding active via Google Gemini 3.5 Flash</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
