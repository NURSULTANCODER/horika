<template>
  <v-container class="pa-6" fluid>
    <v-row>
      <v-col class="col-lg-3 col-md-12 col-12">
        <h2 class="sidebar-title mb-lg-6">{{ title }}</h2>
      </v-col>
      <v-col class="col-lg-6 col-md-12">
        <div class="standart-card">
          <RoleForm
            :key="tabRoles.MANAGER + this.roleFormKey"
            :role="tabRoles.MANAGER"
            @submitForm="submitForm"
            @handleCancel="handleCancel"
            :populatedForm="entityItem"
            :venueGroupFormId="getActiveVenueId"
            :activeTabId="tabRoles.MANAGER"
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
  name: 'Manager',
  components: {
    RoleForm,
  },
  data() {
    return {
      detailId: this.$route.params.id,
      tabRoles: TAB_ROLES,
      roleFormKey: 100,
      roleName: 'Manager',
    };
  },
  computed: {
    ...mapGetters({
      getActiveVenueId: 'venues/getActiveVenueId',
      isLoading: 'managers/isLoading',
      entityItem: 'managers/getItem',
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
      addManagerToDB: 'managers/addItemToDB',
      fetchItem: 'managers/fetchItem',
      changeManagerToDB: 'managers/changeItemToDB',
    }),
    ...mapMutations({
      addManagerToList: 'managers/addToList',
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
      router.push('/managers');
    },
  },
};
</script>

<style lang="css" scoped></style>
