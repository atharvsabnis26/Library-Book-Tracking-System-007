export type Category = 
  | 'Computer Science' 
  | 'Data Structures' 
  | 'Mathematics' 
  | 'Electrical' 
  | 'Literature' 
  | 'Physics' 
  | 'Management';

export interface Book {
  id: string; // e.g. "BK-101"
  title: string;
  author: string;
  category: Category;
  isbn: string;
  publicationYear: number;
  quantity: number;
  availableCopies: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  coverUrl?: string;
  locationRack?: string;
  barcode?: string;
  rfidTag?: string;
}

export interface Student {
  id: string; // e.g. "STU-2024-001"
  name: string;
  email: string;
  department: string;
  phone: string;
  issuedCount: number;
  joinedDate: string;
  barcode?: string;
  rfidCard?: string;
}

export type TransactionType = 'Issue' | 'Return' | 'Queue_Request';
export type TransactionStatus = 'Active' | 'Returned' | 'Overdue' | 'Cancelled';

export interface Transaction {
  id: string; // e.g. "TXN-8091"
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  type: TransactionType;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: TransactionStatus;
  fineAmount?: number;
}

export interface WaitingQueueItem {
  id: string; // e.g. "Q-501"
  studentId: string;
  studentName: string;
  studentEmail: string;
  bookId: string;
  bookTitle: string;
  requestDate: string;
  status: 'Waiting' | 'Notified' | 'Fulfilled' | 'Cancelled';
  position: number;
}

export interface DSUsageInfo {
  dataStructure: 'Array' | 'Linked List' | 'Queue';
  purpose: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
}
