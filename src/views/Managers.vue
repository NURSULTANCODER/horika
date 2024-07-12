<template>
  <v-container class="pa-6" fluid>
    <h2 class="sidebar-title mt-2 mb-6">{{ this.pageName }}</h2>
    <v-row>
      <v-col cols="3">
        <h2 class="sidebar-title sidebar-title-small mb-6">Restaurants</h2>
        <v-text-field
          @input="handleVenuesSearch"
          solo
          label="Find restaurants"
          class="standart-input mt-3"
          flat
          prepend-inner-icon="mdi-magnify"
          type="text"
        ></v-text-field>
        <GroupTab @tabClick="tabClick" :list="venues" :activeItemId="activeVenueGroupId" />
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
  name: 'Managers',
  components: {
    GroupTab,
    EntityList,
  },
  data() {
    return {
      searchValue: '',
      pageName: 'managers',
      pageNameSingular: 'manager',
      venuesSearchValue: '',
    };
  },
  computed: {
    ...mapGetters({
      venues: 'venues/getData',
      entityList: 'managers/getList',
      isEntitiesLoading: 'managers/isLoading',
      getActiveVenueGroupId: 'managers/getActiveVenueGroupId',
      getSearch: 'managers/getSearch',
      isLoading: 'managers/isLoading',
      getUserData: 'app/getUserData',
    }),
    isSearched() {
      return Boolean(this.searchValue.length);
    },
    activeVenueGroupId() {
      return this.getActiveVenueGroupId;
    },
  },
  mounted() {
    if (this.getUserData.roleNames[0] == 'Dealer') {
      this.fetchVenueGroup(this.getUserData.venueGroupId).then(data => {
        let groupId = data.id;
        this.fetchVenues(`/venues?groupId=${groupId}`).then(group => {
          if (!this.getActiveVenueGroupId) {
            const firstGroupId = group[0].id;
            this.setActiveVenueGroupId(firstGroupId);
            this.fetchEntitiesById(firstGroupId);
          } else this.fetchEntitiesById(this.getActiveVenueGroupId);
        });
      });
    } else {
      this.setManagersList([]);
      this.fetchVenues().then(() => {
        if (this.getActiveVenueGroupId !== -1) {
          const firstGroupId = -1;
          this.setActiveVenueGroupId(firstGroupId);
        }
      });
      if (this.getSearch) {
        this.fetchEntitiesById(this.activeVenueGroupId);
        this.clearSearch();
      }
    }
  },
  methods: {
    ...mapActions({
      fetchVenueGroup: 'venueGroups/fetchItem',
      fetchVenues: 'venues/fetchData',
      fetchEntities: 'managers/fetchList',
      searchEntities: 'managers/search',
      deleteEntity: 'managers/deleteItem',
      searchVenues: 'venues/searchVenues',
    }),
    ...mapMutations({
      setActiveVenueId: 'venues/setActiveVenueId',
      setSearch: 'managers/setSearch',
      clearSearch: 'managers/clearSearch',
      setActiveVenueGroupId: 'managers/setActiveVenueGroupId',
      setManagersList: 'managers/setList',
    }),
    tabClick(id) {
      this.fetchEntitiesById(id);
    },
    fetchEntitiesById(id) {
      this.setActiveVenueGroupId(id);
      this.fetchEntities(`/${this.pageName}?venueId=${id}`);
    },
    deleteEntityItem(id) {
      this.deleteEntity(id).then(data => {
        if (data) {
          this.$notify.toast('Manager has been successfully deleted!', TOAST_TYPES.SUCCESS);
        }
      });
    },
    handleSearch: debounce(function (searchQuery) {
      this.searchValue = searchQuery;
      this.setSearch(searchQuery);
      const url = `/${this.pageName}?venueId=${this.activeVenueGroupId}&partOfUserName=${searchQuery}`;
      this.searchEntities(url);
    }, '1000ms'),
    handleVenuesSearch: debounce(function (searchQuery) {
      this.venuesSearchValue = searchQuery;
      this.setSearch(searchQuery);
      const url = `/venues?partOfName=${searchQuery}`;
      this.searchVenues(url);
    }, '1000ms'),
  },
};
</script>

<style lang="scss"></style>
