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
      <!-- Profil Siswa -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm mb-8 overflow-hidden">
        <div class="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon class="w-8 h-8 text-primary" />
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Nama Lengkap</p>
                <p class="font-semibold text-lg">{{ student.nama }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <IdCardIcon class="w-3 h-3" /> NIS
                </p>
                <p class="font-semibold text-lg">{{ student.nis }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <CalendarIcon class="w-3 h-3" /> Jumlah Event
                </p>
                <p class="font-semibold text-lg">{{ events.length }} Ujian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Judul Daftar Ujian -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2">Daftar Ujian</h2>
        <p class="text-sm text-muted-foreground">Pilih ujian yang ingin Anda kerjakan</p>
      </div>

      <!-- Grid Daftar Ujian -->
      <div v-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardJadwal
          v-for="exam in events"
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
          @button-click="handleStartExam(exam)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 border rounded-lg">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileTextIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold text-lg mb-2">Tidak Ada Ujian</h3>
        <p class="text-sm text-muted-foreground">Tidak ada ujian yang tersedia untuk saat ini.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  UserIcon, 
  IdCardIcon, 
  CalendarIcon,
  FileTextIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import type { Event, Student } from '@/types/ICommon'
import { getStudentData, getEvent } from '@/services/eventService'
import CardJadwal from '@/components/features/CardJadwal.vue'
import { useWebSocket } from '@/composables/useWebSocket'

const router = useRouter()

// Initialize student synchronously from localStorage
const student = ref<Student>({
  id: '',
  nama: '',
  nis: '',
  kelas: '',
  username: ''
})

try {
  student.value = getStudentData()
} catch (e) {
  console.warn('Student data not found in localStorage yet', e)
}

const events = ref<Event[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const startingExam = ref<string | null>(null)

// Setup real-time updates via WebSocket
useWebSocket({
  rooms: student.value.id ? [student.value.id] : [],
  onGlobalNotification: (data) => {
    console.log('WS: Global notification received', data)
    fetchData()
  },
  onPengerjaanNotification: (data) => {
    console.log('WS: Pengerjaan notification received', data)
    fetchData()
  }
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
const handleStartExam = async (event: Event) => {
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