<script setup lang="ts">

import { computed, ref, watch } from 'vue'
import VuePdfEmbed               from 'vue-pdf-embed'

import Button from '@/components/ui/Button.vue'
import type { Candidate } from '@/components/ui/table/types'

const props = defineProps<{
  candidates:  Candidate[]
  candidateId: string | number
}>()

const emit = defineEmits<{
  'update:candidateId': [id: string | number]
}>()

const currentIndex = computed(() => props.candidates.findIndex((item) => item.id === props.candidateId))
const candidate     = computed(() => props.candidates[currentIndex.value])

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value >= 0 && currentIndex.value < props.candidates.length - 1)

function goPrev() {
  if (hasPrev.value) emit('update:candidateId', props.candidates[currentIndex.value - 1].id)
}
function goNext() {
  if (hasNext.value) emit('update:candidateId', props.candidates[currentIndex.value + 1].id)
}

type FileKind = 'pdf' | 'docx' | 'image'

const fileKind = computed<FileKind>(() => {
  const url = candidate.value?.curriculumUrl ?? ''
  if (/\.pdf(\?|$)/i.test(url))  return 'pdf'
  if (/\.docx?(\?|$)/i.test(url)) return 'docx'
  return 'image'
})

const page      = ref(1)
const pageCount = ref(1)

watch(candidate, () => {
  page.value      = 1
  pageCount.value = 1
})

const canPrevPage = computed(() => page.value > 1)
const canNextPage = computed(() => page.value < pageCount.value)

function prevPage() { if (canPrevPage.value) page.value -= 1 }
function nextPage() { if (canNextPage.value) page.value += 1 }

const pdfEmbedRef = ref<{ download: (filename: string) => Promise<void> } | null>(null)

function download() {
  if (!candidate.value?.curriculumUrl) return

  if (fileKind.value === 'pdf' && pdfEmbedRef.value) {
    pdfEmbedRef.value.download(`${candidate.value.name}.pdf`)
    return
  }

  const link = document.createElement('a')
  link.href = candidate.value.curriculumUrl
  link.download = ''
  link.click()
}

</script>

<template>
  <div v-if="candidate" class="flex h-full flex-col gap-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="leading-none">{{ candidate.name }}</h1>
        <h3 class="text-black/40">Currículo profissional</h3>
      </div>
      <div class="flex items-center gap-1">
        <Button icon="ChevronLeft"  variant="neutral" small :disabled="!hasPrev" @click="goPrev" />
        <Button icon="ChevronRight" variant="neutral" small :disabled="!hasNext" @click="goNext" />
      </div>
    </div>

    <div class="flex-1 overflow-auto rounded-medium bg-gray-100">
      <VuePdfEmbed
        v-if="fileKind === 'pdf'"
        ref="pdfEmbedRef"
        :source="candidate.curriculumUrl"
        :page="page"
        class="w-full"
        @loaded="pageCount = $event.numPages"
      />
      <img
        v-else-if="fileKind === 'image'"
        :src="candidate.curriculumUrl"
        :alt="`Currículo de ${candidate.name}`"
        class="w-full"
      />
      <div v-else class="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-black/40">
        <p>Pré-visualização indisponível para este formato.</p>
        <p class="text-small">Use o botão de download para abrir o arquivo.</p>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <Button icon="ArrowLeft"  variant="primary" :disabled="!canPrevPage" @click="prevPage" />
        <Button icon="ArrowRight" variant="primary" :disabled="!canNextPage" @click="nextPage" />
      </div>
      <Button icon="Download" variant="primary" @click="download" />
    </div>
  </div>
  <div v-else class="flex h-full items-center justify-center text-black/40">
    <p>Candidato não encontrado.</p>
  </div>
</template>
