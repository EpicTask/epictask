<template>
  <div class="parent">
    <header>
      <h1>Welcome, {{ displayName }}!</h1>
      <p v-if="!hasAssignedTasks">Manage tasks and rewards for your children.</p>
      <p v-else>Manage your tasks.</p>
    </header>

    <section class="section-container" v-if="!hasAssignedTasks">
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
        <v-row class="justify-center">
          <v-col cols="auto">
            <button type="submit">Create Task</button>
          </v-col>
          <v-col cols="auto">
            <v-btn class="default-button" variant="text" size="small">
              Advanced</v-btn
            >
          </v-col>
        </v-row>
      </form>
    </section>

    <template v-if="hasTasks">
      <section class="section-container">
        <v-row class="justify-start ml-1" justify="space-between">
          <h2>Open Tasks</h2>
          <v-btn class="ma-2" variant="text" size="small" to="/">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-row>

        <hr class="content-separator" />
        <div v-if="tasks.length === 0">No tasks created</div>
        <div v-else>
          <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
        </div>
      </section>
    </template>

    <template v-if="hasAssignedTasks">
      <section class="section-container">
        <v-row class="justify-start ml-1" justify="space-between">
          <h2>Tasks Assigned To You</h2>
          <v-btn class="ma-2" variant="text" size="small" to="/">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-row>

        <hr class="content-separator" />
        <div v-if="assignedTasks.length === 0">No tasks assigned</div>
        <div v-else>
          <TaskCardAssigned
            v-for="task in assignedTasks"
            :key="task.id"
            :task="task"
          />
        </div>
      </section>
    </template>
  </div>
</template>


<script>
import DateSelector from "~/components/DateSelector.vue";
import TaskCard from "~/components/TaskCard.vue";
import TaskCardAssigned from "~/components/TaskCardAssigned.vue";

export default {
  name: "Parent",
  data() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    const oneWeekFromNow = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    return {
      displayName: "",
      imageUrl: require("~/assets/profile.png"),
      reward_currencyOptions: ["XRP", "EPIC"],
      userName: "Randy Nolden",
      task_description: "",
      reward_amount: "",
      tasks: [],
      assignedTasks: [],
      reward_currency: "XRP",
      expiration_date: formattedDate,
      calculateOneWeekFromNow: oneWeekFromNow.toISOString(),
    };
  },
  created() {
    this.getTasks();
    this.getAssignedTasks();
    this.fetchUserProfile();
  },
  computed: {
    hasTasks() {
      return this.tasks.length > 0;
    },
    hasAssignedTasks() {
      return this.assignedTasks.length > 0;
    },
  },
  methods: {
    reloadPage() {
      setTimeout(() => {
        this.$router.push("/");
      }, 2000); // 2000 milliseconds = 2 seconds
    },
    async fetchUserProfile() {
      try {
        const user_id = this.$fire.auth.currentUser.uid;
        const userDocRef = this.$fire.firestore
          .collection("users")
          .doc(user_id);
        const userDocSnapshot = await userDocRef.get();

        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          this.displayName = userData.displayName;
          this.userEmail = userData.email;
          if (userData.imageUrl) {
            this.imageUrl = userData.imageUrl;
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },
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
        const baseUrl = this.$config.taskUrl;
        const result = await this.$axios.post(
          `${baseUrl}/TaskCreated`,
          newTask
        );
        console.log(result);
        this.reloadPage();
      } catch (error) {
        console.log(error);
      }
    },
    completeTask(task, ownerId) {
      const user_id = this.$fire.auth.currentUser.uid;
      const user_ids = this.task.assigned_to;
      let completeTaskData;

      if (user_id === ownerId) {
        completeTaskData = {
          task_id: task.task_id,
          completed_by_id: user_ids[0],
          verified: true,
          marked_completed: task.marked_completed,
        };
      } else {
        completeTaskData = {
          task_id: task.task_id,
          completed_by_id: user_ids[0],
          marked_completed:
            task.marked_completed !== null ? !task.marked_completed : true,
        };
      }

      try {
        const baseUrl = this.$config.taskUrl;
        const result = this.$axios.post(
          `${baseUrl}/TaskCompleted`,
          completeTaskData
        );
        console.log(result);
        this.reloadPage();
      } catch (error) {
        console.log(error);
      }
    },
    logout() {
      // Logic to log out the parent user
      // Redirect to login page or perform necessary actions
    },
    async getTasks() {
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
          reward_currency: doc.data().reward_currency,
          expiration_date: doc.data().expiration_date,
          assigned_to: doc.data().assigned_to_ids,
          marked_completed: doc.data().marked_completed,
          user_id: doc.data().user_id,
        };
        childTaskObj.push(newTask);
      });

      return { docs: docOutput };
    },
    async getAssignedTasks() {
      const user_id = this.$fire.auth.currentUser.uid;
      const docOutput = [];

      const taskEvents = this.$fire.firestore
        .collection("test_tasks")
        .where("assigned_to_ids", "array-contains", user_id);
      const snapshot = await taskEvents.get();
      const childTaskObj = this.assignedTasks;
      snapshot.forEach((doc) => {
        console.log(doc.data());
        const newTask = {
          task_id: doc.data().task_id,
          task_description: doc.data().task_description,
          reward_amount: parseInt(doc.data().reward_amount),
          reward_currency: doc.data().reward_currency,
          expiration_date: doc.data().expiration_date,
          marked_completed: doc.data().marked_completed,
          assigned_to: doc.data().assigned_to_ids,
        };
        childTaskObj.push(newTask);
      });

      return { docs: docOutput };
    },
    handleDateChange(date) {
      this.expiration_date = date;
    },
  },
  components: { DateSelector, TaskCard, TaskCardAssigned },
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
  color: white;
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

.section-container {
  margin-top: 30px;
}

.default-button {
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
