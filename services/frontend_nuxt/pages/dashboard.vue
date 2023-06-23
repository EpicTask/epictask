<template>
  <div>
    <h2>Dashboard</h2>
    <table>
      <thead>
        <tr>
          <th>Number of Tasks</th>
          <th>Total Earnings</th>
          <th>
            Current Value<br />
            (USD)
          </th>
          <th>XRP <br />(USD)</th>
          <th>Upcoming Expirations</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ assignedTasks.length }}</td>
          <td>{{ totalEarnings }} XRP</td>
          <td>{{ currentValue }}</td>
          <td>{{ xrpToUSD }}</td>
          <td>
            <ul>
              <li
                v-for="expirationDate in upcomingExpirations"
                :key="expirationDate"
              >
                {{ expirationDate }}
              </li>
              <li v-if="upcomingExpirations.length === 0">
                No upcoming expirations
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    return {
      displayName: "",
      imageUrl: "",
      totalEarnings: 0,
      xrpToUSD: "",
      currentValue: 0,
      tasks: [],
      assignedTasks: [],
      upcomingExpirations: [],
    };
  },
  async created() {
    // use Promise.all to wait for all async methods to finish before calculating dashboard data
    await Promise.all([
      this.getTasks(),
      this.getAssignedTasks(),
      this.fetchUserProfile(),
      this.getUSDValue(),
    ]);
    this.calculateDashboardData();
    this.calculateValue();
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
          if (userData.imageUrl) {
            this.imageUrl = userData.imageUrl;
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
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
    async getUSDValue() {
      const baseURL =
        "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd";
      const response = await this.$axios.get(baseURL);
      console.log(response);
      this.xrpToUSD = response.data.ripple.usd;
    },
    calculateValue() {
      this.currentValue = parseFloat(this.xrpToUSD) * this.totalEarnings;
    },
    calculateDashboardData() {
      // Extract the necessary data from tasks
      this.totalEarnings = this.assignedTasks.reduce(
        (total, assignedTask) => total + assignedTask.reward_amount,
        0
      );

      // Extract upcoming expiration dates from tasks
      const today = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      this.upcomingExpirations = this.assignedTasks
        .filter((assignedTask) => {
          const expirationDate = new Date(assignedTask.expiration_date * 1000); // Convert timestamp to milliseconds
          return expirationDate > today;
        })
        .map((assignedTask) => {
          const expirationDate = new Date(assignedTask.expiration_date * 1000); // Convert timestamp to milliseconds
          return {
            expirationDate: formatter.format(expirationDate),
            timestamp: assignedTask.expiration_date,
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((assignedTask) => assignedTask.expirationDate);
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
</style>
