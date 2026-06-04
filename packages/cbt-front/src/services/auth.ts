// src/services/auth.ts
import api from "./api"

export interface LoginResponse {
  token: string  // ← Better Auth pakai "token", bukan "access_token"
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: string
    updatedAt: string
    username: string
    displayUsername: string
    role: string
    banned: boolean
    banReason: string | null
    banExpires: string | null
  }
}

export interface UserInfo {
  id: string
  siswaId: string
  nama: string
  nis?: string
  kelas?: string
  username: string
  email: string
  role: string
}

// Login ke API Better Auth
export async function login(username: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/sign-in/username", {
    username,
    password,
    callbackURL: "/dashboard" // opsional
  })
}

export interface MeResponse {
  success: boolean
  code: number
  data: {
    userId: string
    siswaId: string
    nis: string
    name: string
    role: string
  }
}

export async function saveAuthData(response: LoginResponse): Promise<void> {
  try {
    // Panggil endpoint /me
    const meResponse = await api.get<MeResponse>("/me")

    if (!meResponse.success || !meResponse.data) {
      throw new Error('Gagal mendapatkan data dari /me')
    }

    // Buat user data dari response /me
    const userData: UserInfo = {
      id: meResponse.data.userId,
      siswaId: meResponse.data.siswaId,
      nama: meResponse.data.name,
      nis: meResponse.data.nis,
      username: response.user.username,
      email: response.user.email,
      role: meResponse.data.role
    }

    // Simpan ke localStorage dengan key "user"
    localStorage.setItem("user", JSON.stringify(userData))

    console.log('User data saved to localStorage:', userData)

  } catch (error) {
    console.error('Error in saveAuthData:', error)
    throw error
  }
}

export function getUser(): UserInfo | null {
  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Cek apakah ada cookie session (untuk router guard)
export function hasAuthCookie(): boolean {
  // Cek apakah cookie better-auth.session_token ada
  return document.cookie.includes('better-auth.session_token=')
}

export function logout() {
  api.post("/auth/sign-out")
  // Hapus user data
  localStorage.removeItem("user")
  // localStorage.removeItem("soal")
}

export function isAuthenticated(): boolean {
  // Cek apakah ada cookie better-auth.session_token
  const hasCookie = document.cookie
    .split('; ')
    .some(row => row.startsWith('better-auth.session_token='))

  // Cek apakah ada user data di localStorage
  const hasUser = !!localStorage.getItem("user")

  // Login valid jika ada cookie DAN user data
  return hasCookie && hasUser
}