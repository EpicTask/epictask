<template>
  <div class="parent">
    <header>
      <h1>Welcome, {{ userName }}!</h1>
      <p>Manage tasks and rewards for your children.</p>
    </header>
    <section>
      <h2>Create a Task</h2>
      <form @submit.prevent="createTask">
        <v-row>
          <v-col cols="12" sm="6">
            <label for="task_description">Task Description:</label>
            <input
              type="text"
              id="task_description"
              class="white-text"
              v-model="task_description"
              required
            />
            <label for="reward_amount">Token Reward:</label>
            <input
              type="float"
              id="reward_amount"
              class="white-text"
              v-model="reward_amount"
              required
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="reward_currency"
              :items="reward_currencyOptions"
              required
            ></v-select>
            <DateSelector
              v-model="expiration_date"
              :defaultDate="calculateOneWeekFromNow"
              @change="handleDateChange"
            />
          </v-col>
        </v-row>
        <button type="submit">Create Task</button>
      </form>
    </section>
    <section>
      <h2>Open Tasks</h2>
      <ul>
        <li v-for="task in tasks" :key="task.task_id">
          <span>{{ task.task_description }}</span>
          <span>Tokens: {{ task.reward_amount }}</span>
          <button type="submit" @click="completeTask(task.id)">Complete</button>
        </li>
        <li v-if="tasks.length === 0">No tasks assigned</li>
      </ul>
    </section>
  </div>
</template>

<script>
import DateSelector from "~/components/DateSelector.vue";

export default {
  name: "Parent",
  data() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    const oneWeekFromNow = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    return {
      reward_currencyOptions: ["XRP", "EPIC"],
      userName: "John Doe",
      task_description: "",
      reward_amount: "",
      tasks: [],
      reward_currency: "XRP",
      expiration_date: formattedDate,
      calculateOneWeekFromNow: oneWeekFromNow.toISOString(),
    };
  },

  mounted() {
    this.getTasks();
  },
  methods: {
    async createTask() {
      // Logic to create a task
      const newTask = {
        task_id: "",
        task_description: this.task_description,
        reward_amount: parseFloat(this.reward_amount),
        reward_currency: this.reward_currency,
        expiration_date: this.expiration_date,
        user_id: this.$fire.auth.currentUser.uid,
        payment_method: "Pay directly",
      };
      try {
        const baseUrl = "https://task-management-5wpxgn35iq-uc.a.run.app";
        const result = await this.$axios.post(
          `${baseUrl}/TaskCreated`,
          newTask
        );
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    },
    completeTask(taskId) {
      // Logic to mark a task as completed
      this.tasks = this.tasks.filter((task) => task.task_id !== taskId);
    },
    logout() {
      // Logic to log out the parent user
      // Redirect to login page or perform necessary actions
    },
    async getTasks() {
      // try {
      //   const baseUrl = "https://task-management-5wpxgn35iq-uc.a.run.app";
      //   const response = await this.$axios.get(`${baseUrl}/tasks`);
      //   console.log(response);

      //   const childTaskObj = this.tasks;
      //   for (let i = 0; i < response.data.docs.docs.length; i++) {
          // const newTask = {
          //   task_id: response.data.docs.docs[i].task_id,
          //   task_description: response.data.docs.docs[i].task_description,
          //   reward_amount: parseInt(response.data.docs.docs[i].reward_amount),
          // };
          // childTaskObj.push(newTask);
      //   }
      // } catch (error) {
      //   console.log(error);
      //   // Handle the error here
      // }
      const user_id = this.$fire.auth.currentUser.uid;
      const docOutput = [];

      const taskEvents = this.$fire.firestore
        .collection("test_tasks")
        .where("user_id", "==", user_id);
      const snapshot = await taskEvents.get();
      const childTaskObj = this.tasks;
      snapshot.forEach((doc) => {
        console.log(doc.data());
        const newTask = {
            task_id: doc.data().task_id,
            task_description: doc.data().task_description,
            reward_amount: parseInt(doc.data().reward_amount),
          };
          childTaskObj.push(newTask);
      });

      return { docs: docOutput };
    },
    handleDateChange(date) {
      this.expiration_date = date;
    },
  },
  components: { DateSelector },
};
</script>

<style>
form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  font-weight: bold;
  margin-top: 10px;
}

input[type="text"],
input[type="number"] {
  padding: 5px;
  margin-top: 5px;
  width: 100%;
}

button[type="submit"] {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

footer {
  margin-top: 30px;
}

.white-text {
  color: white;
}

.v-picker__body {
  color: white;
}
</style>
