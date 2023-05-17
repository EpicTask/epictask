// Assuming you have the eventModels and eventHandler functions available

// Event handler function
async function handleIncomingEvent(eventType, eventData) {
    try {
      // Get the appropriate event model based on the event type
      const EventModel = eventModels[eventType];
      if (!EventModel) {
        console.log('Invalid event type');
        return;
      }
  
      // Create a new event of the specified type
      const event = new EventModel(eventData);
  
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
  
  module.exports = handleIncomingEvent;
  