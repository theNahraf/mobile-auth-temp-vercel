import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// Helper to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Valid Indian mobile number is required' },
        { status: 400 }
      );
    }

    // 1. Generate OTP
    const otp = generateOTP();
    
    // 2. Set expiration (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 3. Store OTP in Firestore 'auth_otps' collection securely
    const adminDb = getAdminDb();
    await adminDb.collection('auth_otps').doc(phone).set({
      otp: otp,
      expiresAt: expiresAt,
      attempts: 0,
    });

    // 4. Send SMS via Twilio / Fast2SMS (Replace this block with actual API call)
    console.log(`[MOCK SMS] Sending OTP ${otp} to ${phone}`);
    // Example for Fast2SMS:
    // await fetch('https://www.fast2sms.com/dev/bulkV2', {
    //   method: 'POST',
    //   headers: { authorization: process.env.FAST2SMS_API_KEY },
    //   body: new URLSearchParams({ route: 'otp', variables_values: otp, numbers: phone.replace('+91', '') })
    // });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
