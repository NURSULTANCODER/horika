<template>
  <v-container class="pa-6" fluid>
    <v-row>
      <v-col cols="3">
        <h2 class="sidebar-title mb-6">Restaurants</h2>
        <Button styleType="secondary" text="New restaurant group" @handleClick="openModal" />
        <v-text-field
          @input="handleVenueGroupSearch"
          solo
          label="Find restaurant group"
          class="standart-input mt-3"
          flat
          prepend-inner-icon="mdi-magnify"
          type="text"
        ></v-text-field>
        <GroupTab
          @tabClick="tabClick"
          :list="isMultipleVenues ? venueGroups : venueGroupsData"
          :activeItemId="activeVenueGroupId"
          :showDots="true"
          class=""
        />
      </v-col>
      <v-col>
        <div class="standart-card mt-15">
          <v-row>
            <v-col class="col-lg-10 col-9">
              <v-text-field
                @input="handleVenueSearch"
                solo
                label="Find restaurant"
                class="standart-input"
                flat
                prepend-inner-icon="mdi-magnify"
                type="text"
              ></v-text-field>
            </v-col>
            <v-col>
              <router-link :to="isLoading ? '#' : '/venue/new'" class="standart-button standart-button-secondary"
                >New restaurant</router-link
              >
            </v-col>
          </v-row>
          <EntityList
            :isLoading="isVenueLoading"
            :list="entityList"
            :isSearched="isSearched"
            :detailUrl="'venue'"
            @handleDelete="deleteEntityItem"
            :groupId="getActiveVenueGroupId"
          />
        </div>
      </v-col>
    </v-row>
    <Modal v-model="isModalOpen" @saveForm="submitVenueGroup" title="New restaurant group" />
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { debounce } from 'vue-debounce';
import GroupTab from '../components/GroupTab.vue';
import EntityList from '../components/EntityList.vue';
import { TOAST_TYPES } from '@/data';
import Button from '@/components/commonComponents/Button';
import Modal from '@/components/modals/Modal';

export default {
  name: 'Venues',
  components: {
    GroupTab,
    EntityList,
    Button,
    Modal,
  },
  data() {
    return {
      venueSearchValue: '',
      venueGroupSearchValue: '',
      venueGroupsData: [],
      isModalOpen: false,
      isMultipleVenues: false,
    };
  },
  computed: {
    ...mapGetters({
      venueGroups: 'venueGroups/getData',
      venueGroup: 'venueGroup/getItem',
      entityList: 'venues/getData',
      isVenueLoading: 'venues/isLoading',
      getActiveVenueGroupId: 'venueGroups/getActiveVenueGroupId',
      getSearch: 'venues/getSearch',
      isLoading: 'venues/isLoading',
      getUserData: 'app/getUserData',
    }),
    isSearched() {
      return Boolean(this.venueSearchValue.length);
    },
    activeVenueGroupId() {
      return this.getActiveVenueGroupId;
    },
  },
  mounted() {
    if (this.getUserData.roleNames[0].toLowerCase() === 'dealer') {
      if (!this.getUserData.venueGroupId) {
        this.$router.go();
      }
      this.fetchVenueGroup(this.getUserData.venueGroupId).then(data => {
        this.venueGroupsData.push(data);
        if (!this.getActiveVenueGroupId) this.setActiveVenueGroupId(this.getUserData.venueGroupId);
        this.fetchVenuesById(this.getUserData.venueGroupId);
      });
    } else {
      this.setVenuesList([]);
      this.fetchVenueGroups().then(group => {
        this.isMultipleVenues = true;
        this.venueGroupsData = group;

        if (this.getActiveVenueGroupId !== -1) {
          const firstGroupId = -1;
          this.setActiveVenueGroupId(firstGroupId);
        }
      });
      if (this.getSearch) {
        this.fetchVenuesById(this.getActiveVenueGroupId);
        this.clearSearch();
      }
    }
  },
  methods: {
    ...mapActions({
      fetchVenueGroups: 'venueGroups/fetchData',
      fetchVenueGroup: 'venueGroups/fetchItem',
      addVenueGroup: 'venueGroups/addItemToDB',
      editVenueGroup: 'venueGroups/changeItemToDB',
      fetchVenue: 'venues/fetchData',
      searchEntity: 'venues/searchVenues',
      searchVenueGroups: 'venueGroups/searchVenueGroup',
      deleteEntity: 'venues/deleteItem',
    }),
    ...mapMutations({
      setActiveVenueGroupId: 'venueGroups/setActiveVenueGroupId',
      addToVenueListGroup: 'venueGroups/addToList',
      setSearch: 'venues/setSearch',
      clearSearch: 'venues/clearSearch',
      setVenuesList: 'venues/setList',
    }),
    tabClick(id) {
      this.fetchVenuesById(id);
    },
    fetchVenuesById(id) {
      this.setActiveVenueGroupId(id);
      this.fetchVenue(`/venues?groupId=${id}`);
    },
    deleteEntityItem(id) {
      this.deleteEntity(id).then(data => {
        if (data) {
          this.$notify.toast('Venue has been successfully deleted!', TOAST_TYPES.SUCCESS);
        }
      });
    },
    handleVenueSearch: debounce(function (searchQuery) {
      this.venueSearchValue = searchQuery;
      this.setSearch(searchQuery);
      const url = `/venues?groupId=${this.getActiveVenueGroupId}&partOfName=${searchQuery}`;
      this.searchEntity(url);
    }, '1000ms'),
    handleVenueGroupSearch: debounce(function (searchQuery) {
      this.venueGroupSearchValue = searchQuery;
      this.setSearch(searchQuery);
      const url = `/venueGroups?partOfName=${searchQuery}`;
      this.searchVenueGroups(url);
    }, '1000ms'),
    openModal() {
      this.isModalOpen = true;
    },
    submitVenueGroup(form) {
      let formData = { name: form.name };
      this.addVenueGroup(formData).then(data => {
        if (data) {
          formData.id = data;
          this.addToVenueListGroup(formData);
          this.isModalOpen = false;
          this.$notify.toast('Restaurant group has been successfully added!', TOAST_TYPES.SUCCESS);
        }
      });
    },
  },
};
</script>

<style lang="scss"></style>
