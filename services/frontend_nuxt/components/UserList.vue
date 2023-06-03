<template>
  <div>
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2>Users</h2>
        <ul>
          <li
            v-for="user in users"
            :key="user.id"
            @click="assignTask(user.id, taskId)"
          >
            <span>{{ user.displayName }}</span>
          </li>
        </ul>
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
    taskId: {
      type: String, // Update the type to match your task_id data type
      required: true,
    },
  },
  data() {
    return {
      isModalOpen: true,
      users: [],
    };
  },
  mounted() {
    this.openModal();
  },
  methods: {
    async openModal() {
      const usersCollection = this.$fire.firestore.collection("users");
      const snapshot = await usersCollection.get();
      this.users = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      console.log(this.users);
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.$emit("close-modal");
    },
    async assignTask(assigned_to_id, taskId) {
      // Logic to assign the task to the user with userId
      // Send an API call with the task_id and userId
      console.log(taskId);
      const assignTask = {
        task_id: taskId,
        assigned_to_id: assigned_to_id, // Use an array to match the API payload structure
      };
        try {
          const baseUrl = "https://task-management-5wpxgn35iq-uc.a.run.app";
          const result = await this.$axios.post(
            `${baseUrl}/TaskAssigned`,
            assignTask
          );
          console.log(result);
          this.closeModal();
        } catch (error) {
          console.log(error);
          this.closeModal();
        }
    },
  },
};
</script>

<style>
/* Styles for the modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto; /* Add scrollable behavior if content exceeds height */
}

.modal-content {
  background-color: #121212;
  padding: 1rem;
  border-radius: 4px;
  width: 40%; /* Set width to 40% of the screen */

  max-width: 80vw; /* Limit the width to 80% of the viewport width */
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
}

h2 {
  align-self: flex-start; /* Align the h2 at the top */
}

ul {
  list-style-type: none;
  padding: 0;
  overflow-y: auto; /* Add scroll functionality if content exceeds the height */
}

li {
  margin-bottom: 0.5rem;
  transition: background-color 0.3s ease; /* Add transition for smooth effect */
}

li:hover {
  background-color: rgba(
    255,
    255,
    255,
    0.1
  ); /* Change background color on hover */
}

button {
  align-self: flex-end; /* Align the button at the bottom right */
}
</style>
