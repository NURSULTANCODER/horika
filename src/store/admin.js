import axios from '../boot/axiosApi';

const initialState = {
  list: [],
  item: {},
  error: '',
  loading: false,
};

export default {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setLoading(state) {
      state.loading = !state.loading;
    },
    errorInfo(state, error) {
      state.error = error;
    },
    setList(state, result) {
      state.list = result;
    },
    setItem(state, result) {
      state.item = result;
    },
    fetchDelete(state, idDelete) {
      state.data = state.data.filter(item => item.id !== idDelete);
    },
    clearError(state) {
      state.error = '';
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
  },
  actions: {
    fetchList({ commit }, url = '/admins') {
      commit('setLoading');
      return axios
        .get(url)
        .then(({ data }) => {
          commit('setList', data);
          commit('setLoading');
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
          commit('setLoading');
        });
    },
    fetchItem({ commit }, id) {
      commit('setLoading');
      return axios
        .get(`/admins/${id}`)
        .then(data => {
          commit('setItem', data.data);
          commit('setLoading');
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
        });
    },
    addItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'POST',
        url: '/admins',
        data: data,
      })
        .then(data => {
          commit('setLoading');
          return data;
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
        });
    },
    changeItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'PUT',
        url: '/admins',
        data: data,
      })
        .then(data => {
          commit('setLoading');
          return data;
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
        });
    },
    deleteItem({ commit }, id) {
      return axios
        .delete(`/admins/${id}`)
        .then(data => {
          commit('fetchDelete', id);
          commit('setLoading');
          console.log('data in store delete', data);
          return data;
        })
        .catch(({ data }) => {
          console.log('data in store error delete', data);
          commit('errorInfo', data);
          commit('setLoading');
        });
    },
  },
  getters: {
    getList(state) {
      return state.list;
    },
    getItem(state) {
      return state.item;
    },
    isLoading(state) {
      return state.isLoading;
    },
  },
};
