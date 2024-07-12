import { HubConnectionBuilder } from '@microsoft/signalr';
import { ORDER_HUB_URL } from './apiVars';

class OrderHub {
  constructor() {
    this.client = new HubConnectionBuilder()
      // .withUrl("https://delivery-api.ucs.lv/OrderHub")
      // .withUrl(new Uri("https://delivery-api.ucs.lv/OrderHub"))
      .withUrl(ORDER_HUB_URL)
      .build();
  }

  start() {
    this.client.start();
  }

  stop() {
    this.client.stop();
  }
}

export default new OrderHub();
