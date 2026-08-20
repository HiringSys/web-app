import type { TableColumn } from './types'

const HANDLE_WIDTH = '1.5rem'

export function gridTemplate(columns: TableColumn[]) {
  return [HANDLE_WIDTH, ...columns.map((column) => column.width ?? '1fr')].join(' ')
}
