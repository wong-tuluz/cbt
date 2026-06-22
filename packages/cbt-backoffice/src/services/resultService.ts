import api from '@/services/api'

// Interface untuk API response
export interface ResultQuestion {
  index: number
  soalId: string
  type: 'single-choice' | 'multiple-choice'
  prompt: string
  isMarked: boolean
  isAnswered: boolean
  options: Array<{
    jawabanSoalId: string
    value: string
    isSelected: boolean
    isCorrect: boolean
  }>
}

export interface ExamResultResponse {
  success: boolean
  code: number
  data: {
    id: string
    status: string
    questions: ResultQuestion[]
  }
}

// Get exam result by session ID
export async function getExamResult(sessionId: string): Promise<ExamResultResponse> {
  return api.get<ExamResultResponse>(`/pengerjaan/${sessionId}/result`)
}

// export function getListSessionByJadwal(jadwalId: string) {
//   return api.get (`/work-session?jadwalId=${jadwalId}`)

// }