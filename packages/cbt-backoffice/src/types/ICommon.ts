// src/types/ICommon.ts

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
}

// ========== JADWAL UJIAN API RESPONSE ==========

export interface JadwalUjianResponse {
  jadwalId: string;
  startTime: string;
  endTime: string;
  timeLimit: number;
  attempts: number;
  attemptsRemaining: number;
  questionCount: number;
  token: string; // ✅ tambah
  status: 'not_attempted' | 'attempted';
  viewHasil: boolean;
  agenda: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  paketSoal: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Event {
  id: string;
  agendaTitle: string;
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  questionCount: number;
  duration: number;
  date: string;
  time: string;
  timeEnd: string;
  token: string; // ✅ tambah
  attemptsRemaining: number;
  paketSoalId: string;
  agendaId: string;
  viewHasil: boolean;
}

export interface Student {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  username: string;
  examCount?: number; // akan dihitung dari jumlah ujian
}

// ========== EXAM RESULT TYPE ==========

export interface ExamResult {
  id: string;
  agendaTitle: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  date: string;
  time: string;
  viewHasil: boolean;
  score: number;
  percentage: number;
}

// ========== SERVICE RESPONSE TYPES ==========

export interface StudentResponse {
  data: Student;
  message: string;
  success: boolean;
}

export interface ExamsResponse {
  data: Event[];
  message: string;
  success: boolean;
}