const express = require('express');
const saveUserEvent = require('./fb_functions');
const {UserEvent, getSchema} = require('./schema');
const { handleIncomingEvent } = require('./event_handler');
const app = express();
const router = express.Router();
// Serve the files in /assets at the URI /assets.
app.use(express.json());

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

// Get all UserEvents of a specific type
router.get('/events/:event_type', async (req, res) => {
  try {
    const eventType = req.params.event_type;

    // Get the appropriate event model based on the event type
    const EventModel = eventModels[eventType];
    if (!EventModel) {
      res.status(400).json({error: 'Invalid event type'});
      return;
    }

    // Find all events of the specified type
    const userEvents = await EventModel.find();
    res.status(200).json(userEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch UserEvents'});
  }
});

// Get a specific UserEvent of a specific type by ID
app.get('/events/:event_type/:id', async (req, res) => {
  try {
    const eventType = req.params.event_type;

    // Get the appropriate event model based on the event type
    const EventModel = eventModels[eventType];
    if (!EventModel) {
      res.status(400).json({error: 'Invalid event type'});
      return;
    }

    const userEvent = await EventModel.findById(req.params.id);
    if (!userEvent) {
      res.status(404).json({error: 'UserEvent not found'});
      return;
    }
    res.status(200).json(userEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch UserEvent'});
  }
});

// Update a specific UserEvent of a specific type by ID
router.put('/events/:event_type/:id', async (req, res) => {
  try {
    const eventType = req.params.event_type;
    const eventData = req.body;

    // Get the appropriate event model based on the event type
    const EventModel = eventModels[eventType];
    if (!EventModel) {
      res.status(400).json({error: 'Invalid event type'});
      return;
    }

    const userEvent = await EventModel.findByIdAndUpdate(
      req.params.id,
      eventData,
      {new: true}
    );
    if (!userEvent) {
      res.status(404).json({error: 'UserEvent not found'});
      return;
    }
    res.status(200).json(userEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to update UserEvent'});
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
