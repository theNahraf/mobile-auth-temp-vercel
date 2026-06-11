import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const otpDocRef = adminDb.collection('auth_otps').doc(phone);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'Please request a new OTP first' }, { status: 400 });
    }

    const data = otpDoc.data();

    // Check expiration
    if (data.expiresAt.toDate() < new Date()) {
      await otpDocRef.delete();
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Check max attempts
    if (data.attempts >= 3) {
      await otpDocRef.delete();
      return NextResponse.json({ error: 'Too many failed attempts. Please request a new OTP.' }, { status: 400 });
    }

    // Verify OTP
    if (data.otp !== otp) {
      await otpDocRef.update({ attempts: data.attempts + 1 });
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // OTP is valid! Delete it so it can't be reused.
    await otpDocRef.delete();

    // Find or create Firebase user (UID will be the phone number or generated)
    // We try to get user by phone number
    let uid;
    const adminAuth = getAdminAuth();
    try {
      const userRecord = await adminAuth.getUserByPhoneNumber(phone);
      uid = userRecord.uid;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        const newUser = await adminAuth.createUser({
          phoneNumber: phone,
        });
        uid = newUser.uid;
      } else {
        throw err;
      }
    }

    // Generate Custom Token
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ success: true, token: customToken });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
