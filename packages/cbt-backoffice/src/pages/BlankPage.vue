<!-- src/pages/NotFound.vue -->
<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-6">
    <div class="text-center max-w-md">
      <!-- Icon -->
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
        <svg
          class="w-12 h-12 text-muted-foreground/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h1 class="text-6xl font-bold text-card-foreground mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-card-foreground mb-2">
        Halaman Tidak Ditemukan
      </h2>
      
      <!-- Description -->
      <p class="text-muted-foreground mb-8">
        Halaman yang Anda cari mungkin telah dipindahkan, dihapus, 
        atau Anda tidak memiliki akses ke halaman ini.
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button @click="goBack" variant="outline" class="gap-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Kembali
        </Button>
        <Button @click="goHome" class="gap-2">
          <HomeIcon class="w-4 h-4" />
          Ke Dashboard
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, HomeIcon } from 'lucide-vue-next'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role
  
  if (role === 'admin') {
    router.push('/management-event')
  } else {
    router.push('/dashboard')
  }
}
</script>