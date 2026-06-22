<template>
  <main class="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard Administrasi
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Selamat datang kembali. Berikut adalah ikhtisar dari sistem ujian Computer Based Test (CBT) SMK Pakem.
        </p>
      </div>
      <div class="flex items-center gap-2 bg-muted/50 border rounded-lg px-4 py-2 text-xs font-semibold">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Sistem Terhubung ke Server
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-24">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat statistik sistem...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 flex flex-col items-center max-w-md mx-auto text-center">
      <AlertCircle class="h-12 w-12 text-destructive mb-3" />
      <h3 class="font-bold text-lg text-foreground">Gagal Memuat Statistik</h3>
      <p class="text-sm text-muted-foreground mt-2 mb-6">{{ error }}</p>
      <button 
        @click="fetchStats"
        class="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Students Count Card -->
        <div class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Siswa</p>
              <h3 class="text-3xl font-extrabold mt-2">{{ totalSiswa }}</h3>
            </div>
            <div class="p-3 rounded-xl bg-primary/10 text-primary">
              <Users class="h-6 w-6" />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <span class="text-emerald-500 font-bold">Terdaftar</span> di pangkalan data lokal
          </p>
        </div>

        <!-- Events Count Card -->
        <div class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jadwal Ujian</p>
              <h3 class="text-3xl font-extrabold mt-2">{{ events.length }}</h3>
            </div>
            <div class="p-3 rounded-xl bg-primary/10 text-primary">
              <Calendar class="h-6 w-6" />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-4">
            Total event terjadwal di sistem
          </p>
        </div>

        <!-- Active Exams Card -->
        <div class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ujian Aktif</p>
              <h3 class="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">{{ activeEventsCount }}</h3>
            </div>
            <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity class="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-4">
            Ujian yang sedang berlangsung saat ini
          </p>
        </div>

        <!-- Safe Mode Status Card -->
        <div class="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode Aman Ujian</p>
              <h3 class="text-3xl font-extrabold mt-2" :class="safeMode ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'">
                {{ safeMode ? 'AKTIF' : 'NON-AKTIF' }}
              </h3>
            </div>
            <div class="p-3 rounded-xl" :class="safeMode ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'">
              <ShieldAlert class="h-6 w-6" />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-4">
            Proteksi fullscreen & deteksi tab
          </p>
        </div>
      </div>

      <!-- Main Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions Panel -->
        <div class="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h2 class="text-lg font-bold text-foreground">Menu Pintas Administrasi</h2>
            <p class="text-xs text-muted-foreground mt-0.5">Navigasi cepat ke manajemen sistem.</p>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <RouterLink 
              to="/management-event" 
              class="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-sidebar-accent transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Calendar class="h-5 w-5" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-semibold text-foreground">Manajemen Ujian</p>
                  <p class="text-xs text-muted-foreground">Kelola event & proktor session</p>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </RouterLink>

            <RouterLink 
              to="/management-siswa" 
              class="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-sidebar-accent transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Users class="h-5 w-5" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-semibold text-foreground">Manajemen Siswa</p>
                  <p class="text-xs text-muted-foreground">Lihat data & atur ulang password</p>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </RouterLink>

            <RouterLink 
              to="/sync-upload" 
              class="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-sidebar-accent transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <RefreshCw class="h-5 w-5" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-semibold text-foreground">Sinkronisasi Data</p>
                  <p class="text-xs text-muted-foreground">Unduh soal & unggah hasil ujian</p>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </RouterLink>

            <RouterLink 
              to="/akses" 
              class="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-sidebar-accent transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Shield class="h-5 w-5" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-semibold text-foreground">Kontrol Akses</p>
                  <p class="text-xs text-muted-foreground">Pengaturan mode aman & kunci sistem</p>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </RouterLink>
          </div>
        </div>

        <!-- Upcoming / Active Exams list -->
        <div class="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-foreground">Event & Jadwal Terdekat</h2>
              <p class="text-xs text-muted-foreground mt-0.5">Daftar agenda ujian terdaftar di sistem lokal.</p>
            </div>
            <RouterLink 
              to="/management-event" 
              class="text-xs text-primary font-bold hover:underline"
            >
              Lihat Semua
            </RouterLink>
          </div>

          <div v-if="events.length > 0" class="divide-y max-h-[380px] overflow-y-auto pr-1 space-y-0.5">
            <div 
              v-for="exam in events.slice(0, 5)" 
              :key="exam.id" 
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p class="text-sm font-bold text-foreground">{{ exam.title }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ exam.agendaTitle }}</p>
                <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <Calendar class="h-3 w-3" /> {{ exam.date }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Clock class="h-3 w-3" /> {{ exam.time }} - {{ exam.timeEnd }}
                  </span>
                </div>
              </div>

              <div>
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-emerald-500/10 text-emerald-500': exam.status === 'ongoing',
                    'bg-blue-500/10 text-blue-500': exam.status === 'upcoming',
                    'bg-slate-500/10 text-slate-500': exam.status === 'completed'
                  }"
                >
                  {{ 
                    exam.status === 'ongoing' ? 'Berjalan' : 
                    exam.status === 'upcoming' ? 'Mendatang' : 'Selesai' 
                  }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-16 border border-dashed rounded-xl">
            <Calendar class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Tidak ada jadwal ujian terdaftar</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Users, 
  Calendar, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-vue-next'
import { getListSsiswa } from '@/services/siswaService'
import { getEvent } from '@/services/eventService'
import { getSetting } from '@/services/aksesService'
import type { Event } from '@/types/ICommon'

const loading = ref(true)
const error = ref<string | null>(null)

const totalSiswa = ref(0)
const events = ref<Event[]>([])
const safeMode = ref(false)

const activeEventsCount = computed(() => {
  return events.value.filter(exam => exam.status === 'ongoing').length
})

async function fetchStats() {
  loading.value = true
  error.value = null
  try {
    const [siswaRes, eventRes, settingsRes] = await Promise.all([
      getListSsiswa(1, 0),
      getEvent(),
      getSetting()
    ])

    totalSiswa.value = siswaRes.data?.metadata?.count || 0
    events.value = eventRes || []
    safeMode.value = settingsRes.data?.safe_mode ?? false
  } catch (err: any) {
    console.error('Error loading dashboard stats:', err)
    error.value = err.message || 'Gagal memuat data dari server.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.35s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>