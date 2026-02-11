
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'warden' | 'admin';
  avatar: string;
}

export interface Student {
  id: string;
  name: string;
  roomNumber: string;
  floor: number;
  rollNumber: string;
  department: 'AI&DS' | 'CSE' | 'EEE' | 'ECE';
  photoUrl: string;
  status: 'present' | 'absent' | 'late' | 'on-leave';
  lastCheckIn: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  method: 'manual' | 'ai-scan' | 'qr-code';
  timestamp: string;
}

export interface HostelStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
  occupancyRate: number;
}

export type ViewType = 'dashboard' | 'attendance' | 'students' | 'ai-scanner' | 'reports';
