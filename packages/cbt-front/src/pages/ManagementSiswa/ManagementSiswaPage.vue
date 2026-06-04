<template>
  <div class="bg-background min-h-screen">
    <div class="p-4 md:p-4">
      <!-- Header dengan Search -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm mb-4 overflow-hidden">
        <div class="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
        <div class="p-4 md:p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="text-xl text-2xl font-bold mb-2">Management Siswa</h1>
              <p class="text-xs text-sm text-muted-foreground">Pantau dan kelola semua siswa</p>
            </div>
            
            <!-- Search Box -->
            <div class="relative w-full md:w-80">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                autocomplete="off"
                readonly
                onfocus="this.removeAttribute('readonly')"
                placeholder="Cari nama atau NIS siswa..."
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

      <!-- Students Table -->
      <div class="bg-card rounded-lg border border-border overflow-hidden">
        <!-- Mobile View -->
        <div class="block md:hidden">
          <div v-if="loading" class="p-8 text-center">
            <div class="flex flex-col items-center gap-2">
              <div class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span class="text-sm text-muted-foreground">Memuat data...</span>
            </div>
          </div>
          
          <div v-else-if="filteredSiswa.length === 0" class="p-8 text-center">
            <UsersIcon class="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
            <p class="text-sm text-muted-foreground">Tidak ada data siswa</p>
          </div>

          <div v-else class="divide-y divide-border">
            <div v-for="(item, index) in filteredSiswa" :key="item.id" class="p-4 hover:bg-muted/30 transition-colors">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">#{{ (currentPage - 1) * pageSize + index + 1 }}</span>
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-xs font-semibold text-primary">{{ getInitials(item.nama) }}</span>
                  </div>
                  <div>
                    <h3 class="font-medium text-card-foreground">{{ item.nama }}</h3>
                    <p class="text-xs text-muted-foreground">NIS: {{ item.nis }}</p>
                  </div>
                </div>
                
                <!-- Status Akun Mobile -->
                <span 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="item.accountId ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'"
                >
                  <CheckCircleIcon v-if="item.accountId" class="w-3 h-3 mr-1" />
                  <AlertCircleIcon v-else class="w-3 h-3 mr-1" />
                  {{ item.accountId ? 'Terdaftar' : 'Belum Terdaftar' }}
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span class="text-muted-foreground">Kelas:</span>
                  <span class="ml-1 text-card-foreground">{{ item.kelas }}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">Username:</span>
                  <span class="ml-1 text-card-foreground">{{ item.username }}</span>
                </div>
              </div>
              
              <!-- Actions Mobile -->
              <div class="flex items-center gap-2 mt-2">
                <Button
                  @click.stop="handleSetPassword(item)"
                  variant="outline"
                  size="sm"
                  class="flex-1 gap-1.5 text-xs"
                  :disabled="!item.accountId"
                >
                  <KeyIcon class="w-3 h-3" />
                  Set Password
                </Button>
                
                <Button
                  @click.stop="handleSetAccount(item)"
                  variant="outline"
                  size="sm"
                  class="flex-1 gap-1.5 text-xs"
                >
                  <UserCogIcon class="w-3 h-3" />
                  Set Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50 border-b border-border">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">No</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Siswa</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kelas</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Akun</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
              
              <tr v-else-if="filteredSiswa.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data siswa
                </td>
              </tr>

              <tr v-else v-for="(item, index) in filteredSiswa" :key="item.id"
                class="border-b border-border hover:bg-muted/30 transition-colors">
                <td class="px-4 py-3 text-sm text-card-foreground">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-xs font-semibold text-primary">{{ getInitials(item.nama) }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-medium text-card-foreground">{{ item.nama }}</span>
                      <span class="text-xs text-muted-foreground">NIS: {{ item.nis }}</span>
                    </div>
                  </div>
                </td>
                
                <td class="px-4 py-3 text-sm text-card-foreground">{{ item.kelas }}</td>
                
                <td class="px-4 py-3 text-sm text-card-foreground">{{ item.username }}</td>
                <td class="px-4 py-3 text-sm text-card-foreground">{{ item.password }}</td>
                
                <!-- Status Akun -->
                <td class="px-4 py-3">
                  <span 
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="item.accountId ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'"
                  >
                    <CheckCircleIcon v-if="item.accountId" class="w-3 h-3 mr-1" />
                    <AlertCircleIcon v-else class="w-3 h-3 mr-1" />
                    {{ item.accountId ? 'Terdaftar' : 'Belum Terdaftar' }}
                  </span>
                </td>
                
                <!-- Actions Desktop -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <Button
                      @click.stop="handleSetPassword(item)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                      :disabled="!item.accountId"
                      :title="!item.accountId ? 'Buat akun terlebih dahulu' : 'Set Password'"
                    >
                      <KeyIcon class="w-3 h-3" />
                      <span class="hidden xl:inline">Set Password</span>
                      <span class="xl:hidden">Password</span>
                    </Button>
                    
                    <Button
                      @click.stop="handleSetAccount(item)"
                      variant="outline"
                      size="sm"
                      class="gap-1.5"
                    >
                      <UserCogIcon class="w-3 h-3" />
                      <span class="hidden xl:inline">Set Account</span>
                      <span class="xl:hidden">Account</span>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-border bg-card rounded-b-lg">
        <p class="text-xs text-muted-foreground">
          Menampilkan
          <span class="font-medium text-card-foreground">{{ (currentPage - 1) * pageSize + 1 }}</span>
          –
          <span class="font-medium text-card-foreground">{{ Math.min(currentPage * pageSize, totalCount) }}</span>
          dari
          <span class="font-medium text-card-foreground">{{ totalCount }}</span>
          siswa
        </p>

        <div class="flex items-center gap-1">
          <!-- First page -->
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman pertama"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          </button>

          <!-- Prev -->
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Sebelumnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <!-- Page numbers -->
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              @click="currentPage = page"
              class="min-w-[2rem] h-8 px-2 rounded text-xs font-medium transition-colors"
              :class="page === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            >
              {{ page }}
            </button>
            <span
              v-else-if="page === currentPage - 2 || page === currentPage + 2"
              class="px-1 text-xs text-muted-foreground"
            >…</span>
          </template>

          <!-- Next -->
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Selanjutnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <!-- Last page -->
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman terakhir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog Set Password -->
    <Dialog v-model:open="showPasswordDialog">
      <DialogContent class="sm:max-w-md w-[95%] mx-auto">
        <DialogHeader>
          <DialogTitle>Set Password Siswa</DialogTitle>
          <DialogDescription class="text-xs sm:text-sm">
            Atur password untuk akun {{ selectedStudent?.nama }} ({{ selectedStudent?.nis }})
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="password" class="text-sm">Password Baru</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="passwordForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="pr-10"
                autocomplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="absolute right-0 top-0 h-full px-3"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-4 w-4" />
                <EyeOffIcon v-else class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="confirmPassword" class="text-sm">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Konfirmasi password"
              autocomplete="new-password"
            />
          </div>
          
          <div v-if="passwordError" class="text-xs sm:text-sm text-destructive">
            {{ passwordError }}
          </div>
        </div>

        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button variant="outline" @click="showPasswordDialog = false" class="w-full sm:w-auto">
            Batal
          </Button>
          <Button @click="confirmSetPassword" :disabled="passwordLoading" class="w-full sm:w-auto">
            <span v-if="passwordLoading" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Menyimpan...
            </span>
            <span v-else>Simpan Password</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog Set Account -->
    <Dialog v-model:open="showAccountDialog">
    <DialogContent class="sm:max-w-md w-[95%] mx-auto">
        <DialogHeader>
        <DialogTitle>Buat Akun Siswa</DialogTitle>
        <DialogDescription class="text-xs sm:text-sm">
            Yakin ingin membuat akun untuk {{ selectedStudent?.nama }} ({{ selectedStudent?.nis }})?
            <br />
            Username: <strong class="text-primary">{{ selectedStudent?.nis }}</strong>
            <br />
            Password default: <strong class="text-primary">{{ selectedStudent?.nis }}</strong>
        </DialogDescription>
        </DialogHeader>
        
        <DialogFooter class="flex-col sm:flex-row gap-2">
        <Button variant="outline" @click="showAccountDialog = false" class="w-full sm:w-auto">
            Batal
        </Button>
        <Button 
            @click="confirmAccountAction" 
            :disabled="accountLoading"
            class="w-full sm:w-auto"
        >
            <span v-if="accountLoading" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Memproses...
            </span>
            <span v-else>Ya, Buat Akun</span>
        </Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  SearchIcon, 
  XIcon,
  KeyIcon,
  UserCogIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  UsersIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getListSsiswa, setAccount, setPassword } from '@/services/siswaService'
import type { ISiswa } from '@/types/ISiswa'
import { useToast } from '@/hooks/use-toast'

const { toast, dismissAll } = useToast()
const siswa = ref<ISiswa[]>([])
const loading = ref(false)
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Dialog Password
const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordError = ref('')
const showPassword = ref(false)
const passwordForm = ref({
  password: '',
  confirmPassword: ''
})

// Dialog Account
const showAccountDialog = ref(false)
const accountLoading = ref(false)
const accountAction = ref<'create' | 'edit'>('create')

const selectedStudent = ref<ISiswa | null>(null)

// Fetch data
const fetchSiswa = async () => {
  loading.value = true
  try {
    const offset = (currentPage.value - 1) * pageSize.value
    const response = await getListSsiswa(pageSize.value, offset)
    siswa.value = response.data.rows
    totalCount.value = response.data.metadata.count
  } catch (error) {
    console.error('Error fetching siswa:', error)
  } finally {
    loading.value = false
  }
}

watch(currentPage, () => fetchSiswa())

// Reset ke halaman 1 saat search berubah
watch(searchQuery, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1 // akan trigger watch(currentPage) → fetchSiswa()
  }
})

// Filter data
const filteredSiswa = computed(() => {
  if (!searchQuery.value) return siswa.value
  const query = searchQuery.value.toLowerCase()
  return siswa.value.filter(item => 
    item.nama.toLowerCase().includes(query) || 
    item.nis.toLowerCase().includes(query)
  )
})

// Get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Handle Set Password
const handleSetPassword = (item: ISiswa) => {
  selectedStudent.value = { ...item }
  passwordForm.value = { password: '', confirmPassword: '' }
  passwordError.value = ''
  showPasswordDialog.value = true
}

const confirmSetPassword = async () => {
  if (!passwordForm.value.password) {
    passwordError.value = 'Password harus diisi'
    return
  }
  
  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Password tidak cocok'
    return
  }
  
  if (passwordForm.value.password.length < 6) {
    passwordError.value = 'Password minimal 6 karakter'
    return
  }
  
  passwordLoading.value = true
  try {
    await setPassword(
      selectedStudent.value!.id, 
      passwordForm.value.password
    )

    // ✅ Update lokal langsung, TANPA fetchSiswa()
    const index = siswa.value.findIndex(s => s.id === selectedStudent.value!.id)
    if (index !== -1) {
      siswa.value[index] = {
        ...siswa.value[index],
        password: passwordForm.value.password
      } as ISiswa
    }

    showPasswordDialog.value = false
    passwordForm.value = { password: '', confirmPassword: '' }

    dismissAll()
    toast({
      title: 'Password berhasil diubah',
      description: 'Password siswa berhasil diubah.',
      variant: 'default',
    })
    
  } catch (error) {
    passwordError.value = 'Gagal mengubah password'
    console.error(error)
  } finally {
    passwordLoading.value = false
  }
}

const handleSetAccount = (item: ISiswa) => {
  selectedStudent.value = { ...item }
  accountAction.value = 'create'
  showAccountDialog.value = true
}

const confirmAccountAction = async () => {
  if (!selectedStudent.value) return
  
  accountLoading.value = true
  try {
    await setAccount(selectedStudent.value.id)

    // ✅ Update lokal langsung, TANPA fetchSiswa()
    const index = siswa.value.findIndex(s => s.id === selectedStudent.value!.id)
    if (index !== -1) {
      siswa.value[index] = {
        ...siswa.value[index],
        accountId: selectedStudent.value.nis,
        username: selectedStudent.value.nis,
        password: selectedStudent.value.nis,
      } as ISiswa
    }

    showAccountDialog.value = false

    dismissAll()
    toast({
      title: '✅ Akun berhasil dibuat',
      description: `Akun untuk ${selectedStudent.value.nama} (${selectedStudent.value.nis}) telah dibuat.`,
      variant: 'default',
    })
    
  } catch (error: any) {
    console.error('Account creation failed:', error)
    
    const errorMessage = error.message || ''
    
    if (errorMessage.includes('Username is already taken')) {
      // ✅ Update status lokal, TANPA fetchSiswa()
      const index = siswa.value.findIndex(s => s.id === selectedStudent.value!.id)
      if (index !== -1) {
        siswa.value[index] = {
          ...siswa.value[index],
          accountId: selectedStudent.value!.nis,
        } as ISiswa
      }

      showAccountDialog.value = false

      dismissAll()
      toast({
        title: 'Gagal membuat akun',
        description: `Siswa ${selectedStudent.value.nama} (${selectedStudent.value.nis}) sudah Terdaftar.`,
        variant: 'destructive',
      })
    } else {
      dismissAll()
      toast({
        title: 'Gagal membuat akun',
        description: errorMessage || 'Terjadi kesalahan saat membuat akun.',
        variant: 'destructive',
      })
    }
    
  } finally {
    accountLoading.value = false
  }
}

onMounted(() => {
  fetchSiswa()
})
</script>