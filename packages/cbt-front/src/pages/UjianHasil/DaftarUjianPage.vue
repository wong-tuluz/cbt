<template>
  <main class="p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data...</p>
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
              <h1 class="text-2xl font-bold mb-2">Daftar Ujian</h1>
              <p class="text-sm text-muted-foreground">Pilih ujian yang ingin Anda kerjakan</p>
            </div>
            
            <!-- Search Box -->
            <div class="relative w-full md:w-80">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari ujian..."
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

      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="tab in filterTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            :class="activeTab === tab.id 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Grid Daftar Ujian -->
      <div v-if="filteredExams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardJadwal
          v-for="exam in filteredExams"
          :key="exam.id"
          :agenda-title="exam.agendaTitle"
          :title="exam.title"
          :description="exam.description"
          :question-count="exam.questionCount"
          :duration="exam.duration"
          :date="exam.date"
          :time="exam.time"
          :status="exam.status"
          :button-disabled="isExamDisabled(exam.status)"
          :loading="startingExam === exam.id"
          @button-click="handleGetOneExam(exam)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 border rounded-lg">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold text-lg mb-2">
          {{ searchQuery ? 'Ujian Tidak Ditemukan' : 'Tidak Ada Ujian' }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ searchQuery ? `Tidak ditemukan ujian dengan kata kunci "${searchQuery}"` : 'Tidak ada ujian yang tersedia untuk saat ini.' }}
        </p>
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
          Tampilkan Semua Ujian
        </button>
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
import type { Event } from '@/types/ICommon'
import { getEvent } from '@/services/eventService'
import CardJadwal from '@/components/features/CardJadwal.vue'

const router = useRouter()

const events = ref<Event[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const startingExam = ref<string | null>(null)
const searchQuery = ref('')
const activeTab = ref('all')

const filterTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'ongoing', label: 'Sedang Berlangsung' },
  { id: 'upcoming', label: 'Akan Datang' },
  { id: 'completed', label: 'Selesai' }
]

// Filter exams berdasarkan search dan tab
const filteredExams = computed(() => {
  let filtered = events.value

  // Filter berdasarkan search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(exam => 
      exam.agendaTitle.toLowerCase().includes(query) ||
      exam.title.toLowerCase().includes(query) ||
      exam.description.toLowerCase().includes(query)
    )
  }

  // Filter berdasarkan tab
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(exam => exam.status === activeTab.value)
  }

  return filtered
})

// Helper function - disable untuk selain ongoing
const isExamDisabled = (status: string) => {
  return status !== 'ongoing'
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    events.value = await getEvent()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat data'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// get one event
const handleGetOneExam = async (event: Event) => {
  if (event.status !== 'ongoing') return
  try {
    router.push(`/event/${event.id}`)    
  } catch (err) {
    alert('Terjadi kesalahan saat ambil jadwal')
    console.error('Error:', err)
  }
}

onMounted(() => {
  fetchData()
})
</script>