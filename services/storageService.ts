
import { Student, AttendanceRecord } from "../types";

const KEYS = {
  STUDENTS: 'hostelflow_students',
  RECORDS: 'hostelflow_records'
};

export const storage = {
  getStudents: (): Student[] | null => {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : null;
  },
  saveStudents: (students: Student[]) => {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },
  getRecords: (): AttendanceRecord[] | null => {
    const data = localStorage.getItem(KEYS.RECORDS);
    return data ? JSON.parse(data) : null;
  },
  saveRecords: (records: AttendanceRecord[]) => {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  }
};
