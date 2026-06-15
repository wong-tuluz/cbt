<template>
  <div class="bg-background">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-card-foreground">Management Ujian</h1>
          <p class="text-sm text-muted-foreground mt-1">Monitor dan kelola aktivitas ujian siswa</p>
        </div>
        <Button @click="router.back()" variant="outline" size="sm" class="gap-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-card rounded-lg p-4 border border-border">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UsersIcon class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Siswa</p>
              <p class="text-2xl font-bold text-card-foreground">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-lg p-4 border border-border">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-success" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Selesai</p>
              <p class="text-2xl font-bold text-card-foreground">{{ stats.completed }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-lg p-4 border border-border">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClockIcon class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Sedang Mengerjakan</p>
              <p class="text-2xl font-bold text-card-foreground">{{ stats.inProgress }}</p>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-lg p-4 border border-border">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
              <AlertCircleIcon class="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Belum Mulai</p>
              <p class="text-2xl font-bold text-card-foreground">{{ stats.notStarted }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-card rounded-lg p-4 border border-border mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                class="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-card-foreground"
              />
            </div>
          </div>
          
          <select
            v-model="filterStatus"
            class="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-card-foreground"
          >
            <option value="all">Semua Status</option>
            <option value="not_started">Belum Mulai</option>
            <option value="in_progress">Sedang Mengerjakan</option>
            <option value="finished">Selesai</option>
          </select>

          <Button @click="refreshData" variant="outline" class="gap-2">
            <RefreshCwIcon class="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-card rounded-lg border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50 border-b border-border">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">No</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Siswa</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Kelas</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Progress</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Waktu</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-card-foreground">Nilai</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-card-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
              
              <tr v-else-if="filteredSessions.length === 0">
                <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data siswa
                </td>
              </tr>

              <tr v-else v-for="(session, index) in filteredSessions" :key="session.id"
                class="border-b border-border hover:bg-muted/30 transition-colors">
                <td class="px-4 py-3 text-sm text-card-foreground">{{ index + 1 }}</td>
                
                <td class="px-4 py-3">
                  <div class="flex flex-col">
                    <span class="font-medium text-card-foreground">{{ session.siswa.nama }}</span>
                    <span class="text-sm text-muted-foreground">NIS: {{ session.siswa.nis }}</span>
                  </div>
                </td>
                
                <td class="px-4 py-3 text-sm text-card-foreground">{{ session.siswa.kelas }}</td>
                
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(session.status)">
                    <component :is="getStatusIcon(session.status)" class="w-3 h-3" />
                    {{ getStatusText(session.status) }}
                  </span>
                </td>
                
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div class="bg-primary h-full transition-all"
                          :style="{ width: `${(session.questionAnswered / session.questionCount) * 100}%` }">
                        </div>
                      </div>
                      <span class="text-xs text-muted-foreground">
                        {{ session.questionAnswered }}/{{ session.questionCount }}
                      </span>
                    </div>
                  </div>
                </td>
                
                <td class="px-4 py-3">
                  <div class="flex flex-col text-xs">
                    <span v-if="session.finishedAt" class="text-muted-foreground">
                      Selesai: {{ formatTime(session.finishedAt) }}
                    </span>
                    <span v-else-if="session.status === 'in_progress'" class="text-muted-foreground">
                      Sedang mengerjakan...
                    </span>
                    <span v-else class="text-muted-foreground">
                      Belum mulai
                    </span>
                    <span v-if="session.timeLimit" class="text-card-foreground font-medium">
                      Batas: {{ session.timeLimit }} menit
                    </span>
                  </div>
                </td>
                
                <td class="px-4 py-3">
                  <span class="text-muted-foreground text-sm">-</span>
                </td>
                
                <td class="px-4 py-3">
                  <div class="flex flex-wrap items-center justify-center gap-2">
                    <!-- Lihat Jawaban (hanya untuk yang sudah selesai) -->
                    <Button
                      v-if="session.status === 'finished'"
                      @click="router.push(`/management-event/${jadwalId}/${session.id}`)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                      title="Lihat Jawaban Siswa"
                    >
                      <EyeIcon class="w-3 h-3" />
                      Lihat Jawaban
                    </Button>

                    <!-- Aksi Utama - Kumpulkan (hanya untuk yang sedang mengerjakan) -->
                    <Button
                      v-if="session.status === 'in_progress'"
                      @click="handleEndSession(session)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                      title="Kumpulkan Ujian"
                    >
                      <SendIcon class="w-3 h-3" />
                      Kumpulkan
                    </Button>

                    <!-- Reset Status (dari selesai ke mengerjakan) -->
                    <Button
                      v-if="session.status === 'finished'"
                      @click="handleResetStatus(session)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                      title="Reset Status (Kembalikan ke Mengerjakan)"
                    >
                      <RotateCwIcon class="w-3 h-3" />
                      Reset Status
                    </Button>
                    
                    <!-- Reset Score (hanya untuk yang sudah selesai) -->
                    <Button
                      v-if="session.status === 'finished'"
                      @click="handleResetScore(session)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                      title="Reset Nilai"
                    >
                      <RotateCcwIcon class="w-3 h-3" />
                      Reset Nilai
                    </Button>
                    
                    <!-- Reset Answers (untuk yang sedang/sudah selesai) -->
                    <Button
                      v-if="session.status === 'in_progress' || session.status === 'finished'"
                      @click="handleResetAnswers(session)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                      title="Reset Jawaban"
                    >
                      <TrashIcon class="w-3 h-3" />
                      Reset Jawaban
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialogs -->
    <Dialog v-model:open="showEndSessionDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kumpulkan Ujian Siswa?</DialogTitle>
          <DialogDescription>
            Ujian <strong>{{ selectedSession?.siswa.nama }}</strong> akan dikumpulkan secara paksa.
            Status akan berubah menjadi "Selesai". Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showEndSessionDialog = false">Batal</Button>
          <Button @click="confirmEndSession" :disabled="resetting">
            <span v-if="resetting">Memproses...</span>
            <span v-else>Ya, Kumpulkan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showResetStatusDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Status Siswa?</DialogTitle>
          <DialogDescription>
            Status ujian <strong>{{ selectedSession?.siswa.nama }}</strong> akan diubah dari "Selesai" menjadi "Mengerjakan". 
            Siswa dapat melanjutkan ujian kembali. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showResetStatusDialog = false">Batal</Button>
          <Button @click="confirmResetStatus" :disabled="resetting">
            <span v-if="resetting">Memproses...</span>
            <span v-else>Ya, Reset Status</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showResetScoreDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Nilai Siswa?</DialogTitle>
          <DialogDescription>
            Nilai siswa <strong>{{ selectedSession?.siswa.nama }}</strong> akan direset menjadi 0. 
            Data jawaban tetap tersimpan. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showResetScoreDialog = false">Batal</Button>
          <Button @click="confirmResetScore" :disabled="resetting">
            <span v-if="resetting">Memproses...</span>
            <span v-else>Ya, Reset Nilai</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showResetAnswersDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Jawaban Siswa?</DialogTitle>
          <DialogDescription>
            Semua jawaban dan waktu siswa <strong>{{ selectedSession?.siswa.nama }}</strong> akan dihapus. 
            Siswa akan kembali seperti belum mulai ujian. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showResetAnswersDialog = false">Batal</Button>
          <Button variant="destructive" @click="confirmResetAnswers" :disabled="resetting">
            <span v-if="resetting">Memproses...</span>
            <span v-else>Ya, Reset Jawaban</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  SearchIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SendIcon,
  TrashIcon,
  XCircleIcon,
  ArrowLeftIcon,
  EyeIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getProktorSessions, resetStatus } from '@/services/proktorService'
import type { IProktorSession } from '@/types/IProktorSession'
import { useToast } from '@/hooks/use-toast'
import { endSession } from '@/services/workSessionService'
import { router } from '@/router'

const route = useRoute()
const { toast, dismissAll } = useToast()

const loading = ref(true)
const resetting = ref(false)
const sessions = ref<IProktorSession[]>([])
const searchQuery = ref('')
const filterStatus = ref('all')
const showEndSessionDialog = ref(false)
const showResetStatusDialog = ref(false)
const showResetScoreDialog = ref(false)
const showResetAnswersDialog = ref(false)
const selectedSession = ref<IProktorSession | null>(null)

// GET JADWAL ID DARI URL PARAMS
const jadwalId = computed(() => route.params.id as string)

// Stats - menggunakan 'finished' sesuai API
const stats = computed(() => {
  return {
    total: sessions.value.length,
    completed: sessions.value.filter(s => s.status === 'finished').length,
    inProgress: sessions.value.filter(s => s.status === 'in_progress').length,
    notStarted: sessions.value.filter(s => s.status === 'not_started').length
  }
})

// Filtered sessions
const filteredSessions = computed(() => {
  let result = sessions.value

  if (filterStatus.value !== 'all') {
    result = result.filter(s => s.status === filterStatus.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.siswa.nama.toLowerCase().includes(query) ||
      s.siswa.nis.toLowerCase().includes(query)
    )
  }

  return result
})

// Load data
const loadData = async () => {
  if (!jadwalId.value) {
    console.error('Jadwal ID tidak ditemukan')
    return
  }

  loading.value = true
  try {
    const response = await getProktorSessions(jadwalId.value)
    if (response.success) {
      sessions.value = response.data
    }
  } catch (error) {
    console.error('Failed to load sessions data:', error)
    toast({
      title: 'Gagal memuat data',
      description: 'Terjadi kesalahan saat memuat data ujian',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
  dismissAll()
  toast({
    title: 'Data diperbarui',
    description: 'Data ujian berhasil diperbarui'
  })
}

// Status helpers - menggunakan status dari API: finished, in_progress, not_started
const getStatusClass = (status: string) => {
  switch (status) {
    case 'finished':
      return 'bg-success/10 text-success'
    case 'in_progress':
      return 'bg-primary/10 text-primary'
    default: // 'not_started'
      return 'bg-muted text-muted-foreground'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'finished':
      return CheckCircleIcon
    case 'in_progress':
      return ClockIcon
    default: // 'not_started'
      return XCircleIcon
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'finished':
      return 'Selesai'
    case 'in_progress':
      return 'Mengerjakan'
    default: // 'not_started'
      return 'Belum Mulai'
  }
}

const formatTime = (time: string | null) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// End Session handlers (Kumpulkan)
const handleEndSession = (session: IProktorSession) => {
  selectedSession.value = session
  showEndSessionDialog.value = true
}

const confirmEndSession = async () => {
  if (!selectedSession.value) return
  
  resetting.value = true
  try {
    await endSession(selectedSession.value.id)
    
    dismissAll()
    toast({
      title: 'Ujian dikumpulkan',
      description: `Ujian ${selectedSession.value.siswa.nama} berhasil dikumpulkan`,
      variant: 'default'
    })
    
    showEndSessionDialog.value = false
    await loadData() // Refresh data
  } catch (error) {
    toast({
      title: 'Gagal mengumpulkan ujian',
      description: 'Terjadi kesalahan saat mengumpulkan ujian',
      variant: 'destructive'
    })
  } finally {
    resetting.value = false
  }
}

// Reset Status handlers
const handleResetStatus = (session: IProktorSession) => {
  selectedSession.value = session
  showResetStatusDialog.value = true
}

const confirmResetStatus = async () => {
  if (!selectedSession.value) return
  
  resetting.value = true
  try {
    await resetStatus(selectedSession.value.id)
    
    dismissAll()
    toast({
      title: 'Status direset',
      description: `Status ${selectedSession.value.siswa.nama} berhasil direset menjadi "Mengerjakan"`,
      variant: 'default'
    })
    
    showResetStatusDialog.value = false
    await loadData()
  } catch (error) {
    toast({
      title: 'Gagal reset status',
      description: 'Terjadi kesalahan saat mereset status',
      variant: 'destructive'
    })
  } finally {
    resetting.value = false
  }
}

// Reset Score handlers
const handleResetScore = (session: IProktorSession) => {
  selectedSession.value = session
  showResetScoreDialog.value = true
}

const confirmResetScore = async () => {
  if (!selectedSession.value) return
  
  resetting.value = true
  try {
    // TODO: Panggil API reset score
    dismissAll()
    toast({
      title: 'Nilai direset',
      description: `Nilai ${selectedSession.value.siswa.nama} berhasil direset`
    })
    showResetScoreDialog.value = false
    await loadData()
  } catch (error) {
    toast({
      title: 'Gagal reset nilai',
      description: 'Terjadi kesalahan saat mereset nilai',
      variant: 'destructive'
    })
  } finally {
    resetting.value = false
  }
}

// Reset Answers handlers
const handleResetAnswers = (session: IProktorSession) => {
  selectedSession.value = session
  showResetAnswersDialog.value = true
}

const confirmResetAnswers = async () => {
  if (!selectedSession.value) return
  
  resetting.value = true
  try {
    // TODO: Panggil API reset answers
    dismissAll()
    toast({
      title: 'Jawaban direset',
      description: `Jawaban ${selectedSession.value.siswa.nama} berhasil direset`
    })
    showResetAnswersDialog.value = false
    await loadData()
  } catch (error) {
    toast({
      title: 'Gagal reset jawaban',
      description: 'Terjadi kesalahan saat mereset jawaban',
      variant: 'destructive'
    })
  } finally {
    resetting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>