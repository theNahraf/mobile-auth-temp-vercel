import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ==========================================
// USER OPERATIONS
// ==========================================

export async function getUser(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
}

export async function updateUser(uid, data) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
}

export async function getAllUsers(lastDoc = null, pageSize = 20) {
  let q = query(
    collection(db, 'users'),
    where('role', '==', 'client'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) {
    q = query(
      collection(db, 'users'),
      where('role', '==', 'client'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }
  const snapshot = await getDocs(q);
  return {
    users: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export function subscribeToUserCount(callback) {
  return onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'client')),
    (snapshot) => callback(snapshot.size)
  );
}

// ==========================================
// LEAD OPERATIONS
// ==========================================

export async function createLead(leadData) {
  const lead = {
    ...leadData,
    status: 'new',
    source: leadData.source || 'enquiry_form',
    adminNotes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'leads'), lead);
  return { id: docRef.id, ...lead };
}

export async function getLead(leadId) {
  const leadDoc = await getDoc(doc(db, 'leads', leadId));
  if (leadDoc.exists()) {
    return { id: leadDoc.id, ...leadDoc.data() };
  }
  return null;
}

export async function getLeads(filters = {}, lastDoc = null, pageSize = 20) {
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];

  if (filters.status && filters.status !== 'all') {
    constraints.unshift(where('status', '==', filters.status));
  }
  if (filters.service) {
    constraints.unshift(where('service', '==', filters.service));
  }
  if (filters.uid) {
    constraints.unshift(where('uid', '==', filters.uid));
  }
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, 'leads'), ...constraints);
  const snapshot = await getDocs(q);
  return {
    leads: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function getRecentUserLeads(uid, limitCount = 5) {
  // Query only by uid to avoid requiring a composite index
  const q = query(collection(db, 'leads'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  const leads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  // Sort client-side by createdAt descending
  leads.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
  
  return leads.slice(0, limitCount);
}

export async function updateLeadStatus(leadId, status, adminNotes = '') {
  const leadRef = doc(db, 'leads', leadId);
  const updateData = { status, updatedAt: serverTimestamp() };
  if (adminNotes) updateData.adminNotes = adminNotes;
  await updateDoc(leadRef, updateData);
}

export function subscribeToNewLeads(callback) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return onSnapshot(
    query(
      collection(db, 'leads'),
      where('status', '==', 'new'),
      orderBy('createdAt', 'desc'),
      limit(10)
    ),
    (snapshot) => {
      const leads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(leads);
    }
  );
}

export function subscribeToLeadCount(callback) {
  return onSnapshot(collection(db, 'leads'), (snapshot) => callback(snapshot.size));
}

// ==========================================
// EVENT TRACKING
// ==========================================

export async function logEvent(eventData) {
  const event = {
    ...eventData,
    timestamp: serverTimestamp(),
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
  await addDoc(collection(db, 'events'), event);
}

export async function getUserEvents(uid, limitCount = 20) {
  const q = query(
    collection(db, 'events'),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==========================================
// SERVICE OPERATIONS
// ==========================================

export async function addService(data) {
  const serviceId = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const serviceRef = doc(db, 'services', serviceId);
  const serviceDoc = await getDoc(serviceRef);
  if (serviceDoc.exists()) {
    throw new Error('A service with a similar name already exists.');
  }
  const serviceData = {
    ...data,
    id: serviceId,
    isVisible: true,
    createdAt: serverTimestamp(),
  };
  await setDoc(serviceRef, serviceData);
  return serviceData;
}

export async function getServices() {
  const snapshot = await getDocs(collection(db, 'services'));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getService(serviceId) {
  const serviceDoc = await getDoc(doc(db, 'services', serviceId));
  if (serviceDoc.exists()) {
    return { id: serviceDoc.id, ...serviceDoc.data() };
  }
  return null;
}

export async function updateService(serviceId, data) {
  await updateDoc(doc(db, 'services', serviceId), data);
}

export async function getSubServices(serviceId) {
  const snapshot = await getDocs(
    query(
      collection(db, 'services', serviceId, 'subServices'),
      orderBy('order', 'asc')
    )
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addSubService(serviceId, data) {
  const subServicesRef = collection(db, 'services', serviceId, 'subServices');
  return await addDoc(subServicesRef, {
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
  });
}

export async function updateSubService(serviceId, subServiceId, data) {
  const subRef = doc(db, 'services', serviceId, 'subServices', subServiceId);
  await updateDoc(subRef, data);
}

export async function deleteSubService(serviceId, subServiceId) {
  await deleteDoc(doc(db, 'services', serviceId, 'subServices', subServiceId));
}

// Initialize default services (run once)
export async function initializeDefaultServices() {
  const services = [
    {
      id: 'mutual_funds',
      name: 'Mutual Funds',
      icon: '💰',
      isVisible: true,
      bannerTitle: 'Start Your SIP Today',
      bannerSubtitle: 'Smart investments for a brighter future',
      ctaLabel: 'Enquire Now',
      bannerImageUrl: '',
      order: 1,
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: '🛡️',
      isVisible: true,
      bannerTitle: 'Protect Your Future',
      bannerSubtitle: 'Comprehensive insurance solutions for you and your family',
      ctaLabel: 'Get Quote',
      bannerImageUrl: '',
      order: 2,
    },
    {
      id: 'nps',
      name: 'NPS',
      icon: '📈',
      isVisible: true,
      bannerTitle: 'Secure Your Retirement',
      bannerSubtitle: 'National Pension Scheme for a worry-free future',
      ctaLabel: 'Open NPS Account',
      bannerImageUrl: '',
      order: 3,
    },
    {
      id: 'loans',
      name: 'Loans',
      icon: '🏦',
      isVisible: true,
      bannerTitle: 'Loans at Best Rates',
      bannerSubtitle: 'Quick approvals with competitive interest rates',
      ctaLabel: 'Apply Now',
      bannerImageUrl: '',
      order: 4,
    },
    {
      id: 'itr_filing',
      name: 'ITR Filing',
      icon: '📄',
      isVisible: true,
      bannerTitle: 'File Your ITR Hassle-Free',
      bannerSubtitle: 'Expert CA-assisted income tax return filing',
      ctaLabel: 'Book Appointment',
      bannerImageUrl: '',
      order: 5,
    },
    {
      id: 'b2b_services',
      name: 'B2B Services',
      icon: '🏢',
      isVisible: true,
      bannerTitle: 'Partner With Us',
      bannerSubtitle: 'Business solutions and partnership opportunities',
      ctaLabel: 'Become a Partner',
      bannerImageUrl: '',
      order: 6,
    },
  ];

  const batch = writeBatch(db);
  services.forEach((service) => {
    const ref = doc(db, 'services', service.id);
    batch.set(ref, service);
  });
  await batch.commit();
}

// ==========================================
// BROADCAST OPERATIONS
// ==========================================

export async function createBroadcast(data) {
  return await addDoc(collection(db, 'broadcasts'), {
    ...data,
    sentAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    deliveredCount: 0,
  });
}

export async function getBroadcasts(limitCount = 20) {
  const q = query(
    collection(db, 'broadcasts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteBroadcast(broadcastId) {
  await deleteDoc(doc(db, 'broadcasts', broadcastId));
}

export function subscribeToBroadcasts(callback) {
  return onSnapshot(
    query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(10)),
    (snapshot) => {
      const broadcasts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(broadcasts);
    }
  );
}

// ==========================================
// APP SETTINGS
// ==========================================

export async function getAppSettings() {
  const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
  if (settingsDoc.exists()) {
    return settingsDoc.data();
  }
  // Return defaults
  return {
    businessName: 'Aakash Aggregators',
    tagline: 'Your Trusted Financial Partner',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@aakashaggregators.com',
    address: 'Tilak Nagar, West Delhi, Delhi — 110018',
    aboutUsText:
      'Aakash Aggregators is a NISM Certified Mutual Fund Advisory firm led by Mr. Vaneet Bansal, serving 1400+ satisfied clients across Delhi and India with over 10 years of experience in financial services.',
    sebiDisclaimer:
      'Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results. Aakash Aggregators (ARN: [ARN Number]) is a registered AMFI Mutual Fund Distributor. NISM Reg. No.: NISM-202400188719. This app is for informational purposes only and does not constitute financial advice.',
    arnNumber: '',
    nismRegNumber: 'NISM-202400188719',
  };
}

export async function updateAppSettings(data) {
  await setDoc(doc(db, 'settings', 'app'), data, { merge: true });
}
