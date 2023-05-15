import Vue from 'vue'
import VueSnip from 'vue-snip'

Vue.use(VueSnip)
<template>
  <v-card class="task-details-card">
    <v-card-title>
      <span class="headline">{{ task_title }}</span>
    </v-card-title>
    <v-card-subtitle>
      {{ project_name }}
    </v-card-subtitle>
    <v-card-text>
      <div>
        <strong>{{ task_description }}</strong>
      </div>
      <div>
        <strong class="d-inline-block text-truncate" style="max-width: 250px;"><v-icon>mdi-alert-outline</v-icon> {{ terms_blob }}</strong>
      </div>
      
        <div>
          <strong><v-icon>mdi-folder-outline</v-icon> {{ project_name }}</strong>
          
        </div>
        <div>
          <strong
            ><v-icon>mdi-attachment</v-icon>
            {{ requires_attachments ? "Requires Attachments" : "No" }}</strong
          >
        </div>
        <div>
          <strong><v-icon>mdi-currency-usd</v-icon> Amount:</strong>
          {{ reward_amount }}
        </div>
        <div>
          <strong><v-icon>mdi-currency-usd</v-icon> Currency:</strong>
          {{ reward_currency }}
        </div>

      <div>
        <strong><v-icon>mdi-cash-multiple</v-icon> {{ payment_method }}</strong>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      task_title: "Sample Task Title",
      task_description: "This is a sample task description. That can have a long detail explanation as to what this task is or isn't that depends on the user that created this task.",
      project_name: "Sample Project",
      requires_attachments: true,
      terms_blob:     "Must have at least 2 years of relevant experience. Ability to work independently and meet deadlines. Strong communication and teamwork skills. Familiarity with the latest industry trends and technologies. Attention to detail and strong problem-solving abilities",
      reward_amount: 100.0,
      reward_currency: "XRP",
      payment_method: "Pay directly",
    };
  },
};
</script>
<style scoped>
.task-details-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
}

.task-details-card-title {
  background-color: #2196f3;
  color: white;
  padding: 16px;
  border-radius: 8px 8px 0 0;
}

.task-detail-row {
  margin-top: 10px;
  margin-bottom: 10px;
}

.task-detail-value {
  margin-left: 10px;
  font-weight: bold;
}
</style>
