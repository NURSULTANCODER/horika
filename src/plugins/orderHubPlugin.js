import OrderHub from '@/boot/orderHub';

export default {
  install(Vue) {
    Vue.prototype.$orderHub = OrderHub;
  },
};
