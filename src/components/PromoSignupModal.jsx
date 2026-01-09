
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, User, Building2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
// import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useAuth } from '../contexts/FirebaseAuthContext';

const SANCTIONED_COUNTRIES = ['North Korea', 'Iran', 'Cuba', 'Syria', 'Russia', 'Belarus'];

const PromoSignupModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  // Stages: 'offer', 'selection', 'form'
  const [stage, setStage] = useState('offer');
  const [accountType, setAccountType] = useState('personal'); // 'personal' or 'business'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    country: '',
    address: '',
    contactNumber: '',
    tin: '',
    registrationNumber: '',
    captcha: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptcha = () => {
    setFormData(prev => ({ ...prev, captcha: !prev.captcha }));
  };

  const handleClaim = () => {
    setStage('selection');
  };

  const handleSelectType = (type) => {
    setAccountType(type);
    setStage('form');
  };

  const validateForm = () => {
    if (SANCTIONED_COUNTRIES.some(c => c.toLowerCase() === formData.country.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Registration Unavailable",
        description: "We cannot offer services in this region due to international regulations.",
      });
      return false;
    }
    
    if (!formData.captcha) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please confirm you are not a robot.",
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await signUp(formData.email, formData.password, {
        data: {
          full_name: formData.fullName,
          is_business: accountType === 'business',
          has_discount: true // First shipment flag
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Create customer record
        const { error: dbError } = await supabase
          .from('customers')
          .insert([{
            auth_user_id: authData.user.id,
            email: formData.email,
            name: accountType === 'personal' ? formData.fullName : formData.companyName,
            country: formData.country,
            address: formData.address,
            contact_number: formData.contactNumber,
            is_business: accountType === 'business',
            company_name: accountType === 'business' ? formData.companyName : null,
            tin: accountType === 'business' ? formData.tin : null,
            registration_number: accountType === 'business' ? formData.registrationNumber : null,
            has_discount: true
          }]);

        if (dbError) {
          console.error("DB Error:", dbError);
        }

        toast({
          title: "Account Created!",
          description: "Your 18% discount has been applied to your account.",
        });

        onClose();
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An error occurred during registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Image/Banner - only show on offer stage */}
          {stage === 'offer' && (
            <div className="h-32 bg-gradient-to-r from-[#36FFDB] to-[#2ecc71] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 text-center">
                <h2 className="text-4xl font-bold text-[#1F1F1F]">18% OFF</h2>
                <p className="text-[#1F1F1F] font-medium">Your First Shipment</p>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 overflow-y-auto custom-scrollbar">
            
            {/* STAGE 1: OFFER */}
            {stage === 'offer' && (
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Welcome to SwiftParcel!</h3>
                  <p className="text-white/70">
                    New customers get exclusive rates on their first international shipment. Join thousands of businesses shipping smarter today.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-xl border border-white/5">
                    <Check className="w-5 h-5 text-[#36FFDB] shrink-0" />
                    <span className="text-sm">Instant 18% discount applied</span>
                  </div>
                  <div className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-xl border border-white/5">
                    <Check className="w-5 h-5 text-[#36FFDB] shrink-0" />
                    <span className="text-sm">Priority handling status</span>
                  </div>
                  <div className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-xl border border-white/5">
                    <Check className="w-5 h-5 text-[#36FFDB] shrink-0" />
                    <span className="text-sm">Real-time global tracking</span>
                  </div>
                </div>

                <Button
                  onClick={handleClaim}
                  className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-white hover:text-[#1F1F1F] text-lg font-bold py-6 rounded-[50px] transition-all transform hover:scale-[1.02]"
                >
                  Claim My Discount →
                </Button>

                <p className="text-xs text-white/40">
                  By claiming this offer, you agree to our Terms of Service and Privacy Policy. 
                  Offer valid for new accounts only.
                </p>
              </div>
            )}

            {/* STAGE 2: SELECTION */}
            {stage === 'selection' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Choose Account Type</h3>
                  <p className="text-white/60">Select the option that best fits your needs</p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => handleSelectType('personal')}
                    className="flex items-center gap-4 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#36FFDB] rounded-2xl transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#36FFDB]/10 flex items-center justify-center group-hover:bg-[#36FFDB] transition-colors">
                      <User className="w-6 h-6 text-[#36FFDB] group-hover:text-[#1F1F1F]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Personal Account</h4>
                      <p className="text-sm text-white/60">For individuals shipping packages globally</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectType('business')}
                    className="flex items-center gap-4 p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#36FFDB] rounded-2xl transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#36FFDB]/10 flex items-center justify-center group-hover:bg-[#36FFDB] transition-colors">
                      <Building2 className="w-6 h-6 text-[#36FFDB] group-hover:text-[#1F1F1F]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Business Account</h4>
                      <p className="text-sm text-white/60">For companies with higher volume needs</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: FORM */}
            {stage === 'form' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-1">
                    {accountType === 'personal' ? 'Personal Sign Up' : 'Business Sign Up'}
                  </h3>
                  <p className="text-[#36FFDB] text-sm font-medium">18% Discount applied to first shipment</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Common Fields */}
                  <div className="space-y-4">
                    {accountType === 'personal' ? (
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          required
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                          placeholder="Acme Logistics Inc."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Country</label>
                        <input
                          type="text"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                          placeholder="Country"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Phone</label>
                        <input
                          type="tel"
                          name="contactNumber"
                          required
                          value={formData.contactNumber}
                          onChange={handleChange}
                          className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                          placeholder="+1 234..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                        placeholder="123 Main St..."
                      />
                    </div>
                  </div>

                  {/* Business Specific Fields */}
                  {accountType === 'business' && (
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1 ml-1">TIN / Tax ID</label>
                          <input
                            type="text"
                            name="tin"
                            required
                            value={formData.tin}
                            onChange={handleChange}
                            className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                            placeholder="TIN-12345"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Reg. Number</label>
                          <input
                            type="text"
                            name="registrationNumber"
                            required
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] focus:outline-none transition-colors"
                            placeholder="REG-9876"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAPTCHA */}
                  <div className="pt-4">
                    <div 
                      onClick={handleCaptcha}
                      className="flex items-center gap-3 p-3 bg-[#1F1F1F] border border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors select-none"
                    >
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.captcha ? 'bg-[#36FFDB] border-[#36FFDB]' : 'border-white/40'}`}>
                        {formData.captcha && <Check className="w-4 h-4 text-black" />}
                      </div>
                      <span className="text-sm text-white/80">I am human (CAPTCHA)</span>
                      <ShieldCheck className="w-5 h-5 text-white/20 ml-auto" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-white hover:text-[#1F1F1F] text-lg font-bold py-6 mt-4 rounded-[50px] transition-all"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>

                  <button 
                    type="button"
                    onClick={() => setStage('selection')}
                    className="w-full text-center text-sm text-white/40 hover:text-white transition-colors"
                  >
                    Back to selection
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PromoSignupModal;
