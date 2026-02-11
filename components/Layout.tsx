
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Scan, 
  FileText, 
  CheckSquare,
  Building2,
  Menu,
  X
} from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'ai-scanner', label: 'AI Scanner', icon: Scan },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="bg-white/10 p-2 rounded-lg">
              <Building2 className="text-indigo-200 w-6 h-6" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">HostelFlow</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-indigo-200 hover:text-white">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeView === item.id ? 'text-white' : 'text-indigo-300'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <img src="https://picsum.photos/40/40" alt="Admin" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-semibold truncate">Warden Admin</p>
                <p className="text-indigo-300 text-xs truncate">Main Campus Hostel</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeView.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
              System Live: {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
