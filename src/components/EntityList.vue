<template>
  <div class="entity-list">
    <StandartLoader v-if="isLoading" />
    <div v-if="!isTabSelected">
      <h3 class="info-title">Select restaurant or restaurant group</h3>
    </div>
    <div v-if="!isLoading && list.length < 1 && isTabSelected">
      <h3 v-if="isSearched" class="info-title">Sorry, we couldn't find any results</h3>
      <h3 v-else class="info-title">No data in this group</h3>
    </div>
    <template v-if="!isLoading">
      <div v-if="list.length > 0" class="entity-list-header">
        <v-row class="entity-list-header-row align-center" no-gutters>
          <v-col class="checkbox-col">
            <div class="entity-list-header-col">
              <v-checkbox v-model="isCheckedAll" large class="entity-checkbox"></v-checkbox>
            </div>
          </v-col>
          <v-col>
            <div class="entity-list-header-col">
              <span v-if="isShowEmail" class="entity-list-item-title">Login</span>
              <span v-if="!isShowEmail" class="entity-list-item-title">Restaurant name</span>
            </div>
          </v-col>
          <v-col v-if="isShowEmail" cols="7">
            <div class="entity-list-header-col">
              <span>Email</span>
            </div>
          </v-col>
        </v-row>
      </div>
      <div class="entity-list-item" v-for="item in list" :key="item.id">
        <v-row no-gutters class="align-center">
          <v-col class="checkbox-col">
            <v-checkbox v-model="isCheckedAll" large class="entity-checkbox"></v-checkbox>
          </v-col>
          <v-col>
            <router-link :to="`${detailUrl}/${item.id}`" class="entity-list-item-title">{{
              item.name || item.userName
            }}</router-link>
          </v-col>
          <v-col v-if="!isShowEmail" cols="3" class="d-flex justify-center">
            <span class="entity-list-item-date"
              >Wolt exp. date: <br />
              {{ formatDateTime(dateTimeFormats, item.settings.venueSelfSettings.woltExpiredDateUtc) }}</span
            >
          </v-col>
          <v-col v-if="!isShowEmail" cols="3" class="d-flex justify-center">
            <span class="entity-list-item-date"
              >Bolt exp. date: <br />
              {{ formatDateTime(dateTimeFormats, item.settings.venueSelfSettings.boltExpiredDateUtc) }}</span
            >
          </v-col>
          <v-col v-if="isShowEmail" cols="2">
            <span>{{ item.email }}</span>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn :loading="isLoading" class="mr-4" style="float: right" @click="openMenuModal(item.id)"
              >Update menus</v-btn
            >
            <v-menu offset-y auto transition="none">
              <template v-slot:activator="{ on, attrs }">
                <v-btn text icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-if="$route.name === 'venues'"
                  @click="$router.push(`new-orders-id/${item.id}`)"
                  class="list-item-button"
                >
                  Orders
                </v-list-item>
                <v-list-item
                  v-if="$route.name !== 'venues'"
                  @click="handleDelete(item.id)"
                  class="red--text list-item-button"
                >
                  Delete
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </div>
    </template>
     <MenuModal
      v-model="isMenuModalShow"
      :venueId="venueId"
    />
  </div>
</template>

<script>
import StandartLoader from '../components/StandartLoader.vue';
import { TOAST_TYPES } from '@/data';
import dateFormat from '../mixins/date-format';
import MenuModal from '@/components/modals/MenuModal';

import { mapActions, mapGetters, mapMutations } from 'vuex';
export default {
  name: 'EntityList',
  components: {
    StandartLoader,
    MenuModal,
  },
  mixins: [dateFormat],
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: true,
    },
    isSearched: {
      type: Boolean,
      default: false,
    },
    isShowEmail: {
      type: Boolean,
      default: false,
    },
    detailUrl: {
      type: String,
      default: 'new-orders-id',
    },
    pageName: {
      type: String,
      default: 'Restaurant name',
    },
    groupId: {
      type: [String, Number],
    },
  },
  data() {
    return {
      isCheckedAll: false,
      dateTimeFormats: {
        dateOrder: 0,
        dateSeparator: '.',
        timeFormat: 0,
      },
      isMenuModalShow: false,
      venueId: '',
    };
  },
  watch: {
    list() {
      this.isCheckedAll = false;
    },
    getGeneralSettings() {
      this.setDateTimeFormats();
    },
  },
  computed: {
    ...mapGetters({
      getGeneralSettings: 'app/getGeneralSettings',
      isLoading: 'venues/isLoading',
    }),
    isTabSelected() {
      return this.groupId !== -1;
    },
  },
  methods: {
    ...mapMutations({
      setMenu: 'venues/setMenu',
      setLastUpdateTime: 'venues/setLastUpdateTime',
    }),
    ...mapActions('venues', ['fetchMenu']),
    async openMenuModal(id) {
      this.venueId = id
      if(localStorage.getItem(id)) {
        await this.setMenu(JSON.parse(localStorage.getItem(id)).menu)
        await this.setLastUpdateTime(JSON.parse(localStorage.getItem(id)).lastUpdateTime)
        this.isMenuModalShow = true;
      }else {
        const menu = await this.fetchMenu(id);
        const date = new Date()
        this.setLastUpdateTime(date)
        localStorage.setItem(id, JSON.stringify({menu, lastUpdateTime: date}))
        this.isMenuModalShow = true;
      }
    },
    closeMenuModal() {
      this.isMenuModalShow = false;
    },
    async handleDelete(id) {
      let res = await this.$dialog.confirm({
        text: 'Are you sure you want to delete?',
        title: 'Warning',
      });
      if (res) {
        this.$emit('handleDelete', id);
      }
    },
  },
};
</script>

<style lang="scss">
.entity-list {
  &-item {
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid #ededed;
    padding: 0 16px;
    margin-bottom: 8px;

    &-title {
      color: #5b7ffe !important;
      font-size: 16px;
      font-weight: 400;
      margin: 0;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
    &-date {
      font-size: 14px;
    }
  }
  &-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
  }
  &-header {
    border: none;
    margin-bottom: 16px;

    &-row {
      gap: 4px;
      align-items: stretch !important;
    }

    &-col {
      padding: 0 16px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid #ededed;
      min-height: 68px;
      display: flex;
      align-items: center;
    }

    .entity-list-item-title {
      color: #323233 !important;
      &:hover {
        text-decoration: none;
      }
    }
  }
}
.entity-checkbox {
  .v-icon {
    font-size: 28px !important;
  }
}

.list-item-button {
  cursor: pointer;
  &:hover {
    background-color: #ededed;
  }
}

@media screen and (max-width: 1024px) {
  .entity-list-item-date {
    display: none;
  }
}
</style>
