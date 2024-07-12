<template>
  <v-container class="pa-lg-6 pa-md-0" fluid>
    <CardStatusBlockId :page="1" />
  </v-container>
</template>

<script>
import CardStatusBlockId from '@/components/CardStatusBlockId';
import { mapActions, mapMutations } from 'vuex';

export default {
  name: 'NewOrders',
  components: {
    CardStatusBlockId,
  },
  data() {
    return {};
  },
  mounted() {
    this.resetOrders();
    let venueId = this.$route.params.id;
    this.setCurrentRest({});
    this.fetchItem(venueId).then(venue => {
      this.setCurrentRest(venue);
    });
  },
  methods: {
    ...mapMutations({
      setCurrentRest: 'app/setCurrentRest',
      resetOrders: 'orders/resetOrders',
    }),
    ...mapActions({
      fetchItem: 'venues/fetchItem',
    }),
  },
};
</script>
