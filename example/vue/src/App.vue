<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { PlatformType } from '@refore-ai/copy-to-design-sdk';
import ToDesignApp from './components/export/ToDesignApp.vue';
import PreviewHtml from './components/preview/html.vue';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from './components/ui/dropdown-menu';

interface ExampleInput {
  content: string
  label: string
}

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

onMounted(async () => {
  try {
    const res = await fetch('/example/files.json') // 在添加示例时需要向 files.json 添加文件名
    const files: string[] = await res.json()

    const promises = files.map(async (fileName) => {
      const r = await fetch(`/example/${fileName}`)
      const content = r.ok ? await r.text() : `<p>Error loading ${fileName}</p>`
      return {
        content,
        label: fileName.replace('.html','').replace(/-/g, ' ')
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
      <div class="flex h-[55px] w-full flex-none items-center gap-1 border-b px-1">
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
        <ToDesignApp :apps="[PlatformType.Figma, PlatformType.MasterGo]" :content="combined_content" class="ml-auto" />

        <DropdownMenu>
          <DropdownMenuTrigger class="ml-auto bg-background text-foreground rounded-lg border shadow px-2 py-1 text-sm">
            more examples
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="(opt, idx) in inputs"
              :key="idx"
              class="h-6 rounded px-2 hover:bg-gray-50 mt-1"
              :class="{ 'bg-gray-200' : idx === page }"
              @click="page = idx"
            >
              {{ opt.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tabs v-model="viewMode" class="ml-auto mr-4">
          <TabsList>
            <TabsTrigger value="preview">preview</TabsTrigger>
            <TabsTrigger value="code">code</TabsTrigger>
          </TabsList>
        </Tabs>
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
