<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="-ml-[30px] h-[30px] overflow-hidden text-lg font-medium text-green-500">
    <span class="animate-text-reveal inline-block">
      <svg
        class="mr-1 inline-block h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      {{ message }}
    </span>
  </div>
</template>

<style scoped>
@keyframes text-reveal {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.animate-text-reveal {
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  position: relative;
  animation: text-reveal 1s steps(30, end) forwards;
}
</style>
