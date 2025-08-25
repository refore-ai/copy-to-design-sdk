<script setup lang="ts">
/**
 * ToDesignApp component
 * ======================
 * Core functionality:
 * 1. Provides design tool selection buttons (e.g., Figma)
 * 2. Configures export content (HTML, width, height)
 * 3. Triggers the export dialog
 * 
 * Design highlights:
 * - Supports multi-platform dynamic adaptation (via DESIGN_APPS configuration)
 * - Uses Vue's Composition API for state management
 * - Passes export content and platform configuration via Props
 */
import { computed, ref } from 'vue';

import SelectableButton from '../selectable-button/selectable-button.vue';
import type { ButtonOption } from '../selectable-button/types';
import ExportDialog from './ExportDialog.vue';
import { DESIGN_APPS } from './type';
import type { ExportContent } from './type';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';

interface Props {
  apps?: PlatformType[];
  content?: string;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  apps: () => [PlatformType.Figma],
  content: '',
  width: 1920,
  height: 1080,
});

// Dialog display state
// true means the dialog is open
const isDialogOpen = ref(false);

// Currently selected design tool option
// Contains id, title and icon information
const selectedOption = ref<ButtonOption>({ id: '', title: '', icon: '' });

// Create config for SelectableButton
const buttonConfig = computed(() => {
  const config: Record<string, ButtonOption> = {};

  props.apps.forEach((app) => {
    config[app] = {
      id: app,
      title: `Copy to ${DESIGN_APPS[app].title}`,
      icon: DESIGN_APPS[app].icon,
    };
  });

  return config;
});

// Prepare export content
const exportContent = computed<ExportContent>(() => ({
  html: props.content,
  width: props.width,
  height: props.height,
}));

// Handle selection event
/**
 * Handle design tool selection event
 * 1. Update the selected design tool option
 * 2. Open the export dialog
 */
const handleSelect = (option: ButtonOption) => {
  selectedOption.value = option;
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
};
</script>

<template>
  <div class="bg-background text-foreground rounded-lg border shadow">
    <SelectableButton :config="buttonConfig" @select="handleSelect" />
    <ExportDialog
      v-model:open="isDialogOpen"
      :selected-option="selectedOption"
      :export-content="exportContent"
      @close="closeDialog"
    />
  </div>
</template>
