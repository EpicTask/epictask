import * as dotenv from 'dotenv';
import express, {json} from 'express';
import cors from 'cors';
import {createChildUID, linkChild, saveUserEvent} from './fb_functions.js';
import {handleIncomingEvent} from './user_event_handler.js';
import {UserEvent, getSchema, linkChildSchema} from './schema.js';
import {
  createUserWithPassword,
  signUserOut,
  loginWithEmailAndPassword,
} from './auth/email_password_auth.js';

dotenv.config();
const app = express();
const origins = [
  'http://localhost',
  'http://localhost:8080',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(json());

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
    try {
      handleIncomingEvent(eventType, userEvent);
    } catch (error) {
      console.error(error);
    }
    res.status(201).json('Successful created UserEvent');
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to create UserEvent'});
  }
});

// Sign in with email and password
app.post('/signout', async (req, res) => {
  try {
    const result = await signUserOut();
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
app.post('/createChildUID', async (req, res) => {
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
  res.send('Welcome to my service');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
