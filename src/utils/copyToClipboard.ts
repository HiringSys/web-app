import { notify } from '@/components/feedback/notify'

export default async function copyToClipboard(value: string | number): Promise<void> {
  await navigator.clipboard.writeText(String(value))
  notify('Copiado para a área de transferência!', 'success')
}
