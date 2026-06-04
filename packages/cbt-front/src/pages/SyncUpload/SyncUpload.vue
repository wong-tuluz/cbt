<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-card-foreground">Sync & Upload</h1>
          <p class="text-sm text-muted-foreground mt-1">Sinkronisasi data ujian dari Back Office atau upload hasil ujian siswa</p>
        </div>
        <Button @click="router.back()" variant="outline" size="sm" class="gap-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <!-- Main Grid: 2 Cards with equal height -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- SYNC CARD (Kiri) -->
        <div class="relative overflow-hidden bg-card border border-border rounded-2xl p-8 h-full">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
          
          <div class="relative z-10 flex flex-col h-full">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <DownloadCloudIcon class="w-8 h-8 text-primary" />
            </div>

            <h2 class="text-2xl font-bold text-card-foreground mb-3">
              Sync Data
            </h2>

            <p class="text-muted-foreground mb-6 leading-relaxed">
              Sinkronisasi data soal ujian, jadwal, dan konfigurasi dari Back Office ke aplikasi lokal
            </p>

            <!-- Stats Ringkasan -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="bg-muted/30 rounded-lg p-3">
                <p class="text-xs text-muted-foreground">Total Event</p>
                <p class="text-xl font-bold text-card-foreground">{{ events.length }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3">
                <p class="text-xs text-muted-foreground">Tersinkronisasi</p>
                <p class="text-xl font-bold text-success">{{ syncedCount }}</p>
              </div>
            </div>

            <!-- Toggle & Refresh Controls -->
            <div class="flex items-center justify-between mb-4">
              <Button 
                @click="showEvents = !showEvents" 
                variant="outline" 
                size="sm" 
                class="gap-2"
              >
                <EyeIcon :class="['w-4 h-4', showEvents ? 'text-primary' : 'text-muted-foreground']" />
                {{ showEvents ? 'Sembunyikan Event' : 'Tampilkan Event' }}
              </Button>

              <Button 
                v-if="showEvents"
                @click="fetchEvents" 
                variant="ghost" 
                size="sm" 
                class="gap-1.5"
                :disabled="loadingEvents"
              >
                <RefreshCwIcon :class="['w-3 h-3', { 'animate-spin': loadingEvents }]" />
                Refresh
              </Button>
            </div>

            <!-- Daftar Event - Hanya tampil jika showEvents = true -->
            <div v-if="showEvents" class="space-y-4 flex-1">
              <h3 class="text-sm font-semibold text-card-foreground">Event Tersedia</h3>

              <div v-if="events.length === 0" class="py-8 text-center text-muted-foreground">
                <CalendarIcon class="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p class="text-sm">Belum ada event tersedia</p>
              </div>

              <div v-else class="max-h-[240px] overflow-y-auto pr-1 space-y-2">
                <div 
                  v-for="event in events" 
                  :key="event.id"
                  class="p-3 rounded-lg border transition-all duration-200"
                  :class="[
                    event.synced ? 'bg-success/5 border-success/20' : 'bg-card border-border',
                    syncingEventId === event.id ? 'border-primary ring-1 ring-primary/30' : ''
                  ]"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="font-medium text-card-foreground truncate">{{ event.nama_event }}</p>
                        <span 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
                          :class="event.synced ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'"
                        >
                          {{ event.synced ? 'Tersinkron' : 'Pending' }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <CalendarIcon class="w-3 h-3" />
                        <span>{{ formatDate(event.mulai) }}</span>
                      </div>
                    </div>
                    
                    <Button
                      v-if="!event.synced"
                      @click="confirmSyncEvent(event)"
                      :disabled="!!syncingEventId"
                      size="sm"
                      class="gap-1.5 flex-shrink-0"
                    >
                      <DownloadIcon class="w-3 h-3" />
                      Sync
                    </Button>
                    <Button
                      v-else
                      variant="outline"
                      size="sm"
                      class="gap-1.5 flex-shrink-0"
                      disabled
                    >
                      <CheckCircleIcon class="w-3 h-3" />
                      Synced
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State - Event tersembunyi -->
            <div v-else-if="!showEvents && events.length > 0" class="py-4 text-center text-muted-foreground flex-1">
              <p class="text-sm">Event disembunyikan. Klik "Tampilkan Event" untuk melihat daftar.</p>
            </div>

            <!-- Last Sync Info -->
            <div class="mt-6 pt-4 border-t border-border">
              <div class="flex items-center justify-between">
                <p class="text-xs text-muted-foreground">
                  <ClockIcon class="w-3 h-3 inline mr-1" />
                  Terakhir sync: {{ lastSyncTime || 'Belum pernah' }}
                </p>
                <span class="text-xs font-medium" :class="pendingSyncCount > 0 ? 'text-warning' : 'text-success'">
                  {{ pendingSyncCount }} pending
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- UPLOAD CARD (Kanan) -->
        <div class="relative overflow-hidden bg-card border border-border rounded-2xl p-8 h-full">
          <div class="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-0" />
          
          <div class="relative z-10 flex flex-col h-full">
            <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <UploadCloudIcon class="w-8 h-8 text-accent" />
            </div>

            <h2 class="text-2xl font-bold text-card-foreground mb-3">
              Upload Data
            </h2>

            <p class="text-muted-foreground mb-6 leading-relaxed">
              Upload hasil ujian siswa ke Back Office berdasarkan agenda yang tersedia
            </p>

            <!-- Stats Ringkasan -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="bg-muted/30 rounded-lg p-3">
                <p class="text-xs text-muted-foreground">Total Agenda</p>
                <p class="text-xl font-bold text-card-foreground">{{ agendas.length }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3">
                <p class="text-xs text-muted-foreground">Terakhir Upload</p>
                <p class="text-xs font-medium text-card-foreground mt-1">{{ lastUploadTime || '-' }}</p>
              </div>
            </div>

            <!-- Toggle & Refresh Controls -->
            <div class="flex items-center justify-between mb-4">
              <Button 
                @click="showAgendas = !showAgendas" 
                variant="outline" 
                size="sm" 
                class="gap-2"
              >
                <EyeIcon :class="['w-4 h-4', showAgendas ? 'text-accent' : 'text-muted-foreground']" />
                {{ showAgendas ? 'Sembunyikan Agenda' : 'Tampilkan Agenda' }}
              </Button>

              <Button 
                v-if="showAgendas"
                @click="fetchAgendas" 
                variant="ghost" 
                size="sm" 
                class="gap-1.5"
                :disabled="loadingAgendas"
              >
                <RefreshCwIcon :class="['w-3 h-3', { 'animate-spin': loadingAgendas }]" />
                Refresh
              </Button>
            </div>

            <!-- Daftar Agenda -->
            <div v-if="showAgendas" class="space-y-4 flex-1">
              <h3 class="text-sm font-semibold text-card-foreground">Agenda Tersedia</h3>

              <div v-if="loadingAgendas" class="py-8 text-center">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                  <span class="text-sm text-muted-foreground">Memuat agenda...</span>
                </div>
              </div>

              <div v-else-if="agendas.length === 0" class="py-8 text-center text-muted-foreground">
                <CalendarIcon class="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p class="text-sm">Belum ada agenda tersedia</p>
              </div>

              <div v-else class="max-h-[240px] overflow-y-auto pr-1 space-y-2">
                <div 
                  v-for="agenda in agendas" 
                  :key="agenda.id"
                  class="p-3 rounded-lg border transition-all duration-200"
                  :class="uploadingAgendaId === agenda.id ? 'border-accent ring-1 ring-accent/30 bg-accent/5' : 'bg-card border-border'"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-card-foreground truncate">{{ agenda.title }}</p>
                      <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <CalendarIcon class="w-3 h-3" />
                        <span>{{ formatDate(agenda.startTime) }} – {{ formatDate(agenda.endTime) }}</span>
                      </div>
                    </div>
                    
                    <Button
                      @click="confirmUploadAgenda(agenda)"
                      :disabled="!!uploadingAgendaId"
                      size="sm"
                      class="gap-1.5 flex-shrink-0"
                    >
                      <UploadIcon class="w-3 h-3" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hidden state -->
            <div v-else-if="!showAgendas && agendas.length > 0" class="py-4 text-center text-muted-foreground flex-1">
              <p class="text-sm">Agenda disembunyikan. Klik "Tampilkan Agenda" untuk melihat daftar.</p>
            </div>

            <!-- Last Upload Info -->
            <div class="mt-6 pt-4 border-t border-border">
              <p class="text-xs text-muted-foreground">
                <ClockIcon class="w-3 h-3 inline mr-1" />
                Terakhir upload: {{ lastUploadTime || 'Belum pernah' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Connection -->
      <div class="bg-card border border-border rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Status Koneksi</p>
            <p class="text-2xl font-bold" :class="isConnected ? 'text-success' : 'text-destructive'">
              {{ isConnected ? 'Online' : 'Offline' }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="isConnected ? 'bg-success/10' : 'bg-destructive/10'">
            <WifiIcon v-if="isConnected" class="w-6 h-6 text-success" />
            <WifiOffIcon v-else class="w-6 h-6 text-destructive" />
          </div>
        </div>
      </div>
    </div>

    <!-- Sync Confirmation Dialog with Progress -->
    <Dialog :open="showSyncDialog" @update:open="showSyncDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ isSyncing ? 'Menyinkronisasi Event...' : 'Konfirmasi Sync Event' }}
          </DialogTitle>
          <DialogDescription v-if="!isSyncing">
            Yakin ingin menyinkronisasi event <strong>{{ selectedEvent?.nama_event }}</strong>?
            <br>
            Proses ini akan mengunduh data terbaru dari Back Office.
          </DialogDescription>
        </DialogHeader>

        <!-- Spinner -->
        <div v-if="isSyncing" class="py-6">
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="text-xs text-muted-foreground">Mohon tunggu, jangan tutup jendela ini...</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            v-if="!isSyncing" 
            variant="outline" 
            @click="showSyncDialog = false"
          >
            Batal
          </Button>
          <Button 
            v-if="!isSyncing" 
            @click="startSync"
          >
            <DownloadIcon class="w-4 h-4 mr-2" />
            Ya, Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Upload Dialog with Progress -->
    <Dialog :open="showUploadDialog" @update:open="showUploadDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ isUploading ? 'Mengupload Data...' : 'Konfirmasi Upload Data' }}
          </DialogTitle>
          <DialogDescription v-if="!isUploading">
            Yakin ingin mengupload hasil ujian untuk agenda
            <strong>{{ selectedAgenda?.title }}</strong>?
            Pastikan koneksi internet stabil.
          </DialogDescription>
        </DialogHeader>

        <!-- Spinner -->
        <div v-if="isUploading" class="py-6">
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <p class="text-xs text-muted-foreground">Mohon tunggu, jangan tutup jendela ini...</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            v-if="!isUploading" 
            variant="outline" 
            @click="showUploadDialog = false"
          >
            Batal
          </Button>
          <Button 
            v-if="!isUploading" 
            @click="startUpload" 
          >
            <UploadIcon class="w-4 h-4 mr-2" />
            Ya, Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  DownloadCloudIcon,
  UploadCloudIcon,
  CheckCircleIcon,
  DownloadIcon,
  UploadIcon,
  ClockIcon,
  WifiIcon,
  WifiOffIcon,
  CalendarIcon,
  RefreshCwIcon,
  EyeIcon,
  ArrowLeftIcon
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
import { useToast } from '@/hooks/use-toast'
import { getEventBo, syncEventBo, getAgenda, pushUpload } from '@/services/syncService'
import type { IEventBO, IAgenda } from '@/types/ISync'

const router = useRouter()
const { toast } = useToast()

// State
const loadingEvents = ref(false)
const events = ref<IEventBO[]>([])
const selectedEvent = ref<IEventBO | null>(null)
const syncingEventId = ref<string | null>(null)
const showEvents = ref(false)

// Upload / Agenda state
const loadingAgendas = ref(false)
const agendas = ref<IAgenda[]>([])
const selectedAgenda = ref<IAgenda | null>(null)
const uploadingAgendaId = ref<string | null>(null)
const showAgendas = ref(false)

const isSyncing = ref(false)
const isUploading = ref(false)
const showSyncDialog = ref(false)
const showUploadDialog = ref(false)

const lastSyncTime = ref<string | null>(null)
const lastUploadTime = ref<string | null>(null)

const isConnected = ref(true)

// Computed
const pendingSyncCount = computed(() => 
  events.value.filter(e => !e.synced).length
)

const syncedCount = computed(() => 
  events.value.filter(e => e.synced).length
)

// Helper functions
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Fetch events from API
const fetchEvents = async () => {
  loadingEvents.value = true
  try {
    const response = await getEventBo()
    // Karena interface sudah diperbaiki (boolean), ini akan lancar
    if (response && response.success) {
      events.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to fetch events:', error)
  } finally {
    loadingEvents.value = false
  }
}
// Sync confirmation
const confirmSyncEvent = (event: IEventBO) => {
  if (!isConnected.value) {
    toast({
      title: 'Tidak ada koneksi',
      description: 'Pastikan perangkat terhubung ke internet',
      variant: 'destructive'
    })
    return
  }
  
  selectedEvent.value = event
  showSyncDialog.value = true
}

// Start sync process
const startSync = async () => {
  if (!selectedEvent.value) {
    console.error("Data event kosong");
    return;
  }

  const event = selectedEvent.value as IEventBO;
  
  isSyncing.value = true;
  syncingEventId.value = event.id;
  
  try {
    await syncEventBo(event.id);
    
    const target = events.value.find(e => e.id === event.id);
    if (target) {
      target.synced = true;
    }
    
    const now = new Date().toLocaleString('id-ID');
    lastSyncTime.value = now;
    localStorage.setItem('last_sync_time', now);
    
    toast({
      title: 'Sync berhasil!',
      description: `Event ${event.nama_event} sinkron.`,
    });
    
    showSyncDialog.value = false;
  } catch (error) {
    console.error(error);
    toast({ title: 'Sync gagal', variant: 'destructive' });
  } finally {
    isSyncing.value = false;
    syncingEventId.value = null;
  }
}

// Fetch agendas
const fetchAgendas = async () => {
  loadingAgendas.value = true
  try {
    const response = await getAgenda()
    if (response && response.success) {
      agendas.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to fetch agendas:', error)
  } finally {
    loadingAgendas.value = false
  }
}

// Upload confirmation
const confirmUploadAgenda = (agenda: IAgenda) => {
  if (!isConnected.value) {
    toast({
      title: 'Tidak ada koneksi',
      description: 'Pastikan perangkat terhubung ke internet',
      variant: 'destructive'
    })
    return
  }
  selectedAgenda.value = agenda
  showUploadDialog.value = true
}

// Upload handlers
const startUpload = async () => {
  if (!selectedAgenda.value) return

  const agenda = selectedAgenda.value
  isUploading.value = true
  uploadingAgendaId.value = agenda.id
  
  try {
    await pushUpload(agenda.id)

    lastUploadTime.value = new Date().toLocaleString('id-ID')
    localStorage.setItem('last_upload_time', lastUploadTime.value)
    
    toast({
      title: 'Upload berhasil!',
      description: `Agenda "${agenda.title}" berhasil diupload ke Back Office`,
      variant: 'default'
    })
    
    showUploadDialog.value = false
  } catch (error) {
    console.error(error)
    toast({ title: 'Upload gagal', variant: 'destructive' })
  } finally {
    isUploading.value = false
    uploadingAgendaId.value = null
  }
}

// Connection checker
const checkConnection = () => {
  isConnected.value = navigator.onLine
}

onMounted(() => {
  checkConnection()
  window.addEventListener('online', checkConnection)
  window.addEventListener('offline', checkConnection)
  
  fetchEvents()
  fetchAgendas()
  
  lastSyncTime.value = localStorage.getItem('last_sync_time')
  lastUploadTime.value = localStorage.getItem('last_upload_time')
})

onUnmounted(() => {
  window.removeEventListener('online', checkConnection)
  window.removeEventListener('offline', checkConnection)
})
</script>