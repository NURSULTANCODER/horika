import Vue from 'vue';
import Vuex from 'vuex';

import venues from './venues';
import orders from './orders';
import venueGroups from './venueGroups';
import app from './app';
import admin from './admin';
import dealers from './dealers';
import managers from './managers';
import operators from './operators';
import licRequests from './licRequests';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    admin,
    venues,
    orders,
    venueGroups,
    dealers,
    managers,
    operators,
    licRequests,
  },
});
