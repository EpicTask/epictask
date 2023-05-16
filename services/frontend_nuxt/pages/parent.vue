<template>
  <div class="parent">
    <header>
      <h1>Welcome, {{ parentName }}!</h1>
      <p>Manage tasks and rewards for your children.</p>
    </header>
    <section>
      <h2>Create a Task</h2>
      <form @submit.prevent="createTask">
        <label for="taskDescription">Task Description:</label>
        <input
          type="text"
          id="taskDescription"
          v-model="taskDescription"
          required
        />
        <label for="tokenReward">Token Reward:</label>
        <input type="number" id="tokenReward" v-model="tokenReward" required />
        <button type="submit">Create Task</button>
      </form>
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
      childTasks: [
        { id: 1, description: "Clean the room", tokenReward: 10 },
        { id: 2, description: "Wash the dishes", tokenReward: 15 },
        { id: 3, description: "Do homework", tokenReward: 20 },
      ],
    };
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
