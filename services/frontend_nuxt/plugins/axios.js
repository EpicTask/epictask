export default function ({ $axios, app }) {
    // Set the base URL for your API requests
    $axios.setBaseURL('http://localhost:3000'); // Replace with your API URL
  
    // Optional: Customize Axios instance here, if needed
  
    // Inject the modified Axios instance into the context as $axios
    app.$axios = $axios;
  }
  