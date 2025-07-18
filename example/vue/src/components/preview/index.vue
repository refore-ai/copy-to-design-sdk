<template>
  <PreviewHtml
    v-if="mode === 'preview'"
    class="size-full"
    :code="file.content"
  />
  <LazyMonacoEditor
    v-else
    v-model="model"
    v-model:dirty="isDirty"
    class="size-full"
    :default-value="file.content"
    language="html"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  version: ProjectVersion;
  mode: 'code' | 'preview';
  file: VirtualFile;
}>();

const emit = defineEmits<{
  draft: [string];
}>();

const model = useEditorModel();
const isDirty = ref(false);

watch(
  () => props.mode,
  (value, oldValue) => {
    const { version, file: virtualFile } = props;

    if (
      !model.value ||
      value !== 'preview' ||
      oldValue !== 'code' ||
      !virtualFile
    ) {
      return;
    }

    const content = model.value.getValue();
    if (content === virtualFile.content) {
      return;
    }

    if (version.isDraft) {
      db.files.update(virtualFile.id, {
        content,
      });
    } else {
      emit('draft', content);
    }
  },
);
</script>
