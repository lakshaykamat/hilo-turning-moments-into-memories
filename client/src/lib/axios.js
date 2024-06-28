import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1", // Replace with your API base URL
  timeout: 5000, // Timeout after 5 seconds
  headers: {
    "Content-Type": "application/json",
    // Add any other headers you need
  },
});

// Optional: Add interceptors for request and response
axiosInstance.interceptors.request.use(
  (config) => {
    // Modify request config here (e.g., add authorization token)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Modify response data here (e.g., parse JSON response)
    return response;
  },
  (error) => {
    // Handle response errors (e.g., unauthorized access)
    return Promise.reject(error);
  }
);

export default axiosInstance;
