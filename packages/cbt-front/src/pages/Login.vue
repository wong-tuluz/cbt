<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-primary/5">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <!-- Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          <Card class="border-border/50 shadow-lg">
            <CardContent class="py-8">
                <!-- Logo & Title -->
                <div class="flex flex-col items-center gap-2 text-center pb-6">
                    <div class="mb-4">
                      <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                          <img src="../assets/logo_smk_pakem.png" alt="Pengerjaan App" class="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h1 class="text-2xl font-bold text-card-foreground mb-1">SMK MUHAMMADIYAH PAKEM</h1>
                      <p class="text-sm text-muted-foreground">Learning Management System</p>
                    </div>
                </div>
              
              <div class="grid gap-6">
                <!-- Username -->
                <div class="grid gap-3">
                  <Label for="username" class="text-sm font-medium text-card-foreground">
                    Username
                  </Label>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <Input
                      id="username"
                      v-model="formData.username"
                      type="text"
                      placeholder="Masukkan username"
                      :class="{ 'border-destructive focus-visible:ring-destructive/20': errors.username }"
                      :disabled="submitting"
                      autocomplete="username"
                      required
                      class="pl-10"
                    />
                  </div>
                  <p v-if="errors.username" class="text-sm text-destructive">
                    {{ errors.username }}
                  </p>
                </div>

                <!-- Password -->
                <div class="grid gap-3">
                  <div class="flex items-center">
                    <Label for="password" class="text-sm font-medium text-card-foreground">
                      Password
                    </Label>
                  </div>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <Input
                      id="password"
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Masukkan password"
                      :class="{ 'border-destructive focus-visible:ring-destructive/20': errors.password }"
                      :disabled="submitting"
                      autocomplete="current-password"
                      required
                      class="pl-10 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      @click="showPassword = !showPassword"
                      :disabled="submitting"
                      tabindex="-1"
                    >
                      <Eye v-if="!showPassword" class="h-4 w-4" />
                      <EyeOff v-else class="h-4 w-4" />
                    </Button>
                  </div>
                  <p v-if="errors.password" class="text-sm text-destructive">
                    {{ errors.password }}
                  </p>
                </div>

                <!-- Submit Button -->
                <Button 
                  type="submit" 
                  class="w-full h-11 text-sm font-semibold mt-2"
                  :disabled="submitting"
                >
                  <div
                    v-if="submitting"
                    class="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span>{{ submitting ? 'Masuk...' : 'Masuk' }}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Footer Text -->
          <div class="text-balance text-center text-xs text-muted-foreground">
            Belum Punya Akun? 
            <span class="font-medium text-primary hover:text-primary/80 cursor-pointer ml-1">
              Hubungi Bagian Pusat
            </span>
            <div class="mt-2 text-[11px] text-muted-foreground/70">
              © 2026 Pengerjaan App. Sistem Ujian Online.
            </div>
          </div>
          <!-- dummy account -->
          <!-- <div class="py-2 rounded flex justify-center border bg-secondary">
            <div class="text-xs text-primary text-left space-y-1">
              <p><span class="font-semibold">Username:</span> siswa</p>
              <p><span class="font-semibold">Password:</span> siswa123</p>
            </div>
          </div> -->
        </form>
      </div>
    </div>
  </div>
</template>

<!-- src/pages/Login.vue - hanya update bagian script -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { login, saveAuthData } from '@/services/auth'

const { toast, dismissAll } = useToast()

const submitting = ref(false)
const showPassword = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

function validateForm(): boolean {
  let isValid = true

  errors.username = ''
  errors.password = ''

  if (!formData.username.trim()) {
    errors.username = 'Username wajib diisi'
    isValid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Password wajib diisi'
    isValid = false
  }

  return isValid
}

async function handleLogin() {
  if (!validateForm()) return

  submitting.value = true

  try {
    // Call Better Auth API
    const response = await login(formData.username, formData.password)

    // Save user data (cookie sudah otomatis diatur)
    await saveAuthData(response)

    toast({
      title: 'Login Berhasil',
      description: `Selamat datang, ${response.user.name}!`
    })
    
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const role = user.role
    
    if (role === 'admin') {
      window.location.replace('/management-event')
    } else {
      window.location.replace('/dashboard')
    }

    
  } catch (error) {
    console.error('Login error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Terjadi kesalahan saat login'

    dismissAll()
    toast({
      title: 'Login Gagal',
      description: errorMessage.includes('401') || errorMessage.includes('400')
        ? 'Username atau password salah'
        : errorMessage,
      variant: 'destructive'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Custom styling untuk konsistensi */
:deep(.btn-primary) {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

:deep(.btn-primary:hover) {
  background-color: color-mix(in oklch, var(--primary) 90%, transparent);
}

:deep(.btn-primary:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Input focus state konsisten dengan dashboard */
:deep(input:focus) {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 20%, transparent);
}

/* Animasi untuk loading spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>