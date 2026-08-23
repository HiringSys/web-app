export const Color = {
  Blue:   'blue',
  Yellow: 'yellow',
  Green:  'green',
  Red:    'red',
  Orange: 'orange',
  Purple: 'purple',
  Pink:   'pink',
  Cyan:   'cyan',
} as const

export type Color = (typeof Color)[keyof typeof Color]

export const colorClasses: Record<Color, { bg: string; shadow: string }> = {
  blue:   { bg: 'bg-blue',   shadow: 'var(--color-blue-co)'   },
  yellow: { bg: 'bg-yellow', shadow: 'var(--color-yellow-co)' },
  green:  { bg: 'bg-green',  shadow: 'var(--color-green-co)'  },
  red:    { bg: 'bg-red',    shadow: 'var(--color-red-co)'    },
  orange: { bg: 'bg-orange', shadow: 'var(--color-orange-co)' },
  purple: { bg: 'bg-purple', shadow: 'var(--color-purple-co)' },
  pink:   { bg: 'bg-pink',   shadow: 'var(--color-pink-co)'   },
  cyan:   { bg: 'bg-cyan',   shadow: 'var(--color-cyan-co)'   },
}
