<script setup lang="ts">
/**
 * ExportDialog component
 * ======================
 * Core functionality:
 * 1. Provides a visual interface to export HTML content to design tools (e.g., Figma)
 * 2. Automatically copies content to the system clipboard
 * 3. Supports jumping to the design tool plugin page
 * 4. Provides complete export status feedback (loading/success/failure)
 * 
 * Design highlights:
 * - Dynamically adapts UI and logic based on platform type (DESIGN_APPS)
 * - Configures API keys and endpoints via environment variables
 * - Built-in video demonstration functionality
 * - Supports retry after export failure
 */
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
  (e: 'close'): void;
}>();

const open = defineModel<boolean>('open');

// Design tool SDK authentication key
// Must be configured via environment variable VITE_COPY_TO_DESIGN_KEY
const API_KEY = import.meta.env.VITE_COPY_TO_DESIGN_KEY;

// Design tool SDK endpoint configuration
// Optional configuration via environment variable VITE_COPY_TO_DESIGN_ENDPOINT
// Return function form ensures dynamically getting the latest value
const API_ENDPOINT = import.meta.env.VITE_COPY_TO_DESIGN_ENDPOINT
  ? () => import.meta.env.VITE_COPY_TO_DESIGN_ENDPOINT
  : undefined;

// Export status flag
// true means export operation is in progress
const isExporting = ref(false);

// Export result status
// Possible values: 'success', 'error', null (initial state)
const exportResult = ref<'success' | 'error' | null>(null);

// Video element reference
// Used to control platform demo video playback
const videoRef = ref<HTMLVideoElement>();

const videoSource = computed(() => {
  const platform = props.selectedOption.id as keyof typeof DESIGN_APPS;
  return DESIGN_APPS[platform]?.video || '/video/test.mp4';
});

const closeDialog = () => {
  open.value = false;
  emit('close');
  exportResult.value = null;
};

/**
 * Core method for executing export
 * Process:
 * 1. Verify if export content exists
 * 2. Set loading state
 * 3. Dynamically load SDK
 * 4. Call SDK to copy HTML to clipboard
 * 5. Handle success/failure status
 */
const handleExport = async () => {
  // Pre-check: Ensure there is content to export
  if (!props.exportContent) {
    exportResult.value = 'error';
    return;
  }

  // Set loading state
  isExporting.value = true;
  exportResult.value = null;

  try {
    const { CopyToDesign } = await import('@refore-ai/copy-to-design-sdk');

    const copyToDesign = new CopyToDesign({
      key: API_KEY,
      _endpoint: API_ENDPOINT,
    });

    await copyToDesign.copyToClipboardFromHTML([props.exportContent.html], {
      width: props.exportContent.width || 1920,
      height: props.exportContent.height || 1080,
      platform: props.selectedOption.id as PlatformType,
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
  <!-- Main dialog structure -->
  <!--
    Function description:
    - v-model:open controls dialog show/hide
    - @update:open resets state when handling close event
    - Contains video demo area and export status feedback area
  -->
  <Dialog v-model:open="open" @update:open="(value: boolean) => !value && closeDialog()">
    <DialogContent class="max-h-[90vh] min-w-[600px] overflow-hidden p-0 transition-all duration-200">
      <div class="relative aspect-video overflow-hidden bg-gray-100">
        <video ref="videoRef" class="h-full w-full object-cover" controls autoplay loop>
          <source :src="videoSource" type="video/mp4" />
          Your browser does not support video playback
        </video>

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
            <div class="mt-3 text-lg font-medium">
              {{
                props.selectedOption.id === 'Figma'
                  ? 'Open Copy to Figma plugin in Figma canvas, press Command + V \n to paste the content to canvas'
                  : 'Open Copy to Design plugin in design canvas, press Command + V \n to paste the content to canvas'
              }}
            </div>
            <div class="mt-2">
              <Button class="bg-gray-900 px-6 py-2 text-white hover:bg-gray-800" @click="openPluginPage">
                {{ props.selectedOption.id === 'Figma' ? 'Copy to Figma plugin' : 'Copy to Design plugin' }}
              </Button>
            </div>
            <div class="mt-2 text-[14px]">
              {{
                `You can directly search for and open the ${
                  props.selectedOption.id === 'Figma' ? 'Copy to Figma' : 'Copy to Design'
                } plugin within the Figma canvas.`
              }}
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
