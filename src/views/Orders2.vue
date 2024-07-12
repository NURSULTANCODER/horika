<template>
  <v-container class="pa-lg-6 pa-md-0" fluid>
    <CardStatusBlock :page="2" />
  </v-container>
</template>

<script>
import CardStatusBlock from '@/components/CardStatusBlock';

export default {
  name: 'Orders2',
  components: {
    CardStatusBlock,
  },
  data() {
    return {};
  },
};
</script>
