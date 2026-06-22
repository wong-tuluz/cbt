// src/services/examService.ts
import type { ExamSessionResponse } from '@/types/IExam';
import api from './api';
import type { 
  Student,
  Event,
  ExamResult,
  ApiResponse,
  JadwalUjianResponse
} from '@/types/ICommon';
import { formatDate, formatTime } from '@/composables/useDate';

/**
 * Get data siswa dari localStorage
 */
export function getStudentData(): Student {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('Data user tidak ditemukan. Silakan login kembali.');
  }
  return JSON.parse(userStr);
}

/**
 * Get daftar ujian dari API
 */
export async function getEvent(): Promise<Event[]> {
  const response = await api.get<ApiResponse<JadwalUjianResponse[]>>('/acara/jadwal');
  
return response.data.map(jadwal => ({
  id: jadwal.jadwalId,
  agendaTitle: jadwal.agenda.title,
  title: jadwal.paketSoal.title,
  description: jadwal.paketSoal.description,
  status: determineStatus(jadwal.startTime, jadwal.endTime, jadwal.attemptsRemaining),
  questionCount: jadwal.questionCount || 0,
  duration: jadwal.timeLimit,
  date: formatDate(jadwal.startTime),
  time: formatTime(jadwal.startTime),
  timeEnd: formatTime(jadwal.endTime),
  token: jadwal.token, // ✅ tambah
  attemptsRemaining: jadwal.attemptsRemaining,
  paketSoalId: jadwal.paketSoal.id,
  agendaId: jadwal.agenda.id,
  viewHasil: jadwal.viewHasil
}));
}

/**
 * Get hasil ujian (completed exams with scores)
 */
export async function getExamResults(): Promise<ExamResult[]> {
  const exams = await getEvent();
  const completedExams = exams.filter(exam => exam.status === 'completed');
  
  // Transform ke format ExamResult
  return completedExams.map(exam => ({
    id: exam.id,
    agendaTitle: exam.agendaTitle,
    title: exam.title,
    description: exam.description,
    questionCount: exam.questionCount,
    duration: exam.duration,
    date: exam.date,
    time: exam.time,
    viewHasil: exam.viewHasil,
    score: 0, // TODO: Dari API
    percentage: 0 // TODO: Dari API
  }));
}

/**
 * Get exam by ID
 */
export async function getEventById(examId: string): Promise<Event | null> {
  const exams = await getEvent();
  return exams.find(e => e.id === examId) || null;
}

/**
 * Start exam
 */
export async function startExam(examId: string): Promise<{ success: boolean; message: string }> {
  // TODO: Implement actual API call
  // const response = await api.post(`/jadwal/${examId}/start`);
  
  console.log(`Starting exam: ${examId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: 'Exam started successfully'
  };
}

export async function getSoal(sessionId: string): Promise<ExamSessionResponse> {
  return api.get<ExamSessionResponse>(`/work-session/${sessionId}/state`)
}

export async function warnExam(sessionId: string): Promise<ExamSessionResponse> {
  return api.post<ExamSessionResponse>(`/work-session/${sessionId}/warn`)
}

// ========== HELPER FUNCTIONS ==========

function determineStatus(
  startTime: string,
  endTime: string,
  attemptsRemaining: number
): 'ongoing' | 'completed' | 'upcoming' {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  // No attempts left
  if (attemptsRemaining === 0) return 'completed';
  
  // Time passed
  if (now > end) return 'completed';
  
  // Not started yet
  if (now < start) return 'upcoming';
  
  // Ongoing
  if (now >= start && now <= end) return 'ongoing';
  
  return 'upcoming';
}