<template>
  <div class="parent">
    <header>
      <h1>Welcome, {{ parentName }}!</h1>
      <p>Manage tasks and rewards for your children.</p>
    </header>
    <section>
      <h2>Create a Task</h2>
      <form @submit.prevent="createTask">
        <v-row>
          <v-col cols="12" sm="6">
            <label for="taskDescription">Task Description:</label>
            <input
              type="text"
              id="taskDescription"
              v-model="taskDescription"
              required
            />
            <label for="tokenReward">Token Reward:</label>
            <input type="number" id="tokenReward" v-model="tokenReward" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="currencyOptions"
              :items="currencyOptions"
              label="Reward Currency"
              required
            ></v-select>
          </v-col>
        </v-row>
        <button type="submit">Create Task</button>
      </form>
    </section>
    <section>
      <h2>Open Tasks</h2>
      <ul>
        <li v-for="task in childTasks" :key="task.id">
          <span>{{ task.description }}</span>
          <span>Tokens: {{ task.tokenReward }}</span>
          <button type="submit" @click="completeTask(task.id)">Complete</button>
        </li>
        <li v-if="childTasks.length === 0">No tasks assigned</li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  name: "Parent",
  data() {
    return {
      currencyOptions: ["XRP", "BTC", "eTask"],
      parentName: "John Doe",
      taskDescription: "",
      tokenReward: "",
      childTasks: [],
    };
  },
  mounted(){
    this.getTasks();
  },
  methods: {
    createTask() {
      // Logic to create a task
      const newTask = {
        id: this.childTasks.length + 1,
        description: this.taskDescription,
        tokenReward: parseInt(this.tokenReward),
        reward_currency: this.reward_currency
      };
      this.childTasks.push(newTask);
      this.taskDescription = "";
      this.tokenReward = "";
    },
    completeTask(taskId) {
      // Logic to mark a task as completed
      this.childTasks = this.childTasks.filter((task) => task.id !== taskId);
    },
    logout() {
      // Logic to log out the parent user
      // Redirect to login page or perform necessary actions
    },
    async getTasks(){
      //logic to get tasks
      const baseUrl = "https://task-management-5wpxgn35iq-uc.a.run.app";
      let childTaskObj =  this.childTasks;
        const axios = require('axios');
        axios.get(`${baseUrl}/tasks`,)
          .then(function (response) {
            console.log(response);
            // handle success
            for(let i = 0; i < response.data.docs.docs.length; i++) {
                  const newTask = {
                    id: response.data.docs.docs[i].task_id,
                    description: response.data.docs.docs[i].task_description,
                    tokenReward: parseInt(response.data.docs.docs[i].reward_amount),
                  };
                  childTaskObj.push(newTask);
            };
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .finally(function () {
            // always executed
          });
    },
  },
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
</style>
