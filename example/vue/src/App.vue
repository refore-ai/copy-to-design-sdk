<script setup lang="ts">
import { ref } from 'vue';

import ToDesignApp from './components/export/ToDesignApp.vue';
import { Textarea } from './components/ui/textarea';

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
</script>

<template>
  <div class="container mx-auto mt-10 flex flex-col items-center">
    <h2>Copy HTML To Clipboard</h2>
    <ToDesignApp :apps="['Figma', 'MasterGo', 'Pixso', 'JSDesign']" :content="input" class="mt-6 inline-block" />
    <Textarea v-model="input" class="min-h-[300px] w-[500px] resize-y" />
  </div>
</template>
