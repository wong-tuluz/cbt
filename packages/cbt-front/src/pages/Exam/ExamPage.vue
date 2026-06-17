<template>
  <div v-if="!examStore.session" class="min-h-screen bg-background flex items-center justify-center">
    <div class="text-center">
      <p class="text-muted-foreground">Memuat ujian...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-background exam-mode">
    <!-- Header -->
    <header class="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- Info Ujian -->
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileTextIcon class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 class="font-bold text-lg truncate max-w-xs md:max-w-md text-card-foreground">
                {{ examContext.agendaTitle }} -
                <span class="font-normal">
                  {{ examContext.title }}
                </span>
              </h1>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon class="w-4 h-4" />
                <span>{{ student.nama }}</span>
                <span class="text-border">|</span>
                <span>NIS: {{ student.nis }}</span>
              </div>
            </div>
          </div>

          <!-- Status & Timer -->
          <div class="flex items-center gap-4">
            <!-- Pending Retry Warning -->
            <div
              v-if="examStore.hasPendingRetries"
              class="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive"
              title="Beberapa jawaban gagal tersimpan ke server dan sedang dicoba ulang"
            >
              <WifiOffIcon class="w-3 h-3" />
              <span class="hidden sm:inline">{{ examStore.pendingRetries.size }} jawaban pending</span>
            </div>

            <!-- Auto Save Status -->
            <div
              v-else
              class="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors"
              :class="examStore.session?.isAutoSaving
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-success/10 text-success'"
              :title="examStore.session?.isAutoSaving ? 'Menyimpan...' : 'Semua jawaban tersimpan'"
            >
              <CloudIcon class="w-3 h-3" />
              <span class="hidden sm:inline">
                {{ examStore.session?.isAutoSaving ? 'Menyimpan...' : 'Tersimpan' }}
              </span>
            </div>

            <!-- Answered Count -->
            <div class="text-sm text-muted-foreground">
              <span class="font-semibold text-card-foreground">{{ examStore.totalAnswered }}</span>
              <span> / {{ examStore.session?.totalQuestions }} soal terjawab</span>
            </div>

            <!-- Timer -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors bg-primary/10 text-primary">
              <ClockIcon class="w-5 h-5" />
              <span>{{ examStore.formattedTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Question Area -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Question Card -->
          <div v-if="examStore.currentQuestion" class="bg-card rounded-xl p-6 shadow-sm border border-border animate-fade-in">
            <!-- Header dengan Mark Button -->
            <div class="flex items-start justify-between gap-4 mb-6">
              <div class="flex items-start gap-4 flex-1">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {{ examStore.currentQuestion.index }}
                </span>
                <div class="flex-1">
                  <div 
                    class="text-lg font-medium leading-relaxed text-card-foreground prose-direct" 
                    v-html="examStore.currentQuestion.prompt"
                  ></div>
                </div>
              </div>
              
              <!-- Mark Button -->
              <Button
                variant="outline"
                size="sm"
                @click="examStore.toggleMarkQuestion()"
                :class="examStore.currentQuestion.isMarked 
                  ? 'bg-warning/20 text-muted-foreground border-warning hover:bg-warning/30 hover:text-muted-foreground' 
                  : 'bg-accent/80 text-muted-foreground hover:bg-warning/30'"
                class="gap-2 flex-shrink-0"
              >
                <BookmarkIcon 
                  :class="examStore.currentQuestion.isMarked ? 'fill-current' : ''"
                  class="w-4 h-4" 
                />
                <span class="hidden sm:inline">
                  {{ examStore.currentQuestion.isMarked ? 'Ditandai' : 'Tandai' }}
                </span>
              </Button>
            </div>

            <!-- Options -->
            <div class="space-y-3">
              <button
                v-for="option in examStore.currentQuestion.options"
                :key="option.jawabanSoalId"
                @click="selectAnswer(option.jawabanSoalId)"
                class="w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left"
                :class="getOptionClasses(option.jawabanSoalId)"
              >
                <span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors"
                  :class="getOptionLabelClasses(option.jawabanSoalId)">
                  {{ getOptionLabel(option) }}
                </span>
                <div class="flex-1 text-card-foreground" v-html="option.value"></div>
                <div class="text-primary">
                  <!-- Single Choice: Radio Icon -->
                  <template v-if="examStore.currentQuestion.type === 'single-choice'">
                    <CircleIcon 
                      v-if="!isSelected(option.jawabanSoalId)" 
                      class="w-5 h-5 text-muted-foreground/30" 
                    />
                    <CircleDotIcon 
                      v-else 
                      class="w-5 h-5 text-primary" 
                    />
                  </template>
                  
                  <!-- Multiple Choice: Checkbox Icon -->
                  <template v-else>
                    <SquareIcon 
                      v-if="!isSelected(option.jawabanSoalId)" 
                      class="w-5 h-5 text-muted-foreground/30" 
                    />
                    <CheckSquareIcon 
                      v-else 
                      class="w-5 h-5 text-primary" 
                    />
                  </template>
                </div>
              </button>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex items-center justify-between gap-4">
            <!-- Previous Button -->
            <Button
              variant="outline"
              :disabled="examStore.currentQuestionIndex === 0"
              @click="examStore.goToPreviousQuestion()"
              class="gap-2"
            >
              <ChevronLeftIcon class="w-4 h-4" />
              Sebelumnya
            </Button>

            <!-- Next Button -->
            <Button
              variant="outline"
              :disabled="examStore.currentQuestionIndex >= (examStore.session?.totalQuestions || 1) - 1"
              @click="examStore.goToNextQuestion()"
              class="gap-2"
            >
              Selanjutnya
              <ChevronRightIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1 space-y-4">
          <!-- Question Navigation -->
          <div class="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-muted-foreground">Navigasi Soal</h3>
            </div>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="(question, idx) in examStore.session?.questions || []"
                :key="question.soalId"
                @click="examStore.goToQuestion(idx)"
                class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200"
                :class="getQuestionNavClasses(question)"
              >
                {{ question.index }}
              </button>
            </div>
            <div class="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-success"></div>
                <span>Terjawab</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-warning/40"></div>
                <span>Ditandai</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-muted"></div>
                <span>Belum dijawab</span>
              </div>
            </div>
            <!-- Submit Button (Desktop) -->
            <div class="hidden md:flex justify-end gap-2 pt-4">
              <Button @click="handleSubmitExam" class="gap-2">
                <SendIcon class="w-4 h-4" />
                Selesai & Review
              </Button>
            </div>
          </div>

          <!-- Submit Button (Mobile) -->
          <div class="md:hidden">
            <Button @click="handleSubmitExam" class="w-full gap-2">
              <SendIcon class="w-4 h-4" />
              Selesai & Review
            </Button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FileTextIcon,
  UserIcon,
  CloudIcon,
  ClockIcon,
  CircleIcon,
  CircleDotIcon,
  SquareIcon,
  CheckSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SendIcon,
  BookmarkIcon,
  WifiOffIcon
} from 'lucide-vue-next'
import { useExamStore } from '@/stores/examStore'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Student } from '@/types/ICommon'
import { getStudentData } from '@/services/eventService'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const examStore = useExamStore()
const raw = sessionStorage.getItem('examContext')
const examContext = raw ? JSON.parse(raw) : null

const student = ref<Student>({
  id: '',
  nama: '',
  nis: '',
  kelas: '',
  username: ''
})

const fetchData = async () => {  
  student.value = await getStudentData()
}

// Computed helpers
const isSelected = (jawabanSoalId: string) => {
  return examStore.isOptionSelected(jawabanSoalId)
}

const getOptionLabel = (option: any) => {
  // Generate A, B, C, D based on index
  const index = examStore.currentQuestion?.options.findIndex(opt => opt.jawabanSoalId === option.jawabanSoalId)
  return String.fromCharCode(65 + (index || 0))
}

const getOptionClasses = (jawabanSoalId: string) => {
  if (isSelected(jawabanSoalId)) {
    return 'border-primary bg-primary/5 hover:bg-primary/10'
  }
  return 'border-border hover:border-primary/50 hover:bg-muted/50'
}

const getOptionLabelClasses = (jawabanSoalId: string) => {
  if (isSelected(jawabanSoalId)) {
    return 'bg-primary text-primary-foreground'
  }
  return 'bg-muted text-muted-foreground'
}

// Methods
const selectAnswer = (jawabanSoalId: string) => {
  examStore.selectAnswer(jawabanSoalId)
}

const getQuestionNavClasses = (question: any) => {
  const classes = []
  
  if (question.index === examStore.currentQuestion?.index) {
    classes.push('bg-primary text-primary-foreground ring-2 ring-primary/20')
  } 
  else if (question.isMarked) {
    classes.push('bg-warning/20 text-warning hover:bg-warning/30')
  } 
  else if (question.isAnswered) {
    classes.push('bg-success/20 text-success hover:bg-success/30')
  } 
  else {
    classes.push('bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground')
  }
  return classes.join(' ')
}

const handleSubmitExam = async () => {
  await examStore.submitAnswerToAPI()
  router.push(`/exam/${route.params.id}/summary`)
}

// Lifecycle
onMounted(async () => {
  await fetchData()
  const sessionId = route.params.id as string
  
  if (!sessionId) {
    toast({
      title: 'Error',
      description: 'Session ID tidak ditemukan',
      variant: 'destructive'
    })
    router.push('/')
    return
  }

  // Coba load saved session dulu
  const hasSavedSession = examStore.loadSavedSession(sessionId)
  
  if (!hasSavedSession) {
    try {
      // Initialize dari data API yang ada di localStorage
      await examStore.initializeExam(sessionId)
    } catch (error) {
      toast({
        title: 'Gagal memuat ujian',
        description: 'Terjadi kesalahan saat memuat ujian. Pastikan data soal sudah tersedia.',
        variant: 'destructive'
      })
      console.error('Error:', error)
      router.push('/')
    }
  } else {
    console.log('Session restored to question:', examStore.currentQuestionIndex + 1)
  }

})
</script>

<style scoped>
/* Custom animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions */
.question-nav-item {
  transition: all 0.2s ease;
}
</style>