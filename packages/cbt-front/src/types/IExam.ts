// Interface sesuai struktur API
export interface Question {
  index: number
  soalId: string
  type: 'single-choice' | 'multiple-choice' // single-choice = pilih 1, multiple-choice = pilih banyak
  prompt: string
  isMarked: boolean
  isAnswered: boolean
  options: Option[]
}

export interface Option {
  jawabanSoalId: string
  value: string
  isSelected: boolean
}

export interface ExamSession {
  id: string
  status: string
  totalQuestions: number
  answeredCount: number
  timeRemaining: number // dalam detik
  studentName: string
  studentNis: string
  isAutoSaving: boolean
  questions: Question[]
  submitted: boolean
}

export interface ExamState {
  session: ExamSession | null
  currentQuestionIndex: number
  lastSavedAt: string | null
}

export interface SubmitExamPayload {
  sessionId: string
  answers: Array<{
    soalId: string
    selectedAnswerIds: string[] // Array of jawabanSoalId
    answeredAt: string
  }>
  totalTimeSpent: number
}

export interface SavedExamState {
  session: ExamSession
  currentQuestionIndex: number
  lastSavedAt: string
  examStartTime: number
  examDuration: number
}

export interface ExamSessionResponse {
  success: boolean
  code: number
  data: {
    id: string
    status: string
    strike: number
    questions: Question[]
  }
}