<template>
  <v-app class="app-wrapper">
    <v-main>
      <div class="preloader" v-if="showProgress">
        <v-progress-circular indeterminate :size="70" :width="7" color="primary" />
      </div>
      <transition>
        <router-view />
      </transition>
    </v-main>
    <div v-if="allowAlert">
      <v-alert
        class="custom-alert"
        dismissible
        type="error"
        close-icon="mdi-window-close"
        :icon="false"
        :value="showExpiredAlert && getShowExpMsg"
        @input="changeExpLicenseHandler"
        >{{ expiredAlertMsg }}
      </v-alert>
    </div>
  </v-app>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'App',
  data: () => ({
    //
    showExpiredAlert: false,
    expiredAlertMsg: '',
    allowAlert: true,
  }),
  watch: {
    getCurrentVenue: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.checkAndUpdateLicense();
          this.changeShowExpMsg(true);
        }
      },
    },
    '$route.name': {
      handler(val) {
        if (val === 'login' || val === null) {
          this.allowAlert = false;
        } else {
          this.allowAlert = true;
        }
      },
    },
  },
  computed: {
    ...mapGetters({
      getCurrentVenue: 'app/getCurrentVenue',
      getShowExpMsg: 'app/getShowExpMsg',
    }),
    showProgress() {
      return this.getLoading;
    },
    isInitApp() {
      return this.getInit;
    },
    getUserAuth() {
      return this.getAuth;
    },
  },
  methods: {
    ...mapMutations({
      changeShowExpMsg: 'app/changeShowExpMsg',
    }),
    checkAndUpdateLicense() {
      if (Object.prototype.hasOwnProperty.call(this.getCurrentVenue, 'isWoltLicensed')) {
        let isWoltLicensed = this.getCurrentVenue.isWoltLicensed;
        let isBoltLicensed = this.getCurrentVenue.isBoltLicensed;

        if (!isWoltLicensed && !isBoltLicensed) {
          this.showExpiredAlert = true;
          this.expiredAlertMsg = 'Wolt and Bolt licenses are expired!';
          return;
        }

        if (!isWoltLicensed) {
          this.expiredAlertMsg = 'Wolt license is expired!';
          this.showExpiredAlert = true;
        } else {
          this.showExpiredAlert = false;
        }

        if (!isBoltLicensed) {
          this.expiredAlertMsg = 'Bolt license is expired!';
          this.showExpiredAlert = true;
        } else {
          this.showExpiredAlert = false;
        }
      } else {
        this.showExpiredAlert = false;
      }
    },
    changeExpLicenseHandler() {
      this.changeShowExpMsg(false);
    },
  },
};
</script>

<style lang="scss">
//1024 * 768
.main-header {
  .v-toolbar__content {
    border-bottom: 1px solid #b4b4b4;
  }
}

.preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
}
</style>
