import * as dotenv from 'dotenv';
import express, { json } from 'express';
import exphbs from 'express-handlebars';
import cors from 'cors';
import path from 'path';
import {
  profileUpdate,
  deletedUserAccount,
  generateInviteCode,
  linkChildAccount,
  getUserMetrics,
} from './api/fb_functions.js';
import { authMiddleware } from './middleware/auth/middleware.js';

dotenv.config();
const app = express();

// Get CORS origins from environment variable, fallback to defaults
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'https://user-management-api-us-8l3obb9a.uc.gateway.dev',
      'https://task-coin-384722.web.app',
      'http://localhost:8080', // For Expo Go
    ];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.engine('.hbs', exphbs.engine({
    extname: '.hbs', 
    defaultLayout: false, 
}));

// Set the view engine to Handlebars
app.set('view engine', '.hbs');
const __dirname = path.resolve();

app.set('views', path.join(__dirname, 'src/views')); 

app.options('/{*any}', cors());
app.use(json());

app.get('/', (req, res) => {
  res.render('index.html.hbs', { title: 'User Management Service', message: 'Welcome to the User Management Service!' });
});

// Update user profile
app.put('/profileUpdate', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const result = await profileUpdate(uid, req.body);
    res.status(200).json({ message: 'Successful profile update:', result });
  } catch (error) {
    res.status(500).json({error: 'Failed to update profile.:' });
  }
});

// Delete user account
app.delete('/deleteAccount', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const result = await deletedUserAccount(uid);
    res.status(200).json({ message: 'Successful user account deletion:', result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// Generate invite code (for kids)
app.post('/users/generate-invite-code', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid; // The child's UID
    const result = await generateInviteCode(uid);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link child account (for parents)
app.post('/users/link-child', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid; // The parent's UID
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }
    const result = await linkChildAccount(uid, inviteCode);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin/Metrics Endpoints
app.get('/admin/metrics/users/FDxFKcGFi2ecjojXKQTKGtJ38FF2', async (req, res) => {
  try {
    // Get user metrics from Firebase/Firestore
    const userMetrics = await getUserMetrics();
    res.status(200).json(userMetrics);
  } catch (error) {
    console.error('Error getting user metrics:', error);
    res.status(500).json({ error: 'Failed to get user metrics' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `User Management service started successfully and is listening for HTTP requests on ${PORT}`
  );
});

export default app;
