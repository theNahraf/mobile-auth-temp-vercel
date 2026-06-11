'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { calculateSIP, calculateEMI, formatCurrency } from '@/lib/utils';
import { logEvent, createLead, getService, getSubServices } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

export default function ServiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();
  const serviceId = params.id;

  const [service, setService] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [svcData, subsData] = await Promise.all([
          getService(serviceId),
          getSubServices(serviceId)
        ]);
        setService(svcData);
        setSubServices(subsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (serviceId) loadData();
  }, [serviceId]);

  // SIP Calculator state
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipReturn, setSipReturn] = useState(12);
  const sipResult = calculateSIP(sipAmount, sipYears, sipReturn);

  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTenure, setLoanTenure] = useState(60);
  const [loanRate, setLoanRate] = useState(10);
  const emiResult = calculateEMI(loanAmount, loanTenure, loanRate);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutoEnquire = async (subServiceName) => {
    if (!userProfile) return;
    setIsSubmitting(true);
    try {
      await createLead({
        uid: user.uid,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.mobile || '',
        city: userProfile.city || '',
        service: serviceId,
        subService: subServiceName || 'General Enquiry',
        notes: 'Automated 1-click enquiry from app.',
        source: 'app_1_click',
      });
      showToast(`We have notified an expert about ${subServiceName || (service ? service.name : '')}. They will contact you shortly!`, 'success');
      logEvent({
        uid: user.uid,
        eventType: 'lead_submitted',
        serviceType: serviceId,
      }).catch(() => {});
    } catch (err) {
      console.error(err);
      showToast('Failed to submit enquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View tracking
  useEffect(() => {
    if (user && service && userProfile) {
      logEvent({
        uid: user.uid,
        eventType: 'service_view',
        serviceType: serviceId,
      }).catch(() => {});

      // Automatic aggressive lead tracking for service views
      const lastViewedKey = `viewed_${serviceId}_${user.uid}`;
      const lastViewed = localStorage.getItem(lastViewedKey);
      const now = Date.now();

      if (!lastViewed || (now - parseInt(lastViewed)) > 1000 * 60 * 60) { // 1 hour cooldown
        createLead({
          name: userProfile.name || 'Unknown',
          email: userProfile.email || '',
          phone: userProfile.mobile || '',
          city: userProfile.city || '',
          service: serviceId,
          subService: 'Viewed Service Page',
          source: 'view',
          uid: user.uid,
        }).catch(err => console.error(err));

        localStorage.setItem(lastViewedKey, now.toString());
      }
    }
  }, [user, service, userProfile, serviceId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="shimmer shimmer-card" style={{ height: '200px', marginBottom: '2rem' }} />
        <div className="grid-2">
          <div className="shimmer shimmer-card" style={{ height: '150px' }} />
          <div className="shimmer shimmer-card" style={{ height: '150px' }} />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container">
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Service Not Found</div>
          <div className="empty-state-desc">The service you&apos;re looking for doesn&apos;t exist.</div>
          <Link href="/client/services" className="btn btn-primary mt-3">View All Services</Link>
        </div>
      </div>
    );
  }

  const bannerDescriptions = {
    mutual_funds: 'Smart investments for a brighter future',
    insurance: 'Comprehensive protection for you and your family',
    nps: 'Build a secure retirement corpus',
    loans: 'Quick approvals with competitive interest rates',
    itr_filing: 'Expert CA-assisted income tax return filing',
    b2b_services: 'Business solutions and partnership opportunities',
  };

  return (
    <div className="container">
      {/* Hero Banner */}
      <div className="hero-banner animate-fade-in" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{service.icon}</div>
        <h1>{service.name}</h1>
        <p>{service.description || bannerDescriptions[serviceId] || 'Explore our offerings'}</p>
      </div>

      {/* Sub-Services Grid */}
      <div className="section">
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Available Options</h2>
        <div className="grid-2">
          {subServices.map((sub, index) => (
            <div key={index} className="sub-service-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}>
              <div className="sub-service-icon">{sub.icon}</div>
              <div className="sub-service-name">{sub.name}</div>
              <div className="sub-service-desc">{sub.description}</div>
              {sub.features && sub.features.length > 0 && (
                <div className="sub-service-features">
                  {sub.features.map((feature, fi) => (
                    <div key={fi} className="sub-service-feature">{feature}</div>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleAutoEnquire(sub.name)}
                disabled={isSubmitting}
                className="btn btn-primary btn-sm btn-full"
              >
                {isSubmitting ? 'Processing...' : serviceId === 'insurance' ? 'Get Quote' : serviceId === 'loans' ? 'Apply Now' : serviceId === 'itr_filing' ? 'Book Appointment' : serviceId === 'b2b_services' ? 'Become a Partner' : 'Enquire Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SIP Calculator (Mutual Funds only) */}
      {serviceId === 'mutual_funds' && (
        <div className="section animate-fade-in-up">
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>📊 SIP Calculator</h2>
          <div className="calculator-card">
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label>Monthly SIP (₹)</label>
                <input type="number" className="input" value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value) || 0)} min="500" step="500" />
                <input type="range" min="500" max="100000" step="500" value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }} />
              </div>
              <div className="input-group">
                <label>Duration (Years)</label>
                <input type="number" className="input" value={sipYears} onChange={(e) => setSipYears(Number(e.target.value) || 1)} min="1" max="30" />
                <input type="range" min="1" max="30" value={sipYears} onChange={(e) => setSipYears(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }} />
              </div>
              <div className="input-group">
                <label>Expected Return (% p.a.)</label>
                <input type="number" className="input" value={sipReturn} onChange={(e) => setSipReturn(Number(e.target.value) || 0)} min="1" max="30" step="0.5" />
                <input type="range" min="1" max="30" step="0.5" value={sipReturn} onChange={(e) => setSipReturn(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }} />
              </div>
            </div>
            <div className="calculator-result">
              <div className="body-sm text-secondary" style={{ marginBottom: '0.5rem' }}>Estimated Maturity Amount</div>
              <div className="calculator-result-value">{formatCurrency(sipResult.maturityAmount)}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <div className="body-xs text-tertiary">Total Invested</div>
                  <div className="mono body-md" style={{ fontWeight: 600 }}>{formatCurrency(sipResult.totalInvested)}</div>
                </div>
                <div>
                  <div className="body-xs text-tertiary">Wealth Gained</div>
                  <div className="mono body-md text-success" style={{ fontWeight: 600 }}>{formatCurrency(sipResult.wealthGained)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMI Calculator (Loans only) */}
      {serviceId === 'loans' && (
        <div className="section animate-fade-in-up">
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>🏦 EMI Calculator</h2>
          <div className="calculator-card">
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label>Loan Amount (₹)</label>
                <input type="number" className="input" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value) || 0)} min="10000" step="10000" />
                <input type="range" min="10000" max="10000000" step="10000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }} />
              </div>
              <div className="input-group">
                <label>Tenure (Months)</label>
                <input type="number" className="input" value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value) || 1)} min="1" max="360" />
                <input type="range" min="6" max="360" value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }} />
              </div>
              <div className="input-group">
                <label>Interest Rate (% p.a.)</label>
                <input type="number" className="input" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value) || 0)} min="1" max="30" step="0.25" />
                <input type="range" min="1" max="30" step="0.25" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--primary)' }} />
              </div>
            </div>
            <div className="calculator-result">
              <div className="body-sm text-secondary" style={{ marginBottom: '0.5rem' }}>Monthly EMI</div>
              <div className="calculator-result-value">{formatCurrency(emiResult.emi)}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <div className="body-xs text-tertiary">Total Payment</div>
                  <div className="mono body-md" style={{ fontWeight: 600 }}>{formatCurrency(emiResult.totalPayment)}</div>
                </div>
                <div>
                  <div className="body-xs text-tertiary">Total Interest</div>
                  <div className="mono body-md text-danger" style={{ fontWeight: 600 }}>{formatCurrency(emiResult.totalInterest)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General CTA */}
      <div className="section text-center animate-fade-in-up">
        <button
          onClick={() => handleAutoEnquire('General Enquiry')}
          disabled={isSubmitting}
          className="btn btn-accent btn-lg"
        >
          📩 {isSubmitting ? 'Processing...' : serviceId === 'insurance' ? 'Get a Quote' : serviceId === 'loans' ? 'Apply Now' : 'Enquire Now'}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-footer">
        <p>Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results. Aakash Aggregators (ARN: [ARN Number]) is a registered AMFI Mutual Fund Distributor. NISM Reg. No.: NISM-202400188719.</p>
      </div>
    </div>
  );
}
