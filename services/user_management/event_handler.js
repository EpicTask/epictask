const {getSchema} = require('./schema');

// Event handler function
async function handleIncomingEvent(eventType, eventData) {
  try {
    // Get the appropriate event model based on the event type
    const EventModel = getSchema(eventType);
    if (!EventModel) {
      console.log('Invalid event type');
      return;
    }

    // Create a new event of the specified type
    const event = eventData;

    // Call the corresponding function to handle the event
    switch (eventType) {
      case 'userRegistration':
        await eventHandler.handleUserRegistration(event);
        break;
      case 'userSignIn':
        await eventHandler.handleUserSignIn(event);
        break;
      case 'userWalletConnected':
        await eventHandler.handleUserWalletConnected(event);
        break;
      case 'userForgotPassword':
        await eventHandler.handleUserForgotPassword(event);
        break;
      case 'userAuthentication':
        await eventHandler.handleUserAuthentication(event);
        break;
      case 'userProfileUpdate':
        await eventHandler.handleUserProfileUpdate(event);
        break;
      case 'userAccountDeletion':
        await eventHandler.handleUserAccountDeletion(event);
        break;
      case 'userInteraction':
        await eventHandler.handleUserInteraction(event);
        break;
      default:
        console.log('Unsupported event type');
    }
  } catch (error) {
    console.error('Failed to handle event:', error);
  }
}

const eventHandler = {
    async handleUserRegistration(event) {
      console.log('Handling user registration event:', event);
      // Implement your logic to handle user registration event
    },
  
    async handleUserSignIn(event) {
      console.log('Handling user sign-in event:', event);
      // Implement your logic to handle user sign-in event
    },
  
    async handleUserWalletConnected(event) {
      console.log('Handling user wallet connected event:', event);
      // Implement your logic to handle user wallet connected event
    },
  
    async handleUserForgotPassword(event) {
      console.log('Handling user forgot password event:', event);
      // Implement your logic to handle user forgot password event
    },
  
    async handleUserAuthentication(event) {
      console.log('Handling user authentication event:', event);
      // Implement your logic to handle user authentication event
    },
  
    async handleUserProfileUpdate(event) {
      console.log('Handling user profile update event:', event);
      // Implement your logic to handle user profile update event
    },
  
    async handleUserAccountDeletion(event) {
      console.log('Handling user account deletion event:', event);
      // Implement your logic to handle user account deletion event
    },
  
    async handleUserInteraction(event) {
      console.log('Handling user interaction event:', event);
      // Implement your logic to handle user interaction event
    },
  };
  
  module.exports = eventHandler;
  

module.exports = {handleIncomingEvent};
