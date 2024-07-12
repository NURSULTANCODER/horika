import axios from '../boot/axiosApi';

const initialState = {
  list: [],
  item: {},
  error: '',
  loading: false,
  activeVenueGroupId: null,
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
    setData(state, result) {
      state.list = result;
    },
    setItem(state, result) {
      state.item = result;
    },
    setList(state, result) {
      state.list = result;
    },
    fetchDelete(state, idDelete) {
      state.list = state.list.filter(item => {
        return item.id !== idDelete;
      });
    },
    changeItem(state, venueGroup) {
      state.list = state.list.map(item => {
        if (item.id === venueGroup.id) {
          return venueGroup;
        }
        return item;
      });
    },
    clearError(state) {
      state.error = '';
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    addToList(state, item) {
      state.list.push(item);
    },
    setActiveVenueGroupId(state, id) {
      state.activeVenueGroupId = id;
    },
  },
  actions: {
    fetchData({ commit }, url = '/VenueGroups') {
      commit('setLoading');
      return axios
        .get(url)
        .then(({ data }) => {
          commit('setData', data);
          commit('setLoading');
          return data;
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
          commit('setLoading');
        });
    },
    fetchItem({ commit }, id) {
      commit('setLoading');
      return axios
        .get(`/VenueGroups/${id}`)
        .then(data => {
          commit('setItem', data.data);
          commit('setLoading');
          return data.data;
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
          commit('setLoading');
        });
    },
    addItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'POST',
        url: '/VenueGroups',
        data: data,
      })
        .then(data => {
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
    changeItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'PUT',
        url: '/VenueGroups',
        data: data,
      })
        .then(info => {
          commit('setLoading');
          commit('changeItem', data);
          return info;
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
          commit('setLoading');
        });
    },
    deleteItem({ commit }, id) {
      commit('setLoading');
      return axios
        .delete(`/VenueGroups/${id}`)
        .then(data => {
          commit('fetchDelete', id);
          commit('setLoading');
          return data;
        })
        .catch(({ data }) => {
          commit('errorInfo', data.errors);
          commit('setLoading');
        });
    },
    searchVenueGroup({ commit }, url) {
      commit('setLoading');
      return axios
        .get(url)
        .then(({ data }) => {
          commit('setData', data);
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
    getData(state) {
      return state.list;
    },
    getItem(state) {
      return state.item;
    },
    isLoading(state) {
      return state.isLoading;
    },
    getActiveVenueGroupId(state) {
      return state.activeVenueGroupId;
    },
  },
};
