// src/components/Dashboard/NewShipmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import {
  MapPin,
  Package,
  Truck,
  Clock,
  Phone,
  Mail,
  Building,
  Home,
  AlertTriangle,
  FileText,
  Plane,
  Calendar,
  MessageSquare
} from 'lucide-react';
import './NewShipmentForm.css';

const NewShipmentForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupType: 'dropoff',
    from: { 
      name: currentUser?.displayName || '', 
      phone: '',
      email: currentUser?.email || '',
      address: '', 
      city: '', 
      zip: '', 
      country: 'United States',
      locationType: 'residential'
    },
    to: { 
      name: '', 
      phone: '',
      email: '',
      address: '', 
      city: '', 
      zip: '', 
      country: 'United Kingdom',
      locationType: 'residential'
    },
    package: { 
      description: '',
      category: 'general',
      weight: '',
      length: '',
      width: '',
      height: '',
      contents: '',
      value: '',
      requiresClearance: false
    },
    shipment: {
      type: 'standard',
      notes: '',
      specialRequirements: '',
      requiresAirTransport: false,
      requiresGroundTransport: true,
      preferredPickupDate: '',
      preferredDeliveryDate: '',
      contactPreference: 'email'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France',
    'Australia', 'Japan', 'China', 'UAE', 'South Africa',
    'Kenya', 'Nigeria', 'India', 'Brazil', 'Mexico'
  ];

  const handleChange = (e, section, field) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const validateForm = () => {
    const errors = [];
    const { from, to, package: pkg, shipment } = formData;

    if (!from.name.trim()) errors.push('Sender name is required');
    if (!from.phone.trim()) errors.push('Sender phone is required');
    if (!from.email.trim() || !/\S+@\S+\.\S+/.test(from.email)) errors.push('Valid sender email is required');
    if (!from.address.trim()) errors.push('Sender address is required');
    if (!from.city.trim()) errors.push('Sender city is required');

    if (!to.name.trim()) errors.push('Recipient name is required');
    if (!to.phone.trim()) errors.push('Recipient phone is required');
    if (!to.email.trim() || !/\S+@\S+\.\S+/.test(to.email)) errors.push('Valid recipient email is required');
    if (!to.address.trim()) errors.push('Recipient address is required');
    if (!to.city.trim()) errors.push('Recipient city is required');

    if (!pkg.description.trim()) errors.push('Package description is required');
    if (!pkg.weight || parseFloat(pkg.weight) < 0.1) errors.push('Weight must be at least 0.1 kg');
    if (!pkg.length || parseInt(pkg.length) < 1) errors.push('Length must be at least 1 cm');
    if (!pkg.width || parseInt(pkg.width) < 1) errors.push('Width must be at least 1 cm');
    if (!pkg.height || parseInt(pkg.height) < 1) errors.push('Height must be at least 1 cm');
    if (pkg.requiresClearance && !pkg.contents.trim()) errors.push('Customs contents declaration is required');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitStatus('error');
      setSubmitMessage(errors[0]);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const shipmentData = {
        userId: currentUser.uid,
        status: 'pending_review',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...formData
      };

      const docRef = await addDoc(collection(db, 'shipments'), shipmentData);

      setSubmitStatus('success');
      setSubmitMessage(`Request submitted successfully! Your shipment ID is: ${docRef.id}`);
      setTimeout(() => navigate('/dashboard/shipments'), 2000);
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-shipment-page">
      <div className="form-container">
        <div className="form-header">
          <Package className="header-icon" />
          <h1>Submit Shipment Request</h1>
          <p>We’ll review your details and send a confirmed quote within 2 business hours.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pickup Method */}
          {/* <div className="form-section">
            <div className="section-title">
              <MapPin size={20} />
              <h3>1. Collection Method</h3>
            </div>
            <div className="radio-group horizontal">
              <label>
                <input
                  type="radio"
                  name="pickupType"
                  value="dropoff"
                  checked={formData.pickupType === 'dropoff'}
                  onChange={(e) => setFormData({ ...formData, pickupType: e.target.value })}
                />
                <span>Drop-off at Hub</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="pickupType"
                  value="pickup"
                  checked={formData.pickupType === 'pickup'}
                  onChange={(e) => setFormData({ ...formData, pickupType: e.target.value })}
                />
                <span>Schedule Pickup</span>
              </label>
            </div>
          </div> */}

          {/* Pickup Method */}
          <div className="form-section">
            <div className="section-title">
              <MapPin size={20} />
              <h3>1. Collection Method</h3>
            </div>
            <div className="radio-group horizontal">
              <label className={`radio-option ${formData.pickupType === 'dropoff' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="pickupType"
                  value="dropoff"
                  checked={formData.pickupType === 'dropoff'}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupType: e.target.value }))}
                />
                <div className="radio-content">
                  <strong>Drop-off at Hub</strong>
                  <p>Bring your package to one of our local hubs</p>
                </div>
              </label>
              <label className={`radio-option ${formData.pickupType === 'pickup' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="pickupType"
                  value="pickup"
                  checked={formData.pickupType === 'pickup'}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupType: e.target.value }))}
                />
                <div className="radio-content">
                  <strong>Schedule Pickup</strong>
                  <p>We’ll collect from your location</p>
                </div>
              </label>
            </div>
          </div>

          {/* Addresses */}
          <div className="form-section">
            <div className="section-title">
              <Truck size={20} />
              <h3>2. Addresses</h3>
            </div>
            <div className="address-grid">
              <div className="address-card">
                <div className="card-header">
                  <Home size={16} />
                  <h4>Sender (Pickup)</h4>
                </div>
                <InputField 
                  icon={<Mail size={16} />}
                  placeholder="Full Name *" 
                  value={formData.from.name} 
                  onChange={(e) => handleChange(e, 'from', 'name')} 
                />
                <InputField 
                  icon={<Phone size={16} />}
                  placeholder="Phone *" 
                  value={formData.from.phone} 
                  onChange={(e) => handleChange(e, 'from', 'phone')} 
                />
                <InputField 
                  icon={<Mail size={16} />}
                  type="email"
                  placeholder="Email *" 
                  value={formData.from.email} 
                  onChange={(e) => handleChange(e, 'from', 'email')} 
                />
                <InputField 
                  icon={<MapPin size={16} />}
                  placeholder="Street Address *" 
                  value={formData.from.address} 
                  onChange={(e) => handleChange(e, 'from', 'address')} 
                />
                <div className="city-zip">
                  <InputField 
                    placeholder="City *" 
                    value={formData.from.city} 
                    onChange={(e) => handleChange(e, 'from', 'city')} 
                  />
                  <InputField 
                    placeholder="ZIP/Postal" 
                    value={formData.from.zip} 
                    onChange={(e) => handleChange(e, 'from', 'zip')} 
                  />
                </div>
                <select 
                  value={formData.from.country} 
                  onChange={(e) => handleChange(e, 'from', 'country')}
                  className="country-select"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="location-type-toggle">
                  <Building size={16} />
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.from.locationType === 'business'}
                      onChange={(e) => handleChange(e, 'from', 'locationType', e.target.checked ? 'business' : 'residential')}
                    />
                    Business Location
                  </label>
                </div>
              </div>

              <div className="address-card">
                <div className="card-header">
                  <Home size={16} />
                  <h4>Recipient (Delivery)</h4>
                </div>
                <InputField 
                  icon={<Mail size={16} />}
                  placeholder="Full Name *" 
                  value={formData.to.name} 
                  onChange={(e) => handleChange(e, 'to', 'name')} 
                />
                <InputField 
                  icon={<Phone size={16} />}
                  placeholder="Phone *" 
                  value={formData.to.phone} 
                  onChange={(e) => handleChange(e, 'to', 'phone')} 
                />
                <InputField 
                  icon={<Mail size={16} />}
                  type="email"
                  placeholder="Email *" 
                  value={formData.to.email} 
                  onChange={(e) => handleChange(e, 'to', 'email')} 
                />
                <InputField 
                  icon={<MapPin size={16} />}
                  placeholder="Street Address *" 
                  value={formData.to.address} 
                  onChange={(e) => handleChange(e, 'to', 'address')} 
                />
                <div className="city-zip">
                  <InputField 
                    placeholder="City *" 
                    value={formData.to.city} 
                    onChange={(e) => handleChange(e, 'to', 'city')} 
                  />
                  <InputField 
                    placeholder="ZIP/Postal" 
                    value={formData.to.zip} 
                    onChange={(e) => handleChange(e, 'to', 'zip')} 
                  />
                </div>
                <select 
                  value={formData.to.country} 
                  onChange={(e) => handleChange(e, 'to', 'country')}
                  className="country-select"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="location-type-toggle">
                  <Building size={16} />
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.to.locationType === 'business'}
                      onChange={(e) => handleChange(e, 'to', 'locationType', e.target.checked ? 'business' : 'residential')}
                    />
                    Business Location
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="form-section">
            <div className="section-title">
              <Package size={20} />
              <h3>3. Package Information</h3>
            </div>
            
            <div className="form-row">
              <label>Category</label>
              <select 
                value={formData.package.category}
                onChange={(e) => handleChange(e, 'package', 'category')}
                className="category-select"
              >
                <option value="general">General Goods</option>
                <option value="fragile">Fragile</option>
                <option value="perishable">Perishable</option>
                <option value="hazardous">Hazardous (requires approval)</option>
                <option value="documents">Documents</option>
              </select>
            </div>

            <TextareaField 
              icon={<FileText size={16} />}
              placeholder="Describe the contents (e.g., electronics, clothing, machinery) *" 
              value={formData.package.description}
              onChange={(e) => handleChange(e, 'package', 'description')}
              rows="3"
            />

            {formData.package.category === 'hazardous' && (
              <div className="alert warning">
                <AlertTriangle size={16} />
                Hazardous materials require special handling and documentation. Our team will contact you.
              </div>
            )}

            <div className="dimensions-row">
              <InputField 
                type="number" 
                placeholder="Weight (kg) *" 
                value={formData.package.weight}
                onChange={(e) => handleChange(e, 'package', 'weight')}
                min="0.1"
                step="0.1"
              />
              <InputField 
                type="number" 
                placeholder="L (cm) *" 
                value={formData.package.length}
                onChange={(e) => handleChange(e, 'package', 'length')}
                min="1"
              />
              <InputField 
                type="number" 
                placeholder="W (cm) *" 
                value={formData.package.width}
                onChange={(e) => handleChange(e, 'package', 'width')}
                min="1"
              />
              <InputField 
                type="number" 
                placeholder="H (cm) *" 
                value={formData.package.height}
                onChange={(e) => handleChange(e, 'package', 'height')}
                min="1"
              />
            </div>

            <InputField 
              icon={<Package size={16} />}
              placeholder="Declared Value (for insurance)"
              value={formData.package.value}
              onChange={(e) => handleChange(e, 'package', 'value')}
            />

            <div className="form-row-checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.package.requiresClearance}
                  onChange={(e) => handleChange(e, 'package', 'requiresClearance')}
                />
                This shipment requires customs clearance
              </label>
            </div>

            {formData.package.requiresClearance && (
              <TextareaField 
                icon={<FileText size={16} />}
                placeholder="List all items, quantities, and values..."
                value={formData.package.contents}
                onChange={(e) => handleChange(e, 'package', 'contents')}
                rows="3"
              />
            )}
          </div>

          {/* Transport & Schedule */}
          <div className="form-section">
            <div className="section-title">
              <Clock size={20} />
              <h3>4. Transport & Schedule</h3>
            </div>

            <div className="transport-options">
              <div className="transport-option">
                <Plane size={16} />
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.shipment.requiresAirTransport}
                    onChange={(e) => handleChange(e, 'shipment', 'requiresAirTransport')}
                  />
                  Air Transport
                </label>
              </div>
              <div className="transport-option">
                <Truck size={16} />
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.shipment.requiresGroundTransport}
                    onChange={(e) => handleChange(e, 'shipment', 'requiresGroundTransport')}
                  />
                  Ground Transport
                </label>
              </div>
            </div>

            <div className="date-row">
              <InputField 
                icon={<Calendar size={16} />}
                type="date" 
                label="Preferred Pickup Date"
                value={formData.shipment.preferredPickupDate}
                onChange={(e) => handleChange(e, 'shipment', 'preferredPickupDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              <InputField 
                icon={<Calendar size={16} />}
                type="date" 
                label="Preferred Delivery Date"
                value={formData.shipment.preferredDeliveryDate}
                onChange={(e) => handleChange(e, 'shipment', 'preferredDeliveryDate')}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-row">
              <label>Shipment Type</label>
              <select 
                value={formData.shipment.type}
                onChange={(e) => handleChange(e, 'shipment', 'type')}
                className="type-select"
              >
                <option value="standard">Standard</option>
                <option value="express">Express (24–72h)</option>
                <option value="urgent">Urgent (Same/Next Day)</option>
              </select>
            </div>

            <div className="form-row">
              <label>Contact Preference</label>
              <select 
                value={formData.shipment.contactPreference}
                onChange={(e) => handleChange(e, 'shipment', 'contactPreference')}
                className="contact-select"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            <TextareaField 
              icon={<MessageSquare size={16} />}
              placeholder="Special instructions or requirements..."
              value={formData.shipment.specialRequirements}
              onChange={(e) => handleChange(e, 'shipment', 'specialRequirements')}
              rows="3"
            />

            <TextareaField 
              icon={<MessageSquare size={16} />}
              placeholder="Additional notes"
              value={formData.shipment.notes}
              onChange={(e) => handleChange(e, 'shipment', 'notes')}
              rows="2"
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting Request...
              </>
            ) : (
              'Submit Shipment Request'
            )}
          </button>

          {/* Status */}
          {submitStatus === 'success' && (
            <div className="alert success">
              {submitMessage}
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="alert error">
              ❌ {submitMessage}
            </div>
          )}

          <div className="help-text">
            <p>After submission, our logistics team will review your request and send a confirmed quote within 2 business hours.</p>
            <p>📞 Need urgent help? Call us at <strong>+1 (800) SWIFT-123</strong></p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input with Icon
const InputField = ({ icon, label, ...props }) => (
  <div className="input-with-icon">
    {icon && <span className="input-icon">{icon}</span>}
    {label && <label>{label}</label>}
    <input {...props} />
  </div>
);

// Reusable Textarea with Icon
const TextareaField = ({ icon, label, ...props }) => (
  <div className="input-with-icon">
    {icon && <span className="input-icon">{icon}</span>}
    {label && <label>{label}</label>}
    <textarea {...props} />
  </div>
);

export default NewShipmentForm;