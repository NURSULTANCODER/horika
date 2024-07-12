export const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout'),
    exact: true,
    children: [
      // { path: "", exact: true, name: 'index', component: () => import("../views/Index") },
      {
        path: '/new-orders',
        name: 'new-orders',
        component: () => import('../views/NewOrders.vue'),
      },
      {
        path: '/orders',
        name: 'orders',
        component: () => import('../views/Orders2.vue'),
      },
      {
        path: '/incorrect-orders',
        name: 'incorrect-orders',
        component: () => import('../views/IncorrectOrders.vue'),
      },
      {
        path: '/new-orders-id/:id',
        name: 'new-orders-id',
        component: () => import('../views/NewOrdersId.vue'),
      },
      {
        path: '/orders-id/:id',
        name: 'orders-id',
        component: () => import('../views/Orders2Id.vue'),
      },
      {
        path: '/incorrect-orders-id/:id',
        name: 'incorrect-orders-id',
        component: () => import('../views/IncorrectOrdersId.vue'),
      },
      {
        path: '/venues',
        name: 'venues',
        component: () => import('../views/Venues.vue'),
      },
      {
        path: '/venue/:id',
        name: 'venue',
        component: () => import('../views/Venue.vue'),
      },
      {
        path: '/admin-list',
        name: 'admin-list',
        component: () => import('../views/AdminList.vue'),
      },
      {
        path: '/admin-detail/:id',
        name: 'admin-detail',
        component: () => import('../views/AdminDetail.vue'),
      },
      {
        path: '/manager/venue',
        name: 'manager-venue',
        component: () => import('../views/Venue.vue'),
      },
      {
        path: '/dealers',
        name: 'dealers',
        component: () => import('../views/Dealers.vue'),
      },
      {
        path: '/dealer/:id',
        name: 'dealer',
        component: () => import('../views/Dealer.vue'),
      },
      {
        path: '/managers',
        name: 'managers',
        component: () => import('../views/Managers.vue'),
      },
      {
        path: '/manager/:id',
        name: 'manager',
        component: () => import('../views/Manager.vue'),
      },
      {
        path: '/operators',
        name: 'operators',
        component: () => import('../views/Operators.vue'),
      },
      {
        path: '/operator/:id',
        name: 'operator',
        component: () => import('../views/Operator.vue'),
      },
      {
        path: '/lic-requests',
        name: 'lic-requests',
        component: () => import('../views/LicRequests.vue'),
      },
      {
        path: '/lic-requests/:id',
        name: 'lic-request',
        component: () => import('../views/LicRequestDetail.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/redirect',
    // path: '/redirect/g',
    name: 'token-redirect',
    component: () => import('../views/Redirect.vue'),
  },

  {
    path: '*',
    name: 'error',
    component: () => import('../views/Eror404.vue'),
  },
];
