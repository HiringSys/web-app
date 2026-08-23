<script setup lang="ts">

withDefaults(
  defineProps<{
    value:      string | number
    copyable?:  boolean
  }>(),
  { copyable: false },
)

async function copyValue(value: string | number) {
  await navigator.clipboard.writeText(String(value))
}

</script>

<template>
  <span v-if="copyable" class="cursor-pointer text-body text-black" @click="copyValue(value)">{{ value }}</span>
  <span v-else class="text-body font-medium text-black">{{ value }}</span>
</template>
