import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase_config.js';

const usersRef = db.collection('users');
const invitesRef = db.collection('invites');

async function getUserProfile(uid) {
  try {
    const userDoc = await usersRef.doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return { uid, ...userDoc.data() };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw new Error('Failed to get user profile.');
  }
}

async function profileUpdate(uid, profileData) {
  try {
    await usersRef.doc(uid).update(profileData);
    // Also update Firebase Auth user
    await getAuth().updateUser(uid, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
    });
    console.log('Profile updated successfully for user:', uid);
    return true;
  } catch (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
}

async function deletedUserAccount(uid) {
  try {
    await usersRef.doc(uid).delete();
    await getAuth().deleteUser(uid);
    console.log('Deleted account for user:', uid);
    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    return false;
  }
}

async function generateInviteCode(childId) {
  try {
    // Generate a unique ID
    const newInviteRef = invitesRef.doc();
    const inviteCode = newInviteRef.id;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await newInviteRef.set({
      childId,
      expiresAt,
    });

    return { inviteCode, expiresAt };
  } catch (error) {
    console.error('Failed to generate invite code:', error);
    throw new Error('Failed to generate invite code.');
  }
}

async function linkChildAccount(parentUID, inviteCode) {
  try {
    const inviteDocRef = invitesRef.doc(inviteCode);
    const inviteDoc = await inviteDocRef.get();

    if (!inviteDoc.exists || inviteDoc.data().expiresAt.toDate() < new Date()) {
      throw new Error('Invalid or expired invite code.');
    }

    const childId = inviteDoc.data().childId;

    // Add child to parent's list and parent to child's list
    const parentRef = usersRef.doc(parentUID);
    const childRef = usersRef.doc(childId);

    await parentRef.update({ children: FieldValue.arrayUnion(childId) });
    await childRef.update({ parent: parentUID });

    // Delete the invite code after use
    await inviteDocRef.delete();

    return { message: 'Child linked successfully.' };
  } catch (error) {
    console.error('Failed to link child account:', error);
    throw error;
  }
}

async function getLinkedChildren(parentUID) {
  try {
    const parentDoc = await usersRef.doc(parentUID).get();
    if (!parentDoc.exists) {
      throw new Error('Parent not found.');
    }
    const childIds = parentDoc.data().children || [];
    if (childIds.length === 0) {
      return [];
    }
    const childrenSnapshot = await usersRef.where('uid', 'in', childIds).get();
    return childrenSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get linked children:', error);
    throw error;
  }
}

async function getUserMetrics() {
  try {
    // Get all users from Firestore
    const usersSnapshot = await usersRef.get();
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    const totalUsers = users.length;
    let parentUsers = 0;
    let childUsers = 0;
    
    // Count user types
    users.forEach(user => {
      if (user.role === 'parent') {
        parentUsers++;
      } else {
        childUsers++;
      }
    });
    
    // Calculate active users (users with recent activity)
    // For now, using a simple calculation - 70% of users are considered active
    const activeUsers = Math.floor(totalUsers * 0.7);
    
    // Calculate registration trends (mock data for now)
    const registrationTrends = {
      daily: Math.floor(totalUsers * 0.05), // 5% registered today
      weekly: Math.floor(totalUsers * 0.15), // 15% registered this week
      monthly: totalUsers // All users registered this month (cumulative)
    };
    
    return {
      total_users: totalUsers,
      active_users: activeUsers,
      parent_users: parentUsers,
      child_users: childUsers,
      registration_trends: registrationTrends,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get user metrics:', error);
    throw new Error('Failed to get user metrics');
  }
}

export {
  getUserProfile,
  profileUpdate,
  deletedUserAccount,
  generateInviteCode,
  linkChildAccount,
  getLinkedChildren,
  getUserMetrics,
};
