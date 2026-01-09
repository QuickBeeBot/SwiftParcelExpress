
import React from 'react';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - SwiftParcel Global</title>
      </Helmet>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-white/80">
          <p className="mb-4">Welcome to SwiftParcel. By using our website and services, you agree to comply with and be bound by the following terms and conditions.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">1. Domain Usage</h2>
          <p className="mb-4">All official communications and services are conducted exclusively through the <strong>swiftparcel.global</strong> domain. SwiftParcel does not operate under .express or other TLDs. We are not responsible for communications originating from unauthorized domains.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">2. Service Agreements</h2>
          <p className="mb-4">Shipment requests, quotes, and tracking services are subject to international maritime and aviation laws. Specific service level agreements (SLAs) will be provided upon contract formation.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">3. User Accounts</h2>
          <p className="mb-4">You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your responsibility.</p>
        </div>
      </div>
    </>
  );
};

export default Terms;
