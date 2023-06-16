<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="6" md="8" lg="12">
      <div><CategoryCarousel /></div>
      <v-row class="justify-left">
        <div class="main-div">
          <h3>Recommendations</h3>
        </div>

        <div style="overflow-x: auto; width: 1200px" class="main-div">
          <v-row class="d-flex flex-nowrap" style="width: 1200px">
            <v-col
              cols="12"
              sm="6"
              md="4"
              lg="3"
              v-for="index in 12"
              :key="index"
              class="mb-4"
            >
              <TaskCardShort />
            </v-col>
          </v-row>
        </div>
      </v-row>

      <v-row class="justify-left">
        <h3>Open Tasks</h3>
        <div style="overflow-x: auto; width: 1200px" class="main-div">
          <v-row class="d-flex flex-nowrap" style="width: 1200px">
            <v-col
              cols="12"
              sm="6"
              md="4"
              lg="3"
              v-for="index in 6"
              :key="index"
              class="mb-4"
            >
              <TaskCardShort />
            </v-col>
          </v-row>
        </div>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import CategoryCarousel from "~/components/CategoryCarousel.vue";
import TaskCardShort from "~/components/TaskCardShort.vue";

export default {
  name: "IndexPage",
  components: { CategoryCarousel, TaskCardShort },
  methods: {
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
  },
};
</script>
<style>
.main-div {
  padding-top: 20px;
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
</style>
