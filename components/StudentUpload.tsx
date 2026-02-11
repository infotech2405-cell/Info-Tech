
import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Plus, Loader2 } from 'lucide-react';
import { Student } from '../types';
import { api } from '../services/apiService';

interface StudentUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

const StudentUpload: React.FC<StudentUploadProps> = ({ onClose, onSuccess }) => {
  const [department, setDepartment] = useState<Student['department']>('CSE');
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments: Student['department'][] = ['AI&DS', 'CSE', 'EEE', 'ECE'];

  const handleUpload = async () => {
    if (!csvText.trim()) return setError('Please enter student details');
    
    setLoading(true);
    setError(null);

    try {
      // Basic Parser: Name, RollNumber, RoomNumber, Floor
      const lines = csvText.trim().split('\n');
      const parsedData = lines.map(line => {
        const [name, roll, room, floor] = line.split(',').map(s => s.trim());
        if (!name || !roll || !room || !floor) throw new Error('Invalid format on line: ' + line);
        
        return {
          name,
          rollNumber: roll,
          roomNumber: room,
          floor: parseInt(floor),
          department
        };
      });

      await api.bulkAddStudents(parsedData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process data. Check format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Bulk Student Upload</h2>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Department Data Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Select Target Department</label>
            <div className="grid grid-cols-4 gap-3">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setDepartment(dept)}
                  className={`py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                    department === dept 
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Input Student Details</label>
              <span className="text-[10px] text-indigo-500 font-bold">Format: Name, RollNo, Room, Floor</span>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Example:&#10;John Doe, CS21-001, 101, 1&#10;Jane Smith, CS21-002, 102, 1"
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono text-sm"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              disabled={loading}
              onClick={handleUpload}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Complete Upload
                </>
              )}
            </button>
            <button
              disabled={loading}
              onClick={onClose}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Data is strictly allocated to the {department} branch environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentUpload;
