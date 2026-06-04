// src/composables/usePermission.ts

export function hasPermission(key: string): boolean {
  const userStr = localStorage.getItem('user')
  if (!userStr) return false
  
  try {
    const user = JSON.parse(userStr)
    
    const ROLE_PERMISSIONS = {
      admin: [
        'MANAGEMENT_SISWA.*', 
        'MANAGEMENT_EVENT.*', 
        'SETTINGS.*', 
        'TEMA.*', 
        'SYNC.*', 
        'AKSES.*', 
      ],
      user: [
        'DASHBOARD.*', 
        'UJIAN_HASIL.*', 
        'SETTINGS.*', 
        'TEMA.*',
      ]
    }
    
    const perms = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || []
    
    if (perms.includes('*')) return true
    if (perms.includes(key)) return true
    
    const [module] = key.split('.')
    return perms.includes(`${module}.*`)
    
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

export function usePermission() {
  return { hasPermission }
}