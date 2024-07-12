export const ROLES_SETTINGS = Object.freeze({
  Admin: {
    value: 1,
    startPage: 'venues',
  },
  Dealer: {
    value: 2,
    startPage: 'venues',
  },
  Manager: {
    value: 3,
    startPage: 'new-orders',
  },
  Operator: {
    value: 4,
    startPage: 'new-orders',
  },
});

export const REQUIRED_ROUTES = Object.freeze({
  admin: [
    'new-orders-id',
    'incorrect-orders-id',
    'orders-id',
    'venues',
    'admin-list',
    'venue',
    'venue-groups',
    'venue-group',
    'dealers',
    'dealer',
    'managers',
    'manager',
    'operators',
    'operator',
    'lic-requests',
    'lic-request',
  ],
  dealer: [
    'new-orders-id',
    'incorrect-orders-id',
    'orders-id',
    'venues',
    'venue-groups',
    'venue-group',
    'managers',
    'manager',
    'operators',
    'operator',
    'lic-requests',
    'lic-request',
  ],
  manager: ['new-orders', 'incorrect-orders', 'orders', 'venue', 'operators', 'operator', 'manager-venue'],
  operator: ['new-orders', 'incorrect-orders', 'orders'],
});

export const NAVIGATION_DRAWER_FIELDS = Object.freeze({
  ADMIN: [],
  DEALER: [],
  MANAGER: ['status', 'venueAction', 'checkRk', 'checkWolt', 'checkBolt', 'updateMenu'],
  OPERATOR: ['status', 'venueAction', 'checkRk', 'checkWolt', 'checkBolt', 'updateMenu'],
});
