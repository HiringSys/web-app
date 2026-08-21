<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    type?:       string
    placeholder: string
    rounded?:    boolean
    disabled?:   boolean
  }>(),
  {
    type:     'text',
    rounded:  false,
    disabled: false,
  },
)

const model = defineModel<string>({ default: '' })

</script>

<template>
  <input
    class="w-full bg-white px-4 py-2.5 font-medium text-black placeholder:text-black/20 focus:outline-0"
    :class="rounded ? 'rounded-full' : 'rounded-medium'"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    v-model="model"
  />
</template>
