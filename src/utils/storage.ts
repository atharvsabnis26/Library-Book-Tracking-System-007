import { Book, Student, Transaction, WaitingQueueItem } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'BK-101',
    title: 'Data Structures and Algorithms in C++',
    author: 'Mark Allen Weiss',
    category: 'Data Structures',
    isbn: '978-0132847377',
    publicationYear: 2021,
    quantity: 5,
    availableCopies: 3,
    status: 'Available',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    locationRack: 'A1-R02',
    barcode: 'BC-9780132847377',
    rfidTag: 'RFID-E200-0101-A9B1'
  },
  {
    id: 'BK-102',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    category: 'Computer Science',
    isbn: '978-0262033848',
    publicationYear: 2022,
    quantity: 6,
    availableCopies: 1,
    status: 'Low Stock',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    locationRack: 'A1-R05',
    barcode: 'BC-9780262033848',
    rfidTag: 'RFID-E200-0102-B8C2'
  },
  {
    id: 'BK-103',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    isbn: '978-0132350884',
    publicationYear: 2019,
    quantity: 4,
    availableCopies: 0,
    status: 'Out of Stock',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    locationRack: 'B2-R01',
    barcode: 'BC-9780132350884',
    rfidTag: 'RFID-E200-0103-C7D3'
  },
  {
    id: 'BK-104',
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    category: 'Mathematics',
    isbn: '978-8174091955',
    publicationYear: 2020,
    quantity: 8,
    availableCopies: 5,
    status: 'Available',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400',
    locationRack: 'M1-R03',
    barcode: 'BC-9788174091955',
    rfidTag: 'RFID-E200-0104-D6E4'
  },
  {
    id: 'BK-105',
    title: 'Fundamentals of Electric Circuits',
    author: 'Charles K. Alexander',
    category: 'Electrical',
    isbn: '978-0078028229',
    publicationYear: 2021,
    quantity: 3,
    availableCopies: 2,
    status: 'Available',
    coverUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
    locationRack: 'E2-R04',
    barcode: 'BC-9780078028229',
    rfidTag: 'RFID-E200-0105-E5F5'
  },
  {
    id: 'BK-106',
    title: 'University Physics with Modern Physics',
    author: 'Hugh D. Young',
    category: 'Physics',
    isbn: '978-0135159552',
    publicationYear: 2020,
    quantity: 4,
    availableCopies: 4,
    status: 'Available',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    locationRack: 'P1-R01',
    barcode: 'BC-9780135159552',
    rfidTag: 'RFID-E200-0106-F4G6'
  },
  {
    id: 'BK-107',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Literature',
    isbn: '978-0061120084',
    publicationYear: 2018,
    quantity: 5,
    availableCopies: 3,
    status: 'Available',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    locationRack: 'L3-R02',
    barcode: 'BC-9780061120084',
    rfidTag: 'RFID-E200-0107-G3H7'
  },
  {
    id: 'BK-108',
    title: 'Principles of Management',
    author: 'Philip Kotler',
    category: 'Management',
    isbn: '978-0134492513',
    publicationYear: 2022,
    quantity: 3,
    availableCopies: 1,
    status: 'Low Stock',
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
    locationRack: 'MG-R01',
    barcode: 'BC-9780134492513',
    rfidTag: 'RFID-E200-0108-H2I8'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-2024-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 43210',
    issuedCount: 2,
    joinedDate: '2024-08-01',
    barcode: 'BC-STU-2024001',
    rfidCard: 'RFID-CARD-STU001'
  },
  {
    id: 'STU-2024-002',
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    department: 'Information Technology',
    phone: '+91 98765 43211',
    issuedCount: 1,
    joinedDate: '2024-08-01',
    barcode: 'BC-STU-2024002',
    rfidCard: 'RFID-CARD-STU002'
  },
  {
    id: 'STU-2024-003',
    name: 'Rohan Verma',
    email: 'rohan.verma@college.edu',
    department: 'Electronics & Comm.',
    phone: '+91 98765 43212',
    issuedCount: 1,
    joinedDate: '2024-08-05',
    barcode: 'BC-STU-2024003',
    rfidCard: 'RFID-CARD-STU003'
  },
  {
    id: 'STU-2024-004',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@college.edu',
    department: 'Data Science & AI',
    phone: '+91 98765 43213',
    issuedCount: 0,
    joinedDate: '2024-08-10',
    barcode: 'BC-STU-2024004',
    rfidCard: 'RFID-CARD-STU004'
  },
  {
    id: 'STU-2024-005',
    name: 'Vikram Singh',
    email: 'vikram.singh@college.edu',
    department: 'Mechanical Engineering',
    phone: '+91 98765 43214',
    issuedCount: 1,
    joinedDate: '2024-08-12',
    barcode: 'BC-STU-2024005',
    rfidCard: 'RFID-CARD-STU005'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9001',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    bookId: 'BK-101',
    bookTitle: 'Data Structures and Algorithms in C++',
    type: 'Issue',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    status: 'Active'
  },
  {
    id: 'TXN-9002',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    bookId: 'BK-102',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    type: 'Issue',
    issueDate: '2026-08-02',
    dueDate: '2026-08-16',
    status: 'Active'
  },
  {
    id: 'TXN-9003',
    studentId: 'STU-2024-002',
    studentName: 'Priya Patel',
    bookId: 'BK-103',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    type: 'Issue',
    issueDate: '2026-07-20',
    dueDate: '2026-08-03',
    status: 'Active' // Overdue
  },
  {
    id: 'TXN-9004',
    studentId: 'STU-2024-003',
    studentName: 'Rohan Verma',
    bookId: 'BK-105',
    bookTitle: 'Fundamentals of Electric Circuits',
    type: 'Issue',
    issueDate: '2026-08-05',
    dueDate: '2026-08-19',
    status: 'Active'
  },
  {
    id: 'TXN-9005',
    studentId: 'STU-2024-005',
    studentName: 'Vikram Singh',
    bookId: 'BK-108',
    bookTitle: 'Principles of Management',
    type: 'Issue',
    issueDate: '2026-08-08',
    dueDate: '2026-08-22',
    status: 'Active'
  },
  {
    id: 'TXN-8998',
    studentId: 'STU-2024-004',
    studentName: 'Ananya Gupta',
    bookId: 'BK-104',
    bookTitle: 'Higher Engineering Mathematics',
    type: 'Return',
    issueDate: '2026-07-15',
    dueDate: '2026-07-29',
    returnDate: '2026-07-28',
    status: 'Returned'
  }
];

export const INITIAL_QUEUE: WaitingQueueItem[] = [
  {
    id: 'Q-1001',
    studentId: 'STU-2024-004',
    studentName: 'Ananya Gupta',
    studentEmail: 'ananya.gupta@college.edu',
    bookId: 'BK-103',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    requestDate: '2026-08-04 10:15 AM',
    status: 'Waiting',
    position: 1
  },
  {
    id: 'Q-1002',
    studentId: 'STU-2024-005',
    studentName: 'Vikram Singh',
    studentEmail: 'vikram.singh@college.edu',
    bookId: 'BK-103',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    requestDate: '2026-08-06 02:30 PM',
    status: 'Waiting',
    position: 2
  },
  {
    id: 'Q-1003',
    studentId: 'STU-2024-002',
    studentName: 'Priya Patel',
    studentEmail: 'priya.patel@college.edu',
    bookId: 'BK-102',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    requestDate: '2026-08-09 11:00 AM',
    status: 'Waiting',
    position: 3
  }
];

const STORAGE_KEY = 'lib_ds_tracker_data_v2';

export interface StorageData {
  books: Book[];
  students: Student[];
  transactions: Transaction[];
  queue: WaitingQueueItem[];
}

export function loadStoredData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        books: INITIAL_BOOKS,
        students: INITIAL_STUDENTS,
        transactions: INITIAL_TRANSACTIONS,
        queue: INITIAL_QUEUE
      };
    }
    const parsed = JSON.parse(raw);
    
    // Ensure all books have barcode and rfidTag
    const booksWithTags = (parsed.books || INITIAL_BOOKS).map((b: Book, idx: number) => ({
      ...b,
      barcode: b.barcode || `BC-${b.isbn.replace(/[^0-[#A-Za-z0-9]/g, '') || '1000' + idx}`,
      rfidTag: b.rfidTag || `RFID-E200-01${(10 + idx).toString(16).toUpperCase()}-${b.id.replace('-', '')}`
    }));

    const studentsWithTags = (parsed.students || INITIAL_STUDENTS).map((s: Student, idx: number) => ({
      ...s,
      barcode: s.barcode || `BC-${s.id.replace(/-/g, '')}`,
      rfidCard: s.rfidCard || `RFID-CARD-${s.id.split('-').pop() || '00' + idx}`
    }));

    return {
      books: booksWithTags,
      students: studentsWithTags,
      transactions: parsed.transactions || INITIAL_TRANSACTIONS,
      queue: parsed.queue || INITIAL_QUEUE
    };
  } catch (err) {
    console.error('Failed to parse localStorage:', err);
    return {
      books: INITIAL_BOOKS,
      students: INITIAL_STUDENTS,
      transactions: INITIAL_TRANSACTIONS,
      queue: INITIAL_QUEUE
    };
  }
}

export function saveStoredData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

export function resetStoredData(): StorageData {
  const fresh: StorageData = {
    books: INITIAL_BOOKS,
    students: INITIAL_STUDENTS,
    transactions: INITIAL_TRANSACTIONS,
    queue: INITIAL_QUEUE
  };
  saveStoredData(fresh);
  return fresh;
}
