<template>
  <v-container class="px-md-4 pt-md-0" fluid>
    <h2 class="sidebar-title mb-2 d-flex align-center">
      <span class="mr-4">{{ getCurrentVenue.name }}</span>
      <v-switch v-model="isAsc" label="Ascending"></v-switch>
    </h2>
    <div class="order-tab-flex pr-md-4">
      <Container
        v-for="(data, colName) in showColumns"
        :key="data.value"
        :group-name="page === 1 ? 'orders' : colName"
        lock-axis="x"
        :should-accept-drop="shouldAcceptDrop"
        @drop="drop(colName, $event)"
        :get-child-payload="getChildPayload(colName)"
        :class="`col-lg-${data.cols} col-md-${data.mdCols}`"
        class="order-tab-content"
      >
        <div class="order-tab-header">
          <h3>
            {{ data.title }}
            <span>({{ getOrders(data.value) ? getOrders(data.value).length : 0 }})</span>
          </h3>
        </div>
        <Draggable v-for="order in getOrders(data.value)" :key="order.id + Date.now()">
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
        </Draggable>
      </Container>
    </div>
    <ProductionTimeModal
      v-model="isModalOpen"
      :order="order"
      :status="order.statusId"
      :chosenCookingTime="order.cookingTimeInMinutes"
      @acceptModal="acceptModal"
      title="Production time"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { Container, Draggable } from 'vue-smooth-dnd';

import OrderCard from '../components/OrderCard.vue';
import { CARD_STATUSES, ORDER_STATUS, TOAST_TYPES } from '@/data';
import ProductionTimeModal from './modals/ProductionTimeModal.vue';
import notification from '../assets/notification.mp3';
import apiMixin from '../mixins/api-mixin';

export default {
  name: 'CardStatusBlock',
  components: {
    OrderCard,
    Container,
    Draggable,
    ProductionTimeModal,
  },
  props: ['page'],
  mixins: [apiMixin],
  data() {
    return {
      orders: [],
      audio: null,
      showDragContainer: false,
      orderStatus: ORDER_STATUS,
      isModalOpen: false,
      order: {
        status: 1,
        cookingTimeInMinutes: 30,
      },
      isAsc: false,
    };
  },
  watch: {
    isAsc(val) {
      this.getAllOrders(val);
    },
  },
  mounted() {
    this.audio = new Audio(notification);
    setTimeout(() => {
      this.showDragContainer = true;
    }, 3000);

    let venueId = this.getUserData.venueId;

    for (let i in this.currentPageStatuses) {
      let fetchQuery = {
        query: `?statusId=${this.currentPageStatuses[i].value}&isAsc=${this.isAsc}`,
        status: this.currentPageStatuses[i].value,
      };
      if (this.getRoles[0].toLowerCase() === 'operator' || this.getRoles[0].toLowerCase() === 'manager')
        fetchQuery.query += `&venueId=${venueId}`;
      this.fetchOrders(fetchQuery);
    }

    this.$orderHub.client.on('SendOrder', async id => {
      let order = await this.orderById(id);
      console.log('$orderHub SendOrder', order);
      let isSoundPlay = false;
      if ((order.statusId === 1 || order.statusId === 9) && this.getGeneralSettings.soundNotif) {
        isSoundPlay = true;
      }

      if (this.getRoles[0] === 'Operator' || this.getRoles[0] === 'Manager') {
        if (order.venueId === this.getUserData.venueId) {
          this.addOrder(order);

          if (isSoundPlay) {
            this.audio.play();
          }
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
      getRoles: 'app/getRoles',
      getCurrentVenue: 'app/getCurrentVenue',
      getGeneralSettings: 'app/getGeneralSettings',
      getUserData: 'app/getUserData',
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
      fetchOrder: 'orders/fetchOrder',
    }),
    ...mapMutations({
      addOrder: 'orders/addOrder',
      setLoading: 'orders/setLoading',
    }),
    getAllOrders(isAsc) {
      let venueId = this.getUserData.venueId;

      for (let i in this.currentPageStatuses) {
        let fetchQuery = {
          query: `?statusId=${this.currentPageStatuses[i].value}&isAsc=${isAsc}`,
          status: this.currentPageStatuses[i].value,
        };
        if (this.getRoles[0].toLowerCase() === 'operator' || this.getRoles[0].toLowerCase() === 'manager')
          fetchQuery.query += `&venueId=${venueId}`;
        this.fetchOrders(fetchQuery);
      }
    },
    getChildPayload(status) {
      return index => {
        return this.getOrders(status)[index - 1];
      };
    },
    shouldAcceptDrop(options, payload) {
      let isWoltLicensed = this.getCurrentVenue.isWoltLicensed;
      let isBoltLicensed = this.getCurrentVenue.isBoltLicensed;

      let orderType = '';

      if (Object.prototype.hasOwnProperty.call(payload, 'woltOrder')) {
        orderType = 'woltOrder';
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'boltOrder')) {
        orderType = 'boltOrder';
      }

      if (!isBoltLicensed && orderType === 'boltOrder') {
        this.$notify.toast('Bolt license is expired!', TOAST_TYPES.ERROR);
        return false;
      }

      if (!isWoltLicensed && orderType === 'woltOrder') {
        this.$notify.toast('Wolt license is expired!', TOAST_TYPES.ERROR);
        return false;
      }

      return true;
    },
    drop(status, dropResults) {
      if (dropResults.payload.statusId && dropResults.addedIndex) {
        if (CARD_STATUSES[status].value !== dropResults.payload.statusId) {
          let orderData = dropResults.payload;
          this.order = orderData;
          if (orderData.statusId === ORDER_STATUS.RECEIVED) {
            this.isModalOpen = true;
          } else {
            this.setLoading({
              value: true,
              id: orderData.id,
              status: orderData.statusId,
            });
            this.dropAcceptOrderStatus({
              order: orderData,
              cookingTime: null,
            });
          }
        }
      }
    },
    dropAcceptOrderStatus({ order, cookingTime }) {
      if (this.orderStatus.RECEIVED === order.statusId) {
        let dataToSend = {
          id: order.id,
          isForce: false,
          type: 'accept',
          cookingTimeInMinutes: cookingTime,
          status: order.statusId,
        };
        this.acceptOrderApi(dataToSend);
      }

      if (this.orderStatus.PRODUCTION === order.statusId) {
        this.readyOrderApi(order.id);
      }

      if (this.orderStatus.READY === order.statusId) {
        this.pickupOrderApi({ id: order.id, isForce: false });
      }
    },
    acceptModal(data) {
      this.setLoading({
        value: true,
        id: data.order.id,
        status: data.order.statusId,
      });
      this.dropAcceptOrderStatus(data);
      this.isModalOpen = false;
    },
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

.card-ghost {
  transition: transform 0.18s ease;
  transform: rotateZ(5deg);
}

.card-ghost-drop {
  transition: transform 0.18s ease-in-out;
  transform: rotateZ(0deg);
}
</style>
