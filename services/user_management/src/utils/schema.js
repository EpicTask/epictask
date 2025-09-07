import {Schema, model} from 'mongoose';

// Define the event schemas
const eventSchemas = {
  userRegistration: new Schema({
    email: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    status: {type: String, required: true},
    social: {type: Boolean, required: true},
    social_type: {type: String, required: false},
    // Additional fields specific to user registration
  }),
  userSignIn: new Schema({
    status: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    social: {type: Boolean, required: true},
    social_type: {type: String, required: false},
  }),
  userWalletConnected: new Schema({
    status: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    user_id: {type: String, required: true},
    wallet_type: {type: String, required: true},
  }),
  userForgotPassword: new Schema({
    email: {type: String, required: true},
  }),
  userAuthentication: new Schema({
    email: {type: String, required: true},
    verified: {type: Boolean, required: true},
    timestamp: {type: Date, default: Date.now},
  }),
  userProfileUpdate: new Schema({
    user_id: {type: String, required: true},
    fields: {type: Map, of: String},
  }),
  userAccountDeletion: new Schema({
    user_id: {type: String, required: true},
    reason: {type: String, required: false},
  }),
  userInteraction: new Schema({
    user_id: {type: String, required: true},
    interaction: {type: String, required: true},
  }),
};

// Define the master schema
const userEventSchema = new Schema({
  event_id: {type: String, required: true},
  event_type: {type: String, required: true},
  user_id: {type: String, required: true},
  timestamp: {type: Date, default: Date.now},
  additional_data: {type: Schema.Types.Mixed},
});

// Define the models for the event schemas
const getSchema = (event) => {
  switch (event) {
    case 'userRegistration':
      return eventSchemas.userRegistration;
    case 'userSignIn':
      return eventSchemas.userSignIn;
    case 'userWalletConnected':
      return eventSchemas.userWalletConnected;
    case 'userForgotPassword':
      return eventSchemas.userForgotPassword;
    case 'userAuthentication':
      return eventSchemas.userAuthentication;
    case 'userProfileUpdate':
      return eventSchemas.userProfileUpdate;
    case 'userAccountDeletion':
      return eventSchemas.userAccountDeletion;
    case 'userInteraction':
      return eventSchemas.userInteraction;
    default:
      throw new Error(`Invalid event type: ${event}`);
  }
};

// Link Child Schema
const linkChildSchema = new Schema({
  parentUID: {type: String, required: true},
  childUID: {type: String, required: true},
  child_name: {type: String, required: true},
  child_age: {type: Number, required: false},
});

// Define the model for the master schema
const UserEvent = model('UserEvent', userEventSchema);

// Export the models
export {UserEvent, eventSchemas, getSchema, linkChildSchema};
