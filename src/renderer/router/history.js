import authEnum from '@renderer/utils/authEnum'
const historyRoute = [
  {
    path: '/record',
    name: '检测记录',
    meta: {
      icon: 'icon-history',
      title: 'menu.detectionRecord',
      order: 2,
      rules: '*',
      auth: authEnum.COMMON
    },
    component: () => import('@renderer/views/record/index.vue')
  },
  {
    path: '/record/history',
    name: '历史检测记录',
    meta: {
      title: 'menu.detectionHistoryRecord',
      show: false,
      order: 2,
      rules: '*',
      activeMenu: '/record',
      auth: authEnum.COMMON
    },
    component: () => import('@renderer/views/record/history.vue')
  }
]
export default historyRoute
