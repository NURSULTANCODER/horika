import axios from '../boot/axiosApi';

const initialState = {
  list: [],
  item: {},
  error: '',
  loading: false,
  activeVenueGroupId: 0,
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
    setSearch(state, result) {
      state.search = result;
    },
    clearSearch(state) {
      state.search = '';
    },
    setActiveVenueGroupId(state, id) {
      state.activeVenueGroupId = id;
    },
  },
  actions: {
    fetchList({ commit }, url = '/dealers') {
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
        .get(`/dealers/${id}`)
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
        url: '/dealers',
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
        url: '/dealers',
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
        .delete(`/dealers/${id}`)
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
    search({ commit }, url) {
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
    getSearch(state) {
      return state.search;
    },
    getActiveVenueGroupId(state) {
      return state.activeVenueGroupId;
    },
  },
};
