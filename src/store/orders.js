import axios from '../boot/axiosApi';
import { ORDER_STATUS } from '@/data';
import { statusConvertToString, statusConvertToNumber } from '@/utils';

export default {
  namespaced: true,
  state: {
    received: [],
    production: [],
    ready: [],
    pickedup: [],
    delivered: [],
    rejected: [],
    refunded: [],
    incorrect: [],
    preorder: [],
    error: '',
  },
  mutations: {
    setError(state, msg) {
      state.error = msg;
    },
    setOrders(state, { orders, status }) {
      let name = status;
      if (typeof status === 'number') {
        name = statusConvertToString(status);
      }
      state[name.toLowerCase()] = orders;
    },
    moveOrder(state, data) {
      // statuses by NUMBERS
      // {id: e.target.id, from: status, to: ORDER_STATUS['REJECTED']}
      let newStatusVal = Object.keys(ORDER_STATUS).find(key => ORDER_STATUS[key] === data.to);
      let newName = newStatusVal.toLowerCase();

      let oldStatusVal = Object.keys(ORDER_STATUS).find(key => ORDER_STATUS[key] === data.from);
      let oldName = oldStatusVal.toLowerCase();

      let order = state[oldName].find(el => el.id === data.id);

      if (order) {
        order.statusId = data.to;
        order.status = { id: data.to, name: newName };

        state[newName].unshift(order);
        let newArr = state[oldName].filter(el => el.id !== data.id);
        state[oldName] = JSON.parse(JSON.stringify(newArr));
      }
    },

    returnOrder(state, data) {
      let oldStatusVal = Object.keys(ORDER_STATUS).find(key => ORDER_STATUS[key] === data.to);
      let oldName = oldStatusVal.toLowerCase();

      let newStatusVal = Object.keys(ORDER_STATUS).find(key => ORDER_STATUS[key] === data.from);
      let newName = newStatusVal.toLowerCase();

      let order = state[oldName].find(el => el.id === data.id);
      order.statusId = data.from;
      order.status = { id: data.from, name: newName };

      state[oldName] = state[oldName].filter(el => el.id !== data.id);
      state[newName].unshift(order);
    },

    addOrder(state, order) {
      let name = '';
      if (typeof order.statusId === 'number') {
        name = statusConvertToString(order.statusId).toLowerCase();
      }

      let orderInSameStatus = state[name].find(el => el.id === order.id);
      if (orderInSameStatus) {
        if (orderInSameStatus.stateId !== order.stateId) {
          state[name] = state[name].map(el => {
            if (el.id === order.id) {
              return { ...order, isLoading: false };
            }
            return el;
          });
          return;
        }
        return;
      }

      // удаление
      for (let i in state) {
        if (i !== name && i !== 'error') {
          state[i] = state[i].filter(el => el.id !== order.id);
        }
      }

      if (!state[name].find(el => el.id === order.id)) {
        state[name].unshift(order);
      }
    },

    setLoading(state, data) {
      console.log('set loading called');
      let name = data.status;
      if (typeof data.status === 'number') {
        name = statusConvertToString(data.status);
      }

      state[name].forEach(el => (el.id === data.id ? (el.isLoading = data.value) : {}));
    },
    updateOrder(state, order) {
      let name = '';
      if (typeof order.statusId === 'number') {
        name = statusConvertToString(order.statusId).toLowerCase();
      }

      if (name === 'production') {
        return;
      }

      if (!state[name].find(el => el.id === order.id)) {
        state[name].unshift(order);
      }

      for (let i in state) {
        if (i === name && i !== 'error') {
          state[i] = state[i].map(el => {
            if (el.id === order.id) {
              return order;
            }
            return el;
          });
        }
      }
    },

    editAdjustedTime(state, data) {
      let curStatus = data.status;
      if (typeof curStatus === 'number') {
        curStatus = statusConvertToString(data.status);
      }
      state[curStatus].forEach(el => (el.id === data.id ? (el.adjustedTimeInMinutes = data.time) : {}));
    },
    resetOrders(state) {
      state.received = [];
      state.production = [];
      state.ready = [];
      state.pickedup = [];
      state.delivered = [];
      state.rejected = [];
      state.refunded = [];
      state.incorrect = [];
      state.preorder = [];
      state.error = '';
    },
  },
  actions: {
    fetchOrders({ commit }, { query, status }) {
      const url = `/orders${query}`;
      return axios
        .get(url)
        .then(({ data }) => {
          commit('setOrders', { orders: data, status });
          return data;
        })
        .catch(({ data }) => {
          commit('setError', data);
          return data;
        });
    },
    fetchOrder({ commit }, id) {
      const url = `/orders/${id}`;
      return axios
        .get(url)
        .then(({ data }) => {
          commit('updateOrder', data);
          return data;
        })
        .catch(({ data }) => {
          commit('setError', data);
          return data;
        });
    },
    acceptOrder({ commit }, data) {
      let dataToSend = {
        id: data.id,
      };
      if (data.type === 'accept' || data.type === 'force') {
        dataToSend.isForce = data.isForce;
        dataToSend.cookingTimeInMinutes = data.cookingTimeInMinutes;
      }

      return axios({
        url: '/orders/accept',
        method: 'PATCH',
        data: dataToSend,
      })
        .then(() => {
          return data;
        })
        .catch(data => {
          try {
            commit('setError', data);
          } catch (err) {
            commit('setError', err);
          }
          return 1;
        });
    },
    rejectOrder({ commit }, data) {
      return axios({
        url: '/orders/reject',
        method: 'PATCH',
        data: {
          id: data.id,
          reason: data.reason,
        },
      })
        .then(() => {
          return data;
        })
        .catch(data => {
          try {
            commit('setError', data);
          } catch (err) {
            commit('setError', err);
          }
          return 1;
        });
    },
    readyOrder({ commit }, data) {
      return axios({
        url: '/orders/ready',
        method: 'PATCH',
        data: {
          id: data.id,
        },
      })
        .then(() => {
          return data;
        })
        .catch(data => {
          try {
            commit('setError', data);
          } catch (err) {
            commit('setError', err);
          }
          return 1;
        });
    },
    pickupOrder({ commit }, data) {
      return axios({
        url: '/orders/picked-up',
        method: 'PATCH',
        data: {
          id: data.id,
          isForce: data.isForce,
        },
      })
        .then(() => {
          return data;
        })
        .catch(data => {
          try {
            commit('setError', data);
          } catch (err) {
            commit('setError', err);
          }
          return 1;
        });
    },
    editOrderTime({ commit }, data) {
      return axios({
        url: '/orders/cooking-time',
        method: 'PATCH',
        data: {
          id: data.id,
          cookingTimeInMinutes: data.cookingTime,
        },
      })
        .then(() => {
          return data;
        })
        .catch(data => {
          try {
            commit('setError', data);
          } catch (err) {
            commit('setError', err);
          }
          return 1;
        });
    },
    validateOrder({ commit }, data) {
      return axios({
        url: '/orders/validate',
        method: 'PATCH',
        data: {
          id: data.id,
        },
      })
        .then(() => {
          return data;
        })
        .catch(data => {
          try {
            commit('setError', data);
          } catch (err) {
            commit('setError', err);
          }
          return 1;
        });
    },
    printOrder({ commit }, id) {
      return axios({
        url: '/Orders/Print',
        method: 'POST',
        data: { id },
      })
        .then(data => {
          return data;
        })
        .catch(({ data }) => {
          commit('setError', data);
          return 1;
        });
    },
  },
  getters: {
    getOrders: state => status => {
      let name = status;
      if (typeof status === 'number') {
        name = statusConvertToString(status);
      }
      return state[name.toLowerCase()];
    },
  },
};
