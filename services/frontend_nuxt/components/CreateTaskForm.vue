<template>
  <div>
    <v-form @submit.prevent="submitForm">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="task_description"
              label="Task Description"
              required
            ></v-text-field>
          </v-col>
          <!-- <v-col cols="12" sm="6">
            <v-text-field
              v-model="task_title"
              label="Task Title"
              required
            ></v-text-field>
          </v-col> -->
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
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="reward_currency"
              :items="currencyOptions"
              label="Reward Currency"
              required
            ></v-select>
          </v-col>
            <v-col cols="12" sm="6">
              <DateSelector
                v-model="expiration_date"
                :defaultDate="calculateOneWeekFromNow"
                @change="handleDateChange"
              />
            </v-col>
          
        </v-row>
        <h3 class="mt-3">Advanced</h3>
        <hr class="content-separator" />
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="project_name"
              label="Project Name"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
          <v-text-field
            v-model="terms_blob"
            label="Conditions"
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

        <v-btn type="submit">Submit</v-btn>
      </v-container>
    </v-form>
    <TaskCardShort />
  </div>
</template>

<script>
import DateSelector from "./DateSelector.vue";
import TaskCardShort from "./TaskCardShort.vue";

export default {
  data() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    const oneWeekFromNow = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      task_title: "",
      task_description: "",
      project_name: "",
      requires_attachments: false,
      terms_blob: "",
      reward_amount: 0,
      reward_currency: "",
      payment_method: "",
      expiration_date: formattedDate,
      calculateOneWeekFromNow: oneWeekFromNow.toISOString(),
      currencyOptions: ["XRP", "BTC", "eTask"],
      paymentOptions: ["Pay directly", "Create Escrow"],
      isTaskCreated: false,
    };
  },
  methods: {
    async submitForm() {
      const newTask = {
        expiration_date: this.expiration_date,
        task_title: this.task_title,
        task_description: this.task_description,
        project_name: this.project_name,
        requires_attachments: this.requires_attachments,
        terms_blob: this.terms_blob,
        task_id: "",
        reward_amount: parseFloat(this.reward_amount),
        reward_currency: this.reward_currency,
        payment_method: this.payment_method,
        user_id: this.$fire.auth.currentUser.uid,
      };
      console.log(newTask);
      // Process the form data or make an API call here
      try {
        const baseUrl = this.$config.taskUrl;
        const result = await this.$axios.post(
          `${baseUrl}/TaskCreated`,
          newTask
        );
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    },
    handleDateChange(date) {
      this.expiration_date = date;
    },
  },
  components: { TaskCardShort, TaskCardShort, DateSelector },
};
</script>
