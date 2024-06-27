import { router } from '@renderer/router/loadRouter'
const routes = [
  { path: '/:pathMatch(.*)*', component: () => import('@renderer/views/404.vue') },
  { path: '/', redirect: '/gatherConfig' },
  {
    path: '/home',
    name: 'home',
    component: () => import('@renderer/layout/index.vue'),
    children: [...router]
  }
]

export default routes
