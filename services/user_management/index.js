import * as dotenv from 'dotenv';
import express, {json} from 'express';
import {saveUserEvent} from './fb_functions.js';
import {handleIncomingEvent} from './user_event_handler.js';
import {UserEvent, getSchema} from './schema.js';
import {
  createUserWithPassword,
  signUserOut,
  loginWithEmailAndPassword,
} from './auth/email_password_auth.js';

dotenv.config();
const app = express();
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
    res.status(201).json({message: 'Successfully created User:', uid});
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
    res.status(201).json({message: 'Successful Login:' + uid});
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({error: 'Failed to login'});
  }
});
// Get all UserEvents of a specific type
// router.get('/events/:event_type', async (req, res) => {
//   try {
//     const eventType = req.params.event_type;

//     // Get the appropriate event model based on the event type
//     const EventModel = eventModels[eventType];
//     if (!EventModel) {
//       res.status(400).json({error: 'Invalid event type'});
//       return;
//     }

//     // Find all events of the specified type
//     const userEvents = await EventModel.find();
//     res.status(200).json(userEvents);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({error: 'Failed to fetch UserEvents'});
//   }
// });

// // Get a specific UserEvent of a specific type by ID
// app.get('/events/:event_type/:id', async (req, res) => {
//   try {
//     const eventType = req.params.event_type;

//     // Get the appropriate event model based on the event type
//     const EventModel = eventModels[eventType];
//     if (!EventModel) {
//       res.status(400).json({error: 'Invalid event type'});
//       return;
//     }

//     const userEvent = await EventModel.findById(req.params.id);
//     if (!userEvent) {
//       res.status(404).json({error: 'UserEvent not found'});
//       return;
//     }
//     res.status(200).json(userEvent);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({error: 'Failed to fetch UserEvent'});
//   }
// });

// // Update a specific UserEvent of a specific type by ID
// router.put('/events/:event_type/:id', async (req, res) => {
//   try {
//     const eventType = req.params.event_type;
//     const eventData = req.body;

//     // Get the appropriate event model based on the event type
//     const EventModel = eventModels[eventType];
//     if (!EventModel) {
//       res.status(400).json({error: 'Invalid event type'});
//       return;
//     }

//     const userEvent = await EventModel.findByIdAndUpdate(
//       req.params.id,
//       eventData,
//       {new: true}
//     );
//     if (!userEvent) {
//       res.status(404).json({error: 'UserEvent not found'});
//       return;
//     }
//     res.status(200).json(userEvent);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({error: 'Failed to update UserEvent'});
//   }
// });

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
