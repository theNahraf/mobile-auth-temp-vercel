export const metadata = {
  title: 'Terms of Service — Aakash Aggregators',
  description: 'Terms of Service for Aakash Aggregators Financial Services App',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh', background: 'var(--bg)' }}>
      <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Terms of Service</h1>
      <p className="body-sm text-secondary" style={{ marginBottom: '2rem' }}>Last updated: June 2024</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>1. Acceptance of Terms</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            By using the Aakash Aggregators app, you agree to these Terms of Service. If you do not agree, please do not use the app.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>2. Services</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            Aakash Aggregators provides a platform for lead generation and financial advisory services including Mutual Funds, Insurance, NPS, Loans, ITR Filing, and B2B Services. We are a NISM Certified (Reg. No.: NISM-202400188719) AMFI Registered Mutual Fund Distributor.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>3. Disclaimer</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results. This app is for informational purposes only and does not constitute financial advice. All investment decisions should be made after consulting with a qualified financial advisor.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>4. User Responsibilities</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            You agree to provide accurate information, maintain the confidentiality of your account credentials, and use the app in compliance with applicable laws. You must be at least 18 years old to use this app.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>5. Intellectual Property</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            All content, logos, and materials in this app are the property of Aakash Aggregators. You may not copy, reproduce, or distribute any content without written permission.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>6. Contact</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            For questions about these terms, contact us at:<br />
            Aakash Aggregators<br />
            Tilak Nagar, West Delhi, Delhi — 110018<br />
            Email: contact@aakashaggregators.com
          </p>
        </section>
      </div>
    </div>
  );
}
