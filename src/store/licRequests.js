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
    clearError(state) {
      state.error = '';
    },
    fetchDelete(state, idDelete) {
      state.list = state.list.filter(item => item.id !== idDelete);
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    addToList(state, item) {
      state.list.push(item);
    },
    clearSearch(state) {
      state.search = '';
    },
  },
  actions: {
    fetchList({ commit }, url = '/lic-requests') {
      commit('setLoading');
      return axios
        .get(url)
        .then(({ data }) => {
          commit('setList', data);
          commit('setLoading');
        })
        .catch(({ response }) => {
          let error = response.data.errors;
          commit('errorInfo', error);
          commit('setLoading');
          return error.alert[0];
        });
    },
    fetchItem({ commit }, id) {
      commit('setLoading');
      return axios
        .get(`/lic-requests/${id}`)
        .then(data => {
          commit('setItem', data.data);
          commit('setLoading');
          return data.data;
        })
        .catch(({ response }) => {
          let error = response.data.errors;
          commit('errorInfo', error);
          commit('setLoading');
          return error.alert[0];
        });
    },
    addItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'POST',
        url: '/lic-requests',
        data: data,
      })
        .then(data => {
          commit('setLoading');
          return data;
        })
        .catch(({ response }) => {
          let errorInfo = response.data.errors;
          let errors = errorInfo[Object.keys(errorInfo)[0]];
          commit('errorInfo', errors);
          commit('setLoading');
          return errors;
        });
    },
    changeItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'PUT',
        url: '/lic-requests',
        data: data,
      })
        .then(data => {
          commit('setLoading');
          return data;
        })
        .catch(({ response }) => {
          let error = response.data.errors;
          commit('errorInfo', error);
          commit('setLoading');
          return error.alert[0];
        });
    },
    deleteItem({ commit }, id) {
      commit('setLoading');
      return axios
        .delete(`/lic-requests/${id}`)
        .then(data => {
          commit('fetchDelete', id);
          commit('setLoading');
          return data;
        })
        .catch(data => {
          commit('errorInfo', data);
          commit('setLoading');
          return data;
        });
    },
    changeSettings({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'PATCH',
        url: `/lic-requests/settings`,
        data: data,
      })
        .then(data => {
          commit('setLoading');
          return data;
        })
        .catch(({ response }) => {
          let errorInfo = response.data.errors;
          let errors = errorInfo[Object.keys(errorInfo)[0]];
          commit('errorInfo', errors);
          commit('setLoading');
          return errors;
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
      return state.loading;
    },
  },
};
