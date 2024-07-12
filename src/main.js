import Vue from 'vue';

import VuetifyDialog from 'vuetify-dialog';
import notify from 'vuetify-notify';
import 'vuetify-dialog/dist/vuetify-dialog.css';

import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import OrderHubPlugin from './plugins/orderHubPlugin';
import DatetimePicker from 'vuetify-datetime-picker';
import * as dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import './assets/style.scss';

Vue.use(OrderHubPlugin);
Vue.use(DatetimePicker);

Vue.use(notify, {
  vuetify,
  options: {
    toast: {},
    dialog: {},
  },
});

Vue.use(VuetifyDialog, {
  context: {
    vuetify,
  },
  confirm: {
    actions: {
      false: {
        text: 'Cancel',
        color: 'error',
      },
      true: {
        text: 'Yes',
        color: 'primary',
      },
    },
  },
});

Vue.config.productionTip = false;

dayjs.extend(localizedFormat);
dayjs.extend(utc);

export default dayjs;

new Vue({
  router,
  store,
  vuetify,
  notify,
  render: h => h(App),
}).$mount('#app');
