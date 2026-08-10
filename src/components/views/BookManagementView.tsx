import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, Category } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  Layers,
  MapPin,
  Barcode
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Computer Science',
  'Data Structures',
  'Mathematics',
  'Electrical',
  'Literature',
  'Physics',
  'Management'
];

export const BookManagementView: React.FC = () => {
  const { books, addBook, updateBook, deleteBook, setActiveTab } = useLibrary();

  // Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'author' | 'copies' | 'year'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Book, 'status'>>({
    id: '',
    title: '',
    author: '',
    category: 'Computer Science',
    isbn: '',
    publicationYear: 2024,
    quantity: 5,
    availableCopies: 5,
    coverUrl: '',
    locationRack: 'A1-R01'
  });

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      id: 'BK-' + Math.floor(100 + Math.random() * 900),
      title: '',
      author: '',
      category: 'Data Structures',
      isbn: '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
      publicationYear: 2024,
      quantity: 5,
      availableCopies: 5,
      coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
      locationRack: 'A1-R01'
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      quantity: book.quantity,
      availableCopies: book.availableCopies,
      coverUrl: book.coverUrl || '',
      locationRack: book.locationRack || 'A1-R01'
    });
    setIsAddEditOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.id) {
      alert('Please fill out required fields (ID, Title, Author)');
      return;
    }

    if (editingBook) {
      updateBook({
        ...formData,
        status: formData.availableCopies === 0 ? 'Out of Stock' : formData.availableCopies <= 1 ? 'Low Stock' : 'Available'
      });
    } else {
      addBook(formData);
    }
    setIsAddEditOpen(false);
  };

  // Filter and Sort Logic
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        const matchesSearch =
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.isbn.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat = selectedCategory === 'ALL' || book.category === selectedCategory;

        const matchesAvail =
          selectedAvailability === 'ALL' ||
          (selectedAvailability === 'AVAILABLE' && book.availableCopies > 0) ||
          (selectedAvailability === 'OUT_OF_STOCK' && book.availableCopies === 0) ||
          (selectedAvailability === 'LOW_STOCK' && book.availableCopies === 1);

        return matchesSearch && matchesCat && matchesAvail;
      })
      .sort((a, b) => {
        let valA: string | number = a.id;
        let valB: string | number = b.id;

        if (sortBy === 'title') {
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
        } else if (sortBy === 'author') {
          valA = a.author.toLowerCase();
          valB = b.author.toLowerCase();
        } else if (sortBy === 'copies') {
          valA = a.availableCopies;
          valB = b.availableCopies;
        } else if (sortBy === 'year') {
          valA = a.publicationYear;
          valB = b.publicationYear;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [books, searchTerm, selectedCategory, selectedAvailability, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Book Inventory ({filteredBooks.length} Total)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manipulate records stored in the primary Array structure & Linked List nodes
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Author, or ISBN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter & Sort */}
          <div className="flex gap-2">
            <select
              value={selectedAvailability}
              onChange={e => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available Only</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              title="Toggle Sort Order"
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors flex items-center justify-center shrink-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Book Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">ISBN / Rack</th>
                <th className="p-4">Year</th>
                <th className="p-4">Copies (Avail/Total)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No books matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBooks.map(book => (
                  <tr
                    key={book.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{book.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">By {book.author}</div>
                          <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {book.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant="indigo">{book.category}</Badge>
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{book.isbn}</div>
                      <div className="text-slate-400 text-[10px]">Rack: <strong className="text-blue-600 dark:text-blue-400">{book.locationRack || 'A1'}</strong></div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 truncate max-w-[120px]" title={`RFID: ${book.rfidTag}`}>
                        RFID: {book.rfidTag}
                      </div>
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
                      {book.publicationYear}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {book.availableCopies} <span className="text-slate-400 font-normal">/ {book.quantity}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          book.status === 'Available'
                            ? 'success'
                            : book.status === 'Low Stock'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {book.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingBook(book)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(book)}
                        title="Edit Book"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                            deleteBook(book.id);
                          }
                        }}
                        title="Delete Book"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingBook ? `Edit Book (${editingBook.id})` : 'Add New Book to Inventory'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Book ID *
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                disabled={!!editingBook}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Author *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                ISBN Code
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Pub Year
              </label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={e => setFormData({ ...formData, publicationYear: parseInt(e.target.value) || 2024 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Total Qty
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => {
                  const qty = parseInt(e.target.value) || 1;
                  setFormData({ ...formData, quantity: qty, availableCopies: Math.min(formData.availableCopies, qty) });
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Available
              </label>
              <input
                type="number"
                min="0"
                max={formData.quantity}
                value={formData.availableCopies}
                onChange={e => setFormData({ ...formData, availableCopies: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Rack Location
              </label>
              <input
                type="text"
                value={formData.locationRack}
                onChange={e => setFormData({ ...formData, locationRack: e.target.value })}
                placeholder="e.g. A1-R02"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                value={formData.coverUrl}
                onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30"
            >
              {editingBook ? 'Save Changes' : 'Add Book Node'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Book Details Modal */}
      <Modal
        isOpen={!!viewingBook}
        onClose={() => setViewingBook(null)}
        title="Book Profile & Memory Details"
      >
        {viewingBook && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-24 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600">
                {viewingBook.coverUrl ? (
                  <img src={viewingBook.coverUrl} alt={viewingBook.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Badge variant="indigo">{viewingBook.category}</Badge>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{viewingBook.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">By {viewingBook.author}</p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>ID: {viewingBook.id}</span>
                  <span>•</span>
                  <span>ISBN: {viewingBook.isbn}</span>
                  <span>•</span>
                  <span>Pub: {viewingBook.publicationYear}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <div className="text-xs text-slate-400 font-mono">Total Stock</div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">{viewingBook.quantity}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Available</div>
                <div className="font-extrabold text-emerald-700 dark:text-emerald-300 text-lg">{viewingBook.availableCopies}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <div className="text-xs text-slate-400 font-mono">Rack Location</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {viewingBook.locationRack || 'Main Shelf'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
              <div className="font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Data Structures Representation:
              </div>
              <p>• Array Slot Index: Internal contiguous memory block</p>
              <p>• Linked List Node Address: 0x{Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setViewingBook(null);
                  setActiveTab('issue');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
              >
                Issue This Book
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
