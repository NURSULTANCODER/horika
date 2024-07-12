import Vue from 'vue';

import Vuetify, {
  VApp,
  VMain,
  VAppBar,
  VMenu,
  VDialog,
  VProgressCircular,
  VContainer,
  VRow,
  VCol,
  VSheet,
  VForm,
  VCard,
  VList,
  VListItem,
  VTextField,
  VTextarea,
  VSelect,
  VBtn,
  VCheckbox,
  VSwitch,
  VIcon,
} from 'vuetify/lib';

Vue.use(Vuetify, {
  VApp,
  VMain,
  VAppBar,
  VMenu,
  VDialog,
  VProgressCircular,
  VContainer,
  VRow,
  VCol,
  VSheet,
  VForm,
  VCard,
  VList,
  VListItem,
  VTextField,
  VTextarea,
  VSelect,
  VBtn,
  VCheckbox,
  VSwitch,
  VIcon,
});

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#5B7FFE',
        secondary: '#b0bec5',
        accent: '#8c9eff',
        grey: '#F6F6F6',
        dark_grey: '#A0A0A3',
      },
    },
  },
});
