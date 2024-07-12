import { mapActions, mapGetters } from 'vuex';
import dayjs from '@/main.js';

export default {
  data() {
    return {
      isStatusChanging: false,
    }
  },
	mounted() {
		this.setDateTimeFormats();
	},
	computed: {
    ...mapGetters({
      getGeneralSettings: 'app/getGeneralSettings',
    }),
	},
	watch: {
    getGeneralSettings() {
      this.setDateTimeFormats();
    },
	},
  methods: {
		setDateTimeFormats() {
      this.dateTimeFormats.dateOrder = this.getGeneralSettings.dateOrder;
      this.dateTimeFormats.dateSeparator = this.getGeneralSettings.dateSeparator;
      this.dateTimeFormats.timeFormat = this.getGeneralSettings.timeFormat;
    },
		formatDateTime(format, date) {
			if (!date) {
        return 'Unlimited';
      }
      const lastChar = date[date.length - 1];
      if (lastChar != 'Z') {
        date += 'Z';
      }
      let output;
      let timeFormat = format.timeFormat === 1 ? 'hh:mm A' : 'HH:mm';
      let dateFormat;
      let dateSeparator = format.dateSeparator;
      let formattedDate = dayjs(new Date(date)).format(timeFormat);
      let isSameDay = dayjs().isSame(dayjs(date), 'day');
      if (!isSameDay) {
        dateFormat =
          format.dateOrder === 1
            ? `DD${dateSeparator}MM${dateSeparator}YYYY`
            : `MM${dateSeparator}DD${dateSeparator}YYYY`;
        let dateToOutput = dayjs(date).format(dateFormat);
        output = `${dateToOutput}, ${formattedDate}`;
      } else {
        output = formattedDate;
      }
      return output;
    },
  },
}