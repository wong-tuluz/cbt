import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExamSession } from '@/types/IExam'
import { getExamById, submitAnswer, submitExam, getSessionState, type SubmitAnswerPayload } from '@/services/examService'

export const useExamStore = defineStore('exam', () => {
  // State
  const session = ref<ExamSession | null>(null)
  const currentQuestionIndex = ref(0)
  const lastSavedAt = ref<string | null>(null)
  const timerInterval = ref<number | null>(null)
  const resyncInterval = ref<number | null>(null)
  const examDuration = ref<number>(90 * 60)
  const examEndTime = ref<number | null>(null)

  // Submission serializer — only one submit in-flight at a time
  let submitQueue: Promise<void> = Promise.resolve()

  const enqueueSubmit = (fn: () => Promise<void>): Promise<void> => {
    submitQueue = submitQueue.then(() => fn()).catch(() => {/* errors handled inside fn */})
    return submitQueue
  }

  // Retry queue: soalId → attempt count. Payload is always rebuilt from current local state at flush time.
  const pendingRetries = ref<Map<string, number>>(new Map())
  const hasPendingRetries = computed(() => pendingRetries.value.size > 0)

  const RETRY_QUEUE_KEY = (sessionId: string) => `exam_retry_${sessionId}`
  const MAX_ATTEMPTS = 5

  const savePendingRetries = (sessionId: string) => {
    localStorage.setItem(RETRY_QUEUE_KEY(sessionId), JSON.stringify(Array.from(pendingRetries.value.entries())))
  }

  const loadPendingRetries = (sessionId: string) => {
    const raw = localStorage.getItem(RETRY_QUEUE_KEY(sessionId))
    if (!raw) return
    try {
      const entries: [string, number][] = JSON.parse(raw)
      pendingRetries.value = new Map(entries)
    } catch {
      localStorage.removeItem(RETRY_QUEUE_KEY(sessionId))
    }
  }

  const clearPendingRetries = (sessionId: string) => {
    pendingRetries.value.clear()
    localStorage.removeItem(RETRY_QUEUE_KEY(sessionId))
  }

  const buildPayloadForQuestion = (soalId: string): SubmitAnswerPayload | null => {
    if (!session.value) return null
    const q = session.value.questions.find(q => q.soalId === soalId)
    if (!q) return null
    return {
      soalId: q.soalId,
      marked: q.isMarked,
      jawaban: q.options
        .filter(opt => opt.isSelected)
        .map(opt => ({ jawabanSoalId: opt.jawabanSoalId, value: opt.value }))
    }
  }

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
    loadPendingRetries(sessionId)
    saveToLocalStorage()
    startTimer()
    startResyncInterval()

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

  // Submit jawaban per soal ke API — serialized, queues on failure for retry
  const submitAnswerToAPI = async () => {
    if (!session.value || !currentQuestion.value) return

    const soalId = currentQuestion.value.soalId
    pendingRetries.value.delete(soalId)

    const payload = buildPayloadForQuestion(soalId)
    if (!payload) return

    const sessionId = session.value.id
    await enqueueSubmit(async () => {
      try {
        await submitAnswer(sessionId, payload)
      } catch (error) {
        console.error('Failed to submit answer, queuing for retry:', error)
        pendingRetries.value.set(soalId, 1)
        savePendingRetries(sessionId)
      }
    })
  }

  // Drain the retry queue serially, rebuilding payloads from current local state each time.
  // Pass force=true to retry even questions that have hit MAX_ATTEMPTS (used before endSession).
  const flushPendingRetries = async (force = false) => {
    if (!session.value || pendingRetries.value.size === 0) return

    const sessionId = session.value.id

    for (const [soalId, attempts] of Array.from(pendingRetries.value.entries())) {
      if (!force && attempts >= MAX_ATTEMPTS) continue

      const payload = buildPayloadForQuestion(soalId)
      if (!payload) {
        pendingRetries.value.delete(soalId)
        continue
      }

      await enqueueSubmit(async () => {
        try {
          await submitAnswer(sessionId, payload)
          pendingRetries.value.delete(soalId)
        } catch {
          pendingRetries.value.set(soalId, attempts + 1)
        }
      })
    }
    savePendingRetries(sessionId)
  }

  // Sync local state from server — reconcile isAnswered / isSelected
  const syncStateFromServer = async () => {
    if (!session.value) return

    try {
      const res = await getSessionState(session.value.id)
      if (!res.success || !Array.isArray(res.data)) return

      const serverMap = new Map(res.data.map((q: { soalId: string; isAnswered: boolean; isMarked: boolean; options: Array<{ jawabanSoalId: string; isSelected: boolean }> }) => [q.soalId, q]))

      for (const localQ of session.value.questions) {
        const serverQ = serverMap.get(localQ.soalId)
        if (!serverQ) continue

        // Only override local selection if server has an answer and local doesn't
        // (local is authoritative for in-progress changes; server fills gaps from failed submits)
        if (serverQ.isAnswered && !localQ.isAnswered) {
          localQ.isAnswered = true
          localQ.isMarked = serverQ.isMarked
          for (const localOpt of localQ.options) {
            const serverOpt = serverQ.options.find((o: { jawabanSoalId: string; isSelected: boolean }) => o.jawabanSoalId === localOpt.jawabanSoalId)
            if (serverOpt) localOpt.isSelected = serverOpt.isSelected
          }
        }
      }

      session.value.answeredCount = session.value.questions.filter(q => q.isAnswered).length
      saveToLocalStorage()
    } catch (error) {
      console.error('State resync failed:', error)
    }
  }

  const startResyncInterval = () => {
    if (resyncInterval.value) clearInterval(resyncInterval.value)
    resyncInterval.value = window.setInterval(async () => {
      await flushPendingRetries()
      await syncStateFromServer()
    }, 30_000)
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
    
    loadPendingRetries(sessionId)
    startTimer()
    startResyncInterval()
    return true
  }
  return false
}

  const resetExam = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    if (resyncInterval.value) {
      clearInterval(resyncInterval.value)
      resyncInterval.value = null
    }

    session.value = null
    currentQuestionIndex.value = 0
    lastSavedAt.value = null
    examEndTime.value = null
    examDuration.value = 90 * 60
    pendingRetries.value.clear()
  }

  const onUnmounted = () => {
    if (timerInterval.value) clearInterval(timerInterval.value)
    if (resyncInterval.value) clearInterval(resyncInterval.value)
  }

  return {
    session,
    currentQuestionIndex,
    lastSavedAt,
    currentQuestion,
    formattedTime,
    totalAnswered,
    hasPendingRetries,
    pendingRetries,
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
    autoSave,
    submitAnswerToAPI,
    flushPendingRetries,
    syncStateFromServer,
    clearPendingRetries
  }
})