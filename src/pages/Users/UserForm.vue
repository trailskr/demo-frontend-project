<script setup lang="ts">

  import { UserInfo } from '@/api/apiTypes'
  import { useErrorMapper } from '@/use/useErrorMapper'
  import { useFormClone } from '@/use/useFormClone'
  import { v } from '@/utils/Validation'
  import { validatePhone } from '@/utils/phone'
  import { isString } from '@/utils/typecheck'

  import { useUserEditMutation, useUserQuery } from './useUsers'

  interface Props {
    id?: number
    user?: UserInfo
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'cancel'): void
    (e: 'saved'): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  const isOrganization = ref(false)

  const validation = reactive(v().addFields({
    firstName: v().required().msg(t('validation.please-type-something')),
    lastName: v().required().msg(t('validation.please-type-something')),
    email: v()
      .required().msg(t('validation.please-type-something'))
      .email().msg(t('validation.wrong-email-format')),
    phone: v().rule('phone', (val) => isString(val) ? validatePhone(val) : true, t('phone-is-invalid'))
  }))

  const id = computed(() => props.id ?? props.user?.id ?? 0)
  const { data, isLoading } = useUserQuery({ id }, props.user)

  const { form: user } = useFormClone(data, {
    initialData: () => ({
      id: 0,
      firstName: '',
      lastName: '',
      email: 'null',
      phone: null,
      image: null
    })
  })

  const { mutate, isLoading: isSaving, error, reset } = useUserEditMutation({
    onSuccess: () => emit('saved')
  })
  const [errorMessage, resetValidation] = useErrorMapper(error, reset)

  const save = () => {
    const form = user.value
    if (!validation.test(form)) return
    mutate(form)
  }

</script>

<template>
  <BasicForm
    class="sm:min-w-132"
    :isLoading="isLoading"
    :isSaving="isSaving"
    :isCreateMode="id == 0"
    :errorMessage="errorMessage"
    :resetValidation="resetValidation"
    @save="save()"
    @cancel="emit('cancel')"
  >
    <div class="flex items-center justify-center">
      <NatButtonGroup
        semantics="link"
        class="flex-auto mb-5"
      >
        <NatButton
          semantics="link"
          class="flex-auto"
          :label="t('individual')"
          :active="!isOrganization"
          @click="isOrganization = false"
        />
        <NatButton
          semantics="link"
          class="flex-auto"
          :label="t('organization')"
          :active="isOrganization"
          @click="isOrganization = true"
        />
      </NatButtonGroup>
    </div>
    <NatText
      v-model="user.firstName"
      required
      :label="t('first-name')"
      :validation="validation.fields.firstName"
    />
    <NatText
      v-model="user.lastName"
      required
      :label="t('last-name')"
      :validation="validation.fields.lastName"
    />
    <NatText
      v-model="user.email"
      required
      :label="t('email')"
      :validation="validation.fields.email"
    />
    <TelInput
      v-model="user.phone"
      :label="t('phone')"
      placeholder="+000000000"
      :validation="validation.fields.phone"
    />
  </BasicForm>
</template>
