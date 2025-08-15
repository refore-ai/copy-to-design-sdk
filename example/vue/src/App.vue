<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';
import ToDesignApp from './components/export/ToDesignApp.vue';
import ExampleSelector from "@/components/example-selector/example-selector.vue";
import { ExampleInput } from '@/components/example-selector/types'
import PreviewHtml from './components/preview/html.vue';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';

const inputs = ref<ExampleInput[]>([])
const page = ref(0)

const active_input = computed({
  get: () => inputs.value[page.value]?.content || '',
  set: (val) => {
    if (inputs.value[page.value]) inputs.value[page.value].content = val
  }
})

const combined_content = computed(() => inputs.value.map(i => i.content).join(''))

// 视图模式切换
const viewMode = ref('preview');
const isOpen = ref(false);


onMounted(async () => {
  try {
    const res = await fetch('/example/files.json') // 在添加示例时需要向 files.json 添加文件名
    const files: string[] = await res.json()

    const promises = files.map(async (fileName, index) => {
      const r = await fetch(`/example/${fileName}`)
      const content = r.ok ? await r.text() : `<p>Error loading ${fileName}</p>`
      return {
        content,
        label: `page ${index + 1}`
      }
    })

    inputs.value = await Promise.all(promises)
  } catch (err) {
    console.error('Failed to load example files:', err)
  }
})

</script>

<template>
  <div class="bg-muted flex h-screen w-full p-8">
    <div class="bg-background flex flex-1 flex-col overflow-hidden rounded-xl border shadow">
      <div class="flex h-[55px] w-full flex-none items-center border-b px-4">
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

        <div class="flex-1 flex justify-center">
          <ToDesignApp :apps="[PlatformType.Figma, PlatformType.MasterGo]" :content="combined_content" />
        </div>

        <div class="flex items-center space-x-2">
          <ExampleSelector v-model="page" :inputs="inputs" />
          <Tabs v-model="viewMode" class="ml-3">
            <TabsList>
              <TabsTrigger value="preview">preview</TabsTrigger>
              <TabsTrigger value="code">code</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div class="flex-1 h-full overflow-auto">
        <div v-if="viewMode === 'code'" class="w-full h-full p-4">
          <Textarea v-model="active_input" class="min-h-full w-full resize-y" />
        </div>

        <div v-if="viewMode === 'preview'" class="h-full w-full p-4">
          <PreviewHtml :code="active_input" class="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>
