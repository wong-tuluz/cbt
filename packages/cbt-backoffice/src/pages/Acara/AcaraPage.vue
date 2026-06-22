<template>
  <main class="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calendar class="h-6 w-6 text-primary" />
          Manajemen Acara Ujian
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Buat dan kelola event / acara ujian besar beserta rentang waktu pelaksanaannya.
        </p>
      </div>
      <Button @click="openAddModal" class="gap-2 font-semibold">
        <Plus class="h-4 w-4" />
        Tambah Acara
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data acara...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="acaraList.length === 0" class="text-center py-16 border border-dashed rounded-2xl bg-card">
      <Calendar class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-bold text-foreground">Belum Ada Acara Ujian</h3>
      <p class="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Silakan daftarkan acara ujian baru terlebih dahulu agar proktor dapat membuat jadwal pengerjaan.
      </p>
      <Button @click="openAddModal" class="mt-4 gap-2">
        <Plus class="h-4 w-4" /> Buat Acara Pertama
      </Button>
    </div>

    <!-- Acara Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="acara in acaraList" 
        :key="acara.id"
        class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
      >
        <div class="space-y-4">
          <!-- Status Badge & Edit -->
          <div class="flex justify-between items-center">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
              :class="getStatusClass(determineStatus(acara.startTime, acara.endTime))"
            >
              {{ getStatusLabel(determineStatus(acara.startTime, acara.endTime)) }}
            </span>
            
            <Button @click="openEditModal(acara)" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Edit3 class="h-4 w-4" />
            </Button>
          </div>

          <!-- Title & ID -->
          <div>
            <h3 class="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
              {{ acara.title }}
            </h3>
            <p class="text-xs text-muted-foreground font-mono mt-1">ID: {{ acara.id?.slice(0, 8) }}...</p>
          </div>

          <!-- Description -->
          <p class="text-sm text-muted-foreground line-clamp-2">
            {{ acara.description || 'Tidak ada deskripsi.' }}
          </p>

          <!-- Times -->
          <div class="bg-muted/40 p-3 rounded-xl border space-y-1.5 text-xs text-muted-foreground">
            <div class="flex items-center gap-2">
              <CalendarDays class="h-3.5 w-3.5 text-primary" />
              <span>Mulai: <strong>{{ formatDateTime(acara.startTime) }}</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="h-3.5 w-3.5 text-primary" />
              <span>Selesai: <strong>{{ formatDateTime(acara.endTime) }}</strong></span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t flex justify-end">
          <RouterLink 
            :to="`/acara/${acara.id}`"
            class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm gap-1 group/btn"
          >
            Kelola Detail
            <ArrowRight class="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Dialog v-model:open="showFormModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? 'Edit Acara Ujian' : 'Tambah Acara Ujian' }}</DialogTitle>
          <DialogDescription>
            Tentukan judul acara, deskripsi singkat, dan rentang waktu pelaksanaannya.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-4 py-2">
          <!-- Title -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-foreground font-medium">Nama Acara Ujian <span class="text-destructive">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              required
              placeholder="Contoh: PAS Semester Ganjil 2026"
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-foreground font-medium">Deskripsi</label>
            <textarea 
              v-model="form.description" 
              rows="2"
              placeholder="Contoh: Penilaian Akhir Semester untuk kelas XII"
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            ></textarea>
          </div>

          <!-- Times Range -->
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-foreground font-medium">Waktu Mulai <span class="text-destructive">*</span></label>
              <input 
                v-model="form.startTime" 
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-foreground font-medium">Waktu Selesai <span class="text-destructive">*</span></label>
              <input 
                v-model="form.endTime" 
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <p v-if="isTimeInvalid" class="text-xs text-destructive font-medium">
              * Waktu selesai harus setelah waktu mulai.
            </p>
          </div>

          <DialogFooter class="border-t pt-4 mt-6">
            <Button type="button" variant="outline" @click="showFormModal = false" :disabled="submitting">
              Batal
            </Button>
            <Button type="submit" :disabled="submitting || isTimeInvalid" class="gap-1.5">
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              Simpan Acara
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Calendar, Plus, Edit3, CalendarDays, Clock, ArrowRight, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getAcaraList, createAcara, type IAcara } from '@/services/acaraService'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()
const loading = ref(true)
const submitting = ref(false)
const acaraList = ref<IAcara[]>([])

// Modal control
const showFormModal = ref(false)
const isEdit = ref(false)
const selectedAcara = ref<IAcara | null>(null)

// Form states
const form = ref<{
  title: string
  description: string
  startTime: string
  endTime: string
}>({
  title: '',
  description: '',
  startTime: '',
  endTime: ''
})

const isTimeInvalid = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return false
  return new Date(form.value.startTime) >= new Date(form.value.endTime)
})

async function fetchAcara() {
  loading.value = true
  try {
    acaraList.value = await getAcaraList()
  } catch (err: any) {
    toast({
      title: 'Gagal memuat acara',
      description: err.message || 'Terjadi kesalahan saat memuat daftar acara.',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEdit.value = false
  selectedAcara.value = null
  
  // Default values: now and tomorrow
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  form.value = {
    title: '',
    description: '',
    startTime: formatToLocalDateTimeInput(now),
    endTime: formatToLocalDateTimeInput(tomorrow)
  }
  showFormModal.value = true
}

function openEditModal(acara: IAcara) {
  isEdit.value = true
  selectedAcara.value = acara
  
  form.value = {
    title: acara.title,
    description: acara.description || '',
    startTime: formatToLocalDateTimeInput(new Date(acara.startTime)),
    endTime: formatToLocalDateTimeInput(new Date(acara.endTime))
  }
  showFormModal.value = true
}

async function submitForm() {
  submitting.value = true
  try {
    const payload: IAcara = {
      id: selectedAcara.value?.id,
      title: form.value.title,
      description: form.value.description,
      startTime: new Date(form.value.startTime).toISOString(),
      endTime: new Date(form.value.endTime).toISOString()
    }

    await createAcara(payload)
    toast({
      title: isEdit.value ? 'Acara berhasil diperbarui' : 'Acara berhasil dibuat',
      description: 'Acara ujian telah tersimpan di server.'
    })
    showFormModal.value = false
    await fetchAcara()
  } catch (err: any) {
    toast({
      title: 'Gagal menyimpan acara',
      description: err.message || 'Terjadi kesalahan saat menyimpan data acara.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}

// Helpers
function determineStatus(startStr: string, endStr: string): 'ongoing' | 'upcoming' | 'completed' {
  const now = new Date()
  const start = new Date(startStr)
  const end = new Date(endStr)

  if (now > end) return 'completed'
  if (now < start) return 'upcoming'
  return 'ongoing'
}

function getStatusClass(status: 'ongoing' | 'upcoming' | 'completed') {
  switch (status) {
    case 'ongoing':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-200'
    case 'upcoming':
      return 'bg-blue-500/10 text-blue-500 border-blue-200'
    case 'completed':
      return 'bg-slate-500/10 text-slate-500 border-slate-200'
  }
}

function getStatusLabel(status: 'ongoing' | 'upcoming' | 'completed') {
  switch (status) {
    case 'ongoing': return 'Berjalan'
    case 'upcoming': return 'Mendatang'
    case 'completed': return 'Selesai'
  }
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
  fetchAcara()
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
