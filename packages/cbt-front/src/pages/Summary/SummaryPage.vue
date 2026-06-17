<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="bg-card border-b border-border">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileCheckIcon class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 class="font-bold text-xl text-card-foreground">Rekap Ujian</h1>
              <p class="text-sm text-muted-foreground">Ujian Session</p>
            </div>
          </div>
          
          <Button variant="outline" @click="goBack" class="gap-2">
            <ArrowLeftIcon class="w-4 h-4" />
            Kembali ke Soal
          </Button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-12">
      <div class="text-center">
        <div class="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-muted-foreground">Memuat ringkasan ujian...</p>
      </div>
    </div>

    <!-- Content -->
    <main v-else-if="displayData" class="container mx-auto px-4 py-8">
      <!-- Score Card -->
      <div class="bg-card rounded-xl p-8 shadow-sm border border-border mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Progress Circle -->
          <div class="lg:col-span-1 flex flex-col items-center justify-center text-center">
            <div class="relative w-40 h-40 mb-4">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" class="text-muted/30" stroke-width="8" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" :class="progressColor" stroke-width="8" fill="none"
                  :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset" stroke-linecap="round"
                  class="transition-all duration-500" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-bold" :class="progressColor">{{ completionPercentage }}%</span>
                <span class="text-sm text-muted-foreground">diselesaikan</span>
              </div>
            </div>
            
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              :class="completionPercentage === 100 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'">
              <AlertCircleIcon v-if="completionPercentage < 100" class="w-5 h-5" />
              <CheckIcon v-else class="w-5 h-5" />
              <span class="font-semibold">{{ completionPercentage === 100 ? 'SEMUA TERJAWAB' : 'BELUM LENGKAP' }}</span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="lg:col-span-2 grid grid-cols-2 gap-4">
            <div class="bg-success/5 border border-success/20 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckIcon class="w-6 h-6 text-success" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Soal Dijawab</p>
                  <p class="text-xl font-bold text-card-foreground">{{ stats.answeredCount }}</p>
                </div>
              </div>
            </div>

            <div class="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <BookmarkIcon class="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Soal Ditandai</p>
                  <p class="text-xl font-bold text-card-foreground">{{ stats.markedCount }}</p>
                </div>
              </div>
            </div>

            <div class="bg-muted/50 border border-border rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <AlertCircleIcon class="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Tidak Dijawab</p>
                  <p class="text-xl font-bold text-card-foreground">{{ stats.unansweredCount }}</p>
                </div>
              </div>
            </div>

            <div class="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClockIcon class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Waktu</p>
                  <p class="text-x font-bold text-card-foreground">{{ displayData.timeSpent }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 class="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <UserIcon class="w-5 h-5 text-primary" />
            Informasi Peserta
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Nama</span>
              <span class="font-medium text-card-foreground">{{ displayData.studentName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">NIS</span>
              <span class="font-medium text-card-foreground">{{ displayData.studentNis }}</span>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 class="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <CalendarIcon class="w-5 h-5 text-primary" />
            Ringkasan
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Time End</span>
              <span class="font-medium text-card-foreground">{{ examContext.timeEnd }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Event</span>
              <span class="font-medium text-card-foreground">{{ examContext.agendaTitle }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Materi</span>
              <span class="font-medium text-card-foreground">{{ examContext.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Tanggal</span>
              <span class="font-medium text-card-foreground">{{ formatDate(displayData.submittedAt) }}</span>
            </div>
            <!-- <div class="flex justify-between">
              <span class="text-muted-foreground">Waktu</span>
              <span class="font-medium text-card-foreground">{{ formatTime(displayData.submittedAt) }}</span>
            </div> -->
            <div class="flex justify-between">
              <span class="text-muted-foreground">Sisa Waktu</span>
              <span class="font-medium text-card-foreground">{{ displayData.timeSpent }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Review Jawaban -->
      <div class="bg-card rounded-xl p-6 shadow-sm border border-border mb-6">
        <h3 class="font-semibold text-card-foreground mb-4">Review Jawaban</h3>
        <div class="space-y-4">
          <div v-for="question in displayData.questions" :key="question.soalId" 
            class="p-4 rounded-lg border"
            :class="question.isAnswered ? 'border-success/20 bg-success/5' : 'border-muted bg-muted/20'">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="question.isAnswered ? 'bg-success text-white' : 'bg-muted text-muted-foreground'">
                {{ question.index }}
              </div>
              <div class="flex-1">
                <div class="font-medium mb-2" v-html="question.prompt"></div>
                
                <!-- Jawaban User -->
                <div v-if="question.isAnswered" class="mt-2">
                  <p class="text-sm font-semibold text-success">Jawaban Anda:</p>
                  
                  <!-- Single Choice -->
                  <div v-if="question.type === 'single-choice' && question.userAnswer" class="mt-1">
                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full">
                      <span class="font-medium">{{ question.userAnswer }}</span>
                      <span v-html="getOptionText(question, question.userAnswer)"></span>
                    </div>
                  </div>
                  
                  <!-- Multiple Choice -->
                  <div v-else-if="question.type === 'multiple-choice' && question.userAnswers" class="mt-1">
                    <div class="flex flex-wrap gap-2">
                      <div v-for="answer in question.userAnswers" :key="answer"
                        class="inline-flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full">
                        <span class="font-medium">{{ answer }}</span>
                        <span v-html="getOptionText (question, answer)"></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Belum Dijawab -->
                <div v-else class="mt-2">
                  <p class="text-sm text-muted-foreground italic">Belum dijawab</p>
                </div>
              </div>
              
              <!-- Status -->
              <div class="flex-shrink-0">
                <div v-if="question.isMarked" class="text-warning">
                  <BookmarkIcon class="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between">
        <Button @click="goBack" variant="outline" class="gap-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali ke Soal
        </Button>

        <!-- Normal confirm dialog -->
        <Dialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
          <DialogTrigger as-child>
            <Button @click="showConfirmDialog = true" class="gap-2 bg-primary hover:bg-primary/80">
              <Send class="w-4 h-4" />
              Submit & Akhiri Ujian
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kumpulkan Ujian?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin mengumpulkan ujian? Pastikan semua jawaban sudah diperiksa.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter class="gap-2">
              <Button variant="outline" @click="showConfirmDialog = false">Batal</Button>
              <Button @click="goResult" :disabled="submitting" class="bg-primary hover:bg-primary/80">
                <span v-if="submitting" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                Ya, Kumpulkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- Pending-retries warning dialog -->
        <Dialog :open="showRetryWarning" @update:open="showRetryWarning = $event">
          <DialogContent>
            <DialogHeader>
              <DialogTitle class="text-destructive">Jawaban Belum Terkirim</DialogTitle>
              <DialogDescription>
                <strong>{{ pendingCount }} jawaban</strong> gagal dikirim ke server karena masalah koneksi.
                Jika Anda tetap mengumpulkan sekarang, jawaban tersebut mungkin tidak tercatat.
                <br /><br />
                Kembali ke soal dan coba lagi setelah koneksi stabil, atau kumpulkan sekarang dengan risiko jawaban hilang.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter class="gap-2">
              <Button variant="outline" @click="showRetryWarning = false">Kembali & Coba Lagi</Button>
              <Button @click="finishAnyway" :disabled="submitting" variant="destructive">
                <span v-if="submitting" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                Kumpulkan Sekarang
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>

    <!-- Error State -->
    <div v-else class="container mx-auto px-4 py-12">
      <div class="text-center">loading......</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileCheckIcon, CheckIcon, ClockIcon, AlertCircleIcon, UserIcon, CalendarIcon, BookmarkIcon, Send, ArrowLeftIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { useExamStore } from '@/stores/examStore'
import { useToast } from '@/hooks/use-toast'
import { endSession } from '@/services/workSessionService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const examStore = useExamStore()
const { toast } = useToast()

const showConfirmDialog = ref(false)
const showRetryWarning = ref(false)
const submitting = ref(false)
const pendingCount = ref(0)

const raw = sessionStorage.getItem('examContext')
const examContext = raw ? JSON.parse(raw) : null

// Interface untuk display
interface DisplayQuestion {
  soalId: string
  index: number
  prompt: string
  type: 'single-choice' | 'multiple-choice'
  options: Array<{
    jawabanSoalId: string
    value: string
    isSelected: boolean
  }>
  isMarked: boolean
  isAnswered: boolean
  userAnswer?: string
  userAnswers?: string[]
}

// Stats
const stats = computed(() => {
  if (!examStore.session?.questions) {
    return { totalQuestions: 0, answeredCount: 0, unansweredCount: 0, markedCount: 0 }
  }
  
  const questions = examStore.session.questions
  const answeredCount = questions.filter(q => q.isAnswered).length
  const markedCount = questions.filter(q => q.isMarked).length
  
  return {
    totalQuestions: questions.length,
    answeredCount,
    unansweredCount: questions.length - answeredCount,
    markedCount
  }
})

// Helper: Get option text by label (A, B, C)
const getOptionText = (question: DisplayQuestion, label: string) => {
  const index = label.charCodeAt(0) - 65 // A=0, B=1, C=2, ...
  return question.options[index]?.value || 'Tidak diketahui'
}

// Helper: Get option label from jawabanSoalId
const getOptionLabel = (question: DisplayQuestion, jawabanSoalId: string) => {
  const index = question.options.findIndex(opt => opt.jawabanSoalId === jawabanSoalId)
  return index !== -1 ? String.fromCharCode(65 + index) : '?'
}

// Completion percentage
const completionPercentage = computed(() => {
  if (!stats.value || stats.value.totalQuestions === 0) return 0
  return Math.round((stats.value.answeredCount / stats.value.totalQuestions) * 100)
})

// Display data
const displayData = computed(() => {
  if (!examStore.session) return null
  
  const session = examStore.session
  
  return {
    examId: session.id,
    studentName: session.studentName,
    studentNis: session.studentNis,
    timeSpent: examStore.formattedTime || '00:00:00',
    submittedAt: new Date().toISOString(),
    
    questions: session.questions.map((question): DisplayQuestion => {
      const selectedOptions = question.options.filter(opt => opt.isSelected)
      const selectedLabels = selectedOptions.map(opt => getOptionLabel(question, opt.jawabanSoalId))
      
      return {
        soalId: question.soalId,
        index: question.index,
        prompt: question.prompt,
        type: question.type,
        options: question.options,
        isMarked: question.isMarked,
        isAnswered: question.isAnswered,
        userAnswer: question.type === 'single-choice' ? selectedLabels[0] : undefined,
        userAnswers: question.type === 'multiple-choice' ? selectedLabels : undefined
      }
    })
  }
})

// Progress circle
const circumference = 2 * Math.PI * 70
const progressOffset = computed(() => {
  const progress = completionPercentage.value / 100
  return circumference - (progress * circumference)
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage === 100) return 'text-success'
  if (percentage >= 75) return 'text-primary'
  if (percentage >= 50) return 'text-warning'
  return 'text-destructive'
})

onMounted(async () => {
  const sessionId = route.params.id as string

  if (!examStore.session) {
    const hasSession = examStore.loadSavedSession(sessionId)

    if (!hasSession) {
      toast({
        title: 'Data ujian tidak ditemukan',
        description: 'Silakan kerjakan ujian terlebih dahulu',
        variant: 'destructive'
      })
      router.push(`/exam/${sessionId}`)
      return
    }
  }

  // Flush any failed submissions then pull server state so counts are accurate
  await examStore.flushPendingRetries()
  await examStore.syncStateFromServer()

  if (examStore.hasPendingRetries) {
    toast({
      title: 'Beberapa jawaban belum tersimpan',
      description: `${examStore.pendingRetries.size} jawaban gagal dikirim ke server. Periksa koneksi internet Anda.`,
      variant: 'destructive'
    })
  }

  loading.value = false

  const autoSubmitTimer = setInterval(() => {
    const now = new Date()
    if (examContext && examContext.timeEnd) {
      const [targetHour, targetMinute] = examContext.timeEnd.split('.').map(Number)
      
      if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
        goResult()
        clearInterval(autoSubmitTimer)
      }
    }
  }, 10000)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const goBack = () => {
  router.push(`/exam/${route.params.id}`)
}

const submitSession = async () => {
  const sessionId = route.params.id as string
  try {
    await endSession(sessionId)
    toast({
      title: 'Ujian berhasil dikumpulkan',
      description: 'Semoga Mendapat Hasil Yang Memuaskan',
      variant: 'default'
    })
  } catch (error) {
    toast({
      title: 'Gagal mengumpulkan ujian',
      description: 'Terjadi kesalahan saat mengumpulkan ujian. Silakan coba lagi.',
      variant: 'destructive'
    })
  }
}

const cleanup = () => {
  localStorage.removeItem("soal")
  sessionStorage.removeItem("examContext")
  localStorage.removeItem("exam_state_" + route.params.id)
  examStore.clearPendingRetries(route.params.id as string)
  examStore.resetExam()
}

const goResult = async () => {
  submitting.value = true
  // Force-flush: retry even questions that hit MAX_ATTEMPTS — last chance before session ends
  await examStore.flushPendingRetries(true)

  if (examStore.hasPendingRetries) {
    pendingCount.value = examStore.pendingRetries.size
    submitting.value = false
    showConfirmDialog.value = false
    showRetryWarning.value = true
    return
  }

  await submitSession()
  cleanup()
  submitting.value = false
  router.push(`/dashboard`)
}

const finishAnyway = async () => {
  submitting.value = true
  await submitSession()
  cleanup()
  submitting.value = false
  router.push(`/dashboard`)
}
</script>

<style scoped>
@media print {
  header button,
  main > div:last-child {
    display: none;
  }
}
</style>