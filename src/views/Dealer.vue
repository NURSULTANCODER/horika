<template>
  <v-container class="pa-6" fluid>
    <v-row>
      <v-col class="col-lg-3 col-md-12 col-12">
        <h2 class="sidebar-title mb-lg-6">{{ title }}</h2>
      </v-col>
      <v-col class="col-lg-6 col-md-12">
        <div class="standart-card">
          <RoleForm
            :key="tabRoles.DEALER + this.roleFormKey"
            :role="tabRoles.DEALER"
            @submitForm="submitForm"
            @handleCancel="handleCancel"
            :populatedForm="entityItem"
            :venueGroupFormId="getActiveVenueGroupId"
            :activeTabId="tabRoles.DEALER"
            :isFormLoading="isLoading"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import RoleForm from '@/components/RoleForm';
import { TAB_ROLES, TOAST_TYPES } from '@/data';
import router from '../router';

export default {
  name: 'Dealer',
  components: {
    RoleForm,
  },
  data() {
    return {
      detailId: this.$route.params.id,
      tabRoles: TAB_ROLES,
      roleFormKey: 100,
      roleName: 'Dealer',
    };
  },
  computed: {
    ...mapGetters({
      getActiveVenueGroupId: 'dealers/getActiveVenueGroupId',
      isLoading: 'dealers/isLoading',
      entityItem: 'dealers/getItem',
    }),
    title() {
      return this.detailId === 'new' ? 'New ' + this.roleName : this.roleName + 's';
    },
  },
  mounted() {
    if (this.detailId !== 'new') {
      this.fetchItem(this.detailId);
    }
  },
  methods: {
    ...mapActions({
      addDealerToDB: 'dealers/addItemToDB',
      fetchItem: 'dealers/fetchItem',
      changeDealerToDB: 'dealers/changeItemToDB',
    }),
    ...mapMutations({
      addDealerToList: 'dealers/addToList',
    }),
    async submitForm(role, form) {
      if (this.detailId === 'new') {
        try {
          let data = await this[role.postMethod](form);
          if (data.status < 300) {
            this.$notify.toast(`${this.roleName} has been successfully added!`, TOAST_TYPES.SUCCESS);
            this[role.addToList](form);
          }
        } catch (err) {
          console.log('err', err);
          this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
        }
      } else {
        try {
          let data = await this[role.putMethod]({
            id: this.detailId,
            ...form,
          });
          if (data.status < 300) {
            this.$notify.toast(`${this.roleName} has been successfully edited!`, TOAST_TYPES.SUCCESS);
            this[role.addToList](form);
          }
        } catch (err) {
          console.log('err', err);
          this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
        }
      }
    },
    handleCancel() {
      router.push('/dealers');
    },
  },
};
</script>

<style lang="css" scoped></style>
