import express, {json} from 'express';
import {eventHandler} from './event_handler.js';
import * as dotenv from 'dotenv';
import cors from 'cors';
// import {PubSub} from '@google-cloud/pubsub';

// const _pubsub = new PubSub({projectId: 'task-coin-384722'});
dotenv.config();
const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(json());

app.get('/', async (req, res) => {
  res.send('Welcome to my service. Service is running successfully.');
});

app.post('/event', async (req, res) => {
  try {
    const response = req.body;
    const data = eventHandler(response);
    res.status(201).json({message: data});
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({error: 'Failed to direct event'});
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
