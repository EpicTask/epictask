<template>
    <div class="child">
      <header>
        <h1>Welcome, {{ childName }}!</h1>
        <p>Complete tasks and earn tokens.</p>
      </header>
      <section>
        <h2>Your Tasks</h2>
        <ul>
          <li v-for="task in tasks" :key="task.id">
            <span>{{ task.description }}</span>
            <span>Tokens: {{ task.tokenReward }}</span>
            <button @click="completeTask(task.id)">Complete</button>
          </li>
          <li v-if="tasks.length === 0">No tasks available</li>
        </ul>
      </section>
      <section>
        <h2>Your Token Balance</h2>
        <p>Tokens: {{ tokenBalance }}</p>
        <button @click="redeemTokens">Redeem Tokens</button>
      </section>
      <footer>
        <button @click="logout">Logout</button>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Child',
    data() {
      return {
        childName: 'Emma',
        tasks: [
          { id: 1, description: 'Clean the room', tokenReward: 10 },
          { id: 2, description: 'Wash the dishes', tokenReward: 15 },
          { id: 3, description: 'Do homework', tokenReward: 20 },
        ],
        tokenBalance: 35,
      };
    },
    methods: {
      completeTask(taskId) {
        // Logic to mark a task as completed
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.tokenBalance += this.tasks.find(task => task.id === taskId).tokenReward;
      },
      redeemTokens() {
        // Logic to redeem tokens for rewards or conversion
        // Redirect to rewards page or perform necessary actions
      },
      logout() {
        // Logic to log out the child user
        // Redirect to login page or perform necessary actions
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your child component styles here */
  .child {
    text-align: center;
    margin: 50px auto;
    max-width: 600px;
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
  
  button {
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  footer {
    margin-top: 30px;
  }
  </style>
  