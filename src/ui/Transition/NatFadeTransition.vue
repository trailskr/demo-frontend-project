<template>
  <Transition
    mode="out-in"
    enterActiveClass="transition-opacity duration-75"
    enterFromClass="opacity-0"
    enterToClass="opacity-100"
    leaveActiveClass="transition-opacity duration-75"
    leaveFromClass="opacity-100"
    leaveToClass="opacity-0"
  >
    <slot />
  </Transition>
</template>
