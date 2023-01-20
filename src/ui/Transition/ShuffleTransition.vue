<template>
  <TransitionGroup
    moveClass="transition-all ease-in-out duration-300"
    enterActiveClass="transition-all ease-in-out duration-300"
    enterFromClass="opacity-0 scale-01 translate-y-full"
    enterToClass="opacity-100"
    leaveActiveClass="transition-all ease-in-out duration-300 absolute"
    leaveFromClass="opacity-100"
    leaveToClass="opacity-0 scale-01 translate-y-full"
  >
    <slot />
  </TransitionGroup>
</template>
