<template>
  <v-dialog v-model="syncedOpened" width="650" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <div class="standart-modal-card-top d-flex align-center justify-space-between">
        <h3>Venue schedule</h3>
        <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
      </div>
      <div class="standart-modal-card-middle">
        <v-row v-for="day in curSchedules" :key="day.opening_day" class="align-end">
          <v-col cols="2" class="mb-2 font-weight-bold">{{ day.opening_day }}</v-col>
          <v-col cols="5">
            <ScheduleTimePicker
              :day="{
                title: 'opening_day',
                value: day.opening_day,
              }"
              :timeFormat="timeFormat"
              :actionTime="'opening_time'"
              :title="'Opening'"
              :time="day.opening_time"
              :save="save"
              :required="requiredFields[`open-${day.opening_day.toLowerCase()}`]"
            />
          </v-col>
          <v-col cols="5">
            <ScheduleTimePicker
              :day="{
                title: 'closing_day',
                value: day.closing_day,
              }"
              :timeFormat="timeFormat"
              :actionTime="'closing_time'"
              :title="'Closing'"
              :time="day.closing_time"
              :save="save"
              :required="requiredFields[`close-${day.closing_day.toLowerCase()}`]"
            />
          </v-col>
        </v-row>
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
          <Button
            text="Save"
            class="standart-button-content-width"
            type="button"
            :is-loading="isScheduleLoading"
            @handleClick="saveSchedule"
          />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Button from '@/components/commonComponents/Button';
import ScheduleTimePicker from '@/components/commonComponents/ScheduleTimePicker';
import { convertTimeToAmpm } from '@/utils';
import { TOAST_TYPES } from '@/data';

export default {
  name: 'VenueScheduleModal',
  components: {
    ScheduleTimePicker,
    Button,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  props: {
    opened: {
      type: Boolean,
    },
    isScheduleLoading: {
      type: Boolean,
    },
    changeSchedule: {
      type: Function,
    },
    schedule: {
      type: Array,
    },
  },
  data() {
    return {
      curSchedules: [],
      time: null,
      requiredFields: {},
    };
  },
  computed: {
    ...mapGetters({
      getItem: 'venues/getItem',
      getGeneralSettings: 'app/getGeneralSettings',
    }),
    syncedOpened: {
      get() {
        this.getSchedule();
        return this.opened;
      },
      set(val) {
        return this.$emit('opened:update', val);
      },
    },

    timeFormat() {
      return this.getGeneralSettings.timeFormat === 2 ? 'HH:mm' : 'hh:mm a';
    },
  },
  watch: {
    schedule: {
      immediate: true,
      handler() {
        this.curSchedules = [...this.schedule];
      },
    },
  },
  methods: {
    save(actionTime, day, time) {
      this.curSchedules.forEach(el => (el[day.title] === day.value ? (el[actionTime] = time) : {}));
    },
    getSchedule() {
      if (this.opened === true) {
        this.curSchedules = [];
        if (this.getGeneralSettings.timeFormat === 1) {
          this.schedule.forEach(el => {
            this.curSchedules.push({
              ...el,
              opening_time: convertTimeToAmpm(el.opening_time),
              closing_time: convertTimeToAmpm(el.closing_time),
            });
          });
        } else this.curSchedules = [...this.schedule];
      }
    },
    saveSchedule() {
      this.requiredFields = {};
      this.curSchedules.forEach(el => {
        let openName = 'open-' + el.opening_day.toLowerCase();
        let closeName = 'close-' + el.closing_day.toLowerCase();

        if (!el.opening_time && this.requiredFields[openName] !== true) this.$set(this.requiredFields, openName, true);

        if (el.opening_time && this.requiredFields[openName] === true) delete this.requiredFields[openName];

        if (!el.closing_time && this.requiredFields[closeName] !== true)
          this.$set(this.requiredFields, closeName, true);

        if (el.closing_time && this.requiredFields[closeName] === true) delete this.requiredFields[closeName];
      });

      let error = false;
      this.curSchedules.forEach(el => {
        if (Object.values(el).includes(null)) {
          error = true;
          this.$notify.toast('Please enter time!', TOAST_TYPES.ERROR);
          return;
        }
      });

      if (!error) this.changeSchedule(this.curSchedules);
    },
    closeModal() {
      this.syncedOpened = false;
      this.$emit('closeVenueScheduleModal');
    },
    changeVenueSchedules() {
      this.changeSchedule(this.curSchedules);
      this.syncedOpened = false;
    },
  },
};
</script>

<style lang="scss" scoped>
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
      border-radius: 0 4px 4px 0 !important;
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
</style>
