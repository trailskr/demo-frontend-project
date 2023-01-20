<script setup lang="ts">
  import { user } from '@/modules/auth'
  import { NatTab } from '@/ui/Tabs/tabs'
  import { useDisableHtmlScroll } from '@/use/useDisableHtmlScroll'
  import { useScreenBreakpoints } from '@/use/useScreenBreakpoints'

  import IconGoUsers from '~icons/fe/users'
  import IconMdiVuejs from '~icons/mdi/vuejs'

  const { t } = useI18n()

  const header = ref<HTMLElement>()
  const nav = ref<HTMLElement>()

  const isMenuOpen = ref(false)
  const toggleMenu = useToggle(isMenuOpen)

  useDisableHtmlScroll(isMenuOpen)

  const screen = useScreenBreakpoints()

  const route = useRoute()
  watch(() => route.name, () => {
    if (isMenuOpen.value) isMenuOpen.value = false
  })

  const routes: NatTab[] = [{
    id: 'Users',
    to: { name: 'Users' },
    name: t('users'),
    icon: IconGoUsers
  }, {
    id: 'Ui',
    to: { name: 'Ui' },
    name: t('ui-components'),
    icon: IconMdiVuejs
  }]
</script>

<template>
  <header
    ref="header"
    class="h-18.5 flex items-center border-substrate border-b-1 light:bg-maind"
  >
    <nav
      ref="nav"
      class="flex px-10 items-center space-x-3 w-full min-w-min"
    >
      <template v-if="!screen.lg">
        <BurgerButton
          :active="isMenuOpen"
          @click="toggleMenu()"
        />
        <NatAside
          v-model="isMenuOpen"
          class="top-18.5"
        >
          <div class="flex items-center justify-center h-full">
            <NatTabs
              class="flex-auto flex-col"
              :tabs="routes"
              semantics="header"
            />
          </div>
          <SampleLogo
            class="opacity-10 fixed -right-15 -bottom-10 -z-1"
            width="300"
            height="300"
          />
        </NatAside>
        <div class="flex-auto" />
      </template>
      <RouterLink
        :to="{ name: 'Home' }"
        title="dashboard"
      >
        <h1 class="flex items-center gap-3 font-semibold text-5.5 lg:text-6.5 whitespace-nowrap text-secondary">
          <SampleLogo
            width="32"
            height="32"
          />
          Sample Project
        </h1>
      </RouterLink>

      <div class="flex-auto" />

      <NatTabs
        v-if="screen.lg"
        class="flex-auto"
        :tabs="routes"
        semantics="header"
      />

      <div class="flex-auto" />

      <!-- <LanguageSelect /> -->
      <!-- <DarkModeSelect class="inline-block" /> -->

      <!-- <PlusButton /> -->

      <UserDropdown
        v-if="user"
        :modelValue="user"
      />
    </nav>
  </header>
  <RouterView v-slot="slotData">
    <NatSlideLeftTransition>
      <div v-show="!isMenuOpen">
        <Component :is="slotData.Component" />
      </div>
    </NatSlideLeftTransition>
  </RouterView>
</template>
