<template>
  <v-container class="pa-0" fluid fill-height>
    <v-row class="login-row" no-gutters>
      <v-col class="login-column d-flex align-center" cols="md-6 sm-12">
        <h4 class="version-block">Version: 23.12.2022</h4>
        <div class="login-block">
          <v-form :disabled="getLoading">
            <!--            @submit="onLogin"  @submite="() => {return false}"-->
            <h2 class="login-title">
              Sign into <br />
              your <span class="primary--text">account</span>
            </h2>
            <div>
              <v-text-field
                v-model="authData.login"
                placeholder="Login id"
                solo
                class="standart-input-login"
                flat
              ></v-text-field>
              <v-text-field
                v-model="authData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                solo
                class="standart-input-login"
                flat
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
              >
              </v-text-field>
              <v-btn
                class="standart-button standart-button-primary mt-4"
                block
                color="primary"
                large
                :loading="getLoading"
                @click.prevent="onLogin"
              >
                Sign in
              </v-btn>
            </div>
            <h2 style="text-align: center; margin-bottom: 20px">
              {{ error }}
            </h2>
          </v-form>
        </div>
      </v-col>
      <v-col class="d-flex align-center justify-center" cols="md-6" style="background-color: #ffffff">
        <img class="login-image" src="@/assets/images/delivery-animation.gif" alt="login" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      authData: {
        login: '',
        password: '',
      },
      error: '',
      showPassword: false,
    };
  },
  computed: {
    ...mapGetters('app', ['getLoading']),
  },
  methods: {
    ...mapActions('app', ['login']),
    onLogin() {
      this.login({ ...this.authData });
    },
  },
};
</script>

<style lang="scss">
.login-column {
  background-color: #f6f6f6;
}

.login-row {
  height: 100%;
}

.login-block {
  flex: 0 0 336px;
  margin: 0 auto;
}

.login-title {
  font-weight: 400;
  font-size: 36px;
  line-height: 54px;
  margin-bottom: 37px;
}

.standart-input {
  .v-input__control {
    border-radius: 16px !important;
    .v-input__slot {
      margin-bottom: 10px !important;
      padding: 16px !important;
      border: 2px solid #ebebeb;
      input {
        font-size: 16px;
        color: #333;
      }
    }
  }
}
.standart-input.v-input--is-focused .v-input__slot {
  border-color: #d8e0fe !important;
}

.login-image {
  width: auto;
}

@media screen and (max-width: 1280px) {
  .login-image {
    width: 100%;
  }
}

.version-block {
  position: fixed;
  bottom: 0;
}
</style>
