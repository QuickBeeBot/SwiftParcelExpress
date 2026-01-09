
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plane, Ship, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Services = () => {
  const { toast } = useToast();

  const services = [
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Fast and efficient air cargo services for time-sensitive shipments. We partner with leading airlines to ensure your goods reach their destination quickly and safely.',
      features: ['Express delivery options', 'Worldwide coverage', 'Real-time tracking', 'Temperature-controlled options']
    },
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'Cost-effective ocean shipping solutions for large volume cargo. Ideal for businesses looking to transport goods internationally at competitive rates.',
      features: ['Full container loads (FCL)', 'Less than container loads (LCL)', 'Door-to-door service', 'Customs clearance assistance']
    },
    {
      icon: Truck,
      title: 'Ground Transportation',
      description: 'Reliable domestic and cross-border ground shipping services. Perfect for regional deliveries and overland transportation needs.',
      features: ['Same-day delivery options', 'Regional distribution', 'Dedicated fleet', 'Flexible scheduling']
    },
    {
      icon: Package,
      title: 'Warehousing & Logistics',
      description: 'Complete warehousing solutions with inventory management. Store your products in our secure facilities with 24/7 monitoring.',
      features: ['Climate-controlled storage', 'Inventory management', 'Pick and pack services', 'Distribution support']
    }
  ];

  const handleLearnMore = () => {
    toast({
      title: "🚧 Feature Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Our Services - SwiftParcel</title>
        <meta name="description" content="Explore SwiftParcel's comprehensive shipping services including air freight, ocean freight, ground transportation, and warehousing solutions." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#151515] to-[#1F1F1F] py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Shipping Services</h1>
              <p className="text-xl text-white/80">
                Comprehensive logistics solutions designed to meet your business needs
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#151515] rounded-3xl p-8 border border-white/10 hover:border-[#36FFDB]/50 transition-all duration-300"
                >
                  <service.icon className="w-16 h-16 text-[#36FFDB] mb-6" />
                  <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                  <p className="text-white/80 mb-6">{service.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-[#36FFDB]">Key Features:</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-white/80">
                          <span className="text-[#36FFDB] mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={handleLearnMore}
                    className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] px-6 py-3 font-semibold transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Services;
