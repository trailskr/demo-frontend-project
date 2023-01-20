<template>
  <Transition
    enterActiveClass="transition-transform"
    enterFromClass="translate-x-100%"
    enterToClass="translate-x-0"
    leaveActiveClass="transition-transform"
    leaveFromClass="translate-x-0"
    leaveToClass="translate-x-100%"
  >
    <slot />
  </Transition>
</template>
