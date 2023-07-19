import axios from 'axios';

// Function to handle TaskCreated messages
function handleTaskCreatedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKCREATED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
}

// Function to handle TaskAssigned messages
function handleTaskAssignedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKASSIGNED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskAssigned message received:', message.data.toString());
}

// Function to handle TaskUpdated messages
function handleTaskUpdatedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  console.log(documentData);
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKUPDATED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskUpdated message received:', message.data.toString());
}

// Function to handle TaskCompleted messages
function handleTaskCompletedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKCOMPLETED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskCompleted message received:', message.data.toString());
}

// Function to handle TaskCancelled messages
function handleTaskCancelledMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKCANCELLED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskCancelled message received:', message.data.toString());
}

// Function to handle TaskCommentAdded messages
function handleTaskCommentAddedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKCOMMENTADDED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskCommentAdded message received:', message.data.toString());
}

// Function to handle TaskExpired messages
function handleTaskExpiredMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKEXPIRED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskExpired message received:', message.data.toString());
}

// Function to handle TaskRewarded messages
function handleTaskRewardedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKREWARDED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskRewarded message received:', message.data.toString());
}

// Function to handle TaskRatingUpdate messages
function handleTaskRatingUpdateMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKRATINGUPDATE || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskRatingUpdate message received:', message.data.toString());
}

// Function to handle TaskVerified messages
function handleTaskVerifiedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.TASKVERIFIED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('TaskVerified message received:', message.data.toString());
}

// Function to handle RecommendationGenerated messages
function handleRecommendationGeneratedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const taskManagementUrl = process.env.RECOMMENDATIONGENERATED || '';

  // Make an API call to the task management service
  axios
    .post(taskManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log(
    'RecommendationGenerated message received:',
    message.data.toString()
  );
}

export {
  handleRecommendationGeneratedMessage,
  handleTaskAssignedMessage,
  handleTaskCancelledMessage,
  handleTaskCommentAddedMessage,
  handleTaskCompletedMessage,
  handleTaskCreatedMessage,
  handleTaskExpiredMessage,
  handleTaskRatingUpdateMessage,
  handleTaskRewardedMessage,
  handleTaskUpdatedMessage,
  handleTaskVerifiedMessage,
};
