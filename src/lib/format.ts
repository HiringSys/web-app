export function formatSalary(amount: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(amount)
}

/** A phone already carrying visual separators (parentheses/dash) is treated as formatted and left untouched. */
export function isPhoneFormatted(phone: string): boolean {
  return /[()-]/.test(phone)
}

/** Backend phones sometimes arrive as bare digits — format them for display only, without touching the underlying value. */
export function formatPhoneNumber(phone: string): string {
  if (isPhoneFormatted(phone)) return phone

  const digits = phone.replace(/\D/g, '')
  const local  = digits.length > 11 ? digits.slice(-11) : digits

  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`

  return phone
}
