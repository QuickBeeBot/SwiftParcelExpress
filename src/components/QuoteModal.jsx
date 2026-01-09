
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const QuoteModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    company: '',
    email: '',
    country: '',
    address: '',
    contact: '',
    packageInfo: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateTrackingId = () => {
    return 'SP' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trackingId = generateTrackingId();

      const { error: shipmentError } = await supabase
        .from('shipments')
        .insert([{
          tracking_id: trackingId,
          customer_name: formData.customerName,
          company: formData.company,
          email: formData.email,
          country: formData.country,
          address: formData.address,
          contact: formData.contact,
          package_info: formData.packageInfo,
          status: 'Pending'
        }]);

      if (shipmentError) throw shipmentError;

      const { error: customerError } = await supabase
        .from('customers')
        .upsert([{
          name: formData.customerName,
          email: formData.email,
          country: formData.country
        }], {
          onConflict: 'email'
        });

      if (customerError) throw customerError;

      toast({
        title: "Quote Submitted Successfully! ✅",
        description: `Your tracking ID is: ${trackingId}. We'll contact you shortly!`,
      });

      setFormData({
        customerName: '',
        company: '',
        email: '',
        country: '',
        address: '',
        contact: '',
        packageInfo: ''
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#151515] rounded-3xl p-8 border border-white/10 max-w-2xl w-full my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Get a Free Quote</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact *</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors resize-none"
                  placeholder="Full shipping address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Package Info *</label>
                <textarea
                  name="packageInfo"
                  value={formData.packageInfo}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors resize-none"
                  placeholder="Dimensions, weight, contents..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] px-8 py-6 text-lg font-semibold transition-all duration-300"
              >
                {loading ? 'Submitting...' : 'Submit Quote Request'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;
