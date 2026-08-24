<script setup lang="ts">

import { computed }             from 'vue'
import { notificationState }    from './notify'
import type { NotificationType } from './notify'

const colorByType: Record<NotificationType, string> = {
  success: 'green-co',
  error:   'red-co',
  info:    'blue-co',
  warning: 'yellow-co',
}

const color = computed(() => colorByType[notificationState.type])

</script>

<template>
  <Teleport to="body">
    <Transition name="notification">
      <div
        v-if="notificationState.visible"
        class="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex items-center justify-center px-4"
      >
        <div
          class="pointer-events-auto max-w-md rounded-medium border-l-4 bg-white px-4 py-3 text-black shadow-flat"
          :class="'border-' + color"
        >
          {{ notificationState.message }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
