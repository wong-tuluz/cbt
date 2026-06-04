<template>
  <main class="p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat hasil ujian...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 mb-8">
      <div class="flex items-center gap-2 text-destructive mb-2">
        <AlertCircleIcon class="h-5 w-5" />
        <h3 class="font-semibold text-lg">Terjadi Kesalahan</h3>
      </div>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <button 
        @click="fetchData"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header dengan Search -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm mb-8 overflow-hidden">
        <div class="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold mb-2">Hasil Ujian</h1>
              <p class="text-sm text-muted-foreground">Ringkasan hasil ujian yang telah diselesaikan</p>
            </div>
            
            <!-- Search Box -->
            <div class="relative w-full md:w-80">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari hasil ujian..."
                class="w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid Hasil Ujian -->
      <div v-if="filteredResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardJadwal
          v-for="result in filteredResults"
          :key="result.id"
          :agenda-title="result.agendaTitle"
          :title="result.title"
          :description="result.description"
          :question-count="result.questionCount"
          :duration="result.duration"
          :date="result.date"
          :time="result.time"
          status="completed"
          :score="result.score"
          :percentage="result.percentage"
          :show-score="true"
          clickable
          @click="viewResult(result.id)"
          @button-click="viewResult(result.id)"
          :view-hasil="result.viewHasil"

        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 border rounded-lg">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold text-lg mb-2">
          {{ searchQuery ? 'Hasil Tidak Ditemukan' : 'Belum Ada Hasil' }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ searchQuery ? `Tidak ditemukan hasil dengan kata kunci "${searchQuery}"` : 'Belum ada hasil ujian yang tersedia.' }}
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SearchIcon,
  XIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import { getExamResults } from '@/services/eventService'
import CardJadwal from '@/components/features/CardJadwal.vue'

const router = useRouter()

interface ExamResult {
  id: string;
  agendaTitle: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  date: string;
  time: string;
  viewHasil: boolean;
  score: number;
  percentage: number;
}

const examResults = ref<ExamResult[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Filter results berdasarkan search
const filteredResults = computed(() => {
  if (!searchQuery.value.trim()) return examResults.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return examResults.value.filter(result => 
    result.agendaTitle.toLowerCase().includes(query) ||
    result.title.toLowerCase().includes(query) ||
    result.description.toLowerCase().includes(query)
  )
})

// Fetch data
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    examResults.value = await getExamResults()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat hasil ujian'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// View result detail
const viewResult = (examId: string) => {
  
  // router.push(`/exam-results/${examId}`)
  router.push(`/hasil/${examId}`)
}

onMounted(() => {
  fetchData()
})
</script>