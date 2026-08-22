<script setup lang="ts">

import { computed }             from 'vue'
import Icon                     from '@/components/ui/Icon.vue'
import { notificationState }    from './notify'
import type { NotificationType } from './notify'

const iconByType: Record<NotificationType, 'CheckCircle2' | 'XCircle' | 'Info' | 'AlertTriangle'> = {
  success: 'CheckCircle2',
  error:   'XCircle',
  info:    'Info',
  warning: 'AlertTriangle',
}

const colorByType: Record<NotificationType, string> = {
  success: 'green-co',
  error:   'red-co',
  info:    'blue-co',
  warning: 'yellow-co',
}

const icon  = computed(() => iconByType[notificationState.type])
const color = computed(() => colorByType[notificationState.type])

</script>

<template>
  <Teleport to="body">
    <Transition name="notification">
      <div
        v-if="notificationState.visible"
        class="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-medium bg-white px-4 py-3 shadow-lg"
      >
        <Icon :name="icon" :color="color" :size="20" />
        <span class="text-small font-medium text-black">{{ notificationState.message }}</span>
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
  transform: translate(-50%, 0.5rem);
}
</style>
