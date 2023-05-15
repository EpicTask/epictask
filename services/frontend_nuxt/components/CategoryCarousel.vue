<template>
    <v-row>
      <v-col cols="14" sm="6" md="8" lg="12">
        <v-btn
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
          variant="text"
          class="mr-4"
        >
          {{ category.name }}
        </v-btn>
      </v-col>
    </v-row>
  </template>
  
  

<script>
export default {
  data() {
    return {
      categories: [
        { id: 1, name: "Category 1" },
        { id: 2, name: "Category 2" },
        { id: 3, name: "Category 3" },
        { id: 4, name: "Category 4" },
        { id: 5, name: "Category 5" },
        { id: 6, name: "Category 6" },
        { id: 7, name: "Category 7" },
        { id: 8, name: "Category 8" },
        // Add more categories as needed
      ],
    };
  },
};
</script>
<style>
</style>
