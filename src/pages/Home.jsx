
//components/pages/home.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Package, Truck, Shield, Clock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import QuoteModal from '@/components/QuoteModal';
import PromoSignupModal from '@/components/PromoSignupModal';
// import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
const Home = () => {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedSwiftParcel');
    if (!hasVisited && !user) {
      const timer = setTimeout(() => {
        setIsPromoModalOpen(true);
        localStorage.setItem('hasVisitedSwiftParcel', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);
  const handleDemoClick = () => {
    toast({
      title: "Interactive Demo",
      description: "Our demo environment is currently being updated. Please check back later!"
    });
  };
  return <>
      <Helmet>
        <title>Parcel - {t('home.heroTitle')}</title>
        <meta name="description" content="Professional shipping and logistics solutions for businesses worldwide. Get fast, secure, and reliable delivery services with Parcel." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover opacity-80" alt="Global logistics shipping network" src="/images/hero_image.webp" />
          {/* Dark overlay added */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.heroTitle')}
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
          }} className="text-xl text-white/80 mb-8">
              {t('home.heroSubtitle')}
            </motion.p>
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setIsQuoteModalOpen(true)} className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] px-8 py-6 text-lg font-semibold transition-all duration-300 group">
                {t('home.getQuote')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button onClick={handleDemoClick} className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 hover:border-white rounded-[50px] px-8 py-6 text-lg font-semibold transition-all duration-300 backdrop-blur-sm group">
                <PlayCircle className="mr-2 w-5 h-5" />
                {t('home.viewDemo')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#151515]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.whyChoose')}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              {t('home.whyChooseSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Secure Packaging */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0
          }} className="relative overflow-hidden bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 shadow-lg transition-all duration-300 group min-h-[250px] flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                  <img className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Warehouse worker packaging box securely" src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/img_0869-DQiOJ.JPG" />
                  <div className="absolute inset-0 bg-black/20" /> {/* Dark overlay added */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-[#1F1F1F]/90 to-transparent" />
              </div>
              <div className="relative z-10">
                  <Package className="w-12 h-12 text-[#36FFDB] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{t('home.securePkg')}</h3>
                  <p className="text-white/60">{t('home.securePkgDesc')}</p>
              </div>
            </motion.div>

            {/* Feature 2: Fast Delivery */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.1
          }} className="relative overflow-hidden bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 shadow-lg transition-all duration-300 group min-h-[250px] flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                  <img className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Fast delivery truck moving on highway" src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/img_0888-ScMtk.JPG" />
                  <div className="absolute inset-0 bg-black/20" /> {/* Dark overlay added */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-[#1F1F1F]/90 to-transparent" />
              </div>
              <div className="relative z-10">
                  <Truck className="w-12 h-12 text-[#36FFDB] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{t('home.fastDelivery')}</h3>
                  <p className="text-white/60">{t('home.fastDeliveryDesc')}</p>
              </div>
            </motion.div>

            {/* Feature 3: Insured Shipments */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="relative overflow-hidden bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 shadow-lg transition-all duration-300 group min-h-[250px] flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                  <img className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Insurance contract document protection" src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/img_1232-a5NfY.JPG" />
                  <div className="absolute inset-0 bg-black/20" /> {/* Dark overlay added */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-[#1F1F1F]/90 to-transparent" />
              </div>
              <div className="relative z-10">
                  <Shield className="w-12 h-12 text-[#36FFDB] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{t('home.insured')}</h3>
                  <p className="text-white/60">{t('home.insuredDesc')}</p>
              </div>
            </motion.div>

            {/* Feature 4: 24/7 Support */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.3
          }} className="relative overflow-hidden bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 shadow-lg transition-all duration-300 group min-h-[250px] flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                  <img className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" alt="Customer support representative with headset" src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/img_0878-AV40j.JPG" />
                  <div className="absolute inset-0 bg-black/20" /> {/* Dark overlay added */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-[#1F1F1F]/90 to-transparent" />
              </div>
              <div className="relative z-10">
                  <Clock className="w-12 h-12 text-[#36FFDB] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{t('home.support')}</h3>
                  <p className="text-white/60">{t('home.supportDesc')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
      <PromoSignupModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} />
    </>;
};
export default Home;




