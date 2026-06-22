<template>
  <div 
    class="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
  >
    <!-- Status Bar -->
    <div class="h-2" :class="statusBarColor"></div>
    
    <!-- Header Kartu -->
    <div class="flex flex-col space-y-1.5 p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <!-- AGENDA TITLE -->
          <h3 class="font-semibold text-xl mb-2">{{ agendaTitle }}</h3>
          <!-- PAKET SOAL TITLE -->
          <p class="text-sm font-medium text-foreground mb-1">{{ title }}</p>
          <!-- DESCRIPTION -->
          <p class="text-sm text-muted-foreground">{{ description }}</p>
        </div>
        
        <!-- Badge Status -->
        <div class="space-y-1">
          <div 
            class="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
            :class="badgeClasses"
          >
            <component :is="statusIcon" class="w-3 h-3" />
            {{ statusText }}
          </div>
          <div class="rounded-full border px-2.5 py-0.5 text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap">
            <Lock class="w-3 h-3" />
            <span>{{ token }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Konten Kartu -->
    <div class="p-6 pt-0">
      <!-- Detail Ujian -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="flex items-center gap-2 text-muted-foreground">
          <FileTextIcon class="w-4 h-4" />
          <span>{{ questionCount }} Soal</span>
        </div>
        <div class="flex items-center gap-2 text-muted-foreground">
          <ClockIcon class="w-4 h-4" />
          <span>{{ duration }} Menit</span>
        </div>
        <div class="flex items-center gap-2 text-muted-foreground col-span-2 md:col-span-1">
          <CalendarIcon class="w-4 h-4" />
          <span class="truncate">{{ date }} • {{ time }}</span>
        </div>
      </div>

      <!-- Tombol Monitor - Warna mengikuti status -->
      <button
        @click="$emit('monitor')"
        class="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 gap-2"
        :class="buttonClasses"
      >
        <EyeIcon class="w-4 h-4" />
        <span>Monitor Progres</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  CalendarIcon,
  FileTextIcon, 
  ClockIcon,
  EyeIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  CalendarClockIcon,
  Lock
} from 'lucide-vue-next'

interface Props {
  agendaTitle: string
  title: string
  description: string
  questionCount: number
  duration: number
  date: string
  time: string
  token: string
  status: 'ongoing' | 'completed' | 'upcoming'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  monitor: []
}>()

// ========== COMPUTED ==========
const statusBarColor = computed(() => {
  const colors = {
    ongoing: 'bg-gradient-to-r from-primary to-primary/60',      // Biru
    upcoming: 'bg-gradient-to-r from-yellow-500 to-yellow-400',  // Kuning
    completed: 'bg-gradient-to-r from-gray-400 to-gray-300'      // Abu-abu
  }
  return colors[props.status]
})

const statusText = computed(() => {
  const texts = {
    ongoing: 'Sedang Berlangsung',
    upcoming: 'Akan Datang',
    completed: 'Selesai'
  }
  return texts[props.status]
})

const badgeClasses = computed(() => {
  const classes = {
    ongoing: 'border-transparent bg-primary text-primary-foreground',
    upcoming: 'border-transparent bg-yellow-500 text-white',
    completed: 'text-foreground border'
  }
  return classes[props.status]
})

const statusIcon = computed(() => {
  const icons = {
    ongoing: PlayCircleIcon,
    upcoming: CalendarClockIcon,
    completed: CheckCircleIcon
  }
  return icons[props.status]
})

// ========== BUTTON MONITOR ==========
const buttonClasses = computed(() => {
  const classes = {
    ongoing: 'bg-primary text-primary-foreground hover:bg-primary/90',
    upcoming: 'text-foreground border hover:bg-accent',
    completed: 'text-foreground border hover:bg-accent'                    
  }
  return classes[props.status]
})
</script>