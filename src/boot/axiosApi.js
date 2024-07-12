import axios from 'axios';
import router from '../router';
import store from '../store';

import Vue from 'vue';
import { TOAST_TYPES } from '@/data';
import { BASE_URL } from './apiVars';

let getToken = () => {
  return store && store.state['app/userData']
    ? 'Bearer ' + store.state['app/userData'].accessToken
    : sessionStorage.getItem('token')
    ? 'Bearer ' + sessionStorage.getItem('token')
    : '';
};

let headers = {
  'Content-Type': 'application/json',
  Authorization: getToken(),
};

const httpClient = axios.create({
  baseURL: BASE_URL,
  // baseURL: 'https://delivery-api.ucs.lv/api/',
  headers: headers,
});

const errorInterceptor = error => {
  // console.log('error', error.response)
  // check if it's a server error
  if (!error.response) {
    //notify.warn('Network/Server error');
    console.error('**Network/Server error');
    console.log(error.response);
    return Promise.reject(error);
  }

  // let firstError = error.response.data && error.response.data.errors ? error.response.data.errors.alert[0] : '';

  // let firstError = error.response.data.errors.alert[0];//errorInfo[Object.keys(errorInfo)[0]][0]
  // all the other error responses
  // console.log('first error', firstError);

  let allErrorsMsg = [];
  if (error.response && error.response.data && error.response.data.errors) {
    let errorInfo = error.response.data.errors;
    let errorKeys = Object.keys(errorInfo);
    errorKeys.forEach(key => {
      allErrorsMsg.push(`${key}: ${errorInfo[key]}`);
      allErrorsMsg.push('\n');
    });
    allErrorsMsg = allErrorsMsg.join('');
  }

  switch (error.response.status) {
    case 400:
      Vue.prototype.$notify.toast(allErrorsMsg, TOAST_TYPES.ERROR);
      break;
    case 401: // authentication error, logout the user
      if (router.history.current.name !== 'login') router.push({ name: 'login' }).then(() => {});
      break;
    case 403:
      Vue.prototype.$notify.toast('Sorry, you have not access to this page', TOAST_TYPES.ERROR);
      break;
    case 500:
      Vue.prototype.$notify.toast(allErrorsMsg, TOAST_TYPES.ERROR);
      break;
    default:
      break;
  }
  return Promise.reject(error);
};

httpClient.interceptors.request.use(
  config => {
    config.headers['Authorization'] = getToken();
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use({}, errorInterceptor);
export default httpClient;
