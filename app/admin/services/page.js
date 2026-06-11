'use client';

import { useState, useEffect } from 'react';
import { getServices, addService, updateService, getSubServices, addSubService, updateSubService, deleteSubService, initializeDefaultServices } from '@/lib/firestore';
import { SERVICE_CATEGORIES } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AdminServicesPage() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [subServices, setSubServices] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modal state for Sub-services
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [activeServiceId, setActiveServiceId] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📄', features: '' });

  // Modal state for Main Services
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({ name: '', description: '', icon: '🌟' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const svcs = await getServices();
      setServices(svcs.length > 0 ? svcs : SERVICE_CATEGORIES.map(s => ({ ...s, isVisible: true })));
    } catch (err) {
      console.error(err);
      showToast('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubServices = async (serviceId) => {
    if (subServices[serviceId]) return; // Already loaded
    try {
      const subs = await getSubServices(serviceId);
      setSubServices(prev => ({ ...prev, [serviceId]: subs }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleExpand = (serviceId) => {
    if (expandedId === serviceId) {
      setExpandedId(null);
    } else {
      setExpandedId(serviceId);
      fetchSubServices(serviceId);
    }
  };

  const handleToggleService = async (serviceId, currentVisibility) => {
    try {
      await updateService(serviceId, { isVisible: !currentVisibility });
      setServices(services.map(s => s.id === serviceId ? { ...s, isVisible: !currentVisibility } : s));
      showToast('Service visibility updated', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update service', 'error');
    }
  };

  const handleInitDefaults = async () => {
    try {
      await initializeDefaultServices();
      showToast('Default services initialized successfully', 'success');
      fetchServices();
    } catch (err) {
      console.error(err);
      showToast('Failed to initialize default services', 'error');
    }
  };

  const openAddModal = (serviceId) => {
    setActiveServiceId(serviceId);
    setEditingSub(null);
    setFormData({ name: '', description: '', icon: '📄', features: '' });
    setModalOpen(true);
  };

  const openServiceModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setServiceFormData({ name: service.name, description: service.description || '', icon: service.icon || '🌟' });
    } else {
      setServiceFormData({ name: '', description: '', icon: '🌟' });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!serviceFormData.name) {
      showToast('Name is required', 'error');
      return;
    }
    try {
      if (editingService) {
        await updateService(editingService.id, serviceFormData);
        showToast('Service updated', 'success');
      } else {
        await addService(serviceFormData);
        showToast('Service created', 'success');
      }
      setServiceModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save service', 'error');
    }
  };

  const openEditModal = (serviceId, sub) => {
    setActiveServiceId(serviceId);
    setEditingSub(sub);
    setFormData({ 
      name: sub.name, 
      description: sub.description, 
      icon: sub.icon || '📄', 
      features: sub.features ? sub.features.join(', ') : '' 
    });
    setModalOpen(true);
  };

  const handleSaveSubService = async () => {
    if (!formData.name || !formData.description) {
      showToast('Name and description are required', 'error');
      return;
    }

    try {
      const subData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        isActive: editingSub ? editingSub.isActive : true
      };

      if (editingSub) {
        await updateSubService(activeServiceId, editingSub.id, subData);
        showToast('Sub-service updated', 'success');
      } else {
        await addSubService(activeServiceId, subData);
        showToast('Sub-service added', 'success');
      }
      
      setModalOpen(false);
      // Force refresh
      const subs = await getSubServices(activeServiceId);
      setSubServices(prev => ({ ...prev, [activeServiceId]: subs }));
    } catch (err) {
      console.error(err);
      showToast('Failed to save sub-service', 'error');
    }
  };

  const handleDeleteSubService = async (serviceId, subId) => {
    if (!confirm('Are you sure you want to delete this sub-service?')) return;
    try {
      await deleteSubService(serviceId, subId);
      showToast('Sub-service deleted', 'success');
      const subs = await getSubServices(serviceId);
      setSubServices(prev => ({ ...prev, [serviceId]: subs }));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete sub-service', 'error');
    }
  };

  // Toggle switch UI component
  const ToggleSwitch = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ 
        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: checked ? 'var(--success)' : 'var(--border)', 
        transition: '.4s', borderRadius: '24px' 
      }}>
        <span style={{ 
          position: 'absolute', content: '""', height: '18px', width: '18px', 
          left: checked ? '22px' : '3px', bottom: '3px', backgroundColor: 'white', 
          transition: '.4s', borderRadius: '50%' 
        }} />
      </span>
    </label>
  );

  return (
    <div className="container">
      <div className="flex-between align-center animate-fade-in" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="heading-lg">Manage Services</h1>
          <p className="body-sm text-secondary">Control which services and sub-services are visible to clients.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleInitDefaults}>
            Init Defaults
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openServiceModal()}>
            + Add Service
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-col gap-sm">
          {[1,2,3].map(i => <div key={i} className="shimmer shimmer-card" style={{ height: '80px' }} />)}
        </div>
      ) : (
        <div className="flex-col gap-sm">
          {services.map((service, index) => (
            <div key={service.id} className="card card-interactive animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex-between align-center" style={{ cursor: 'pointer' }} onClick={() => handleToggleExpand(service.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{service.icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 className="heading-sm">{service.name}</h2>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: '0.2rem', fontSize: '0.8rem' }} 
                        onClick={(e) => { e.stopPropagation(); openServiceModal(service); }}
                        title="Edit Service"
                      >
                        ✏️
                      </button>
                    </div>
                    <p className="body-xs text-secondary">{service.description || 'Service category'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="body-xs font-semibold">{service.isVisible !== false ? 'Visible' : 'Hidden'}</span>
                    <ToggleSwitch checked={service.isVisible !== false} onChange={() => handleToggleService(service.id, service.isVisible !== false)} />
                  </div>
                  <span style={{ transform: expandedId === service.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
                </div>
              </div>

              {expandedId === service.id && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <div className="flex-between align-center" style={{ marginBottom: '1rem' }}>
                    <h3 className="heading-sm text-primary">Sub-Services</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => openAddModal(service.id)}>+ Add New</button>
                  </div>

                  {!subServices[service.id] ? (
                    <div className="shimmer shimmer-card" style={{ height: '100px' }} />
                  ) : subServices[service.id].length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                      <div className="body-sm text-secondary">No sub-services defined yet.</div>
                    </div>
                  ) : (
                    <div className="grid-2">
                      {subServices[service.id].map(sub => (
                        <div key={sub.id} className="sub-service-card" style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', position: 'absolute', top: '1rem', right: '1rem' }}>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }} onClick={() => openEditModal(service.id, sub)}>✏️</button>
                            <button className="btn btn-ghost btn-sm text-danger" style={{ padding: '0.25rem' }} onClick={() => handleDeleteSubService(service.id, sub.id)}>🗑️</button>
                          </div>
                          <div className="sub-service-icon" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{sub.icon || '📄'}</div>
                          <div className="heading-sm mb-1">{sub.name}</div>
                          <div className="body-xs text-secondary mb-2">{sub.description}</div>
                          {sub.features && sub.features.length > 0 && (
                            <div className="body-xs text-tertiary">
                              {sub.features.length} feature{sub.features.length > 1 ? 's' : ''} listed
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSub ? 'Edit Sub-Service' : 'Add Sub-Service'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body flex-col gap-sm">
              <div className="input-group">
                <label>Name</label>
                <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Health Insurance" />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input className="input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description..." />
              </div>
              <div className="input-group">
                <label>Icon (Emoji)</label>
                <input className="input" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="🏥" />
              </div>
              <div className="input-group">
                <label>Features (comma separated)</label>
                <textarea className="textarea" rows={3} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Cashless Network, Maternity Cover, Tax Benefits..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSubService}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Service Modal */}
      {serviceModalOpen && (
        <div className="modal-overlay" onClick={() => setServiceModalOpen(false)}>
          <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="modal-close" onClick={() => setServiceModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body flex-col gap-sm">
              <div className="input-group">
                <label>Service Name</label>
                <input className="input" value={serviceFormData.name} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} placeholder="e.g. Real Estate" />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input className="input" value={serviceFormData.description} onChange={e => setServiceFormData({...serviceFormData, description: e.target.value})} placeholder="Brief description..." />
              </div>
              <div className="input-group">
                <label>Icon (Emoji)</label>
                <input className="input" value={serviceFormData.icon} onChange={e => setServiceFormData({...serviceFormData, icon: e.target.value})} placeholder="🏢" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setServiceModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveService}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
