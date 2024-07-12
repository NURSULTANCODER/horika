<template>
  <v-dialog v-model="syncedOpened" width="480" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <v-form ref="modalForm" v-model="isFormValid" @submit.prevent="validateForm('modalForm')">
        <div class="standart-modal-card-top d-flex align-center justify-space-between">
          <h3>{{ title }}</h3>
          <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
        </div>
        <div class="standart-modal-card-middle">
          <v-text-field
            class="standart-input-filled standart-input-no-message"
            v-model="form.name"
            label="Restaurant group name"
            :rules="[rules.required]"
            color="dark_grey"
            filled
            rounded
            dense
            :key="textFieldKey"
          ></v-text-field>
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
            <Button text="Save" class="standart-button-content-width" type="submit" />
          </div>
        </div>
      </v-form>
    </div>
  </v-dialog>
</template>

<script>
import Button from '@/components/commonComponents/Button';

export default {
  name: 'Modal',
  components: {
    Button,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  props: {
    opened: Boolean,
    formData: {
      type: [Object, String],
    },
    title: {
      type: String,
    },
  },
  data() {
    return {
      form: {
        id: '',
        name: '',
      },
      rules: {
        required: value => !!value || 'Required field',
      },
      textFieldKey: 100,
      isFormValid: false,
    };
  },
  watch: {
    formData(newVal) {
      if (newVal) {
        this.populateForm();
      }
    },
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
      let formData = { ...this.form };
      this.$emit('saveForm', formData);
      this.clearForm();
    },
    populateForm() {
      this.form.id = this.formData.id;
      this.form.name = this.formData.name;
    },
    clearForm() {
      this.textFieldKey += 1;
      this.form.name = '';
      this.form.id = '';
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
