<template>
  <div class="p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 mb-8">
      <div class="flex items-center gap-2 text-destructive mb-2">
        <AlertCircleIcon class="h-5 w-5" />
        <h3 class="font-semibold text-lg">Terjadi Kesalahan</h3>
      </div>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <button 
        @click="fetchData"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header dengan Search -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm mb-4 overflow-hidden">
        <div class="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold mb-2">Management Event</h1>
              <p class="text-sm text-muted-foreground">Pantau dan kelola semua ujian</p>
            </div>
            
            <!-- Search Box -->
            <div class="relative w-full md:w-80">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari event ujian..."
                class="w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid Daftar Event -->
      <div v-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardEventProktor
          v-for="event in filteredEvents"
          :key="event.id"
          :agenda-title="event.agendaTitle"
          :title="event.title"
          :description="event.description"
          :question-count="event.questionCount"
          :duration="event.duration"
          :date="event.date"
          :time="event.time"
          :status="event.status"
          :token="event.token"
          @monitor="() => handleMonitorEvent(event)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 border rounded-lg">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold text-lg mb-2">
          {{ searchQuery ? 'Event Tidak Ditemukan' : 'Belum Ada Event' }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ searchQuery ? `Tidak ditemukan event dengan kata kunci "${searchQuery}"` : 'Belum ada event ujian yang dibuat.' }}
        </p>
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
          Tampilkan Semua Event
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SearchIcon,
  XIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import CardEventProktor from '@/components/features/CardEventProktor.vue'
import { getEvent } from '@/services/eventService'
import type { Event } from '@/types/ICommon' // ⭐ IMPORT TYPE!

const router = useRouter()

const events = ref<Event[]>([]) // ⭐ BUKAN ref([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

const filteredEvents = computed(() => {
  if (!searchQuery.value.trim()) {
    return events.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return events.value.filter((event: Event) => 
    event.agendaTitle?.toLowerCase().includes(query) ||
    event.title?.toLowerCase().includes(query) ||
    event.description?.toLowerCase().includes(query)
  )
})

const handleMonitorEvent = (event: Event) => {
  router.push(`/management-event/${event.id}`)
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getEvent() // ✅ Langsung array Event
    events.value = response
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat data event'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>