<template>
  <v-dialog v-model="syncedOpened" width="600" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <div class="standart-modal-card-top d-flex align-center justify-space-between">
        <h3>{{ title }}</h3>
        <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
      </div>
      <div class="standart-modal-card-middle">
        <h3 class="standart-modal-card-subtitle font-weight-bold" v-if="isAsap">ASAP</h3>
        <h3 class="standart-modal-card-subtitle" v-if="timeToShow">
          {{ timeToShow }}
        </h3>
        <h3 class="standart-modal-card-subtitle" v-if="tillEtaTime">
          {{ tillEtaTimeText }}
        </h3>

        <div v-if="orderStatus.PREORDER === this.status">
          <div class="d-flex align-center justify-space-between">
            <h3 class="standart-modal-card-subtitle">
              Chosen cooking time:
              <span>{{ inputTimeValue }}</span>
              minutes
            </h3>
            <Button
              text="Edit time"
              type="button"
              class="standart-button-content-width rounded"
              @handleClick="showGrid"
            />
          </div>
        </div>
        <template v-if="isShowGrid">
          <h2 class="standart-modal-card-subtitle text-center mb-3">Choose cooking time</h2>
          <button
            v-if="isBoltOrWoltOrder === 'boltOrder'"
            class="mb-1 no-delay-button"
            :class="isNoDelayActive ? 'no-delay-button-active' : ''"
            @click="noDelayHandler"
          >
            No Delay
          </button>
          <div class="time-grid">
            <v-btn
              class="time-grid-item"
              v-for="item in timeGridData"
              :class="inputTimeValue == item ? 'time-grid-item-active' : ''"
              @click="setTimeGrid(item)"
              :key="item"
              >{{ item }} <br />min
            </v-btn>
          </div>
          <Button
            styleType="secondary"
            text="Choose custom time"
            class="mt-2 rounded"
            type="button"
            @handleClick="isCustomTimeShow = !isCustomTimeShow"
          />
          <div v-show="isCustomTimeShow">
            <div class="custom-input-number mt-4">
              <v-btn class="custom-input-number-btn custom-input-number-btn-left" @click="setInputTime('-')">-</v-btn>
              <div class="custom-input-number-field">
                {{ inputTimeValue }}
              </div>
              <v-btn
                class="custom-input-number-btn custom-input-number-btn-right"
                :disabled="timeIncreaseDisabled"
                @click="setInputTime('+')"
                >+</v-btn
              >
            </div>
          </div>
        </template>
      </div>
      <div class="standart-modal-card-bottom">
        <div class="d-flex align-center justify-end">
          <Button
            styleType="secondary"
            text="Cancel"
            class="standart-button-content-width mr-2"
            type="button"
            @handleClick="closeModal"
          />
          <Button text="Accept" class="standart-button-content-width" type="submit" @handleClick="acceptModal" />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import dayjs from '@/main.js';
import Button from '@/components/commonComponents/Button';
import { ORDER_STATUS } from '@/data';
import { mapGetters } from 'vuex';
import dateFormat from '../../mixins/date-format';


export default {
  name: 'ProductionTimeModal',
  components: {
    Button,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  mixins: [dateFormat],
  props: {
    opened: Boolean,
    title: {
      type: String,
    },
    etaTime: {
      type: String,
    },
    chosenCookingTime: {
      type: Number,
    },
    status: {
      type: Number,
    },
    createdTime: {
      type: String,
    },
    pickupDate: {
      type: null,
    },
    order: {
      type: Object,
    },
    defaultCookingTime: {
      type: Number,
    },
    entityOrder: {
      type: Object,
    },
    entityOrderFields: {
      type: Object,
    },
    isBoltOrWoltOrder: {
      type: String
    }
  },
  data() {
    return {
      textFieldKey: 100,
      timeGridData: [5, 10, 15, 20, 25, 30, 35, 40],
      inputTimeValue: 30,
      isCustomTimeShow: false,
      orderStatus: ORDER_STATUS,
      isShowGrid: false,
      isGridClicked: false,
      tillEtaTime: 0,
      pickupEta: 0,
      preorderTime: 0,
      dateTimeFormats: {
        dateOrder: 0,
        dateSeparator: '.',
        timeFormat: 0,
      },
      isNoDelayActive: false
    };
  },
  mounted() {

    if (this.orderStatus.PREORDER !== this.status) {
      this.isShowGrid = true;
    }
    if (this.chosenCookingTime > 0) {
      this.inputTimeValue = this.chosenCookingTime;
    }

    if (this.isBoltOrWoltOrder === 'boltOrder') {
      this.noDelayHandler();
    }

    if (this.entityOrder) {
      if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'pickup_eta')) {
        this.pickupEta = this.entityOrder.pickup_eta;
      }
      if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'due_datetime')) {
        this.pickupEta = this.entityOrder.due_datetime;
      }
      if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'pre_order')) {
        this.preorderTime = this.entityOrder.pre_order.preorder_time;
      }
    }
  },
  watch: {
    opened(val) {
      if (val) {
        this.setAndStartTillEta();
      }
    },
  },
  computed: {
    ...mapGetters({
      getGeneralSettings: 'app/getGeneralSettings',
    }),
    syncedOpened: {
      get() {
        return this.opened;
      },
      set(val) {
        return this.$emit('opened:update', val);
      },
    },
    isAsap() {
      if (this.entityOrder) {
        if (this.entityOrderFields.delivery.how == 'takeaway' && this.entityOrderFields.delivery.when === 'instant') {
          return true;
        }
      }
      return false;
    },
    timeToShow() {
      if (this.entityOrder) {
        if (this.entityOrderFields.delivery.how === 'takeaway' && this.entityOrderFields.delivery.when === 'preorder') {
          const textToShow = 'Preorder time: ';
          if (this.entityOrder.pre_order) {
            return textToShow + this.formatTime(this.dateTimeFormats, this.entityOrder.pre_order.preorder_time);
          }
        }
        if (this.entityOrderFields.delivery.how === 'homedelivery') {
          const textToShow = 'Pickup eta time: ';
          if (this.entityOrder.pickup_eta) {
            return textToShow + this.formatTime(this.dateTimeFormats, this.entityOrder.pickup_eta);
          }
        }
        if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'due_datetime')) {
          const textToShow = 'Pickup eta time: ';
          return textToShow + this.formatTime(this.dateTimeFormats, this.entityOrder.due_datetime);
        }
      }
      return false;
    },
    tillEtaTimeText() {
      if (this.tillEtaTime > 1) {
        let tillText;
        tillText = this.entityOrderFields.delivery.how == 'takeaway' ? 'ready' : 'pickup';
        if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'due_datetime')) {
          tillText = 'pickup';
        }
        return this.tillEtaTime + ` minutes until ${tillText}`;
      }
      if (this.tillEtaTime === 1) {
        let tillText;
        tillText = this.entityOrderFields.delivery.how == 'takeaway' ? 'ready' : 'pickup';
        if (Object.prototype.hasOwnProperty.call(this.entityOrder, 'due_datetime')) {
          tillText = 'pickup';
        }
        return this.tillEtaTime + ` minute until ${tillText}`;
      }
      return 0;
    },
    timeIncreaseDisabled() {
      if (this.order && this.entityOrder && !this.entityOrder.pre_order)
        return this.inputTimeValue === this.order.cookingTimeInMinutes;
      else if (this.order && this.entityOrder && this.entityOrder.pre_order) return this.inputTimeValue === 180;
      else return false;
    },
  },
  methods: {
    closeModal() {
      this.syncedOpened = false;
    },
    setTimeGrid(item) {
      this.isNoDelayActive = false;
      this.isGridClicked = true;
      this.inputTimeValue = item;
      this.isCustomTimeShow = false;
    },
    noDelayHandler() {
      this.isNoDelayActive = true;
      this.isGridClicked = false;
      this.inputTimeValue = 0;
      this.isCustomTimeShow = false;
    },
    setInputTime(sign) {
      this.isGridClicked = true;
      let newInputTime = this.inputTimeValue;
      if (sign === '+') {
        this.inputTimeValue += 1;
      }
      if (sign === '-') {
        if (newInputTime - 1 >= 1) {
          this.inputTimeValue -= 1;
        }
      }
    },
    acceptModal() {
      this.$emit('acceptModal', {
        order: this.order,
        cookingTime: this.inputTimeValue,
      });
    },
    showGrid() {
      this.isShowGrid = true;
    },
    resetState() {
      this.isGridClicked = false;
      this.isShowGrid = false;
      this.isCustomTimeShow = false;
    },
    formatTime(format, date) {
      let timeFormat = format.timeFormat === 1 ? 'hh:mm A' : 'HH:mm';

      let formattedDate = dayjs(new Date(date)).format(timeFormat);
      return formattedDate;
    },
    tillEtaTimer() {
      let interval;
      interval = setInterval(() => {
        let tillTime;
        if (this.entityOrderFields.deliveryHow == 'takeaway') {
          tillTime = Math.floor(dayjs(dayjs.utc(this.preorderTime).local().subtract(dayjs())).unix() / 60);
        } else {
          tillTime = Math.floor(dayjs(dayjs.utc(this.pickupEta).local().subtract(dayjs())).unix() / 60);
        }
        // let tillEta = Math.floor(dayjs(dayjs.utc(this.pickupEta).local().subtract(dayjs())).unix()/60);
        this.tillEtaTime = tillTime;
      }, 10000);
      if (this.tillEtaTime <= 0) {
        clearInterval(interval);
      }
    },
    setAndStartTillEta() {
      if (!this.entityOrder.pre_order) {
        let time = this.defaultCookingTime ? this.defaultCookingTime : this.order.cookingTimeInMinutes;
        this.timeGridData = this.timeGridData.filter(el => el <= time);
        if (!this.timeGridData.includes(time)) this.timeGridData.push(time);
      } else this.timeGridData.push(180);

      if (this.orderStatus.RECEIVED === this.order.statusId || this.orderStatus.PREORDER === this.order.statusId) {
        let tillTime;
        if (this.entityOrderFields.delivery.how == 'takeaway') {
          tillTime = Math.floor(dayjs(dayjs.utc(this.preorderTime).local().subtract(dayjs())).unix() / 60);
        } else {
          tillTime = Math.floor(dayjs(dayjs.utc(this.pickupEta).local().subtract(dayjs())).unix() / 60);
        }
        if (tillTime) {
          this.tillEtaTime = tillTime;
          this.tillEtaTimer();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  &-item {
    flex: 1 0 calc(33.33333% - 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #d5deff !important;
    color: #5b7ffe;
    font-size: 22px;
    font-weight: bold;
    border-radius: 4px !important;
    box-shadow: none !important;
    transition: 0.3s;
    text-transform: none !important;
    height: 80px !important;
    cursor: pointer;
    &:hover {
      background-color: #b0c1ff;
    }
    &-active {
      background-color: #a2b6ff !important;
      box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.2) !important;
    }
  }
}

.custom-input-number {
  display: flex;
  align-items: center;
  justify-content: center;
  &-btn {
    font-size: 32px;
    font-weight: bold;
    background-color: #d5deff !important;
    color: #5b7ffe;
    box-shadow: none !important;
    height: 80px !important;
    width: 80px;
    &-left {
      border-radius: 4px 0 0 4px !important;
    }
    &-right {
      border-radius: 0px 4px 4px 0 !important;
    }
  }
  &-field {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 80px;
    font-size: 34px;
    text-align: center;
    font-weight: bold;
    color: #5b7ffe;
    background-color: #f2f2f2;
  }
}

.no-delay-button {
  display: block;
  border-radius: 4px;
  background-color: #d5deff;
  width: 100%;
  padding: 15px;
  font-weight: bold;
  font-size: 22px;
  transition: 0.3s;
  &:hover {
    background-color: #b0c1ff;
  }
  &-active {
    background-color: #6381f0 !important;
    box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.2) !important;
  }
}
</style>
