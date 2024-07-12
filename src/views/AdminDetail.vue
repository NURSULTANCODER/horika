<template>
  <v-container>
    <v-form ref="form" v-model="isFormValid" @submit.prevent="validateForm" class="mt-12">
      <v-row class="justify-center">
        <v-col cols="5">
          <v-card class="pa-4" elevation="2">
            <h2 v-if="!isNew" class="page-heading mb-4 text-center">{{ form.userName }} setttings</h2>
            <h2 v-else class="page-heading mb-4 text-center">New admin user setttings</h2>
            <v-text-field
              class="text-h6"
              v-model="form.userName"
              label="Username"
              outlined
              :readonly="!isEditing"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              class="text-h6"
              type="email"
              v-model="form.email"
              label="Email"
              outlined
              :readonly="!isEditing"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              class="text-h6"
              v-model="form.phoneNumber"
              label="Phone number"
              outlined
              :readonly="!isEditing"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-if="isEditing"
              class="text-h6"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.pwd"
              label="Password"
              outlined
              :readonly="!isEditing"
              :rules="[rules.required]"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
            ></v-text-field>
            <v-text-field
              v-if="isEditing"
              class="text-h6"
              :type="showPwdRepeated ? 'text' : 'password'"
              v-model="pwdRepeated"
              label="Repeat password"
              outlined
              :readonly="!isEditing"
              :rules="[rules.required]"
              :append-icon="showPwdRepeated ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPwdRepeated = !showPwdRepeated"
            ></v-text-field>
            <v-btn v-if="!this.isNew" elevation="2" color="primary" large @click="this.startEdit">
              <span v-if="this.isEditing">Save</span>
              <span v-else>Edit</span>
            </v-btn>
            <v-btn v-if="!this.isNew" class="ml-2" elevation="2" color="error" large @click="isDeleteDialogOpen = true"
              >Delete</v-btn
            >
            <v-btn v-if="this.isNew" elevation="2" color="primary" large type="submit"> Submit </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
    <v-dialog v-model="isDeleteDialogOpen" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h5"> Delete venue </v-card-title>
        <v-card-text class="body-1 font-weight-medium"
          >Are you sure you want to delete this admin? This will permanently delete this admin from admin
          list</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="isDeleteDialogOpen = false"> Cancel </v-btn>
          <v-btn color="error" @click="deleteEntity"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import router from '../router';
import { TOAST_TYPES } from '@/data';

export default {
  name: 'AdminDetail',
  data() {
    return {
      adminId: this.$route.params.id,
      isFormValid: false,
      isEditing: false,
      isNew: false,
      isDeleteDialogOpen: false,
      form: {
        id: '',
        userName: '',
        email: '',
        phoneNumber: '',
        pwd: '',
      },
      pwdRepeated: '',
      showPassword: false,
      showPwdRepeated: false,
      rules: {
        required: value => !!value || 'Required field',
      },
    };
  },
  mounted() {
    if (this.adminId !== 'new') {
      this.fetchItem(this.adminId).then(() => {
        this.populateForm();
      });
    } else {
      this.isEditing = true;
      this.isNew = true;
    }
  },
  methods: {
    ...mapActions('admin', ['fetchItem', 'addItemToDB', 'changeItemToDB', 'deleteItem']),
    populateForm() {
      this.form = {
        id: this.adminId,
        userName: this.getItem.userName,
        email: this.getItem.email,
        phoneNumber: this.getItem.phoneNumber,
      };
    },
    startEdit() {
      if (this.isEditing) {
        this.isFormValid = this.$refs.form.validate();
        if (this.isFormValid) {
          if (this.form.pwd == this.pwdRepeated) {
            this.save('PUT');
            this.isEditing = false;
          } else {
            this.$notify.toast("Passwords don't match!", TOAST_TYPES.ERROR);
          }
        }
      } else {
        this.isEditing = true;
      }
    },
    validateForm() {
      this.isFormValid = this.$refs.form.validate();
      if (this.isFormValid) {
        if (this.form.pwd == this.pwdRepeated) {
          this.save('POST');
        } else {
          this.$notify.toast("Passwords don't match!", TOAST_TYPES.ERROR);
        }
      }
    },
    save(method) {
      if (method === 'POST') {
        this.addItemToDB(this.form)
          .then(data => {
            if (data.statusText == 'OK') {
              this.$notify.toast('Admin has been successfully added!', TOAST_TYPES.SUCCESS);
              setTimeout(() => {
                router.push({ name: 'admin-list' });
              }, 3000);
            }
          })
          .catch(err => {
            console.log('err', err);
            this.$notify.toast('Unexpected error', TOAST_TYPES.ERROR);
          });
      }
      if (method === 'PUT') {
        this.changeItemToDB(this.form)
          .then(data => {
            if (data.status === 204) {
              this.$notify.toast('Venue has been successfully edited', TOAST_TYPES.SUCCESS);
            }
          })
          .catch(err => {
            console.log('err', err);
          });
      }
    },
    deleteEntity() {
      this.deleteItem(this.adminId)
        .then(data => {
          if (data.status === 204) {
            this.$notify.toast('Admin has been successfully deleted', TOAST_TYPES.SUCCESS);
          }
        })
        .catch(err => {
          console.log('err', err);
        })
        .finally(() => {
          this.isDeleteDialogOpen = false;
          setTimeout(() => {
            router.push({ name: 'admin-list' });
          }, 3000);
        });
    },
  },
  computed: {
    ...mapGetters('admin', ['getItem']),
  },
};
</script>

<style lang="scss" scoped></style>
