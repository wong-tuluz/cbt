<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="flex h-14 bg-sidebar items-center px-4">
      <!-- Sidebar toggle -->
      <SidebarTrigger class="mr-4" />

      <div class="flex-1"></div>

      <!-- User dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" class="relative h-8 gap-2">
            <Avatar class="h-7 w-7">
              <AvatarFallback class="bg-primary text-accent text-xs">
                {{ getUserInitials() }}
              </AvatarFallback>
            </Avatar>
            <span class="hidden sm:inline-block text-sm font-medium">
              {{ student.nama }}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">{{ student.nama }}</p>
              <p class="text-xs leading-none text-muted-foreground">
                {{ student.nis }}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            @click="handleLogout"
            class="text-red-600 cursor-pointer"
          >
            <LogOut class="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogOut } from "lucide-vue-next"
import { useToast } from "@/hooks/use-toast"
import { logout } from "@/services/auth"
import type { Student } from "@/types/ICommon"
import { getStudentData } from "@/services/eventService"

const router = useRouter()
const { toast, dismissAll } = useToast()

const student = ref<Student>({
  id: '',
  nama: '',
  nis: '',
  kelas: '',
  username: ''
})

// sementara dummy user
// const username = computed(() => "Ahmad Rizki Pratama")
// const email = computed(() => "AhmadRizkiPratama@gmail.com")

function getUserInitials(): string {
  if (!student.value.nama) return ""
  const names = student.value.nama.split(" ")
  const initials = names.map((n) => n.charAt(0).toUpperCase()).join("")
  return initials.slice(0, 2)
}

async function fetchStudentData() {
  try {
    const data = await getStudentData()
    student.value = data
  } catch (error) {
    console.error("Error fetching student data:", error)
  }
}

function handleLogout() {
  logout()
  router.push("/login")
  dismissAll()
  toast({
    title: "Logged out",
    description: "You’ve been logged out successfully.",
    variant: "success",
  })
}

onMounted(() => {
  fetchStudentData()
})
</script>
