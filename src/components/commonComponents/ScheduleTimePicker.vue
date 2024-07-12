<template>
  <div class="time_picker__container">
    <label class="mt-1">{{ title }}</label>
    <TimePicker
      v-model="currentTime"
      :style="required ? 'border: 1px solid red' : ''"
      :format="timeFormat"
      :disabled-dates="disabledDates"
      input-width="130px"
      @close="handleClickSave"
      @clear="clearTime"
    >
      <template v-slot:icon>
        <v-icon class="">mdi-clock-time-four-outline</v-icon>
      </template>
    </TimePicker>
  </div>
</template>

<script>
import TimePicker from './TimePicker';

export default {
  name: 'ScheduleTimePicker',
  components: { TimePicker },
  props: {
    day: {
      type: Object,
    },
    timeFormat: {
      type: String,
    },
    actionTime: {
      type: String,
    },
    title: {
      type: String,
    },
    disabledDates: {},
    time: {
      type: String,
    },
    save: {
      type: Function,
    },
    required: {},
  },
  data() {
    return {
      currentTime: null,
    };
  },
  watch: {
    time: {
      immediate: true,
      handler() {
        this.currentTime = this.time;
      },
    },
  },
  methods: {
    clearTime() {
      this.currentTime = null;
      this.save(this.actionTime, this.day, this.currentTime);
    },
    handleClickSave() {
      if (typeof this.currentTime === 'object') {
        let stringTime =
          (this.currentTime['HH'] || this.currentTime['hh']) +
          ':' +
          this.currentTime['mm'] +
          (this.currentTime['a'] ? ' ' + this.currentTime['a'] : '');
        this.save(this.actionTime, this.day, stringTime);
      } else if (typeof this.currentTime === 'string') this.save(this.actionTime, this.day, this.currentTime);
    },
  },
};
</script>

<style lang="scss" scoped>
.time_picker__container {
  display: flex;
  gap: 10px;
}
.time_picker__text {
  border-bottom: 1px solid rgba(0, 0, 0, 0.87);
  cursor: text;
  width: 100px;
  height: 20px;
  padding-bottom: 5px;
}
</style>
