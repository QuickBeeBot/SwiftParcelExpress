
import React from 'react';
import { Helmet } from 'react-helmet-async';

const Cookies = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - SwiftParcel Global</title>
      </Helmet>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none text-white/80">
          <p className="mb-4">This policy explains how SwiftParcel uses cookies and similar technologies to recognize you when you visit our website at swiftparcel.global.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">What are cookies?</h2>
          <p className="mb-4">Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-[#36FFDB]">Controlling Cookies</h2>
          <p className="mb-4">You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager found in the website footer.</p>
        </div>
      </div>
    </>
  );
};

export default Cookies;
