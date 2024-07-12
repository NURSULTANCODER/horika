<template>
  <v-container class="pa-6" fluid>
    <v-row>
      <v-col class="col-lg-3 col-md-12 col-12">
        <h2 class="sidebar-title mb-lg-6">{{ title }}</h2>
      </v-col>
      <v-col class="col-lg-8 col-xl-6 col-md-12">
        <div class="standart-card">
          <VenueForm
            :venue="venue"
            :key="venueFormKey"
            :isFormEditable="true"
            :venueGroupFormId="venueGroupFormId"
            :shouldPopulateForm="shouldPopulateForm"
            :isFormLoading="isLoading"
            :isCheckingRk="isCheckingRk"
            :isCheckingWolt="isCheckingWolt"
            :isCheckingBolt="isCheckingBolt"
            :is-schedule-loading="scheduleLoad"
            @submitForm="submitForm"
            @resetForm="handleCancel"
            @checkConnection="checkEntityConnection"
            @changeCurrentVenueStatus="changeCurrentVenueStatus"
            @changeSchedule="changeCurrentVenueSchedule"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import router from '../router';
import { TOAST_TYPES } from '@/data';
import VenueForm from '@/components/VenueForm';

export default {
  name: 'Venue',
  components: {
    VenueForm,
  },
  data() {
    return {
      isDeleteDialogOpen: false,
      venueGroupFormId: 0,
      venueFormKey: 0,
      shouldPopulateForm: false,
      isCheckingRk: false,
      isCheckingWolt: false,
      isCheckingBolt: false,
      scheduleLoad: false,
    };
  },
  computed: {
    ...mapGetters({
      getItem: 'venues/getItem',
      getRoles: 'app/getRoles',
      getCurrentVenue: 'app/getCurrentVenue',
      isLoading: 'venues/isLoading',
      getActiveVenueId: 'venues/getActiveVenueId',
      getActiveVenueGroupId: 'venueGroups/getActiveVenueGroupId',
      getUserData: 'app/getUserData',
    }),
    title() {
      return this.venueId === 'new' ? 'New restaurant' : 'Restaurant';
    },
    venue() {
      if (this.getRoles[0].toLowerCase() === 'manager') return this.getCurrentVenue;
      else if (this.$route.params.id && this.$route.params.id !== 'new') return this.getItem;
      else return {};
    },
    venueId() {
      if (this.getRoles[0].toLowerCase() === 'manager') {
        return this.getCurrentVenue.id;
      } else {
        if (this.$route.params.id && this.$route.params.id !== 'new') return this.$route.params.id;
        else return 'new';
      }
    },
  },
  mounted() {
    if (this.getRoles[0].toLowerCase() !== 'manager') {
      if (this.venueId !== 'new') {
        try {
          this.fetchItem(this.venueId);
          this.shouldPopulateForm = true;
        } catch (err) {
          console.log('err ', err);
        }
      } else {
        this.venueGroupFormId = this.getActiveVenueGroupId;
      }
    } else {
      if (!this.getCurrentVenue.id) {
        this.fetchCurrentVenue().then(() => {
          this.venueGroupFormId = this.getCurrentVenue.groupId;
          this.shouldPopulateForm = true;
        });
      } else {
        this.venueGroupFormId = this.getCurrentVenue.groupId;
        this.shouldPopulateForm = true;
      }
    }
  },
  methods: {
    ...mapActions('venues', [
      'fetchItem',
      'addItemToDB',
      'changeItemToDB',
      'changeItemToDB',
      'deleteItem',
      'checkConnection',
      'changeStatus',
      'changeSchedule',
      'changeAvailability',
    ]),
    ...mapActions('app', ['fetchCurrentVenue']),
    ...mapMutations('venues', ['addToList']),

    async submitForm(role, form) {
      const model = {
        groupId: form.groupId,
        name: form.name,
        settings: { ...form.settings },
      };

      if (this.venueId === 'new') {
        try {
          let data = await this.addItemToDB(model);
          if (data.status <= 300) {
            this.$notify.toast('Venue has been successfully added!', TOAST_TYPES.SUCCESS);
            this.addToList(form);
            setTimeout(() => {
              router.push({ name: 'venues' });
            }, 1000);
          }
        } catch (err) {
          this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
        }
      } else {
        model.id = form.id;
        try {
          let data = await this.changeItemToDB(model);
          if (data.status <= 300) {
            this.$notify.toast('Venue has been successfully edited!', TOAST_TYPES.SUCCESS);
          }

          if (Object.prototype.hasOwnProperty.call(this.getUserData, 'venueId')) {
            this.fetchCurrentVenue();
          }
        } catch (err) {
          this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
        }
      }
    },
    handleCancel() {
      router.go(-1);
    },
    async checkEntityConnection(type) {
      let entityToCheck = {};
      if (this.getRoles[0].toLowerCase() === 'manager') {
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
    async changeCurrentVenueStatus(data) {
      try {
        await this.changeAvailability(data);
      } catch (err) {
        console.log('err', err);
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
    },

    async changeCurrentVenueSchedule(schedule) {
      try {
        this.scheduleLoad = true;
        let res = await this.changeSchedule({
          venueId: this.venueId,
          schedule,
        });
        if (res) this.scheduleLoad = false;
      } catch (err) {
        console.log('err', err);
        this.scheduleLoad = false;
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
    },
  },
};
</script>

<style lang="css" scoped></style>
