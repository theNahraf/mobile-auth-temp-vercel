export const metadata = {
  title: 'Privacy Policy — Aakash Aggregators',
  description: 'Privacy Policy for Aakash Aggregators Financial Services App',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh', background: 'var(--bg)' }}>
      <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Privacy Policy</h1>
      <p className="body-sm text-secondary" style={{ marginBottom: '2rem' }}>Last updated: June 2024</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>1. Information We Collect</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            Aakash Aggregators collects the following personal information when you use our app:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', listStyle: 'disc' }}>
            <li className="body-md text-secondary" style={{ marginBottom: '0.25rem' }}>Full Name</li>
            <li className="body-md text-secondary" style={{ marginBottom: '0.25rem' }}>Email Address</li>
            <li className="body-md text-secondary" style={{ marginBottom: '0.25rem' }}>Phone Number</li>
            <li className="body-md text-secondary" style={{ marginBottom: '0.25rem' }}>City / Location</li>
            <li className="body-md text-secondary" style={{ marginBottom: '0.25rem' }}>App activity (service views, enquiry submissions)</li>
          </ul>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>2. How We Use Your Information</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            Your information is used to: provide personalized financial advisory services, respond to your enquiries and service requests, send relevant updates and broadcast messages about our services, improve our app experience, and comply with regulatory requirements as a NISM certified financial advisor.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>3. Third-Party Services</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            We use Google Firebase services for authentication, database, storage, and analytics. Google&apos;s privacy policy applies to data processed through Firebase. We do not sell your personal data to any third parties.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>4. Data Security</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            All data is encrypted in transit using HTTPS/TLS. We use Firebase security rules to protect data access. Only authorized personnel can access your data for service purposes.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>5. Your Rights</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            You can request data deletion through the &quot;Delete My Account&quot; feature in the app settings. This will permanently remove your personal data from our systems. You can also request access to your data or corrections by contacting us.
          </p>
        </section>

        <section>
          <h2 className="heading-sm" style={{ marginBottom: '0.5rem' }}>6. Contact Us</h2>
          <p className="body-md text-secondary" style={{ lineHeight: '1.8' }}>
            For privacy-related questions, contact us at:<br />
            Aakash Aggregators<br />
            Tilak Nagar, West Delhi, Delhi — 110018<br />
            Email: contact@aakashaggregators.com
          </p>
        </section>
      </div>
    </div>
  );
}
