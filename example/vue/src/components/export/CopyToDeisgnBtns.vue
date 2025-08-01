<script setup lang="ts">
import { computed, ref } from 'vue';

import SelectableButton from '../selectable-button/selectable-button.vue';
import type { ButtonOption } from '../selectable-button/types';
import ExportDialog from './ExportDialog.vue';
import { DESIGN_APPS } from './type';
import type { ExportContent } from './type';
import { PlatformType } from '@refore/copy-to-design-sdk';
interface Props {
  apps?: PlatformType[];
  content?: string;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  apps: () => [PlatformType.Figma] as PlatformType[],
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
    const key = app as keyof typeof DESIGN_APPS;
    config[app] = {
      id: app,
      title: `Copy to ${DESIGN_APPS[key].title}`,
      icon: DESIGN_APPS[key].icon,
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
