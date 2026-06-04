<template>
  <div class="p-6 space-y-6 max-w-xl">
    <header class="space-y-1">
      <h2 class="text-lg font-semibold">Pengaturan Tema</h2>
      <p class="text-sm text-muted-foreground">
        Perubahan langsung diterapkan dan disimpan ke local storage.
      </p>
    </header>

    <div class="space-y-4">
      <div
        v-for="f in fields"
        :key="f.key"
        class="flex items-center justify-between gap-4"
      >
        <label class="text-sm font-medium">
          {{ f.label }}
        </label>

        <input
          type="color"
          :value="theme[f.key]"
          @input="onChange(f.key, $event)"
          class="h-9 w-14 rounded border border-input bg-transparent cursor-pointer"
        />
      </div>
    </div>

    <div class="flex items-center gap-3 pt-4 border-t">
      <button
        @click="resetTheme"
        class="px-3 py-1.5 text-sm rounded-md border hover:bg-muted"
      >
        Reset ke Default
      </button>

      <!-- <span class="text-xs text-muted-foreground">
        Reset = hapus local storage & pakai CSS bawaan
      </span> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'

/* =========================
   TYPES
========================= */
type ThemeKey =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'sidebarAccent'

type ThemeState = Record<ThemeKey, string>

/* =========================
   CONSTANTS
========================= */
const STORAGE_KEY = 'app-theme'

const fields: {
  key: ThemeKey
  label: string
  cssVar: string
}[] = [
  { key: 'primary', label: 'Primary', cssVar: '--primary' },
  { key: 'accent', label: 'Accent', cssVar: '--accent' },
  { key: 'success', label: 'Success', cssVar: '--success' },
  { key: 'warning', label: 'Warning', cssVar: '--warning' },
  { key: 'danger', label: 'Danger', cssVar: '--destructive' },
  { key: 'sidebarAccent', label: 'Sidebar Accent', cssVar: '--sidebar-accent' },
]

/* =========================
   STATE
========================= */
const theme = reactive<ThemeState>({} as ThemeState)

/* =========================
   HELPERS
========================= */
function getCssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

function applyTheme(state: ThemeState) {
  const root = document.documentElement
  fields.forEach(f => {
    root.style.setProperty(f.cssVar, state[f.key])
  })
}

function loadFromStorage(): Partial<ThemeState> | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
}

/* =========================
   ACTIONS
========================= */
function onChange(key: ThemeKey, e: Event) {
  const value = (e.target as HTMLInputElement).value
  theme[key] = value
  applyTheme(theme)
  saveToStorage()
}

function resetTheme() {
  localStorage.removeItem(STORAGE_KEY)

  // hapus override inline
  fields.forEach(f => {
    document.documentElement.style.removeProperty(f.cssVar)
  })

  // reload dari CSS default
  initTheme()
}

/* =========================
   INIT
========================= */
function initTheme() {
  const defaults = {} as ThemeState

  fields.forEach(f => {
    defaults[f.key] = getCssVar(f.cssVar)
  })

  Object.assign(theme, defaults, loadFromStorage() ?? {})
  applyTheme(theme)
}

onMounted(initTheme)
</script>
