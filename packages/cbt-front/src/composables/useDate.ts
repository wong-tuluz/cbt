// src/composables/useDate.ts

export function useDate() {
  /**
   * Get current date in YYYY-MM-DD format
   * @returns Current date string
   */
  const getCurrentDate = (): string => {
    return new Date().toISOString().split('T')[0] as string;
  };

  /**
   * Format date to Indonesian format (DD/MM/YYYY)
   * @param date - Date string or Date object
   * @returns Formatted date string
   */
  const formatDateID = (date: string | Date): string => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Format date to full Indonesian format
   * @param date - Date string or Date object
   * @returns Formatted date string (e.g., "20 Desember 2024")
   */
  const formatDateFull = (date: string | Date): string => {
    const d = new Date(date);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  /**
   * Get timestamp
   * @returns Current timestamp
   */
  const getTimestamp = (): number => {
    return Date.now();
  };

  return {
    getCurrentDate,
    formatDateID,
    formatDateFull,
    getTimestamp
  };
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric' ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('id-ID', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}