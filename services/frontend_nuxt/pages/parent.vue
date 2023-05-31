<template>
  <div class="parent">
    <header>
      <h1>Welcome, {{ parentName }}!</h1>
      <p>Manage tasks and rewards for your children.</p>
    </header>
    <section>
      <h2>Create a Task</h2>
      <v-row>
        <v-col cols="6"
              sm="1"
              md="2"
              lg="4">
          <form @submit.prevent="createTask">
          <v-text-field
                  v-model="taskDescription"
                  id="taskDescription"
                  label="Task Description:"
                  required
                ></v-text-field>
          <v-text-field
                  v-model="tokenReward"
                  id="tokenReward"
                  label="Token Reward:"
                  type="number"
                  required
                ></v-text-field>
          <button type="submit">Create Task</button>
        </form>
        </v-col>
      </v-row>
    </section>
    <section>
      <h2>Your Child's Tasks</h2>
      <ul>
        <li v-for="task in childTasks" :key="task.id">
          <span>{{ task.description }}</span>
          <span>Tokens: {{ task.tokenReward }}</span>
          <button @click="completeTask(task.id)">Complete</button>
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
      let childTaskObj =  this.childTasks;
        const axios = require('axios');
        axios.get('http://localhost:80/get/tasks')
          .then(function (response) {
            // handle success
            for(let i = 0; i < response.data.docs.length; i++) {
                  const newTask = {
                    id: response.data.docs[i].task_id,
                    description: response.data.docs[i].additional_data.task_description,
                    tokenReward: parseInt(response.data.docs[i].additional_data.reward_amount),
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
  align-items: left;
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

div {
  outline: 0px solid blue;
}
</style>
