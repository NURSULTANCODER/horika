<template>
  <v-container>
    <v-row class="justify-center mt-3">
      <v-col cols="8">
        <v-row class="justify-space-between mb-3">
          <v-col>
            <h2 class="display-1 mb-3">Admin List</h2>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn elevation="2" color="primary" large exact to="/admin-detail/new">Add admin</v-btn>
          </v-col>
        </v-row>
        <v-card class="pa-4" elevation="2">
          <v-row v-for="adminItem in getList" :key="adminItem.id" class="align-center">
            <v-col cols="10">
              <router-link :to="`/admin-detail/${adminItem.id}`">{{ adminItem.userName }}</router-link>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AdminList',
  mounted() {
    this.fetchList();
  },
  methods: {
    ...mapActions('admin', ['fetchList']),
  },
  computed: {
    ...mapGetters('admin', ['getList']),
  },
};
</script>

<style lang="scss" scoped></style>
