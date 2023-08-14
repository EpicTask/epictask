import express, {json} from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import cors from 'cors';
import {PubSub} from '@google-cloud/pubsub';

const pubsub = new PubSub({projectId: 'task-coin-384722'});
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

// app.post('/event', async (req, res) => {
//   try {
//     const response = req.body;
//     // console.log(response);
//     const data = eventHandler(response);
//     res.status(201).json({message: data});
//   } catch (error) {
//     console.log('Error: ', error);
//     res.status(500).json({error: 'Failed to direct event'});
//   }
// });

app.post('/escrow_scheduler', async (req, res) => {
  const { task_id, finishAfter, cancelAfter } = req.body;

  // Schedule EscrowFinish and EscrowCancel actions using Pub/Sub
  try {
    // Schedule EscrowFinish action
    const finishMessagePayload = JSON.stringify({
      action: 'finish',
      task_id,
    });
    const finishScheduledTime = new Date(finishAfter).toISOString();
    await publishMessage('escrow-actions', finishMessagePayload, finishScheduledTime);

    // Schedule EscrowCancel action
    const cancelMessagePayload = JSON.stringify({
      action: 'cancel',
      task_id,
    });
    const cancelScheduledTime = new Date(cancelAfter).toISOString();
    await publishMessage('escrow-actions', cancelMessagePayload, cancelScheduledTime);

    res.status(200).json({ message: 'Actions scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling actions:', error.message);
    res.status(500).json({ error: 'Failed to schedule actions' });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
