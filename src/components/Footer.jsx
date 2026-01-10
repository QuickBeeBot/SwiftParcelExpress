import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Shield, Truck, Clock, Box } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#1F1F1F] border-t border-white/10 text-white pt-12">
      {/* Feature Section */}
      {/* <div className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
            <div className="bg-[#36FFDB]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Box className="h-6 w-6 text-[#36FFDB]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Secure Packaging</h3>
            <p className="text-sm text-white/70">Professional packaging solutions for all cargo types</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
            <div className="bg-[#36FFDB]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Truck className="h-6 w-6 text-[#36FFDB]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-sm text-white/70">Express shipping options to meet your deadlines</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
            <div className="bg-[#36FFDB]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-[#36FFDB]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Insured Shipments</h3>
            <p className="text-sm text-white/70">Complete insurance coverage for peace of mind</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
            <div className="bg-[#36FFDB]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-[#36FFDB]" />
            </div>
            <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
            <p className="text-sm text-white/70">Round-the-clock customer service and tracking</p>
          </div>
        </div>
      </div> */}

      {/* Main Footer Section */}
      <div className="container mx-auto px-4 pb-8 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/logo.png" 
                alt="Parcel logo" 
                className="h-10 w-auto" 
              />
              <span className="font-bold text-xl"> </span>
            </div>
            <p className="text-sm text-white/70">
              Seamless shipping solutions for your business needs globally.
            </p>
            <div className="mt-4">
              <button className="bg-transparent border border-[#36FFDB] text-[#36FFDB] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#36FFDB]/10 transition-colors">
                Global Support Availability
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-white/70 hover:text-[#36FFDB] transition-colors">Services</Link></li>
              <li><Link to="/quote" className="text-white/70 hover:text-[#36FFDB] transition-colors">Get Quote</Link></li>
              <li><Link to="/track" className="text-white/70 hover:text-[#36FFDB] transition-colors">Track Shipment</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-[#36FFDB] transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#36FFDB] mt-0.5" />
                <span className="text-white/70">info@swiftparcel.global</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#36FFDB] mt-0.5" />
                <span className="text-white/70">+44 118 315 0778</span>
              </li>
              {/* <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#36FFDB] mt-0.5" />
                <span className="text-white/70">Global HQ, New York, US</span>
              </li> */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-white/70 hover:text-[#36FFDB] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-white/70 hover:text-[#36FFDB] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-white/70 hover:text-[#36FFDB] transition-colors">Cookies & Privacy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-white/5 pt-6 pb-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/50 mb-4 md:mb-0">
            © {new Date().getFullYear()} SwiftParcel. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-white/50">
            <span>SOC 2 Type II Compliant</span>
            <span>•</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


