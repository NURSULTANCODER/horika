<template>
  <div style="position: relative; top: 40%; text-align: center">
    <h1>404</h1>
    <h1>Page not found</h1>
    <router-link to="/new-orders" style="font-size: 26px">Go home</router-link>
  </div>
</template>

<script>
export default {
  name: 'Error',
  data() {
    return {};
  },
};
</script>
