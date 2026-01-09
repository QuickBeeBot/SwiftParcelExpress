import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Globe, Users, Award, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const About = () => {
  const {
    t
  } = useLanguage();
  return <>
      <Helmet>
        <title>About Us - SwiftParcel</title>
        <meta name="description" content="Learn more about SwiftParcel, our mission, vision, and the values that drive our commitment to excellent logistics and shipping services." />
      </Helmet>

      <section className="relative min-h-[400px] flex items-center py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover opacity-80" alt="About us background image with global map and logistics elements" src="/images/about_image.webp" />
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
            {t('about.title')}
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
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-[#151515]">
        <div className="container mx-auto px-4">
          {/* Our Story */}
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">{t('about.storyTitle')}</h2>
            <p className="text-white/70 text-lg leading-relaxed">
              {t('about.storyDesc1')}
            </p>
            <p className="text-white/70 text-lg leading-relaxed mt-4">
              {t('about.storyDesc2')}
            </p>
          </motion.div>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0
          }} className="bg-[#1F1F1F] p-8 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors text-center shadow-lg">
              <Globe className="w-12 h-12 text-[#36FFDB] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">{t('about.missionTitle')}</h3>
              <p className="text-white/70">{t('about.missionDesc')}</p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.15
          }} className="bg-[#1F1F1F] p-8 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors text-center shadow-lg">
              <Lightbulb className="w-12 h-12 text-[#36FFDB] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">{t('about.visionTitle')}</h3>
              <p className="text-white/70">{t('about.visionDesc')}</p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }} className="bg-[#1F1F1F] p-8 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors text-center shadow-lg">
              <Users className="w-12 h-12 text-[#36FFDB] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">{t('about.valuesTitle')}</h3>
              <p className="text-white/70">{t('about.valuesDesc')}</p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.45
          }} className="bg-[#1F1F1F] p-8 rounded-2xl border border-white/10 hover:border-[#36FFDB]/50 transition-colors text-center shadow-lg">
              <Award className="w-12 h-12 text-[#36FFDB] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">{t('about.awardTitle')}</h3>
              <p className="text-white/70">{t('about.awardDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section (Placeholder) */}
      <section className="py-20 bg-[#151515] text-center">
        <div className="container mx-auto px-4">
          <motion.h2 initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="text-4xl font-bold mb-6">
            {t('about.teamTitle')}
          </motion.h2>
          <motion.p initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-white/70 text-lg max-w-3xl mx-auto">
            {t('about.teamDesc')}
          </motion.p>
          {/* Team member cards or carousel can go here */}
        </div>
      </section>
    </>;
};
export default About;