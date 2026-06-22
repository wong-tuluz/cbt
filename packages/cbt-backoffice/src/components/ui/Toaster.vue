<template>
  <teleport to="body">
    <div class="fixed top-0 right-0 z-50 w-full max-w-md p-4 space-y-4 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto"
        >
          <div
            :class="[
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
              toast.variant === 'destructive'
                ? 'border-destructive bg-destructive text-white'
                : toast.variant === 'success'
                ? 'border-success/20 bg-success/10 text-success-foreground'
                : 'border-border bg-card text-card-foreground'
            ]"
          >
            <!-- Icon -->
            <div class="flex-shrink-0">
              <CheckCircle2 
                v-if="toast.variant === 'success' || toast.variant === 'default'" 
                class="h-5 w-5" 
                :class="toast.variant === 'success' ? 'text-success' : 'text-primary'"
              />
              <AlertCircle 
                v-else-if="toast.variant === 'destructive'"
                class="h-5 w-5 text-white" 
              />
              <Info v-else class="h-5 w-5 text-muted-foreground" />
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-1">
              <div v-if="toast.title" class="font-semibold text-sm">
                {{ toast.title }}
              </div>
              <div 
                v-if="toast.description" 
                class="text-sm"
                :class="toast.variant === 'destructive' 
                  ? 'text-white/90' 
                  : toast.variant === 'success'
                  ? 'text-success-foreground/90'
                  : 'text-card-foreground/80'"
              >
                {{ toast.description }}
              </div>
            </div>

            <!-- Close Button -->
            <button
              @click="dismiss(toast.id)"
              class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              :class="toast.variant === 'destructive' 
                ? 'text-white hover:text-white/80' 
                : toast.variant === 'success'
                ? 'text-success-foreground hover:text-success-foreground/80'
                : 'text-muted-foreground hover:text-foreground'"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Success color menggunakan global variable */
:deep(.bg-success\/10) {
  background-color: color-mix(in oklch, var(--success) 10%, transparent);
}

:deep(.border-success\/20) {
  border-color: color-mix(in oklch, var(--success) 20%, transparent);
}

:deep(.text-success) {
  color: var(--success);
}

:deep(.text-success-foreground) {
  color: color-contrast(var(--success) vs white, black);
}

:deep(.text-success-foreground\/90) {
  color: color-mix(in oklch, var(--text-success-foreground) 90%, transparent);
}
</style>