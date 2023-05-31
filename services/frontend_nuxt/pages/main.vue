<template>
  <div class="main">
    <v-card>
      <header>
        <h1>Welcome to EpicTask!</h1>
        <p>
          A platform to incentivize and teach children money management skills
          through tasks and rewards
        </p>
      </header>
    </v-card>
    <section>
      <h2>Get Started Today!</h2>
      <p>
        Sign up or log in to start using EpicTask and empower your children with
        financial literacy.
      </p>
      <div class="cta-buttons">
        <router-link to="/parent" class="cta-button">Parent Login</router-link>
        <router-link to="/child" class="cta-button">Child Login</router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Main",
};
</script>

<style scoped>
/* Add your main component styles here */
.main {
  text-align: center;
  margin: 50px auto;
  max-width: 600px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cta-button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cta-button:hover {
  background-color: #555;
}
footer {
  font-size: 14px;
  color: #888;
  margin-top: 30px;
}
</style>
