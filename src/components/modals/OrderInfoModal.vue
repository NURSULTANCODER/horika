<template>
  <v-dialog v-model="syncedOpened" width="900" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <div class="standart-modal-card-top d-flex align-center justify-space-between pb-1 order-info-top">
        <div>
          <h3>{{ consumerName }}</h3>
          <h3 v-if="consumerPhoneNumber" class="order-phone">
            {{ consumerPhoneNumber }}
          </h3>
        </div>

        <div class="d-flex align-center">
          <h3 class="mr-2">#{{ orderNumber }}</h3>
          <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
        </div>
      </div>

      <div class="standart-modal-card-middle order-info-middle">
        <v-row>
          <v-col class="modal-card-wrapper" :cols="showScrollBtns ? '11' : '12'" ref="modalCardWrapper">
            <div ref="modalCardContent">
              <v-row v-if="consumerComment">
                <v-sheet class="order-comment">
                  <p class="ma-0">{{ consumerComment }}</p>
                </v-sheet>
              </v-row>
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <img :src="require(`@/assets/images/${isBoltOrWoltLogo}.svg`)" alt="" />
                  <h3 class="text-capitalize ml-2">
                    {{ entityOrderFields.delivery.how }}
                  </h3>
                </div>
                <Button
                  class="standart-button-content-width"
                  text="Print"
                  :is-visible="isPrintBtnVisible"
                  @handleClick="buttonClickHandler('onPrint')"
                />
              </div>

              <v-row no-gutters>
                <v-col cols="10">
                  <OrderItems
                    :orderItems="orderItems"
                    :price="entityOrderFields.price"
                    :priceCurrency="entityOrderFields.priceCurrency"
                    :isWoltOrBolt="isBoltOrWoltLogo"
                  />
                </v-col>
                <v-col cols="2" class="d-flex flex-column justify-space-between"> </v-col>
              </v-row>

              <div v-if="hasErrorMessage" class="error-info-block mt-2">
                <p>{{ orderErrorMsg }}</p>
              </div>

              <div v-if="hasErrorMessage" class="error-info-detail">
                <v-row
                  no-gutters
                  class="error-info-detail-row"
                  v-for="(error, idx) in Object.entries(this.order.error)"
                  :key="idx"
                >
                  <v-col class="error-info-detail-col" cols="4">{{ error[0] }}</v-col>
                  <v-col class="error-info-detail-col" cols="8">{{ error[1] }}</v-col>
                </v-row>
              </div>
            </div>
          </v-col>

          <v-col v-if="showScrollBtns" cols="1" class="side-scroll-btns">
            <Button
              class="pa-0"
              style="width: 50px; height: 50px"
              icon="mdi-arrow-up-thick"
              @handleClick="scrollModal('up')"
            />
            <Button
              class="pa-0 mt-1"
              style="width: 50px; height: 50px"
              icon="mdi-arrow-down-thick"
              @handleClick="scrollModal('down')"
            />
          </v-col>
        </v-row>
      </div>

      <div class="standart-modal-card-bottom d-flex justify-space-between order-info-bottom" v-if="showCardBottom">
        <template v-if="page === 1">
          <template v-if="orderState.BAD !== order.stateId">
            <Button
              v-if="orderStatus.RECEIVED === order.statusId"
              class="mr-2"
              :text="entityOrderFields.delivery.when === 'preorder' ? 'Confirm' : 'Accept'"
              @handleClick="buttonClickHandler('editOrderStatus')"
            />
            <Button
              v-if="orderStatus.PRODUCTION !== order.statusId"
              text="Reject"
              styleType="warning"
              @handleClick="buttonClickHandler('rejectOrderHandler')"
            />
          </template>
          <template
            v-else-if="
              orderState.BAD === order.stateId &&
              (orderStatus.RECEIVED === order.statusId || orderStatus.PREORDER === order.statusId)
            "
          >
            <Button class="mr-2" text="Retry" @handleClick="buttonClickHandler('retryValidateOrder')" />
            <Button class="mr-2" text="Force" @handleClick="buttonClickHandler('forceOrder')" />
            <Button
              class="mr-2"
              text="Reject"
              styleType="warning"
              @handleClick="buttonClickHandler('rejectOrderHandler')"
            />
          </template>
          <Button
            text="Ready"
            v-if="orderStatus.PRODUCTION === order.statusId"
            @handleClick="buttonClickHandler('editOrderStatus')"
          />
        </template>
        <template v-else-if="orderStatus.PREORDER === order.statusId && page === 2">
          <Button class="mr-2" text="Edit" @handleClick="buttonClickHandler('editOrderStatus')" />
          <Button text="Confirm" @handleClick="buttonClickHandler('confirmPreorder')" />
        </template>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import Button from '@/components/commonComponents/Button';
import OrderItems from '@/components/commonComponents/OrderItems';
import { ORDER_STATUS, ORDER_STATE } from '@/data';

export default {
  name: 'OrderInfoModal',
  components: {
    Button,
    OrderItems,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  props: {
    opened: Boolean,
    order: Object,
    page: Number,
    orderErrorMsg: String,
    isPrintBtnVisible: Boolean,
    entityOrder: Object,
    entityOrderFields: Object,
  },
  data() {
    return {
      orderItems: [],
      orderNumber: '',
      consumerName: '',
      consumerComment: '',
      consumerPhoneNumber: '',
      orderState: ORDER_STATE,
      orderStatus: ORDER_STATUS,
      showScrollBtns: false,
    };
  },
  mounted() {
    this.orderItems = this.entityOrder.items;
    this.orderNumber = this.entityOrderFields.orderNumber;
    this.consumerName = this.entityOrderFields.customerName;
    this.consumerComment = this.entityOrderFields.comment;
    this.consumerPhoneNumber = this.entityOrderFields.phone;
  },
  computed: {
    syncedOpened: {
      get() {
        return this.opened;
      },
      set(val) {
        return this.$emit('opened:update', val);
      },
    },
    hasErrorMessage() {
      return this.orderErrorMsg;
    },
    showCardBottom() {
      return (
        (this.page === 1 && this.orderState.BAD !== this.order.stateId) ||
        this.orderStatus.PRODUCTION === this.order.statusId ||
        (this.orderState.BAD === this.order.stateId &&
          (this.orderStatus.RECEIVED === this.order.statusId || this.orderStatus.PREORDER === this.order.statusId)) ||
        (this.orderStatus.PREORDER === this.order.statusId && this.page === 2)
      );
    },
    isBoltOrWoltLogo() {
      if (Object.prototype.hasOwnProperty.call(this.order, 'woltOrder')) {
        return 'wolt';
      }
      return 'bolt';
    },
  },
  updated() {
    this.$nextTick(() => {
      if (this.opened && this.syncedOpened) {
        this.showScrollBtns = this.$refs.modalCardContent.clientHeight >= 400;
      }
    });
  },
  methods: {
    closeModal() {
      this.syncedOpened = false;
    },
    buttonClickHandler(event) {
      this.$emit('infoModalEvent', event);
    },
    scrollModal(direction) {
      if (direction === 'up') {
        this.$refs.modalCardWrapper.scrollBy({
          top: -50,
          left: 0,
          behavior: 'smooth',
        });
      }
      if (direction === 'down') {
        this.$refs.modalCardWrapper.scrollBy({
          top: 50,
          left: 0,
          behavior: 'smooth',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.order-info-top {
  height: 84px;
}
.order-info-bottom {
  height: 100px;
}
.order-info-middle {
  max-height: 400px;
  overflow-y: hidden;
}
.arrow-button-top {
  position: sticky;
  top: 5px;
}
.arrow-button-bottom {
  position: sticky;
  bottom: 5px;
}

.order-comment {
  position: relative;
  background-color: #333;
  color: #f6f5fa;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  letter-spacing: 0.3px;
  &:after {
    content: '';
    position: absolute;
    height: 0;
    width: 0;
    top: -10px;
    left: 40px;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;

    border-bottom: 10px solid #333;
  }
}

.error-info-block {
  background-color: #f9302c;
  color: #fff;
  font-weight: 500;
  width: 100%;
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 16px;
  height: 30px;
  p {
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
  }
}

.error-info-detail {
  &-row {
    margin-bottom: 10px;
  }
  &-col {
    font-weight: bold;
  }
}

.side-scroll-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  max-height: 400px;
}

.modal-card-wrapper {
  overflow-y: auto;
  max-height: 400px;
}
</style>
