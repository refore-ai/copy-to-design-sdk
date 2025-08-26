<!-- Vue 3 single-file component for displaying and manipulating design content -->
<script setup lang="ts">
// Import Vue related APIs
import { onMounted, ref } from 'vue';
// Import design platform types
import { PlatformType } from '@refore-ai/copy-to-design-sdk';
// Import child components
import ToDesignApp from './components/export/ToDesignApp.vue';
import PreviewHtml from './components/preview/html.vue';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Button } from './components/ui/button';

// Input content state management
const input = ref('');

// Load example HTML content after component is mounted
onMounted(async () => {
  try {
    const response = await fetch('/example/google.html');
    if (response.ok) {
      input.value = await response.text();
    } else {
      console.error('Failed to fetch google.html:', response.statusText);
      input.value = '<p>Error loading content</p>';
    }
  } catch (error) {
    console.error('Error fetching google.html:', error);
    input.value = '<p>Error loading content</p>';
  }
});

// View mode toggle (preview or code)
const viewMode = ref('preview');
</script>

<template>
  <!-- Main container -->
  <div class="bg-muted flex h-screen w-full p-8">
    <!-- Content area -->
    <div class="bg-background flex flex-1 flex-col overflow-hidden rounded-xl border shadow">
      <!-- Top navigation bar -->
      <div class="flex h-[55px] w-full flex-none items-center gap-1 border-b px-1">
        <!-- Project title and links -->
        <Button
          variant="ghost"
          as="a"
          href="https://github.com/refore-ai/copy-to-design-sdk"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-4 text-lg font-semibold h-auto px-3 py-1.5 rounded-md transition-colors hover:text-primary"
        >
          <img src="/logo/demoway/refore.svg" class="h-5 w-5 mr-1" />
          Refore Copy to Design SDK
        </Button>
        <!-- Design tool buttons -->
        <ToDesignApp :apps="[PlatformType.Figma, PlatformType.MasterGo]" :content="input" class="ml-auto" />
        <!-- View mode toggle tabs -->
        <Tabs v-model="viewMode" class="ml-auto mr-4">
          <TabsList>
            <TabsTrigger value="preview">preview</TabsTrigger>
            <TabsTrigger value="code">code</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <!-- Content display area -->
      <div class="flex-1 h-full overflow-auto">
        <!-- Code mode -->
        <div v-if="viewMode === 'code'" class="w-full h-full p-4">
          <Textarea v-model="input" class="min-h-full w-full resize-y" />
        </div>

        <!-- Preview mode -->
        <div v-if="viewMode === 'preview'" class="h-full w-full p-4">
          <PreviewHtml :code="input" class="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>
