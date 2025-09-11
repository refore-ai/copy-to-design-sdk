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
const exportStatus = ref<'success' | 'error' | 'waiting-user' | null>(null);
const videoRef = ref<HTMLVideoElement>();
const copyHandler = ref<Function | null>(null);

const videoSource = computed(() => {
  const platform = props.selectedOption.id as keyof typeof DESIGN_APPS;
  return DESIGN_APPS[platform]?.video || '/video/test.mp4';
});

const closeDialog = () => {
  open.value = false;
  emit('close');
  exportStatus.value = null;
};

const handleExport = async () => {
  if (!props.exportContent) {
    exportStatus.value = 'error';
    return;
  }

  isExporting.value = true;
  exportStatus.value = null;

  try {
    const { CopyToDesign } = await import('@refore-ai/copy-to-design-sdk');

    const copyToDesign = new CopyToDesign({
      key: API_KEY,
      _endpoint: API_ENDPOINT,
    });

    await copyToDesign.copyPasteInPlugin({
      content: props.exportContent.html,
      width: props.exportContent.width,
      height: props.exportContent.height,
      platform: props.selectedOption.id as PlatformType,
      importMode: props.exportContent.importMode,
      onWaitingForFocus: async () => {
        // debugger;
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        if ('Notification' in window && Notification.permission !== 'denied') {
          new Notification('Data Ready', {
            body: 'Data is ready, please return to the page to continue',
            icon: '/favicon.ico',
          });
        }
      },
      onUserActionRequired: (writeClipboard) => {
        exportStatus.value = 'waiting-user';
        copyHandler.value = writeClipboard;
      },
    });

    exportStatus.value = 'success';
  } catch (error: unknown) {
    console.error('Export failed:', error);
    exportStatus.value = 'error';
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
          <div v-if="exportStatus === 'success'">
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

          <div v-else-if="exportStatus === 'error'" class="h-[40px] text-lg font-medium text-red-700">
            Export failed
          </div>

          <div v-else-if="exportStatus === 'waiting-user'" class="">
            <Button @click="copyHandler">Click to copy</Button>
          </div>

          <div v-else-if="isExporting" class="h-[40px] text-lg font-medium">
            Copying to {{ props.selectedOption.title }}...
          </div>

          <div class="mt-2">
            <Button
              v-if="exportStatus === 'error'"
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
