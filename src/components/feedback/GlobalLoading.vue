<script setup lang="ts">
import { LoaderCircle } from "@lucide/vue";

import {
  globalLoadingMessage,
  globalLoadingVisible,
} from "./globalLoading";
</script>

<template>
  <Teleport to="body">
    <Transition name="loading-overlay">
      <div
        v-if="globalLoadingVisible"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]"
        aria-busy="true"
        @touchmove.prevent
        @wheel.prevent
      >
        <div
          class="flex w-full max-w-sm flex-col items-center gap-4 rounded-medium bg-white px-6 py-8 text-center shadow-[0_16px_48px_rgb(25_25_25/0.18)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue/15">
            <LoaderCircle
              :size="34"
              :stroke-width="2.4"
              class="animate-spin text-blue-co motion-reduce:animate-none"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <h2 class="text-heading font-semibold text-black">
              {{ globalLoadingMessage }}
            </h2>
            <p class="text-small text-black/55">
              Aguarde enquanto concluímos esta operação.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loading-overlay-leave-active {
  transition: opacity 120ms ease;
}

.loading-overlay-enter-active > div,
.loading-overlay-leave-active > div {
  transition: transform 120ms ease, opacity 120ms ease;
}

.loading-overlay-leave-to,
.loading-overlay-enter-from > div,
.loading-overlay-leave-to > div {
  opacity: 0;
}

.loading-overlay-enter-from > div,
.loading-overlay-leave-to > div {
  transform: translateY(8px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .loading-overlay-enter-active,
  .loading-overlay-leave-active,
  .loading-overlay-enter-active > div,
  .loading-overlay-leave-active > div {
    transition: none;
  }
}
</style>
