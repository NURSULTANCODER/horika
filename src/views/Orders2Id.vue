<template>
  <v-container class="pa-lg-6 pa-md-0" fluid>
    <CardStatusBlockId :page="2" />
  </v-container>
</template>

<script>
import CardStatusBlockId from '@/components/CardStatusBlockId';

export default {
  name: 'Orders2',
  components: {
    CardStatusBlockId,
  },
  data() {
    return {};
  },
};
</script>
