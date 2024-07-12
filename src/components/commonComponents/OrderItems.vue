<template>
  <div>
    <div class="mt-2">
      <div v-for="item in orderItems" :key="item.id" class="order-product-item mb-2">
        <span>{{ item.count || item.qty }} x </span><span>{{ item.name }}</span><span class="text-uppercase"> ({{ getItemPrice(item) }})</span>
        <div v-if="item.user_note" class="order-product-item-comment">{{ item.user_note }}</div>
        <template v-if="item.options.length > 0">
          <p class="pl-4 mt-2 mb-2">OPTIONS:</p>
          <p class="pl-4 mt-2 mb-2" v-for="option in item.options" :key="option.id">
            <span v-if="!(/\d\sx\s/.test(option.value) || /\d\sx\s/.test(option.name))">{{ option.count || option.qty }} x </span>
            <span>{{ option.value || option.name }}</span>
            <span class="text-uppercase"> ({{ getOptionPrice(option) }})</span>
          </p>
        </template>
      </div>
    </div>
    <p class="mt-2 d-flex justify-space-between order-price-items">
      <span v-if="orderItems"
        >{{ orderItems.length }}
        <span v-if="orderItems.length < 2">item</span>
        <span v-else>items</span>
      </span>
      <span v-if="price"
        >{{ price }} <span class="text-uppercase">{{ priceCurrency }}</span></span
      >
    </p>
  </div>
</template>

<script>
export default {
  name: 'OrderItems',
  props: ['orderItems', 'price', 'priceCurrency', 'isWoltOrBolt'],
  methods: {
    getItemPrice(item) {
      if (this.isWoltOrBolt === 'wolt') {
        return `${this.splitPrice(item.total_price.amount)} ${item.total_price.currency}`; 
      }
      if (this.isWoltOrBolt === 'bolt') {
        return `${item.unit_item_price.value} ${item.unit_item_price.currency}`;
      }
    },
    getOptionPrice(option) {
      if (this.isWoltOrBolt === 'wolt') {
        return `${this.splitPrice(option.price.amount)} ${option.price.currency}`;
      }
      if (this.isWoltOrBolt === 'bolt') {
        return `${option.unit_item_price.value} ${option.unit_item_price.currency}`
      }
    },
    splitPrice: function (value) {
      return (value / 100).toFixed(2);
    },
  }
};
</script>

<style lang="scss" scoped>
.order-price-items {
  font-size: 18px;
  color: #000;
  font-weight: bold;
  margin-bottom: 0;
  span {
    display: inline-block;
    margin-right: 10px;
  }
}

.order-product-item {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  &-comment {
    display: inline-block;
    background-color: #333;
    color: #f6f5fa;
    border-radius: 10px;
    padding: 4px 16px;
    font-size: 14px;
    letter-spacing: 0.3px;
    margin-left: 10px;
  }
}
</style>
