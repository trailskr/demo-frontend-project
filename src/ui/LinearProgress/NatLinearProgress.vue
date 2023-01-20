<template>
  <div class="absolute h-2px w-100% overflow-hidden">
    <div class="linear-progress-1 absolute inset-0 bg-primary" />
    <div class="linear-progress-2 absolute inset-0 bg-primary" />
  </div>
</template>

<style>
  @keyframes linear-progress--indeterminate {
    0% {
      transform: translateX(-35%) scaleX(.35)
    }

    60% {
      transform: translateX(100%) scaleX(.9)
    }

    to {
      transform: translateX(100%) scaleX(.9)
    }
  }

  .linear-progress-1 {
    animation: linear-progress--indeterminate 2.1s cubic-bezier(.65,.815,.735,.395) infinite;
    transform-origin: 0 0;
  }

  @keyframes linear-progress--indeterminate-short {
    0% {
      transform: translateX(-101%) scaleZ(1)
    }

    60% {
      transform: translateX(107%) scaleX(.01)
    }

    to {
      transform: translateX(107%) scaleX(.01)
    }
  }

  .linear-progress-2 {
    transform: translateX(-101%) scaleZ(1);
    animation: linear-progress--indeterminate-short 2.1s cubic-bezier(.165,.84,.44,1) infinite;
    animation-delay: 1.15s;
    transform-origin: 0 0;
  }
</style>
