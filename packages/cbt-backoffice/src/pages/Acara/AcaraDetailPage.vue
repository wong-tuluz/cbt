<template>
  <main class="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
      <RouterLink to="/acara" class="hover:text-primary transition-colors">
        Daftar Acara
      </RouterLink>
      <ChevronRight class="h-3 w-3" />
      <span class="text-primary truncate max-w-xs" v-if="acaraInfo">
        {{ acaraInfo.title }}
      </span>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-24">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat detail acara...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 flex flex-col items-center max-w-md mx-auto text-center">
      <AlertCircle class="h-12 w-12 text-destructive mb-3" />
      <h3 class="font-bold text-lg text-foreground">Gagal Memuat Acara</h3>
      <p class="text-sm text-muted-foreground mt-2 mb-6">{{ error }}</p>
      <RouterLink to="/acara" class="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2">
        Kembali ke Daftar
      </RouterLink>
    </div>

    <!-- Main Content -->
    <div v-else-if="acaraInfo" class="space-y-6">
      <!-- Acara Info Card -->
      <div class="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary/60"></div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <h1 class="text-2xl font-extrabold text-foreground">{{ acaraInfo.title }}</h1>
            <p class="text-sm text-muted-foreground">{{ acaraInfo.description || 'Tidak ada deskripsi.' }}</p>
            <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
              <span class="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-full border">
                <CalendarDays class="h-3.5 w-3.5 text-primary" />
                Mulai: <strong>{{ formatDateTime(acaraInfo.startTime) }}</strong>
              </span>
              <span class="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-full border">
                <Clock class="h-3.5 w-3.5 text-primary" />
                Selesai: <strong>{{ formatDateTime(acaraInfo.endTime) }}</strong>
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button @click="openAddJadwalModal" class="gap-2 font-semibold">
              <Plus class="h-4 w-4" /> Tambah Jadwal
            </Button>
            <Button variant="outline" @click="router.back()" class="gap-2">
              Kembali
            </Button>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b flex gap-6 text-sm font-semibold text-muted-foreground">
        <button 
          @click="activeTab = 'schedules'"
          class="pb-2 transition-colors border-b-2"
          :class="activeTab === 'schedules' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'"
        >
          Jadwal Pelaksanaan
        </button>
        <button 
          @click="activeTab = 'participants'"
          class="pb-2 transition-colors border-b-2"
          :class="activeTab === 'participants' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'"
        >
          Peserta Ujian ({{ pesertaList.length }})
        </button>
      </div>

      <!-- Tab Content: Schedules -->
      <div v-if="activeTab === 'schedules'" class="space-y-4">
        <div v-if="jadwalList.length === 0" class="text-center py-16 border border-dashed rounded-2xl bg-card">
          <BookOpen class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p class="text-sm font-medium text-muted-foreground">Belum ada jadwal pelaksanaan ujian.</p>
          <Button @click="openAddJadwalModal" variant="outline" size="sm" class="mt-4 gap-1.5">
            <Plus class="h-3.5 w-3.5" /> Buat Jadwal Ujian
          </Button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="jadwal in jadwalList" 
            :key="jadwal.id"
            class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div class="space-y-4">
              <!-- Title & Actions -->
              <div class="flex justify-between items-start gap-4">
                <div>
                  <h3 class="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                    {{ jadwal.title }}
                  </h3>
                  <p class="text-xs text-muted-foreground font-mono mt-1">Token: <strong class="text-primary text-xs">{{ jadwal.token }}</strong></p>
                </div>
                
                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button @click="openEditJadwalModal(jadwal)" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Edit3 class="h-4 w-4" />
                  </Button>
                  <Button @click="triggerDeleteJadwal(jadwal)" variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-4 text-xs border-y py-3">
                <div>
                  <p class="text-muted-foreground">Paket Soal</p>
                  <p class="font-bold text-foreground truncate mt-0.5">{{ jadwal.paketSoal?.title || 'Memuat...' }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Jumlah Soal</p>
                  <p class="font-bold text-foreground mt-0.5">{{ jadwal.questionCount || 0 }} butir</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Durasi</p>
                  <p class="font-bold text-foreground mt-0.5">{{ jadwal.timeLimit }} menit</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Batas Uji</p>
                  <p class="font-bold text-foreground mt-0.5">{{ jadwal.attempts }} kali percobaan</p>
                </div>
              </div>

              <!-- Rentang Waktu -->
              <div class="space-y-1.5 text-xs text-muted-foreground">
                <div class="flex items-center gap-2">
                  <CalendarDays class="h-3.5 w-3.5 text-primary" />
                  <span>Mulai: <strong>{{ formatDateTime(jadwal.startTime) }}</strong></span>
                </div>
                <div class="flex items-center gap-2">
                  <Clock class="h-3.5 w-3.5 text-primary" />
                  <span>Selesai: <strong>{{ formatDateTime(jadwal.endTime) }}</strong></span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t flex justify-end">
              <RouterLink 
                :to="`/acara/${acaraId}/monitor/${jadwal.id}`"
                class="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm gap-1 group/btn"
              >
                <Activity class="h-3.5 w-3.5 animate-pulse" />
                Monitor Ujian
                <ArrowRight class="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Participants -->
      <div v-if="activeTab === 'participants'" class="space-y-4">
        <div v-if="pesertaList.length === 0" class="text-center py-16 border border-dashed rounded-2xl bg-card">
          <Users class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p class="text-sm font-medium text-muted-foreground">Belum ada peserta terdaftar pada acara ini.</p>
          <p class="text-xs text-muted-foreground mt-1">Data peserta disinkronkan secara otomatis dari server utama.</p>
        </div>

        <div v-else class="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left text-sm">
            <thead class="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th class="p-4">No.</th>
                <th class="p-4">ID Peserta</th>
                <th class="p-4">Siswa ID</th>
                <th class="p-4">Sinkronisasi ID</th>
              </tr>
            </thead>
            <tbody class="divide-y text-foreground">
              <tr 
                v-for="(peserta, idx) in pesertaList" 
                :key="peserta.id"
                class="hover:bg-muted/20 transition-colors"
              >
                <td class="p-4 font-medium">{{ idx + 1 }}</td>
                <td class="p-4 font-mono text-xs">{{ peserta.id }}</td>
                <td class="p-4 font-mono text-xs">{{ peserta.siswaId }}</td>
                <td class="p-4 font-mono text-xs">{{ peserta.remoteId || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Form Schedule Modal -->
    <Dialog v-model:open="showJadwalFormModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ isEditJadwal ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian' }}</DialogTitle>
          <DialogDescription>
            Definisikan detail jadwal pelaksanaan ujian satu per satu.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="submitJadwalForm" class="space-y-4 py-2">
          <!-- Title -->
          <div class="space-y-1.5">
            <label class="text-sm font-bold text-foreground">Judul Jadwal <span class="text-destructive">*</span></label>
            <input 
              v-model="jadwalForm.title" 
              type="text" 
              required
              placeholder="Contoh: Matematika Peminatan Kelas XII"
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Paket Soal Dropdown -->
          <div class="space-y-1.5">
            <label class="text-sm font-bold text-foreground">Paket Soal <span class="text-destructive">*</span></label>
            <select 
              v-model="jadwalForm.paketSoalId" 
              required
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>-- Pilih Paket Soal --</option>
              <option 
                v-for="paket in paketList" 
                :key="paket.id" 
                :value="paket.id"
              >
                {{ paket.title }}
              </option>
            </select>
          </div>

          <!-- Rentang Waktu Jadwal -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">Mulai <span class="text-destructive">*</span></label>
              <input 
                v-model="jadwalForm.startTime" 
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">Selesai <span class="text-destructive">*</span></label>
              <input 
                v-model="jadwalForm.endTime" 
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Time limit & Attempts -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">Durasi (Menit) <span class="text-destructive">*</span></label>
              <input 
                v-model.number="jadwalForm.timeLimit" 
                type="number" 
                min="5" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none"
              />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">Jumlah Percobaan <span class="text-destructive">*</span></label>
              <input 
                v-model.number="jadwalForm.attempts" 
                type="number" 
                min="1" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          <!-- Token -->
          <div class="space-y-1.5">
            <label class="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Token Akses <span class="text-destructive">*</span></span>
              <button 
                type="button" 
                @click="regenerateToken" 
                class="text-xs text-primary font-bold hover:underline"
              >
                Acak Token
              </button>
            </label>
            <input 
              v-model="jadwalForm.token" 
              type="text" 
              required
              placeholder="Contoh: XYZTUV"
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm font-mono focus:outline-none uppercase"
            />
          </div>

          <!-- Validation Warnings -->
          <div v-if="isScheduleTimeOutofBounds" class="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-semibold">
            * Rentang waktu jadwal harus berada di dalam batas waktu acara ({{ formatDateTime(acaraInfo.startTime) }} s.d. {{ formatDateTime(acaraInfo.endTime) }}).
          </div>

          <DialogFooter class="border-t pt-4 mt-6">
            <Button type="button" variant="outline" @click="showJadwalFormModal = false" :disabled="submitting">
              Batal
            </Button>
            <Button type="submit" :disabled="submitting || isScheduleTimeOutofBounds" class="gap-1.5">
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirm Modal -->
    <Dialog v-model:open="showDeleteJadwalModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-destructive">Hapus Jadwal Ujian?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus jadwal <strong>{{ selectedJadwal?.title }}</strong>?
            Tindakan ini akan menghapus seluruh data keikutsertaan siswa pada jadwal ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-4">
          <Button variant="outline" @click="showDeleteJadwalModal = false" :disabled="submitting">
            Batal
          </Button>
          <Button variant="destructive" @click="confirmDeleteJadwal" :disabled="submitting" class="gap-1.5">
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ChevronRight, 
  Plus, 
  CalendarDays, 
  Clock, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  Activity, 
  Edit3, 
  Trash2, 
  Users,
  AlertCircle
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
import { 
  getAcaraById, 
  getJadwalListByAcara, 
  getAcaraPeserta, 
  saveJadwal, 
  deleteJadwal,
  type IAcara,
  type IJadwal
} from '@/services/acaraService'
import { getPaketSoalList, type IPaketSoal } from '@/services/paketSoalService'
import { useToast } from '@/hooks/use-toast'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const acaraId = route.params.id as string

const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)

const activeTab = ref<'schedules' | 'participants'>('schedules')

const acaraInfo = ref<IAcara | null>(null)
const jadwalList = ref<any[]>([])
const pesertaList = ref<any[]>([])
const paketList = ref<IPaketSoal[]>([])

// Modal states
const showJadwalFormModal = ref(false)
const showDeleteJadwalModal = ref(false)
const isEditJadwal = ref(false)
const selectedJadwal = ref<any | null>(null)

// Form states
const jadwalForm = ref<{
  paketSoalId: string
  title: string
  startTime: string
  endTime: string
  timeLimit: number
  attempts: number
  token: string
}>({
  paketSoalId: '',
  title: '',
  startTime: '',
  endTime: '',
  timeLimit: 90,
  attempts: 1,
  token: ''
})

const isScheduleTimeOutofBounds = computed(() => {
  if (!jadwalForm.value.startTime || !jadwalForm.value.endTime || !acaraInfo.value) return false
  const aStart = new Date(acaraInfo.value.startTime)
  const aEnd = new Date(acaraInfo.value.endTime)
  const jStart = new Date(jadwalForm.value.startTime)
  const jEnd = new Date(jadwalForm.value.endTime)
  
  return jStart < aStart || jEnd > aEnd || jStart >= jEnd
})

async function loadDetails() {
  loading.value = true
  error.value = null
  try {
    const [acara, jadwals, pesertas, pakets] = await Promise.all([
      getAcaraById(acaraId),
      getJadwalListByAcara(acaraId),
      getAcaraPeserta(acaraId),
      getPaketSoalList()
    ])
    
    acaraInfo.value = acara
    jadwalList.value = jadwals
    pesertaList.value = pesertas
    paketList.value = pakets
  } catch (err: any) {
    console.error('Error loading details:', err)
    error.value = err.message || 'Gagal memuat detail acara.'
  } finally {
    loading.value = false
  }
}

function openAddJadwalModal() {
  isEditJadwal.value = false
  selectedJadwal.value = null
  
  // Set defaults inside acara bounds
  let jStart = new Date()
  if (acaraInfo.value) {
    const aStart = new Date(acaraInfo.value.startTime)
    if (jStart < aStart) {
      jStart = aStart
    }
  }
  const jEnd = new Date(jStart.getTime() + 120 * 60000) // 2 hours later
  
  jadwalForm.value = {
    paketSoalId: '',
    title: '',
    startTime: formatToLocalDateTimeInput(jStart),
    endTime: formatToLocalDateTimeInput(jEnd),
    timeLimit: 90,
    attempts: 1,
    token: generateRandomToken()
  }
  showJadwalFormModal.value = true
}

function openEditJadwalModal(jadwal: any) {
  isEditJadwal.value = true
  selectedJadwal.value = jadwal
  
  jadwalForm.value = {
    paketSoalId: jadwal.paketSoalId,
    title: jadwal.title,
    startTime: formatToLocalDateTimeInput(new Date(jadwal.startTime)),
    endTime: formatToLocalDateTimeInput(new Date(jadwal.endTime)),
    timeLimit: jadwal.timeLimit,
    attempts: jadwal.attempts,
    token: jadwal.token
  }
  showJadwalFormModal.value = true
}

async function submitJadwalForm() {
  submitting.value = true
  try {
    const payload = {
      id: selectedJadwal.value?.id,
      paketSoalId: jadwalForm.value.paketSoalId,
      title: jadwalForm.value.title,
      startTime: new Date(jadwalForm.value.startTime).toISOString(),
      endTime: new Date(jadwalForm.value.endTime).toISOString(),
      timeLimit: jadwalForm.value.timeLimit,
      attempts: jadwalForm.value.attempts,
      token: jadwalForm.value.token.toUpperCase()
    }
    
    await saveJadwal(acaraId, payload)
    toast({
      title: isEditJadwal.value ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan',
      description: 'Jadwal ujian telah disimpan.'
    })
    showJadwalFormModal.value = false
    await loadDetails()
  } catch (err: any) {
    toast({
      title: 'Gagal menyimpan jadwal',
      description: err.message || 'Gagal menyimpan jadwal.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}

function triggerDeleteJadwal(jadwal: any) {
  selectedJadwal.value = jadwal
  showDeleteJadwalModal.value = true
}

async function confirmDeleteJadwal() {
  if (!selectedJadwal.value) return
  submitting.value = true
  try {
    await deleteJadwal(acaraId, selectedJadwal.value.id)
    toast({
      title: 'Jadwal berhasil dihapus',
      description: 'Jadwal ujian telah terhapus dari acara ini.'
    })
    showDeleteJadwalModal.value = false
    await loadDetails()
  } catch (err: any) {
    toast({
      title: 'Gagal menghapus jadwal',
      description: err.message || 'Gagal menghapus jadwal.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}

function generateRandomToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

function regenerateToken() {
  jadwalForm.value.token = generateRandomToken()
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatToLocalDateTimeInput(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16)
  return localISOTime
}

onMounted(() => {
  loadDetails()
})
</script>

<style scoped>
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
</style>
