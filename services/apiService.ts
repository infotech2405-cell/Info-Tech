
import { Student, AttendanceRecord, User } from "../types";
import { storage } from "./storageService";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(1200);
    if (email === 'admin@hostelflow.com' && password === 'admin123') {
      const user: User = {
        id: 'u1',
        name: 'Warden Admin',
        email: 'admin@hostelflow.com',
        role: 'warden',
        avatar: 'https://picsum.photos/100/100?random=auth'
      };
      localStorage.setItem('hostelflow_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid email or password');
  },

  logout: () => {
    localStorage.removeItem('hostelflow_user');
  },

  fetchStudents: async (): Promise<Student[]> => {
    await delay(500);
    const local = storage.getStudents();
    return local || [];
  },

  bulkAddStudents: async (newStudents: Omit<Student, 'id' | 'lastCheckIn' | 'status' | 'photoUrl'>[]): Promise<void> => {
    await delay(1500);
    const current = storage.getStudents() || [];
    
    const prepared = newStudents.map((s, index) => ({
      ...s,
      id: `std-${Date.now()}-${index}`,
      status: 'present' as const,
      lastCheckIn: new Date().toLocaleString(),
      photoUrl: `https://picsum.photos/200?random=${Math.random()}`
    }));

    storage.saveStudents([...current, ...prepared]);
  },

  fetchRecords: async (): Promise<AttendanceRecord[]> => {
    await delay(400);
    const local = storage.getRecords();
    return local || [];
  },

  saveAttendanceRecord: async (record: AttendanceRecord): Promise<void> => {
    await delay(300);
    const records = storage.getRecords() || [];
    storage.saveRecords([...records, record]);
  },

  updateStudentStatus: async (studentId: string, status: Student['status']): Promise<void> => {
    await delay(300);
    const students = storage.getStudents() || [];
    const updated = students.map(s => 
      s.id === studentId ? { ...s, status, lastCheckIn: new Date().toLocaleString() } : s
    );
    storage.saveStudents(updated);
  }
};
