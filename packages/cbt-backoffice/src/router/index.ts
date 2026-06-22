import { createRouter, createWebHistory } from "vue-router"
import Login from "@/pages/Login.vue"
import BlankPage from "@/pages/BlankPage.vue"
import SettingTheme from "@/pages/Settings/SettingTheme.vue"
import AksesPage from "@/pages/Akses/AksesPage.vue"

// New Pages
import PaketSoalPage from "@/pages/PaketSoal/PaketSoalPage.vue"
import SoalPage from "@/pages/PaketSoal/SoalPage.vue"
import AcaraPage from "@/pages/Acara/AcaraPage.vue"
import AcaraDetailPage from "@/pages/Acara/AcaraDetailPage.vue"
import MonitorSessionPage from "@/pages/Acara/MonitorSessionPage.vue"
import ProktorDetailSessionPage from "@/pages/Acara/ProktorDetailSessionPage.vue"
import ManagementSiswaPage from "@/pages/ManagementSiswa/ManagementSiswaPage.vue"

import { hasPermission } from "@/composables/usePermission"

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
    path: "/paket-soal", 
    component: PaketSoalPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Paket Soal – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ" // reusing permission checks
    } 
  },
  { 
    path: "/paket-soal/:id/materi/:materiId", 
    component: SoalPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Manajemen Soal – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    } 
  },
  { 
    path: "/acara", 
    component: AcaraPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Manajemen Acara – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    } 
  },
  { 
    path: "/acara/:id", 
    component: AcaraDetailPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Detail Acara – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    } 
  },
  {
    path: "/acara/:id/monitor/:jadwalId",
    component: MonitorSessionPage,
    meta: {
      layout: "app",
      requiresAuth: true,
      title: "Monitor Ujian – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    }
  },
  {
    path: "/acara/:id/monitor/:jadwalId/:sessionId",
    component: ProktorDetailSessionPage,
    meta: {
      layout: "app",
      requiresAuth: true,
      title: "Detail Jawaban Siswa – SMK PAKEM",
      requiresPermission: "MANAGEMENT_EVENT.READ"
    }
  },
  { 
    path: "/siswa", 
    component: ManagementSiswaPage, 
    meta: { 
      layout: "app", 
      requiresAuth: true, 
      title: "Management Siswa – SMK PAKEM",
      requiresPermission: "MANAGEMENT_SISWA.READ"
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

  const userJson = localStorage.getItem("user")
  const hasUser = !!userJson
  const user = hasUser ? JSON.parse(userJson!) : null
  const isAdmin = user && user.role === "admin"
  const requiresAuth = to.meta.requiresAuth

  // Protect admin app: if requires auth, user must exist and must be an admin
  if (requiresAuth && (!hasUser || !isAdmin)) {
    localStorage.removeItem("user") // clean stale / non-admin user
    return next("/login")
  }
  
  if (to.path === "/login" && hasUser && isAdmin) {
    return next("/acara")
  }
  
  const requiredPermission = to.meta.requiresPermission as string | undefined
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return next("/404")
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