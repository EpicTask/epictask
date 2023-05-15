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
