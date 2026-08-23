<script setup lang="ts">

import { ref } from 'vue'
import Popup   from './Popup.vue'
import Button  from '@/components/ui/Button.vue'

import { parseFuncionariosSheet, type ParsedFuncionariosImport } from '@/service/importFuncionarios'
import { importFuncionariosFromExcel } from '@/service/Peneiras'
import { notify } from '@/components/feedback/notify'

const props = defineProps<{
  modelValue: boolean
  grupoId:    string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  imported: []
}>()

const fileInput  = ref<HTMLInputElement | null>(null)
const fileName    = ref('')
const parsing     = ref(false)
const submitting  = ref(false)
const parsed      = ref<ParsedFuncionariosImport | null>(null)

function reset() {
  fileName.value = ''
  parsed.value   = null
}

function close() {
  reset()
  emit('update:modelValue', false)
}

function pickFile() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file  = input.files?.[0]
  input.value = ''
  if (!file) return

  fileName.value = file.name
  parsed.value   = null
  parsing.value  = true

  try {
    const { default: readXlsxFile } = await import('read-excel-file/browser')
    const sheets = await readXlsxFile(file)
    const sheet  = sheets.find((s) => s.sheet.toLowerCase() === 'funcionarios') ?? sheets[0]
    parsed.value = parseFuncionariosSheet(sheet?.data ?? [])
  } catch {
    notify('Não foi possível ler a planilha. Verifique se é um arquivo .xlsx válido.', 'error')
    reset()
  } finally {
    parsing.value = false
  }
}

async function confirmImport() {
  if (!parsed.value || parsed.value.funcionarios.length === 0 || submitting.value) return

  submitting.value = true
  try {
    const result = await importFuncionariosFromExcel(props.grupoId, parsed.value.funcionarios)
    notify(result.mensagem ?? `${result.totalRecebidos ?? parsed.value.funcionarios.length} candidato(s) importado(s).`, 'success')
    emit('imported')
    close()
  } catch {
    notify('Não foi possível importar a planilha.', 'error')
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <Popup :model-value="modelValue" title="Importar candidatos via Excel" width="32rem" @update:model-value="(value) => { if (!value) close() }">
    <div class="flex flex-col gap-4">
      <p class="text-black/60">
        A planilha deve ter as colunas: nome, email, telefone, salario, cidade,
        status, experiencia, cargos (separados por ";"). Veja <code>exemplo.xlsx</code>
        na raiz do projeto.
      </p>

      <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="handleFileChange" />
      <Button :text="fileName || 'Selecionar planilha'" variant="neutral" :disabled="parsing" @click="pickFile" />

      <div v-if="parsing" class="text-black/60">Lendo planilha…</div>

      <template v-else-if="parsed">
        <p class="font-semibold">
          {{ parsed.funcionarios.length }} de {{ parsed.totalRows }} linha(s) prontas para importar.
        </p>

        <div v-if="parsed.issues.length" class="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-medium bg-white p-3">
          <span v-for="(issue, index) in parsed.issues" :key="index" class="text-small font-medium text-red">
            {{ issue.message }}
          </span>
        </div>
      </template>
    </div>

    <template #actions>
      <Button text="Cancelar" variant="neutral" @click="close" />
      <Button
        text="Importar"
        variant="primary"
        :disabled="!parsed || parsed.funcionarios.length === 0 || submitting"
        @click="confirmImport"
      />
    </template>
  </Popup>
</template>
