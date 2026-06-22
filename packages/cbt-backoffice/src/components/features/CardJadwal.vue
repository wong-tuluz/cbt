<template>
  <div 
    class="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
    :class="{ 'cursor-pointer': clickable }"
    @click="handleClick"
  >
    <!-- Status Bar -->
    <div class="h-2" :class="statusBarColor"></div>
    
    <!-- Header Kartu -->
    <div class="flex flex-col space-y-1.5 p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <!-- AGENDA TITLE (BESAR) -->
          <h3 class="font-semibold text-xl mb-2">{{ agendaTitle }}</h3>
          <!-- PAKET SOAL TITLE -->
          <p class="text-sm font-medium text-foreground mb-1">{{ title }}</p>
          <!-- PAKET SOAL DESCRIPTION -->
          <p class="text-sm text-muted-foreground">{{ description }}</p>
        </div>
        
        <div class="flex flex-col items-end gap-2">
          <!-- Badge Status -->
          <div 
            class="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center gap-1 whitespace-nowrap"
            :class="badgeClasses"
          >
            <component :is="statusIcon" class="w-3 h-3" />
            {{ statusText }}
          </div>
          
          <!-- Score (jika ada) -->
          <!-- <div v-if="showScore && score !== undefined" class="text-right">
            <div class="text-2xl font-bold text-primary">{{ score }}</div>
            <div class="text-xs text-muted-foreground">Nilai Akhir</div>
          </div> -->
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
          <span class="truncate">{{ date }}.{{ time }}</span>
        </div>
      </div>

      <!-- Progress Bar (jika showScore) -->
      <!-- <div v-if="showScore && percentage !== undefined" class="mb-6">
        <div class="flex justify-between text-sm mb-2">
          <span class="text-muted-foreground">Persentase</span>
          <span class="font-medium">{{ percentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300" 
            :style="{ width: percentage + '%' }"
          ></div>
        </div>
      </div> -->

      <!-- Tombol Aksi -->
      <button
        v-if="showButton"
        @click.stop="handleButtonClick"
        :disabled="loading || (showScore && !viewHasil)"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full gap-2"
        :class="buttonClasses"
      >
        <template v-if="loading">
          <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
          <span class="text-sm">Memproses...</span>
        </template>
        <template v-else>
          <component :is="buttonIcon" class="w-4 h-4" />
          <span class="text-sm">{{ buttonText }}</span>
        </template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  CirclePlayIcon, 
  CircleCheckIcon, 
  CalendarIcon,
  FileTextIcon, 
  ClockIcon,
  EyeIcon
} from 'lucide-vue-next'

interface Props {
  // Data utama
  agendaTitle: string
  title: string
  description: string
  questionCount: number
  duration: number
  date: string
  time: string
  status: 'ongoing' | 'completed' | 'upcoming'
  viewHasil?: boolean

  // Optional: untuk hasil ujian
  score?: number
  percentage?: number
  showScore?: boolean
  
  // Behavior
  showButton?: boolean
  buttonDisabled?: boolean
  loading?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showScore: false,
  showButton: true,
  buttonDisabled: false,
  loading: false,
  clickable: false,
  viewHasil: false
})

const emit = defineEmits<{
  click: []
  buttonClick: []
}>()

// Computed: Status Bar Color
const statusBarColor = computed(() => {
  const colors = {
    ongoing: 'bg-gradient-to-r from-primary to-primary/60',
    upcoming: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    completed: 'bg-gradient-to-r from-gray-400 to-gray-300'
  }
  return colors[props.status]
})

// Computed: Status Text
const statusText = computed(() => {
  const texts = {
    ongoing: 'Sedang Berlangsung',
    upcoming: 'Akan Datang',
    completed: 'Selesai'
  }
  return texts[props.status]
})

// Computed: Badge Classes
const badgeClasses = computed(() => {
  const classes = {
    ongoing: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    upcoming: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
    completed: 'text-foreground'
  }
  return classes[props.status]
})

// Computed: Status Icon
const statusIcon = computed(() => {
  const icons = {
    ongoing: CirclePlayIcon,
    upcoming: CalendarIcon,
    completed: CircleCheckIcon
  }
  return icons[props.status]
})

// Computed: Button Text
const buttonText = computed(() => {
  if (props.showScore) return 'Lihat Hasil'
  
  const texts = {
    ongoing: 'Mulai Ujian',
    upcoming: 'Belum Dimulai',
    completed: 'Ujian Telah Berakhir'
  }
  return texts[props.status]
})

// Computed: Button Classes
const buttonClasses = computed(() => {
  if (props.showScore) {
    return 'bg-primary text-primary-foreground hover:bg-primary/90'
  }
  
  return props.status === 'ongoing'
    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
})

// Computed: Button Icon
const buttonIcon = computed(() => {
  if (props.showScore) return EyeIcon
  
  const icons = {
    ongoing: CirclePlayIcon,
    upcoming: CalendarIcon,
    completed: CircleCheckIcon
  }
  return icons[props.status]
})

const canOpen = computed(() => {
  // mode lihat hasil tapi belum boleh
  if (props.showScore && !props.viewHasil) return false

  return props.clickable
})

// Handlers
const handleClick = () => {
  if (!canOpen.value) return
  emit('click')
}


const handleButtonClick = () => {
  if (props.showScore && !props.viewHasil) return
  emit('buttonClick')
}

</script>