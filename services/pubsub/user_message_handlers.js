import axios from 'axios';

// Function to handle UserSignIn messages
function handleUserSignInMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERSIGNIN || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('UserSignIn message received:', message.data.toString());
}

// Function to handle Forgot Password messages
function handleUserForgotPasswordMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERFORGOTPASSWORD || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERFORGOTPASSWORD message received:', message.data.toString());
}

// Function to handle Wallet Connected messages
function handleUserWalletConnectedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERWALLETCONNECTED || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERWALLETCONNECTED message received:', message.data.toString());
}

// Function to handle Auth messages
function handleUserAuthenticationMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERAUTHENTICATION || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERAUTHENTICATION message received:', message.data.toString());
}

// Function to handle Profile Updated messages
function handleUserProfileUpdateMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERPROFILEUPDATE || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERPROFILEUPDATE message received:', message.data.toString());
}

// Function to handle Account Deletion messages
function handleUserAccountDeletionMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERACCOUNTDELETION || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERACCOUNTDELETION message received:', message.data.toString());
}

// Function to handle User Interation messages
function handleUserInteractionMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERINTERACTION || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERINTERACTION message received:', message.data.toString());
}

// Function to handle User Verified messages
function handleUserVerifiedMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERVERIFIED || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('USERVERIFIED message received:', message.data.toString());
}

// Function to handle userRegistration messages
function handleUserRegisteredMessage(message) {
  const documentData = JSON.parse(message.data.toString());
  // Get the task management service URL from environment variable
  const userManagementUrl = process.env.USERREGISTERED || '';

  // Make an API call to the task management service
  axios
    .post(userManagementUrl, documentData)
    .then((response) => {
      console.log('API response:', response.data);
      // Handle the API response or perform any additional actions
    })
    .catch((error) => {
      console.error('API call error:', error);
      // Handle the API call error
    });
  console.log('userRegistration message received:', message.data.toString());
}

export {
  handleUserAccountDeletionMessage,
  handleUserAuthenticationMessage,
  handleUserForgotPasswordMessage,
  handleUserInteractionMessage,
  handleUserProfileUpdateMessage,
  handleUserRegisteredMessage,
  handleUserSignInMessage,
  handleUserVerifiedMessage,
  handleUserWalletConnectedMessage,
};
