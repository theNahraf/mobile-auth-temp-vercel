'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { createLead } from '@/lib/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() });
            await updateLastLogin(firebaseUser.uid);
            logLoginLead(firebaseUser.uid);
          } else {
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // We no longer need reCAPTCHA for the custom OTP system
  const setupRecaptcha = (containerId) => {
    return true; // Mock success
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Send OTP via our custom backend
  const sendOTP = async (phoneNumber) => {
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      // Store the phone number to use in verifyOTP
      window.authPhoneNumber = phoneNumber;
      return true;
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError(err.message || 'Network error. Please try again.');
      throw err;
    }
  };

  // Verify OTP via our custom backend and login with Custom Token
  const verifyOTP = async (otp) => {
    setError(null);
    try {
      const phoneNumber = window.authPhoneNumber;
      if (!phoneNumber) {
        throw new Error('Phone number missing. Please request a new OTP.');
      }

      const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // We received a Firebase Custom Token! Now we log in securely.
      const userCredential = await signInWithCustomToken(auth, data.token);
      return userCredential.user;

    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message || 'Network error. Please try again.');
      throw err;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (uid, data) => {
    const userRef = doc(db, 'users', uid);
    const profileData = {
      uid,
      name: data.name || '',
      email: data.email || '',
      mobile: data.mobile || '',
      city: data.city || '',
      role: 'client',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      fcmToken: '',
      isActive: true,
      adminNotes: '',
      isPriorityClient: false,
    };
    await setDoc(userRef, profileData);
    setUserProfile({ id: uid, ...profileData });
    return profileData;
  };

  // Update last login timestamp
  const updateLastLogin = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Error updating last login:', err);
    }
  };

  const logLoginLead = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        // Only log logins for clients, not admins
        if (profile.role === 'admin') return;
        await createLead({
          name: profile.name || 'Unknown',
          email: profile.email || '',
          phone: profile.mobile || '',
          city: profile.city || '',
          service: 'Platform Login',
          subService: 'User logged in to platform',
          source: 'login',
          uid: uid,
        });
      }
    } catch(err) {
      console.error('Error logging login lead:', err);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      if (user) {
        // Delete user profile from Firestore
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', user.uid));
        // Delete Firebase Auth user
        await deleteUser(user);
        setUser(null);
        setUserProfile(null);
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
      throw err;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Get user role
  const getUserRole = () => {
    if (!userProfile) return null;
    return userProfile.role || 'client';
  };

  const isAdmin = () => getUserRole() === 'admin';
  const isClient = () => getUserRole() === 'client';

  // Friendly error messages
  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Please enter a valid phone number.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP. Please check and try again.';
      case 'auth/code-expired':
        return 'The OTP has expired. Please request a new one.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please contact support.';
      case 'auth/operation-not-allowed':
        return 'Phone authentication is not enabled in your Firebase Console. Please go to Authentication -> Sign-in method and enable "Phone".';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return `Something went wrong: ${code?.replace('auth/', '') || 'unknown'}. Please try again.`;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    setError,
    clearError,
    setupRecaptcha,
    sendOTP,
    verifyOTP,
    signOut,
    deleteAccount,
    getUserRole,
    isAdmin,
    isClient,
    createUserProfile,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
