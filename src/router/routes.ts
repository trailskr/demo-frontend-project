import { RouteRecordRaw } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
// import SigningForm from '@/pages/Signings/SigningForm.vue'

const Auth = () => import('@/pages/Auth/Auth.vue')
const Users = () => import('@/pages/Users/Users.vue')
const Ui = () => import('../pages/Ui/Ui.vue')

const mainLayout: RouteRecordRaw = {
  path: '/',
  name: 'Home',
  component: MainLayout,
  redirect: { name: 'Users' },
  children: [
    {
      path: 'users',
      name: 'Users',
      component: Users
    },
    {
      path: 'ui',
      name: 'Ui',
      component: Ui
    }
  ],
  meta: { useAuth: true }
}

export const routes: RouteRecordRaw[] = [
  mainLayout,
  { path: '/auth', name: 'Auth', component: Auth },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'Error404',
    component: () => import('@/pages/Error404.vue')
  }
]
