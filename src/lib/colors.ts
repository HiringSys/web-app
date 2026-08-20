export const ThemeColor = {
  Primary: 'primary',
  Danger: 'danger',
} as const

export type ThemeColor = (typeof ThemeColor)[keyof typeof ThemeColor]
