<template>
  <!-- Template tetap sama, hapus bagian Student Info dan Waktu Pengumpulan -->
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
              <h1 class="font-bold text-xl text-card-foreground">Hasil Ujian</h1>
              <p class="text-sm text-muted-foreground">Ujian Session</p>
            </div>
          </div>
          
          <Button variant="outline" @click="goHome" class="gap-2">
            <HomeIcon class="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-12">
      <div class="text-center">
        <div class="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p class="mt-4 text-muted-foreground">Memuat hasil ujian...</p>
      </div>
    </div>

    <!-- Results Content -->
    <main v-else-if="results" class="container mx-auto px-4 py-8">
      <!-- Score Summary Card -->
      <div class="bg-card rounded-xl p-8 shadow-sm border border-border mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Score -->
          <div class="lg:col-span-1 flex flex-col items-center justify-center text-center">
            <div class="relative w-40 h-40 mb-4">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" class="text-muted/30" stroke-width="8" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" :class="getScoreColorClass(results.score)"
                  stroke-width="8" fill="none" :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset"
                  stroke-linecap="round" class="transition-all duration-1000 ease-out" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-bold text-card-foreground">{{ results.score }}</span>
                <span class="text-sm text-muted-foreground">dari 100</span>
              </div>
            </div>
            
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              :class="results.score >= 75 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'">
              <component :is="results.score >= 75 ? CheckCircleIcon : XCircleIcon" class="w-5 h-5" />
              <span class="font-semibold">{{ results.score >= 75 ? 'LULUS' : 'TIDAK LULUS' }}</span>
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
                  <p class="text-sm text-muted-foreground">Jawaban Benar</p>
                  <p class="text-2xl font-bold text-card-foreground">{{ results.correctAnswers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XIcon class="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Jawaban Salah</p>
                  <p class="text-2xl font-bold text-card-foreground">{{ results.wrongAnswers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClockIcon class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Total Soal</p>
                  <p class="text-2xl font-bold text-card-foreground">{{ results.totalQuestions }}</p>
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
                  <p class="text-2xl font-bold text-card-foreground">{{ results.unansweredCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Review -->
      <div class="bg-card rounded-xl p-6 shadow-sm border border-border mb-6">
        <h3 class="font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
          <ListChecksIcon class="w-5 h-5 text-primary" />
          Review Jawaban
        </h3>

        <div class="grid grid-cols-1 gap-4">
          <div v-for="question in results.questions" :key="question.soalId"
            class="border border-border rounded-lg p-4 transition-colors" :class="getQuestionBgClass(question)">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                :class="getQuestionNumberClass(question)">
                {{ question.index }}
              </div>

              <div class="flex-1 space-y-3">
                <p class="font-medium text-card-foreground" v-html="question.prompt"></p>

                <div class="space-y-2">
                  <div v-for="(option, idx) in question.options" :key="option.jawabanSoalId"
                    class="flex items-center gap-3 p-3 rounded-lg border" :class="getOptionDisplayClass(option)">
                    <span class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      :class="getOptionLabelDisplayClass(option)">
                      {{ String.fromCharCode(65 + idx) }}
                    </span>
                    <span class="flex-1" v-html="option.value"></span>
                    <component v-if="option.isCorrect && option.isSelected" :is="CheckCircleIcon"
                      class="w-5 h-5 text-success flex-shrink-0" />
                    <component v-else-if="option.isCorrect" :is="AlertCircleIcon"
                      class="w-5 h-5 text-success/50 flex-shrink-0" />
                    <component v-else-if="option.isSelected" :is="XCircleIcon"
                      class="w-5 h-5 text-destructive flex-shrink-0" />
                  </div>
                </div>

                <div class="flex flex-col gap-2 text-sm pt-2 border-t border-border">
                  <div class="flex items-center gap-1.5">
                    <span class="text-muted-foreground">Jawaban Anda:</span>
                    <span class="font-medium text-card-foreground" v-html="getUserAnswerText(question)"></span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-muted-foreground">Kunci Jawaban:</span>
                    <span class="font-medium text-success">{{ getCorrectAnswerText(question) }}. </span>
                    <span class="font-medium">({{ getCorrectAnswerTextWithValue(question) }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button @click="printResults" variant="outline" class="gap-2">
          <PrinterIcon class="w-4 h-4" />
          Cetak Hasil
        </Button>
        <Button @click="goHome" class="gap-2">
          <HomeIcon class="w-4 h-4" />
          Kembali ke Beranda
        </Button>
      </div>
    </main>

    <!-- Error State -->
    <div v-else class="container mx-auto px-4 py-12">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircleIcon class="w-8 h-8 text-destructive" />
        </div>
        <h2 class="text-xl font-semibold text-card-foreground mb-2">Hasil Tidak Ditemukan</h2>
        <p class="text-muted-foreground mb-6">Tidak ada hasil ujian yang tersedia</p>
        <Button @click="goHome">Kembali ke Beranda</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  FileCheckIcon, 
  HomeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  CheckIcon, 
  XIcon, 
  ClockIcon, 
  AlertCircleIcon, 
  ListChecksIcon, 
  PrinterIcon 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { getExamResult, type ResultQuestion } from '@/services/resultService'
import { getStudentData } from '@/services/eventService'
import { useToast } from '@/hooks/use-toast'

interface ExamResults {
  examId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unansweredCount: number
  timeSpent: string
  studentName: string
  studentNis: string
  submittedAt: string
  questions: Array<ResultQuestion & { isCorrect: boolean; isAnswered: boolean }>
}

const router = useRouter()
const route = useRoute()
const { toast } = useToast()
const loading = ref(true)
const results = ref<ExamResults | null>(null)

const circumference = 2 * Math.PI * 70
const progressOffset = computed(() => {
  if (!results.value) return circumference
  const progress = results.value.score / 100
  return circumference - (progress * circumference)
})

onMounted(async () => {
  try {
    const sessionId = route.params.id as string
    
    if (!sessionId) {
      toast({
        title: 'Session ID tidak ditemukan',
        variant: 'destructive'
      })
      router.push('/dashboard')
      return
    }

    // Get result langsung dari API
    const apiResult = await getExamResult(sessionId)
    
    if (!apiResult.success || !apiResult.data) {
      toast({
        title: 'Gagal memuat hasil ujian',
        variant: 'destructive'
      })
      loading.value = false
      return
    }

    const student = getStudentData()
    
    // Process questions untuk hitung skor
    const processedQuestions = apiResult.data.questions.map((q: ResultQuestion) => {
      const selectedOptions = q.options.filter(opt => opt.isSelected)
      const correctOptions = q.options.filter(opt => opt.isCorrect)
      
      let isCorrect = false
      let isAnswered = q.isAnswered || selectedOptions.length > 0
      
      if (q.type === 'single-choice') {
        isCorrect = selectedOptions.length === 1 && (selectedOptions[0]?.isCorrect || false)
      } else {
        // Untuk multiple-choice, harus memilih semua yang benar dan tidak memilih yang salah
        const hasAllCorrect = correctOptions.every(correctOpt => 
          selectedOptions.some(selected => selected.jawabanSoalId === correctOpt.jawabanSoalId)
        )
        const hasNoWrong = selectedOptions.every(selected => selected.isCorrect)
        isCorrect = hasAllCorrect && hasNoWrong && selectedOptions.length === correctOptions.length
      }
      
      return { 
        ...q, 
        isCorrect, 
        isAnswered 
      }
    })

    const totalQuestions = processedQuestions.length
    const correctAnswers = processedQuestions.filter((q) => q.isCorrect).length
    const answeredQuestions = processedQuestions.filter((q) => q.isAnswered).length
    const wrongAnswers = answeredQuestions - correctAnswers
    const unansweredCount = totalQuestions - answeredQuestions
    const score = Math.round((correctAnswers / totalQuestions) * 100)

    // Format waktu sekarang (karena API tidak menyediakan waktu submit)
    const now = new Date()
    const timeSpent = '00:00:00' // Default, karena API tidak menyediakan

    results.value = {
      examId: apiResult.data.id,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unansweredCount,
      timeSpent: timeSpent,
      studentName: student?.nama || 'Tidak diketahui',
      studentNis: student?.nis || 'Tidak diketahui',
      submittedAt: now.toISOString(),
      questions: processedQuestions
    }

    loading.value = false
  } catch (error) {
    console.error('Failed to load exam results:', error)
    toast({
      title: 'Terjadi kesalahan',
      description: 'Gagal memuat hasil ujian',
      variant: 'destructive'
    })
    loading.value = false
  }
})

const getUserAnswerText = (question: any) => {
  const selected = question.options
    .map((opt: any, idx: number) => opt.isSelected ? String.fromCharCode(65 + idx) : null)
    .filter((x: any) => x !== null)
  return selected.length > 0 ? selected.join(', ') : 'Tidak dijawab'
}

const getCorrectAnswerText = (question: any) => {
  const correct = question.options
    .map((opt: any, idx: number) => opt.isCorrect ? String.fromCharCode(65 + idx) : null)
    .filter((x: any) => x !== null)
  return correct.join(', ')
}

const getCorrectAnswerTextWithValue = (question: any) => {
  const correctOptions = question.options.filter((opt: any) => opt.isCorrect)
  
  if (correctOptions.length === 0) {
    return 'Tidak ada jawaban benar'
  }
  
  // Jika single choice, tampilkan value-nya langsung
  if (question.type === 'single-choice' && correctOptions.length === 1) {
    return correctOptions[0].value
  }
  
  // Jika multiple choice, tampilkan semua value yang benar dengan huruf
  return correctOptions
    .map((opt: any) => {
      const letterIndex = question.options.findIndex((o: any) => o.jawabanSoalId === opt.jawabanSoalId)
      const letter = String.fromCharCode(65 + letterIndex)
      return `${letter}. ${opt.value}`
    })
    .join(', ')
}

const getScoreColorClass = (score: number) => {
  if (score >= 85) return 'text-success'
  if (score >= 75) return 'text-primary'
  return 'text-destructive'
}

const getQuestionBgClass = (question: any) => {
  if (question.isCorrect) return 'bg-success/5'
  if (!question.isAnswered) return 'bg-muted/30'
  return 'bg-destructive/5'
}

const getQuestionNumberClass = (question: any) => {
  if (question.isCorrect) return 'bg-success/20 text-success'
  if (!question.isAnswered) return 'bg-muted text-muted-foreground'
  return 'bg-destructive/20 text-destructive'
}

const getOptionDisplayClass = (option: any) => {
  if (option.isCorrect && option.isSelected) return 'border-success bg-success/5'
  if (option.isCorrect) return 'border-success/50 bg-success/5'
  if (option.isSelected) return 'border-destructive bg-destructive/5'
  return 'border-border bg-background'
}

const getOptionLabelDisplayClass = (option: any) => {
  if (option.isCorrect && option.isSelected) return 'bg-success text-success-foreground'
  if (option.isCorrect) return 'bg-success/20 text-success'
  if (option.isSelected) return 'bg-destructive text-white'
  return 'bg-muted text-muted-foreground'
}

const printResults = () => {
  window.print()
}

const goHome = () => {
  router.push('/dashboard')
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