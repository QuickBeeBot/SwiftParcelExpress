
import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - SwiftParcel Global</title>
      </Helmet>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-white/80">
          <p className="mb-4">At SwiftParcel, we prioritize the protection of your personal and business data. This policy outlines how we collect, use, and safeguard your information.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">Data Collection</h2>
          <p className="mb-4">We collect information necessary to facilitate global shipping logistics, including sender/recipient addresses, package contents, and contact details. All data is processed securely.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">International Transfers</h2>
          <p className="mb-4">As a global logistics provider operating via <strong>swiftparcel.global</strong>, your data may be transferred across borders to facilitate shipment delivery. We ensure appropriate safeguards are in place for all international transfers.</p>
        </div>
      </div>
    </>
  );
};

export default Privacy;
