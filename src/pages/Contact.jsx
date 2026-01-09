import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
const Contact = () => {
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Simulate API call
    console.log('Contact form submitted:', formData);
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out! We'll get back to you soon."
    });
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  return <>
      <Helmet>
        <title>Contact Us - SwiftParcel</title>
        <meta name="description" content="Get in touch with SwiftParcel for any inquiries, support, or feedback. We are here to help with all your shipping and logistics needs." />
      </Helmet>

      <section className="relative min-h-[400px] flex items-center py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover opacity-80" alt="Contact us background image" src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/gggg-PFIz5.png" />
          {/* Dark overlay added */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            {t('contact.title')}
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-xl text-white/80 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-[#151515]">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="space-y-10">
            <h2 className="text-4xl font-bold mb-6">{t('contact.infoTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4 bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors">
                <MapPin className="w-8 h-8 text-[#36FFDB] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{t('contact.address')}</h3>
                  <p className="text-white/70">123 Logistics Lane, Suite 400, Global City, GC 90210</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors">
                <Phone className="w-8 h-8 text-[#36FFDB] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{t('contact.phone')}</h3>
                  <p className="text-white/70">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors">
                <Mail className="w-8 h-8 text-[#36FFDB] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{t('contact.email')}</h3>
                  <p className="text-white/70">info@swiftparcel.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors">
                <Clock className="w-8 h-8 text-[#36FFDB] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{t('contact.hours')}</h3>
                  <p className="text-white/70">{t('contact.hoursDesc')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="bg-[#1F1F1F] p-8 rounded-3xl border border-white/10 shadow-lg">
            <h2 className="text-4xl font-bold mb-8">{t('contact.formTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.formName')}
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-[#36FFDB] text-white" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.formEmail')}
                </label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-[#36FFDB] text-white" required />
              </div>
              <div>
                <label htmlFor="subject" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.formSubject')}
                </label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-[#36FFDB] text-white" required />
              </div>
              <div>
                <label htmlFor="message" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.formMessage')}
                </label>
                <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-[#36FFDB] text-white resize-y" required></textarea>
              </div>
              <Button type="submit" className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-white rounded-[50px] px-6 py-3 text-lg font-semibold transition-all duration-300">
                {t('contact.formButton')}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </>;
};
export default Contact;