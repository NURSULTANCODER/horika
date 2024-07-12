<template>
  <v-dialog v-model="syncedOpened" width="480" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <div class="standart-modal-card-top d-flex align-center justify-space-between">
        <h3>Venue group</h3>
        <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
      </div>
      <div class="standart-modal-card-middle">
        <v-autocomplete
          v-model="groupId"
          label="Select group ID for new venue"
          class="standart-input-filled standart-input-no-message mb-6"
          :rules="[rules.required]"
          color="dark_grey"
          :items="getVenueGroups"
          item-text="name"
          item-value="id"
          :loading="venueGroupsLoading"
          loader-height="10"
          filled
          rounded
          dense
        >
        </v-autocomplete>
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
          <Button
            text="Save"
            class="standart-button-content-width"
            type="button"
            :is-loading="venueGroupsLoading"
            @handleClick="saveGroup"
          />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import Button from '@/components/commonComponents/Button';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'SelectGroupModal',
  components: {
    Button,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  props: {
    opened: Boolean,
    changeGroupID: Function,
  },
  data() {
    return {
      groupId: null,
      venueGroupsLoading: false,
      idWasUpdated: false,
      rules: {
        required: value => !!value || 'Required field',
      },
    };
  },
  computed: {
    syncedOpened: {
      get() {
        this.syncedOpenedHandler();
        return this.opened;
      },
      set(val) {
        return this.$emit('opened:update', val);
      },
    },
    ...mapGetters({
      venueGroups: 'venueGroups/getData',
    }),
    getVenueGroups() {
      return this.venueGroups;
    },
  },
  methods: {
    ...mapActions({
      fetchVenueGroups: 'venueGroups/fetchData',
    }),
    closeModal() {
      this.syncedOpened = false;
    },
    syncedOpenedHandler() {
      if (this.opened === true) {
        if (!this.idWasUpdated) {
          this.idWasUpdated = true;
          this.venueGroupsLoading = true;
          this.fetchVenueGroups()
            .then(() => {
              this.venueGroupsLoading = false;
            })
            .catch(err => {
              this.venueGroupsLoading = false;
            });
        }
      }
    },
    saveGroup() {
      if (this.groupId) {
        this.$emit('saveGroupId', this.groupId);
        this.closeModal();
      }
    },
  },
};
</script>
