<template>
  <div>
    <v-form ref="roleForm" v-model="isFormValid" @submit.prevent="validateForm('roleForm')">
      <div class="d-flex align-center">
        <img :src="require(`@/assets/icons/${tabItems[activeTabId].icon}`)" alt="" />
        <h3 class="form-title ml-4">{{ tabItems[activeTabId].name }} info</h3>
      </div>
      <v-row class="mt-2">
        <v-col class="py-0" cols="5">
          <v-text-field
            class="standart-input-filled standart-input-no-message mt-4"
            v-model="form.userName"
            label="Login"
            :disabled="!isFormEditable"
            :rules="[rules.required]"
            filled
            rounded
            dense
          ></v-text-field>
        </v-col>
        <v-col class="py-0" cols="7">
          <v-text-field
            class="standart-input-filled standart-input-no-message mb-6 mt-4"
            :class="tabItems[activeTabId].selectRest ? '' : 'mt-4'"
            v-model="form.email"
            type="email"
            label="Email"
            :disabled="!isFormEditable"
            :rules="[rules.required, rules.email]"
            filled
            rounded
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <v-autocomplete
        v-if="tabItems[activeTabId].selectRest"
        :rules="[rules.required]"
        @focus="checkVenues"
        v-model="venueId"
        class="standart-input-filled standart-input-no-message mt-4 mb-6"
        :items="selectItems"
        item-text="name"
        item-value="id"
        label="Restaurant"
        :loading="venuesLoading"
        loader-height="5"
        no-data-text="No restaurants in this group"
        :disabled="!isFormEditable"
        filled
        rounded
        dense
      ></v-autocomplete>
      <v-autocomplete
        v-if="tabItems[activeTabId].selectRestGroup"
        :rules="[rules.required]"
        @focus="checkVenueGroups"
        v-model="venueGroupId"
        class="standart-input-filled standart-input-no-message mt-4 mb-6"
        :items="venueGroups"
        item-text="name"
        item-value="id"
        label="Restaurant groups"
        :loading="venueGroupsLoading"
        loader-height="5"
        no-data-text="No restaurant groups"
        :disabled="!isFormEditable"
        filled
        rounded
        dense
      ></v-autocomplete>
      <v-text-field
        class="standart-input-filled standart-input-no-message mb-6"
        v-model="form.phoneNumber"
        label="Phone number"
        :disabled="!isFormEditable"
        :rules="[rules.required]"
        filled
        rounded
        dense
      ></v-text-field>
      <v-textarea
        v-if="tabRoles.OPERATOR == role && !isNew"
        class="standart-input-filled standart-input-no-message mb-6"
        v-model="refreshToken"
        label="Refresh token"
        :disabled="!isFormEditable"
        no-resize
        rows="3"
        filled
        rounded
        dense
      ></v-textarea>
      <Button
        v-if="!isNew"
        :text="isChangingPassword ? 'Hide password' : 'Change password'"
        class="standart-button-content-width mb-4"
        type="button"
        styleType="secondary"
        @handleClick="isChangingPassword = !isChangingPassword"
      />
      <v-row v-if="isChangingPassword || isNew">
        <v-col cols="6">
          <v-text-field
            class="standart-input-filled standart-input-no-message standart-input-with-icon mb-6"
            v-model="form.pwd"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            :disabled="!isFormEditable"
            :rules="[rules.required]"
            filled
            rounded
            dense
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="standart-input-filled standart-input-no-message standart-input-with-icon mb-6"
            v-model="confirmPwd"
            label="Confirm password"
            :type="showConfirmPassword ? 'text' : 'password'"
            :disabled="!isFormEditable"
            :rules="[rules.required]"
            filled
            rounded
            dense
            :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showConfirmPassword = !showConfirmPassword"
          ></v-text-field>
        </v-col>
      </v-row>
      <div class="d-flex align-center justify-space-between">
        <Button
          text="Cancel"
          class="standart-button-content-width"
          type="button"
          styleType="secondary"
          @handleClick="handleCancel"
        />
        <Button text="Save" class="standart-button-content-width" :isLoading="isFormLoading" />
      </div>
    </v-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { TAB_ITEMS, TAB_ROLES, TOAST_TYPES } from '@/data';
import Button from '@/components/commonComponents/Button';

export default {
  name: 'DealerForm',
  components: {
    Button,
  },
  data() {
    return {
      isEditing: true,
      isFormValid: false,
      form: {
        userName: '',
        pwd: '',
        email: '',
        phoneNumber: '',
      },
      venueId: '',
      venueGroupId: '',
      refreshToken: '',
      rules: {
        required: value => !!value || 'Required field',
        email: value => {
          const pattern = /^\S+@\S+\.\S+$/;
          return pattern.test(value) || 'Invalid e-mail.';
        },
      },
      items: ['Rest 1', 'Rest2', 'Rest3'],
      tabItems: TAB_ITEMS,
      tabRoles: TAB_ROLES,
      isNew: true,
      confirmPwd: null,
      showPassword: false,
      showConfirmPassword: false,
      isChangingPassword: false,
    };
  },
  props: {
    activeTabId: {
      type: Number,
      default: 0,
    },
    venueGroupFormId: {
      default: 0,
    },
    role: {
      type: Number,
      default: 1,
    },
    populatedForm: {
      type: Object,
    },
    isFormLoading: {
      type: Boolean,
      default: false,
    },
    isFormEditable: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters({
      venues: 'venues/getData',
      venuesLoading: 'venues/isLoading',
      venueGroups: 'venueGroups/getData',
      venueGroupsLoading: 'venueGroups/isLoading',
    }),
    selectItems() {
      return this.venues;
    },
  },
  watch: {
    'form.userName'(newVal) {
      this.$emit('nameUpdate', newVal);
    },
    populatedForm() {
      this.form.userName = this.populatedForm.userName;
      this.form.email = this.populatedForm.email;
      this.form.phoneNumber = this.populatedForm.phoneNumber;
      this.refreshToken = this.populatedForm.refreshToken;
      this.venueId = this.populatedForm.venueId;
      this.venueGroupId = this.populatedForm.venueGroupId;
      this.isNew = false;
    },
  },
  methods: {
    ...mapActions({
      fetchVenues: 'venues/fetchData',
      fetchVenueGroups: 'venueGroups/fetchData',
    }),
    checkVenues() {
      if (this.venues.length < 1) {
        this.fetchVenues(`/venues`);
      }
    },
    checkVenueGroups() {
      if (this.venueGroups.length < 1) {
        this.fetchVenueGroups();
      }
    },
    handleCancel() {
      this.$emit('handleCancel');
    },
    validateForm(ref) {
      this.isFormValid = this.$refs[ref].validate();
      if (this.isFormValid) {
        let roleToSubmit = this.tabItems.find(tab => tab.id === this.role);
        if (roleToSubmit.selectRest) {
          this.form.venueId = this.venueId;
        }
        if (roleToSubmit.selectRestGroup) {
          this.form.venueGroupId = this.venueGroupId;
        }
        if (this.isChangingPassword || this.isNew) {
          if (this.form.pwd && this.form.pwd !== this.confirmPwd) {
            this.$notify.toast("The password isn't confirmed", TOAST_TYPES.ERROR);
            return;
          }
        } else if (!this.isChangingPassword) {
          this.form.pwd = null;
        }
        this.$emit('submitForm', roleToSubmit, this.form);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
