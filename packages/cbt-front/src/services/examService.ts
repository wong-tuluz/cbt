import type { ExamSession, SubmitExamPayload, ExamSessionResponse } from '@/types/IExam'
import api from '@/services/api'
import { getStudentData } from '@/services/eventService'

// Payload untuk submit per soal
export interface SubmitAnswerPayload {
  soalId: string
  marked: boolean
  jawaban: Array<{
    jawabanSoalId: string
    value: string | number
  }>
}

// Get exam data dari localStorage
export async function getExamById(): Promise<ExamSession> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const storedData = localStorage.getItem('soal')
        
        if (!storedData) {
          reject(new Error('Data soal tidak ditemukan di localStorage'))
          return
        }

        const apiResponse: ExamSessionResponse = JSON.parse(storedData)
        
        if (!apiResponse.success || !apiResponse.data) {
          reject(new Error('Data soal tidak valid'))
          return
        }

        const student = getStudentData()
        
        const examSession: ExamSession = {
          ...apiResponse.data,
          totalQuestions: apiResponse.data.questions.length,
          answeredCount: 0,
          timeRemaining: 0,
          studentName: student.nama,
          studentNis: student.nis,
          isAutoSaving: false,
          submitted: false
        }
        
        resolve(examSession)
      } catch (error) {
        reject(new Error('Gagal memproses data soal: ' + (error as Error).message))
      }
    }, 300)
  })
}

// Submit jawaban per soal
export async function submitAnswer(sessionId: string, payload: SubmitAnswerPayload) {
  return api.post<unknown | null>(`/work-session/${sessionId}/submit`, payload)
}

// Submit exam final (jika ada endpoint terpisah)
export async function submitExam(payload: SubmitExamPayload): Promise<{ success: boolean; score?: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Exam submitted (final):', payload)
      
      // TODO: Implement final submit jika ada endpoint terpisah
      
      const score = Math.floor(Math.random() * 100)
      
      resolve({
        success: true,
        score
      })
    }, 1000)
  })
}

// Get current session state from server (for resync)
export async function getSessionState(sessionId: string) {
  return api.get<{
    id: string
    status: 'in_progress' | 'finished'
    strike: number
    questions: Array<{
      index: number
      soalId: string
      type: string
      prompt: string
      isMarked: boolean
      isAnswered: boolean
      options: Array<{ jawabanSoalId: string; value: string; isSelected: boolean }>
    }>
  }>(`/work-session/${sessionId}/state`)
}

// Get exam results
export async function getExamResults(sessionId: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sessionId,
        score: 85,
        totalQuestions: 10,
        correctAnswers: 8,
        timeSpent: '01:25:30',
        submittedAt: new Date().toISOString()
      })
    }, 500)
  })
}