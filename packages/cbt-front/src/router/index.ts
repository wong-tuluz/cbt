import { createRouter, createWebHistory } from "vue-router"
import Login from "@/pages/Login.vue"
import Dashboard from "@/pages/Dashboard/Dashboard.vue"
import ExamPage from "@/pages/Exam/ExamPage.vue"
import BlankPage from "@/pages/BlankPage.vue"
import ExamResultPage from "@/pages/Exam/ExamResultPage.vue"
import SummaryPage from "@/pages/Summary/SummaryPage.vue"
import SettingTheme from "@/pages/Settings/SettingTheme.vue"
import SyncUpload from "@/pages/SyncUpload/SyncUpload.vue"
import DaftarUjianPage from "@/pages/UjianHasil/DaftarUjianPage.vue"
import RiwayatUjianPage from "@/pages/UjianHasil/RiwayatUjianPage.vue"
import HasilUjianPage from "@/pages/UjianHasil/HasilUjianPage.vue"
import DetailJadwal from "@/pages/DetailJadwal/DetailJadwal.vue"
import DetailHasilUjianPage from "@/pages/UjianHasil/DetailHasilUjianPage.vue"
import ManagementEvent from "@/pages/ManagementEvent/ManagementEvent.vue"
import ManagementSiswaPage from "@/pages/ManagementSiswa/ManagementSiswaPage.vue"
import ManagementSessionPage from "@/pages/ManagementEvent/ManagementSessionPage.vue"
import AksesPage from "@/pages/Akses/AksesPage.vue"
import { hasPermission } from "@/composables/usePermission"
import { getSetting } from "@/services/aksesService"

const routes = [
  { path: "/", redirect: "/login" },
  { 
    path: "/login", 
    component: Login, 
    meta: { 
      layout: "auth", 
      title: "Login – SMK PAKEM" 
    } 
  },
  { 
    path: "/dashboard", 
    component: Dashboard, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Dashboard – SMK PAKEM",
      requiresPermission: "DASHBOARD.READ"
    } 
  },
  { 
    path: "/event/:id", 
    component: DetailJadwal, 
    meta: { 
      layout: "auth", 
      requiresAuth: true, 
      title: "Detail Event – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ"
    } 
  },
  { 
    path: "/exam/:id", 
    component: ExamPage, 
    meta: { 
      layout: "auth", 
      requiresAuth: true, 
      title: "Exam – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ",
      examMode: true
    } 
  },
  { 
    path: "/exam/:id/summary", 
    component: SummaryPage, 
    meta: { 
      layout: "auth", 
      requiresAuth: true, 
      title: "Summary – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ",
      examMode: true
    } 
  },
  { 
    path: "/exam-result/:id", 
    component: ExamResultPage, 
    meta: { 
      layout: "auth", 
      requiresAuth: true, 
      title: "Result – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ"
    } 
  },
  { 
    path: "/daftar", 
    component: DaftarUjianPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Daftar Ujian – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ"
    } 
  },
  { 
    path: "/riwayat", 
    component: RiwayatUjianPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Riwayat Ujian – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ"
    } 
  },
  { 
    path: "/hasil", 
    component: HasilUjianPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Hasil Ujian – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ"
    } 
  },
  { 
    path: "/hasil/:id", 
    component: DetailHasilUjianPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Hasil Ujian – SMK PAKEM",
      requiresPermission: "UJIAN_HASIL.READ"
    } 
  },
  { 
    path: "/settings", 
    component: SettingTheme, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Setting – SMK PAKEM",
      requiresPermission: "TEMA.READ"
    } 
  },
  { 
    path: "/sync-upload", 
    component: SyncUpload, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Sync & Update – SMK PAKEM",
      requiresPermission: "SYNC.READ"
    } 
  },
  { 
    path: "/management-siswa", 
    component: ManagementSiswaPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Management Siswa – SMK PAKEM",
      requiresPermission: "MANAGEMENT_SISWA.READ"
    } 
  },
  { 
    path: "/management-event", 
    component: ManagementEvent, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Management Event – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    } 
  },
  { 
    path: "/management-event/:id", 
    component: ManagementSessionPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Management Session – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    } 
  },
  { 
    path: "/akses", 
    component: AksesPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Hak Akses – SMK PAKEM",
      requiresPermission: "AKSES.READ"
    } 
  },
  { 
    path: "/404", 
    component: BlankPage, 
    meta: { 
      layout: "auth", 
      requiresAuth: false, 
      title: "Halaman Tidak Ditemukan – SMK PAKEM" 
    } 
  },
  { 
    path: "/:pathMatch(.*)*", 
    redirect: "/404"
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  if (to.path === "/404") {
    return next()
  }

  const hasUser = !!localStorage.getItem("user")
  const requiresAuth = to.meta.requiresAuth
  
  if (requiresAuth && !hasUser) {
    return next("/login")
  }
  
  if (to.path === "/login" && hasUser) {
    const user = JSON.parse(localStorage.getItem("user") || '{}')
    const role = user.role
    
    if (role === 'admin') {
      return next("/management-event")
    } else {
      return next("/dashboard")
    }
  }
  
  const requiredPermission = to.meta.requiresPermission as string | undefined
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return next("/404")
  }
  
  if (to.path.includes('/exam/') && to.meta.examMode !== undefined) {
    try {
      const response = await getSetting()
      to.meta.examMode = response.data?.safe_mode ?? false
    } catch (error) {
      console.error('Failed to check safe mode:', error)
      to.meta.examMode = false
    }
  }
  
  next()
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  } else {
    document.title = "SMK PAKEM"
  }
})