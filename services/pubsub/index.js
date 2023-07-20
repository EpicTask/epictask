import express, {json} from 'express';
import bodyParser from 'body-parser';
// import {eventHandler} from './event_handler.js';
import * as dotenv from 'dotenv';
import cors from 'cors';

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
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.send('Welcome to my service. Service is running successfully.');
});

app.post('/event', async (req, res) => {
  try {
    const response = req.body;
    console.log(response);
    // const data = eventHandler(response);
    res.status(201).json({message: response});
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
