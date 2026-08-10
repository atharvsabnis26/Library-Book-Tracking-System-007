import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Student } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Users, Plus, Search, Edit2, Trash2, Eye, Mail, Phone, BookOpen, Layers } from 'lucide-react';

export const StudentManagementView: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, transactions } = useLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState<Omit<Student, 'issuedCount'>>({
    id: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    phone: '',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      id: 'STU-2024-' + Math.floor(100 + Math.random() * 900),
      name: '',
      email: '',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      id: stu.id,
      name: stu.name,
      email: stu.email,
      department: stu.department,
      phone: stu.phone,
      joinedDate: stu.joinedDate
    });
    setIsAddEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;

    if (editingStudent) {
      updateStudent({
        ...formData,
        issuedCount: editingStudent.issuedCount
      });
    } else {
      addStudent(formData);
    }
    setIsAddEditOpen(false);
  };

  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Student Directory ({students.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage registered library members and active borrowing limits
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student name, ID, department, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Student Info</th>
                <th className="p-4">Department</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Active Loans</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No student records found matching search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{student.name}</div>
                      <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{student.id}</div>
                    </td>

                    <td className="p-4">
                      <Badge variant="indigo">{student.department}</Badge>
                    </td>

                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {student.email}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" /> {student.phone}
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant={student.issuedCount > 0 ? 'amber' : 'neutral'}>
                        {student.issuedCount} Books Issued
                      </Badge>
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {student.joinedDate}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingStudent(student)}
                        title="View Borrowing History"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(student)}
                        title="Edit Student"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove student "${student.name}" from registry?`)) {
                            deleteStudent(student.id);
                          }
                        }}
                        title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingStudent ? `Edit Student (${editingStudent.id})` : 'Enroll New Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              required
              value={formData.id}
              onChange={e => setFormData({ ...formData, id: e.target.value })}
              disabled={!!editingStudent}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30"
            >
              {editingStudent ? 'Save Student' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Borrowing History Modal */}
      <Modal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title="Student Profile & Borrowing Audit"
      >
        {viewingStudent && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{viewingStudent.name}</h4>
              <p className="text-xs text-slate-500 font-mono">{viewingStudent.id} • {viewingStudent.department}</p>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Email: {viewingStudent.email} | Phone: {viewingStudent.phone}
              </div>
            </div>

            <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Historical Transactions for {viewingStudent.name}
            </h5>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transactions
                .filter(t => t.studentId === viewingStudent.id)
                .map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{t.bookTitle}</div>
                      <div className="text-slate-400 font-mono">Issued: {t.issueDate} | Due: {t.dueDate}</div>
                    </div>
                    <Badge variant={t.status === 'Active' ? 'amber' : 'success'}>{t.status}</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
