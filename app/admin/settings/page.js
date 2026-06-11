'use client';

import { useState, useEffect } from 'react';
import { getAppSettings, updateAppSettings, getLeads } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { userProfile, signOut } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [exportingLeads, setExportingLeads] = useState(false);
  
  const [settings, setSettings] = useState({
    businessName: 'Aakash Aggregators',
    tagline: 'Your Trusted Financial Partner',
    contactEmail: 'contact@aakashaggregators.com',
    whatsappNumber: '919999999999',
    address: 'Tilak Nagar, West Delhi, Delhi — 110018',
    aboutUsText: 'Aakash Aggregators is a NISM Certified Mutual Fund Advisory firm led by Mr. Vaneet Bansal, serving 1400+ satisfied clients across Delhi and India with over 10 years of experience in financial services.',
    sebiDisclaimer: 'Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results. Aakash Aggregators is a registered AMFI Mutual Fund Distributor.',
    arnNumber: '',
    nismNumber: 'NISM-202400188719'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getAppSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAppSettings(settings);
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportLeads = async () => {
    setExportingLeads(true);
    try {
      const data = await getLeads(); // fetches all if admin
      const leads = data.leads || [];
      
      if (leads.length === 0) {
        showToast('No leads to export', 'info');
        return;
      }

      // Convert to CSV
      const headers = ['Date', 'Name', 'Mobile', 'Email', 'City', 'Service', 'Sub-Service', 'Status', 'Callback Time'];
      const csvRows = [headers.join(',')];

      for (const lead of leads) {
        const row = [
          new Date(lead.createdAt).toLocaleDateString(),
          `"${lead.name || ''}"`,
          `"${lead.mobile || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.city || ''}"`,
          `"${lead.service || ''}"`,
          `"${lead.subService || ''}"`,
          `"${lead.status || ''}"`,
          `"${lead.callbackTime || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      const csvString = csvRows.join('\\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Export complete', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export leads', 'error');
    } finally {
      setExportingLeads(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut();
      router.push('/login');
    }
  };

  if (loading) {
    return <div className="container flex-center" style={{ minHeight: '50vh' }}><div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} /></div>;
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="heading-lg" style={{ marginBottom: '1.5rem' }}>⚙️ Application Settings</h1>

      <form onSubmit={handleSave}>
        {/* Business Information */}
        <div className="card animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
          <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Business Information</h2>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label>Business Name</label>
              <input className="input" name="businessName" value={settings.businessName} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Tagline</label>
              <input className="input" name="tagline" value={settings.tagline} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Contact Email</label>
              <input className="input" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>WhatsApp Number (with country code)</label>
              <input className="input" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} placeholder="e.g. 919876543210" />
            </div>
          </div>
          <div className="input-group mt-3">
            <label>Business Address</label>
            <textarea className="textarea" name="address" rows={2} value={settings.address} onChange={handleChange} />
          </div>
        </div>

        {/* Content Management */}
        <div className="card animate-fade-in-up delay-1" style={{ marginBottom: '1.5rem' }}>
          <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Content Management</h2>
          <div className="input-group">
            <label>About Us Text (shown on Client Dashboard)</label>
            <textarea className="textarea" name="aboutUsText" rows={4} value={settings.aboutUsText} onChange={handleChange} />
          </div>
          <div className="input-group mt-3">
            <label>SEBI / AMFI Disclaimer</label>
            <textarea className="textarea" name="sebiDisclaimer" rows={3} value={settings.sebiDisclaimer} onChange={handleChange} />
          </div>
          <div className="grid-2 mt-3" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label>ARN Number</label>
              <input className="input" name="arnNumber" value={settings.arnNumber} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>NISM Registration Number</label>
              <input className="input" name="nismNumber" value={settings.nismNumber} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="flex-center animate-fade-in-up delay-2" style={{ marginBottom: '2rem' }}>
          <button type="submit" className={`btn btn-primary btn-lg ${savingSettings ? 'btn-loading' : ''}`} disabled={savingSettings} style={{ minWidth: '200px' }}>
            Save All Settings
          </button>
        </div>
      </form>

      {/* Data Management */}
      <div className="card animate-fade-in-up delay-3" style={{ marginBottom: '1.5rem' }}>
        <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Data Management</h2>
        <div className="flex-between align-center">
          <div>
            <h3 className="body-md font-semibold">Export Leads Data</h3>
            <p className="body-sm text-secondary">Download all leads as a CSV file for Excel/Google Sheets.</p>
          </div>
          <button className={`btn btn-secondary ${exportingLeads ? 'btn-loading' : ''}`} onClick={handleExportLeads} disabled={exportingLeads}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card animate-fade-in-up delay-4">
        <h2 className="heading-sm mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>Account Actions</h2>
        <div className="flex-between align-center">
          <div>
            <h3 className="body-md font-semibold">Signed in as {userProfile?.name}</h3>
            <p className="body-sm text-secondary">{userProfile?.email} • Admin Access</p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
