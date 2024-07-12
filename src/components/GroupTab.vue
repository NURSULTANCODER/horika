<template>
  <div class="group-tab">
    <template v-for="item in list">
      <div
        @click="clickHandler(item.id)"
        class="group-tab-item d-flex align-center justify-space-between"
        :class="activeItemId == item.id ? 'group-tab-item-active' : ''"
        :key="item.id"
      >
        <span>{{ item.name || item.userName }}</span>
        <v-menu v-if="showDots" offset-y left nudge-left="-15" nudge-top="-20" transition="none">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="handleEdit(item)" class="list-item-button"> Edit restaurant group </v-list-item>
            <!-- <v-list-item @click="handleDelete(item.id)" class="red--text list-item-button">
							Delete restaurant group
						</v-list-item> -->
          </v-list>
        </v-menu>
      </div>
    </template>
    <Modal v-model="isModalOpen" :formData="activeListItem" @saveForm="saveEdit" title="Edit restaraunt group" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Modal from '@/components/modals/Modal';
import { TOAST_TYPES } from '@/data';

export default {
  name: 'GroupTab',
  components: {
    Modal,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    activeItemId: {
      type: [Number, String],
      default: 0,
    },
    showDots: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isModalOpen: false,
      activeListItem: '',
    };
  },
  methods: {
    ...mapActions({
      deleteVenueGroup: 'venueGroups/deleteItem',
      editVenueGroup: 'venueGroups/changeItemToDB',
    }),
    clickHandler(id) {
      if (this.activeItemId !== id) {
        this.$emit('tabClick', id);
      }
    },
    async handleDelete(id) {
      let res = await this.$dialog.confirm({
        text: 'Are you sure you want to delete?',
        title: 'Warning',
      });
      if (res) {
        this.deleteVenueGroup(id).then(() => {
          this.$notify.toast('Restaurant group has been successfully deleted!', TOAST_TYPES.SUCCESS);
        });
      }
    },
    handleEdit(item) {
      this.activeListItem = item;
      this.isModalOpen = true;
    },
    saveEdit(form) {
      this.editVenueGroup(form).then(() => {
        this.isModalOpen = false;
        this.$notify.toast('Restaurant group has been successfully edited!', TOAST_TYPES.SUCCESS);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.v-menu__content {
  border-radius: 8px;
}
</style>
