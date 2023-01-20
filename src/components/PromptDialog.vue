<script setup lang="ts">
  interface Props {
    modelValue?: boolean
    header?: string
    body?: string
    okText?: string
    ok2Text?: string
    cancelText?: string
    semantics?: 'substrate' | 'danger' | 'accent'
    semantics2?: 'substrate' | 'danger' | 'accent'
    cancelSemantics?: 'substrate' | 'danger' | 'accent'
  }

  const { t } = useI18n()

  const props = withDefaults(defineProps<Props>(), {
    semantics: 'accent',
    semantics2: 'accent',
    cancelSemantics: 'substrate'
  })

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'cancel'): void
    (e: 'ok'): void
    (e: 'ok2'): void
  }

  const emit = defineEmits<Emits>()

  const isOpen = useVModel(props, 'modelValue', emit)

  const ok = () => {
    isOpen.value = false
    emit('ok')
  }

  const ok2 = () => {
    isOpen.value = false
    emit('ok2')
  }

  const cancel = () => {
    isOpen.value = false
    emit('cancel')
  }
</script>

<template>
  <NatDialog v-model="isOpen">
    <DialogBody
      :showHeader="false"
      :showCloseButton="false"
    >
      <div class="sm:min-w-132 px-9 pb-9">
        <div class="relative">
          <slot>
            <div class="text-center">
              <IconIcBaselineWarningAmber
                v-if="semantics === 'danger'"
                class="w-12 h-12 text-danger inline-block"
              />
              <div class="text-4.5 mt-7 font-semibold">
                {{ header }}
              </div>
            </div>
            <slot name="body">
              <div class="text-center text-4.5 mt-4">
                {{ body }}
              </div>
            </slot>
          </slot>
          <div class="mt-10 flex items-center justify-center gap-2.5">
            <NatButton
              class="flex-auto sm:flex-initial sm:min-w-36"
              :label="cancelText ?? t('cancel')"
              :semantics="cancelSemantics"
              @click="cancel"
            />
            <NatButton
              class="flex-auto sm:flex-initial sm:min-w-36"
              :label="okText ?? t('ok')"
              :semantics="semantics"
              type="submit"
              @click="ok"
            >
              <slot name="ok" />
            </NatButton>
            <NatButton
              v-if="ok2Text"
              class="flex-auto sm:flex-initial sm:min-w-36"
              :label="ok2Text ?? t('ok')"
              :semantics="semantics2"
              type="submit"
              @click="ok2"
            >
              <slot name="ok" />
            </NatButton>
          </div>
        </div>
      </div>
    </DialogBody>
  </NatDialog>
</template>
