import axios from '../boot/axiosApi';
import router from '../router';
import { ROLES_SETTINGS } from '@/data';
import OrderHub from '@/boot/orderHub';
import store from '@/store/index';

const initialState = {
  userData: {}, // combination of data about user and tokens
  currentVenue: {}, // only for current user (for managers and operators)
  currentRest: {},
  lang: 'en', // feature
  isLoading: false,
  isAuth: false,
  isInit: false,
  soundNotif: true,
  generalSettings: {
    timeFormat: 1, // 1 - 12 hours, 2 - 24 hours
    dateSeparator: '.',
    dateOrder: 1, // 1 - 'DD MM YYYY', 'MM DD YYYY',
    orderCardMode: 1, // 1 - expanded, 2 - popup
  },
  showExpLicenseMsg: false,
};

export default {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setLoading(state) {
      state.isLoading = !state.isLoading;
    },
    setUserData(state, data) {
      state.userData = { ...data };
      this.dispatch('venues/fetchLanguages');
      this.dispatch('venues/fetchDeliveryMethods');
    },
    setAuth(state, value) {
      state.isAuth = value;
    },
    setCurrentVenue(state, data) {
      if (!state.currentVenue.id || (state.currentVenue.id && data.id === state.currentVenue.id))
        state.currentVenue = { ...data };
    },
    checkAndEditCurrentVenue(state, data) {
      if (data.venueId === state.currentVenue.id) {
        state.currentVenue = {
          ...state.currentVenue,
          info: data.info,
        };
      }
    },
    setInit(state) {
      state.isInit = !state.isInit;
    },
    logout(state) {
      state.userData = {};
      state.isAuth = false;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refresh');
      sessionStorage.removeItem('isFirstLoad');
      OrderHub.stop();
      store.commit('app/clearState');
      store.commit('admin/clearState');
      store.commit('dealers/clearState');
      store.commit('managers/clearState');
      store.commit('operators/clearState');
      store.commit('venueGroups/clearState');
      store.commit('venues/clearState');
      store.commit('orders/resetOrders');
      store.commit('licRequests/clearState');
      router
        .push({ name: 'login' })
        .then(() => {})
        .catch(err => {
          console.log('logout err ', err);
        });
    },
    setGeneralSettings(state, data) {
      let newData = { ...data };
      if (newData.soundNotif !== undefined) {
        state.soundNotif = newData.soundNotif;
        delete newData.soundNotif;
      }
      state.generalSettings = { ...newData };
      localStorage.setItem('settings', JSON.stringify(data));
    },
    setSoundNotifSetting(state, val) {
      state.soundNotif = val;

      let storageSettings = localStorage.getItem('settings');
      if (storageSettings) {
        storageSettings = {
          ...JSON.parse(storageSettings),
          soundNotif: val,
        };
        localStorage.setItem('settings', JSON.stringify(storageSettings));
      }
    },
    changeShowExpMsg(state, val) {
      state.showExpLicenseMsg = val;
    },
    setCurrentRest(state, data) {
      state.currentRest = data;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
  },
  actions: {
    login({ dispatch, commit }, { login, password }) {
      commit('setLoading');
      return axios({
        method: 'POST',
        url: '/Token/Access',
        data: {
          userName: login,
          password: password,
        },
      })
        .then(({ data }) => {
          commit('setUserData', { ...data });
          sessionStorage.setItem('token', data.accessToken);
          sessionStorage.setItem('refresh', data.refreshToken);
          dispatch('aboutMe');
        })
        .catch(err => {
          console.error('Error in auth/login action: ' + err);
          commit('setLoading');
          commit('setAuth', false);
          commit('changeShowExpMsg', false);
          this._vm.$notify.toast('Login or password are incorrect. Please try again.', {
            color: 'red',
            x: 'center',
            y: 'top',
          });
          sessionStorage.setItem('isFirstLoad', 'false');
        });
    },
    refreshToken({ dispatch, commit, state }, token = '') {
      sessionStorage.setItem('isFirstLoad', 'false');
      commit('setLoading');
      let refreshToken = token ? token : state.userData.refreshToken.toString();
      return axios({
        method: 'POST',
        url: '/Token/Refresh',
        data: {
          refreshToken: refreshToken,
        },
      })
        .then(data => {
          commit('setUserData', { ...data.data });
          sessionStorage.setItem('token', data.data.accessToken);
          sessionStorage.setItem('refresh', data.data.refreshToken);
          dispatch('aboutMe');
          commit('setInit');
          commit('setLoading');
          return true;
        })
        .catch(err => {
          console.error('Error in auth/refreshToken action: ' + err);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refresh');
          commit('setAuth', false);
          commit('changeShowExpMsg', false);
          commit('setLoading');
          commit('setInit');
          return false;
        });
    },
    initialize({ dispatch, commit }) {
      commit('setLoading');
      sessionStorage.setItem('isFirstLoad', 'false');
      return axios({
        method: 'GET',
        url: '/Users/AboutMe',
      })
        .then(({ data }) => {
          commit('setUserData', {
            ...data,
            accessToken: sessionStorage.getItem('token'),
            refreshToken: sessionStorage.getItem('refresh'),
          });
          if (data.roleNames[0].toLowerCase() === 'manager' || data.roleNames[0].toLowerCase() === 'operator')
            dispatch('fetchCurrentVenue');
          else {
            commit('setAuth', true);
            OrderHub.start();

            commit('setInit');
            commit('setLoading');
          }
          return true;
        })
        .catch(err => {
          console.error('Error in auth/initAuth action: ' + err);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refresh');
          commit('setAuth', false);
          commit('changeShowExpMsg', false);
          commit('setLoading');
          commit('setInit');
          return false;
        });
    },
    aboutMe({ dispatch, commit, state }) {
      return axios({
        method: 'GET',
        url: '/Users/AboutMe',
        // url: '/' + role + '/AboutMe',
      })
        .then(({ data }) => {
          commit('setUserData', { ...state.userData, ...data });
          if (data.roleNames[0].toLowerCase() === 'manager' || data.roleNames[0].toLowerCase() === 'operator')
            dispatch('fetchCurrentVenue');
          else {
            commit('setAuth', true);
            commit('changeShowExpMsg', true);
            OrderHub.start();
            commit('setLoading');
            sessionStorage.setItem('isFirstLoad', 'false');
            router
              .push({
                name: ROLES_SETTINGS[data.roleNames[0]].startPage,
              })
              .then(() => {});
          }
        })
        .catch(err => {
          commit('setLoading');
          console.error('Error in app/aboutMe action: ' + err);
        });
    },
    fetchCurrentVenue({ commit, state }) {
      return axios({
        method: 'GET',
        url: '/Venues/' + state.userData.venueId,
      })
        .then(({ data }) => {
          commit('setCurrentVenue', data);

          commit('setAuth', true);
          commit('changeShowExpMsg', true);
          OrderHub.start();
          sessionStorage.setItem('isFirstLoad', 'false');
          commit('setLoading');
          if (router.history.current.name === 'login')
            router
              .push({
                name: ROLES_SETTINGS[state.userData.roleNames[0]].startPage,
              })
              .then(() => {});

          return true;
        })
        .catch(err => {
          console.error('Error in app/fetchCurrentVenue action: ' + err);
          if (state.isLoading === true) commit('setLoading');
          return false;
        });
    },
    changeCurrentVenue({ commit }, data) {
      commit('setCurrentVenue', data);
    },
  },
  getters: {
    getLoading(state) {
      return state.isLoading;
    },
    getAuth(state) {
      return state.isAuth;
    },
    getRoles(state) {
      return state.userData.roleNames;
    },
    getVenue(state) {
      return state.userData.venue;
    },
    getCurrentVenue(state) {
      return state.currentVenue;
    },
    getUserData(state) {
      return state.userData;
    },
    getInit(state) {
      return state.isInit;
    },
    getGeneralSettings(state) {
      return { ...state.generalSettings, soundNotif: state.soundNotif };
    },
    getShowExpMsg(state) {
      return state.showExpLicenseMsg;
    },
    getCurrentRest(state) {
      return state.currentRest;
    },
  },
};
