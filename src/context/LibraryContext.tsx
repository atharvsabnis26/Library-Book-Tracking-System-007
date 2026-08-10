import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, Student, Transaction, WaitingQueueItem, NotificationToast } from '../types';
import { loadStoredData, saveStoredData, resetStoredData } from '../utils/storage';
import { LinkedList } from '../ds/LinkedListDS';
import { Queue } from '../ds/QueueDS';
import { useOfflineSync } from './OfflineSyncContext';

interface LibraryContextType {
  books: Book[];
  students: Student[];
  transactions: Transaction[];
  queue: WaitingQueueItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  // Quick Actions & CRUD
  addBook: (book: Omit<Book, 'status'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  
  addStudent: (student: Omit<Student, 'issuedCount'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  
  // Workflows
  issueBook: (studentId: string, bookId: string, customIssueDate?: string, customDueDate?: string) => { success: boolean; message: string; joinedQueue?: boolean };
  returnBook: (transactionId: string) => { success: boolean; message: string; autoIssuedTo?: string };
  addToWaitingQueue: (studentId: string, bookId: string) => { success: boolean; message: string; position: number };
  removeFromQueue: (queueId: string) => void;
  processQueueForBook: (bookId: string) => { success: boolean; message: string };
  
  // Data reset
  resetAllData: () => void;
  
  // Toast notifications
  toasts: NotificationToast[];
  addToast: (msg: string, type?: NotificationToast['type'], title?: string) => void;
  removeToast: (id: string) => void;
  
  // Data Structures Live Instances
  linkedListBooks: LinkedList<Book>;
  waitingQueueDS: Queue<WaitingQueueItem>;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => loadStoredData());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const { recordOfflineAction, effectiveIsOnline } = useOfflineSync();

  // Apply dark class to root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist to localStorage
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  const addToast = (message: string, type: NotificationToast['type'] = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Live Data Structure Instances
  const linkedListBooks = new LinkedList<Book>(data.books);
  const waitingQueueDS = new Queue<WaitingQueueItem>(data.queue);

  // Helper function to recalculate book status
  const calculateBookStatus = (available: number, total: number): Book['status'] => {
    if (available === 0) return 'Out of Stock';
    if (available <= 1) return 'Low Stock';
    return 'Available';
  };

  const addBook = (newBookData: Omit<Book, 'status'>) => {
    const status = calculateBookStatus(newBookData.availableCopies, newBookData.quantity);
    const generatedBarcode = newBookData.barcode || `BC-${newBookData.isbn ? newBookData.isbn.replace(/[^0-9]/g, '') : Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const generatedRfid = newBookData.rfidTag || `RFID-E200-${Math.floor(1000 + Math.random() * 9000)}-${newBookData.id.replace(/[^a-zA-Z0-9]/g, '')}`;

    const newBook: Book = {
      ...newBookData,
      barcode: generatedBarcode,
      rfidTag: generatedRfid,
      status
    };

    setData(prev => ({
      ...prev,
      books: [newBook, ...prev.books]
    }));

    recordOfflineAction('ADD_BOOK', `Added book "${newBook.title}" (ISBN: ${newBook.isbn})`, newBook);

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Book "${newBook.title}" added with Barcode (${generatedBarcode}) & RFID Tag (${generatedRfid})`, 'success', 'Book Added');
  };

  const updateBook = (updatedBook: Book) => {
    const status = calculateBookStatus(updatedBook.availableCopies, updatedBook.quantity);
    const bookWithStatus = { ...updatedBook, status };

    setData(prev => ({
      ...prev,
      books: prev.books.map(b => (b.id === updatedBook.id ? bookWithStatus : b))
    }));

    recordOfflineAction('UPDATE_BOOK', `Updated book "${updatedBook.title}"`, updatedBook);

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Updated book records for "${updatedBook.title}"`, 'info', 'Book Updated');
  };

  const deleteBook = (bookId: string) => {
    const book = data.books.find(b => b.id === bookId);
    setData(prev => ({
      ...prev,
      books: prev.books.filter(b => b.id !== bookId)
    }));

    recordOfflineAction('DELETE_BOOK', `Deleted book ID "${bookId}" (${book?.title || 'Unknown'})`, { bookId });

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Deleted "${book?.title || bookId}" from system`, 'warning', 'Book Removed');
  };

  const addStudent = (studentData: Omit<Student, 'issuedCount'>) => {
    const generatedBarcode = studentData.barcode || `BC-${studentData.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const generatedRfid = studentData.rfidCard || `RFID-CARD-${studentData.id.split('-').pop() || Math.floor(100 + Math.random() * 900)}`;

    const newStudent: Student = {
      ...studentData,
      barcode: generatedBarcode,
      rfidCard: generatedRfid,
      issuedCount: 0
    };
    setData(prev => ({
      ...prev,
      students: [newStudent, ...prev.students]
    }));

    recordOfflineAction('ADD_STUDENT', `Enrolled student "${newStudent.name}" (${newStudent.id})`, newStudent);

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Student "${newStudent.name}" enrolled with RFID Smart Card (${generatedRfid})`, 'success', 'Student Enrolled');
  };

  const updateStudent = (updatedStudent: Student) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => (s.id === updatedStudent.id ? updatedStudent : s))
    }));

    recordOfflineAction('UPDATE_STUDENT', `Updated student details for "${updatedStudent.name}"`, updatedStudent);

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Updated details for student ${updatedStudent.name}`, 'info');
  };

  const deleteStudent = (studentId: string) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));

    recordOfflineAction('DELETE_STUDENT', `Removed student ID ${studentId}`, { studentId });

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Removed student ID ${studentId}`, 'warning');
  };

  const issueBook = (studentId: string, bookId: string, customIssueDate?: string, customDueDate?: string) => {
    const book = data.books.find(b => b.id === bookId);
    const student = data.students.find(s => s.id === studentId);

    if (!book) {
      return { success: false, message: 'Book not found in database' };
    }
    if (!student) {
      return { success: false, message: 'Student ID not registered' };
    }

    if (book.availableCopies <= 0) {
      // Prompt join queue
      const qResult = addToWaitingQueue(studentId, bookId);
      return {
        success: false,
        joinedQueue: true,
        message: `Book "${book.title}" has 0 available copies. ${student.name} has been added to the Waiting Queue at Position #${qResult.position} (FIFO Queue).`
      };
    }

    const today = customIssueDate || new Date().toISOString().split('T')[0];
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    const dueDateStr = customDueDate || defaultDue.toISOString().split('T')[0];

    const newTxn: Transaction = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      studentId: student.id,
      studentName: student.name,
      bookId: book.id,
      bookTitle: book.title,
      type: 'Issue',
      issueDate: today,
      dueDate: dueDateStr,
      status: 'Active'
    };

    const newAvail = book.availableCopies - 1;
    const newStatus = calculateBookStatus(newAvail, book.quantity);

    setData(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === bookId ? { ...b, availableCopies: newAvail, status: newStatus } : b),
      students: prev.students.map(s => s.id === studentId ? { ...s, issuedCount: s.issuedCount + 1 } : s),
      transactions: [newTxn, ...prev.transactions]
    }));

    recordOfflineAction('ISSUE_BOOK', `Issued "${book.title}" to ${student.name}`, newTxn);

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Issued "${book.title}" to ${student.name}. Due date: ${dueDateStr}`, 'success', 'Book Issued');
    return { success: true, message: `${offlinePrefix}Successfully issued "${book.title}" to ${student.name}.` };
  };

  const returnBook = (transactionId: string) => {
    const txn = data.transactions.find(t => t.id === transactionId);
    if (!txn || txn.status === 'Returned') {
      return { success: false, message: 'Invalid or already returned transaction' };
    }

    const today = new Date().toISOString().split('T')[0];
    const book = data.books.find(b => b.id === txn.bookId);
    const student = data.students.find(s => s.id === txn.studentId);

    const updatedAvail = book ? book.availableCopies + 1 : 1;
    const updatedStatus = book ? calculateBookStatus(updatedAvail, book.quantity) : 'Available';

    let autoIssuedMsg = '';

    // Check if queue has a student waiting for this book!
    const queueWaiting = data.queue
      .filter(q => q.bookId === txn.bookId && q.status === 'Waiting')
      .sort((a, b) => a.position - b.position);

    let nextQueueItem: WaitingQueueItem | null = null;
    if (queueWaiting.length > 0) {
      nextQueueItem = queueWaiting[0];
    }

    setData(prev => {
      const newBooks = prev.books.map(b => b.id === txn.bookId ? { ...b, availableCopies: updatedAvail, status: updatedStatus } : b);
      const newStudents = prev.students.map(s => s.id === txn.studentId ? { ...s, issuedCount: Math.max(0, s.issuedCount - 1) } : s);
      const newTxns = prev.transactions.map(t => t.id === transactionId ? { ...t, status: 'Returned' as const, returnDate: today } : t);

      return {
        ...prev,
        books: newBooks,
        students: newStudents,
        transactions: newTxns
      };
    });

    if (nextQueueItem) {
      autoIssuedMsg = `Note: Student ${nextQueueItem.studentName} is FRONT of FIFO Queue for this book. You can process queue next!`;
    }

    recordOfflineAction('RETURN_BOOK', `Returned "${txn.bookTitle}" from ${txn.studentName}`, { transactionId, bookTitle: txn.bookTitle });

    const offlinePrefix = !effectiveIsOnline ? '[Offline Queued] ' : '';
    addToast(`${offlinePrefix}Book "${txn.bookTitle}" returned by ${txn.studentName}`, 'success', 'Book Returned');
    return { success: true, message: `Returned "${txn.bookTitle}". ${autoIssuedMsg}` };
  };

  const addToWaitingQueue = (studentId: string, bookId: string) => {
    const student = data.students.find(s => s.id === studentId);
    const book = data.books.find(b => b.id === bookId);

    const existingQueueForBook = data.queue.filter(q => q.bookId === bookId && q.status === 'Waiting');
    const position = existingQueueForBook.length + 1;

    const newItem: WaitingQueueItem = {
      id: 'Q-' + Math.floor(1000 + Math.random() * 9000),
      studentId: studentId,
      studentName: student?.name || 'Student (' + studentId + ')',
      studentEmail: student?.email || 'student@college.edu',
      bookId: bookId,
      bookTitle: book?.title || 'Book (' + bookId + ')',
      requestDate: new Date().toLocaleString(),
      status: 'Waiting',
      position
    };

    setData(prev => ({
      ...prev,
      queue: [...prev.queue, newItem]
    }));

    addToast(`Added ${newItem.studentName} to FIFO Waiting Queue for "${newItem.bookTitle}" at Position #${position}`, 'info', 'Enqueued Request');
    return { success: true, message: 'Added to waiting queue', position };
  };

  const removeFromQueue = (queueId: string) => {
    setData(prev => {
      const target = prev.queue.find(q => q.id === queueId);
      const filtered = prev.queue.filter(q => q.id !== queueId);
      
      // Recalculate queue positions for same book
      let posCounter = 1;
      const reindexed = filtered.map(q => {
        if (target && q.bookId === target.bookId && q.status === 'Waiting') {
          return { ...q, position: posCounter++ };
        }
        return q;
      });

      return { ...prev, queue: reindexed };
    });
    addToast('Removed request from FIFO queue', 'warning');
  };

  const processQueueForBook = (bookId: string) => {
    const book = data.books.find(b => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found' };

    const queueItems = data.queue
      .filter(q => q.bookId === bookId && q.status === 'Waiting')
      .sort((a, b) => a.position - b.position);

    if (queueItems.length === 0) {
      return { success: false, message: 'No waiting queue requests for this book.' };
    }

    const frontItem = queueItems[0]; // Dequeue FRONT

    if (book.availableCopies <= 0) {
      return { success: false, message: `Cannot fulfill queue: "${book.title}" currently has 0 available copies.` };
    }

    // Process issue for front item
    const res = issueBook(frontItem.studentId, frontItem.bookId);

    if (res.success) {
      // Update queue item status to Fulfilled
      setData(prev => ({
        ...prev,
        queue: prev.queue.map(q => q.id === frontItem.id ? { ...q, status: 'Fulfilled' } : q)
      }));
      addToast(`Processed FIFO Queue: Issued "${book.title}" to ${frontItem.studentName}`, 'success', 'Queue Processed (FIFO)');
      return { success: true, message: `Successfully dequeued and issued to ${frontItem.studentName}` };
    }

    return { success: false, message: res.message };
  };

  const resetAllData = () => {
    const fresh = resetStoredData();
    setData(fresh);
    addToast('All system data restored to initial state!', 'info', 'System Reset');
  };

  return (
    <LibraryContext.Provider
      value={{
        books: data.books,
        students: data.students,
        transactions: data.transactions,
        queue: data.queue,
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        addBook,
        updateBook,
        deleteBook,
        addStudent,
        updateStudent,
        deleteStudent,
        issueBook,
        returnBook,
        addToWaitingQueue,
        removeFromQueue,
        processQueueForBook,
        resetAllData,
        toasts,
        addToast,
        removeToast,
        linkedListBooks,
        waitingQueueDS
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
};
