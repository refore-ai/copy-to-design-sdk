<script setup lang="ts">
import { ref } from 'vue'
import { ExampleInput } from './types'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  inputs: ExampleInput[]
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const isOpen = ref(false)

const handleClick = (idx: number) => {
  emit('update:modelValue', idx)
  isOpen.value = false
}
</script>

<template>
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger
        class="bg-background text-foreground rounded-lg border shadow px-2 py-1 text-sm flex items-center justify-between hover:bg-gray-50"
    >
      {{ inputs[modelValue]?.label || 'Select' }}
      <ChevronDown
          class="ml-2 h-3 w-3 text-gray-600 transition-transform duration-200"
          :class="{ 'rotate-180 transform': isOpen }"
      />
    </DropdownMenuTrigger>

    <DropdownMenuContent>
      <DropdownMenuItem
          v-for="(opt, idx) in inputs"
          :key="idx"
          class="h-6 rounded px-2 hover:bg-gray-50 mt-1"
          :class="{ 'bg-gray-200': idx === modelValue }"
          @click="handleClick(idx)"
      >
        {{ opt.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
