<script setup lang="ts">
import { ref, computed } from 'vue';
import { ImportMode, PlatformType } from '@refore-ai/copy-to-design-sdk';
import ToDesignApp from './components/export/ToDesignApp.vue';
import PreviewHtml from './components/preview/html.vue';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';

import GOOGLE_DEMO_HTML from './assets/demo-pages/google.html?raw';
import SEARCH_RESULT_DEMO_HTML from './assets/demo-pages/search-result.html?raw';
import Switch from './components/ui/switch/Switch.vue';

export interface ExampleInput {
  content: string;
  label: string;
}

const pages = ref<ExampleInput[]>([
  {
    label: 'Google',
    content: GOOGLE_DEMO_HTML,
  },
  {
    label: 'Search Result',
    content: SEARCH_RESULT_DEMO_HTML,
  },
]);
const copyContents = computed(() => pages.value.map((i) => i.content));
const currentExampleIndex = ref(0);
const importMode = ref(ImportMode.Interactive);
const includeViewport = ref(true);

const active_input = computed({
  get: () => pages.value[currentExampleIndex.value]?.content || '',
  set: (val) => {
    pages.value[currentExampleIndex.value].content = val;
  },
});

// 视图模式切换
const viewMode = ref('preview');
</script>

<template>
  <div class="bg-muted h-screen w-screen p-8">
    <div class="bg-background size-full flex flex-col overflow-hidden rounded-xl border shadow">
      <header class="flex w-full justify-between items-center border-b p-4 py-2 relative">
        <div class="flex items-center">
          <Button
            variant="ghost"
            as="a"
            href="https://github.com/refore-ai/copy-to-design-sdk"
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg font-semibold h-auto px-3 py-1.5 rounded-md transition-colors hover:text-primary flex items-center"
          >
            <img src="/logo/demoway/refore.svg" class="h-5 w-5 mr-1" />
            Refore Copy to Design SDK
          </Button>
        </div>

        <div class="min-[2000px]:absolute min-[2000px]:left-1/2 min-[2000px]:-translate-x-1/2">
          <ToDesignApp
            :apps="[PlatformType.Figma, PlatformType.MasterGo]"
            :content="copyContents"
            :import-mode="importMode"
            :width="includeViewport ? 1920 : undefined"
            :height="includeViewport ? 1080 : undefined"
          />
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <label class="text-sm">Include viewport:</label>
            <Switch v-model="includeViewport" />
          </div>

          <div class="flex items-center gap-2">
            <label for="import-mode" class="text-sm">Import Mode:</label>
            <Select v-model="importMode">
              <SelectTrigger id="import-mode">
                <SelectValue placeholder="Select a import mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="ImportMode.Interactive">Interactive</SelectItem>
                <SelectItem :value="ImportMode.Quick">Quick</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm">Pages:</label>
            <Select v-model="currentExampleIndex">
              <SelectTrigger>
                <SelectValue placeholder="Select a example page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(example, idx) in pages" :value="idx">{{ example.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Tabs v-model="viewMode">
            <TabsList class="grid w-full grid-cols-2 px-1">
              <TabsTrigger value="preview">preview</TabsTrigger>
              <TabsTrigger value="code">code</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main class="flex-1 h-full overflow-auto">
        <div v-if="viewMode === 'code'" class="w-full h-full p-4">
          <Textarea v-model="active_input" class="min-h-full w-full resize-y" />
        </div>

        <div v-if="viewMode === 'preview'" class="h-full w-full p-4">
          <PreviewHtml :code="active_input" class="w-full h-full" />
        </div>
      </main>
    </div>
  </div>
</template>
