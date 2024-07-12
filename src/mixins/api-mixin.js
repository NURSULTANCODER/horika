import { mapActions } from 'vuex';
import axios from '@/boot/axiosApi';

export default {
  data() {
    return {
      isStatusChanging: false
    }
  },
  methods: {
    ...mapActions({
      acceptOrder: 'orders/acceptOrder',
      readyOrder: 'orders/readyOrder',
      pickupOrder: 'orders/pickupOrder',
    }),
    acceptOrderApi(data) {
      this.acceptOrder(data)
        .then(data => {
          if (data === 1) {
            this.isStatusChanging = false;
          }
        })
      .catch(() => {});
    },
    readyOrderApi(id) {
      this.readyOrder({
        id: id,
      })
        .then(data => {
          if (data === 1) {
            this.isStatusChanging = false;
          }
        })
        .catch(() => {
          this.isStatusChanging = false;
        });
    },
    pickupOrderApi({ id, isForce }) {
      this.pickupOrder({
        id: id,
        isForce: isForce,
      })
        .then(data => {
          if (data === 1) {
            this.isStatusChanging = false;
          }
        })
        .catch(() => {
          this.isStatusChanging = false;
        });
    },
    async orderById(id) {
      return (
        await axios({
          url: '/orders/' + id,
          method: 'GET',
        })
      ).data;
    },
  },
}