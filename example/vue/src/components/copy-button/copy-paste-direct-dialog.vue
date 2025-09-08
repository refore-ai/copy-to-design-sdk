<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';

import SuccessAnimation from '../animation/SuccessAnimation.vue';
import type { ButtonOption } from '../selectable-button/types';
import { Dialog, DialogContent } from '../ui/dialog';
import type { ExportContent } from './type';
import { DESIGN_APPS } from './type';
import { Button } from '../ui/button';

const props = defineProps<{
  selectedOption: ButtonOption;
  exportContent: ExportContent;
}>();

const emit = defineEmits<{
  close: [];
}>();

const open = defineModel<boolean>('open');

const API_KEY = import.meta.env.VITE_COPY_TO_DESIGN_KEY;
const API_ENDPOINT = import.meta.env.VITE_COPY_TO_DESIGN_ENDPOINT
  ? () => import.meta.env.VITE_COPY_TO_DESIGN_ENDPOINT
  : undefined;

const isExporting = ref(false);
const exportResult = ref<'success' | 'error' | null>(null);
// const videoRef = ref<HTMLVideoElement>();

// const videoSource = computed(() => {
//   const platform = props.selectedOption.id as keyof typeof DESIGN_APPS;
//   return DESIGN_APPS[platform]?.video || '/video/test.mp4';
// });

const closeDialog = () => {
  open.value = false;
  emit('close');
  exportResult.value = null;
};

const handleExport = async () => {
  if (!props.exportContent) {
    exportResult.value = 'error';
    return;
  }

  isExporting.value = true;
  exportResult.value = null;

  try {
    const { CopyToDesign } = await import('@refore-ai/copy-to-design-sdk');

    const copyToDesign = new CopyToDesign({
      key: API_KEY,
      _endpoint: API_ENDPOINT,
    });

    await copyToDesign.copyPasteDirect({
      content: props.exportContent.html,
      width: props.exportContent.width ?? 1920,
      height: props.exportContent.height ?? 1080,
      platform: props.selectedOption.id as PlatformType.MasterGo,
    });

    exportResult.value = 'success';
  } catch (error: unknown) {
    console.error('Export failed:', error);
    exportResult.value = 'error';
  } finally {
    isExporting.value = false;
  }
};

watch(
  () => open.value,
  (newValue) => {
    if (newValue && props.exportContent) {
      handleExport();
    }
  },
);

const tryAgain = () => {
  handleExport();
};

// Function to open plugin page
const openPluginPage = () => {
  const platform = props.selectedOption.id as keyof typeof DESIGN_APPS;
  if (DESIGN_APPS[platform]?.plugin) {
    window.open(DESIGN_APPS[platform].plugin, '_blank');
  }
};
</script>

<template>
  <Dialog v-model:open="open" @update:open="(value: boolean) => !value && closeDialog()">
    <DialogContent class="max-h-[90vh] min-w-[600px] overflow-hidden p-0 transition-all duration-200">
      <div class="relative aspect-video overflow-hidden bg-gray-100">
        <div
          v-if="isExporting"
          class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 backdrop-blur-sm"
        >
          <svg class="h-12 w-12 animate-spin" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>

      <div class="flex h-[220px] items-center justify-center">
        <div class="p-4 text-center">
          <div v-if="exportResult === 'success'">
            <SuccessAnimation message="Copying successful" />
            <div class="mt-2 text-[14px]">
              {{ `You can press Command + V to directly paste the content to the ${props.selectedOption.id} canvas.` }}
            </div>
          </div>

          <div v-else-if="exportResult === 'error'" class="h-[40px] text-lg font-medium text-red-700">
            Export failed
          </div>

          <div v-else-if="isExporting" class="h-[40px] text-lg font-medium">
            Copying to {{ props.selectedOption.title }}...
          </div>

          <div class="mt-2">
            <Button
              v-if="exportResult === 'error'"
              class="bg-gray-900 px-6 py-2 text-white hover:bg-gray-800"
              @click="tryAgain"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
