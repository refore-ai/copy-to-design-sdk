<script setup lang="ts">
import { ref } from 'vue'
import { ExampleInput } from './types'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  inputs: ExampleInput[];
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const isOpen = ref(false);

const handleClick = (idx: number) => {
  emit('update:modelValue', idx);
  isOpen.value = false;
};
</script>

<template>
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger
      class="w-32 bg-background text-foreground rounded-lg border shadow px-2 py-1 text-sm flex items-center justify-between hover:bg-gray-50"
    >
      <a class="ml-1 font-medium"> {{ inputs[modelValue]?.label || 'Select' }} </a>
      <ChevronDown
        class="ml-2 h-3 w-3 text-gray-600 transition-transform duration-200"
        :class="{ 'rotate-180 transform': isOpen }"
      />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="center">
      <DropdownMenuItem
        v-for="(opt, idx) in inputs"
        :key="idx"
        :class="['h-6 rounded px-2 mt-1', idx === modelValue ? 'bg-gray-200 pointer-events-none' : 'hover:bg-gray-50']"
        @click="handleClick(idx)"
      >
        {{ opt.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
