import authEnum from '@renderer/utils/authEnum'
const dashboardRoute = [
  {
    path: '/dashboard',
    name: '数据看板',
    meta: {
      icon: 'icon-analzye',
      title: 'menu.dashboard',
      order: 3,
      rules: '*',
      auth: authEnum.COMMON
    },
    component: () => import('@renderer/views/dashboard/index.vue')
  }
]
export default dashboardRoute
