<template>
  <main class="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
      <RouterLink to="/paket-soal" class="hover:text-primary transition-colors">
        Paket Soal
      </RouterLink>
      <ChevronRight class="h-3 w-3" />
      <span class="text-foreground truncate max-w-xs" v-if="paketInfo">
        {{ paketInfo.title }}
      </span>
      <ChevronRight class="h-3 w-3" />
      <span class="text-primary truncate max-w-xs" v-if="materiInfo">
        Materi #{{ materiInfo.order }}: {{ materiInfo.title }}
      </span>
    </nav>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen class="h-6 w-6 text-primary" />
          Manajemen Butir Soal
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Kelola soal pilihan ganda tunggal, pilihan ganda majemuk, maupun essay untuk materi ini.
        </p>
      </div>
      <Button @click="openAddModal" class="gap-2 font-semibold">
        <Plus class="h-4 w-4" />
        Tambah Soal
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat daftar soal...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="soalList.length === 0" class="text-center py-16 border border-dashed rounded-2xl bg-card">
      <HelpCircle class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-bold text-foreground">Belum Ada Soal</h3>
      <p class="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Silakan tambahkan butir soal pertama untuk materi ini.
      </p>
      <Button @click="openAddModal" class="mt-4 gap-2">
        <Plus class="h-4 w-4" /> Buat Soal Pertama
      </Button>
    </div>

    <!-- Questions List -->
    <div v-else class="space-y-6">
      <div 
        v-for="(soal, index) in soalList.sort((a,b) => a.order - b.order)" 
        :key="soal.id"
        class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <!-- Card Header Info -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 mb-4">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="font-extrabold bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center">
              {{ index + 1 }}
            </span>
            <span 
              class="font-semibold px-2.5 py-0.5 rounded-full border"
              :class="{
                'bg-blue-500/10 text-blue-500 border-blue-200': soal.type === 'single-choice',
                'bg-purple-500/10 text-purple-500 border-purple-200': soal.type === 'multiple-choice',
                'bg-amber-500/10 text-amber-500 border-amber-200': soal.type === 'essay'
              }"
            >
              {{ 
                soal.type === 'single-choice' ? 'Pilihan Ganda Tunggal' : 
                soal.type === 'multiple-choice' ? 'Pilihan Ganda Majemuk' : 'Essay / Isian' 
              }}
            </span>
            <span class="text-muted-foreground">Order: {{ soal.order }}</span>
            <span class="text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              Benar: +{{ soal.weightCorrect }}
            </span>
            <span class="text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-lg">
              Salah: {{ soal.weightWrong }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <Button @click="openEditModal(soal)" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Edit3 class="h-4 w-4" />
            </Button>
            <Button @click="triggerDelete(soal)" variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:bg-destructive/10">
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Question Prompt -->
        <div class="space-y-4">
          <div class="text-sm font-semibold text-foreground whitespace-pre-line leading-relaxed">
            {{ soal.prompt }}
          </div>

          <!-- Answer Choices -->
          <div v-if="soal.type !== 'essay'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 border-l-2">
            <div 
              v-for="jaw in soal.jawaban?.sort((a,b) => a.order - b.order)" 
              :key="jaw.id"
              class="flex items-start gap-3 p-3 rounded-xl border bg-muted/30"
              :class="jaw.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : ''"
            >
              <div 
                class="mt-0.5 rounded-full p-1 flex items-center justify-center shrink-0"
                :class="jaw.isCorrect ? 'bg-emerald-500 text-white' : 'bg-muted border border-border text-transparent'"
              >
                <Check class="h-3 w-3" />
              </div>
              <div class="text-xs leading-relaxed">
                <span class="font-bold text-muted-foreground text-xs uppercase mr-1">
                  {{ String.fromCharCode(64 + jaw.order) }}.
                </span>
                <span :class="jaw.isCorrect ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-foreground'">
                  {{ jaw.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Dialog v-model:open="showFormModal">
      <DialogContent class="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? 'Edit Butir Soal' : 'Tambah Butir Soal' }}</DialogTitle>
          <DialogDescription>
            Tentukan tipe soal, isi pertanyaan, bobot nilai, serta pilihan jawabannya.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-5 py-2">
          <!-- Question Type -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-sm font-bold text-foreground">Tipe Soal <span class="text-destructive">*</span></label>
              <select 
                v-model="form.type" 
                @change="handleTypeChange"
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="single-choice">Pilihan Ganda Tunggal (Satu Jawaban Benar)</option>
                <option value="multiple-choice">Pilihan Ganda Majemuk (Banyak Jawaban Benar)</option>
                <option value="essay">Essay / Isian Singkat</option>
              </select>
            </div>
            
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">No. Urut (Order)</label>
              <input 
                v-model.number="form.order" 
                type="number" 
                min="1" 
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <!-- Prompt Question -->
          <div class="space-y-1.5">
            <label class="text-sm font-bold text-foreground">Pertanyaan / Soal <span class="text-destructive">*</span></label>
            <textarea 
              v-model="form.prompt" 
              rows="4" 
              required
              placeholder="Ketikkan pertanyaaan di sini..."
              class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium leading-relaxed"
            ></textarea>
          </div>

          <!-- Score Weights -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">Bobot Jika Benar <span class="text-destructive">*</span></label>
              <input 
                v-model.number="form.weightCorrect" 
                type="number" 
                step="any"
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-foreground">Bobot Jika Salah <span class="text-destructive">*</span></label>
              <input 
                v-model.number="form.weightWrong" 
                type="number" 
                step="any"
                required
                class="w-full px-3 py-2 border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Choices Options (Skip for Essay) -->
          <div v-if="form.type !== 'essay'" class="space-y-3 border-t pt-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-foreground flex items-center gap-1.5">
                <CheckSquare class="h-4 w-4 text-primary" />
                Pilihan Jawaban
              </label>
              <Button type="button" @click="addChoiceField" variant="outline" size="sm" class="gap-1 px-2.5 py-1 text-xs">
                <Plus class="h-3 w-3" /> Tambah Pilihan
              </Button>
            </div>

            <!-- Options inputs -->
            <div class="space-y-2">
              <div 
                v-for="(jaw, idx) in form.jawaban" 
                :key="idx" 
                class="flex items-center gap-2 bg-muted/20 p-2.5 rounded-xl border"
                :class="jaw.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : ''"
              >
                <!-- ABC Indicator -->
                <span class="text-sm font-bold text-muted-foreground w-6 text-center">
                  {{ String.fromCharCode(64 + (jaw.order = idx + 1)) }}
                </span>

                <!-- Input Option value -->
                <input 
                  v-model="jaw.value" 
                  type="text" 
                  required
                  placeholder="Ketikkan teks pilihan..."
                  class="flex-1 px-3 py-1.5 border rounded-lg bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                />

                <!-- Correct Checkbox -->
                <label class="flex items-center gap-1.5 px-2 py-1 bg-background border rounded-lg cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    :checked="jaw.isCorrect" 
                    @change="toggleCorrect(idx)"
                    class="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500 rounded border-border"
                  />
                  <span class="text-[10px] font-bold text-muted-foreground" :class="jaw.isCorrect ? 'text-emerald-600' : ''">
                    BENAR
                  </span>
                </label>

                <!-- Remove Button -->
                <Button 
                  type="button" 
                  @click="removeChoiceField(idx)" 
                  variant="ghost" 
                  size="icon" 
                  class="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div v-if="form.jawaban.length === 0" class="text-xs text-center py-4 text-muted-foreground border border-dashed rounded-xl">
              Pilihan jawaban kosong. Klik "Tambah Pilihan" di atas.
            </div>
            
            <p v-if="hasCorrectValidationWarning" class="text-xs text-destructive font-medium">
              * Minimal harus ada satu pilihan jawaban yang bertanda BENAR.
            </p>
          </div>

          <DialogFooter class="border-t pt-4 mt-6">
            <Button type="button" variant="outline" @click="showFormModal = false" :disabled="submitting">
              Batal
            </Button>
            <Button type="submit" :disabled="submitting || isFormInvalid" class="gap-1.5">
              <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
              Simpan Soal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirm Modal -->
    <Dialog v-model:open="showDeleteModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-destructive">Hapus Butir Soal?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus butir soal ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  ChevronRight, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  HelpCircle, 
  CheckSquare 
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
import { getPaketSoalById, type IPaketSoal, type IMateri } from '@/services/paketSoalService'
import { 
  getSoalListByMateri, 
  createSoal, 
  updateSoal, 
  deleteSoal, 
  type ISoal,
  type IJawabanSoal
} from '@/services/soalService'
import { useToast } from '@/hooks/use-toast'

const route = useRoute()
const { toast } = useToast()

const paketId = route.params.id as string
const materiId = route.params.materiId as string

const loading = ref(true)
const submitting = ref(false)

const paketInfo = ref<IPaketSoal | null>(null)
const materiInfo = ref<IMateri | null>(null)
const soalList = ref<ISoal[]>([])

// Modal States
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const selectedSoal = ref<ISoal | null>(null)

// Form states
const form = ref<{
  type: 'single-choice' | 'multiple-choice' | 'essay'
  prompt: string
  order: number
  weightCorrect: number
  weightWrong: number
  jawaban: { value: string; isCorrect: boolean; order: number }[]
}>({
  type: 'single-choice',
  prompt: '',
  order: 1,
  weightCorrect: 1,
  weightWrong: 0,
  jawaban: []
})

const isFormInvalid = computed(() => {
  if (form.value.type === 'essay') return false
  if (form.value.jawaban.length === 0) return true
  // Check if at least one correct option exists
  return !form.value.jawaban.some(j => j.isCorrect)
})

const hasCorrectValidationWarning = computed(() => {
  if (form.value.type === 'essay') return false
  if (form.value.jawaban.length === 0) return false
  return !form.value.jawaban.some(j => j.isCorrect)
})

async function loadDetails() {
  loading.value = true
  try {
    const [paket, list] = await Promise.all([
      getPaketSoalById(paketId),
      getSoalListByMateri(materiId)
    ])
    paketInfo.value = paket
    materiInfo.value = paket.materi?.find(m => m.id === materiId) || null
    soalList.value = list
  } catch (err: any) {
    toast({
      title: 'Gagal memuat detail',
      description: err.message || 'Terjadi kesalahan saat memuat butir soal.',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

function handleTypeChange() {
  if (form.value.type === 'essay') {
    form.value.jawaban = []
  } else if (form.value.jawaban.length === 0) {
    form.value.jawaban = [
      { value: 'Pilihan A', isCorrect: true, order: 1 },
      { value: 'Pilihan B', isCorrect: false, order: 2 },
      { value: 'Pilihan C', isCorrect: false, order: 3 },
      { value: 'Pilihan D', isCorrect: false, order: 4 }
    ]
  }
}

function toggleCorrect(idx: number) {
  if (form.value.type === 'single-choice') {
    // Make only this choice correct
    form.value.jawaban.forEach((j, i) => {
      j.isCorrect = i === idx
    })
  } else {
    // Allow multiple checkboxes
    form.value.jawaban[idx].isCorrect = !form.value.jawaban[idx].isCorrect
  }
}

function addChoiceField() {
  const nextOrder = form.value.jawaban.length + 1
  form.value.jawaban.push({ value: '', isCorrect: false, order: nextOrder })
}

function removeChoiceField(idx: number) {
  form.value.jawaban.splice(idx, 1)
  form.value.jawaban.forEach((j, index) => {
    j.order = index + 1
  })
}

function openAddModal() {
  isEdit.value = false
  selectedSoal.value = null
  
  // Calculate next order
  const nextOrder = soalList.value.length > 0 ? Math.max(...soalList.value.map(s => s.order)) + 1 : 1
  
  form.value = {
    type: 'single-choice',
    prompt: '',
    order: nextOrder,
    weightCorrect: 1,
    weightWrong: 0,
    jawaban: [
      { value: '', isCorrect: true, order: 1 },
      { value: '', isCorrect: false, order: 2 },
      { value: '', isCorrect: false, order: 3 },
      { value: '', isCorrect: false, order: 4 }
    ]
  }
  showFormModal.value = true
}

function openEditModal(soal: ISoal) {
  isEdit.value = true
  selectedSoal.value = { ...soal }
  
  form.value = {
    type: soal.type,
    prompt: soal.prompt,
    order: soal.order,
    weightCorrect: soal.weightCorrect,
    weightWrong: soal.weightWrong,
    jawaban: soal.jawaban ? soal.jawaban.map(j => ({ value: j.value, isCorrect: j.isCorrect, order: j.order })) : []
  }
  showFormModal.value = true
}

async function submitForm() {
  submitting.value = true
  try {
    const payload: ISoal = {
      materiSoalId: materiId,
      type: form.value.type,
      prompt: form.value.prompt,
      order: form.value.order,
      weightCorrect: form.value.weightCorrect,
      weightWrong: form.value.weightWrong,
      jawaban: form.value.type !== 'essay' ? form.value.jawaban : undefined
    }

    if (isEdit.value && selectedSoal.value) {
      await updateSoal(selectedSoal.value.id!, payload)
      toast({
        title: 'Soal berhasil disimpan',
        description: 'Butir soal telah diperbarui.'
      })
    } else {
      await createSoal(payload)
      toast({
        title: 'Soal berhasil ditambahkan',
        description: 'Butir soal baru telah disimpan ke materi ini.'
      })
    }
    showFormModal.value = false
    await loadDetails()
  } catch (err: any) {
    toast({
      title: 'Gagal menyimpan soal',
      description: err.message || 'Gagal menyimpan butir soal. Silakan coba kembali.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}

function triggerDelete(soal: ISoal) {
  selectedSoal.value = soal
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!selectedSoal.value) return
  submitting.value = true
  try {
    await deleteSoal(selectedSoal.value.id!)
    toast({
      title: 'Soal berhasil dihapus',
      description: 'Butir soal telah dihapus secara permanen.'
    })
    showDeleteModal.value = false
    await loadDetails()
  } catch (err: any) {
    toast({
      title: 'Gagal menghapus soal',
      description: err.message || 'Gagal menghapus butir soal.',
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
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
