import * as dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import {
  profileUpdate,
  deletedUserAccount,
  generateInviteCode,
  linkChildAccount,
  getLinkedChildren,
  getUserProfile,
} from './fb_functions.js';
import {
  createUserWithPassword,
  loginWithEmailAndPassword,
} from './auth/email_password_auth.js';
import { authMiddleware } from './auth/middleware.js';

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

app.options('*', cors());
app.use(json());

// Get current user's profile
app.get('/users/me', async (req, res) => {
  try {
    const uid = req.user.uid;
    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/profileUpdate', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const result = await profileUpdate(uid, req.body);
    res.status(200).json({ message: 'Successful profile update:', result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
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

// Get linked children (for parents)
app.get('/users/me/children', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid; // The parent's UID
    const children = await getLinkedChildren(uid);
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register with email and password
app.post('/registerWithPassword', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    const result = await createUserWithPassword(email, password, displayName, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login with email and password
app.post('/loginWithPassword', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginWithEmailAndPassword(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials.' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the User Management Service. Service is running successfully.');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `User Management service started successfully and is listening for HTTP requests on ${PORT}`
  );
});

export default app;
