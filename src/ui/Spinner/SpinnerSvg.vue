<template>
  <svg
    class="animate-spin animate-duration-2s"
    viewBox="0 0 50 50"
  >
    <circle
      class="path"
      cx="25"
      cy="25"
      r="22"
      stroke="currentColor"
      fill="none"
      stroke-width="4"
    />
  </svg>
</template>

<style scoped>
@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 120, 150;
    stroke-dashoffset: -42;
  }
  100% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: -150;
  }
}

.path {
  stroke-dasharray: 1, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}
</style>
