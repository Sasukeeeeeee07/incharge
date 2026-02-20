import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 font-sans">

      {/* Static background blobs — CSS animations instead of framer-motion (no JS overhead) */}
      <div className="splash-blob splash-blob-1" />
      <div className="splash-blob splash-blob-2" />

      {/* Floating dots — pure CSS */}
      <div className="splash-dot splash-dot-1" />
      <div className="splash-dot splash-dot-2" />
      <div className="splash-dot splash-dot-3" />

      {/* Main card — CSS animation, no framer spring overhead */}
      <div className="splash-card glass-card w-full max-w-2xl p-8 sm:p-12 md:p-16 relative z-10 mx-4 sm:mx-0 shadow-2xl border-blue-200/10 bg-white/5 rounded-3xl">

        {/* Logo */}
        <div className="flex justify-center mb-8 sm:mb-10 splash-logo">
          <div className="splash-crown-glow">
            <Crown className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-orange-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-8 sm:mb-10 splash-content">
          <div className="relative inline-block mb-3 sm:mb-4">
            <img
              src="/smmart_Logo.png"
              alt="Smmart Logo"
              className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] mx-auto h-auto object-contain"
            />
            <p className="text-white text-lg sm:text-xl font-medium tracking-widest uppercase mt-8 splash-text-1">
              Daily
            </p>
            <h1 className="text-2xl sm:text-4xl font-black mt-2 tracking-wider splash-text-2">
              <span className="text-orange-400">In-Charge</span>
              <span className="text-white/40 mx-3 text-xl sm:text-2xl italic font-light">vs.</span>
              <span className="text-blue-400">In-Control</span>
            </h1>
            <p className="text-white text-lg sm:text-xl font-medium tracking-widest uppercase mt-2 splash-text-3">
              Tracker
            </p>
            <div className="absolute -bottom-2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 splash-cta">
          <button
            onClick={() => navigate('/login')}
            className="group w-full sm:w-auto min-w-[280px] py-4 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-500/30 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-colors duration-200 flex items-center justify-center gap-3 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <p className="text-white/40 text-sm splash-text-4">Click to continue</p>
        </div>

        {/* Decorative rings — pure CSS, no JS */}
        <div className="absolute top-8 right-8 w-20 h-20 border-2 border-blue-400/20 rounded-full splash-ring splash-ring-1" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-orange-400/20 rounded-full splash-ring splash-ring-2" />
      </div>
    </div>
  );
};

export default SplashScreen;
