<template>
  <div>
    <v-form ref="venueForm" v-model="isFormValid" @submit.prevent="validateForm('venueForm')">
      <v-row no-gutters class="justify-space-between">
        <v-col cols="12" class="d-flex align-center">
          <v-icon> mdi-food-outline </v-icon>
          <h3 class="form-title ml-4">General Info</h3>
        </v-col>
        <v-col lg="12" md="12" sm="12" class="d-flex justify-md-end justify-sm-start align-center mt-sm-4">
          <v-row>
            <v-col class="d-flex flex-column" cols="4">
              <div v-if="!isNew && hasAvailability">
                <div v-if="woltSettingsPresent" class="status-tag mb-1">
                  <div :style="`background-color: ${statusColor('wolt')}`" class="status-circle"></div>
                  <h3>Wolt Status</h3>
                </div>
                <div v-if="boltSettingsPresent" class="status-tag mb-1">
                  <div :style="`background-color: ${statusColor('bolt')}`" class="status-circle"></div>
                  <h3>Bolt Status</h3>
                </div>
              </div>
              <Button
                v-if="shouldPopulateForm && hasAvailability"
                text="Change status"
                class="standart-button-content-width mr-1"
                type="button"
                @handleClick="openVenueModal"
              />
            </v-col>
            <v-col class="d-flex flex-column" cols="4">
              <Button
                v-if="shouldPopulateForm"
                text="Check Rkeeper"
                class="standart-button-content-width mb-1"
                type="button"
                :isLoading="isCheckingRk"
                @handleClick="checkRk"
              />
              <Button
                v-if="shouldPopulateForm && woltSettingsPresent"
                text="Check Wolt"
                class="standart-button-content-width mb-1"
                type="button"
                :isLoading="isCheckingWolt"
                @handleClick="checkWolt"
              />
              <Button
                v-if="shouldPopulateForm && boltSettingsPresent"
                text="Check Bolt"
                class="standart-button-content-width mb-1"
                type="button"
                :isLoading="isCheckingBolt"
                @handleClick="checkBolt"
              />
            </v-col>
            <v-col class="d-flex flex-column" cols="4">
              <Button
                v-if="shouldPopulateForm"
                type="button"
                text="Change schedule"
                class="standart-button-content-width mb-1"
                @handleClick="openVenueScheduleModal"
              >
              </Button>
              <Button
                v-if="shouldPopulateForm"
                text="Sync menu"
                class="standart-button-content-width mr-1"
                type="button"
                :isLoading="isFormLoading"
                @handleClick="openMenuModal"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-text-field
        class="standart-input-filled standart-input-no-message mt-4 mb-3"
        v-model="form.name"
        label="Name"
        :disabled="!isFormEditable"
        :rules="[rules.required]"
        color="dark_grey"
        filled
        rounded
        dense
      ></v-text-field>

      <div class="d-flex justify-space-between">
        <h3 class="form-title mt-2 mb-6">RKeeper settings</h3>
        <v-btn icon large color="#5B7FFE" @click="isSettingsOpen.rKeeperSettings = !isSettingsOpen.rKeeperSettings">
          <v-icon>{{ isSettingsOpen.rKeeperSettings ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
        </v-btn>
      </div>

      <v-row class="mb-8" v-show="isSettingsOpen.rKeeperSettings">
        <v-col class="py-0" cols="6" v-for="key of Object.keys(form.settings.rKeeperSettings)" :key="key">
          <v-autocomplete
            v-if="fieldTypes[key] && fieldTypes[key].type === 'select'"
            v-model="form.settings.rKeeperSettings[key]"
            :label="key"
            :disabled="!isFormEditable"
            class="standart-input-filled standart-input-no-message mb-6"
            :rules="[rules.required]"
            color="dark_grey"
            filled
            rounded
            dense
            :items="key === 'defaultMenuLanguageId' ? languages : deliveryMethods"
            :item-text="getItemText"
            item-value="id"
            @input="selectLang($event, key)"
          >
          </v-autocomplete>

          <v-checkbox
            v-else-if="fieldTypes[key] && fieldTypes[key].type === 'checkbox'"
            v-model="form.settings.rKeeperSettings[key]"
            :disabled="!isFormEditable"
            :label="key"
          />

          <v-text-field
            v-else
            v-model="form.settings.rKeeperSettings[key]"
            :label="key"
            class="standart-input-filled standart-input-no-message mb-6"
            :disabled="!isFormEditable"
            :rules="isRequiredField(key) ? [rules.required] : []"
            type="text"
            color="dark_grey"
            filled
            rounded
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <div class="d-flex justify-space-between">
        <h3 class="form-title mt-2 mb-6 d-flex align-center">
          <span>Wolt settings</span>
          <v-switch class="ma-0 ml-4" v-model="woltSwitch" dense hide-details :disabled="!boltSwitch"></v-switch>
        </h3>
        <v-btn
          v-if="woltSwitch"
          icon
          large
          color="#5B7FFE"
          @click="isSettingsOpen.woltSettings = !isSettingsOpen.woltSettings"
        >
          <v-icon>{{ isSettingsOpen.woltSettings ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
        </v-btn>
      </div>

      <v-row class="mb-8" v-if="isSettingsOpen.woltSettings && woltSwitch">
        <v-col class="py-0" cols="6" v-for="key of Object.keys(this.form.settings.woltSettings)" :key="key">
          <v-text-field
            v-if="key == 'venueId'"
            v-model="form.settings.woltSettings[key]"
            :label="key"
            class="standart-input-filled standart-input-no-message mb-6"
            :disabled="!isFormEditable"
            :rules="woltSwitch ? [rules.required] : []"
            type="text"
            color="dark_grey"
            :append-icon="isWoltVenueIdCopied ? 'mdi-check' : 'mdi-content-copy'"
            @click:append="copyClipboard('isWoltVenueIdCopied', form.settings.woltSettings[key])"
            filled
            rounded
            dense
          ></v-text-field>
          <v-text-field
            v-else
            v-model="form.settings.woltSettings[key]"
            :label="key"
            class="standart-input-filled standart-input-no-message mb-6"
            :disabled="!isFormEditable"
            :rules="woltSwitch ? [rules.required] : []"
            type="text"
            color="dark_grey"
            filled
            rounded
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <div class="d-flex justify-space-between">
        <h3 class="form-title mt-2 mb-6">Venue Self settings</h3>
        <v-btn icon large color="#5B7FFE" @click="isSettingsOpen.venueSelfSettings = !isSettingsOpen.venueSelfSettings">
          <v-icon>{{ isSettingsOpen.venueSelfSettings ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
        </v-btn>
      </div>

      <v-row class="mb-8" v-show="isSettingsOpen.venueSelfSettings">
        <v-col class="py-0" cols="6" v-if="!isNew">
          <v-text-field
            v-model="form.id"
            label="Venue Self Id"
            class="standart-input-filled standart-input-no-message mb-6"
            :readonly="!isNew"
            :rules="[rules.required]"
            type="text"
            color="dark_grey"
            :append-icon="isVenueSelfIdCopied ? 'mdi-check' : 'mdi-content-copy'"
            @click:append="copyClipboard('isVenueSelfIdCopied', form.id)"
            filled
            rounded
            dense
          >
          </v-text-field>
        </v-col>
        <v-col class="py-0" cols="6" v-if="!isNew">
          <v-text-field
            :value="formatDateTime(dateTimeFormats, form.menuUpdateTimeUtc)"
            label="Last menu sync time"
            class="standart-input-filled standart-input-no-message mb-6"
            :readonly="!isNew"
            :rules="[rules.required]"
            type="text"
            color="dark_grey"
            filled
            rounded
            dense
          >
          </v-text-field>
        </v-col>
        <v-col
          class="py-0"
          cols="6"
          v-for="key of Object.keys(this.form.settings.venueSelfSettings).filter(
            el => el !== 'boltExpiredDateUtc' && el !== 'woltExpiredDateUtc',
          )"
          :key="key"
        >
          <v-checkbox
            v-if="fieldTypes[key] && fieldTypes[key].type === 'checkbox'"
            v-model="form.settings.venueSelfSettings[key]"
            :disabled="!isFormEditable"
            :label="key"
          />

          <v-row v-else-if="fieldTypes[key] && fieldTypes[key].type === 'select'">
            <v-col cols="8">
              <v-autocomplete
                v-model="form.settings.venueSelfSettings[key]"
                :label="key"
                :disabled="!isFormEditable || isSelfImageSourceId"
                class="standart-input-filled standart-input-no-message mb-6"
                color="dark_grey"
                :items="getIdNames"
                item-text="name"
                item-value="id"
                @focus="getIdNamesFocused"
                :loading="idNamesLoading"
                @input="selectImageSourceId"
                loader-height="10"
                filled
                rounded
                dense
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="4">
              <v-checkbox v-model="isSelfImageSourceId" :disabled="!isFormEditable" label="Select this venue" />
            </v-col>
          </v-row>

          <v-text-field
            v-else-if="fieldTypes[key] && fieldTypes[key].type === 'number'"
            v-model="form.settings.venueSelfSettings[key]"
            :disabled="!isFormEditable"
            :label="key"
            class="standart-input-filled standart-input-no-message mb-6"
            type="number"
            filled
            rounded
            dense
            min="0"
            max="180"
          />

          <v-text-field
            v-else
            v-model="form.settings.venueSelfSettings[key]"
            :label="key"
            class="standart-input-filled standart-input-no-message mb-6"
            :disabled="!isFormEditable"
            :rules="[rules.required]"
            type="text"
            color="dark_grey"
            filled
            rounded
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <div class="d-flex justify-space-between">
        <h3 class="form-title mt-2 mb-6 d-flex align-center">
          <span>Bolt settings</span>
          <v-switch class="ma-0 ml-4" v-model="boltSwitch" dense hide-details :disabled="!woltSwitch"></v-switch>
        </h3>
        <v-btn
          v-if="boltSwitch"
          icon
          large
          color="#5B7FFE"
          @click="isSettingsOpen.boltSettings = !isSettingsOpen.boltSettings"
        >
          <v-icon>{{ isSettingsOpen.boltSettings ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
        </v-btn>
      </div>

      <template v-if="isSettingsOpen.boltSettings && this.boltSwitch">
        <v-row class="mb-8" v-show="isSettingsOpen.boltSettings">
          <v-col class="py-0" cols="6" v-for="key of Object.keys(this.form.settings.boltSettings)" :key="key">
            <v-text-field
              v-model="form.settings.boltSettings[key]"
              :label="key"
              class="standart-input-filled standart-input-no-message mb-6"
              :disabled="!isFormEditable"
              :rules="boltSwitch ? [rules.required] : []"
              type="text"
              color="dark_grey"
              filled
              rounded
              dense
            ></v-text-field>
          </v-col>
        </v-row>
      </template>

      <div class="d-flex justify-space-between">
        <h3 class="form-title mt-2 mb-6 d-flex align-center">Licenses</h3>
        <v-btn icon large color="#5B7FFE" @click="isSettingsOpen.licenses = !isSettingsOpen.licenses">
          <v-icon>{{ isSettingsOpen.licenses ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
        </v-btn>
      </div>

      <template v-if="isSettingsOpen.licenses">
        <v-row class="mb-8">
          <v-col v-for="expiredDate in ['boltExpiredDateUtc', 'woltExpiredDateUtc']" :key="expiredDate">
            <v-row no-gutters class="d-flex align-bottom">
              <v-col cols="8">
                <v-datetime-picker
                  :disabled="isLicenseEditDisabled"
                  :textFieldProps="dateTimeTextFieldProps"
                  :label="expiredDate"
                  v-model="form.settings.venueSelfSettings[expiredDate]"
                  :dateFormat="dateFormat"
                  :timeFormat="timeFormat"
                  @input="dateTimeChanged(expiredDate)"
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
                    :disabled="!isFormEditable || isLicenseEditDisabled"
                    label="Unlimited"
                  />
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col v-if="isRequestLicenseAllowed" cols="12">
            <Button
              text="Request license"
              styleType="primary"
              type="button"
              class="standart-button-content-width"
              @handleClick="requestLicenseHandler"
            />
          </v-col>
        </v-row>
      </template>

      <div class="d-flex align-center justify-space-between mt-4">
        <Button
          text="Cancel"
          styleType="secondary"
          type="button"
          class="standart-button-content-width"
          @handleClick="resetForm"
        />
        <Button
          text="Save"
          styleType="primary"
          type="submit"
          class="standart-button-content-width"
          :isLoading="isFormLoading"
        />
      </div>
    </v-form>
    <v-alert
      class="custom-alert"
      dismissible
      type="error"
      close-icon="mdi-window-close"
      :icon="false"
      :value="showExpiredAlert"
      >{{ expiredAlertMsg }}
    </v-alert>
    <VenueModal
      v-model="isVenueModalShow"
      :change-status="changeVenueStatus"
      :venue="venue"
      :isLoading="isFormLoading"
      :isWoltSettingsPresent="woltSettingsPresent"
      :isBoltSettingsPresent="boltSettingsPresent"
    />
    <MenuModal
      v-model="isMenuModalShow"
      :change-status="changeVenueStatus"
      :isLoading="isFormLoading"
      :venueId="venue.id"
    />
    <VenueScheduleModal
      v-model="isScheduleModalShow"
      :change-schedule="changeVenueSchedule"
      :is-schedule-loading="isScheduleLoading"
      :schedule="schedule.availability"
    />
    <SelectGroupModal v-model="selectionGroupModalShown" @saveGroupId="changeGroupId" />
    <RequestLicenseModal v-model="reqLicenseModalShown" @sendReqLicForm="sendReqLicHandler" />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { TOAST_TYPES, VENUE_STATUSES, VENUE_FIELDS, DEFAULT_SCHEDULE } from '@/data';
import Button from '@/components/commonComponents/Button';
import VenueModal from '@/components/modals/VenueModal';
import MenuModal from '@/components/modals/MenuModal';
import VenueScheduleModal from '@/components/modals/VenueScheduleModal';
import SelectGroupModal from '@/components/modals/SelectGroupModal';
import RequestLicenseModal from './modals/RequestLicenseModal.vue';
import dateFormat from '../mixins/date-format';


export default {
  name: 'VenueForm',
  components: {
    VenueModal,
    MenuModal,
    VenueScheduleModal,
    Button,
    SelectGroupModal,
    RequestLicenseModal,
  },
  mixins: [dateFormat],
  data() {
    return {
      isFormValid: false,
      fieldTypes: { ...VENUE_FIELDS },
      isSettingsOpen: {
        rKeeperSettings: false,
        woltSettings: false,
        venueSelfSettings: false,
        boltSettings: false,
        licenses: false,
      },
      schedule: {
        availability: [],
      },
      form: {
        id: '',
        name: '',
        groupId: this.venueGroupFormId,
        isOnline: null,
        menuUpdateTimeUtc: '',
        settings: {
          rKeeperSettings: {
            ip: '',
            port: '',
            login: '',
            pwd: '',
            stationIdent: '',
            tableIdent: '',
            waiterIdent: '',
            receiptMaketIdent: '',
            voidIdent: '',
            orderTypeIdent: '',
            taxIdent: '',
            woltRootSelectorIdent: '',
            boltRootSelectorIdent: '',
            woltCurrencyIdent: '',
            boltCurrencyIdent: '',
            printPurposeIdent: '',
            defaultMenuLanguageId: '',
            defaultDeliveryMethod: '',
            comboTaxRate: '',
            isPayOrderEnabled: false,
            isDebugMode: false,
            isAutoPrintEnabled: false,
            isUseComboName: false,
          },
          woltSettings: {
            url: '',
            login: '',
            pwd: '',
            venueId: '',
            apiKey: '',
          },
          venueSelfSettings: {
            woltExpiredDateUtc: '1969-12-31T18:00:00.000Z',
            boltExpiredDateUtc: '1969-12-31T18:00:00.000Z',
            defaultCookingTimeInMinutes: 1,
            autoAcceptTimeInSeconds: 1,
            imageSourceId: '',
            isPrintOrderEnabled: false,
            isAutoAcceptEnabled: false,
            isAutoPickedUpEnabled: false,
            isAutoSyncMenuEnabled: false,
            iisSingleModifierModeEnabled: false,
          },
          boltSettings: {
            url: '',
            providerId: '',
          },
        },
      },
      rules: {
        required: value => {
          if (value === 0) {
            return true;
          }
          return !!value || 'Required field';
        },
      },
      isVenueSelfIdCopied: false,
      isWoltVenueIdCopied: false,
      isNew: true,
      dateTimeTextFieldProps: {
        class: 'standart-input-filled standart-input-no-message',
        filled: true,
        rounded: true,
        dense: true,
      },
      isVenueModalShow: false,
      isMenuModalShow: false,
      isScheduleModalShow: false,
      isSyncingMenu: false,
      dateTimeFormats: {
        dateOrder: 0,
        dateSeparator: '.',
        timeFormat: 0,
      },
      expDateUnlimModel: {
        woltExpiredDateUtc: false,
        boltExpiredDateUtc: false,
      },
      woltSwitch: true,
      boltSwitch: true,
      isSelfImageSourceId: false,
      idNamesLoading: false,
      getIdNamesWasFocused: false,
      showExpiredAlert: false,
      expiredAlertMsg: '',
      selectionGroupModalShown: false,
      reqLicenseModalShown: false,
      woltSettingsPresent: false,
      boltSettingsPresent: false,
      hasAvailability: false,
    };
  },
  props: {
    venue: {
      type: Object,
    },
    isFormEditable: {
      type: Boolean,
      default: false,
    },
    isScheduleLoading: {
      type: Boolean,
      default: false,
    },
    venueGroupFormId: {
      type: Number,
      default: 0,
    },
    isFormLoading: {
      type: Boolean,
      default: false,
    },
    clearForm: {
      type: Boolean,
      default: false,
    },
    shouldPopulateForm: {
      type: Boolean,
      default: false,
    },
    isCheckingRk: {
      type: Boolean,
      default: false,
    },
    isCheckingWolt: {
      type: Boolean,
      default: false,
    },
    isCheckingBolt: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    'form.name'(newVal) {
      this.$emit('nameUpdate', newVal);
    },
    clearForm(newVal) {
      if (newVal) {
        this.resetForm();
      }
    },
    venue: {
      immediate: true,
      deep: true,
      handler() {
        if (this.shouldPopulateForm === true && Object.prototype.hasOwnProperty.call(this.venue, 'settings')) {
          this.populateForm();
          this.isNew = false;
        }
      },
    },
    shouldPopulateForm(newVal) {
      if (newVal) {
        this.populateForm();
        this.isNew = false;
      }
    },
    isSelfImageSourceId(e) {
      if (e === true) this.form.settings.venueSelfSettings.imageSourceId = null;
    },
  },
  computed: {
    ...mapGetters({
      getRoles: 'app/getRoles',
      getLanguages: 'venues/getLanguages',
      getDeliveryMethods: 'venues/getDeliveryMethods',
      getActiveVenueGroupId: 'venueGroups/getActiveVenueGroupId',
      getGeneralSettings: 'app/getGeneralSettings',
      getIdNames: 'venues/getIdNames',
      getMenu: 'venues/getMenu',
    }),
    languages() {
      return this.getLanguages;
    },
    deliveryMethods() {
      return this.getDeliveryMethods;
    },
    venueStatus() {
      if (!Object.prototype.hasOwnProperty.call(this.venue, 'isOnline')) return { color: 'white' };
      else return VENUE_STATUSES.find(el => el.value === this.venue.isOnline);
    },
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
    isLicenseEditDisabled() {
      return this.getRoles.includes('Manager') || this.getRoles.includes('Dealer');
    },
    isRequestLicenseAllowed() {
      return this.getRoles[0].toLowerCase() === 'dealer';
    },
  },
  methods: {
    ...mapActions({
      updateMenuToDB: 'venues/updateMenuToDB',
      fetchIdNames: 'venues/fetchIdNames',
      fetchMenu: 'venues/fetchMenu',
      addLicReq: 'licRequests/addItemToDB',
    }),
    ...mapMutations({
      changeShowExpMsg: 'app/changeShowExpMsg',
      setMenu: 'venues/setMenu',
      setLastUpdateTime: 'venues/setLastUpdateTime',
    }),
    isRequiredField(field) {
      let res = true;
      switch (field) {
        case 'boltCurrencyIdent':
          if (!this.boltSwitch) res = false;
          break;
        case 'woltCurrencyIdent':
          if (!this.woltSwitch) res = false;
          break;
        case 'boltRootSelectorIdent':
          if (!this.boltSwitch) res = false;
          break;
        case 'woltRootSelectorIdent':
          if (!this.woltSwitch) res = false;
          break;
      }
      return res;
    },
    changeGroupId(id) {
      this.form.groupId = id;
    },
    validateForm(ref) {
      this.isFormValid = this.$refs[ref].validate();

      if (!this.form.settings.venueSelfSettings.imageSourceId && !this.isSelfImageSourceId) {
        this.isFormValid = false;
        this.$notify.toast('Please select image source id or select this venue!', TOAST_TYPES.ERROR);
      }

      if (!this.form.groupId) {
        if (!this.venue.groupId && !this.getActiveVenueGroupId && !this.venueGroupFormId)
          this.selectionGroupModalShown = true;
        else
          this.form.groupId = this.venue.groupId
            ? this.venue.groupId
            : this.getActiveVenueGroupId
            ? this.getActiveVenueGroupId
            : this.venueGroupFormId;
      }
      if (this.isFormValid) {
        let formToSend = JSON.parse(JSON.stringify(this.form));
        let defCookingTime = Number(formToSend.settings.venueSelfSettings.defaultCookingTimeInMinutes);
        let autoAcceptTime = Number(formToSend.settings.venueSelfSettings.autoAcceptTimeInSeconds);
        formToSend.settings.venueSelfSettings.defaultCookingTimeInMinutes = defCookingTime;
        formToSend.settings.venueSelfSettings.autoAcceptTimeInSeconds = autoAcceptTime;
        delete formToSend.status;
        delete formToSend.isOnline;

        if (!this.woltSwitch) {
          formToSend.settings.woltSettings = null;
          this.form.settings.woltSettings = {
            url: '',
            login: '',
            pwd: '',
            venueId: '',
            apiKey: '',
          };
        }

        if (!this.boltSwitch) {
          formToSend.settings.boltSettings = null;
          this.form.settings.boltSettings = {
            url: '',
            providerId: '',
          };
        }

        this.$emit('submitForm', 'venue', formToSend);
        this.checkAndUpdateLicense();
      } else {
        this.isSettingsOpen = {
          rKeeperSettings: true,
          woltSettings: true,
          venueSelfSettings: true,
          boltSettings: true,
          licenses: true,
        };
        this.$notify.toast('Please fill in required fields!', TOAST_TYPES.ERROR);
      }
    },
    resetForm() {
      this.$emit('resetForm');
    },
    selectLang(e, key) {
      if (key === 'defaultMenuLanguageId') {
        this.form.settings.rKeeperSettings.defaultMenuLanguageId = e;
      }
    },
    populateForm() {
      if (this.venue.settings) {
        this.checkAndUpdateLicense();
      }

      if (this.venue && Object.prototype.hasOwnProperty.call(this.venue, 'settings')) {
        console.log(this.venue.info);
        this.schedule =
          this.venue.info.schedule && this.venue.info.schedule.availability.length > 0
            ? { ...this.venue.info.schedule }
            : { availability: [...DEFAULT_SCHEDULE] };
        this.form = {
          id: this.venue.id,
          name: this.venue.name,
          isOnline: this.venue.isOnline,
          menuUpdateTimeUtc: this.venue.menuUpdateTimeUtc,
          isWoltLicensed: this.venue.isWoltLicensed,
          isBoltLicensed: this.venue.isBoltLicensed,
          settings: {
            rKeeperSettings: {
              ip: this.venue.settings.rKeeperSettings.ip,
              port: this.venue.settings.rKeeperSettings.port,
              login: this.venue.settings.rKeeperSettings.login,
              pwd: this.venue.settings.rKeeperSettings.pwd,
              stationIdent: this.venue.settings.rKeeperSettings.stationIdent,
              tableIdent: this.venue.settings.rKeeperSettings.tableIdent,
              waiterIdent: this.venue.settings.rKeeperSettings.waiterIdent,
              receiptMaketIdent: this.venue.settings.rKeeperSettings.receiptMaketIdent,
              woltRootSelectorIdent: this.venue.settings.rKeeperSettings.woltRootSelectorIdent,
              boltRootSelectorIdent: this.venue.settings.rKeeperSettings.boltRootSelectorIdent,
              woltCurrencyIdent: this.venue.settings.rKeeperSettings.woltCurrencyIdent,
              boltCurrencyIdent: this.venue.settings.rKeeperSettings.boltCurrencyIdent,
              voidIdent: this.venue.settings.rKeeperSettings.voidIdent,
              orderTypeIdent: this.venue.settings.rKeeperSettings.orderTypeIdent,
              taxIdent: this.venue.settings.rKeeperSettings.taxIdent,
              comboTaxRate: this.venue.settings.rKeeperSettings.comboTaxRate,
              printPurposeIdent: this.venue.settings.rKeeperSettings.printPurposeIdent,
              defaultMenuLanguageId: this.venue.settings.rKeeperSettings.defaultMenuLanguageId,
              defaultDeliveryMethod: this.venue.settings.rKeeperSettings.defaultDeliveryMethod,
              isPayOrderEnabled: this.venue.settings.rKeeperSettings.isPayOrderEnabled,
              isDebugMode: this.venue.settings.rKeeperSettings.isDebugMode,
              isAutoPrintEnabled: this.venue.settings.rKeeperSettings.isAutoPrintEnabled,
              isUseComboName: this.venue.settings.rKeeperSettings.isUseComboName,
            },

            woltSettings: this.venue.settings.woltSettings
              ? {
                  url: this.venue.settings.woltSettings.url,
                  login: this.venue.settings.woltSettings.login,
                  pwd: this.venue.settings.woltSettings.pwd,
                  venueId: this.venue.settings.woltSettings.venueId,
                  apiKey: this.venue.settings.woltSettings.apiKey,
                }
              : {
                  url: '',
                  login: '',
                  pwd: '',
                  venueId: '',
                  apiKey: '',
                },
            venueSelfSettings: {
              woltExpiredDateUtc: new Date(this.venue.settings.venueSelfSettings.woltExpiredDateUtc),
              boltExpiredDateUtc: new Date(this.venue.settings.venueSelfSettings.boltExpiredDateUtc),
              defaultCookingTimeInMinutes: this.venue.settings.venueSelfSettings.defaultCookingTimeInMinutes,
              autoAcceptTimeInSeconds: this.venue.settings.venueSelfSettings.autoAcceptTimeInSeconds,
              imageSourceId: this.venue.settings.venueSelfSettings.imageSourceId,
              isPrintOrderEnabled: this.venue.settings.venueSelfSettings.isPrintOrderEnabled,
              isAutoAcceptEnabled: this.venue.settings.venueSelfSettings.isAutoAcceptEnabled,
              isAutoPickedUpEnabled: this.venue.settings.venueSelfSettings.isAutoPickedUpEnabled,
              isAutoSyncMenuEnabled: this.venue.settings.venueSelfSettings.isAutoSyncMenuEnabled,
              isSingleModifierModeEnabled: this.venue.settings.venueSelfSettings.isSingleModifierModeEnabled,
            },
            boltSettings: this.venue.settings.boltSettings
              ? {
                  url: this.venue.settings.boltSettings.url,
                  providerId: this.venue.settings.boltSettings.providerId,
                }
              : {
                  url: '',
                  providerId: '',
                },
          },
        };

        if (!this.venue.settings.venueSelfSettings.imageSourceId) this.isSelfImageSourceId = true;

        if (Object.prototype.hasOwnProperty.call(this.venue.settings.venueSelfSettings, 'boltExpiredDateUtc')) {
          this.expDateUnlimModel.boltExpiredDateUtc = false;
        } else {
          this.expDateUnlimModel.boltExpiredDateUtc = true;
        }
        if (Object.prototype.hasOwnProperty.call(this.venue.settings.venueSelfSettings, 'woltExpiredDateUtc')) {
          this.expDateUnlimModel.woltExpiredDateUtc = false;
        } else {
          this.expDateUnlimModel.woltExpiredDateUtc = true;
        }

        const woltSetPresent = Object.prototype.hasOwnProperty.call(this.venue.settings, 'woltSettings');
        const boltSetPresent = Object.prototype.hasOwnProperty.call(this.venue.settings, 'boltSettings');
        const hasAvailab = Object.prototype.hasOwnProperty.call(this.venue.info, 'availability');

        this.woltSettingsPresent = woltSetPresent;
        this.boltSettingsPresent = boltSetPresent;
        this.hasAvailability = hasAvailab;

        this.woltSwitch = woltSetPresent;
        this.boltSwitch = boltSetPresent;
      }

      let venueGroupId;
      if (this.venue.groupId) {
        venueGroupId = this.venue.groupId;
      } else if (this.venueGroupFormId) {
        venueGroupId = this.venueGroupFormId;
      } else {
        venueGroupId = '';
      }
      this.fetchIdNames(venueGroupId).then(() => {
        this.idNamesLoading = false;
      });

      if (this.getRoles[0].toLowerCase() === 'manager' || this.$route.params.id) {
        this.venueId = this.$route.params.id;
      }
    },
    checkRk() {
      this.$emit('checkConnection', 'rk');
    },
    checkWolt() {
      this.$emit('checkConnection', 'wolt');
    },
    checkBolt() {
      this.$emit('checkConnection', 'bolt');
    },
    changeVenueStatus(disId, isOnline) {
      let dataToSend = {
        id: this.venue.id,
        distributorId: disId,
        isOnline: isOnline,
      };
      this.$emit('changeCurrentVenueStatus', dataToSend);
    },
    changeVenueSchedule(schedule) {
      this.$emit('changeSchedule', schedule);
    },
    openVenueModal() {
      this.isVenueModalShow = true;
    },
    closeVenueModal() {
      this.isVenueModalShow = false;
    },
    async openMenuModal() {
      if(localStorage.getItem(this.venue.id)) {
        await this.setMenu(JSON.parse(localStorage.getItem(this.venue.id)).menu)
        await this.setLastUpdateTime(JSON.parse(localStorage.getItem(this.venueId)).lastUpdateTime)
        this.isMenuModalShow = true;
      }else {
        const menu = await this.fetchMenu(this.venue.id);
        const date = new Date()
        this.setLastUpdateTime(date)
        localStorage.setItem(this.venue.id, JSON.stringify({menu, lastUpdateTime: date}))
        this.isMenuModalShow = true;
      }
    },
    closeMenuModal() {
      this.isMenuModalShow = false;
    },
    openVenueScheduleModal() {
      this.isScheduleModalShow = true;
    },
    closeVenueScheduleModal() {
      this.isScheduleModalShow = false;
    },
    copyClipboard(iconState, value) {
      navigator.clipboard.writeText(value);
      this[iconState] = true;
      if (iconState == 'isVenueSelfIdCopied') {
        this.isWoltVenueIdCopied = false;
      } else {
        this.isVenueSelfIdCopied = false;
      }
    },
    getItemText(item) {
      return item.rKeeperName ? `${item.name} - ${item.rKeeperName}` : item.name;
    },
    unlimCheckboxChange(val, key) {
      if (val) {
        this.form.settings.venueSelfSettings[key] = null;
      }
    },
    dateTimeChanged(key) {
      this.expDateUnlimModel[key] = false;
    },
    getIdNamesFocused() {
      this.getIdNamesWasFocused;
      if (!this.getIdNamesWasFocused && this.isNew) {
        this.getIdNamesFocused = true;
        this.idNamesLoading = true;
        let venueGroupId;
        if (this.venue.groupId) {
          venueGroupId = this.venue.groupId;
        } else if (this.venueGroupFormId) {
          venueGroupId = this.venueGroupFormId;
        } else {
          venueGroupId = '';
        }
        this.fetchIdNames(venueGroupId)
          .then(() => {
            this.idNamesLoading = false;
          })
          .catch(() => {
            this.idNamesLoading = false;
          });
      }
    },
    selectImageSourceId(e) {
      this.form.settings.venueSelfSettings.imageSourceId = e;
    },
    checkAndUpdateLicense() {
      let isWoltLicensed = this.venue.isWoltLicensed;
      let isBoltLicensed = this.venue.isBoltLicensed;

      if (!isWoltLicensed && !isBoltLicensed) {
        this.showExpiredAlert = true;
        this.expiredAlertMsg = 'Wolt and Bolt licenses are expired!';
        return;
      }

      if (!isWoltLicensed) {
        this.expiredAlertMsg = 'Wolt license is expired!';
        this.showExpiredAlert = true;
        return;
      }

      if (!isBoltLicensed) {
        this.expiredAlertMsg = 'Bolt license is expired!';
        this.showExpiredAlert = true;
        return;
      }

      this.showExpiredAlert = false;
    },
    changeExpLicenseHandler() {
      this.changeShowExpMsg(false);
    },
    requestLicenseHandler() {
      this.reqLicenseModalShown = true;
    },
    async sendReqLicHandler(comment) {
      this.reqLicenseModalShown = false;
      let form = {
        venueId: this.venue.id,
        comment: comment,
      };
      try {
        let data = await this.addLicReq(form);
        if (data.status <= 300) {
          this.$notify.toast('License request has successfully been sent!', TOAST_TYPES.SUCCESS);
        }
      } catch (err) {
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
    },
    statusColor(provider) {
      const has = Object.prototype.hasOwnProperty.call(this.venue.info, 'availability');
      if (provider === 'wolt' && has && this.woltSettingsPresent) {
        return this.venue.info.availability.wolt ? 'green' : 'red';
      }
      if (provider === 'bolt' && has && this.boltSettingsPresent) {
        return this.venue.info.availability.bolt ? 'green' : 'red';
      }
      return '#ccc';
    },
  },
};
</script>

<style lang="scss" scoped>
.status-circle {
  width: 40px;
  height: 40px;
  padding: 5px;
  text-align: center;
  border-radius: 50%;
  border: 1px solid gray;
}

.datetime-unlim-checkbox {
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 18px !important;
  background: #f0f0f0;
  height: 58px;
  box-sizing: border-box;
}

.status-tag {
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 7px;
  display: flex;
  align-items: center;
}
</style>
