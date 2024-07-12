<template>
  <v-container class="pa-lg-6 pa-md-0" fluid>
    <CardStatusBlock :page="1" />
  </v-container>
</template>

<script>
import CardStatusBlock from '@/components/CardStatusBlock';

export default {
  name: 'NewOrders',
  components: {
    CardStatusBlock,
  },
  data() {
    return {};
  },
};
</script>
