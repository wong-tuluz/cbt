<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-card-foreground">Hak Akses</h1>
          <p class="text-sm text-muted-foreground mt-1">Atur visibilitas dan akses sistem ujian</p>
        </div>
        <Button @click="router.back()" variant="outline" size="sm" class="gap-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p class="text-sm text-muted-foreground">Memuat pengaturan...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
        <AlertCircleIcon class="w-10 h-10 text-destructive/50 mx-auto mb-3" />
        <p class="text-sm text-muted-foreground">{{ error }}</p>
        <Button @click="fetchSettings" variant="outline" size="sm" class="mt-4 gap-2">
          <RefreshCwIcon class="w-3 h-3" />
          Coba Lagi
        </Button>
      </div>

      <!-- Settings Card -->
      <div v-else class="bg-card border border-border rounded-xl overflow-hidden">
        <!-- Safe Mode -->
        <div class="p-5 flex items-center justify-between border-b border-border hover:bg-muted/5 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ShieldAlertIcon class="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-card-foreground">Safe Mode</h3>
              <p class="text-xs text-muted-foreground mt-0.5">Mode aman membatasi akses administratif</p>
            </div>
          </div>
          
          <Button 
            @click="toggleSetting('safe_mode')"
            :disabled="saving"
            :variant="settings.safe_mode ? 'default' : 'outline'"
            size="sm"
            class="gap-2 min-w-[80px]"
          >
            <CheckCircleIcon v-if="settings.safe_mode" class="w-3.5 h-3.5" />
            <XCircleIcon v-else class="w-3.5 h-3.5" />
            {{ settings.safe_mode ? 'ON' : 'OFF' }}
          </Button>
        </div>

        <!-- Show Hasil -->
        <div class="p-5 flex items-center justify-between hover:bg-muted/5 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <EyeIcon class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-card-foreground">Tampilkan Hasil</h3>
              <p class="text-xs text-muted-foreground mt-0.5">Siswa bisa lihat nilai setelah ujian</p>
            </div>
          </div>
          
          <Button 
            @click="toggleSetting('show_hasil')"
            :disabled="saving"
            :variant="settings.show_hasil ? 'default' : 'outline'"
            size="sm"
            class="gap-2 min-w-[80px]"
          >
            <CheckCircleIcon v-if="settings.show_hasil" class="w-3.5 h-3.5" />
            <XCircleIcon v-else class="w-3.5 h-3.5" />
            {{ settings.show_hasil ? 'ON' : 'OFF' }}
          </Button>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-muted/20 border-t border-border flex items-center justify-end gap-3">
          <Button 
            v-if="hasChanges"
            @click="resetSettings" 
            variant="ghost" 
            size="sm"
            class="gap-1.5"
            :disabled="saving"
          >
            <XIcon class="w-3.5 h-3.5" />
            Batal
          </Button>
          <Button 
            @click="saveSettings" 
            :disabled="!hasChanges || saving"
            size="sm"
            class="gap-1.5"
          >
            <div v-if="saving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <SaveIcon v-else class="w-3.5 h-3.5" />
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  ShieldAlertIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  SaveIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { IAkses } from '@/types/IAkses'
import { getSetting, updateSetting } from '@/services/aksesService'

const router = useRouter()
const { toast } = useToast()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const settings = ref<IAkses>({
  safe_mode: false,
  show_hasil: false
})

const originalSettings = ref<IAkses | null>(null)

const hasChanges = computed(() => {
  if (!originalSettings.value) return false
  return settings.value.safe_mode !== originalSettings.value.safe_mode ||
         settings.value.show_hasil !== originalSettings.value.show_hasil
})

const fetchSettings = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getSetting()
    if (response.success) {
      settings.value = response.data
      originalSettings.value = { ...response.data }
    }
  } catch (err) {
    console.error('Failed to fetch settings:', err)
    error.value = 'Gagal memuat pengaturan'
  } finally {
    loading.value = false
  }
}

const toggleSetting = (key: keyof IAkses) => {
  settings.value[key] = !settings.value[key]
}

const resetSettings = () => {
  if (originalSettings.value) {
    settings.value = { ...originalSettings.value }
  }
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    const response = await updateSetting(settings.value)
    
    if (response.success) {
      originalSettings.value = { ...settings.value }
      
      toast({
        title: 'Berhasil',
        description: 'Pengaturan hak akses diperbarui',
        variant: 'default'
      })
    }
  } catch (err) {
    console.error('Failed to save settings:', err)
    toast({
      title: 'Gagal',
      description: 'Tidak dapat menyimpan pengaturan',
      variant: 'destructive'
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>