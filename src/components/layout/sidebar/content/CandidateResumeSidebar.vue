<script setup lang="ts">
import { computed, ref, watch } from "vue";
import VuePdfEmbed from "vue-pdf-embed";

import Button from "@@/ui/Button.vue";
import type { Candidate } from "@@/ui/table/types";

const props = defineProps<{
  candidates: Candidate[];
  candidateId: string | number;
}>();

const emit = defineEmits<{
  "update:candidateId": [id: string | number];
}>();

const currentIndex = computed(() =>
  props.candidates.findIndex((item) => item.id === props.candidateId),
);
const candidate = computed(() => props.candidates[currentIndex.value]);

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(
  () =>
    currentIndex.value >= 0 && currentIndex.value < props.candidates.length - 1,
);

function goPrev() {
  if (hasPrev.value)
    emit("update:candidateId", props.candidates[currentIndex.value - 1].id);
}
function goNext() {
  if (hasNext.value)
    emit("update:candidateId", props.candidates[currentIndex.value + 1].id);
}

type FileKind = "pdf" | "docx" | "image";

const fileKind = computed<FileKind>(() => {
  const name = candidate.value?.curriculumFileName ?? candidate.value?.curriculumUrl ?? "";
  if (/\.pdf(\?|$)/i.test(name)) return "pdf";
  if (/\.docx?(\?|$)/i.test(name)) return "docx";
  return "image";
});

const page = ref(1);
const pageCount = ref(1);

watch(candidate, () => {
  page.value = 1;
  pageCount.value = 1;
});

const canPrevPage = computed(() => page.value > 1);
const canNextPage = computed(() => page.value < pageCount.value);

function prevPage() {
  if (canPrevPage.value) page.value -= 1;
}
function nextPage() {
  if (canNextPage.value) page.value += 1;
}

const pdfEmbedRef = ref<{
  download: (filename: string) => Promise<void>;
} | null>(null);

function download() {
  if (!candidate.value?.curriculumUrl) return;

  if (fileKind.value === "pdf" && pdfEmbedRef.value) {
    pdfEmbedRef.value.download(`${candidate.value.name}.pdf`);
    return;
  }

  const link = document.createElement("a");
  link.href = candidate.value.curriculumUrl;
  link.download = "";
  link.click();
}
</script>

<template>
  <div v-if="candidate" class="flex h-full min-w-0 flex-col gap-4">
    <div class="flex min-w-0 items-start justify-between gap-3 pt-2 sm:pt-4">
      <div class="min-w-0 flex-1">
        <h2 class="truncate pb-px leading-tight">{{ candidate.name }}</h2>
        <h3 class="truncate pb-px leading-tight text-black/40">Currículo profissional</h3>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <Button
          icon="ChevronLeft"
          variant="neutral"
          small
          :disabled="!hasPrev"
          :class="!hasPrev ? 'opacity-40' : ''"
          @click="goPrev"
          />
          <Button
          icon="ChevronRight"
          variant="neutral"
          small
          :disabled="!hasNext"
          :class="!hasNext ? 'opacity-40' : ''"
          @click="goNext"
        />
      </div>
    </div>

    <div class="flex min-h-0 w-full flex-1 justify-center">
      <div class="h-full w-full min-w-0 max-w-3xl overflow-auto rounded-medium bg-white">
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
          class="h-full w-full object-contain"
        />
        <div v-else class="flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-8">
          <div class="flex flex-col text-center text-black/40">
            <p class="leading-none pb-1 font-semibold">Pré-visualização indisponível para este formato.</p>
            <p class="text-small font-semibold opacity-40">Use o botão de download para abrir o arquivo.</p>
          </div>
          <Button icon="TrafficCone" color="orange" small class="px-10 sm:px-16" />
        </div>
      </div>
    </div>

    <div class="mt-auto flex w-full items-center gap-2 border-t border-black/10 bg-gray pt-3 pb-1">
        <div class="flex flex-1 items-center gap-2">
          <Button
            icon="ArrowLeft"
            :variant="canPrevPage ? 'primary' : 'neutral'"
            :class="!canPrevPage && canNextPage ? 'opacity-40' : !canPrevPage && !canNextPage ? 'opacity-0' : ''"
            :disabled="!canPrevPage"
            @click="prevPage"
          />

          <Button
            icon="ArrowRight"
            :variant="canNextPage ? 'primary' : 'neutral'"
            :class="!canNextPage && canPrevPage ? 'opacity-40' : !canPrevPage && !canNextPage ? 'opacity-0' : ''"
            :disabled="!canNextPage"
            @click="nextPage"
          />
        </div>
        <Button icon="Download" variant="primary" class="shrink-0" @click="download" />
    </div>
  </div>
  <div v-else class="flex h-full items-center justify-center text-black/40">
    <p>Candidato não encontrado.</p>
  </div>
</template>
