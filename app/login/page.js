'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useState, useEffect, useCallback, useRef } from 'react';
import { validateEmail, formatPhone } from '@/lib/utils';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    user,
    userProfile,
    error,
    clearError,
    setupRecaptcha,
    sendOTP,
    verifyOTP,
    createUserProfile
  } = useAuth();

  // ─── State ──────────────────────────────────────────
  const [step, setStep] = useState('PHONE_INPUT'); // 'PHONE_INPUT' | 'OTP_VERIFICATION' | 'PROFILE_COMPLETION'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [profileData, setProfileData] = useState({ name: '', email: '', city: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // ─── Initial Setup ──────────────────────────────────
  // No recaptcha setup required for Custom OTP system

  // ─── Redirect after auth & profile completion ───────
  useEffect(() => {
    if (user && userProfile && step !== 'PROFILE_COMPLETION') {
      if (userProfile.role === 'admin') {
        router.push('/admin');
      } else if (userProfile.role === 'client') {
        router.push('/client');
      }
    }
  }, [user, userProfile, router, step]);

  // ─── Helpers ────────────────────────────────────────
  const updateProfileField = useCallback((field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const openAdminWebsite = async () => {
    const url = 'https://www.aakashaggregators.com/';
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  // ─── Step 1: Send OTP ───────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (clearError) clearError();
    setFieldErrors({});

    const formattedPhone = formatPhone(phoneNumber);
    if (!/^\+91[6-9]\d{9}$/.test(formattedPhone)) {
      setFieldErrors({ phone: 'Enter a valid 10-digit Indian mobile number' });
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP(formattedPhone);
      setStep('OTP_VERIFICATION');
    } catch (err) {
      console.error(err);
      // error is handled by AuthContext and displayed in the UI
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (clearError) clearError();
    setFieldErrors({});

    if (otp.length !== 6) {
      setFieldErrors({ otp: 'Enter a valid 6-digit OTP' });
      return;
    }

    setIsLoading(true);
    try {
      const verifiedUser = await verifyOTP(otp);
      
      // We need to wait briefly to see if `onAuthStateChanged` fetches the user profile.
      // Alternatively, we can check Firestore directly here if `userProfile` is null.
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const userDoc = await getDoc(doc(db, 'users', verifiedUser.uid));
      
      if (userDoc.exists()) {
        // User exists, they will be redirected automatically by the useEffect
        // We do nothing else here.
      } else {
        // New user, must complete profile
        setStep('PROFILE_COMPLETION');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 3: Complete Profile ───────────────────────
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(profileData.email)) errors.email = 'Enter a valid email';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await createUserProfile(user.uid, {
        name: profileData.name,
        email: profileData.email,
        city: profileData.city,
        mobile: user.phoneNumber || formatPhone(phoneNumber)
      });
      // After this, userProfile is set and useEffect will redirect
    } catch (err) {
      console.error(err);
      if (clearError) clearError();
      setFieldErrors({ form: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Renders ────────────────────────────────────────
  
  const renderPhoneInput = () => (
    <div className={styles.formTransition}>
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Sign in or Create account</h1>
        <p className={styles.cardSubtitle}>Enter your mobile number to get started</p>
      </div>

      <form onSubmit={handleSendOTP}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Mobile Number *</label>
          <div className={styles.phoneInputWrapper}>
            <span className={styles.phonePrefix}>+91</span>
            <input
              className={`${styles.formInput} ${styles.phoneInput}`}
              type="tel"
              placeholder="98765 43210"
              value={phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneNumber(val);
                setFieldErrors({});
              }}
              autoComplete="tel"
              maxLength={10}
            />
          </div>
          {fieldErrors.phone && <div className={styles.fieldError}>{fieldErrors.phone}</div>}
        </div>

        <button className={styles.submitBtn} type="submit" disabled={isLoading || phoneNumber.length < 10}>
          {isLoading && <span className={styles.spinner} />}
          Get OTP
        </button>
      </form>
    </div>
  );

  const renderOTPVerification = () => (
    <div className={styles.formTransition}>
      <button 
        className={styles.backButton} 
        onClick={() => {
          setStep('PHONE_INPUT');
          setOtp('');
          if (clearError) clearError();
        }} 
        type="button"
      >
        <span className={styles.backArrow}>←</span> Change number
      </button>

      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Verify Mobile</h1>
        <p className={styles.cardSubtitle}>Enter the 6-digit OTP sent to +91 {phoneNumber}</p>
      </div>

      <form onSubmit={handleVerifyOTP}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>One Time Password *</label>
          <input
            className={styles.formInput}
            type="number"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(val);
              setFieldErrors({});
            }}
            autoComplete="one-time-code"
            maxLength={6}
            style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem' }}
          />
          {fieldErrors.otp && <div className={styles.fieldError}>{fieldErrors.otp}</div>}
        </div>

        <button className={styles.submitBtn} type="submit" disabled={isLoading || otp.length < 6}>
          {isLoading && <span className={styles.spinner} />}
          Verify & Proceed
        </button>
      </form>
    </div>
  );

  const renderProfileCompletion = () => (
    <div className={styles.formTransition}>
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>Complete Profile</h1>
        <p className={styles.cardSubtitle}>Just a few more details to get started</p>
      </div>

      <form onSubmit={handleCompleteProfile}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Full Name *</label>
          <input
            className={styles.formInput}
            type="text"
            placeholder="John Doe"
            value={profileData.name}
            onChange={(e) => updateProfileField('name', e.target.value)}
            autoComplete="name"
          />
          {fieldErrors.name && <div className={styles.fieldError}>{fieldErrors.name}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email Address *</label>
          <input
            className={styles.formInput}
            type="email"
            placeholder="you@example.com"
            value={profileData.email}
            onChange={(e) => updateProfileField('email', e.target.value)}
            autoComplete="email"
          />
          {fieldErrors.email && <div className={styles.fieldError}>{fieldErrors.email}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>City (optional)</label>
          <input
            className={styles.formInput}
            type="text"
            placeholder="Mumbai"
            value={profileData.city}
            onChange={(e) => updateProfileField('city', e.target.value)}
            autoComplete="address-level2"
          />
        </div>

        <div className={styles.checkboxGroup}>
          <p className={styles.checkboxLabel} style={{ marginTop: '0.5rem' }}>
            By continuing, you agree to the{' '}
            <a href="/privacy/" className={styles.checkboxLink}>Privacy Policy</a> and{' '}
            <a href="/terms/" className={styles.checkboxLink}>Terms of Service</a>
          </p>
        </div>

        {fieldErrors.form && <div className={styles.errorMessage}>{fieldErrors.form}</div>}

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading && <span className={styles.spinner} />}
          Finish Setup
        </button>
      </form>
    </div>
  );

  // ─── Main Render ────────────────────────────────────
  return (
    <div className={styles.loginPage}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>

      {/* App Branding */}
      <div className={styles.branding}>
        <div className={styles.logoIcon}>🏛️</div>
        <h1 className={styles.logoText}>Aakash Aggregators</h1>
        <p className={styles.tagline}>Your Trusted Financial Partner</p>
        <div className={styles.trustBadges}>
          <span className={styles.trustBadge}>🏅 NISM Certified</span>
          <span className={styles.trustBadge}>👥 1400+ Clients</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className={styles.authCard}>
        {error && step !== 'PROFILE_COMPLETION' && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {step === 'PHONE_INPUT' && renderPhoneInput()}
        {step === 'OTP_VERIFICATION' && renderOTPVerification()}
        {step === 'PROFILE_COMPLETION' && renderProfileCompletion()}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="/privacy/" className={styles.footerLink}>Privacy Policy</a>
          <a href="/terms/" className={styles.footerLink}>Terms of Service</a>
        </div>
        <button
          className={styles.websiteLink}
          onClick={openAdminWebsite}
          type="button"
        >
          🌐 www.aakashaggregators.com
        </button>
      </div>
    </div>
  );
}
