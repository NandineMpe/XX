import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-24 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <img src="https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/favicon.ico" alt="Augentik Logo" className="w-16 h-16 mb-6" />
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Audit.<span className="text-white">Reimagined</span></h1>
        <p className="text-lg max-w-2xl text-center mb-8 text-gray-200">
          Statutory audits don’t just cost money. They cost time, team focus, and peace of mind.<br />
          We’re here to help you take that time back.
        </p>
        <div className="flex gap-4">
          <a href="#how-it-works" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transition">Learn More</a>
          <a href="#" className="px-6 py-3 rounded-full bg-white text-black font-semibold shadow-lg hover:scale-105 transition">Get Started</a>
        </div>
      </section>

      {/* How Augentik Works Section */}
      <section id="how-it-works" className="w-full max-w-4xl py-20 px-4 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-8 text-center">How Augentik Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <span className="text-4xl mb-4">🔍</span>
            <h3 className="font-semibold text-xl mb-2">Ingest</h3>
            <p className="text-gray-300 text-center">Upload your documents and data securely to the Augentik platform.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <span className="text-4xl mb-4">🧠</span>
            <h3 className="font-semibold text-xl mb-2">Analyze</h3>
            <p className="text-gray-300 text-center">Our AI-powered engine processes and analyzes your data for audit insights.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <span className="text-4xl mb-4">📊</span>
            <h3 className="font-semibold text-xl mb-2">Report</h3>
            <p className="text-gray-300 text-center">Get clear, actionable reports and recommendations instantly.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 