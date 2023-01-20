<script setup lang="ts">
  import { UserInfo } from '@/api/apiTypes'
  import { useSignOut } from '@/modules/auth'

  interface Props {
    modelValue?: UserInfo
  }

  defineProps<Props>()

  const { t } = useI18n()

  const signOut = useSignOut()
</script>

<template>
  <NatDropdown>
    <template #reference="{ ref, toggle }">
      <NatButton
        :ref="ref"
        :padding="false"
        :label="t('user-menu')"
        semantics="link"
        @click="toggle"
      >
        <UserAvatar
          :modelValue="modelValue"
          titleClass="text-6.5"
          class="w-11.5 h-11.5"
        />
      </NatButton>
    </template>
    <template #default>
      <div
        v-if="modelValue"
        class="p-4 space-y-4 min-w-xs"
      >
        <div class="text-4.5 whitespace-nowrap">
          {{ modelValue.firstName }} {{ modelValue.lastName }}
        </div>
        <div class="space-y-2.5">
          <NatButton
            class="w-full"
            semantics="primary"
            :label="t('to-sign-out')"
            @click="signOut()"
          />
        </div>
        <slot />
      </div>
    </template>
  </NatDropdown>
</template>
