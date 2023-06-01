<template>
  <div class="task-card">
    <div class="task-details">
      <h3>{{ task.task_description }}</h3>
      <p>Reward: {{ task.reward_amount }} {{ task.reward_currency }}</p>
      <p>Due Date: {{ task.expiration_date }}</p>
      <p>Assigned To: {{ task.assigned_to }}</p>
    </div>
    <div class="task-actions">
      <button @click="completeTask(task.id)">Completed</button>
      <button @click="editTask(task.id)">Edit</button>
      <button @click="assignTask(task.id)">Assign</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  methods: {
    
    formatDate(timestamp) {
      const date = new Date(timestamp * 1000);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
    },

    completeTask(taskId) {
      // Logic to mark a task as completed
      // Emit an event or call a method to handle the completion
    },
    editTask(taskId) {
      // Logic to edit a task
      // Emit an event or call a method to handle the editing
    },
    assignTask(taskId) {
      // Logic to assign a task
      // Emit an event or call a method to handle the assignment
    },
  },
};
</script>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  /* background-color: #f1f1f1; */
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-details {
  margin-bottom: 1rem;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

button {
  margin: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
