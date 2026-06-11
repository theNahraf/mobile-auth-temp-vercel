// ==========================================
// VALIDATORS
// ==========================================

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  // Indian phone number: 10 digits, optionally with +91 prefix
  const cleaned = phone.replace(/[\s-]/g, '');
  const re = /^(\+91)?[6-9]\d{9}$/;
  return re.test(cleaned);
}

export function validateName(name) {
  return name && name.trim().length >= 3;
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function formatPhone(phone) {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
  return '+91' + cleaned;
}

// ==========================================
// FORMATTERS
// ==========================================

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(timestamp);
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ==========================================
// CALCULATORS
// ==========================================

export function calculateSIP(monthlyAmount, years, expectedReturn) {
  const months = years * 12;
  const monthlyRate = expectedReturn / 100 / 12;
  const totalInvested = monthlyAmount * months;
  
  if (monthlyRate === 0) {
    return { totalInvested, maturityAmount: totalInvested, wealthGained: 0 };
  }
  
  const maturityAmount =
    monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const wealthGained = maturityAmount - totalInvested;

  return {
    totalInvested: Math.round(totalInvested),
    maturityAmount: Math.round(maturityAmount),
    wealthGained: Math.round(wealthGained),
  };
}

export function calculateEMI(loanAmount, tenureMonths, interestRate) {
  const monthlyRate = interestRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return {
      emi: Math.round(loanAmount / tenureMonths),
      totalPayment: loanAmount,
      totalInterest: 0,
    };
  }
  
  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
  };
}

// ==========================================
// WHATSAPP HELPERS
// ==========================================

export async function openWhatsApp(phone, message = '') {
  const cleanPhone = phone.replace(/[+\s-]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  if (typeof window !== 'undefined') {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  }
}

export function getWhatsAppLeadMessage(name, service) {
  return `Hi ${name}, I'm Vaneet from Aakash Aggregators. You recently enquired about ${service}. I'd love to help! 🙏`;
}

// ==========================================
// SERVICE CONSTANTS
// ==========================================

export const SERVICE_CATEGORIES = [
  { id: 'mutual_funds', name: 'Mutual Funds', icon: '💰', color: '#1A237E' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#2E7D32' },
  { id: 'nps', name: 'NPS', icon: '📈', color: '#E65100' },
  { id: 'loans', name: 'Loans', icon: '🏦', color: '#4A148C' },
  { id: 'itr_filing', name: 'ITR Filing', icon: '📄', color: '#01579B' },
  { id: 'b2b_services', name: 'B2B Services', icon: '🏢', color: '#BF360C' },
];

export const DEFAULT_SUB_SERVICES = {
  mutual_funds: [
    { name: 'Equity Funds', description: 'Invest in high-growth stocks for long-term wealth creation', features: ['High return potential', 'Diversified portfolio', 'Expert fund management'], icon: '📊' },
    { name: 'Debt Funds', description: 'Stable returns with lower risk through fixed-income securities', features: ['Capital preservation', 'Regular income', 'Low volatility'], icon: '🏛️' },
    { name: 'ELSS (Tax Saving)', description: 'Save taxes under Section 80C while growing your wealth', features: ['Tax deduction up to ₹1.5L', '3-year lock-in', 'Equity market exposure'], icon: '💎' },
    { name: 'Hybrid Funds', description: 'Best of both worlds — equity growth with debt stability', features: ['Balanced risk', 'Auto rebalancing', 'Suitable for beginners'], icon: '⚖️' },
    { name: 'SIP Plans', description: 'Start small, grow big with systematic investment plans', features: ['Start from ₹500/month', 'Rupee cost averaging', 'Power of compounding'], icon: '📅' },
  ],
  insurance: [
    { name: 'Term Insurance', description: 'Pure life cover at affordable premiums for your family', features: ['High coverage', 'Low premium', 'Tax benefits'], icon: '🛡️' },
    { name: 'Health Insurance', description: 'Comprehensive medical coverage for you and your family', features: ['Cashless treatment', 'No-claim bonus', 'Pre/post hospitalization'], icon: '🏥' },
    { name: 'Car / Motor Insurance', description: 'Protect your vehicle from accidents, theft, and damages', features: ['Comprehensive cover', 'Quick claim settlement', 'Add-on covers'], icon: '🚗' },
    { name: 'Life Insurance', description: 'Savings + protection plans for long-term financial security', features: ['Guaranteed returns', 'Life cover', 'Maturity benefits'], icon: '❤️' },
    { name: 'Family Floater', description: 'Single plan covering your entire family\'s health', features: ['One premium for all', 'Sum insured sharing', 'Wide network'], icon: '👨‍👩‍👧‍👦' },
  ],
  nps: [
    { name: 'Tier I Account', description: 'Mandatory retirement account with tax benefits', features: ['Tax deduction u/s 80C & 80CCD', 'Market-linked returns', 'Partial withdrawal allowed'], icon: '🏦' },
    { name: 'Tier II Account', description: 'Voluntary savings with complete withdrawal flexibility', features: ['No lock-in', 'Flexible withdrawal', 'Same fund options as Tier I'], icon: '💼' },
  ],
  loans: [
    { name: 'Home Loan', description: 'Make your dream home a reality with best rates', features: ['Rates from 8.5% p.a.', 'Up to 30 years tenure', 'Tax benefits on EMI'], icon: '🏠' },
    { name: 'Personal Loan', description: 'Quick funds for your personal needs', features: ['Minimal documentation', 'Quick disbursal', 'Flexible tenure'], icon: '💳' },
    { name: 'Business Loan', description: 'Fuel your business growth with easy financing', features: ['Collateral-free options', 'Competitive rates', 'Fast approval'], icon: '🏪' },
    { name: 'Loan Against Property', description: 'Unlock your property\'s value for major expenses', features: ['High loan amount', 'Lower interest rates', 'Long tenure'], icon: '🏗️' },
    { name: 'Car Loan', description: 'Drive home your dream car with easy EMIs', features: ['Up to 100% financing', 'Quick approval', 'Flexible tenure'], icon: '🚙' },
    { name: 'Education Loan', description: 'Invest in your future with education financing', features: ['Covers tuition & living expenses', 'Moratorium period', 'Tax benefits'], icon: '🎓' },
  ],
  itr_filing: [
    { name: 'Salaried Individual', description: 'Hassle-free ITR filing for salaried professionals', features: ['Form 16 processing', 'HRA & deductions', 'Quick filing'], icon: '👔' },
    { name: 'Business Owner', description: 'Complete ITR filing for business income', features: ['Business income computation', 'GST reconciliation', 'Balance sheet preparation'], icon: '💼' },
    { name: 'NRI Filing', description: 'Specialized tax filing for Non-Resident Indians', features: ['NRI status determination', 'DTAA benefits', 'Foreign income reporting'], icon: '🌍' },
    { name: 'Capital Gains', description: 'Expert filing for capital gains from investments', features: ['Stock trading gains', 'Property sale', 'Mutual fund redemption'], icon: '📈' },
  ],
  b2b_services: [
    { name: 'Sub-broker Franchise', description: 'Start your own financial advisory business with our support', features: ['Complete training', 'Marketing support', 'Revenue sharing'], icon: '🤝' },
    { name: 'Corporate Financial Planning', description: 'Comprehensive financial planning for businesses', features: ['Employee benefits', 'Treasury management', 'Risk assessment'], icon: '🏢' },
    { name: 'Employee Insurance', description: 'Group insurance plans for your employees', features: ['Bulk pricing', 'Customizable plans', 'Easy administration'], icon: '👥' },
    { name: 'Bulk Loan Facilitation', description: 'Large-scale loan processing for businesses', features: ['Dedicated relationship manager', 'Priority processing', 'Custom terms'], icon: '📦' },
  ],
};

export const CALLBACK_OPTIONS = [
  { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
  { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
];

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: '#C62828' },
  { value: 'in_progress', label: 'In Progress', color: '#FF8F00' },
  { value: 'resolved', label: 'Resolved', color: '#2E7D32' },
];
