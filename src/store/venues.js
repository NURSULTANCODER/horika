import axios from '../boot/axiosApi';
import store from '@/store/index';
import { convertTimeFromAmpm } from '@/utils';

const initialState = {
  list: [],
  item: {},
  activeVenueId: 0,
  error: '',
  loading: false,
  search: '',
  languages: [],
  deliveryMethods: [],
  idNames: [],
  menu: {},
  disableMenuItem: [],
  lastUpdateTime: '',
};

export default {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setLastUpdateTime(state, result) {
      state.lastUpdateTime = result
    },
    setLoading(state) {
      state.loading = !state.loading;
    },
    errorInfo(state, error) {
      state.error = error;
    },
    setList(state, result) {
      state.list = result;
    },
    setMenu(state, result) {
      state.menu = result;
    },
    setEnabladDish(state, id) {
      function findDish(dish) {
        if(dish.id === id) {
          dish.isEnabled = !dish.isEnabled
        }else {
          if (dish.children) {
            dish.children.forEach(item => {
              findDish(item)
            })
          }else {
            return
          }
        }
      } 
      findDish(state.menu)
    },
    setItem(state, result) {
      state.item = result;
    },
    fetchDelete(state, idDelete) {
      state.list = state.list.filter(item => item.id !== idDelete);
    },
    clearError(state) {
      state.error = '';
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    clearList(state) {
      state.list = [];
    },
    setActiveVenueId(state, id) {
      state.activeVenueId = id;
    },
    setSearch(state, result) {
      state.search = result;
    },
    clearSearch(state) {
      state.search = '';
    },
    addToList(state, item) {
      state.list.push(item);
    },
    setLanguages(state, arr) {
      state.languages = arr;
    },
    setDeliveryMethods(state, arr) {
      state.deliveryMethods = arr;
    },
    setIdNames(state, arr) {
      state.idNames = arr;
    },
    editVenueProp(state, data) {
      state.list.forEach(el => (el.id === data.venueId ? (el.status = data.status) : {}));
    },
    //get field to edit
    checkAndEditVenue(state, data) {
      //data - venueId, fieldName, value of field
      if (data.venueId === state.item.id) {
        if (data.field === 'availability') {
          state.item = {
            ...state.item,
            info: data.info,
          };
        } else if (data.field === 'schedule' || data.field.includes('schedule')) {
          let newField = data.field.split('.')[0];
          if (data.field.split('.')[1]) state.item[newField][data.field.split('.')[1]] = [...data.value];
          else state.item[newField] = [...data.value];
        }
      }
    },
    setVenueMenuLoading(state, id) {
      state.list = state.list.map(el => {
        if (el.id === id) {
          return { ...el, isLoading: true };
        }
        return el;
      });
    },
    unsetVenueMenuLoading(state, id) {
      state.list = state.list.map(el => {
        if (el.id === id) {
          return { ...el, isLoading: false };
        }
        return el;
      });
    },
  },
  actions: {
    fetchData({ commit }, url = '/venues') {
      commit('setLoading');
      return axios
        .get(url)
        .then(({ data }) => {
          commit('setList', data);
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
    fetchMenu({ commit }, id) {
      commit('setLoading');
      return axios
        .get(`/Menu?venueId=${id}`)
        .then(({ data }) => {
          commit('setMenu', data);
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
    changeMenu({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'POST',
        url: '/Menu',
        data: data,
      })
        .then(() => {
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
        .get(`/venues/${id}`)
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
        url: '/venues',
        data: data,
      })
        .then(data => {
          commit('setLoading');
          return data;
        })
        .catch(({ response }) => {
          let errorInfo = response.data.errors;
          commit('errorInfo', errorInfo);
          commit('setLoading');
          return response;
        });
    },
    changeItemToDB({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'PUT',
        url: '/venues',
        data: data,
      })
        .then(data => {
          store.commit('app/setCurrentVenue', data);
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
        .delete(`/venues/${id}`)
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
    updateMenuToDB({ commit }, id) {
      commit('setVenueMenuLoading', id);
      return axios({
        method: 'POST',
        url: '/menu',
        data: { venueId: id },
      })
        .then(data => {
          // commit('setLoading');
          commit('unsetVenueMenuLoading', id);
          return data;
        })
        .catch(({ data }) => {
          commit('errorInfo', data);
          commit('unsetVenueMenuLoading', id);
          // commit('setLoading')
        });
    },
    searchVenues({ commit }, url) {
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
    checkConnection({ commit }, data) {
      return axios({
        method: 'PATCH',
        url: '/venues/check-connection',
        data: {
          venueId: data.id,
          distributorId: data.distributorId,
        },
      })
        .then(({ data }) => {
          return data;
        })
        .catch(({ response }) => {
          let error = response.data.errors;
          commit('errorInfo', error);
          return error.alert[0];
        });
    },
    changeStatus({ commit }, data) {
      let reqData = data;
      let statusToChangeTo = reqData.currentStatus ? 'Offline' : 'Online';
      let urlToSend = `/venues/${reqData.venueId}/${statusToChangeTo}`;
      commit('setLoading');
      return axios({
        method: 'PATCH',
        url: urlToSend,
      })
        .then(({ data }) => {
          commit('editVenueProp', reqData);
          commit('checkAndEditVenue', {
            venueId: reqData.venueId,
            field: 'status',
            value: reqData.currentStatus,
          });
          store.commit('app/checkAndEditCurrentVenue', reqData);
          commit('setLoading');
          return data;
        })
        .catch(dataCatch => {
          console.log('data catch', dataCatch);
          // let error = response.data.errors
          commit('errorInfo', dataCatch);
          commit('setLoading');
          return dataCatch;
        });
    },
    changeAvailability({ commit }, data) {
      commit('setLoading');
      return axios({
        method: 'PATCH',
        url: '/venues/availability',
        data: data,
      })
        .then(({ data }) => {
          commit('setLoading');
          return data;
        })
        .catch(dataCatch => {
          console.log('data catch', dataCatch);
          commit('errorInfo', dataCatch);
          commit('setLoading');
          return dataCatch;
        });
    },
    changeSchedule({ commit }, data) {
      let reqData = data;
      let availability = [];
      for (let i of data.schedule) {
        availability.push({
          opening_day: i.opening_day,
          opening_time: convertTimeFromAmpm(i.opening_time),
          closing_day: i.closing_day,
          closing_time: convertTimeFromAmpm(i.closing_time),
        });
      }
      commit('setLoading');
      return axios({
        method: 'PATCH',
        url: `/venues/${data.venueId}/schedule`,
        data: { availability },
      })
        .then(() => {
          commit('checkAndEditVenue', {
            venueId: reqData.venueId,
            field: 'schedule.availability',
            value: reqData.schedule,
          });
          store.commit('app/checkAndEditCurrentVenue', reqData);
          commit('setLoading');
          this._vm.$notify.toast('The schedule successfully updated', {
            color: 'green',
            x: 'center',
            y: 'top',
          });
          return true;
        })
        .catch(dataCatch => {
          console.log('data catch', dataCatch);
          commit('errorInfo', dataCatch);
          commit('setLoading');
          return dataCatch;
        });
    },
    fetchLanguages({ commit }) {
      commit('setLoading');
      return axios
        .get('/Languages')
        .then(({ data }) => {
          commit('setLanguages', data);
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
    fetchDeliveryMethods({ commit }) {
      commit('setLoading');
      return axios
        .get('/delivery-methods')
        .then(({ data }) => {
          commit('setDeliveryMethods', data);
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
    fetchIdNames({ commit }, id) {
      return axios
        .get(`/venues/id-name?groupId=${id}`)
        .then(({ data }) => {
          commit('setIdNames', data);
          return data;
        })
        .catch(({ response }) => {
          let error = response.data.errors;
          commit('errorInfo', error);
          return error.alert[0];
        });
    },
  },
  getters: {
    getData(state) {
      return state.list;
    },
    getLastUpdateTime(state) {
      return state.lastUpdateTime;
    },
    getItem(state) {
      return state.item;
    },
    isLoading(state) {
      return state.loading;
    },
    getActiveVenueId(state) {
      return state.activeVenueId;
    },
    getSearch(state) {
      return state.search;
    },
    getLanguages(state) {
      return state.languages;
    },
    getDeliveryMethods(state) {
      return state.deliveryMethods;
    },
    getIdNames(state) {
      return state.idNames;
    },
    getMenu(state) {
      return state.menu;
    },
  },
};
