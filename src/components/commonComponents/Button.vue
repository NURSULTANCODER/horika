<template>
  <button
    :class="isVisible ? `standart-button ${buttonType}` : `hidden`"
    :disabled="isDisabled"
    @click.stop="handleClick"
  >
    <template v-if="!isLoading">
      <span>{{ text }}</span>
    </template>
    <v-progress-circular v-else indeterminate color="white" class="button-loader"></v-progress-circular>
    <template v-if="icon">
      <v-icon color="white">{{ icon }}</v-icon>
    </template>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    styleType: {
      type: String,
      default: 'primary',
    },
    icon: {
      type: String,
      default: '',
    },
  },
  computed: {
    buttonType() {
      const buttonTypes = {
        primary: 'standart-button-primary',
        warning: 'standart-button-warning',
        danger: 'standart-button-danger',
        secondary: 'standart-button-secondary',
        success: 'standart-button-success',
      };
      return buttonTypes[this.styleType];
    },
  },
  methods: {
    handleClick() {
      if (!this.isLoading) this.$emit('handleClick');
    },
  },
};
</script>

<style lang="scss" scoped></style>
