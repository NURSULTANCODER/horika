<template>
  <v-dialog v-model="syncedOpened" width="600" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <div class="standart-modal-card-top d-flex align-center justify-space-between">
        <h3>Provider status settings</h3>
        <v-btn @click="closeModal" icon color="black"><v-icon>mdi-close</v-icon> </v-btn>
      </div>
      <div class="standart-modal-card-middle">
        <div>
          <v-row
            v-if="venue.info.availability"
            :class="isWoltSettingsPresent && isBoltSettingsPresent ? 'justify-space-between' : 'justify-center'"
          >
            <v-col v-if="isWoltSettingsPresent" cols="6">
              <Button
                :text="venue.info.availability.wolt ? 'Close Wolt' : 'Open Wolt'"
                class="my-3"
                @handleClick="changeVenueStatus(1, !venue.info.availability.wolt)"
              />
            </v-col>
            <v-col v-if="isBoltSettingsPresent" cols="6">
              <Button
                :text="venue.info.availability.bolt ? 'Close Bolt' : 'Open Bolt'"
                class="my-3"
                @handleClick="changeVenueStatus(2, !venue.info.availability.bolt)"
              />
            </v-col>
          </v-row>
        </div>
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
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import Button from '@/components/commonComponents/Button';
import { mapGetters } from 'vuex';

export default {
  name: 'VenueModal',
  components: {
    Button,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  props: {
    opened: {
      type: Boolean,
    },
    action: {
      type: String,
    },
    changeStatus: {
      type: Function,
    },
    venue: {
      type: Object,
    },
    isLoading: {
      type: Boolean,
    },
    isWoltSettingsPresent: {
      type: Boolean,
    },
    isBoltSettingsPresent: {
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters('app', ['getCurrentVenue']),
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
      this.$emit('closeVenueModal');
    },
    changeVenueStatus(disId, isOnline) {
      this.changeStatus(disId, isOnline);
      this.syncedOpened = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-input-number {
  display: flex;
  align-items: center;
  justify-content: center;
  &-btn {
    font-size: 32px;
    font-weight: bold;
    background-color: #d5deff !important;
    color: #5b7ffe;
    box-shadow: none !important;
    height: 80px !important;
    width: 80px;
    &-left {
      border-radius: 4px 0 0 4px !important;
    }
    &-right {
      border-radius: 0px 4px 4px 0 !important;
    }
  }
  &-field {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 80px;
    font-size: 34px;
    text-align: center;
    font-weight: bold;
    color: #5b7ffe;
    background-color: #f2f2f2;
  }
}
</style>
