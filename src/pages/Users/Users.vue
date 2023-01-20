<script setup lang="ts">
  import { UserInfo } from '@/api/apiTypes'
  import { usePager } from '@/use/usePager'
  import { SortingDirection, useSorting } from '@/use/useSorting'

  import {
    useUsersColumns,
    useUsersQuery,
    getPersonFullName,
    useUserDeleteMutation
  } from './useUsers'

  const { t } = useI18n()

  const { sorting, sortings, sortingsMap, changeSorting } = useSorting(false, {
    key: 'name',
    direction: SortingDirection.Asc
  })

  const menu = ref<HTMLElement>()
  const controls = ref<HTMLElement>()

  const { width: menuWidth } = useElementSize(menu)
  const { width: controlsWidth } = useElementSize(controls)
  const isMenuWrapped = computed(() => menuWidth.value === controlsWidth.value)

  const showUserForm = ref(false)
  const showDeleteUserDialog = ref(false)
  const selectedUser = ref<UserInfo>()

  const onEdit = (row: UserInfo) => {
    selectedUser.value = row
    showUserForm.value = true
  }

  const onDelete = (row: UserInfo) => {
    selectedUser.value = row
    showDeleteUserDialog.value = true
  }

  const columns = useUsersColumns({
    onEdit,
    onDelete
  })

  const create = () => {
    selectedUser.value = undefined
    showUserForm.value = true
  }

  const smallColumns = computed(() => columns.filter((col) => col.showInSmall))

  const query = useRouteQuery('query', '' as string)
  const pg = usePager({ limit: 7 })
  const sort = computed(() => sorting.value == null ? null : sorting.value.key as 'name' | 'email' | 'phone')
  const desc = computed(() => sorting.value == null ? null : sorting.value.direction === SortingDirection.Desc)

  const { page: users, isLoading, isFetching } = useUsersQuery({ query, sort, desc }, pg)
  const { mutate: deleteUser } = useUserDeleteMutation()
</script>

<template>
  <Page>
    <template #header>
      <div
        ref="menu"
        class="flex"
      >
        <PageHeader>{{ t('users') }}</PageHeader>
        <PageHeaderControls ref="controls">
          <NatText
            v-model="query"
            :class="{ 'flex-auto': isMenuWrapped }"
            :placeholder="`${t('search')}...`"
          >
            <template #left>
              <IconUilSearch />
            </template>
          </NatText>
          <NatButton
            class="w-30"
            semantics="accent"
            :label="t('new-user')"
            @click="create"
          />
        </PageHeaderControls>
      </div>
    </template>
    <ResponsiveGrid
      :rows="users"
      rowKey="id"
      :smallCols="smallColumns"
      :bigCols="columns"
      :sortings="sortings"
      :sortingsMap="sortingsMap"
      :changeSorting="changeSorting"
      :isLoading="isLoading"
      :isFetching="isFetching"
      rowBgColor="white"
      isRowClickable
      :onRowClick="onEdit"
    />
    <NatDialog
      v-slot="{ close }"
      v-model="showUserForm"
    >
      <DialogBody
        :header="selectedUser ? t('edit-user') : t('new-user')"
        @close="close"
      >
        <UserForm
          :id="selectedUser?.id"
          class="px-9 pb-9"
          @cancel="close"
          @saved="close"
        />
      </DialogBody>
    </NatDialog>
    <div class="py-6">
      <Pagination
        v-slot="{ total }"
        :pager="pg"
      >
        {{ t('users-count', { count: total }, total) }}
      </Pagination>
    </div>
    <PromptDialog
      v-model="showDeleteUserDialog"
      :header="t('permanently-delete-user')"
      :body="t('are-you-sure-you-want-to-permanently-delete-user-name', {name: selectedUser ? getPersonFullName(selectedUser) : ''})"
      :okText="t('delete')"
      semantics="danger"
      @ok="selectedUser && deleteUser(selectedUser)"
    />
  </Page>
</template>
