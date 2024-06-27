import authEnum from '@renderer/utils/authEnum'
const router = [
  {
    path: '/systemConfig',
    name: '系统配置',
    meta: {
      icon: 'icon-baseConfig',
      title: 'menu.systemConfig',
      order: 4,
      rules: '*',
      auth: authEnum.COMMON
    },
    children: [
      {
        path: '/gatherConfig',
        name: '采集配置',
        meta: {
          title: 'menu.gatherConfig',
          order: 4,
          rules: '*',
          auth: authEnum.COMMON
        },
        component: () => import('@renderer/views/systemConfig/gatherConfig/list.vue')
      },
      {
        path: '/gatherConfig/preprocess',
        name: '预处理配置',
        meta: {
          title: 'menu.preprocessConfig',
          show: false,
          rules: '1',
          activeMenu: '/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () => import('@renderer/views/systemConfig/gatherConfig/preprocess/index.vue')
      },
      {
        path: '/gatherConfig/USVDetail',
        name: 'USV详情',
        meta: {
          title: 'menu.USVDetail',
          show: false,
          rules: '1',
          activeMenu: '/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () =>
          import('@renderer/views/systemConfig/gatherConfig/adapterDetail/USVDetail.vue')
      },
      {
        path: '/gatherConfig/USPDetail',
        name: 'USP详情',
        meta: {
          title: 'menu.USPDetail',
          show: false,
          rules: '1',
          activeMenu: '/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () =>
          import('@renderer/views/systemConfig/gatherConfig/adapterDetail/USPDetail.vue')
      },
      {
        path: '/gatherConfig/UGDDetail',
        name: 'UGD详情',
        meta: {
          title: 'menu.UGDDetail',
          show: false,
          rules: '1',
          activeMenu: '/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () =>
          import('@renderer/views/systemConfig/gatherConfig/adapterDetail/UGDDetail.vue')
      },
      {
        path: '/gatherConfig/NCDetail',
        name: 'NC详情',
        meta: {
          title: 'menu.NCDetail',
          show: false,
          rules: '1',
          activeMenu: '/systemConfig/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () =>
          import('@renderer/views/systemConfig/gatherConfig/adapterDetail/NCDetail.vue')
      },
      {
        path: '/gatherConfig/AFRDetail',
        name: 'AFR详情',
        meta: {
          title: 'menu.AFRDetail',
          show: false,
          rules: '1',
          activeMenu: '/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () =>
          import('@renderer/views/systemConfig/gatherConfig/adapterDetail/AFRDetail.vue')
      },
      {
        path: '/gatherConfig/LDDetail',
        name: 'LD详情',
        meta: {
          title: 'menu.LDDetail',
          show: false,
          rules: '1',
          activeMenu: '/gatherConfig',
          auth: authEnum.COMMON
        },
        component: () =>
          import('@renderer/views/systemConfig/gatherConfig/adapterDetail/LDDetail.vue')
      },
      {
        path: '/commumicationConfig',
        name: '通讯配置',
        meta: {
          title: 'menu.commumicationConfig',
          order: 4,
          rules: '*',
          auth: authEnum.COMMON
        },
        component: () => import('@renderer/views/systemConfig/commumicationConfig/index.vue')
      },
      {
        path: '/tempConfig',
        name: '模版配置',
        meta: {
          title: 'menu.tempConfig',
          order: 4,
          rules: '*',
          auth: authEnum.COMMON
        },
        component: () => import('@renderer/views/systemConfig/tempConfig/index.vue')
      }
    ]
  }
]

export default router
