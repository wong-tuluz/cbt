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
      class="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-sm w-full shadow-xl text-center border border-gray-100 dark:border-slate-800">
        <div class="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Layar Penuh Terhenti</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          anda melanggar sebanyak: {{ violationCount }}
        </p>
        <p class="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          Sistem mendeteksi Anda keluar dari mode layar penuh atau berpindah fokus. 
          Harap masuk kembali untuk melanjutkan ujian.
        </p>

        <button 
          @click="reEnterFullscreen"
          class="w-full py-3 bg-[#2D7A1E] hover:bg-[#246118] text-white font-semibold rounded-lg transition-all transform active:scale-[0.98] shadow-md shadow-green-900/10 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          MASUK FULLSCREEN
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