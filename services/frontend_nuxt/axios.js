export default function ({ $axios, error }) {
    $axios.defaults.baseURL = process.env.taskUrl; // Replace with your desired base URL
    $axios.defaults.headers.common['Content-Type'] = 'application/json';
    $axios.defaults.headers.common['Access-Control-Allow-Origin'] = process.env.taskUrl;
    $axios.defaults.headers.common['Access-Control-Allow-Origin'] = "http://localhost:3000/";
    // Add any other default headers as needed
  
    // Set up request interceptors
    $axios.onRequest((config) => {
      // Add logic to modify the request before it is sent
      return config;
    });
  
    // Set up response interceptors
    $axios.onResponse((response) => {
      // Add logic to handle successful responses
      return response;
    });
  
    // Set up error interceptors
    $axios.onError((axiosError) => {
      // Handle errors
      const { response } = axiosError;
  
      if (response) {
        // Request was made and server responded with a status code
        // Handle specific status codes or error messages here
        const { status, data } = response;
        error(`Request failed with status ${status}: ${data.message}`);
      } else {
        // Request was made but no response was received
        // Handle network errors or timeouts here
        error('Request failed: Network Error');
      }
  
      return Promise.reject(axiosError);
    });
  }
  