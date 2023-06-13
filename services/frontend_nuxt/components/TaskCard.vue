<template>
  <div class="task-card">
    <div class="task-details">
      <h3>{{ task.task_description }}</h3>
      <p>Reward: {{ task.reward_amount }} {{ task.reward_currency }}</p>
      <p>Due Date: {{ formatDate(task.expiration_date) }}</p>
      <p>Assigned To: {{ assignedUser }}</p>
      <p v-if="task.marked_completed">Marked Completed</p>
    </div>
    <div class="task-actions">
      <button class="item-button" @click="completeTask(task, task.user_id)">
        Completed
      </button>
      <!-- <button class="item-button" @click="editTask(task.task_id)">Edit</button> -->
      <button class="item-button" @click="assignTask(task.task_id)">
        Assign
      </button>
      <button class="item-button" @click="deleteTask(task.task_id)">
        Delete
      </button>
    </div>
    <UserList
      v-if="showModal"
      :show-modal="showModal"
      :task-id="task.task_id"
      @close-modal="showModal = false"
    />
  </div>
</template>

<script>
import UserList from "./UserList.vue";

export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showModal: false,
      assignedUser: null,
    };
  },
  created() {
    this.loadAssignedUser();
  },
  methods: {
    reloadPage() {
      setTimeout(() => {
        this.$router.push("/");
      }, 2000); // 2000 milliseconds = 2 seconds
    },
    formatDate(timestamp) {
      const date = new Date(timestamp * 1000);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
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
        const baseUrl = "https://task-management-5wpxgn35iq-uc.a.run.app";
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

    // editTask(taskId) {
    //     // Logic to edit a task
    //     // Emit an event or call a method to handle the editing
    // },
    assignTask(taskId) {
      // Logic to assign a task
      // Emit an event or call a method to handle the assignment
      console.log(taskId);
      this.showModal = !this.showModal;
      this.taskId = taskId;
    },
    deleteTask(taskId) {
      // Logic to delete a task
      const deleteTaskData = {
        task_id: taskId,
      };
      try {
        const baseUrl = "https://task-management-5wpxgn35iq-uc.a.run.app";
        const result = this.$axios.post(
          `${baseUrl}/TaskCancelled`,
          deleteTaskData
        );
        console.log(result);
        this.reloadPage();
      } catch (error) {
        console.log(error);
      }
    },
    async loadAssignedUser() {
      const user_ids = this.task.assigned_to;
      if (user_ids && user_ids.length > 0) {
        try {
          const user = user_ids[0];
          if (user) {
            const userDocRef = this.$fire.firestore
              .collection("users")
              .doc(user);
            const userDocSnapshot = await userDocRef.get();
            if (userDocSnapshot.exists) {
              const userData = userDocSnapshot.data();
              const displayName = userData.displayName;
              if (displayName) {
                this.assignedUser = displayName;
              } else {
                const uid = userData.uid;
                const lastSixCharacters = uid.slice(-6);
                this.assignedUser = `User ${lastSixCharacters}`;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          this.assignedUser = "Unassigned";
        }
      } else {
        this.assignedUser = "Unassigned";
      }
    },
  },
  components: { UserList },
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
  justify-content: flex-start;
}
</style>
