export const useFormat = () => {
  const fmtDate = (d: string | Date) => {
    const dd = new Date(d)
    return dd.toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
      hour12: false
    })
  }

  const fmtDateTimeShort = (d: string | Date) => {
    const dd = new Date(d)
    return dd.toLocaleString("id-ID", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  }

  return { fmtDate, fmtDateTimeShort }
}
