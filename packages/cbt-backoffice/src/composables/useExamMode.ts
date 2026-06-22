import { useToast } from '@/hooks/use-toast'
import { endSession } from '@/services/pengerjaanService'
import { getSoal, warnExam } from '@/services/eventService'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Singleton State
const isExamActive = ref(false)
const isFullscreen = ref(false)
const showWarningModal = ref(false)
const violationCount = ref(0)
let lastViolationTime = 0 // Untuk handle debounce/cooldown

export function useExamMode() {
  const route = useRoute()
  const router = useRouter()
  const { toast } = useToast()

  let idleTimer: number | null = null
  let cleanupSecurity: (() => void) | null = null

  const IDLE_TIMEOUT = 300000 // 5 Menit
  const VIOLATION_COOLDOWN = 2000 // Jeda 2 detik agar tidak spam di HP

  const requestFullscreen = async (): Promise<boolean> => {
    try {
      const elem = document.documentElement as any
      const methods = ['requestFullscreen', 'webkitRequestFullscreen', 'msRequestFullscreen']
      for (const method of methods) {
        if (elem[method]) {
          await elem[method]()
          return true
        }
      }
      return false
    } catch (error) {
      return false
    }
  }

  const autoSubmitExam = async () => {
    if (!isExamActive.value) return 
    
    // Matikan mode ujian segera untuk mencegah trigger ganda & hapus semua listener
    await deactivateExamMode()
    
    console.warn("Sistem: Mengirim jawaban otomatis...")
    const sessionId = route.params.id as string

    try {
      if (sessionId) await endSession(sessionId)

      toast({
        title: 'Ujian dikumpulkan otomatis',
        description: 'Anda telah melanggar aturan ujian!.',
        variant: 'default'
      })
    } catch (err) {
      console.error("Gagal auto-submit:", err)
    } finally {
      router.push('/login')
    }
  }

  // Watcher untuk auto submit jika strike melebihi batas (3 atau lebih)
  watch(violationCount, (count) => {
    if (isExamActive.value && count > 2) {
      autoSubmitExam()
    }
  })

  // Fungsi Tambah Pelanggaran dengan Cooldown
  const incrementViolation = async () => {
    const now = Date.now()
    if (now - lastViolationTime > VIOLATION_COOLDOWN) {
      lastViolationTime = now
      const sessionId = route.params.id as string

      if (sessionId) {
        try {
          const response = await warnExam(sessionId)
          // Update violationCount dari DB. Watcher akan menangani autoSubmit.
          violationCount.value = response.data.strike
        } catch (error) {
          console.error("Gagal mengirim peringatan ke DB:", error)
        }
      }
    }
  }

  // ==================== SECURITY & IDLE ====================

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer)
    if (isExamActive.value) {
      idleTimer = window.setTimeout(() => {
        autoSubmitExam()
      }, IDLE_TIMEOUT)
    }
  }

  const enableExamSecurity = () => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault()

    const preventDevTools = (e: KeyboardEvent) => {
      const forbidden = [
        e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key),
        e.key === 'F12',
        (e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'),
        e.key === 'F5'
      ]
      if (forbidden.some(Boolean)) {
        e.preventDefault()
        return false
      }
    }

    const handleInactivity = () => {
      if ((document.hidden || !document.hasFocus()) && isExamActive.value) {
        showWarningModal.value = true
        incrementViolation() // Pakai fungsi cooldown
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(ev => document.addEventListener(ev, resetIdleTimer))

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventDevTools)
    document.addEventListener('visibilitychange', handleInactivity)
    window.addEventListener('blur', handleInactivity)

    return () => {
      events.forEach(ev => document.removeEventListener(ev, resetIdleTimer))
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventDevTools)
      document.removeEventListener('visibilitychange', handleInactivity)
      window.removeEventListener('blur', handleInactivity)
      if (idleTimer) clearTimeout(idleTimer)
    }
  }

  const setupFullscreenListeners = () => {
    const handleFSChange = () => {
      const doc = document as any
      isFullscreen.value = !!(document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement)

      if (isExamActive.value && !isFullscreen.value) {
        showWarningModal.value = true
        incrementViolation() // Pakai fungsi cooldown
      }
    }

    document.addEventListener('fullscreenchange', handleFSChange)
    document.addEventListener('webkitfullscreenchange', handleFSChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange)
      document.removeEventListener('webkitfullscreenchange', handleFSChange)
    }
  }

  // ==================== CONTROLS ====================

  const activateExamMode = async () => {
    if (isExamActive.value) return
    await requestFullscreen()

    cleanupSecurity = enableExamSecurity()
    const fsCleanup = setupFullscreenListeners()

    const oldCleanup = cleanupSecurity
    cleanupSecurity = () => {
      if (oldCleanup) oldCleanup()
      if (fsCleanup) fsCleanup()
    }

    isExamActive.value = true

    // Sync strike count dari database saat aktivasi
    const sessionId = route.params.id as string
    if (sessionId) {
      try {
        const response = await getSoal(sessionId)
        violationCount.value = response.data.strike
        // Tidak perlu cek manual di sini, watcher sudah menangani jika strike > 2
      } catch (error) {
        console.error("Gagal mengambil data strike:", error)
      }
    }

    resetIdleTimer()
  }

  const deactivateExamMode = async () => {
    if (!isExamActive.value) return
    if (cleanupSecurity) cleanupSecurity()
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => { })

    isExamActive.value = false
    showWarningModal.value = false
    violationCount.value = 0
  }

  const watchExamRoutes = () => {
    watch(() => route.meta?.examMode, async (val) => {
      if (val) await activateExamMode()
      else await deactivateExamMode()
    }, { immediate: true })
  }

  const reEnterFullscreen = async () => {
    const success = await requestFullscreen()
    if (success) showWarningModal.value = false
  }

  return {
    isExamActive,
    showWarningModal,
    violationCount,
    watchExamRoutes,
    reEnterFullscreen,
    deactivateExamMode,
    autoSubmitExam
  }
}