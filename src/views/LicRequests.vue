<template>
  <v-container class="pa-6" fluid>
    <v-row class="justify-center">
      <v-col lg="8" md="10" sm="12">
        <h2 class="sidebar-title mt-2 mb-6">Requests</h2>
        <div class="standart-card">
          <v-data-table
            :headers="headers"
            :items="requestList"
            :items-per-page="10"
            :hide-default-footer="true"
            @click:row="rowClickHandle"
            class="elevation-3"
          >
            <!-- eslint-disable-next-line -->
            <template v-slot:item.createUtc="{ item }">
              <span>{{ convertDateToLocal(item.createUtc) }}</span>
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template v-slot:item.actions="{ item }">
              <v-tooltip color="#000" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="green darken-2"
                    class="ma-1 white--text"
                    x-small
                    fab
                    v-bind="attrs"
                    v-on="on"
                    v-if="item.statusId === 1"
                    @click.stop="editItem(item, 'accept')"
                  >
                    <v-icon dark> mdi-check </v-icon>
                  </v-btn>
                </template>
                <span>Accept</span>
              </v-tooltip>
              <v-tooltip color="#000" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="red darken-2"
                    class="ma-1 white--text"
                    x-small
                    fab
                    v-bind="attrs"
                    v-on="on"
                    v-if="item.statusId === 1"
                    @click.stop="editItem(item, 'reject')"
                  >
                    <v-icon dark> mdi-window-close </v-icon>
                  </v-btn>
                </template>
                <span>Reject</span>
              </v-tooltip>
              <v-tooltip color="#000" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="red darken-4"
                    class="ma-1 white--text"
                    x-small
                    fab
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="deleteItem(item)"
                  >
                    <v-icon dark> mdi-delete </v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </div>
      </v-col>
    </v-row>
    <RequestReasonModal v-model="reasonModalShown" @sendReason="sendReasonHandler" />
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import router from '../router';
import { TOAST_TYPES } from '@/data';
import RequestReasonModal from '../components/modals/RequestReasonModal.vue';
import dateFormat from '../mixins/date-format';

export default {
  name: 'LicRequests',
  mixins: [dateFormat],
  data() {
    return {
      headers: [
        {
          text: 'Venue',
          align: 'start',
          sortable: false,
          value: 'venue.name',
        },
        { text: 'Dealer', value: 'dealer.userName', sortable: false },
        { text: 'Status', value: 'status.name', sortable: false },
        { text: 'Created at', value: 'createUtc', sortable: false },
      ],
      dateTimeFormats: {
        dateOrder: 0,
        dateSeparator: '.',
        timeFormat: 0,
      },
      reasonModalShown: false,
      itemIdToEdit: 0,
      itemStatusToEdit: 0,
    };
  },
  components: {
    RequestReasonModal,
  },
  mounted() {
    this.fetchRequests();

    if (this.getRoles[0].toLowerCase() === 'admin') {
      this.headers.push({
        text: 'Actions',
        value: 'actions',
        sortable: false,
      });
    }
  },
  computed: {
    ...mapGetters({
      requestList: 'licRequests/getList',
      getRoles: 'app/getRoles',
      getGeneralSettings: 'app/getGeneralSettings',
    }),
  },
  watch: {
    getGeneralSettings() {
      this.setDateTimeFormats();
    },
  },
  methods: {
    ...mapActions({
      fetchRequests: 'licRequests/fetchList',
      deleteRequest: 'licRequests/deleteItem',
      editRequest: 'licRequests/changeItemToDB',
    }),
    rowClickHandle(e) {
      router.push(`lic-requests/${e.id}`);
    },
    editItem(item, status) {
      let statusId = status === 'accept' ? 2 : 3;

      this.itemStatusToEdit = statusId;
      this.itemIdToEdit = item.id;

      this.reasonModalShown = true;
    },
    async deleteItem(item) {
      let res = await this.$dialog.confirm({
        text: 'Are you sure you want to delete this request?',
        title: 'Warning',
      });

      if (res) {
        try {
          let data = await this.deleteRequest(item.id);
          if (data.status <= 300) {
            this.$notify.toast('License request has successfully been deleted!', TOAST_TYPES.SUCCESS);
          }
        } catch (err) {
          this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
        }
      }
    },
    async sendReasonHandler(reason) {
      let msgToShow = this.itemStatusToEdit === 2 ? 'accepted' : 'rejected';

      let dataToSend = {
        id: this.itemIdToEdit,
        statusId: this.itemStatusToEdit,
        reason: reason,
      };

      try {
        let data = await this.editRequest(dataToSend);
        if (data.status <= 300) {
          this.$notify.toast(`License request has successfully been ${msgToShow}!`, TOAST_TYPES.SUCCESS);
          this.fetchRequests();
        }
      } catch (err) {
        this.$notify.toast('Unexpected error!', TOAST_TYPES.ERROR);
      }
      this.reasonModalShown = false;
      this.itemIdToEdit = 0;
      this.itemStatusToEdit = 0;
    },
    convertDateToLocal(date) {
      return this.formatDateTime(this.dateTimeFormats, date);
    },
  },
};
</script>

<style lang="scss" scoped></style>
