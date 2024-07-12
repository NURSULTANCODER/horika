<template>
  <v-container class="pa-lg-6 pa-md-0" fluid>
    <CardStatusBlockId :page="3" />
  </v-container>
</template>

<script>
import CardStatusBlockId from '@/components/CardStatusBlockId';

export default {
  name: 'IncorrectOrders',
  components: {
    CardStatusBlockId,
  },
  data() {
    return {};
  },
};
</script>
