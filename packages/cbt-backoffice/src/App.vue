<script setup lang="ts">
import { useRoute } from "vue-router"
import { useExamMode } from "@/composables/useExamMode"
import AppSidebar from "./components/AppSidebar.vue"
import AppNavbar from "@/components/AppNavbar.vue"
import SidebarProvider from "./components/ui/sidebar/SidebarProvider.vue"
import Toaster from "./components/ui/Toaster.vue"

const route = useRoute()
const { isExamActive, watchExamRoutes, showWarningModal, reEnterFullscreen, violationCount } = useExamMode()

// Jalankan watcher rute
watchExamRoutes()
</script>

<template>
  <SidebarProvider>
    <AppSidebar v-if="route.meta?.layout === 'app' && !isExamActive" />
    
    <main class="flex-1 flex flex-col overflow-hidden">
      <AppNavbar v-if="route.meta?.layout === 'app' && !isExamActive" />
      
      <div 
        class="min-h-screen bg-background relative"
        :class="{ 'exam-mode-active': isExamActive }"
      >
        <RouterView />
        <Toaster />
      </div>
    </main>
  </SidebarProvider>

  <Transition name="fade">
    <div 
      v-if="showWarningModal && isExamActive" 
      class="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border border-slate-100 dark:border-slate-800/80 transform transition-all duration-300">
        <!-- Warning Icon -->
        <div class="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <!-- Header -->
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Peringatan Pelanggaran Ujian
        </h2>
        
        <!-- Strike Badge Indicator -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold text-xs mb-6 border border-red-100 dark:border-red-900/50">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Pelanggaran Ke-{{ violationCount }} dari Maksimal 3
        </div>

        <!-- Description / Rule Guidelines -->
        <div class="text-left bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-sm border border-slate-100 dark:border-slate-800/80">
          <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Sistem mendeteksi aktivitas berikut:</p>
          <ul class="space-y-2 text-gray-500 dark:text-gray-400">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Keluar dari mode layar penuh (fullscreen).</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Membuka tab lain atau berpindah aplikasi (hilang fokus).</span>
            </li>
          </ul>
        </div>
        
        <p class="text-xs text-red-500 dark:text-red-400 font-medium mb-6 leading-relaxed">
          PENTING: Jika Anda mencapai batas maksimal (3 kali), lembar jawaban Anda akan otomatis dikumpulkan dan Anda akan dikeluarkan dari ujian.
        </p>

        <!-- Action Button -->
        <button 
          @click="reEnterFullscreen"
          class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          MASUK FULLSCREEN KEMBALI
        </button>
      </div>
    </div>
  </Transition>
</template>

<style>
/* Proteksi CSS tingkat tinggi */
.exam-mode-active {
  user-select: none !important;
  -webkit-user-select: none !important;
  height: 100vh !important;
  overflow: auto;
  pointer-events: auto;
}

.exam-mode-active img {
  pointer-events: none !important;
  -webkit-user-drag: none !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>