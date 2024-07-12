<template>
  <div class="standart-loader">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: 'StandartLoader',
};
</script>

<style lang="scss">
.standart-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
}
</style>
