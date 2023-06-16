import Vue from 'vue' import VueSnip from 'vue-snip' Vue.use(VueSnip)
<template>
  <v-card class="task-details-card">
    <v-card-title>
      <span class="headline task-details-card-title">{{ task_title }}</span>
    </v-card-title>
    <v-card-subtitle>
      {{ project_name }}
    </v-card-subtitle>
    <v-card-text>
      <div>
        <strong>{{ terms_blob }}</strong>
      </div>
      <v-row class="task-detail-row justify-space-evenly">
        <v-col cols="12"
              sm="6"
              md="5"
              lg="5">
          <div>
            <strong><v-icon>mdi-currency-usd</v-icon> {{ reward_amount }}</strong>
            
          </div></v-col
        >
        <v-col cols="12"
              sm="6"
              md="5"
              lg="5">
          <div>
            <strong><v-icon>mdi-currency-usd</v-icon> {{ reward_currency }}</strong>
            
          </div></v-col
        >
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      task_title: "Sample Task",
      task_description:
        "This is a sample task description. That can have a long detail explanation as to what this task is or isn't that depends on the user that created this task.",
      project_name: "Sample Project",
      requires_attachments: true,
      terms_blob:
        "Dust all surfaces, vacuum carpets, and mop hard floors. Wipe down countertops, appliances, and high-touch areas with disinfectants.",
      reward_amount: 100.0,
      reward_currency: "XRP",
      payment_method: "Pay directly",
    };
  },
};
</script>
<style scoped>
.justify-space-evenly {
  justify-content: space-evenly;
}
.task-details-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
}

.task-details-card-title {
    font-weight: bold;
}

.task-detail-row {
  padding-top: 20px;
  padding-bottom: 10px;
}

.task-detail-value {
  margin-left: 10px;
  font-weight: bold;
}
</style>
