export const ORDER_STATUS = Object.freeze({
  RECEIVED: 1,
  PRODUCTION: 2,
  READY: 3,
  PICKEDUP: 4,
  DELIVERED: 5,
  REJECTED: 6,
  REFUNDED: 7,
  INCORRECT: 8,
  WAITINGPREORDER: 9,
  PREORDER: 10,
});

export const CARD_STATUSES = Object.freeze({
  RECEIVED: {
    value: 1,
    page: 1,
    title: 'Incoming',
    cols: 5, // 12 / Number(Object.keys(statuses).length)
    mdCols: 4,
    show: true,
    buttons: [
      {
        key: 1,
        text: 'Accept',
        handleClick: 'editOrderStatus',
        show: 'state === 1 && page === 1 && isOpen',
      },
      {
        key: 2,
        text: 'Retry',
        handleClick: 'retryOrder',
        col: '6',
        show: 'state === 2 && !isCreatedInRKeeper',
      },
      {
        key: 3,
        text: 'Force',
        handleClick: 'forceOrder',
        col: '6',
        show: 'state === 2 && !isCreatedInRKeeper',
      },
      {
        key: 4,
        text: 'Reject',
        handleClick: 'rejectOrder',
        styleType: 'danger',
        show: 'state === 2 && !isCreatedInRKeeper',
      },
    ],
  },
  PRODUCTION: {
    value: 2,
    page: 1,
    title: 'Outgoing',
    cols: 5,
    mdCols: 4,
    show: true,
    buttons: [
      {
        key: 1,
        text: 'Ready',
        handleClick: 'editOrderStatus',
        show: '',
      },
    ],
  },
  READY: {
    value: 3,
    page: 1,
    title: 'Ready',
    cols: 2,
    mdCols: 4,
    show: true,
    buttons: [
      {
        key: 1,
        text: 'Pick up',
        handleClick: 'editOrderStatus',
        show: 'state === 1',
      },
      {
        key: 2,
        text: 'Retry',
        handleClick: 'retryOrder',
        show: 'state === 2 && !isCreatedInRKeeper',
      },
      {
        key: 3,
        text: 'Force',
        handleClick: 'forceOrder',
        show: 'state === 2',
      },
    ],
  },
  PICKEDUP: {
    value: 4,
    page: 2,
    title: 'Picked up',
    cols: 6,
    show: true,
    buttons: [],
  },
  DELIVERED: {
    value: 4,
    page: 2,
    title: 'Delivered',
    cols: 3,
    show: false,
    buttons: [],
  },
  PREORDER: {
    value: 10,
    page: 2,
    title: 'Pre-order',
    cols: 6,
    show: true,
    buttons: [
      {
        key: 1,
        text: 'Edit',
        handleClick: 'editOrderStatus',
        show: 'page === 2 && isOpen',
      },
    ],
  },
  REJECTED: {
    value: 6,
    page: 3,
    title: 'Reject',
    cols: 6,
    show: true,
    buttons: [],
  },
  REFUNDED: {
    value: 7,
    page: 3,
    title: 'Reject',
    cols: 4,
    show: false,
    buttons: [],
  },
  INCORRECT: {
    value: 8,
    page: 3,
    title: 'Incorrect',
    cols: 6,
    show: true,
    buttons: [],
  },
});

export const ORDER_STATE = Object.freeze({
  GOOD: 1,
  BAD: 2,
});

export const VENUE_STATUSES = [
  {
    status: 'Online',
    color: 'green',
    value: true,
    actionTitle: 'Close',
  },
  {
    status: 'Offline',
    color: 'red',
    value: false,
    actionTitle: 'Open',
  },
];
