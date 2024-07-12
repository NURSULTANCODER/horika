<template>
  <div>
    <Header :drawer-show="setInputToggleDrawer" />
    <router-view />
    <v-navigation-drawer v-model="isDrawerShow" temporary right fixed width="340">
      <div class="drawer-block">
        <div class="drawer-block-top pa-5 d-flex align-center justify-space-between">
          <h2>Settings</h2>
          <v-btn @click="setInputToggleDrawer(false)" large icon color="black"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-divider></v-divider>

        <v-switch
          @change="switchSoundNotifSet"
          class="px-4"
          v-model="generalSettings.soundNotif"
          inset
          label="Sound notifications"
        ></v-switch>

        <div v-if="isDrawerFieldShow('status')" class="drawer-block-middle pa-2">
          <div v-if="hasAvailability">
            <div v-if="isWoltSettingsPresent" class="d-flex align-center mb-2">
              <div :style="`background-color: ${statusColor('wolt')}`" class="status-circle"></div>
              <h3>Wolt Status</h3>
            </div>
            <div v-if="isBoltSettingsPresent" class="d-flex align-center mb-2">
              <div :style="`background-color: ${statusColor('bolt')}`" class="status-circle"></div>
              <h3>Bolt Status</h3>
            </div>
          </div>

          <Button
            v-if="(isWoltSettingsPresent || isBoltSettingsPresent) && hasAvailability"
            text="Change status"
            type="button"
            styleType="secondary"
            @handleClick="openVenueModal"
          />
          <Button
            v-if="isDrawerFieldShow('checkRk')"
            class="mt-3"
            text="Check Rkeeper"
            type="button"
            :isLoading="isCheckingRk"
            @handleClick="checkEntityConnection('rk')"
          />
          <Button
            v-if="isDrawerFieldShow('checkWolt') && isWoltSettingsPresent && hasAvailability"
            class="mt-3"
            text="Check Wolt"
            type="button"
            :isLoading="isCheckingWolt"
            @handleClick="checkEntityConnection('wolt')"
          />
          <Button
            v-if="isDrawerFieldShow('checkBolt') && isBoltSettingsPresent && hasAvailability"
            class="mt-3"
            text="Check Bolt"
            type="button"
            :isLoading="isCheckingBolt"
            @handleClick="checkEntityConnection('bolt')"
          />
          <Button
            v-if="isDrawerFieldShow('updateMenu')"
            class="mt-3"
            text="Update menu now"
            type="button"
            styleType="secondary"
            :isLoading="isLoading"
            @handleClick="openMenuModal"
          />
        </div>

        <div class="drawer-block-middle pa-2">
          <Button
            :text="showDateTimeSettings ? 'Hide date/time settings' : 'Show date/time settings'"
            type="button"
            styleType="secondary"
            @handleClick="showDateTimeSettings = !showDateTimeSettings"
          />
        </div>

        <div
          v-if="showDateTimeSettings"
          style="border: 1px #a2a2a2 solid; border-radius: 15px; margin: 0 5px 10px 5px; padding: 5px"
        >
          <div class="px-5 d-flex align-center justify-space-between">
            <p>Time format</p>
            <div>
              <v-radio-group v-model="generalSettings.timeFormat" class="ma-0">
                <v-radio label="12 hours (AM/PM)" :value="1" />
                <v-radio label="24 hours" :value="2" />
              </v-radio-group>
            </div>
          </div>

          <div class="px-5 d-flex align-center justify-space-between">
            <p>Order in date</p>
            <div>
              <v-radio-group v-model="generalSettings.dateOrder" class="ma-0">
                <v-radio label="DD MM YYYY" :value="1" />
                <v-radio label="MM DD YYYY" :value="2" />
              </v-radio-group>
            </div>
          </div>

          <div class="px-5 d-flex align-center justify-space-between">
            <p>Separator in date</p>
            <div>
              <v-radio-group v-model="generalSettings.dateSeparator" class="ma-0">
                <v-radio label="Point '.'" value="." />
                <v-radio label="Slash '/'" value="/" />
              </v-radio-group>
            </div>
          </div>
          <div class="px-2 d-flex align-center justify-space-between">
            <Button text="Save" type="button" @handleClick="saveGeneralSettings" />
          </div>
        </div>

        <div class="drawer-block-middle pa-2">
          <Button
            :text="showOrderCardSettings ? 'Hide order card settings' : 'Show order card settings'"
            type="button"
            styleType="secondary"
            @handleClick="showOrderCardSettings = !showOrderCardSettings"
          />
        </div>

        <div
          v-if="showOrderCardSettings"
          style="border: 1px #a2a2a2 solid; border-radius: 15px; margin: 0 5px 10px 5px; padding: 5px"
        >
          <div class="px-5 d-flex align-center justify-space-between">
            <p>Order card mode</p>
            <div>
              <v-radio-group v-model="generalSettings.orderCardMode" class="ma-0">
                <v-radio label="Expanded" :value="1" />
                <v-radio label="Popup" :value="2" />
              </v-radio-group>
            </div>
          </div>

          <div class="px-2 d-flex align-center justify-space-between">
            <Button text="Save" type="button" @handleClick="saveGeneralSettings" />
          </div>
        </div>
      </div>
    </v-navigation-drawer>
    <VenueModal
      v-model="isVenueModalShow"
      :change-status="changeVenueStatus"
      :venue="currentVenue"
      :isLoading="getLoading"
      :isWoltSettingsPresent="isWoltSettingsPresent"
      :isBoltSettingsPresent="isBoltSettingsPresent"
    />
    <MenuModal
      v-model="isMenuModalShow"
      :change-status="changeVenueStatus"
      :venueId="getUserData.venueId"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import Header from '@/components/Header';
import Button from '@/components/commonComponents/Button';
import { VENUE_STATUSES, TOAST_TYPES, NAVIGATION_DRAWER_FIELDS } from '@/data';
import VenueModal from '@/components/modals/VenueModal';
import MenuModal from '@/components/modals/MenuModal';

export default {
  name: 'MainLayout',
  components: { Header, Button, VenueModal, MenuModal },
  data() {
    return {
      isVenueModalShow: false,
      isCheckingConnection: false,
      isUpdatingMenu: false,
      showDateTimeSettings: false,
      generalSettings: {},
      isDrawerShow: false,
      isCheckingRk: false,
      isCheckingWolt: false,
      isCheckingBolt: false,
      showOrderCardSettings: false,
      isMenuModalShow: false,
      isLoading: false,
    };
  },
  mounted() {
    if (localStorage.getItem('settings')) {
      this.setGeneralSettings(JSON.parse(localStorage.getItem('settings')));
    }
    this.generalSettings = { ...this.getGeneralSettings };

    this.$orderHub.client.on('SendVenueStatus', status => {
      let dataToSend = {
        venueId: status.id,
        info: status.info,
        field: 'availability',
      };
      this.checkAndEditCurrentVenue(dataToSend);
      this.checkAndEditVenue(dataToSend);
    });
  },
  computed: {
    ...mapGetters('app', ['getUserData', 'getInit', 'getRoles', 'getLoading', 'getAuth', 'getCurrentVenue', 'getGeneralSettings']),
    showProgress() {
      return this.getLoading;
    },
    isInitApp() {
      return this.getInit;
    },
    getUserAuth() {
      return this.getAuth;
    },
    currentVenue() {
      return this.getCurrentVenue;
    },
    venueStatus() {
      if (!Object.prototype.hasOwnProperty.call(this.getCurrentVenue, 'isOnline')) {
        return { color: 'white' };
      }
      return VENUE_STATUSES.find(el => el.value === this.getCurrentVenue.isOnline);
    },
    isCurrentVenueFetched() {
      let isFetched = Object.prototype.hasOwnProperty.call(this.getCurrentVenue, 'id');
      return isFetched;
    },
    isWoltSettingsPresent() {
      if (!this.isCurrentVenueFetched) return false;
      let isPresent = Object.prototype.hasOwnProperty.call(this.getCurrentVenue.settings, 'woltSettings');
      return isPresent;
    },
    isBoltSettingsPresent() {
      if (!this.isCurrentVenueFetched) return false;
      let isPresent = Object.prototype.hasOwnProperty.call(this.getCurrentVenue.settings, 'boltSettings');
      return isPresent;
    },
    hasAvailability() {
      let isPresent = Object.prototype.hasOwnProperty.call(this.getCurrentVenue.info, 'availability');
      return isPresent;
    }
  },
  methods: {
    ...mapMutations({
      setGeneralSettings: 'app/setGeneralSettings',
      setSoundNotifSetting: 'app/setSoundNotifSetting',
      checkAndEditCurrentVenue: 'app/checkAndEditCurrentVenue',
      checkAndEditVenue: 'venues/checkAndEditVenue',
      setMenu: 'venues/setMenu',
      setLastUpdateTime: 'venues/setLastUpdateTime',
    }),
    ...mapActions('venues', ['changeAvailability', 'updateMenuToDB', 'checkConnection', 'fetchMenu']),
    switchSoundNotifSet(val) {
      this.setSoundNotifSetting(val);
    },
    setInputToggleDrawer(val) {
      this.isDrawerShow = val;
    },
    statusColor(provider) {
      const has = Object.prototype.hasOwnProperty.call(this.currentVenue.info, 'availability');
      if (provider === 'wolt' && has) {
        return this.currentVenue.info.availability.wolt ? 'green' : 'red';
      }
      if (provider === 'bolt' && has) {
        return this.currentVenue.info.availability.bolt ? 'green' : 'red';
      }
      return '#ccc';
    },
    isDrawerFieldShow(field) {
      if (!this.getRoles) {
        return false;
      }
      return NAVIGATION_DRAWER_FIELDS[this.getRoles[0].toUpperCase()].includes(field);
    },
    saveGeneralSettings() {
      try {
        this.setGeneralSettings(this.generalSettings);
        this.$notify.toast('Settings has been successfully edited!', TOAST_TYPES.SUCCESS);
      } catch (err) {
        this.$notify.toast("Settings hasn't been edited!", TOAST_TYPES.ERROR);
      }
    },
    openVenueModal() {
      this.isVenueModalShow = true;
    },
    closeVenueModal() {
      this.isVenueModalShow = false;
    },
    async changeVenueStatus(disId, isOnline) {
      try {
        let dataToSend = {
          id: this.getCurrentVenue.id,
          distributorId: disId,
          isOnline: isOnline,
        };
        await this.changeAvailability(dataToSend);
      } catch (err) {
        console.log('err', err);
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
    },
    async checkEntityConnection(type) {
      let entityToCheck = {};

      let role = this.getRoles[0].toLowerCase();

      if (role === 'operator' || role === 'manager') {
        entityToCheck.id = this.getCurrentVenue.id;
      } else {
        entityToCheck.id = this.venueId;
      }

      if (type === 'rk') {
        entityToCheck.loading = 'isCheckingRk';
        entityToCheck.distributorId = 20;
      } else if (type === 'wolt') {
        entityToCheck.loading = 'isCheckingWolt';
        entityToCheck.distributorId = 1;
      } else if (type === 'bolt') {
        entityToCheck.loading = 'isCheckingBolt';
        entityToCheck.distributorId = 2;
      }

      this[entityToCheck.loading] = true;
      try {
        let data = await this.checkConnection(entityToCheck);
        if (Object.prototype.hasOwnProperty.call(data, 'isOk')) {
          if (data.isOk) {
            this.$notify.toast('Ok!', TOAST_TYPES.SUCCESS);
          } else {
            this.$notify.toast(data.errorText, TOAST_TYPES.ERROR);
          }
        } else {
          this.$notify.toast(data, TOAST_TYPES.ERROR);
        }
        this[entityToCheck.loading] = false;
      } catch (err) {
        console.log(err);
        this[entityToCheck.loading] = false;
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
    },
    async openMenuModal() {
      this.isLoading = true
      if(localStorage.getItem(this.getUserData.venueId)) {
        await this.setMenu(JSON.parse(localStorage.getItem(this.getUserData.venueId)).menu)
        await this.setLastUpdateTime(JSON.parse(localStorage.getItem(this.getUserData.venueId)).lastUpdateTime)
        this.isMenuModalShow = true;
      }else {
        const menu = await this.fetchMenu(this.getUserData.venueId);
        const date = new Date()
        this.setLastUpdateTime(date)
        localStorage.setItem(this.getUserData.venueId, JSON.stringify({menu, lastUpdateTime: date}))
        this.isMenuModalShow = true;
      }
      this.isLoading = false
    },
    closeMenuModal() {
      this.isMenuModalShow = false;
    },
  },
};
</script>

<style>
.status-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
