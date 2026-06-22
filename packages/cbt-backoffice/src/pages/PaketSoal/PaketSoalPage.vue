<template>
  <main class="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardList class="h-6 w-6 text-primary" />
          Manajemen Paket Soal
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Buat dan kelola bank soal beserta materinya untuk digunakan pada jadwal ujian.
        </p>
      </div>
      <Button @click="openAddModal" class="gap-2 font-semibold">
        <Plus class="h-4 w-4" />
        Tambah Paket Soal
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data paket soal...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="paketList.length === 0" class="text-center py-16 border border-dashed rounded-2xl bg-card">
      <ClipboardList class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-bold text-foreground">Belum Ada Paket Soal</h3>
      <p class="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Silakan tambahkan paket soal baru beserta bab/materi di dalamnya terlebih dahulu.
      </p>
      <Button @click="openAddModal" class="mt-4 gap-2">
        <Plus class="h-4 w-4" /> Buat Paket Soal Pertama
      </Button>
    </div>

    <!-- Paket Soal Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="paket in paketList" 
        :key="paket.id"
        class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
      >
        <div class="space-y-4">
          <!-- Title & Actions -->
          <div class="flex justify-between items-start gap-4">
            <div>
              <h3 class="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                {{ paket.title }}
              </h3>
              <p class="text-xs text-muted-foreground font-mono mt-1">ID: {{ paket.id.slice(0, 8) }}...</p>
            </div>
            
            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Button @click="openEditModal(paket)" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Edit3 class="h-4 w-4" />
              </Button>
              <Button @click="triggerDelete(paket)" variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:bg-destructive/10">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Description -->
          <p class="text-sm text-muted-foreground line-clamp-2">
            {{ paket.description || 'Tidak ada deskripsi.' }}
          </p>

          <!-- Materials (Materi) List -->
          <div class="space-y-2 border-t pt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daftar Materi</span>
              <span class="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {{ paket.materi?.length || 0 }} Materi
              </span>
            </div>
            
            <div v-if="paket.materi && paket.materi.length > 0" class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div 
                v-for="mat in paket.materi.sort((a,b) => a.order - b.order)" 
                :key="mat.id"
                class="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group/item"
              >
                <div class="flex items-center gap-2 truncate">
                  <span class="text-xs font-bold text-muted-foreground bg-background border rounded h-5 w-5 flex items-center justify-center">
                    {{ mat.order }}
                  </span>
                  <span class="text-xs font-medium text-foreground truncate group-hover/item:text-primary transition-colors">
                    {{ mat.title }}
                  </span>
                </div>
                
                <RouterLink 
                  :to="`/paket-soal/${paket.id}/materi/${mat.id}`"
                  class="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline group-hover/item:translate-x-0.5 transition-transform"
                >
                  Kelola Soal
                  <ChevronRight class="h-3 w-3" />
                </RouterLink>
              </div>
            </div>
            <div v-else class="text-xs text-center py-4 text-muted-foreground">
              Belum ada materi terdaftar.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Dialog v-model:open="showFormModal">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? 'Edit Paket Soal' : 'Tambah Paket Soal' }}</DialogTitle>
          <DialogDescription>
            Masukkan judul, deskripsi, dan materi/bab soal untuk paket ini.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-4 py-2">
          <!-- Title -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-foreground">Judul Paket Soal <span class="text-destructive">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              required
              placeholder="Contoh: Paket Ujian Matematika Utama"
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-foreground">Deskripsi</label>
            <textarea 
              v-model="form.description" 
              rows="2"
              placeholder="Contoh: Ujian kelulusan kelas XII IPA/IPS"
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            ></textarea>
          </div>

          <!-- Materials Section -->
          <div class="space-y-3 border-t pt-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-foreground flex items-center gap-1.5">
                <BookOpen class="h-4 w-4 text-primary" />
                Daftar Materi / Bab
              </label>
              <Button type="button" @click="addMateriField" variant="outline" size="sm" class="gap-1 px-2.5 py-1 text-xs">
                <Plus class="h-3 w-3" /> Tambah Materi
              </Button>
            </div>

            <!-- Dynamic Materi Fields -->
            <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              <div 
                v-for="(matField, idx) in form.materi" 
                :key="idx" 
                class="flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl border"
              >
                <!-- Order Label -->
                <span class="text-xs font-bold text-muted-foreground w-6 text-center">
                  #{{ matField.order = idx + 1 }}
                </span>
                
                <!-- Input Title -->
                <input 
                  v-model="matField.title" 
                  type="text" 
                  required
                  placeholder="Nama bab/materi"
                  class="flex-1 px-3 py-1.5 border rounded-lg bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />

                <!-- Remove Button -->
                <Button 
                  type="button" 
                  @click="removeMateriField(idx)" 
                  variant="ghost" 
                  size="icon" 
                  class="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X class="h-3.5 w-3.5" />
                </Button>
              </div>

              <div v-if="form.materi.length === 0" class="text-xs text-center py-4 text-muted-foreground border border-dashed rounded-xl">
                Minimal satu materi harus ditambahkan.
              </div>
            </div>
          </div>

          <DialogFooter class="border-t pt-4 mt-6">
            <Button type="button" variant="outline" @click="showFormModal = false" :disabled="submitting">
              Batal
            </Button>
            <Button type="submit" :disabled="submitting || form.materi.length === 0" class="gap-1.5">
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              Simpan Paket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirm Modal -->
    <Dialog v-model:open="showDeleteModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-destructive">Hapus Paket Soal?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus paket soal <strong>{{ selectedPaket?.title }}</strong>?
            Tindakan ini akan menghapus seluruh materi dan butir soal di dalamnya secara permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-4">
          <Button variant="outline" @click="showDeleteModal = false" :disabled="submitting">
            Batal
          </Button>
          <Button variant="destructive" @click="confirmDelete" :disabled="submitting" class="gap-1.5">
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            Ya, Hapus Permanen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ClipboardList, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  BookOpen, 
  X, 
  Loader2 
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
  getPaketSoalList, 
  createPaketSoal, 
  updatePaketSoal, 
  deletePaketSoal, 
  type IPaketSoal 
} from '@/services/paketSoalService'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()
const loading = ref(true)
const submitting = ref(false)
const paketList = ref<IPaketSoal[]>([])

// Modal controls
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const selectedPaket = ref<IPaketSoal | null>(null)

// Form states
const form = ref<{
  title: string
  description: string
  materi: { id?: string; title: string; order: number }[]
}>({
  title: '',
  description: '',
  materi: []
})

async function fetchPaket() {
  loading.value = true
  try {
    paketList.value = await getPaketSoalList()
  } catch (err: any) {
    toast({
      title: 'Gagal memuat paket',
      description: err.message || 'Terjadi kesalahan saat memuat data paket soal.',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEdit.value = false
  selectedPaket.value = null
  form.value = {
    title: '',
    description: '',
    materi: [{ title: 'Materi Utama', order: 1 }]
  }
  showFormModal.value = true
}

function openEditModal(paket: IPaketSoal) {
  isEdit.value = true
  selectedPaket.value = paket
  form.value = {
    title: paket.title,
    description: paket.description || '',
    materi: paket.materi ? paket.materi.map(m => ({ id: m.id, title: m.title, order: m.order })) : []
  }
  showFormModal.value = true
}

function addMateriField() {
  const nextOrder = form.value.materi.length + 1
  form.value.materi.push({ title: '', order: nextOrder })
}

function removeMateriField(idx: number) {
  form.value.materi.splice(idx, 1)
  // Re-adjust order
  form.value.materi.forEach((m, index) => {
    m.order = index + 1
  })
}

async function submitForm() {
  submitting.value = true
  try {
    if (isEdit.value && selectedPaket.value) {
      await updatePaketSoal(selectedPaket.value.id, form.value)
      toast({
        title: 'Paket berhasil diperbarui',
        description: 'Detail paket soal dan materi berhasil disimpan.'
      })
    } else {
      await createPaketSoal(form.value)
      toast({
        title: 'Paket berhasil dibuat',
        description: 'Paket soal baru berhasil didaftarkan.'
      })
    }
    showFormModal.value = false
    await fetchPaket()
  } catch (err: any) {
    toast({
      title: 'Gagal menyimpan paket',
      description: err.message || 'Gagal menyimpan paket soal. Silakan coba kembali.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}

function triggerDelete(paket: IPaketSoal) {
  selectedPaket.value = paket
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!selectedPaket.value) return
  submitting.value = true
  try {
    await deletePaketSoal(selectedPaket.value.id)
    toast({
      title: 'Paket berhasil dihapus',
      description: 'Paket soal beserta isinya telah terhapus dari sistem.'
    })
    showDeleteModal.value = false
    await fetchPaket()
  } catch (err: any) {
    toast({
      title: 'Gagal menghapus paket',
      description: err.message || 'Terjadi kesalahan saat menghapus paket soal.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPaket()
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
