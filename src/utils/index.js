import { ORDER_STATUS, TOAST_TYPES } from '@/data';
import Vue from 'vue';

export const statusConvertToString = status => {
  if (typeof status === 'number' && Object.values(ORDER_STATUS).includes(status)) {
    let statusVal = Object.keys(ORDER_STATUS).find(key => ORDER_STATUS[key] === status);
    return statusVal.toLowerCase(); // return string
  }
};

export const statusConvertToNumber = status => {
  if (typeof status === 'string' && ORDER_STATUS[status]) {
    return ORDER_STATUS[status]; // return number
  }
};

export const convertTimeToAmpm = time => {
  let hours = time.split(':')[0];
  let ampm = 'am';
  if (Number(hours) > 12) {
    hours = Number(hours) - 12 > 9 ? (Number(hours) - 12).toString() : '0' + (Number(hours) - 12).toString();
    ampm = 'pm';
  }
  return hours + ':' + time.split(':')[1] + ' ' + ampm;
};

export const convertTimeFromAmpm = time => {
  if (time.includes('am') || time.includes('pm')) {
    let hours = time.split(':')[0];
    let ampm = time.split(' ')[1];
    if (ampm === 'am') {
      return time.split(' ')[0];
    } else if (ampm === 'pm') {
      let newTime = time.split(' ')[0];
      return Number(newTime.split(':')[0]) + 12 + ':' + newTime.split(':')[1];
    } else Vue.prototype.$notify.toast('Error with time format, can not save schedule!', TOAST_TYPES.ERROR);
  } else return time;
};
