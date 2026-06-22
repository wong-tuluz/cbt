<template>
  <div class="bg-background min-h-screen">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-card-foreground">Detail Jawaban Siswa</h1>
          <p class="text-sm text-muted-foreground mt-1">Soal, jawaban, dan kebenaran jawaban siswa</p>
        </div>
        <Button @click="router.back()" variant="outline" size="sm" class="gap-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20 text-muted-foreground">
        <p>{{ error }}</p>
      </div>

      <template v-else-if="results">
        <!-- Score Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-card border border-border rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Total Soal</p>
            <p class="text-2xl font-bold text-card-foreground">{{ results.questions.length }}</p>
          </div>
          <div class="bg-card border border-success/20 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Benar</p>
            <p class="text-2xl font-bold text-success">{{ correctCount }}</p>
          </div>
          <div class="bg-card border border-destructive/20 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Salah</p>
            <p class="text-2xl font-bold text-destructive">{{ wrongCount }}</p>
          </div>
          <div class="bg-card border border-border rounded-lg p-4">
            <p class="text-sm text-muted-foreground">Tidak Dijawab</p>
            <p class="text-2xl font-bold text-muted-foreground">{{ unansweredCount }}</p>
          </div>
        </div>

        <!-- Questions List -->
        <div class="space-y-4">
          <div
            v-for="(question, idx) in results.questions"
            :key="question.soalId"
            class="bg-card border rounded-lg overflow-hidden"
            :class="getQuestionBorderClass(question)"
          >
            <!-- Question Header -->
            <div class="flex items-start gap-3 p-4 border-b border-border">
              <span
                class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                :class="getQuestionBadgeClass(question)"
              >
                {{ idx + 1 }}
              </span>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="getStatusBadgeClass(question)">
                    <component :is="getStatusIcon(question)" class="w-3 h-3 inline mr-1" />
                    {{ getStatusText(question) }}
                  </span>
                  <span class="text-xs text-muted-foreground capitalize">{{ question.type }}</span>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p class="text-card-foreground text-sm" v-html="question.prompt"></p>
              </div>
            </div>

            <!-- Options -->
            <div class="p-4 space-y-2">
              <div
                v-for="option in question.options"
                :key="option.jawabanSoalId"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border"
                :class="getOptionClass(option)"
              >
                <!-- Indicator icons -->
                <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <CheckCircleIcon v-if="option.isCorrect" class="w-4 h-4 text-success" />
                  <XCircleIcon v-else-if="option.isSelected && !option.isCorrect" class="w-4 h-4 text-destructive" />
                  <div v-else class="w-3 h-3 rounded-full border border-border"></div>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span class="flex-1" v-html="option.value"></span>
                <div class="flex gap-1">
                  <span v-if="option.isSelected" class="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    Dipilih
                  </span>
                  <span v-if="option.isCorrect" class="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">
                    Kunci
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { getExamResult, type ResultQuestion } from '@/services/resultService'
import { router } from '@/router'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)

const loading = ref(true)
const error = ref<string | null>(null)
const results = ref<{ id: string; status: string; questions: ResultQuestion[] } | null>(null)

const correctCount = computed(() =>
  results.value?.questions.filter(q => q.isAnswered && q.options.some(o => o.isSelected && o.isCorrect)).length ?? 0
)
const wrongCount = computed(() =>
  results.value?.questions.filter(q => q.isAnswered && !q.options.some(o => o.isSelected && o.isCorrect)).length ?? 0
)
const unansweredCount = computed(() =>
  results.value?.questions.filter(q => !q.isAnswered).length ?? 0
)

function isAnsweredCorrectly(q: ResultQuestion) {
  return q.isAnswered && q.options.some(o => o.isSelected && o.isCorrect)
}

function getQuestionBorderClass(q: ResultQuestion) {
  if (!q.isAnswered) return 'border-border'
  return isAnsweredCorrectly(q) ? 'border-success/40' : 'border-destructive/40'
}

function getQuestionBadgeClass(q: ResultQuestion) {
  if (!q.isAnswered) return 'bg-muted text-muted-foreground'
  return isAnsweredCorrectly(q) ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
}

function getStatusBadgeClass(q: ResultQuestion) {
  if (!q.isAnswered) return 'bg-muted text-muted-foreground'
  return isAnsweredCorrectly(q) ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
}

function getStatusIcon(q: ResultQuestion) {
  if (!q.isAnswered) return MinusCircleIcon
  return isAnsweredCorrectly(q) ? CheckCircleIcon : XCircleIcon
}

function getStatusText(q: ResultQuestion) {
  if (!q.isAnswered) return 'Tidak Dijawab'
  return isAnsweredCorrectly(q) ? 'Benar' : 'Salah'
}

function getOptionClass(option: { isSelected: boolean; isCorrect: boolean }) {
  if (option.isCorrect && option.isSelected) return 'bg-success/10 border-success/40 text-success'
  if (option.isCorrect) return 'bg-success/5 border-success/30 text-card-foreground'
  if (option.isSelected) return 'bg-destructive/10 border-destructive/40 text-destructive'
  return 'border-transparent text-muted-foreground'
}

onMounted(async () => {
  try {
    const res = await getExamResult(sessionId.value)
    if (res.success) {
      results.value = res.data
    } else {
      error.value = 'Gagal memuat data jawaban siswa'
    }
  } catch {
    error.value = 'Terjadi kesalahan saat memuat data'
  } finally {
    loading.value = false
  }
})
</script>
