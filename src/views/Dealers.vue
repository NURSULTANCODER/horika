<template>
  <v-container class="pa-6" fluid>
    <h2 class="sidebar-title mt-2 mb-6">{{ this.pageName }}</h2>
    <v-row>
      <v-col cols="3">
        <h2 class="sidebar-title sidebar-title-small mb-6">Restaurant groups</h2>
        <v-text-field
          @input="handleVenueGroupSearch"
          solo
          label="Find restaurant group"
          class="standart-input mt-3"
          flat
          prepend-inner-icon="mdi-magnify"
          type="text"
        ></v-text-field>
        <GroupTab @tabClick="tabClick" :list="venueGroups" :activeItemId="activeVenueGroupId" :showDots="true" />
      </v-col>
      <v-col>
        <div class="standart-card">
          <v-row>
            <v-col class="col-lg-10 col-9">
              <v-text-field
                @input="handleSearch"
                solo
                :label="`Find ${this.pageNameSingular}`"
                class="standart-input"
                flat
                prepend-inner-icon="mdi-magnify"
                type="text"
              ></v-text-field>
            </v-col>
            <v-col>
              <router-link
                :to="isLoading ? '#' : `/${this.pageNameSingular}/new`"
                class="standart-button standart-button-secondary"
                >New {{ this.pageNameSingular }}</router-link
              >
            </v-col>
          </v-row>
          <EntityList
            :isLoading="isEntitiesLoading"
            :list="entityList"
            :isSearched="isSearched"
            :isShowEmail="true"
            :detailUrl="this.pageNameSingular"
            :groupId="this.getActiveVenueGroupId"
            @handleDelete="deleteEntityItem"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { debounce } from 'vue-debounce';
import GroupTab from '../components/GroupTab.vue';
import EntityList from '../components/EntityList.vue';
import { TOAST_TYPES } from '@/data';

export default {
  name: 'Dealers',
  components: {
    GroupTab,
    EntityList,
  },
  data() {
    return {
      searchValue: '',
      venueGroupSearchValue: '',
      pageName: 'dealers',
      pageNameSingular: 'dealer',
    };
  },
  computed: {
    ...mapGetters({
      venueGroups: 'venueGroups/getData',
      entityList: 'dealers/getList',
      isEntitiesLoading: 'dealers/isLoading',
      getActiveVenueGroupId: 'dealers/getActiveVenueGroupId',
      getSearch: 'dealers/getSearch',
      isLoading: 'dealers/isLoading',
    }),
    isSearched() {
      return Boolean(this.searchValue.length);
    },
    activeVenueGroupId() {
      return this.getActiveVenueGroupId;
    },
  },
  mounted() {
    this.setDealersList([]);
    this.fetchVenueGroup().then(() => {
      if (this.getActiveVenueGroupId != -1) {
        const firstGroupId = -1;
        this.setActiveVenueGroupId(firstGroupId);
      }
    });
    if (this.getSearch) {
      this.fetchEntitiesById(this.getActiveVenueGroupId);
      this.clearSearch();
    }
  },
  methods: {
    ...mapActions({
      fetchVenueGroup: 'venueGroups/fetchData',
      fetchEntities: 'dealers/fetchList',
      searchEntities: 'dealers/search',
      searchVenueGroups: 'venueGroups/searchVenueGroup',
      deleteEntity: 'dealers/deleteItem',
    }),
    ...mapMutations({
      setActiveVenueGroupId: 'dealers/setActiveVenueGroupId',
      setSearch: 'dealers/setSearch',
      clearSearch: 'dealers/clearSearch',
      setDealersList: 'dealers/setList',
    }),
    tabClick(id) {
      this.setActiveVenueGroupId(id);
      this.fetchEntitiesById(id);
    },
    fetchEntitiesById(id) {
      this.setActiveVenueGroupId(id);
      this.fetchEntities(`/${this.pageName}?venueGroupId=${id}`);
    },
    deleteEntityItem(id) {
      this.deleteEntity(id).then(data => {
        if (data) {
          this.$notify.toast('Dealer has been successfully deleted!', TOAST_TYPES.SUCCESS);
        }
      });
    },
    handleSearch: debounce(function (searchQuery) {
      this.searchValue = searchQuery;
      this.setSearch(searchQuery);
      const url = `/${this.pageName}?venueGroupId=${this.setActiveVenueGroupId}&partOfUserName=${searchQuery}`;
      this.searchEntities(url);
    }, '1000ms'),
    handleVenueGroupSearch: debounce(function (searchQuery) {
      this.venueGroupSearchValue = searchQuery;
      this.setSearch(searchQuery);
      const url = `/venueGroups?partOfName=${searchQuery}`;
      this.searchVenueGroups(url);
    }, '1000ms'),
  },
};
</script>

<style lang="scss"></style>
