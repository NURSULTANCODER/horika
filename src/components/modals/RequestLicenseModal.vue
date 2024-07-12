<template>
  <v-dialog v-model="syncedOpened" width="480" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <v-form ref="venueGroupForm" v-model="isFormValid" @submit.prevent="validateForm('venueGroupForm')">
        <div class="standart-modal-card-top d-flex align-center justify-space-between">
          <h3>{{ title }}</h3>
          <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
        </div>
        <div class="standart-modal-card-middle">
          <v-textarea
            class="standart-input-filled standart-input-no-message"
            v-model="comment"
            label="Comment"
            :rules="[rules.required]"
            color="dark_grey"
            filled
            rounded
            dense
            :key="textFieldKey"
          ></v-textarea>
        </div>
        <div class="standart-modal-card-bottom">
          <div class="d-flex align-center justify-end">
            <Button
              styleType="secondary"
              text="Cancel"
              class="standart-button-content-width mr-2"
              type="button"
              @handleClick="closeModal"
            />
            <Button text="Send" class="standart-button-content-width" type="submit" />
          </div>
        </div>
      </v-form>
    </div>
  </v-dialog>
</template>

<script>
import Button from '@/components/commonComponents/Button';

export default {
  name: 'RequestLicenseModal',
  components: {
    Button,
  },
  props: {
    opened: Boolean,
    formData: {
      type: [Object, String],
    },
  },
  data() {
    return {
      comment: '',
      rules: {
        required: value => !!value || 'Required field',
      },
      textFieldKey: 100,
      isFormValid: false,
      title: 'Request license',
    };
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  computed: {
    syncedOpened: {
      get() {
        return this.opened;
      },
      set(val) {
        return this.$emit('opened:update', val);
      },
    },
  },
  methods: {
    closeModal() {
      this.syncedOpened = false;
    },
    saveHandle() {
      this.$emit('sendReqLicForm', this.comment);
      this.clearForm();
    },
    clearForm() {
      this.textFieldKey += 1;
      this.comment = '';
    },
    validateForm(ref) {
      this.isFormValid = this.$refs[ref].validate();
      if (this.isFormValid) {
        this.saveHandle();
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
