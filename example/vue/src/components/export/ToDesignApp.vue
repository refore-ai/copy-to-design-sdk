<script setup lang="ts">
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

const isDialogOpen = ref(false);
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
