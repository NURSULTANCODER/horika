export const TAB_ITEMS = Object.freeze([
  {
    id: 0,
    name: 'Restaurants',
    icon: 'restaurant.svg',
    selectRest: false,
    selectRestGroup: false,
    getter: 'venues',
    getMethod: 'fetchVenues',
    postMethod: 'addVenuesToDB',
    addToList: 'addVenueToList',
    url: '/venues',
    urlName: 'venues',
  },
  {
    id: 1,
    name: 'Dealers',
    icon: 'dealer.svg',
    selectRest: false,
    selectRestGroup: true,
    getter: 'dealers',
    getMethod: 'fetchDealers',
    postMethod: 'addDealerToDB',
    putMethod: 'changeDealerToDB',
    addToList: 'addDealerToList',
    url: '/dealers',
    urlName: 'dealers',
  },
  {
    id: 2,
    name: 'Managers',
    icon: 'manager.svg',
    selectRest: true,
    selectRestGroup: false,
    getter: 'managers',
    getMethod: 'fetchManagers',
    postMethod: 'addManagerToDB',
    putMethod: 'changeManagerToDB',
    addToList: 'addManagerToList',
    url: '/managers',
    urlName: 'managers',
  },
  {
    id: 3,
    name: 'Operators',
    icon: 'operator.svg',
    selectRest: true,
    selectRestGroup: false,
    getter: 'operators',
    getMethod: 'fetchOperators',
    postMethod: 'addOperatorToDB',
    putMethod: 'changeOperatorToDB',
    addToList: 'addOperatorToList',
    url: '/operators',
    urlName: 'operators',
  },
  {
    id: 4,
    name: 'My venue',
    icon: 'restaurant.svg',
    selectRest: true,
    getter: 'getCurrentVenue',
    getMethod: 'fetchCurrentVenue',
    postMethod: '',
    addToList: '',
    url: '/manager/venue',
    urlName: 'manager-venue',
  },
  {
    id: 5,
    name: 'Requests',
    icon: 'request.svg',
    selectRest: false,
    selectRestGroup: false,
    getter: 'getCurrentVenue',
    getMethod: 'fetchCurrentVenue',
    postMethod: '',
    addToList: '',
    url: '/lic-requests',
    urlName: 'lic-requests',
  },
]);

export const HEADER_MENU_LINKS = Object.freeze([
  {
    title: 'Admin List',
    value: 'admin-list',
    id: false,
  },
  {
    title: 'Active orders',
    value: 'new-orders',
    id: true,
  },
  {
    title: 'Taken orders',
    value: 'orders',
    id: true,
  },
  {
    title: 'Incorrect orders',
    value: 'incorrect-orders',
    id: true,
  },
]);

export const TAB_ROLES = Object.freeze({
  DEALER: 1,
  MANAGER: 2,
  OPERATOR: 3,
});

export const TOAST_SETTINGS = Object.freeze({
  x: 'center',
  y: 'top',
});

export const TOAST_TYPES = Object.freeze({
  SUCCESS: {
    color: 'green',
    ...TOAST_SETTINGS,
  },
  ERROR: {
    color: 'red',
    ...TOAST_SETTINGS,
  },
});
