import * as dotenv from 'dotenv';
import express, {json} from 'express';
import cors from 'cors';
import {
  authenticateUser,
  connectWallet,
  createChildUID,
  deletedUserAccount,
  forgotPassword,
  linkChild,
  profileUpdate,
  saveUserEvent,
  saveUserInteraction,
  verifyUser,
} from './fb_functions.js';
import {UserEvent, getSchema, linkChildSchema} from './schema.js';
import {
  createUserWithPassword,
  signUserOut,
  loginWithEmailAndPassword,
  getUser,
} from './auth/email_password_auth.js';

dotenv.config();
const app = express();
const origins = ['https://user-management-api-us-8l3obb9a.uc.gateway.dev', 'https://task-coin-384722.web.app/'];

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(json());

// Get user
app.get('/getCurrentUser', async (req, res) => {
  try {
    const uid = getUser();
    return {message: uid};
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'No user found'});
  }
});
// Create a new UserEvent
app.post('/events/', async (req, res) => {
  try {
    const eventData = req.body;
    const eventType = eventData.event_type;
    console.log(req.body);

    // Get the appropriate event model based on the event type
    const EventModel = getSchema(eventType);
    if (!EventModel) {
      res.status(400).json({error: 'Invalid event type'});
      return;
    }

    // Create a new event of the specified type
    const userEvent = new UserEvent({
      event_id: eventData.event_id,
      event_type: eventType,
      user_id: eventData.user_id,
      timestamp: eventData.timestamp,
      additional_data: eventData.additional_data,
    });

    // Save the user event to Firestore
    saveUserEvent(eventType, userEvent);
    res.status(201).json('Successful created UserEvent');
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to create UserEvent'});
  }
});

// Registered user.
app.post('/userRegister', async (req, res) => {
  res.status(201).json({message: 'Successful user register'});
});

// User signed in successfully
app.post('/signIn', async (req, res) => {
  res.status(201).json({message: 'Successful user sign in'});
});

// User wallet connected
app.post('/walletConnected', async (req, res) => {
  try {
    const result = await connectWallet();
    res.status(201).json({message: 'Successful wallet connection:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed to sign user out.'});
  }
});

// User forgot password
app.post('/forgotPassword', async (req, res) => {
  try {
    const result = await forgotPassword();
    res.status(201).json({message: 'Successful:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed.'});
  }
});

// User Authenticated
app.post('/authenticate', async (req, res) => {
  try {
    const result = await authenticateUser();
    res.status(201).json({message: 'Successful', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed.'});
  }
});

// User updated profile
app.post('/profileUpdate', async (req, res) => {
  try {
    const response = req.body;
    const result = await profileUpdate(response);
    res.status(201).json({message: 'Successful profile update:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed to update profile.'});
  }
});

// User deleted account
app.post('/deleteAccount', async (req, res) => {
  try {
    const response = req.body;
    const result = await deletedUserAccount(response);
    res
      .status(201)
      .json({message: 'Successful user account deletion:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed to delete account.'});
  }
});

// User interaction
app.post('/userInteraction', async (req, res) => {
  try {
    const response = req.body;
    const result = await saveUserInteraction(response);
    res
      .status(201)
      .json({message: 'Successful user interaction saved:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed to save user interaction:'});
  }
});

//User verified
app.post('/userVerified', async (req, res) => {
  try {
    const response = req.body;
    const result = await verifyUser(response);
    res.status(201).json({message: 'Successful user verification:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed to verify user.'});
  }
});

// Sign in with email and password
app.post('/signout', async (req, res) => {
  try {
    const response = req.body;
    const result = await signUserOut(response);
    res.status(201).json({message: 'Successful user signout:', result});
  } catch (error) {
    console.log;
    'Error: ', error;
    res.status(500).json({error: 'Failed to sign user out.'});
  }
});

// Sign user out
app.post('/registerWithPassword', async (req, res) => {
  try {
    const response = req.body;
    const email = response.email;
    const password = response.password;
    const uid = await createUserWithPassword(email, password);
    res.status(201).json({message: uid});
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({error: 'Failed to create User'});
  }
});

// Login in with password
app.post('/loginWithPassword', async (req, res) => {
  try {
    const response = req.body;
    const email = response.email;
    const password = response.password;
    const uid = await loginWithEmailAndPassword(email, password);
    res.status(201).json({message: uid});
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({error: 'Failed to login'});
  }
});

// Create child UID
app.post('/createChildAccount', async (req, res) => {
  try {
    const response = req.body;
    const parentUID = response.parentUID;

    const uid = await createChildUID(parentUID);
    res.status(201).json({message: uid});
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({error: 'Failed to create child UID'});
  }
});

// Link child to parent
app.post('/linkChild', async (req, res) => {
  try {
    const response = req.body;
    const data = linkChildSchema(response);
    const status = await linkChild(data);
    res.status(201).json({message: status});
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({error: 'Failed to link child to parent'});
  }
});

// Delete a specific User

app.get('/', (req, res) => {
  res.send('Welcome to my service. Service is running successfully.');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
