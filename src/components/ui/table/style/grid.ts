import type { TableColumn } from '../types'

const HANDLE_WIDTH = '1.5rem'

const SIZE_VAR: Record<NonNullable<TableColumn<unknown>['size']>, string> = {
  sm: 'var(--container-slot-sm)',
  md: 'var(--container-slot-md)',
  lg: 'var(--container-slot-lg)',
}

export function gridTemplate<T>(columns: TableColumn<T>[], draggable = true) {
  const tracks = columns.map((column) => `minmax(min-content, ${SIZE_VAR[column.size ?? 'md']})`)
  return [...(draggable ? [HANDLE_WIDTH] : []), ...tracks].join(' ')
}
