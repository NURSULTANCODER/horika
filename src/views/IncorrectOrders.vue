<template>
  <v-container class="pa-lg-6 pa-md-0" fluid>
    <CardStatusBlock :page="3" />
  </v-container>
</template>

<script>
import CardStatusBlock from '@/components/CardStatusBlock';

export default {
  name: 'IncorrectOrders',
  components: {
    CardStatusBlock,
  },
  data() {
    return {};
  },
};
</script>
