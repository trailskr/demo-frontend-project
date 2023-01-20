<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useMutation } from 'vue-query'

  import { useSignIn } from '@/modules/auth'
  import { useErrorMapper } from '@/use/useErrorMapper'
  import { v } from '@/utils/Validation'

  import { AuthMode } from './AuthMode'

  interface Props {
    initialMode?: AuthMode
  }

  const props = withDefaults(defineProps<Props>(), {
    initialMode: AuthMode.SignIn
  })

  const isPasswordAuthEnabled = import.meta.env.VITE_PASSWORD_AUTH_ENABLED === 'true'

  const mode = ref<AuthMode>(props.initialMode)
  const { t } = useI18n()

  const root = ref<HTMLElement>()

  watch(mode, () => {
    nextTick(() => {
      if (!root.value) return
      const input = root.value.querySelector('input')
      if (input) input.focus()
    })
  }, { immediate: true })

  const formCredentials = reactive({
    username: 'kminchelle',
    password: '0lelplR'
  })

  const signInValidation = reactive(v().addFields({
    username: v().required().msg(t('validation.please-type-something')),
    password: v().required().msg(t('validation.please-type-something'))
  }))

  const signIn = useSignIn()

  const { isLoading: isSignInCredentialsLoading, error: signInCredentialsError, mutate: signInCredentialsMutation, reset: resetCredentialsMutation } = useMutation('sign-in-credentials', signIn)

  const [signInCredentialsErrorMessage, resetCredentialsError] = useErrorMapper(signInCredentialsError, resetCredentialsMutation)

  // to simply add another sign-in methods
  const signInErrorMessage = computed(() => signInCredentialsErrorMessage.value)
  const isSignInLoading = computed(() => isSignInCredentialsLoading.value)
  const resetError = () => {
    resetCredentialsError()
  }

  const showPassword = ref<boolean>(false)
</script>

<template>
  <div
    ref="root"
    class="flex items-stretch justify-center min-h-full gap-15 md:px-7"
  >
    <section
      class="flex flex-col align-center justify-center rounded-2.5 bg-white p-10 sm:p-15 min-h-90vh md:min-h-85vh"
    >
      <div class="flex-wrap">
        <RouterLink
          :to="{ name: 'Home' }"
          title="dashboard"
        >
          <h1 class="flex items-center gap-8 text-secondary font-semibold text-9 sm:text-58px whitespace-nowrap">
            <SampleLogo
              class="sm:hidden"
              width="48"
              height="48"
            />
            <SampleLogo
              class="hidden sm:block"
              width="72"
              height="72"
            />
            Demo
          </h1>
        </RouterLink>
      </div>
      <div class="flex flex-col items-center flex-wrap gap-3 w-60 sm:w-80">
        <h2 class="flex items-center font-semibold text-9 flex-auto my-6">
          {{ mode === AuthMode.SignIn ? t('sign.sign-in-process') : t('sign.sign-up-process') }}
        </h2>
        <div
          v-if="isPasswordAuthEnabled"
          class="flex-auto flex items-center font-semibold"
        >
          {{ t('sign.or-sign-in-with-email') }}
        </div>
        <NatForm
          v-if="mode === AuthMode.SignIn && isPasswordAuthEnabled"
          class="flex flex-col gap-4 self-stretch my-6"
          @submit="signInValidation.test(formCredentials) && signInCredentialsMutation(formCredentials)"
        >
          <div class="space-y-1">
            <NatText
              v-model="formCredentials.username"
              required
              :label="`${t('sign.login')}`"
              :validation="signInValidation.fields.username"
            />
            <NatText
              v-model="formCredentials.password"
              required
              :type="showPassword ? 'text' : 'password'"
              :label="`${t('sign.password')}`"
              :validation="signInValidation.fields.password"
            >
              <template #right>
                <PasswordIcon v-model="showPassword" />
              </template>
            </NatText>
          </div>
          <MessageAlert
            v-model="signInErrorMessage"
            semantics="error"
            @hide="resetError()"
          />
          <NatButton
            class="block w-full"
            :label="t('sign.to-sign-in')"
            :loading="isSignInCredentialsLoading"
            :disabled="isSignInLoading"
            type="submit"
            semantics="accent"
          />
        </NatForm>
      </div>
    </section>
    <AuthPeople class="self-center hidden lg:block" />
    <SampleLogo
      class="lg:hidden opacity-10 fixed -right-15 -bottom-10 -z-1"
      width="300"
      height="300"
    />
  </div>
</template>
