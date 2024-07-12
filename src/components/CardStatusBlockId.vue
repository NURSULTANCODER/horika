<template>
  <v-container class="px-md-4 pt-md-0" fluid>
    <h2 class="sidebar-title mb-2">{{ getCurrentRest.name }}</h2>
    <div class="order-tab-flex pr-md-4">
      <div
        v-for="data in showColumns"
        :key="data.value"
        :class="`col-lg-${data.cols} col-md-${data.mdCols}`"
        class="order-tab-content"
      >
        <div class="order-tab-header">
          <h3>
            {{ data.title }}
            <span>({{ getOrders(data.value) ? getOrders(data.value).length : 0 }})</span>
          </h3>
        </div>
        <div v-for="order in getOrders(data.value)" :key="order.id">
          <OrderCard
            :id="order.id"
            :status="order.statusId ? order.statusId : order.status && order.status.id ? order.status.id : null"
            :order="order"
            :state="order.stateId"
            :isLoading="order.isLoading"
            :page="page"
            :colValue="data.value"
            :orderErrorMsg="order.error ? (order.error.message ? order.error.message : '') : ''"
            :isCreatedInRKeeper="order.isCreatedInRKeeper"
            :adjustedTime="order.adjustedTimeInMinutes"
          />
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';

import OrderCard from '../components/OrderCard.vue';
import { CARD_STATUSES, ORDER_STATUS } from '@/data';
import notification from '../assets/notification.mp3';
import apiMixin from '../mixins/api-mixin';

export default {
  name: 'CardStatusBlockId',
  components: {
    OrderCard,
  },
  props: ['page'],
  mixins: [apiMixin],
  data() {
    return {
      orders: [],
      audio: null,
      orderStatus: ORDER_STATUS,
      order: {
        status: 1,
        cookingTimeInMinutes: 30,
      },
    };
  },
  mounted() {
    this.audio = new Audio(notification);

    let venueId = this.$route.params.id;

    for (let i in this.currentPageStatuses) {
      this.fetchOrders({
        query: `?statusId=${this.currentPageStatuses[i].value}&venueId=${venueId}`,
        status: this.currentPageStatuses[i].value,
      });
    }

    this.$orderHub.client.on('SendOrder', async id => {
      let order = await this.orderById(id);

      console.log('$orderHub SendOrder', order);

      let isSoundPlay = false;
      if ((order.statusId === 1 || order.statusId === 9) && this.getGeneralSettings.soundNotif) {
        isSoundPlay = true;
      }

      if (order.venueId === venueId) {
        this.addOrder(order);
        if (isSoundPlay) {
          this.audio.play();
        }
      }
    });
  },
  beforeDestroy() {
    this.$orderHub.client.off('SendOrder');
  },
  computed: {
    ...mapGetters({
      getOrders: 'orders/getOrders',
      getGeneralSettings: 'app/getGeneralSettings',
      getCurrentRest: 'app/getCurrentRest',
    }),
    showColumns() {
      let result = {};
      for (let i in CARD_STATUSES) {
        if (CARD_STATUSES[i].page === this.page && CARD_STATUSES[i].show) {
          result[i] = CARD_STATUSES[i];
        }
      }
      return result;
    },
    currentPageStatuses() {
      let result = {};
      for (let i in CARD_STATUSES) {
        if (CARD_STATUSES[i].page === this.page) {
          result[i] = CARD_STATUSES[i];
        }
      }
      return result;
    },
  },
  methods: {
    ...mapActions({
      fetchOrders: 'orders/fetchOrders',
    }),
    ...mapMutations({
      addOrder: 'orders/addOrder',
    }),
  },
};
</script>
<style lang="scss" scoped>
.order-tab-flex {
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  column-gap: 0.5rem;
}
</style>
