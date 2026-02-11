
import { GoogleGenAI, Type } from "@google/genai";
import { Student, AttendanceRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAttendanceSummary = async (students: Student[], records: AttendanceRecord[]) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the following hostel attendance data and provide a professional, concise executive summary for the warden.
    Consider the performance across different engineering departments (AI&DS, CSE, EEE, ECE).
    
    Data:
    Total Students: ${students.length}
    Current Attendance State:
    ${JSON.stringify(students.map(s => ({ name: s.name, dept: s.department, status: s.status })))}
    
    Instructions:
    1. Identify trends (e.g., which department has the most absences).
    2. Highlight any critical patterns.
    3. Suggest operational improvements for specific departments if needed.
    4. Provide the response as a clear, formatted report.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate AI insights at this time.";
  }
};
