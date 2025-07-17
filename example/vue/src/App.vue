<script setup lang="ts">
import { CopyToDesign, PlatformType } from '@refore/copy-to-design-sdk';
import { ref } from 'vue';
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';

const copyToDesign = new CopyToDesign({
  key: '0oZEtGQjooLcfXrDFhObo_EqNQFWZSsv',
  _endpoint: () => 'http://localhost:3333',
});

const input = ref(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gradient</title>

    <style>
      .gradient {
        background-image: linear-gradient(
          270deg,
          #3b1aa7 0%,
          #4e31b3 30.49%,
          #9636ef 64.35%,
          #f682bd 100%
        );
        width: 200px;
        height: 200px;
        height: 200px;
      }
    </style>
  </head>
  <body>
    <div class="gradient"></div>
  </body>
</html>
`);

const success = ref(false);

async function convert() {
  success.value = false;
  await copyToDesign.copyToClipboardFromHTML(input.value, {
    width: 1920,
    height: 1080,
    platform: PlatformType.Figma,
  });

  // debug to confirm write into clipboard
  // eslint-disable-next-line no-console
  console.log(await navigator.clipboard.read());

  success.value = true;
}
</script>

<template>
  <div class="container mx-auto mt-10 flex flex-col items-center">
    <h2>Copy HTML To Clipboard</h2>
    <Textarea v-model="input" class="min-h-[300px] w-[500px] resize-y" />
    <Button class="mt-6 inline-block" @click="convert">Convert</Button>
    <div v-if="success">Success</div>
  </div>
</template>
