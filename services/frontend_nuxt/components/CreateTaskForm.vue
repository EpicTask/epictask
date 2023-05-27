<template>
  <div>
    <v-form @submit.prevent="submitForm">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="task_title"
              label="Task Title"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="task_description"
              label="Task Description"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="project_name"
              label="Project Name"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-checkbox
              v-model="requires_attachments"
              label="Requires Attachments"
            ></v-checkbox>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="terms_blob"
              label="Conditions"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="reward_currency"
              :items="currencyOptions"
              label="Reward Currency"
              required
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="payment_method"
              :items="paymentOptions"
              label="Payment Method"
              required
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="reward_amount"
              label="Reward Amount"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-btn type="submit">Submit</v-btn>
      </v-container>
    </v-form>
    <TaskCard/>
    <!-- <v-card v-if="isTaskCreated">
      <v-card-title>
        <span class="headline">Task Details</span>
      </v-card-title>
      <v-card-text>
        <div><strong>Task Title:</strong> {{ task_title }}</div>
        <div><strong>Task Description:</strong> {{ task_description }}</div>
        <div><strong>Project Name:</strong> {{ project_name }}</div>
        <div>
          <strong>Requires Attachments:</strong>
          {{ requires_attachments ? "Yes" : "No" }}
        </div>
        <div><strong>Conditions:</strong> {{ terms_blob }}</div>
        <div><strong>Reward Amount:</strong> {{ reward_amount }}</div>
        <div><strong>Reward Currency:</strong> {{ reward_currency }}</div>
        <div><strong>Payment Method:</strong> {{ payment_method }}</div>
      </v-card-text>
    </v-card> -->
  </div>
</template>

<script>
import TaskCardShort from './TaskCardShort.vue';

export default {
    data() {
        return {
            task_title: "",
            task_description: "",
            project_name: "",
            requires_attachments: false,
            terms_blob: "",
            reward_amount: 0,
            reward_currency: "",
            payment_method: "",
            currencyOptions: ["XRP", "BTC", "SOL", "ADA"],
            paymentOptions: ["Pay directly", "Create Escrow"],
            isTaskCreated: false,
        };
    },
    methods: {
        submitForm() {
            const formData = {
                task_title: this.task_title,
                task_description: this.task_description,
                project_name: this.project_name,
                requires_attachments: this.requires_attachments,
                terms_blob: this.terms_blob,
                terms_id: this.terms_id,
                reward_amount: this.reward_amount,
                reward_currency: this.reward_currency,
                payment_method: this.payment_method,
            };
            // Process the form data or make an API call here
            this.isTaskCreated = true;
            console.log(formData);
        },
    },
    components: { TaskCardShort }
};
</script>
