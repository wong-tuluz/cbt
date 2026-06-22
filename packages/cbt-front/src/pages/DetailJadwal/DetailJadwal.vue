<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat detail ujian...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-md w-full">
      <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <div class="flex items-center gap-2 text-destructive mb-2">
          <AlertCircleIcon class="h-5 w-5" />
          <h3 class="font-semibold text-lg">Terjadi Kesalahan</h3>
        </div>
        <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
        <button 
          @click="router.push('/dashboard')"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="exam" class="max-w-2xl w-full">
      <div class="rounded-lg border bg-card text-card-foreground shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
        
        <div class="p-8">
          <!-- Title & Description -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileTextIcon class="w-8 h-8 text-primary" />
            </div>
            <h1 class="text-3xl font-bold mb-2">{{ exam.agendaTitle }}</h1>
            <h2 class="text-xl font-medium text-muted-foreground mb-2">{{ exam.title }}</h2>
            <p class="text-sm text-muted-foreground">{{ exam.description }}</p>
          </div>

          <!-- Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="rounded-lg border bg-muted/50 p-4 text-center">
              <FileTextIcon class="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p class="text-2xl font-bold">{{ exam.questionCount }}</p>
              <p class="text-sm text-muted-foreground">Jumlah Soal</p>
            </div>
            <div class="rounded-lg border bg-muted/50 p-4 text-center">
              <ClockIcon class="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p class="text-2xl font-bold">{{ exam.duration }}</p>
              <p class="text-sm text-muted-foreground">Menit</p>
            </div>
            <div class="rounded-lg border bg-muted/50 p-4 text-center">
              <CalendarIcon class="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm font-medium">{{ exam.date }}</p>
              <p class="text-sm text-muted-foreground">{{ exam.time }}</p>
            </div>
          </div>

          <!-- Session Info -->
          <div v-if="existingSession" class="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
            <div class="flex items-start gap-3">
              <InfoIcon class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium text-sm mb-1 text-blue-800">Session Ditemukan</p>
                <p class="text-sm text-blue-700">
                  Anda sudah memiliki session yang {{
                    existingSession.status === 'in_progress' ? 'sedang berjalan' : 
                    existingSession.status === 'completed' ? 'telah selesai' : 'belum dimulai'
                  }}.
                  <span v-if="existingSession.status === 'in_progress'" class="font-semibold">
                    Lanjutkan mengerjakan?
                  </span>
                </p>
                <div class="mt-2 text-xs text-blue-600">
                  <p>Status: {{ getStatusText(existingSession.status) }}</p>
                  <p v-if="existingSession.startedAt">Dimulai: {{ formatDateTime(existingSession.startedAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Token Input Section (hanya muncul jika belum ada session) -->
          <div v-if="showTokenInput" class="rounded-lg border border-primary/20 bg-primary/5 p-6 mb-6">
            <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
              <LockIcon class="w-5 h-5" />
              Masukkan Token Ujian
            </h3>
            
            <!-- Error message -->
            <div v-if="tokenError" class="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {{ tokenError }}
            </div>
            
            <!-- Sukses message -->
            <div v-if="sessionIdCreated" class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              ✓ Token diterima. Klik tombol "Mulai Ujian" di bawah untuk memulai.
            </div>
            
            <!-- Input token (selalu tampil) -->
            <div class="mb-4">
              <input
                v-model="tokenInput"
                type="text"
                placeholder="Masukkan token yang diberikan..."
                class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                :disabled="starting || Boolean(sessionIdCreated)"
                @keyup.enter="handleSubmitToken"
              />
              <!-- <p class="text-xs text-muted-foreground mt-2">Token biasanya diberikan oleh pengawas ujian</p> -->
            </div>
            
            <!-- Tombol Verifikasi Token (selalu tampil, disable jika sudah sukses) -->
            <div class="flex gap-2">
              <button
                @click="showTokenInput = false; tokenInput = ''; tokenError = ''; sessionIdCreated = ''"
                :disabled="starting"
                class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Batal
              </button>
              <button
                @click="handleSubmitToken"
                :disabled="starting || !tokenInput.trim() || Boolean(sessionIdCreated)"
                class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <template v-if="starting">
                  <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                  Memproses...
                </template>
                <template v-else>
                  {{ sessionIdCreated ? '✓ Token Valid' : 'Verifikasi Token' }}
                </template>
              </button>
            </div>
          </div>

          <!-- Attempts Info -->
          <div v-if="exam.attemptsRemaining > 0" class="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6">
            <div class="flex items-start gap-3">
              <InfoIcon class="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium text-sm mb-1">Kesempatan Mengerjakan</p>
                <p class="text-sm text-muted-foreground">
                  Anda memiliki <span class="font-semibold text-primary">{{ exam.attemptsRemaining }}x</span> kesempatan untuk mengerjakan ujian ini.
                  <span v-if="existingSession && existingSession.status === 'completed'" class="block mt-1">
                    Session sebelumnya telah selesai. Anda bisa membuat session baru.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="rounded-lg border bg-muted/30 p-6 mb-6">
            <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircleIcon class="w-5 h-5" />
              Petunjuk Ujian
            </h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Pastikan koneksi internet Anda stabil selama mengerjakan ujian</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Waktu akan berjalan otomatis setelah Anda memulai ujian</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Jawaban akan tersimpan secara otomatis</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Keluar dari ujian akan dihitung sebagai pelanggaran</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Keluar dari full-screen ujian akan dihitung sebagai pelanggaran</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Jika point pelanggaran melebihi batas, jawaban anda akan dikirim otomatis</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-1">•</span>
                <span>Pastikan Anda menyelesaikan ujian sebelum waktu habis</span>
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="router.push('/dashboard')"
              :disabled="starting"
              class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-4 py-2"
            >
              <ArrowLeftIcon class="w-4 h-4 mr-2" />
              Kembali
            </button>
            
            <!-- Lanjutkan Session (jika ada session yang in_progress) -->
            <button
              v-if="existingSession && existingSession.status === 'in_progress'"
              @click="handleLanjutkanUjian"
              :disabled="starting"
              class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-4 py-2"
            >
              <template v-if="starting">
                <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                Memproses...
              </template>
              <template v-else>
                <PlayCircleIcon class="w-4 h-4 mr-2" />
                Lanjutkan Ujian
              </template>
            </button>
            
            <!-- MULAI UJIAN (tombol utama) -->
            <button
              v-else
              @click="handleMulaiUjian"
              :disabled="starting || exam.attemptsRemaining === 0"
              class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4 py-2"
            >
              <template v-if="starting">
                <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                Memproses...
              </template>
              <template v-else>
                <CirclePlayIcon class="w-4 h-4 mr-2" />
                {{ existingSession ? 'Mulai Session Baru' : 'Mulai Ujian' }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FileTextIcon,
  ClockIcon,
  CalendarIcon,
  InfoIcon,
  AlertCircleIcon,
  CirclePlayIcon,
  ArrowLeftIcon,
  PlayCircleIcon,
  LockIcon
} from 'lucide-vue-next'
import type { Event } from '@/types/ICommon'
import { getEventById, getSoal } from '@/services/eventService'
import { 
  createSession, 
  getListSessionByJadwal, 
  type IPengerjaan,
  type Payload 
} from '@/services/pengerjaanService'

const route = useRoute()
const router = useRouter()

const sessions = ref<IPengerjaan[]>([])
const exam = ref<Event | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const starting = ref(false)
const showTokenInput = ref(false)
const tokenInput = ref('')
const tokenError = ref('')
const sessionIdCreated = ref('')

// Compute existing session
const existingSession = computed(() => {
  if (!sessions.value.length) return null
  
  const inProgressSession = sessions.value.find(s => s.status === 'in_progress')
  if (inProgressSession) return inProgressSession
  
  return sessions.value.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]
})

// Status text helper
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'in_progress': return 'Sedang Berlangsung'
    case 'not_started': return 'Belum Dimulai'
    default: return status
  }
}

// Format date time
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch exam detail and sessions
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const jadwalId = route.params.id as string
    
    const examData = await getEventById(jadwalId)
    if (!examData) {
      error.value = 'Ujian tidak ditemukan'
      return
    }
    exam.value = examData

    const sessionsResponse = await getListSessionByJadwal(jadwalId)
    if (sessionsResponse.success) {
      sessions.value = sessionsResponse.data
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat data'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Handle submit token (hanya untuk kasus belum ada session)
const handleSubmitToken = async () => {
  if (!tokenInput.value.trim()) return
  
  try {
    starting.value = true
    tokenError.value = ''
    
    const payload: Payload = {
      jadwalId: exam.value!.id,
      token: tokenInput.value.trim()
    }
    
    const response = await createSession(payload)
    
    if (response.success) {
      // Token benar, simpan session ID
      sessionIdCreated.value = response.data!.id
    } else {
      // Token salah
      if (response.code === 400 && response.message?.includes('token')) {
        tokenError.value = 'Token Tidak Sesuai'
      } else {
        tokenError.value = response.message || 'Token tidak valid'
      }
    }
    
  } catch (error) {
    console.error('Gagal memulai ujian:', error)
    tokenError.value = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    starting.value = false
  }
}

// Handle tombol "Mulai Ujian" utama
const handleMulaiUjian = async () => {
  try {
    starting.value = true
    
    let sessionId: string
    
    if (existingSession.value) {
      sessionId = existingSession.value.id
    } 
    else if (sessionIdCreated.value) {
      sessionId = sessionIdCreated.value
    }
    else {
      showTokenInput.value = true
      starting.value = false
      return
    }
    
    const soal = await getSoal(sessionId)
    localStorage.setItem('soal', JSON.stringify(soal))
    
    // ⭐ FORMAT timeOpen WIB (HH.mm)
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const timeOpenWIB = `${hours}.${minutes}`
    
    sessionStorage.setItem(
      'examContext',
      JSON.stringify({
        agendaTitle: exam.value!.agendaTitle,
        title: exam.value!.title,
        timeOpen: timeOpenWIB,        // ⭐ "17.30"
        timeEnd: exam.value!.timeEnd,  // ⭐ "17.30"
      })
    )
    router.push(`/exam/${sessionId}`)
    
  } catch (error) {
    console.error('Gagal memulai ujian:', error)
    alert('Terjadi kesalahan saat memulai ujian.')
    starting.value = false
  }
}

// Lanjutkan session yang ada (sama)
const handleLanjutkanUjian = async () => {
  if (!existingSession.value) return
  
  try {
    starting.value = true
    const sessionId = existingSession.value.id
    
    const soal = await getSoal(sessionId)
    localStorage.setItem('soal', JSON.stringify(soal))
    
    // ⭐ SAMA: Format timeOpen WIB
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const timeOpenWIB = `${hours}.${minutes}`
    
    sessionStorage.setItem(
      'examContext',
      JSON.stringify({
        agendaTitle: exam.value!.agendaTitle,
        title: exam.value!.title,
        timeOpen: timeOpenWIB,
        timeEnd: exam.value!.timeEnd,
      })
    )
    router.push(`/exam/${sessionId}`)
    
  } catch (error) {
    console.error('Gagal mengambil soal:', error)
    alert('Terjadi kesalahan saat memuat soal.')
  } finally {
    starting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>