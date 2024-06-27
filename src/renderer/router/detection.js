import authEnum from '@renderer/utils/authEnum'
const detectionRoute = [
  {
    path: '/action',
    name: '检测操作',
    meta: {
      icon: 'icon-realtime',
      title: 'menu.detectionAction',
      order: 1,
      rules: '*',
      auth: authEnum.COMMON
    },
    component: () => import('@renderer/views/detection/index.vue')
  }
]
export default detectionRoute
