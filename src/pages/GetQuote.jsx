
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const GetQuote = () => {
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

      // Insert shipment
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

      // Insert or update customer
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
        description: `Your tracking ID is: ${trackingId}. We'll contact you shortly with a detailed quote.`,
      });

      // Reset form
      setFormData({
        customerName: '',
        company: '',
        email: '',
        country: '',
        address: '',
        contact: '',
        packageInfo: ''
      });
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
    <>
      <Helmet>
        <title>Get a Quote - SwiftParcel</title>
        <meta name="description" content="Request a shipping quote from SwiftParcel. Fill out our simple form and get a competitive quote for your cargo shipping needs." />
      </Helmet>

      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get a Free Quote</h1>
              <p className="text-white/80">
                Fill out the form below and we'll get back to you with a competitive quote
              </p>
            </div>

            <div className="bg-[#151515] rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Company Name (Optional)"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-medium mb-2">Contact Number *</label>
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
                  <label className="block text-sm font-medium mb-2">Shipping Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors resize-none"
                    placeholder="Enter full shipping address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Package Information *</label>
                  <textarea
                    name="packageInfo"
                    value={formData.packageInfo}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-[#1F1F1F] border border-white/10 rounded-2xl focus:outline-none focus:border-[#36FFDB] transition-colors resize-none"
                    placeholder="Describe your package (dimensions, weight, contents, special handling requirements)"
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
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default GetQuote;
