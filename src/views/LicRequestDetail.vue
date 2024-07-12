<template>
  <v-container class="pa-6" fluid>
    <v-row class="justify-center">
      <v-col lg="8" md="10" sm="12">
        <h2 class="sidebar-title mt-2 mb-6">Request Detail</h2>
        <div class="standart-card">
          <StandartLoader v-if="isLoading" />
          <div v-else>
            <v-row v-if="!isReadOnly">
              <v-col cols="6">
                <div class="info-table mb-2">
                  <v-row class="info-table-row" v-for="(value, idx) of Object.values(dataToShowTop)" :key="idx">
                    <v-col class="info-table-col" cols="12">{{ value }}</v-col>
                  </v-row>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between mb-2">
                  <div>
                    <Button
                      text="Accept"
                      class="standart-button-content-width mr-1"
                      type="button"
                      styleType="success"
                      v-if="this.requestItem.statusId === 1"
                      @handleClick="editItem('accept')"
                    />
                    <Button
                      text="Reject"
                      class="standart-button-content-width mr-1"
                      type="button"
                      styleType="warning"
                      v-if="this.requestItem.statusId === 1"
                      @handleClick="editItem('reject')"
                    />
                  </div>
                  <Button
                    text="Delete"
                    class="standart-button-content-width mr-1"
                    type="button"
                    styleType="danger"
                    @handleClick="deleteItem()"
                  />
                </div>
                <v-row class="mb-8" v-if="this.requestItem.statusId === 1">
                  <v-col
                    cols="12"
                    v-for="expiredDate in ['boltExpiredDateUtc', 'woltExpiredDateUtc']"
                    :key="expiredDate"
                  >
                    <v-row no-gutters class="d-flex align-bottom">
                      <v-col cols="8">
                        <v-datetime-picker
                          :textFieldProps="dateTimeTextFieldProps"
                          :label="expiredDate"
                          v-model="form[expiredDate]"
                          :dateFormat="dateFormat"
                          :timeFormat="timeFormat"
                          @input="dateTimeChanged($event, expiredDate)"
                          :ref="expiredDate"
                        >
                          <template v-slot:dateIcon>
                            <v-icon color="blue darken-2"> mdi-calendar-range </v-icon>
                          </template>
                          <template v-slot:timeIcon>
                            <v-icon color="blue darken-2"> mdi-clock-outline </v-icon>
                          </template>
                        </v-datetime-picker>
                      </v-col>
                      <v-col cols="4">
                        <div class="datetime-unlim-checkbox d-flex justify-center">
                          <v-checkbox
                            @change="unlimCheckboxChange($event, expiredDate)"
                            v-model="expDateUnlimModel[expiredDate]"
                            label="Unlimited"
                          />
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col class="d-flex justify-end py-0" cols="12">
                    <Button
                      text="Apply settings"
                      class="standart-button-content-width mr-1"
                      type="button"
                      styleType="primary"
                      @handleClick="sendSettings"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <div class="info-table">
              <v-row class="info-table-row" v-for="[key, value] of Object.entries(dataToShow)" :key="key">
                <v-col class="info-table-col" cols="6">{{ key }}</v-col>
                <v-col class="info-table-col" cols="6">
                  <span v-if="key !== 'Link'">{{ value }}</span>
                  <a :href="value" v-else>{{ dataToShowTop.Venue }}</a>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <RequestReasonModal v-model="reasonModalShown" @sendReason="sendReasonHandler" />
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StandartLoader from '../components/StandartLoader.vue';
import Button from '../components/commonComponents/Button.vue';
import { TOAST_TYPES } from '@/data';
import router from '../router';
import RequestReasonModal from '../components/modals/RequestReasonModal.vue';
import dateFormat from '../mixins/date-format';

export default {
  name: 'LicRequestDetail',
  mixins: [dateFormat],
  data() {
    return {
      requestId: this.$route.params.id,
      dataToShow: {},
      dataToShowTop: '',
      isLoading: true,
      form: {
        boltExpiredDateUtc: '',
        woltExpiredDateUtc: '',
      },
      dateTimeTextFieldProps: {
        class: 'standart-input-filled standart-input-no-message',
        filled: true,
        rounded: true,
        dense: true,
      },
      dateTimeFormats: {
        dateOrder: 0,
        dateSeparator: '.',
        timeFormat: 0,
      },
      expDateUnlimModel: {
        woltExpiredDateUtc: false,
        boltExpiredDateUtc: false,
      },
      reasonModalShown: false,
      itemStatusToEdit: 0,
    };
  },
  components: {
    StandartLoader,
    Button,
    RequestReasonModal,
  },
  computed: {
    ...mapGetters({
      requestItem: 'licRequests/getItem',
      getGeneralSettings: 'app/getGeneralSettings',
      getRoles: 'app/getRoles',
    }),
    timeFormat() {
      let timeFormat = this.dateTimeFormats.timeFormat === 1 ? 'hh:mm' : 'HH:mm';
      return timeFormat;
    },
    dateFormat() {
      let dateSeparator = this.dateTimeFormats.dateSeparator;
      let dateFormat =
        this.dateTimeFormats.dateOrder === 1
          ? `dd${dateSeparator}MM${dateSeparator}yyyy`
          : `MM${dateSeparator}dd${dateSeparator}yyyy`;
      return dateFormat;
    },
    isReadOnly() {
      return this.getRoles[0].toLowerCase() !== 'admin';
    },
  },
  mounted() {
    this.populateData();
  },
  methods: {
    ...mapActions({
      fetchRequest: 'licRequests/fetchItem',
      deleteRequest: 'licRequests/deleteItem',
      editRequest: 'licRequests/changeItemToDB',
      changeSettings: 'licRequests/changeSettings',
    }),
    isObject(val) {
      return typeof val === 'object';
    },
    populateData() {
      this.fetchRequest(this.requestId).then(() => {
        this.dataToShow = {};

        this.dataToShowTop = {
          Venue: this.requestItem.venue.name,
          Comment: this.requestItem.comment,
        };

        if (this.isReadOnly) {
          this.dataToShow.Venue = this.requestItem.venue.name;
          this.dataToShow.Comment = this.requestItem.comment;
        }

        this.dataToShow.CreatedAt = this.convertDateToLocal(this.requestItem.createUtc);
        this.dataToShow.RequestStatus = this.requestItem.status.name;

        if (Object.prototype.hasOwnProperty.call(this.requestItem, 'reason')) {
          this.dataToShow.Reason = this.requestItem.reason;
        }

        this.dataToShow.Link = this.requestItem.venue.link;
        this.dataToShow.WoltExpiredDateUtc = this.convertDateToLocal(
          this.requestItem.venue.settings.woltExpiredDateUtc,
        );
        this.dataToShow.BoltExpiredDateUtc = this.convertDateToLocal(this.requestItem.venue.settings.boltExpiredDateUt);

        if (Object.prototype.hasOwnProperty.call(this.requestItem, 'dealer')) {
          this.dataToShow.Dealer = this.requestItem.dealer.userName;
        }

        if (!this.dataToShow.WoltExpiredDateUtc) {
          this.expDateUnlimModel.woltExpiredDateUtc = true;
          this.form.woltExpiredDateUtc = null;
        }

        if (!this.dataToShow.BoltExpiredDateUtc) {
          this.expDateUnlimModel.boltExpiredDateUtc = true;
          this.form.boltExpiredDateUtc = null;
        }

        if (Object.prototype.hasOwnProperty.call(this.requestItem.venue.settings, 'woltExpiredDateUtc')) {
          this.form.woltExpiredDateUtc = new Date(this.requestItem.venue.settings.woltExpiredDateUtc);
        } else {
          this.form.woltExpiredDateUtc = null;
        }
        if (Object.prototype.hasOwnProperty.call(this.requestItem.venue.settings, 'boltExpiredDateUtc')) {
          this.form.boltExpiredDateUtc = new Date(this.requestItem.venue.settings.boltExpiredDateUtc);
        } else {
          this.form.boltExpiredDateUtc = null;
        }

        this.isLoading = false;
      });
    },
    async sendSettings() {
      let dataToSend = {
        venueId: this.requestItem.venueId,
        boltExpiredDateUtc: this.form.boltExpiredDateUtc,
        woltExpiredDateUtc: this.form.woltExpiredDateUtc,
      };

      try {
        let data = await this.changeSettings(dataToSend);
        if (data.status <= 300) {
          this.$notify.toast('Venue license settings has been successfully been changed!', TOAST_TYPES.SUCCESS);
          this.populateData();
        }
      } catch (err) {
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
    },
    async sendReasonHandler(reason) {
      let msgToShow = this.itemStatusToEdit === 2 ? 'accepted' : 'rejected';

      let dataToSend = {
        id: +this.requestId,
        statusId: this.itemStatusToEdit,
        reason: reason,
      };

      try {
        let data = await this.editRequest(dataToSend);
        if (data.status <= 300) {
          this.$notify.toast(`License request has successfully been ${msgToShow}!`, TOAST_TYPES.SUCCESS);
          this.populateData();
        }
      } catch (err) {
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
      this.reasonModalShown = false;
      this.itemStatusToEdit = 0;
    },
    async editItem(status) {
      let statusId = status === 'accept' ? 2 : 3;

      this.itemStatusToEdit = statusId;

      this.reasonModalShown = true;
    },
    async deleteItem() {
      let res = await this.$dialog.confirm({
        text: 'Are you sure you want to delete this request?',
        title: 'Warning',
      });

      if (res) {
        try {
          let data = await this.deleteRequest(+this.requestId);
          if (data.status <= 300) {
            this.$notify.toast('License request has successfully been deleted!', TOAST_TYPES.SUCCESS);
            router.replace('/lic-requests');
          }
        } catch (err) {
          this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
        }
      }
    },
    dateTimeChanged(val, key) {
      if (val) {
        this.expDateUnlimModel[key] = false;
      }
    },
    unlimCheckboxChange(val, key) {
      this.expDateUnlimModel[key] = val;
      if (val) {
        this.form[key] = null;
        this.$refs[key][0].clearHandler();
      }
    },
    convertDateToLocal(date) {
      return this.formatDateTime(this.dateTimeFormats, date);
    },
  },
};
</script>

<style lang="scss" scoped>
.info-table {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 12px 0 12px 0;

  &-row {
    border-bottom: 1px solid #ccc;
    width: 100%;
    margin-left: 0;
    margin-right: 0;

    &:nth-child(odd) {
      background-color: rgb(224, 224, 224);
    }
  }

  &-col {
    font-size: 18px;
    font-weight: bold;
  }
}

.datetime-unlim-checkbox {
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 18px !important;
  background: #f0f0f0;
  height: 58px;
  box-sizing: border-box;
}
</style>
