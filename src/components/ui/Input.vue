<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    type?:       string
    placeholder: string
    rounded?:    boolean
    disabled?:   boolean
    required?:   boolean
    min?:        string | number
    max?:        string | number
    step?:       string | number
  }>(),
  {
    type:     'text',
    rounded:  false,
    disabled: false,
    required: false,
  },
)

const model = defineModel<string>({ default: '' })

function updateModel(event: Event) {
  model.value = (event.target as HTMLInputElement).value
}

</script>

<template>
  <input
    class="w-full bg-white px-4 py-2.5 font-medium text-black placeholder:font-semibold placeholder:text-black/25 focus:outline-0 focus-visible:ring-2 focus-visible:ring-blue/70"
    :class="rounded ? 'rounded-full' : 'rounded-medium'"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :value="model"
    @input="updateModel"
  />
</template>
