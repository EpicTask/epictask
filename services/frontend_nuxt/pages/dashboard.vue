<template>
    <div>
      <h2>Dashboard</h2>
      <p>Number of tasks assigned: {{ assignedTasks.length }}</p>
      <p>Total earnings: {{ totalEarnings }}</p>
      <div>
        <h3>Upcoming Expirations</h3>
        <ul>
          <!-- check if upcomingExpirations array is not empty before showing the list -->
          <li v-for="expirationDate in upcomingExpirations" :key="expirationDate" v-if="upcomingExpirations.length > 0">
            {{ expirationDate }}
          </li>
          <!-- show a message if the upcomingExpirations array is empty -->
          <li v-if="upcomingExpirations.length === 0">
            No upcoming expirations
          </li>
        </ul>
      </div>
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
        tasks: [],
        assignedTasks: [],
        upcomingExpirations: [],
      };
    },
    async created() {
      // use Promise.all to wait for all async methods to finish before calculating dashboard data
      await Promise.all([this.getTasks(), this.getAssignedTasks(), this.fetchUserProfile()]);
      this.calculateDashboardData()
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
      calculateDashboardData() {
        // Extract the necessary data from tasks
        this.totalEarnings = this.assignedTasks.reduce(
          (total, assignedTask) => total + assignedTask.reward_amount,
          0
        );

      // Extract upcoming expiration dates from tasks
      const today = new Date();
      this.upcomingExpirations = this.assignedTasks
        .filter((assignedTask) => new Date(assignedTask.expiration_date) > today)
        .map((assignedTask) => assignedTask.expiration_date);
    },
  },
};
  </script>
  
  <style>
  /* CSS styles for the dashboard component */
  </style>
  