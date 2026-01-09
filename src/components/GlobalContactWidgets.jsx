
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Briefcase, Truck, Lightbulb, X, Plus, ChevronUp, CheckCircle, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ContactModal = ({ isOpen, onClose, title, description, fields, emailTarget, successMessage }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Request Sent Successfully",
      description: `${successMessage} A confirmation has been sent to your email from ${emailTarget}.`,
    });
    
    setLoading(false);
    onClose();
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1F1F1F] border-white/10 text-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-white/60">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium text-white/80">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  onChange={handleChange}
                  className="w-full min-h-[100px] bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#36FFDB] transition-colors resize-none"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  required={field.required}
                  onChange={handleChange}
                  className="w-full bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#36FFDB] transition-colors"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-white hover:text-[#1F1F1F] font-bold rounded-[50px] mt-2"
          >
            {loading ? 'Sending...' : 'Submit Request'}
          </Button>
          <p className="text-xs text-center text-white/40 mt-2">
            All communications are routed securely via swiftparcel.global
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const GlobalContactWidgets = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const actions = [
    {
      id: 'support',
      label: 'Customer Support',
      icon: MessageSquare,
      color: 'bg-blue-500',
      modalConfig: {
        title: 'Customer Support',
        description: 'Need help with a shipment? Our team is available 24/7.',
        emailTarget: 'support@swiftparcel.global',
        successMessage: 'Your support ticket has been created.',
        fields: [
          { name: 'name', label: 'Full Name', required: true, placeholder: 'John Doe' },
          { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
          { name: 'tracking', label: 'Tracking Reference', required: true, placeholder: 'SP-12345678' },
          { name: 'message', label: 'How can we help?', type: 'textarea', required: true, placeholder: 'Describe your issue...' },
        ]
      }
    },
    {
      id: 'sales',
      label: 'Sales & Business',
      icon: Briefcase,
      color: 'bg-emerald-500',
      modalConfig: {
        title: 'Sales Inquiry',
        description: 'Partner with SwiftParcel for your logistics needs.',
        emailTarget: 'sales@swiftparcel.global',
        successMessage: 'Your inquiry has been received by our sales team.',
        fields: [
          { name: 'company', label: 'Company Name', required: true, placeholder: 'Acme Inc.' },
          { name: 'contact', label: 'Contact Person', required: true, placeholder: 'Jane Smith' },
          { name: 'email', label: 'Business Email', type: 'email', required: true, placeholder: 'jane@acme.com' },
          { name: 'volume', label: 'Estimated Monthly Volume', required: true, placeholder: 'e.g. 500-1000 shipments' },
          { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us about your requirements...' },
        ]
      }
    },
    {
      id: 'shipping',
      label: 'Shipping & Customs',
      icon: Truck,
      color: 'bg-purple-500',
      modalConfig: {
        title: 'Shipping & Customs Help',
        description: 'Expert guidance on international shipping regulations.',
        emailTarget: 'shipping@swiftparcel.global',
        successMessage: 'Our customs experts will review your query shortly.',
        fields: [
          { name: 'name', label: 'Full Name', required: true, placeholder: 'John Doe' },
          { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
          { name: 'type', label: 'Shipment Type', required: true, placeholder: 'e.g. Hazardous Materials, Perishables' },
          { name: 'description', label: 'Details', type: 'textarea', required: true, placeholder: 'Describe the contents and destination...' },
        ]
      }
    },
    {
      id: 'feedback',
      label: 'Ideas & Feedback',
      icon: Lightbulb,
      color: 'bg-amber-500',
      modalConfig: {
        title: 'Share Your Ideas',
        description: 'Help us improve SwiftParcel services.',
        emailTarget: 'info@swiftparcel.global',
        successMessage: 'Thank you for your valuable feedback!',
        fields: [
          { name: 'name', label: 'Name (Optional)', required: false, placeholder: 'John Doe' },
          { name: 'email', label: 'Email (Optional)', type: 'email', required: false, placeholder: 'john@example.com' },
          { name: 'message', label: 'Your Feedback', type: 'textarea', required: true, placeholder: 'What can we do better?' },
        ]
      }
    }
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="flex flex-col space-y-3 items-end mb-2"
            >
              {actions.map((action) => (
                <div key={action.id} className="flex items-center group">
                  <span className="mr-3 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                    {action.label}
                  </span>
                  <button
                    onClick={() => {
                      setActiveModal(action);
                      setIsOpen(false);
                    }}
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform ${action.color}`}
                    aria-label={action.label}
                  >
                    <action.icon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-[#1F1F1F] font-bold text-xl transition-all duration-300 hover:scale-105 z-50 ${isOpen ? 'bg-white rotate-45' : 'bg-[#36FFDB]'}`}
          aria-label="Contact Options"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {activeModal && (
        <ContactModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          {...activeModal.modalConfig}
        />
      )}
    </>
  );
};

export const CookieConsentModal = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  const handleSave = () => {
    localStorage.setItem('swiftparcel_cookie_consent', JSON.stringify(preferences));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1F1F1F] border-white/10 text-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#36FFDB]" />
            Cookies & Privacy Settings
          </DialogTitle>
          <DialogDescription className="text-white/60">
            We use cookies to enhance your browsing experience and analyze our traffic. 
            Please select your preferences below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start justify-between p-4 bg-[#151515] rounded-lg border border-white/5">
            <div>
              <h4 className="font-semibold text-sm">Necessary Cookies</h4>
              <p className="text-xs text-white/50 mt-1">Required for the website to function properly.</p>
            </div>
            <div className="flex items-center h-full">
              <CheckCircle className="w-5 h-5 text-[#36FFDB]" />
            </div>
          </div>

          <div className="flex items-start justify-between p-4 bg-[#151515] rounded-lg border border-white/5">
            <div>
              <h4 className="font-semibold text-sm">Analytics</h4>
              <p className="text-xs text-white/50 mt-1">Help us improve our website by collecting usage information.</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.analytics}
              onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
              className="mt-1"
            />
          </div>

          <div className="flex items-start justify-between p-4 bg-[#151515] rounded-lg border border-white/5">
            <div>
              <h4 className="font-semibold text-sm">Marketing</h4>
              <p className="text-xs text-white/50 mt-1">Used to show you relevant advertisements.</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.marketing}
              onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-[#36FFDB] text-[#1F1F1F] hover:bg-white hover:text-[#1F1F1F] font-bold rounded-[50px]"
          >
            Save Preferences
          </Button>
          <Button 
            onClick={onClose} 
            variant="ghost"
            className="flex-1 text-white hover:bg-white/10 rounded-[50px]"
          >
            Cancel
          </Button>
        </div>
        <div className="text-center mt-2">
           <a href="/privacy" className="text-xs text-[#36FFDB] hover:underline">View Full Privacy Policy</a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const GlobalSupportModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1F1F1F] border-white/10 text-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#36FFDB]" />
            Global Support Availability
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm text-white/80">
          <p>
            At SwiftParcel, we understand that logistics never sleep. That implies our support team doesn't either.
          </p>
          <div className="bg-[#151515] p-4 rounded-lg border border-white/5">
            <h4 className="font-bold text-[#36FFDB] mb-2">24/7/365 Coverage</h4>
            <p className="text-xs text-white/60 mb-3">
              Our global support centers operate in a "follow-the-sun" model to ensure there is always an agent available to assist you, regardless of your time zone.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono bg-black/20 p-2 rounded">
              <MessageSquare className="w-3 h-3" />
              <span>support@swiftparcel.global</span>
            </div>
          </div>
          <p>
            For urgent matters involving customs clearance or delayed shipments, please reference your tracking ID in the subject line for expedited routing.
          </p>
        </div>
        <Button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-[50px]">
          Close Information
        </Button>
      </DialogContent>
    </Dialog>
  );
};
