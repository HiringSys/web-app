import type { TableColumn } from '../types'

const HANDLE_WIDTH = '1.5rem'

const SIZE_VAR: Record<NonNullable<TableColumn<unknown>['size']>, string> = {
  sm: 'var(--container-slot-sm)',
  md: 'var(--container-slot-md)',
  lg: 'var(--container-slot-lg)',
}

const SIZE_MAX_PX: Record<NonNullable<TableColumn<unknown>['size']>, number> = {
  sm: 7 * 16,
  md: 11 * 16,
  lg: 18 * 16,
}

const MEASURE_FONT = '500 1rem "DM Sans", sans-serif'
const HEADER_FONT = '600 0.875rem "DM Sans", sans-serif'
const HEADER_OFFSET = 18
const MEASURE_PADDING = 8
const MEASURE_MIN_PX = 48

export const MAX_VISIBLE_COLUMNS = 6

export function capColumns<T>(columns: TableColumn<T>[]) {
  return columns.slice(0, MAX_VISIBLE_COLUMNS)
}

let measureCtx: CanvasRenderingContext2D | null | undefined

function textWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return 0
  measureCtx ??= document.createElement('canvas').getContext('2d')
  if (!measureCtx) return 0
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

export function gridTemplate<T>(columns: TableColumn<T>[], items: T[] = [], draggable = true) {
  const tracks = columns.map((column) => {
    if (!column.measure) return SIZE_VAR[column.size ?? 'md']

    const cap = SIZE_MAX_PX[column.size ?? 'md']
    const headerWidth = textWidth(column.label, HEADER_FONT) + HEADER_OFFSET
    const widest = items.reduce((max, item) => {
      const width = textWidth(column.measure!(item), MEASURE_FONT) + (column.measureOffset ?? 0)
      return Math.max(max, width)
    }, headerWidth)

    const width = Math.min(cap, Math.max(MEASURE_MIN_PX, Math.ceil(widest) + MEASURE_PADDING))
    return `${width}px`
  })

  return [...(draggable ? [HANDLE_WIDTH] : []), ...tracks].join(' ')
}
