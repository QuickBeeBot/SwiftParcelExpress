// src/components/Admin/AdminCreateDeliveryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  User,
  Package,
  Route as RouteIcon,
  ClipboardCheck,
  Plus,
  Trash2,
  Truck,
  Plane,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import './AdminCreateDeliveryPage.css';

const AdminCreateDeliveryPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  const [packages, setPackages] = useState([{
    id: 1,
    description: '',
    category: 'general',
    weight: '',
    length: '',
    width: '',
    height: '',
    value: '',
    requiresClearance: false,
    contents: ''
  }]);

  const [route, setRoute] = useState({
    pickup: {
      location: '',
      facility: '',
      scheduledTime: ''
    },
    airLegs: [{
      id: 1,
      flightNumber: '',
      aircraft: '',
      departureAirport: '',
      departureTimeScheduled: '',
      arrivalAirport: '',
      arrivalTimeScheduled: ''
    }],
    delivery: {
      location: '',
      facility: '',
      scheduledTime: ''
    }
  });

  const [shipment, setShipment] = useState({
    serviceType: 'standard',
    priority: 'medium',
    instructions: '',
    contactPreference: 'email',
    insurance: true,
    signatureRequired: true
  });

  // Add package
  const addPackage = () => {
    if (packages.length >= 10) return;
    setPackages([...packages, {
      id: packages.length + 1,
      description: '',
      category: 'general',
      weight: '',
      length: '',
      width: '',
      height: '',
      value: '',
      requiresClearance: false,
      contents: ''
    }]);
  };

  // Remove package
  const removePackage = (id) => {
    if (packages.length <= 1) return;
    setPackages(packages.filter(p => p.id !== id));
  };

  // Add air leg
  const addAirLeg = () => {
    if (route.airLegs.length >= 5) return;
    setRoute(prev => ({
      ...prev,
      airLegs: [
        ...prev.airLegs,
        {
          id: prev.airLegs.length + 1,
          flightNumber: '',
          aircraft: '',
          departureAirport: '',
          departureTimeScheduled: '',
          arrivalAirport: '',
          arrivalTimeScheduled: ''
        }
      ]
    }));
  };

  // Remove air leg
  const removeAirLeg = (id) => {
    if (route.airLegs.length <= 1) return;
    setRoute(prev => ({
      ...prev,
      airLegs: prev.airLegs.filter(leg => leg.id !== id)
    }));
  };

  // Validate current step
  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!client.name || !client.email) {
          setError('Client name and email are required.');
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(client.email)) {
          setError('Please enter a valid email address.');
          return false;
        }
        return true;
      case 2:
        if (packages.some(p => !p.description || !p.weight || !p.length || !p.width || !p.height)) {
          setError('All package fields are required.');
          return false;
        }
        return true;
      case 3:
        if (!route.pickup.location || !route.pickup.scheduledTime) {
          setError('Pickup location and time are required.');
          return false;
        }
        if (route.airLegs.some(leg => 
          !leg.flightNumber || 
          !leg.departureAirport || 
          !leg.departureTimeScheduled || 
          !leg.arrivalAirport || 
          !leg.arrivalTimeScheduled
        )) {
          setError('All flight details are required.');
          return false;
        }
        if (!route.delivery.location || !route.delivery.scheduledTime) {
          setError('Delivery location and time are required.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Go to next step
  const goToNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    }
  };

  // Go to previous step
  const goToPrev = () => {
    setStep(step - 1);
    setError('');
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const now = new Date();
      const yearSuffix = now.getFullYear().toString().slice(-2);
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const trackingNumber = `SP${yearSuffix}${randomPart}`;

      const shipmentData = {
        trackingNumber,
        status: 'pending_review',
        createdAt: serverTimestamp(),
        createdBy: 'admin',
        client: { ...client, createdAt: now.toISOString() },
        packages: packages.map(p => ({ ...p, id: p.id.toString() })),
        route: {
          ...route,
          totalLegs: 2 + route.airLegs.length,
          estimatedTransitTime: calculateTransitTime(route)
        },
        ...shipment,
        events: [{
          type: 'scheduled',
          description: 'Delivery scheduled',
          timestamp: now.toISOString(),
          location: 'System'
        }]
      };

      const docRef = await addDoc(collection(db, 'shipments'), shipmentData);
      setSuccess(`Delivery created successfully! Tracking ID: ${trackingNumber}`);
      
      setTimeout(() => navigate('/admin/shipments'), 2000);
    } catch (err) {
      console.error('Delivery creation failed:', err);
      setError('Failed to create delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Calculate transit time
  const calculateTransitTime = (route) => {
    try {
      const pickup = new Date(route.pickup.scheduledTime);
      const delivery = new Date(route.delivery.scheduledTime);
      const diff = delivery - pickup;
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + ' days';
    } catch {
      return '—';
    }
  };

  // Step config
  const steps = [
    { id: 1, label: 'Client', icon: User },
    { id: 2, label: 'Packages', icon: Package },
    { id: 3, label: 'Route', icon: RouteIcon },
    { id: 4, label: 'Review', icon: ClipboardCheck }
  ];

  return (
    <div className="admin-create-delivery">
      <div className="page-header">
        <h1>Create New Delivery</h1>
        <p>Enter client and shipment details for manual delivery creation</p>
      </div>

      {/* Status */}
      {error && (
        <div className="alert error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="alert success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Progress Stepper */}
      <div className="progress-stepper">
        {steps.map((s, i) => (
          <div key={s.id} className={`step ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}>
            <div className="step-number">
              {step > s.id ? <CheckCircle size={16} /> : s.id}
            </div>
            <div className="step-label">{s.label}</div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${step > s.id ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="form-container">
        {/* Step 1: Client */}
        {step === 1 && (
          <div className="step-card">
            <div className="step-header">
              <div className="step-title">
                <User size={24} />
                <h2>Client Information</h2>
              </div>
            </div>
            <div className="step-body">
              <div className="form-grid">
                <InputField 
                  label="Full Name *" 
                  value={client.name}
                  onChange={(e) => setClient({...client, name: e.target.value})}
                  placeholder="e.g., John Doe"
                />
                <InputField 
                  label="Email *" 
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({...client, email: e.target.value})}
                  placeholder="john@example.com"
                />
                <InputField 
                  label="Phone" 
                  type="tel"
                  value={client.phone}
                  onChange={(e) => setClient({...client, phone: e.target.value})}
                  placeholder="+1 555 123 4567"
                />
                <InputField 
                  label="Company" 
                  value={client.company}
                  onChange={(e) => setClient({...client, company: e.target.value})}
                  placeholder="Swift Logistics Ltd"
                />
              </div>
              <div className="step-actions">
                <button className="btn-secondary" onClick={() => navigate('/admin/shipments')}>
                  <ArrowLeft size={16} /> Cancel
                </button>
                <button className="btn-primary" onClick={goToNext}>
                  Next: Packages <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Packages */}
        {step === 2 && (
          <div className="step-card">
            <div className="step-header">
              <div className="step-title">
                <Package size={24} />
                <h2>Package Details</h2>
              </div>
              <button className="btn-add" onClick={addPackage} disabled={packages.length >= 10}>
                <Plus size={16} /> Add Package
              </button>
            </div>
            <div className="step-body">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <h3>Package {index + 1}</h3>
                    {packages.length > 1 && (
                      <button className="btn-remove" onClick={() => removePackage(pkg.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="form-grid">
                    <InputField 
                      label="Description *" 
                      value={pkg.description}
                      onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, description: e.target.value} : p))}
                      placeholder="e.g., Electronics, documents"
                    />
                    <div className="input-group">
                      <label>Category</label>
                      <select
                        value={pkg.category}
                        onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, category: e.target.value} : p))}
                      >
                        <option value="general">General Goods</option>
                        <option value="fragile">Fragile</option>
                        <option value="perishable">Perishable</option>
                        <option value="hazardous">Hazardous</option>
                        <option value="documents">Documents</option>
                      </select>
                    </div>
                    <div className="dimensions-row">
                      <InputField 
                        label="Weight (kg) *" 
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={pkg.weight}
                        onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, weight: e.target.value} : p))}
                      />
                      <InputField 
                        label="L (cm) *" 
                        type="number"
                        min="1"
                        value={pkg.length}
                        onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, length: e.target.value} : p))}
                      />
                      <InputField 
                        label="W (cm) *" 
                        type="number"
                        min="1"
                        value={pkg.width}
                        onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, width: e.target.value} : p))}
                      />
                      <InputField 
                        label="H (cm) *" 
                        type="number"
                        min="1"
                        value={pkg.height}
                        onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, height: e.target.value} : p))}
                      />
                    </div>
                    <InputField 
                      label="Declared Value ($)" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={pkg.value}
                      onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, value: e.target.value} : p))}
                      placeholder="500.00"
                    />
                    <div className="input-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={pkg.requiresClearance}
                          onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, requiresClearance: e.target.checked} : p))}
                        />
                        <span>Requires Customs Clearance</span>
                      </label>
                    </div>
                    {pkg.requiresClearance && (
                      <div className="input-group">
                        <label>Customs Declaration (Required)</label>
                        <textarea
                          value={pkg.contents}
                          onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? {...p, contents: e.target.value} : p))}
                          placeholder="e.g., 2 laptops ($2000), 5 books ($100)"
                          rows="3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="step-actions">
                <button className="btn-secondary" onClick={goToPrev}>
                  <ArrowLeft size={16} /> Back: Client
                </button>
                <button className="btn-primary" onClick={goToNext}>
                  Next: Route <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Route */}
        {step === 3 && (
          <div className="step-card">
            <div className="step-header">
              <div className="step-title">
                <RouteIcon size={24} />
                <h2>Delivery Route</h2>
              </div>
            </div>
            <div className="step-body">
              {/* Pickup */}
              <div className="route-section">
                <div className="section-header">
                  <div className="section-icon road"><Truck size={20} /></div>
                  <h3>Pickup (Road Transport)</h3>
                </div>
                <div className="form-grid">
                  <InputField 
                    label="Pickup Location *" 
                    value={route.pickup.location}
                    onChange={(e) => setRoute({...route, pickup: {...route.pickup, location: e.target.value}})}
                    placeholder="e.g., Nairobi CBD"
                  />
                  <InputField 
                    label="Facility *" 
                    value={route.pickup.facility}
                    onChange={(e) => setRoute({...route, pickup: {...route.pickup, facility: e.target.value}})}
                    placeholder="e.g., SwiftParcel Hub Nairobi"
                  />
                  <InputField 
                    label="Scheduled Time *" 
                    type="datetime-local"
                    value={route.pickup.scheduledTime}
                    onChange={(e) => setRoute({...route, pickup: {...route.pickup, scheduledTime: e.target.value}})}
                  />
                  <InputField 
                    label="Actual Time (if known)" 
                    type="datetime-local"
                    value={route.pickup.actualTime}
                    onChange={(e) => setRoute({...route, pickup: {...route.pickup, actualTime: e.target.value}})}
                  />
                </div>
              </div>

              {/* Air Legs */}
              <div className="route-section">
                <div className="section-header">
                  <div className="section-icon air"><Plane size={20} /></div>
                  <div className="section-title">
                    <h3>Air Transport ({route.airLegs.length} leg{route.airLegs.length !== 1 ? 's' : ''})</h3>
                    <button 
                      className="btn-add-leg"
                      onClick={addAirLeg}
                      disabled={route.airLegs.length >= 5}
                    >
                      <Plus size={16} /> Add Leg
                    </button>

                    {/* <button 
                    className="btn-add-leg"
                    onClick={addAirLeg}
                    disabled={route.airLegs.length >= 5}
                  >
                    <i className="fas fa-plus"></i> Add Leg
                  </button> */}
                  </div>
                </div>
                {route.airLegs.map((leg, index) => (
                  <div key={leg.id} className="air-leg">
                    <div className="air-leg-header">
                      <h4>Flight {index + 1}</h4>
                      {route.airLegs.length > 1 && (
                        <button 
                          className="btn-remove"
                          onClick={() => removeAirLeg(leg.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <InputField 
                        label="Flight Number *" 
                        value={leg.flightNumber}
                        onChange={(e) => setRoute(prev => ({
                          ...prev,
                          airLegs: prev.airLegs.map(l => l.id === leg.id ? {...l, flightNumber: e.target.value} : l)
                        }))}
                        placeholder="e.g., KQ101"
                      />
                      <InputField 
                        label="Aircraft" 
                        value={leg.aircraft}
                        onChange={(e) => setRoute(prev => ({
                          ...prev,
                          airLegs: prev.airLegs.map(l => l.id === leg.id ? {...l, aircraft: e.target.value} : l)
                        }))}
                        placeholder="e.g., Boeing 787"
                      />
                      <InputField 
                        label="Departure Airport *" 
                        value={leg.departureAirport}
                        onChange={(e) => setRoute(prev => ({
                          ...prev,
                          airLegs: prev.airLegs.map(l => l.id === leg.id ? {...l, departureAirport: e.target.value} : l)
                        }))}
                        placeholder="e.g., NBO"
                      />
                      <InputField 
                        label="Departure Time (Scheduled) *" 
                        type="datetime-local"
                        value={leg.departureTimeScheduled}
                        onChange={(e) => setRoute(prev => ({
                          ...prev,
                          airLegs: prev.airLegs.map(l => l.id === leg.id ? {...l, departureTimeScheduled: e.target.value} : l)
                        }))}
                      />
                      <InputField 
                        label="Arrival Airport *" 
                        value={leg.arrivalAirport}
                        onChange={(e) => setRoute(prev => ({
                          ...prev,
                          airLegs: prev.airLegs.map(l => l.id === leg.id ? {...l, arrivalAirport: e.target.value} : l)
                        }))}
                        placeholder="e.g., LHR"
                      />
                      <InputField 
                        label="Arrival Time (Scheduled) *" 
                        type="datetime-local"
                        value={leg.arrivalTimeScheduled}
                        onChange={(e) => setRoute(prev => ({
                          ...prev,
                          airLegs: prev.airLegs.map(l => l.id === leg.id ? {...l, arrivalTimeScheduled: e.target.value} : l)
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery */}
              <div className="route-section">
                <div className="section-header">
                  <div className="section-icon road"><Truck size={20} /></div>
                  <h3>Final Delivery (Road Transport)</h3>
                </div>
                <div className="form-grid">
                  <InputField 
                    label="Delivery Location *" 
                    value={route.delivery.location}
                    onChange={(e) => setRoute({...route, delivery: {...route.delivery, location: e.target.value}})}
                    placeholder="e.g., London City"
                  />
                  <InputField 
                    label="Facility *" 
                    value={route.delivery.facility}
                    onChange={(e) => setRoute({...route, delivery: {...route.delivery, facility: e.target.value}})}
                    placeholder="e.g., SwiftParcel Hub London"
                  />
                  <InputField 
                    label="Scheduled Time *" 
                    type="datetime-local"
                    value={route.delivery.scheduledTime}
                    onChange={(e) => setRoute({...route, delivery: {...route.delivery, scheduledTime: e.target.value}})}
                  />
                  <InputField 
                    label="Actual Time (if known)" 
                    type="datetime-local"
                    value={route.delivery.actualTime}
                    onChange={(e) => setRoute({...route, delivery: {...route.delivery, actualTime: e.target.value}})}
                  />
                </div>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={goToPrev}>
                  <ArrowLeft size={16} /> Back: Packages
                </button>
                <button className="btn-primary" onClick={goToNext}>
                  Next: Review <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="step-card">
            <div className="step-header">
              <div className="step-title">
                <ClipboardCheck size={24} />
                <h2>Review & Submit</h2>
              </div>
            </div>
            <div className="step-body">
              <div className="review-section">
                <h3>Client</h3>
                <div className="review-grid">
                  <div><strong>Name:</strong> {client.name}</div>
                  <div><strong>Email:</strong> {client.email}</div>
                  <div><strong>Phone:</strong> {client.phone || '—'}</div>
                  <div><strong>Company:</strong> {client.company || '—'}</div>
                </div>
              </div>

              <div className="review-section">
                <h3>Packages ({packages.length})</h3>
                {packages.map((pkg, i) => (
                  <div key={pkg.id} className="package-summary">
                    <div><strong>Package {i + 1}:</strong> {pkg.description}</div>
                    <div>{pkg.weight} kg | {pkg.length} × {pkg.width} × {pkg.height} cm</div>
                    <div>{pkg.category} {pkg.requiresClearance && ' • Customs Clearance'}</div>
                  </div>
                ))}
              </div>

              <div className="review-section">
                <h3>Route</h3>
                <div className="route-summary">
                  <div className="route-leg">
                    <div className="leg-icon road small"><Truck size={16} /></div>
                    <div>
                      <strong>Pickup:</strong> {route.pickup.location} @ {route.pickup.scheduledTime ? new Date(route.pickup.scheduledTime).toLocaleString() : '—'}
                    </div>
                  </div>
                  
                  {route.airLegs.map((leg, i) => (
                    <div key={leg.id} className="route-leg">
                      <div className="leg-icon air small"><Plane size={16} /></div>
                      <div>
                        <strong>Flight {i + 1}:</strong> {leg.flightNumber} | {leg.departureAirport} → {leg.arrivalAirport}<br/>
                        {leg.departureTimeScheduled ? new Date(leg.departureTimeScheduled).toLocaleString() : '—'} → {leg.arrivalTimeScheduled ? new Date(leg.arrivalTimeScheduled).toLocaleString() : '—'}
                      </div>
                    </div>
                  ))}
                  
                  <div className="route-leg">
                    <div className="leg-icon road small"><Truck size={16} /></div>
                    <div>
                      <strong>Delivery:</strong> {route.delivery.location} @ {route.delivery.scheduledTime ? new Date(route.delivery.scheduledTime).toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={goToPrev}>
                  <ArrowLeft size={16} /> Back: Route
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Delivery'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const InputField = ({ label, ...props }) => (
  <div className="input-group">
    <label>{label}</label>
    {props.type === 'checkbox' ? (
      <label className="checkbox-label">
        <input type="checkbox" {...props} />
        <span>{props.placeholder}</span>
      </label>
    ) : (
      <input {...props} />
    )}
  </div>
);

export default AdminCreateDeliveryPage;








// // src/components/Admin/AdminCreateDeliveryPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { db } from '../../lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import './AdminCreateDeliveryPage.css';

// const AdminCreateDeliveryPage = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Form state
//   const [client, setClient] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     company: ''
//   });

//   const [packages, setPackages] = useState([{
//     id: 1,
//     description: '',
//     category: 'general',
//     weight: '',
//     length: '',
//     width: '',
//     height: '',
//     value: '',
//     requiresClearance: false,
//     contents: ''
//   }]);

//   const [route, setRoute] = useState({
//     // Pickup (Road 1)
//     pickup: {
//       type: 'road',
//       location: '', // e.g., Nairobi CBD
//       facility: '', // e.g., SwiftParcel Hub
//       scheduledTime: '',
//       actualTime: ''
//     },
//     // Air Legs (1–5)
//     airLegs: [{
//       id: 1,
//       flightNumber: '',
//       aircraft: '',
//       departureAirport: '',
//       departureTimeScheduled: '',
//       departureTimeActual: '',
//       arrivalAirport: '',
//       arrivalTimeScheduled: '',
//       arrivalTimeActual: ''
//     }],
//     // Delivery (Road 2)
//     delivery: {
//       type: 'road',
//       location: '', // e.g., London City
//       facility: '', // e.g., Local Partner Hub
//       scheduledTime: '',
//       actualTime: ''
//     }
//   });

//   const [shipment, setShipment] = useState({
//     serviceType: 'standard',
//     priority: 'medium',
//     instructions: '',
//     contactPreference: 'email',
//     insurance: true,
//     signatureRequired: true
//   });

//   // Add package
//   const addPackage = () => {
//     if (packages.length >= 10) return;
//     setPackages([...packages, {
//       id: packages.length + 1,
//       description: '',
//       category: 'general',
//       weight: '',
//       length: '',
//       width: '',
//       height: '',
//       value: '',
//       requiresClearance: false,
//       contents: ''
//     }]);
//   };

//   // Remove package
//   const removePackage = (id) => {
//     if (packages.length <= 1) return;
//     setPackages(packages.filter(p => p.id !== id));
//   };

//   // Add air leg
//   const addAirLeg = () => {
//     if (route.airLegs.length >= 5) return;
//     setRoute(prev => ({
//       ...prev,
//       airLegs: [
//         ...prev.airLegs,
//         {
//           id: prev.airLegs.length + 1,
//           flightNumber: '',
//           aircraft: '',
//           departureAirport: '',
//           departureTimeScheduled: '',
//           departureTimeActual: '',
//           arrivalAirport: '',
//           arrivalTimeScheduled: '',
//           arrivalTimeActual: ''
//         }
//       ]
//     }));
//   };

//   // Remove air leg
//   const removeAirLeg = (id) => {
//     if (route.airLegs.length <= 1) return;
//     setRoute(prev => ({
//       ...prev,
//       airLegs: prev.airLegs.filter(leg => leg.id !== id)
//     }));
//   };

//   // Validate
//   const validate = () => {
//     if (!client.name || !client.email) {
//       setError('Client name and email are required.');
//       return false;
//     }
//     if (!/^\S+@\S+\.\S+$/.test(client.email)) {
//       setError('Please enter a valid email address.');
//       return false;
//     }
//     if (packages.some(p => !p.description || !p.weight || !p.length || !p.width || !p.height)) {
//       setError('All package fields are required.');
//       return false;
//     }
//     if (!route.pickup.location || !route.pickup.scheduledTime) {
//       setError('Pickup location and time are required.');
//       return false;
//     }
//     if (route.airLegs.some(leg => 
//       !leg.flightNumber || 
//       !leg.departureAirport || 
//       !leg.departureTimeScheduled || 
//       !leg.arrivalAirport || 
//       !leg.arrivalTimeScheduled
//     )) {
//       setError('All flight details are required.');
//       return false;
//     }
//     if (!route.delivery.location || !route.delivery.scheduledTime) {
//       setError('Delivery location and time are required.');
//       return false;
//     }
//     return true;
//   };

//   // Submit
//   const handleSubmit = async () => {
//     if (!validate()) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       // Generate tracking ID: SP + YY + 6-digit
//       const now = new Date();
//       const yearSuffix = now.getFullYear().toString().slice(-2);
//       const randomPart = Math.floor(100000 + Math.random() * 900000);
//       const trackingNumber = `SP${yearSuffix}${randomPart}`;

//       const shipmentData = {
//         // Core
//         trackingNumber,
//         status: 'pending_review',
//         createdAt: serverTimestamp(),
//         createdBy: 'admin_1',
        
//         // Client
//         client: {
//           ...client,
//           createdAt: now.toISOString()
//         },
        
//         // Packages
//         packages: packages.map(p => ({
//           ...p,
//           id: p.id.toString()
//         })),
        
//         // Route
//         route: {
//           ...route,
//           totalLegs: 2 + route.airLegs.length, // Road + Air + Road
//           estimatedTransitTime: calculateTransitTime(route)
//         },
        
//         // Shipment
//         ...shipment,
        
//         // Events (for timeline)
//         events: [
//           {
//             type: 'scheduled',
//             description: 'Delivery scheduled',
//             timestamp: now.toISOString(),
//             location: 'System'
//           }
//         ]
//       };

//       // Save to Firestore
//       const docRef = await addDoc(collection(db, 'shipments'), shipmentData);

//       // Success
//       setSuccess(`  Delivery created successfully! Tracking ID: ${trackingNumber}`);
      
//       // Reset
//       setTimeout(() => {
//         navigate(`/admin/shipments`);
//       }, 2000);

//     } catch (err) {
//       console.error('Delivery creation failed:', err);
//       setError('Failed to create delivery. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper: Calculate transit time
//   const calculateTransitTime = (route) => {
//     try {
//       const pickup = new Date(route.pickup.scheduledTime);
//       const lastLeg = route.airLegs[route.airLegs.length - 1];
//       const delivery = new Date(route.delivery.scheduledTime);
      
//       const diff = delivery - pickup;
//       return Math.ceil(diff / (1000 * 60 * 60 * 24)) + ' days';
//     } catch {
//       return '—';
//     }
//   };

//   return (
//     <div className="admin-create-delivery">
//       <div className="page-header">
//         <h1>Create New Delivery</h1>
//         <p>Enter client and shipment details for manual delivery creation</p>
//       </div>

//       {/* Status */}
//       {error && <div className="alert error">❌ {error}</div>}
//       {success && <div className="alert success">  {success}</div>}

//       {/* Steps */}
//       <div className="steps">
//         <button 
//           className={step >= 1 ? 'active' : ''}
//           onClick={() => setStep(1)}
//         >
//           <span>1</span> Client
//         </button>
//         <button 
//           className={step >= 2 ? 'active' : ''}
//           onClick={() => setStep(2)}
//         >
//           <span>2</span> Packages
//         </button>
//         <button 
//           className={step >= 3 ? 'active' : ''}
//           onClick={() => setStep(3)}
//         >
//           <span>3</span> Route
//         </button>
//         <button 
//           className={step >= 4 ? 'active' : ''}
//           onClick={() => setStep(4)}
//         >
//           <span>4</span> Review
//         </button>
//       </div>

//       <div className="form-container">
//         {/* Step 1: Client */}
//         {step === 1 && (
//           <div className="step-content">
//             <h2><i className="fas fa-user"></i> Client Information</h2>
//             <div className="form-grid">
//               <div className="form-groups">
//                 <label>Full Name *</label>
//                 <input
//                   type="text"
//                   value={client.name}
//                   onChange={(e) => setClient({...client, name: e.target.value})}
//                   placeholder="e.g., John Doe"
//                 />
//               </div>
//               <div className="form-groups">
//                 <label>Email *</label>
//                 <input
//                   type="email"
//                   value={client.email}
//                   onChange={(e) => setClient({...client, email: e.target.value})}
//                   placeholder="john@example.com"
//                 />
//               </div>
//               <div className="form-groups">
//                 <label>Phone</label>
//                 <input
//                   type="tel"
//                   value={client.phone}
//                   onChange={(e) => setClient({...client, phone: e.target.value})}
//                   placeholder="+1 555 123 4567"
//                 />
//               </div>
//               <div className="form-groups">
//                 <label>Company</label>
//                 <input
//                   type="text"
//                   value={client.company}
//                   onChange={(e) => setClient({...client, company: e.target.value})}
//                   placeholder="Swift Logistics Ltd"
//                 />
//               </div>
//             </div>

//             <div className="step-actions">
//               <button 
//                 className="btn-secondary"
//                 onClick={() => navigate('/admin/shipments')}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="btn-primarys"
//                 onClick={() => setStep(2)}
//               >
//                 Next: Packages
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Packages */}
//         {step === 2 && (
//           <div className="step-content">
//             <div className="section-headers">
//               <h2><i className="fas fa-boxes"></i> Package Details</h2>
//               <button className="btn-add" onClick={addPackage} disabled={packages.length >= 10}>
//                 <i className="fas fa-plus"></i> Add Package
//               </button>
//             </div>

//             {packages.map((pkg, index) => (
//               <div key={pkg.id} className="package-card">
//                 <div className="package-header">
//                   <h3>Package {index + 1}</h3>
//                   {packages.length > 1 && (
//                     <button 
//                       className="btn-remove"
//                       onClick={() => removePackage(pkg.id)}
//                     >
//                       <i className="fas fa-trash"></i>
//                     </button>
//                   )}
//                 </div>

//                 <div className="form-grid">
//                   <div className="form-groups">
//                     <label>Description *</label>
//                     <input
//                       type="text"
//                       value={pkg.description}
//                       onChange={(e) => setPackages(packages.map(p => 
//                         p.id === pkg.id ? {...p, description: e.target.value} : p
//                       ))}
//                       placeholder="e.g., Electronics, documents"
//                     />
//                   </div>
//                   <div className="form-groups">
//                     <label>Category</label>
//                     <select
//                       value={pkg.category}
//                       onChange={(e) => setPackages(packages.map(p => 
//                         p.id === pkg.id ? {...p, category: e.target.value} : p
//                       ))}
//                     >
//                       <option value="general">General Goods</option>
//                       <option value="fragile">Fragile</option>
//                       <option value="perishable">Perishable</option>
//                       <option value="hazardous">Hazardous</option>
//                       <option value="documents">Documents</option>
//                     </select>
//                   </div>
//                   <div className="dimensions-row">
//                     <div className="form-groups">
//                       <label>Weight (kg) *</label>
//                       <input
//                         type="number"
//                         min="0.1"
//                         step="0.1"
//                         value={pkg.weight}
//                         onChange={(e) => setPackages(packages.map(p => 
//                           p.id === pkg.id ? {...p, weight: e.target.value} : p
//                         ))}
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>L (cm) *</label>
//                       <input
//                         type="number"
//                         min="1"
//                         value={pkg.length}
//                         onChange={(e) => setPackages(packages.map(p => 
//                           p.id === pkg.id ? {...p, length: e.target.value} : p
//                         ))}
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>W (cm) *</label>
//                       <input
//                         type="number"
//                         min="1"
//                         value={pkg.width}
//                         onChange={(e) => setPackages(packages.map(p => 
//                           p.id === pkg.id ? {...p, width: e.target.value} : p
//                         ))}
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>H (cm) *</label>
//                       <input
//                         type="number"
//                         min="1"
//                         value={pkg.height}
//                         onChange={(e) => setPackages(packages.map(p => 
//                           p.id === pkg.id ? {...p, height: e.target.value} : p
//                         ))}
//                       />
//                     </div>
//                   </div>
//                   <div className="form-groups">
//                     <label>Declared Value ($)</label>
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={pkg.value}
//                       onChange={(e) => setPackages(packages.map(p => 
//                         p.id === pkg.id ? {...p, value: e.target.value} : p
//                       ))}
//                       placeholder="500.00"
//                     />
//                   </div>
//                   <div className="form-groups">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={pkg.requiresClearance}
//                         onChange={(e) => setPackages(packages.map(p => 
//                           p.id === pkg.id ? {...p, requiresClearance: e.target.checked} : p
//                         ))}
//                       />
//                       Requires Customs Clearance
//                     </label>
//                   </div>
//                   {pkg.requiresClearance && (
//                     <div className="form-groups">
//                       <label>Customs Declaration (Required)</label>
//                       <textarea
//                         value={pkg.contents}
//                         onChange={(e) => setPackages(packages.map(p => 
//                           p.id === pkg.id ? {...p, contents: e.target.value} : p
//                         ))}
//                         placeholder="e.g., 2 laptops ($2000), 5 books ($100)"
//                         rows="3"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}

//             <div className="step-actions">
//               <button 
//                 className="btn-secondary"
//                 onClick={() => setStep(1)}
//               >
//                 Back: Client
//               </button>
//               <button 
//                 className="btn-primarys"
//                 onClick={() => setStep(3)}
//               >
//                 Next: Route
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Route */}
//         {step === 3 && (
//           <div className="step-content">
//             <h2><i className="fas fa-route"></i> Delivery Route</h2>
            
//             {/* Pickup (Road 1) */}
//             <div className="leg-section">
//               <div className="leg-header">
//                 <div className="leg-icon road"><i className="fas fa-truck"></i></div>
//                 <h3>Pickup (Road Transport)</h3>
//               </div>
//               <div className="form-grid">
//                 <div className="form-groups">
//                   <label>Pickup Location *</label>
//                   <input
//                     type="text"
//                     value={route.pickup.location}
//                     onChange={(e) => setRoute({...route, pickup: {...route.pickup, location: e.target.value}})}
//                     placeholder="e.g., Nairobi CBD"
//                   />
//                 </div>
//                 <div className="form-groups">
//                   <label>Facility *</label>
//                   <input
//                     type="text"
//                     value={route.pickup.facility}
//                     onChange={(e) => setRoute({...route, pickup: {...route.pickup, facility: e.target.value}})}
//                     placeholder="e.g., SwiftParcel Hub Nairobi"
//                   />
//                 </div>
//                 <div className="form-groups">
//                   <label>Scheduled Time *</label>
//                   <input
//                     type="datetime-local"
//                     value={route.pickup.scheduledTime}
//                     onChange={(e) => setRoute({...route, pickup: {...route.pickup, scheduledTime: e.target.value}})}
//                   />
//                 </div>
//                 <div className="form-groups">
//                   <label>Actual Time (if known)</label>
//                   <input
//                     type="datetime-local"
//                     value={route.pickup.actualTime}
//                     onChange={(e) => setRoute({...route, pickup: {...route.pickup, actualTime: e.target.value}})}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Air Legs */}
//             <div className="leg-section">
//               <div className="leg-header">
//                 <div className="leg-icon air"><i className="fas fa-plane"></i></div>
//                 <div>
//                   <h3>Air Transport ({route.airLegs.length} leg{route.airLegs.length !== 1 ? 's' : ''})</h3>
//                   <button 
//                     className="btn-add-leg"
//                     onClick={addAirLeg}
//                     disabled={route.airLegs.length >= 5}
//                   >
//                     <i className="fas fa-plus"></i> Add Leg
//                   </button>
//                 </div>
//               </div>

//               {route.airLegs.map((leg, index) => (
//                 <div key={leg.id} className="air-leg">
//                   <div className="air-leg-header">
//                     <h4>Flight {index + 1}</h4>
//                     {route.airLegs.length > 1 && (
//                       <button 
//                         className="btn-remove"
//                         onClick={() => removeAirLeg(leg.id)}
//                       >
//                         <i className="fas fa-trash"></i>
//                       </button>
//                     )}
//                   </div>
//                   <div className="form-grid">
//                     <div className="form-groups">
//                       <label>Flight Number *</label>
//                       <input
//                         type="text"
//                         value={leg.flightNumber}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, flightNumber: e.target.value} : l
//                           )
//                         }))}
//                         placeholder="e.g., KQ101"
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Aircraft</label>
//                       <input
//                         type="text"
//                         value={leg.aircraft}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, aircraft: e.target.value} : l
//                           )
//                         }))}
//                         placeholder="e.g., Boeing 787"
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Departure Airport *</label>
//                       <input
//                         type="text"
//                         value={leg.departureAirport}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, departureAirport: e.target.value} : l
//                           )
//                         }))}
//                         placeholder="e.g., NBO"
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Departure Time (Scheduled) *</label>
//                       <input
//                         type="datetime-local"
//                         value={leg.departureTimeScheduled}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, departureTimeScheduled: e.target.value} : l
//                           )
//                         }))}
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Departure Time (Actual)</label>
//                       <input
//                         type="datetime-local"
//                         value={leg.departureTimeActual}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, departureTimeActual: e.target.value} : l
//                           )
//                         }))}
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Arrival Airport *</label>
//                       <input
//                         type="text"
//                         value={leg.arrivalAirport}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, arrivalAirport: e.target.value} : l
//                           )
//                         }))}
//                         placeholder="e.g., LHR"
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Arrival Time (Scheduled) *</label>
//                       <input
//                         type="datetime-local"
//                         value={leg.arrivalTimeScheduled}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, arrivalTimeScheduled: e.target.value} : l
//                           )
//                         }))}
//                       />
//                     </div>
//                     <div className="form-groups">
//                       <label>Arrival Time (Actual)</label>
//                       <input
//                         type="datetime-local"
//                         value={leg.arrivalTimeActual}
//                         onChange={(e) => setRoute(prev => ({
//                           ...prev,
//                           airLegs: prev.airLegs.map(l => 
//                             l.id === leg.id ? {...l, arrivalTimeActual: e.target.value} : l
//                           )
//                         }))}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Delivery (Road 2) */}
//             <div className="leg-section">
//               <div className="leg-header">
//                 <div className="leg-icon road"><i className="fas fa-truck"></i></div>
//                 <h3>Final Delivery (Road Transport)</h3>
//               </div>
//               <div className="form-grid">
//                 <div className="form-groups">
//                   <label>Delivery Location *</label>
//                   <input
//                     type="text"
//                     value={route.delivery.location}
//                     onChange={(e) => setRoute({...route, delivery: {...route.delivery, location: e.target.value}})}
//                     placeholder="e.g., London City"
//                   />
//                 </div>
//                 <div className="form-groups">
//                   <label>Facility *</label>
//                   <input
//                     type="text"
//                     value={route.delivery.facility}
//                     onChange={(e) => setRoute({...route, delivery: {...route.delivery, facility: e.target.value}})}
//                     placeholder="e.g., SwiftParcel Hub London"
//                   />
//                 </div>
//                 <div className="form-groups">
//                   <label>Scheduled Time *</label>
//                   <input
//                     type="datetime-local"
//                     value={route.delivery.scheduledTime}
//                     onChange={(e) => setRoute({...route, delivery: {...route.delivery, scheduledTime: e.target.value}})}
//                   />
//                 </div>
//                 <div className="form-groups">
//                   <label>Actual Time (if known)</label>
//                   <input
//                     type="datetime-local"
//                     value={route.delivery.actualTime}
//                     onChange={(e) => setRoute({...route, delivery: {...route.delivery, actualTime: e.target.value}})}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="step-actions">
//               <button 
//                 className="btn-secondary"
//                 onClick={() => setStep(2)}
//               >
//                 Back: Packages
//               </button>
//               <button 
//                 className="btn-primarys"
//                 onClick={() => setStep(4)}
//               >
//                 Next: Review
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 4: Review */}
//         {step === 4 && (
//           <div className="step-content">
//             <h2><i className="fas fa-clipboard-check"></i> Review & Submit</h2>
            
//             <div className="review-section">
//               <h3>Client</h3>
//               <div className="review-grid">
//                 <div><strong>Name:</strong> {client.name}</div>
//                 <div><strong>Email:</strong> {client.email}</div>
//                 <div><strong>Phone:</strong> {client.phone || '—'}</div>
//                 <div><strong>Company:</strong> {client.company || '—'}</div>
//               </div>
//             </div>

//             <div className="review-section">
//               <h3>Packages ({packages.length})</h3>
//               {packages.map((pkg, i) => (
//                 <div key={pkg.id} className="package-summary">
//                   <div><strong>Package {i + 1}:</strong> {pkg.description}</div>
//                   <div>{pkg.weight} kg | {pkg.length} × {pkg.width} × {pkg.height} cm</div>
//                   <div>{pkg.category} {pkg.requiresClearance && ' • Customs Clearance'}</div>
//                 </div>
//               ))}
//             </div>

//             <div className="review-section">
//               <h3>Route</h3>
//               <div className="route-summary">
//                 <div className="route-leg">
//                   <div className="leg-icon road small"><i className="fas fa-truck"></i></div>
//                   <div>
//                     <strong>Pickup:</strong> {route.pickup.location} @ {route.pickup.scheduledTime ? new Date(route.pickup.scheduledTime).toLocaleString() : '—'}
//                   </div>
//                 </div>
                
//                 {route.airLegs.map((leg, i) => (
//                   <div key={leg.id} className="route-leg">
//                     <div className="leg-icon air small"><i className="fas fa-plane"></i></div>
//                     <div>
//                       <strong>Flight {i + 1}:</strong> {leg.flightNumber} | {leg.departureAirport} → {leg.arrivalAirport}<br/>
//                       {leg.departureTimeScheduled ? new Date(leg.departureTimeScheduled).toLocaleString() : '—'} → {leg.arrivalTimeScheduled ? new Date(leg.arrivalTimeScheduled).toLocaleString() : '—'}
//                     </div>
//                   </div>
//                 ))}
                
//                 <div className="route-leg">
//                   <div className="leg-icon road small"><i className="fas fa-truck"></i></div>
//                   <div>
//                     <strong>Delivery:</strong> {route.delivery.location} @ {route.delivery.scheduledTime ? new Date(route.delivery.scheduledTime).toLocaleString() : '—'}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="step-actions">
//               <button 
//                 className="btn-secondary"
//                 onClick={() => setStep(3)}
//               >
//                 Back: Route
//               </button>
//               <button 
//                 className="btn-primarys"
//                 onClick={handleSubmit}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Creating Delivery...
//                   </>
//                 ) : (
//                   'Create Delivery'
//                 )}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminCreateDeliveryPage;





