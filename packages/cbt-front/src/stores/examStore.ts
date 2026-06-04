import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExamSession } from '@/types/IExam'
import { getExamById, submitAnswer, submitExam, type SubmitAnswerPayload } from '@/services/examService'

export const useExamStore = defineStore('exam', () => {
  // State
  const session = ref<ExamSession | null>(null)
  const currentQuestionIndex = ref(0)
  const lastSavedAt = ref<string | null>(null)
  const timerInterval = ref<number | null>(null)
  const examDuration = ref<number>(90 * 60)
  const examEndTime = ref<number | null>(null)

  // Getters
  const currentQuestion = computed(() => {
    if (!session.value) return null
    return session.value.questions[currentQuestionIndex.value]
  })

  const formattedTime = computed(() => {
    if (!session.value) return '00:00:00'
    
    const hours = Math.floor(session.value.timeRemaining / 3600)
    const minutes = Math.floor((session.value.timeRemaining % 3600) / 60)
    const seconds = session.value.timeRemaining % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const totalAnswered = computed(() => {
    if (!session.value) return 0
    return session.value.questions.filter(q => q.isAnswered).length
  })

  const calculateTimeRemaining = (): number => {
    if (!examEndTime.value) return 0
    
    const now = Date.now()
    const remaining = Math.max(0, examEndTime.value - now) / 1000 // ⭐ dalam detik
    
    return Math.floor(remaining)
  }

  // Helper: Check if single choice (hanya 1 yang boleh dipilih)
  const isSingleChoice = (question: typeof currentQuestion.value) => {
    return question?.type === 'single-choice'
  }

  // Actions
  const initializeExam = async (sessionId: string, preventAutoCreate: boolean = false) => {
  try {
    const savedState = loadSavedState(sessionId)
    
    if (savedState) {
      session.value = savedState.session
      currentQuestionIndex.value = savedState.currentQuestionIndex
      lastSavedAt.value = savedState.lastSavedAt
      examEndTime.value = savedState.examEndTime
      examDuration.value = savedState.examDuration
      
      if (session.value) {
        session.value.timeRemaining = calculateTimeRemaining()
      }
      
      if (session.value && !session.value.submitted) {
        startTimer()
        return true
      }
    }
    
    if (preventAutoCreate) {
      console.log('🚫 Preventing auto-create of exam state')
      return false
    }
    
    const examData = await getExamById()
    
    // ⭐⭐ HITUNG examEndTime dari timeOpen dan timeEnd ⭐⭐
    const rawContext = sessionStorage.getItem('examContext')
    const examContext = rawContext ? JSON.parse(rawContext) : null
    
    if (examContext?.timeOpen && examContext?.timeEnd) {
      const [openHour, openMinute] = examContext.timeOpen.split('.').map(Number)
      const [endHour, endMinute] = examContext.timeEnd.split('.').map(Number)
      
      const endDate = new Date()
      // Set ke hari ini dengan jam open (untuk patokan tanggal)
      endDate.setHours(openHour, openMinute, 0, 0)
      
      // Set jam selesai
      endDate.setHours(endHour, endMinute, 0, 0)
      
      // Jika endHour < openHour, berarti selesai besok
      if (endHour < openHour || (endHour === openHour && endMinute < openMinute)) {
        endDate.setDate(endDate.getDate() + 1)
      }
      
      examEndTime.value = endDate.getTime()
      console.log('📅 Exam end time:', endDate.toString())
    } else {
      // Fallback
      examEndTime.value = Date.now() + (90 * 60 * 1000)
    }
    
    session.value = {
      ...examData,
      answeredCount: examData.questions.filter(q => q.isAnswered).length,
      timeRemaining: calculateTimeRemaining(),
      isAutoSaving: false,
      submitted: false
    }
    
    currentQuestionIndex.value = 0
    saveToLocalStorage()
    startTimer()
    
    return true
    
  } catch (error) {
    console.error('Failed to initialize exam:', error)
    throw error
  }
}

  const saveToLocalStorage = () => {
    if (!session.value || !examEndTime.value) return
    
    const stateToSave = {
      session: session.value,
      currentQuestionIndex: currentQuestionIndex.value,
      lastSavedAt: new Date().toISOString(),
      examEndTime: examEndTime.value, // ⭐ Simpan endTime
      examDuration: examDuration.value
    }
    
    localStorage.setItem(`exam_state_${session.value.id}`, JSON.stringify(stateToSave))
  }

  const loadSavedState = (sessionId: string) => {
    const saved = localStorage.getItem(`exam_state_${sessionId}`)
    if (!saved) return null
    
    try {
      const parsed = JSON.parse(saved)
      
      // ⭐⭐ VALIDASI: Jika endTime sudah lewat, hapus state ⭐⭐
      if (parsed.examEndTime && Date.now() > parsed.examEndTime) {
        console.log('Exam end time already passed')
        localStorage.removeItem(`exam_state_${sessionId}`)
        return null
      }
      
      return parsed
    } catch (error) {
      console.error('Failed to parse saved state:', error)
      localStorage.removeItem(`exam_state_${sessionId}`)
      return null
    }
  }

  // Select answer - Hanya update state, TIDAK submit ke API
  const selectAnswer = (jawabanSoalId: string) => {
    if (!session.value || !currentQuestion.value) return
    
    const question = session.value.questions[currentQuestionIndex.value]
    if (!question) return
    
    if (isSingleChoice(question)) {
      // Single choice: unselect all, select one
      question.options.forEach(opt => {
        opt.isSelected = opt.jawabanSoalId === jawabanSoalId
      })
      question.isAnswered = true
    } else {
      // Multiple choice: toggle
      const option = question.options.find(opt => opt.jawabanSoalId === jawabanSoalId)
      if (option) {
        option.isSelected = !option.isSelected
      }
      question.isAnswered = question.options.some(opt => opt.isSelected)
    }
    
    session.value.answeredCount = session.value.questions.filter(q => q.isAnswered).length
    
    // ❌ HAPUS: Submit langsung ke API
    // Jawaban hanya di-submit saat pindah soal
  }

  // Submit jawaban per soal ke API
  const submitAnswerToAPI = async () => {
    if (!session.value || !currentQuestion.value) return
    
    try {
      const question = currentQuestion.value
      
      // Build payload sesuai API
      const payload: SubmitAnswerPayload = {
        soalId: question.soalId,
        marked: question.isMarked,
        jawaban: question.options
          .filter(opt => opt.isSelected)
          .map(opt => ({
            jawabanSoalId: opt.jawabanSoalId,
            value: opt.value
          }))
      }
      
      // Call service untuk POST ke API
      await submitAnswer(session.value.id, payload)
      
      console.log('Answer submitted to API:', payload)
      
    } catch (error) {
      console.error('Failed to submit answer to API:', error)
      // Tidak throw error agar UX tidak terganggu
    }
  }

  // Helper: Check if option is selected
  const isOptionSelected = (jawabanSoalId: string): boolean => {
    if (!currentQuestion.value) return false
    const option = currentQuestion.value.options.find(opt => opt.jawabanSoalId === jawabanSoalId)
    return option?.isSelected || false
  }

  const toggleMarkQuestion = () => {
    if (!session.value || !currentQuestion.value) return
    
    const question = session.value.questions[currentQuestionIndex.value]
    if (!question) return
    
    question.isMarked = !question.isMarked
    
    // Mark akan di-submit saat pindah soal
    submitAnswerToAPI()
    
    autoSave()
  }

  const goToPreviousQuestion = async () => {
    if (currentQuestionIndex.value > 0) {
      if (session.value) {
        session.value.isAutoSaving = true
      }
      
      // Submit jawaban soal saat ini sebelum pindah
      await submitAnswerToAPI()
      
      setTimeout(() => {
        currentQuestionIndex.value--
        saveToLocalStorage()
        
        setTimeout(() => {
          if (session.value) {
            session.value.isAutoSaving = false
          }
        }, 800)
      }, 50)
    }
  }

  const goToNextQuestion = async () => {
    if (!session.value) return
    
    if (currentQuestionIndex.value < session.value.totalQuestions - 1) {
      session.value.isAutoSaving = true
      
      // Submit jawaban soal saat ini sebelum pindah
      await submitAnswerToAPI()
      
      setTimeout(() => {
        currentQuestionIndex.value++
        saveToLocalStorage()
        
        setTimeout(() => {
          if (session.value) {
            session.value.isAutoSaving = false
          }
        }, 800)
      }, 50)
    }
  }

  const goToQuestion = async (index: number) => {
    if (!session.value) return
    
    if (index >= 0 && index < session.value.totalQuestions) {
      session.value.isAutoSaving = true
      
      // Submit jawaban soal saat ini sebelum pindah
      await submitAnswerToAPI()
      
      setTimeout(() => {
        currentQuestionIndex.value = index
        saveToLocalStorage()
        
        setTimeout(() => {
          if (session.value) {
            session.value.isAutoSaving = false
          }
        }, 800)
      }, 50)
    }
  }

  const autoSave = async () => {
    if (!session.value) return
    
    session.value.isAutoSaving = true
    saveToLocalStorage()
    
    setTimeout(() => {
      if (session.value) {
        session.value.isAutoSaving = false
        lastSavedAt.value = new Date().toISOString()
      }
    }, 500)
  }

  const startTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  timerInterval.value = window.setInterval(() => {
    if (!session.value || !examEndTime.value) return
    
    // ⭐⭐ HITUNG ULANG SETIAP DETIK ⭐⭐
    const remaining = calculateTimeRemaining()
    session.value.timeRemaining = remaining
    
    if (remaining <= 0) {
      session.value.timeRemaining = 0
      clearInterval(timerInterval.value!)
    }
  }, 1000)
}

const loadSavedSession = (sessionId: string) => {
  const savedState = loadSavedState(sessionId)
  if (savedState) {
    session.value = savedState.session
    currentQuestionIndex.value = savedState.currentQuestionIndex
    lastSavedAt.value = savedState.lastSavedAt
    examDuration.value = savedState.examDuration
    
    // ⭐⭐ UPDATE examEndTime dengan context terbaru ⭐⭐
    const rawContext = sessionStorage.getItem('examContext')
    const examContext = rawContext ? JSON.parse(rawContext) : null
    
    if (examContext?.timeOpen && examContext?.timeEnd) {
      const [openHour, openMinute] = examContext.timeOpen.split('.').map(Number)
      const [endHour, endMinute] = examContext.timeEnd.split('.').map(Number)
      
      const endDate = new Date()
      endDate.setHours(openHour, openMinute, 0, 0)
      endDate.setHours(endHour, endMinute, 0, 0)
      
      if (endHour < openHour || (endHour === openHour && endMinute < openMinute)) {
        endDate.setDate(endDate.getDate() + 1)
      }
      
      examEndTime.value = endDate.getTime()
    } else {
      examEndTime.value = savedState.examEndTime
    }
    
    if (session.value) {
      session.value.timeRemaining = calculateTimeRemaining()
    }
    
    startTimer()
    return true
  }
  return false
}

  const resetExam = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    
    session.value = null
    currentQuestionIndex.value = 0
    lastSavedAt.value = null
    examEndTime.value = null
    examDuration.value = 90 * 60
  }

  const onUnmounted = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  }

  return {
    session,
    currentQuestionIndex,
    lastSavedAt,
    currentQuestion,
    formattedTime,
    totalAnswered,
    initializeExam,
    selectAnswer,
    isOptionSelected,
    toggleMarkQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    goToQuestion,
    submitExam,
    resetExam,
    loadSavedSession,
    onUnmounted,
    autoSave
  }
})