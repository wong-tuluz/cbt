<template>
  <div class="p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data session...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 mb-8">
      <div class="flex items-center gap-2 text-destructive mb-2">
        <AlertCircleIcon class="h-5 w-5" />
        <h3 class="font-semibold text-lg">Terjadi Kesalahan</h3>
      </div>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <button 
        @click="fetchSessions"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header dengan Info Jadwal -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm mb-8 overflow-hidden">
        <div class="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="relative"> 
              <div class="absolute -left-4 -top-5" @click="goBack()">
                <MoveLeft class="w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary transition-colors"/>
              </div>

              <div>
                <h1 class="text-2xl font-bold mb-2">Detail sesi</h1>
                <!-- <p class="text-sm text-muted-foreground">
                    <span>{{ exam.agendaTitle }}</span> - 
                    <span>{{ exam.title }}</span>
                </p> -->
              </div>
            </div>
                    
            <!-- Search Box -->
            <div class="relative w-full md:w-80">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari siswa atau session..."
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

      <!-- Sessions Grid (Card Layout) -->
      <div v-if="filteredSessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(session, index) in filteredSessions"
          :key="session.id"
          class="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
        >
          <!-- Status Bar -->
          <div class="h-2" :class="getStatusBarColor(session.status)"></div>
          
          <!-- Header Kartu -->
          <div class="flex flex-col space-y-1.5 p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <!-- SESSION ID -->
                <h3 class="font-semibold text-xl mb-2">Session {{ index + 1 }}</h3>
                <!-- SISWA ID -->
                <!-- <p class="text-sm font-medium text-foreground mb-1">Siswa: {{ session.siswaId.substring(0, 12) }}...</p> -->
                <!-- STATUS -->
                <p class="text-sm text-muted-foreground">ID: {{ session.id.substring(0, 12) }}...</p>
              </div>
              
              <div class="flex flex-col items-end gap-2">
                <!-- Badge Status -->
                <div 
                  class="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
                  :class="getStatusBadgeClass(session.status)"
                >
                  <component :is="getStatusIcon(session.status)" class="w-3 h-3" />
                  {{ getStatusText(session.status) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Konten Kartu -->
          <div class="p-6 pt-0">
            <!-- Detail Session -->
            <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div class="flex items-center gap-2 text-muted-foreground">
                <ClockIcon class="w-4 h-4" />
                <span>Limit: {{ session.timeLimit }} menit</span>
              </div>
              <!-- <div class="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon class="w-4 h-4" />
                <span>{{ formatDate(session.createdAt) }}</span>
              </div> -->
            </div>

            <!-- Waktu Session -->
            <div class="space-y-3 mb-6">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Mulai:</span>
                <span class="font-medium">{{ formatDateTime(session.startedAt) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Selesai:</span>
                <span class="font-medium">{{ formatDateTime(session.finishedAt) }}</span>
              </div>
              <div v-if="session.startedAt && session.finishedAt" class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Durasi:</span>
                <span class="font-medium text-primary">{{ calculateDuration(session.startedAt, session.finishedAt) }}</span>
              </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="flex gap-2">
              <button
                @click="handleViewSession(session)"
                class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <EyeIcon class="w-4 h-4" />
                <span>Lihat Hasil Ujian</span>
              </button>
              
              <!-- <button
                v-if="session.status === 'in_progress'"
                @click="handleStopSession(session)"
                class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <StopCircleIcon class="w-4 h-4" />
                <span>Stop</span>
              </button> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 border rounded-lg">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold text-lg mb-2">
          {{ searchQuery ? 'Session Tidak Ditemukan' : 'Belum Ada Session' }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ searchQuery ? `Tidak ditemukan session dengan kata kunci "${searchQuery}"` : 'Belum ada session yang tersedia.' }}
        </p>
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
          Tampilkan Semua Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  SearchIcon,
  XIcon,
  AlertCircleIcon,
  EyeIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  MoveLeft,
} from 'lucide-vue-next'
import { getListSessionByJadwal, type IWorkSession } from '@/services/workSessionService'
const route = useRoute()
const router = useRouter()

const jadwalId = ref<string>(route.params.id as string)
const sessions = ref<IWorkSession[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Filter sessions
const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return sessions.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return sessions.value.filter(session => 
    session.id.toLowerCase().includes(query) ||
    session.siswaId.toLowerCase().includes(query) ||
    session.status.toLowerCase().includes(query)
  )
})

// Status helpers
const getStatusBarColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-gradient-to-r from-green-500 to-green-400'
    case 'in_progress':
      return 'bg-gradient-to-r from-primary to-primary/60'
    case 'not_started':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-300'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-transparent bg-green-500 text-white'
    case 'in_progress':
      return 'border-transparent bg-primary text-primary-foreground'
    case 'not_started':
      return 'border-transparent bg-yellow-500 text-white'
    default:
      return 'text-foreground border'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle2Icon
    case 'in_progress':
      return PlayCircleIcon
    case 'not_started':
      return PauseCircleIcon
    default:
      return XCircleIcon
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Selesai'
    case 'in_progress':
      return 'Sedang Mengerjakan'
    case 'not_started':
      return 'Belum Mulai'
    default:
      return status
  }
}

// Format tanggal & waktu
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Hitung durasi
const calculateDuration = (start: string, end: string) => {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes} menit`
  } else {
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours} jam ${minutes} menit`
  }
}

// Handlers
const handleViewSession = (session: IWorkSession) => {
  router.push(`/exam-result/${session.id}`)
}

// Fetch data
const fetchSessions = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getListSessionByJadwal(jadwalId.value)
    if (response.success) {
      sessions.value = response.data
    } else {
      throw new Error('Gagal memuat data session')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat data session'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  fetchSessions();
})
</script>