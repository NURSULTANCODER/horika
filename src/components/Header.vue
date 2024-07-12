<template>
  <v-app-bar color="grey" elevation="0" class="main-header">
    <div class="d-flex align-center justify-space-between" style="width: 100%">
      <!--      burger block with order types (always for manager and operator, in exact venue for dealer and admin)-->
      <div class="menu-links">
        <div class="menu-links-desk">
          <router-link v-for="link in getMenuLinks" class="menu_item" :to="link.value" :key="link.value">{{
            link.title
          }}</router-link>
        </div>

        <div class="menu-links-mob" v-if="getMenuLinks.length > 0">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark :disabled="getMenuLinks.length === 0" v-bind="attrs" v-on="on">
                {{ getRoles && getRoles[0].toLowerCase() === 'admin' ? 'Menu' : 'Orders' }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="link in getMenuLinks" :key="link.value">
                <v-list-item-title>
                  <router-link class="menu_item" :to="link.value">{{ link.title }}</router-link>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!--      links to allowed pages (Venues, Dealer, Managers, Operators)-->
      <div class="d-flex align-center justify-center">
        <div class="tab_link" v-for="tab in tabItems" :key="tab.id">
          <router-link
            v-if="isRouteShow(tab.urlName)"
            class="tab_link_item"
            :class="pageUrl === tab.url ? 'tab_link_item-active' : ''"
            :to="tab.url"
          >
            <img :src="require(`@/assets/icons/${tab.icon}`)" alt="" />
            <span>{{ tab.name }}</span>
          </router-link>
        </div>
      </div>
      
      <!--      last block with settings and log out icon-->
      <div class="d-flex">
        <v-btn @click="toggleSettingsDrawer" icon><v-icon>mdi-cog-outline</v-icon></v-btn>

        <div @click="logout" class="d-flex align-center">
          <div class="menu_item d-flex">
            <img src="@/assets/icons/logout.svg" alt="" style="padding-right: 5px" />Sign out
          </div>
        </div>
      </div>
    </div>
  </v-app-bar>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { TAB_ITEMS, REQUIRED_ROUTES, CARD_STATUSES } from '@/data';
import { HEADER_MENU_LINKS } from '@/data/ui';

export default {
  name: 'Header',
  data() {
    return {
      pageUrl: this.$route.fullPath,
      tabItems: TAB_ITEMS,
      headerMenuLinks: HEADER_MENU_LINKS,
      page: 0,
      drawer: false,
    };
  },
  props: {
    drawerShow: Function,
  },
  watch: {
    $route(to) {
      this.pageUrl = to.fullPath;
    },
  },
  computed: {
    ...mapGetters('app', ['getAuth', 'getRoles', 'getUserData', 'getCurrentVenue', 'getCurrentRest']),
    currentPageStatuses() {
      let result = {};
      for (let i in CARD_STATUSES) {
        if (CARD_STATUSES[i].page === this.page) {
          result[i] = CARD_STATUSES[i];
        }
      }
      return result;
    },
    inDetailMode() {
      if (
        this.$route.name === 'new-orders-id' ||
        this.$route.name === 'orders-id' ||
        this.$route.name === 'incorrect-orders-id'
      ) {
        return true;
      }
      return false;
    },
    detailModeId() {
      return this.getCurrentRest.id;
    },

    getMenuLinks() {
      let menuLinks = [];
      this.headerMenuLinks.forEach(el => {
        if (this.isRouteShow(el.value)) {
          if (this.inDetailMode)
            menuLinks.push({
              ...el,
              value: el.id ? '/' + el.value + `-id/${this.detailModeId}` : '/' + el.value,
            });
          else menuLinks.push({ ...el, value: '/' + el.value });
        } else if (this.isRouteShow(el.value + '-id'))
          menuLinks.push({
            ...el,
            value: el.id ? '/' + el.value + `-id/${this.detailModeId}` : '/' + el.value,
          });
      });
      return menuLinks;
    },
  },
  methods: {
    ...mapMutations('app', ['logout']),
    ...mapActions({
      fetchOrders: 'orders/fetchOrders',
    }),
    isRouteShow(route) {
      if (this.getRoles && this.getRoles[0]) {
        if (
          route.includes('orders') &&
          (this.getRoles[0].toLowerCase() === 'admin' || this.getRoles[0].toLowerCase() === 'dealer')
        ) {
          return (
            REQUIRED_ROUTES[this.getRoles[0].toLowerCase()].includes(route.toLowerCase()) &&
            this.$route.name.includes('order')
          );
        } else return REQUIRED_ROUTES[this.getRoles[0].toLowerCase()].includes(route.toLowerCase());
      } else return false;
    },
    toggleSettingsDrawer() {
      this.drawerShow(true);
    },
  },
};
</script>
<style lang="scss">
.menu-links-mob {
  display: none;
}

.menu_item {
  color: #000 !important;
  margin: 0 10px;
  text-decoration: none;
  position: relative;
  cursor: pointer;

  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #000;
    transition: 0.3s;
  }

  &:hover {
    &:before {
      width: 100%;
    }
  }
}

.tab_link {
  text-decoration: none;
  display: flex;
  align-items: center;
  &_item {
    margin: 0 5px;
    display: flex;
    align-items: center;
    padding: 10px;
    text-decoration: none;
    font-size: 16px;
    transition: 0.3s;
    border-radius: 8px;
    img {
      margin-right: 10px;
    }
    span {
      color: #323233;
    }
    &-active {
      background: #fff;
      box-shadow: 0 0 4px rgba(60, 60, 60, 0.2);
    }
    &:hover {
      box-shadow: 0 0 4px rgba(60, 60, 60, 0.2);
    }
  }
}

@media screen and (max-width: 1246px) {
  .menu-links-desk {
    display: none;
  }
  .menu-links-mob {
    display: block;
  }
  .menu-links-desk.menu-links-operator {
    display: block;
  }
  .menu-links-mob.menu-links-operator {
    display: none;
  }
}
</style>
