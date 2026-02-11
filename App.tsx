
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import StudentUpload from './components/StudentUpload';
import { Student, AttendanceRecord, HostelStats, ViewType, User } from './types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Search, 
  Plus, 
  Camera, 
  Sparkles,
  RefreshCcw,
  Clock,
  CloudCheck,
  Loader2,
  Filter,
  GraduationCap,
  LogOut,
  UserPlus,
  Building2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getAttendanceSummary } from './services/geminiService';
import { api } from './services/apiService';
import { storage } from './services/storageService';

const DEPT_COLORS = {
  'AI&DS': 'bg-purple-100 text-purple-700 border-purple-200',
  'CSE': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'EEE': 'bg-amber-100 text-amber-700 border-amber-200',
  'ECE': 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const MOCK_INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Alex Thompson', department: 'CSE', roomNumber: '101', floor: 1, rollNumber: 'CS21-001', photoUrl: 'https://picsum.photos/200?random=1', status: 'present', lastCheckIn: '2024-05-20 08:30' },
  { id: '2', name: 'Sarah Miller', department: 'AI&DS', roomNumber: '102', floor: 1, rollNumber: 'AD21-042', photoUrl: 'https://picsum.photos/200?random=2', status: 'absent', lastCheckIn: '2024-05-19 21:15' },
  { id: '3', name: 'John Davis', department: 'EEE', roomNumber: '201', floor: 2, rollNumber: 'EE21-015', photoUrl: 'https://picsum.photos/200?random=3', status: 'present', lastCheckIn: '2024-05-20 07:45' },
  { id: '4', name: 'Emily Chen', department: 'ECE', roomNumber: '205', floor: 2, rollNumber: 'EC21-088', photoUrl: 'https://picsum.photos/200?random=4', status: 'on-leave', lastCheckIn: '2024-05-18 10:00' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchAllData = async () => {
    try {
      const [fetchedStudents, fetchedRecords] = await Promise.all([
        api.fetchStudents(),
        api.fetchRecords()
      ]);
      setStudents(fetchedStudents);
      setRecords(fetchedRecords);
    } catch (err) {
      console.error("Backend failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('hostelflow_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    };

    if (!storage.getStudents()) storage.saveStudents(MOCK_INITIAL_STUDENTS);
    
    initAuth();
    fetchAllData();
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const stats: HostelStats = {
    totalStudents: students.length,
    presentToday: students.filter(s => s.status === 'present').length,
    absentToday: students.filter(s => s.status === 'absent').length,
    onLeave: students.filter(s => s.status === 'on-leave').length,
    occupancyRate: students.length > 0 ? Math.round((students.filter(s => s.status === 'present').length / students.length) * 100) : 0,
  };

  const generateAiSummary = useCallback(async () => {
    setIsGeneratingReport(true);
    const summary = await getAttendanceSummary(students, records);
    setAiReport(summary || 'No insights available.');
    setIsGeneratingReport(false);
  }, [students, records]);

  useEffect(() => {
    if (activeView === 'reports' && !aiReport && !loading && user) {
      generateAiSummary();
    }
  }, [activeView, generateAiSummary, aiReport, loading, user]);

  const toggleStatus = async (id: string) => {
    setSyncing(true);
    try {
      const student = students.find(s => s.id === id);
      if (!student) return;
      const nextStatus = student.status === 'present' ? 'absent' : 'present';
      await api.updateStudentStatus(id, nextStatus);
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        studentId: id,
        date: new Date().toISOString().split('T')[0],
        status: nextStatus === 'present' ? 'present' : 'absent',
        method: 'manual',
        timestamp: new Date().toLocaleTimeString(),
      };
      await api.saveAttendanceRecord(newRecord);
      await fetchAllData();
    } catch (err) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest animate-pulse uppercase text-xs">Loading Secure Environment...</p>
      </div>
    );
  }

  if (!user) return <Login onLoginSuccess={setUser} />;

  const deptStats = ['AI&DS', 'CSE', 'EEE', 'ECE'].map(dept => ({
    name: dept,
    present: students.filter(s => s.department === dept && s.status === 'present').length,
    total: students.filter(s => s.department === dept).length
  }));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {showUploadModal && <StudentUpload onClose={() => setShowUploadModal(false)} onSuccess={fetchAllData} />}

      <div className="absolute top-4 right-8 z-20 flex items-center gap-4">
        {syncing ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black animate-pulse">
            <RefreshCcw size={12} className="animate-spin" /> SYNCING...
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">
            <CloudCheck size={12} /> SYSTEM READY
          </div>
        )}
        <button onClick={handleLogout} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all shadow-sm">
          <LogOut size={18} />
        </button>
      </div>

      {activeView === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="bg-blue-500" />
            <StatCard icon={UserCheck} label="Present Today" value={stats.presentToday} color="bg-emerald-500" />
            <StatCard icon={UserX} label="Absent Today" value={stats.absentToday} color="bg-rose-500" />
            <StatCard icon={TrendingUp} label="Occupancy Rate" value={`${stats.occupancyRate}%`} color="bg-indigo-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-8">Department Attendance Heatmap</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                    <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} name="Present" barSize={40} />
                    <Bar dataKey="total" fill="#f1f5f9" radius={[6, 6, 0, 0]} name="Total" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-8">Success Metric</h3>
              <div className="flex-1 space-y-6">
                {deptStats.map(dept => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-600 tracking-wider">{dept.name}</span>
                      <span className="text-indigo-600 font-black">{dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0}%</span>
                    </div>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className={`h-full transition-all duration-1000 ${dept.name === 'AI&DS' ? 'bg-purple-500' : dept.name === 'CSE' ? 'bg-indigo-500' : dept.name === 'EEE' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${dept.total > 0 ? (dept.present / dept.total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'attendance' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search students by name or roll..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none font-medium shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div>
                        <div className="text-sm font-black text-slate-800 tracking-tight">{student.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{student.rollNumber}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${DEPT_COLORS[student.department as keyof typeof DEPT_COLORS]}`}>{student.department}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{student.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => toggleStatus(student.id)} className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100 transition-all">Update Log</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'students' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Directory</h2>
              <p className="text-slate-400 text-sm font-medium">Managing campus residential records</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add Student Data
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
            {['All', 'AI&DS', 'CSE', 'EEE', 'ECE'].map(dept => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterDept === dept ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110"></div>
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <img src={student.photoUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white" />
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest ${DEPT_COLORS[student.department as keyof typeof DEPT_COLORS]}`}>{student.department}</span>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{student.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <GraduationCap size={14} className="text-indigo-400" />
                    {student.rollNumber}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest relative z-10">
                  <span className="flex items-center gap-1"><Building2 size={12} /> Room {student.roomNumber}</span>
                  <span>Floor {student.floor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'reports' && (
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 min-h-[600px] shadow-sm animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Departmental Analytics</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Powered by Biometric Gemini Engine</p>
            </div>
            <button onClick={generateAiSummary} className="px-8 py-4 bg-indigo-900 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-950 transition-all">
              <Sparkles size={20} className="text-indigo-300" /> 
              {isGeneratingReport ? 'Processing...' : 'Run Neural Analysis'}
            </button>
          </div>
          <div className="text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap p-10 bg-slate-50/50 rounded-[30px] border border-slate-100 shadow-inner italic">
            {isGeneratingReport ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">Scanning Cross-Dept Patterns</p>
              </div>
            ) : aiReport || "Initialize analysis to view departmental attendance trends and warden recommendations."}
          </div>
        </div>
      )}
    </Layout>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-7 rounded-3xl border border-slate-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-[20px] text-white ${color} shadow-lg shadow-indigo-50/50`}><Icon size={24} /></div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  </div>
);

export default App;
