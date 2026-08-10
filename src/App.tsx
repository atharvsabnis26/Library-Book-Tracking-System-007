import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { VivaBanner } from './components/layout/VivaBanner';
import { ToastContainer } from './components/common/Toast';

import { DashboardView } from './components/views/DashboardView';
import { BarcodeRfidView } from './components/views/BarcodeRfidView';
import { BookManagementView } from './components/views/BookManagementView';
import { SearchBookView } from './components/views/SearchBookView';
import { IssueBookView } from './components/views/IssueBookView';
import { ReturnBookView } from './components/views/ReturnBookView';
import { WaitingQueueView } from './components/views/WaitingQueueView';
import { TransactionHistoryView } from './components/views/TransactionHistoryView';
import { DSVisualizerView } from './components/views/DSVisualizerView';
import { StudentManagementView } from './components/views/StudentManagementView';
import { ReportsView } from './components/views/ReportsView';
import { AdminPanelView } from './components/views/AdminPanelView';

const MainLayout: React.FC = () => {
  const { activeTab } = useLibrary();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVivaBanner, setShowVivaBanner] = useState(true);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'barcode_rfid':
        return <BarcodeRfidView />;
      case 'books':
        return <BookManagementView />;
      case 'search':
        return <SearchBookView />;
      case 'issue':
        return <IssueBookView />;
      case 'return':
        return <ReturnBookView />;
      case 'queue':
        return <WaitingQueueView />;
      case 'transactions':
        return <TransactionHistoryView />;
      case 'ds_visualizer':
        return <DSVisualizerView />;
      case 'students':
        return <StudentManagementView />;
      case 'reports':
        return <ReportsView />;
      case 'admin':
        return <AdminPanelView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          showVivaBanner={showVivaBanner}
          onToggleVivaBanner={() => setShowVivaBanner(prev => !prev)}
        />

        {/* Optional Data Structures Viva Banner */}
        {showVivaBanner && (
          <VivaBanner onClose={() => setShowVivaBanner(false)} />
        )}

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <OfflineSyncProvider>
      <LibraryProvider>
        <MainLayout />
      </LibraryProvider>
    </OfflineSyncProvider>
  );
}
