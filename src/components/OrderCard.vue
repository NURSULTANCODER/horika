<template>
  <div>
    <div
      v-if="orderStatus.READY !== status"
      class="order-card mb-4"
      :id="id"
      :class="isStatusChanging ? 'overlay' : ''"
      @click="onCardClickHandler"
      :style="orderBackColor"
    >
      <div v-if="hasErrorMessage" class="error-info-block">
        <p>{{ orderErrorMsg }}</p>
      </div>
      <div v-if="hasErrorMessage && isOpen" class="error-info-detail">
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
      <div>
        <p class="font-weight-bold" v-if="isPreorder">PRE-ORDER</p>
      </div>
      <v-row no-gutters>
        <v-col :cols="order.isCreatedInRKeeper && (order.statusId === 6 || order.statusId === 7) ? 9 : 10">
          <h3 class="order-title mb-1">{{ consumerName }}</h3>
          <span v-if="isOpen" class="order-phone">{{ phone }}</span>
        </v-col>

        <v-col cols="2" class="text-center pr-2">
          <span class="order-title d-flex justify-end">#{{ orderNumber }}</span>
        </v-col>

        <v-col v-if="order.isCreatedInRKeeper && (order.statusId === 6 || order.statusId === 7)" cols="1">
          <v-icon large color="red"> mdi-alert-circle </v-icon>
        </v-col>
      </v-row>

      <v-row class="mt-0">
        <v-col class="mt-2" cols="7">
          <p v-if="!isOpen" class="order-price-items">
            <v-chip v-if="status === 1" :class="consumerComment ? 'mr-1' : 'mr-4'" text-color="white" color="green"
              >new</v-chip
            >
            <v-chip v-if="isCommentExist" class="mx-1 mr-4" color="blue darken-2" text-color="white">
              <v-icon color="white darken-2"> mdi-comment-processing </v-icon>
            </v-chip>
            <span v-if="orderItems"
              >{{ orderItems.length }}
              <span v-if="orderItems.length < 2">item</span>
              <span v-else>items</span>
            </span>
            <span v-if="price"
              >{{ price }} <span class="text-uppercase">{{ priceCurrency }}</span></span
            >
          </p>
          <div :class="isOpen ? '' : 'order-type-closed mt-6'" class="order-type d-flex align-center mb-2">
            <img :src="require(`@/assets/images/${isBoltOrWoltLogo}.svg`)" alt="" />
            <h4 class="text-capitalize">{{ deliveryHow }}</h4>
          </div>
        </v-col>
        <v-col class="d-flex flex-column justify-start align-end">
          <template v-if="pickupEta">
            <v-progress-circular
              v-if="status === 1 || status === 10 || status === 2"
              :rotate="-90"
              :size="50"
              :width="6"
              :value="progressTime.diffValue"
              :color="timerColor"
              class="float-right mr-2"
            >
              {{ progressTime.showValue }}
            </v-progress-circular>
          </template>
          <span class="mt-2" v-if="timeToShow">{{ timeToShow }}</span>
          <template v-if="isAsap">
            <span class="mt-2 font-weight-bold">ASAP</span>
          </template>
        </v-col>
      </v-row>

      <v-row v-if="isOpen" class="mt-4 mb-4" no-gutters>
        <v-col v-if="consumerComment" cols="12" lg="9">
          <v-sheet class="order-comment">
            <p class="ma-0">{{ consumerComment }}</p>
          </v-sheet>
        </v-col>
        <v-col :cols="isPrintBtnVisible ? 9 : 12" class="d-flex justify-space-between mt-lg-0 mt-2"> </v-col>
        <v-col :cols="isPrintBtnVisible ? 3 : 0" v-if="isPrintBtnVisible">
          <Button text="Print" :is-visible="isPrintBtnVisible" @handleClick="onPrint" />
        </v-col>
      </v-row>

      <Button
        class="mb-4 mt-3"
        :text="deliveryWhen === 'preorder' ? 'Confirm' : 'Accept'"
        :isDisabled="isStatusChanging"
        @handleClick="editOrderStatus"
        v-if="orderState.BAD !== state && orderStatus.RECEIVED === status && page === 1"
      />

      <Button
        class="mt-3"
        text="Edit"
        :isDisabled="isStatusChanging"
        @handleClick="editOrderStatus"
        v-if="orderStatus.PREORDER === status && page === 2 && isOpen"
      />

      <Button
        class="mt-3"
        text="Confirm"
        :isDisabled="isStatusChanging"
        @handleClick="confirmPreorder"
        v-if="orderStatus.PREORDER === status && page === 2 && isOpen"
      />

      <div v-if="page == 1 || (page == 2 && status === 10)">
        <div v-if="page == 1">
          <Button
            class="mb-4 mt-3"
            text="Ready"
            :isDisabled="isStatusChanging"
            v-if="orderStatus.PRODUCTION === status"
            @handleClick="editOrderStatus"
          />
          <template
            v-if="(orderStatus.RECEIVED === status || orderStatus.PREORDER === status) && orderState.BAD === state"
          >
            <v-row>
              <v-col v-if="!order.isCreatedInRKeeper || state === 2">
                <Button class="mb-4" text="Retry" :isDisabled="isStatusChanging" @handleClick="retryValidateOrder" />
              </v-col>
              <v-col>
                <Button class="mb-4" text="Force" :isDisabled="isStatusChanging" @handleClick="forceOrder" />
              </v-col>
            </v-row>
            <Button
              class="mb-4"
              text="Reject"
              styleType="danger"
              :isDisabled="isStatusChanging"
              @handleClick="rejectOrderHandler"
              v-if="orderStatus.PRODUCTION !== status"
            />
          </template>
        </div>

        <div v-if="isOpen" class="my-4">
          <Button
            class="mb-4"
            text="Reject"
            styleType="warning"
            :isDisabled="isStatusChanging"
            @handleClick="rejectOrderHandler"
            v-if="orderState.BAD !== state && orderStatus.PRODUCTION !== status && page === 1"
          />
          <p class="mt-4 order-price-items">
            <span v-if="orderItems"
              >{{ orderItems.length }}
              <span v-if="orderItems.length < 2">item</span>
              <span v-else>items</span>
            </span>
            <span v-if="price"
              >{{ price }} <span class="text-uppercase">{{ priceCurrency }}</span></span
            >
          </p>
          <div v-for="item in orderItems" :key="item.id" class="order-product-item mb-2">
            <span>{{ item.count || item.qty }} x </span><span>{{ item.name }}</span><span class="text-uppercase"> ({{ getItemPrice(item) }})</span>
            <div v-if="item.user_note" class="order-product-item-comment">{{ item.user_note }}</div>
            <template v-if="item.options.length > 0">
              <p class="pl-4 mt-2 mb-2">OPTIONS:</p>
              <p class="pl-4 mt-2 mb-2" v-for="option in item.options" :key="option.id">
                <span v-if="!(/\d\sx\s/.test(option.value) || /\d\sx\s/.test(option.name))">{{ option.count || option.qty }} x </span>
                <span>{{ option.value || option.name }}</span>
                <span class="text-uppercase"> ({{ getOptionPrice(option) }})</span>
              </p>
            </template>
          </div>
        </div>
      </div>
      <div v-if="isStatusChanging" class="overlay-loader">
        <v-progress-circular :size="100" :width="10" color="primary" indeterminate></v-progress-circular>
      </div>
    </div>

    <div
      v-if="orderStatus.READY === status"
      class="order-card-small mb-4 allow-click"
      @click="onCardClickHandler"
      :style="orderBackColor"
      :class="isStatusChanging ? 'overlay' : ''"
    >
      <div>
        <p class="font-weight-bold" v-if="deliveryWhen === 'preorder'">PRE-ORDER</p>
      </div>
      <v-row class="mb-2" no-gutters>
        <v-col>
          <span class="order-title">#{{ orderNumber }}</span>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <div class="order-success-icon">
            <v-icon> mdi-check </v-icon>
          </div>
        </v-col>
      </v-row>
      <h3 class="order-title mb-2">{{ consumerName }}</h3>
      <div class="order-type order-type-closed mb-2 d-flex align-center">
        <img :src="require(`@/assets/images/${isBoltOrWoltLogo}.svg`)" alt="" />
        <h4 class="text-capitalize">{{ deliveryHow }}</h4>
      </div>
      <Button
        class="mb-2"
        text="Pick up"
        :isDisabled="isStatusChanging"
        v-if="orderState.GOOD === state"
        @handleClick="editOrderStatus"
      />
      <template v-else>
        <Button
          v-if="order.isCreatedInRKeeper"
          class="mb-2"
          text="Retry"
          :isDisabled="isStatusChanging"
          @handleClick="retryOrder"
        />
        <Button text="Force" :isDisabled="isStatusChanging" @handleClick="forceOrder" />
      </template>
      <div v-if="isStatusChanging" class="overlay-loader">
        <v-progress-circular :size="70" :width="5" color="primary" indeterminate></v-progress-circular>
      </div>
    </div>
    <ProductionTimeModal
      v-model="isModalOpen"
      :status="status"
      :order="order"
      :entityOrder="entityOrder"
      :entityOrderFields="entityOrderFields"
      :chosenCookingTime="order.cookingTimeInMinutes"
      :defaultCookingTime="defaultCookingTime"
      :isBoltOrWoltOrder="isBoltOrWoltOrder"
      @acceptModal="acceptModal"
      title="Production time"
    />
    <OrderInfoModal
      v-model="isOrderInfoModalOpen"
      :order="order"
      :entityOrder="entityOrder"
      :entityOrderFields="entityOrderFields"
      :page="page"
      :orderErrorMsg="orderErrorMsg"
      :isPrintBtnVisible="isPrintBtnVisible"
      @infoModalEvent="infoModalHandler"
    />
  </div>
</template>

<script>
import dayjs from '@/main.js';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { ORDER_STATUS, ORDER_STATE, TOAST_TYPES } from '@/data';
import Button from '@/components/commonComponents/Button';
import ProductionTimeModal from './modals/ProductionTimeModal.vue';
import OrderInfoModal from './modals/OrderInfoModal.vue';
import apiMixin from '../mixins/api-mixin';
import dateFormat from '../mixins/date-format';

export default {
  name: 'OrderCard',
  components: { Button, ProductionTimeModal, OrderInfoModal },
  props: {
    id: {
      type: String,
    },
    order: {
      type: Object,
    },
    draggable: {
      type: Boolean,
    },
    status: {
      type: Number,
      default: 0,
    },
    state: {
      type: Number,
    },
    page: {
      type: Number,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    colValue: {
      type: Number,
    },
    orderErrorMsg: {
      type: String,
      default: '',
    },
    isCreatedInRKeeper: {
      type: Boolean,
    },
    adjustedTime: {
      type: Number,
    },
  },
  mixins: [apiMixin, dateFormat],
  data() {
    return {
      isOpen: false,
      orderStatus: ORDER_STATUS,
      isStatusChanging: false,
      orderState: ORDER_STATE,
      consumerName: '',
      orderNumber: '',
      consumerComment: '',
      orderItems: [],
      price: '',
      phone: '',
      deliveryHow: '',
      deliveryWhen: '',
      priceCurrency: '',
      isModalOpen: false,
      isOrderInfoModalOpen: false,
      buttonPressed: '',
      autoAcceptTime: 0, // seconds/minutes until date auto accept
      timerDiffSec: 0,
      updatedCookingTime: 0,
      defaultCookingTime: 0,
      pickupEta: 0,
      modifiedTime: 0,
      progressTime: {
        diffValue: 0,
        showValue: 0,
      },
      cookingTime: 0,
      dateTimeFormats: {
        dateOrder: 0,
        dateSeparator: '.',
        timeFormat: 0,
      },
      showExpiredAlert: false,
      expiredAlertMsg: '',
      entityOrder: '',
      entityOrderFields: {
        customerName: '',
        comment: '',
        phone: '',
        orderNumber: '',
        price: '',
        priceCurrency: '',
        pickupEta: '',
        delivery: {
          how: '',
          when: '',
        },
      },
      isCommentExist: false
    };
  },
  mounted() {

    if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'pre_order')) {
      this.pickupEta = this.entityOrder.pre_order.preorder_time;
    }
    if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'pickup_eta')) {
      this.pickupEta = this.entityOrder.pickup_eta;
    }
    if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'due_datetime')) {
      this.pickupEta = this.entityOrder.due_datetime;
    }

    let settings;

    if (Object.prototype.hasOwnProperty.call(this.getCurrentVenue, 'settings')) {
      settings = this.getCurrentVenue.settings.venueSelfSettings;
    }

    if (Object.prototype.hasOwnProperty.call(this.getCurrentRest, 'settings')) {
      settings = this.getCurrentRest.settings.venueSelfSettings;
    }

    if (settings) {
      this.timerDiffSec = settings.autoAcceptTimeInSeconds;
      this.cookingTime = this.order.cookingTimeInMinutes;
      this.defaultCookingTime = settings.defaultCookingTimeInMinutes;

      if (this.orderStatus.RECEIVED === this.status) {
        if (settings.isAutoAcceptEnabled) this.timerDiffSec = settings.autoAcceptTimeInSeconds;
        else this.timerDiffSec = 180;

        this.autoAcceptTime = Math.floor(
          dayjs.utc(this.order.createUtc).local().add(this.timerDiffSec, 'second').diff(dayjs()) / 1000,
        );
        this.progressTime.showValue = this.timerShowTime(this.autoAcceptTime);
        this.progressTime.diffValue = Math.floor(100 * ((this.timerDiffSec - this.autoAcceptTime) / this.timerDiffSec));
        this.timerTick('autoAcceptTime');
      }

      if (this.orderStatus.PREORDER === this.status) {
        this.updatePreorderTimer();
      }

      if (this.orderStatus.PRODUCTION === this.status) {
        let tillTime = dayjs.utc(this.pickupEta).local();
        let modTime = dayjs.utc(this.modifiedTime).local();

        this.timerDiffSec = tillTime.subtract(modTime).unix();

        this.autoAcceptTime = dayjs.utc(this.pickupEta).local().subtract(dayjs()).unix();
        this.progressTime.showValue = this.timerShowTime(this.autoAcceptTime);
        this.progressTime.diffValue = Math.floor(100 * ((this.timerDiffSec - this.autoAcceptTime) / this.timerDiffSec));

        this.timerTick('autoAcceptTime');
      }
    }
  },
  computed: {
    ...mapGetters({
      getCurrentVenue: 'app/getCurrentVenue',
      getRoles: 'app/getRoles',
      getGeneralSettings: 'app/getGeneralSettings',
      getCurrentRest: 'app/getCurrentRest',
    }),
    orderBackColor() {
      return this.orderState.BAD === this.state ? 'background-color: #ffe6e6' : '';
    },
    timerColor() {
      let color = '';
      switch (this.status) {
        case 1:
          color = 'red';
          break;
        case 2:
          if (this.autoAcceptTime >= 300) return 'green';
          else if (this.autoAcceptTime < 300 && this.autoAcceptTime >= 60) return '#f5be3f';
          else return 'red';
        case 10:
          if (this.autoAcceptTime >= 300) return 'green';
          else if (this.autoAcceptTime < 300 && this.autoAcceptTime >= 60) return '#f5be3f';
          else return 'red';
      }
      return color;
    },
    isPrintBtnVisible() {
      if (this.getRoles && this.getRoles[0]) {
        return (
          (this.getRoles[0].toLowerCase() === 'manager' || this.getRoles[0].toLowerCase() === 'operator') &&
          this.getCurrentVenue.settings &&
          this.getCurrentVenue.settings.venueSelfSettings.isPrintOrderEnabled
        );
      } else return false;
    },
    isBoltOrWoltOrder() {
      if (Object.prototype.hasOwnProperty.call(this.order, 'woltOrder')) {
        return 'woltOrder';
      }
      return 'boltOrder';
    },
    isBoltOrWoltLogo() {
      if (Object.prototype.hasOwnProperty.call(this.order, 'woltOrder')) {
        return 'wolt';
      }
      return 'bolt';
    },
    isAsap() {
      if (this.deliveryHow == 'takeaway' && this.deliveryWhen === 'instant') {
        return true;
      }
      return false;
    },
    timeToShow() {
      if (this.deliveryHow == 'takeaway' && this.deliveryWhen === 'preorder') {
        return this.formatDateTime(this.dateTimeFormats, this.entityOrder.pre_order.preorder_time);
      }
      if (this.deliveryHow === 'homedelivery') {
        return this.formatDateTime(this.dateTimeFormats, this.entityOrder.pickup_eta);
      }
      if (this.isBoltOrWoltOrder === 'boltOrder') {
        return this.formatDateTime(this.dateTimeFormats, this.entityOrder.due_datetime);
      }
      return false;
    },
    isPreorder() {
      return this.deliveryWhen === 'preorder';
    },
    hasErrorMessage() {
      return this.orderStatus.INCORRECT == this.colValue && this.orderErrorMsg;
    },
    circValueVar() {
      let value = 100 / this.timerDiffSec;
      return value;
    },
  },
  watch: {
    order: {
      immediate: true,
      handler() {
        this.entityOrder = this.order[this.isBoltOrWoltOrder];

        if (this.isBoltOrWoltOrder === 'woltOrder') {
          this.consumerName = this.entityOrder.consumer_name;
          this.consumerComment = this.entityOrder.consumer_comment;
          this.orderNumber = this.entityOrder.order_number;
          this.phone = this.entityOrder.consumer_phone_number;
          this.orderItems = this.entityOrder.items;
          this.price = this.splitPrice(this.entityOrder.price.amount);
          this.priceCurrency = this.entityOrder.price.currency;
          this.deliveryHow = this.entityOrder.delivery.type;
          this.deliveryWhen = this.entityOrder.type;
          this.modifiedTime = this.entityOrder.modified_at;
        }

        if (this.isBoltOrWoltOrder === 'boltOrder') {
          this.consumerName = this.entityOrder.customer.partial_name;
          this.consumerComment = this.entityOrder.user_note;
          this.orderNumber = this.entityOrder.order_reference_id;
          this.phone = this.entityOrder.customer.phone;
          this.orderItems = this.entityOrder.items;
          this.price = this.entityOrder.total_order_price.value;
          this.priceCurrency = this.entityOrder.total_order_price.currency;
          this.deliveryHow = this.entityOrder.order_type;
          this.modifiedTime = this.entityOrder.created_datetime;
          this.deliveryWhen = '';
        }

        this.entityOrderFields.customerName = this.consumerName;
        this.entityOrderFields.comment = this.consumerComment;
        this.entityOrderFields.orderNumber = this.orderNumber;
        this.entityOrderFields.phone = this.phone;
        this.entityOrderFields.orderItems = this.orderItems;
        this.entityOrderFields.price = this.price;
        this.entityOrderFields.priceCurrency = this.priceCurrency;
        this.entityOrderFields.delivery.how = this.deliveryHow;
        this.entityOrderFields.delivery.when = this.deliveryWhen;

        if (this.consumerComment) {
          this.isCommentExist = true;
        } else {
          if (this.isBoltOrWoltOrder === 'boltOrder') {
            let doesItemHaveComment = this.orderItems.some(item => !!item.user_note);
            this.isCommentExist = doesItemHaveComment;
          }
        }

      },
    },
    isLoading(val) {
      this.isStatusChanging = val;
    },
  },
  methods: {
    ...mapActions('orders', [
      'rejectOrder',
      'editOrderTime',
      'validateOrder',
      'forceOrderStatus',
      'retryOrderStatus',
      'fetchOrders',
      'fetchOrder',
      'printOrder',
      'setAdjustedTime',
      'updateOrder',
    ]),
    ...mapMutations('orders', ['updateOrder']),
    splitPrice(value) {
      return (value / 100).toFixed(2);
    },
    getItemPrice(item) {
      if (this.isBoltOrWoltLogo === 'wolt') {
        return `${this.splitPrice(item.total_price.amount)} ${item.total_price.currency}`; 
      }
      if (this.isBoltOrWoltLogo === 'bolt') {
        return `${item.unit_item_price.value} ${item.unit_item_price.currency}`;
      }
    },
    getOptionPrice(option) {
      if (this.isBoltOrWoltLogo === 'wolt') {
        return `${this.splitPrice(option.price.amount)} ${option.price.currency}`;
      }
      if (this.isBoltOrWoltLogo === 'bolt') {
        return `${option.unit_item_price.value} ${option.unit_item_price.currency}`
      }
    },
    timerShowTime(time) {
      if (time < 0) {
        return 0;
      } else if (time > 60) {
        return Math.floor(time / 60);
      } else if (time < 60 && time > 0) {
        return Number(time / 100).toFixed(2);
      }
    },
    timerTick(value) {
      let _this = this;
      if (_this[value] > 0) {
        setInterval(function () {
          _this[value]--;
          _this.progressValue(_this[value]);
        }, 1000);
      }
    },
    progressValue(time) {
      this.progressTime.showValue = this.timerShowTime(time);
      this.progressTime.diffValue += this.circValueVar;
    },
    infoModalHandler(event) {
      this[event]();
      this.isOrderInfoModalOpen = false;
    },
    editOrderStatus() {
      let isRestricted = this.checkRestriction();

      if (isRestricted) {
        return;
      }

      if (this.orderStatus.RECEIVED === this.status) {
        this.buttonPressed = 'accept';
        this.openModalWindow();
      } else if (this.orderStatus.PREORDER === this.status) {
        this.buttonPressed = 'edit';
        this.openModalWindow();
      } else {
        this.changeAcceptOrderStatus(null);
      }
    },
    async rejectOrderHandler() {
      let isRestricted = this.checkRestriction();

      if (isRestricted) {
        return;
      }

      if (!this.isLoading) {
        let res = true;
        if (this.status === ORDER_STATUS.RECEIVED) {
          res = await this.$dialog.confirm({
            text: 'Are you sure you want to reject this order?',
            title: 'Warning',
          });
        }
        if (res) {
          this.isStatusChanging = true;
          this.rejectOrder({
            id: this.id,
            reason: 'no',
          }).catch(() => {
            this.isStatusChanging = false;
          });
        }
      }
    },
    retryOrder() {
      let isRestricted = this.checkRestriction();

      if (isRestricted) {
        return;
      }

      this.buttonPressed = 'retry';
      this.changeRetryOrderStatus();
    },
    async forceOrder() {
      let isRestricted = this.checkRestriction();

      if (isRestricted) {
        return;
      }

      const res = await this.$dialog.confirm({
        text: 'Are you sure you want to force accept this order?',
        title: 'Warning',
      });
      if (res) {
        this.buttonPressed = 'force';
        if (this.orderStatus.RECEIVED === this.status) {
          this.openModalWindow();
        } else {
          this.changeForceOrderStatus(null);
        }
      }
    },
    changeAcceptOrderStatus(cookingTime) {
      this.updatedCookingTime = cookingTime;
      this.isStatusChanging = true;

      if (this.orderStatus.RECEIVED === this.status) {
        let dataToSend = {
          id: this.id,
          isForce: false,
          type: 'accept',
          cookingTimeInMinutes: cookingTime,
        };
        this.acceptOrderApi(dataToSend);
      }

      if (this.orderStatus.PRODUCTION === this.status) {
        this.readyOrderApi(this.id);
      }

      if (this.orderStatus.READY === this.status) {
        this.pickupOrderApi({id: this.id, isForce: false });
      }
    },
    changeRetryOrderStatus() {
      this.isStatusChanging = true;

      if (this.orderStatus.RECEIVED === this.status) {
        let dataToSend = {
          id: this.id,
          type: 'retry',
        };
        this.acceptOrderApi(dataToSend);
      }

      if (this.orderStatus.READY === this.status) {
        this.pickupOrderApi({id: this.id, isForce: false });
      }
    },
    changeForceOrderStatus(cookingTime) {
      this.isStatusChanging = true;

      if (this.orderStatus.RECEIVED === this.status) {
        let dataToSend = {
          id: this.id,
          isForce: true,
          type: 'force',
          cookingTimeInMinutes: cookingTime,
        };
        this.acceptOrderApi(dataToSend);
      }

      if (this.orderStatus.READY === this.status) {
        this.pickupOrderApi({id: this.id, isForce: true });
      }
    },
    acceptModal({ cookingTime }) {
      if (this.buttonPressed === 'accept') {
        this.changeAcceptOrderStatus(cookingTime);
      }

      if (this.buttonPressed === 'force') {
        this.changeForceOrderStatus(cookingTime);
      }

      if (this.buttonPressed === 'edit') {
        this.editPreorder(cookingTime);
      }
      this.closeModalWindow();
    },
    confirmPreorder() {
      let isRestricted = this.checkRestriction();

      if (isRestricted) {
        return;
      }

      this.isStatusChanging = true;
      let dataToSend = {
        id: this.id,
      };

      if (this.orderState.BAD !== this.state) {
        dataToSend.type = 'confirm';
      }

      if (this.orderState.BAD === this.state) {
        dataToSend.type = 'force';
        dataToSend.isForce = true;
      }

      this.acceptOrderApi(dataToSend);
    },
    editPreorder(cookingTime) {
      let dataToSend = {
        id: this.id,
        cookingTime: cookingTime,
      };
      this.editOrderTime(dataToSend).then(() => {
        this.cookingTime = cookingTime;
        this.updatePreorderTimer();
      });
    },
    retryValidateOrder() {
      let isRestricted = this.checkRestriction();

      if (isRestricted) {
        return;
      }

      this.isStatusChanging = true;
      this.validateOrder({ id: this.id })
        .then(data => {
          if (data === 1) {
            this.isStatusChanging = false;
          }
        })
        .catch(() => {
          this.isStatusChanging = false;
        });
    },
    onPrint() {
      this.printOrder(this.id).then(() => {
        this.$notify.toast('Successfully sent to print!', TOAST_TYPES.SUCCESS);
      });
    },
    onCardClickHandler() {
      let mode = this.getGeneralSettings.orderCardMode;
      if (mode === 1) {
        this.isOpen = !this.isOpen;
      } else {
        this.isOrderInfoModalOpen = !this.isOrderInfoModalOpen;
      }
    },
    toggleIsOpen() {
      this.isOpen = !this.isOpen;
    },
    openModalWindow() {
      this.isModalOpen = true;
    },
    closeModalWindow() {
      this.isModalOpen = false;
    },
    updatePreorderTimer() {
      let timeToUse;

      if (this.deliveryHow === 'homedelivery') {
        if (this.entityOrder.pickup_eta) {
          timeToUse = this.entityOrder.pickup_eta;
        }
      } else {
        if (this.entityOrder.pre_order) {
          timeToUse = this.entityOrder.pre_order.preorder_time;
        }
      }

      let tillTime = dayjs(dayjs.utc(timeToUse).local().subtract(this.cookingTime, 'minute'));
      this.autoAcceptTime = tillTime.subtract(dayjs()).unix();

      let modTime = dayjs.utc(this.modifiedTime).local();
      this.timerDiffSec = tillTime.subtract(modTime).unix();

      this.progressTime.showValue = this.timerShowTime(this.autoAcceptTime);
      this.progressTime.diffValue = Math.floor(100 * ((this.timerDiffSec - this.autoAcceptTime) / this.timerDiffSec));

      this.timerTick('autoAcceptTime');
    },
    checkRestriction() {
      let isWoltLicensed = this.getCurrentVenue.isWoltLicensed;
      let isBoltLicensed = this.getCurrentVenue.isBoltLicensed;

      if (!Object.prototype.hasOwnProperty.call(this.getCurrentVenue, 'settings')) {
        this.$notify.toast('Action not allowed!', TOAST_TYPES.ERROR);
        return true;
      }

      if (!isBoltLicensed && this.isBoltOrWoltOrder === 'boltOrder') {
        this.$notify.toast('Bolt license is expired!', TOAST_TYPES.ERROR);
        return true;
      }

      if (!isWoltLicensed && this.isBoltOrWoltOrder === 'woltOrder') {
        this.$notify.toast('Wolt license is expired!', TOAST_TYPES.ERROR);
        return true;
      }

      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.order-card {
  border: 1px solid #ededed;
  border-radius: 8px;
  padding: 24px 32px;
}

@media screen and (max-width: 1536px) {
  .order-card {
    padding: 16px;
  }
}

.cursor_move {
  cursor: move;
}

.order-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.15px;
}

.order-phone {
  color: #636363;
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

.order-type {
  display: inline-block;
  text-align: center;
  color: #333;
  letter-spacing: 0.15px;
  &-icon {
    display: inline-block;
    margin-bottom: 10px;
    i {
      color: #333;
    }
  }
  h4 {
    font-weight: 400;
    display: inline-block;
    margin-left: 10px;
  }
  &-closed {
    .order-type-icon {
      margin-bottom: 0;
    }
    h4 {
      margin-left: 10px;
    }
  }
}

.order-product-item {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  &-comment {
    display: inline-block;
    background-color: #333;
    color: #f6f5fa;
    padding: 4px 16px;
    border-radius: 10px;
    font-size: 14px;
    letter-spacing: 0.3px;
    margin-left: 10px;
  }
}

.order-price-items {
  font-size: 16px;
  color: #636363;
  span {
    display: inline-block;
    margin-right: 10px;
  }
}

.order-status-tag {
  font-weight: 400;
  font-size: 12px;
  color: #fff;
  background-color: #02b66f;
  padding: 4px 8px;
  border-radius: 24px;
}

.order-card-small {
  padding: 16px;
  border: 1px solid #ededed;
  border-radius: 12px;
  background-color: #fff;
  .order-type-icon {
    i {
      font-size: 16px;
    }
  }
}

.order-success-icon {
  width: 25px;
  height: 25px;
  background-color: #02b66f;
  position: relative;
  border-radius: 50%;
  i {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
  }
}

.overlay {
  position: relative;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-size: 300px;
  z-index: 100000000;
  opacity: 0.5; // no opacity!
}

.overlay-loader {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 100000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress {
  position: relative;
  padding-bottom: 50px;
  z-index: 1000;
  opacity: 1 !important;
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

.time-changer {
  border: 1px black solid;
  border-radius: 20px;
  max-width: 200px;

  display: flex;
  justify-content: space-between;
  margin: 0 auto;
}
</style>
