<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { ButtonOption } from './types';

interface SelectableButtonProps {
  config: Record<string, ButtonOption>;
  onSelect?: (option: ButtonOption) => void;
  fixedWidth?: boolean;
}

const props = withDefaults(defineProps<SelectableButtonProps>(), {
  fixedWidth: true,
});

const modelValue = defineModel<string>('modelValue', { default: '' });

const allExportOptions = computed(() => Object.values(props.config));
const filteredOptions = computed(() => allExportOptions.value);
const isOpen = ref(false);

const selectedOption = computed({
  get: () => {
    const selected = props.config[modelValue.value] || filteredOptions.value[0] || { id: '', title: '', icon: '' };
    return selected;
  },
  set: (option: ButtonOption) => {
    modelValue.value = option.id;
  },
});

const availableDropdownOptions = computed(() =>
  filteredOptions.value.filter((option) => option.id !== selectedOption.value.id),
);

const showDropdown = computed(() => filteredOptions.value.length > 1);

const handleSelect = (option: ButtonOption) => {
  selectedOption.value = option;
  isOpen.value = false;

  if (props.onSelect) {
    props.onSelect(option);
  }
};

const handleMainButtonClick = () => {
  if (props.onSelect) {
    props.onSelect(selectedOption.value);
  }
};

const buttonStyle = computed(() => {
  if (!props.fixedWidth) return {};

  const longestTitle = [...allExportOptions.value].sort((a, b) => b.title.length - a.title.length)[0]?.title || '';

  const width = Math.max(longestTitle.length * 8 + 40, 120);
  return { width: `${width}px` };
});

const dropdownStyle = computed(() => {
  if (!props.fixedWidth) return {};

  const longestTitle = [...allExportOptions.value].sort((a, b) => b.title.length - a.title.length)[0]?.title || '';

  const buttonWidth = Math.max(longestTitle.length * 8 + 40, 120);
  const totalWidth = buttonWidth + 24;
  return { width: `${totalWidth}px` };
});
</script>

<template>
  <div class="relative">
    <DropdownMenu v-model:open="isOpen">
      <div class="flex overflow-hidden rounded-md border border-gray-200">
        <!-- Main Button -->
        <Button
          variant="outline"
          class="h-8 flex-1 justify-start rounded-none border-0 bg-white px-2 text-left text-xs font-normal hover:rounded-none"
          :style="buttonStyle"
          @click="handleMainButtonClick"
        >
          <div class="flex items-center gap-1.5">
            <img :src="selectedOption.icon" class="h-4 w-4" alt="" />
            <span class="text-gray-900">{{ selectedOption.title }}</span>
          </div>
        </Button>

        <!-- Divider -->
        <div v-if="showDropdown" class="h-8 w-[1px] self-center bg-gray-200 group-hover:bg-gray-300"></div>

        <!-- Dropdown Trigger -->
        <DropdownMenuTrigger v-if="showDropdown" as-child>
          <Button
            variant="outline"
            class="flex h-8 w-8 items-center justify-center rounded-none border-0 bg-white px-0 hover:rounded-none"
          >
            <ChevronDown
              class="h-3 w-3 text-gray-600 transition-transform duration-200"
              :class="{ 'rotate-180 transform': isOpen }"
            />
          </Button>
        </DropdownMenuTrigger>
      </div>

      <!-- Dropdown Content -->
      <DropdownMenuContent
        v-if="showDropdown && availableDropdownOptions.length > 0"
        class="p-1"
        align="end"
        side="bottom"
      >
        <div :style="dropdownStyle">
          <DropdownMenuItem
            v-for="option in availableDropdownOptions"
            :key="option.id"
            class="h-7 rounded-none px-2 text-xs font-normal hover:bg-gray-50"
            @click="() => handleSelect(option)"
          >
            <div class="flex w-full items-center gap-1.5">
              <img :src="option.icon" class="h-4 w-4" alt="" />
              <span class="text-gray-900">{{ option.title }}</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
