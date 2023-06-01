<template>
  <div>
    <div>
      <v-select
        v-model="selectedOption"
        :items="date_options"
        required
        @change="handleOptionChange"
      ></v-select>
    </div>

    <div v-if="selectedOption === 'Custom Date'">
      <label>Select Due Date:</label>
      <input
        type="date"
        v-model="customDate"
        :disabled="false"
        @change="handleCustomDateChange"
        class="white-text"
      />
    </div>

    <div v-if="selectedOption !== 'Custom Date'">
      <p>Due Date: {{ endDate }}</p>
    </div>
  </div>
</template>

<style>
.white-text {
  color: white;
}
</style>

<script>
export default {
  data() {
    return {
      date_options: ["One Week", "One Month", "Custom Date"],
      selectedOption: "One Week",
      customDate: "",
      endDate: "",
      endTimestamp: 0,
    };
  },
  mounted() {
    this.calculateOneWeek();
  },
  methods: {
    handleOptionChange() {
      if (this.selectedOption === "One Week") {
        this.calculateOneWeek();
      } else if (this.selectedOption === "One Month") {
        this.calculateOneMonth();
      }
    },
    handleCustomDateChange() {
      const date = new Date(this.customDate);
      this.endDate = this.formatDate(date);
      this.endTimestamp = Math.floor(date.getTime() / 1000);
      this.$emit("change", this.endTimestamp); // Emit the selected date in timestamp format
    },
    calculateOneWeek() {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7);

      this.endDate = this.formatDate(endDate);
      this.endTimestamp = Math.floor(endDate.getTime() / 1000);
      this.$emit("change", this.endTimestamp); // Emit the selected date in timestamp format
    },
    calculateOneMonth() {
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(today.getMonth() + 1);

      this.endDate = this.formatDate(endDate);
      this.endTimestamp = Math.floor(endDate.getTime() / 1000);
      this.$emit("change", this.endTimestamp); // Emit the selected date in timestamp format
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
  },
};
</script>
