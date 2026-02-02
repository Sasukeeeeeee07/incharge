import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Speedometer = ({ currentStep, totalSteps }) => {
  const normalizedValue = (currentStep - 1) / (totalSteps - 1);
  const angle = normalizedValue * 160 - 80;
  const [needleSettled, setNeedleSettled] = useState(false);

  const getActiveSegment = () => {
    if (normalizedValue > 0.51) return 'in-charge';
    if (normalizedValue < 0.49) return 'in-control';
    return 'balanced';
  };

  const activeSegment = getActiveSegment();

  useEffect(() => {
    setNeedleSettled(false);
    const timer = setTimeout(() => setNeedleSettled(true), 1200);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const segmentColors = {
    'in-control': '#3b82f6',
    'balanced': '#94a3b8',
    'in-charge': '#f97316'
  };

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center lg:justify-start p-2 sm:p-4 md:p-6 lg:pt-2">
      <motion.div 
        className="w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[450px] bg-slate-900/20 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-4 lg:-mt-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col items-center relative"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Intense Animated Background Glow */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${
            activeSegment === 'in-control' ? 'from-blue-500/25 via-blue-500/10' : 
            activeSegment === 'balanced' ? 'from-slate-500/25 via-slate-500/10' : 'from-orange-500/25 via-orange-500/10'
          } to-transparent rounded-[2rem] pointer-events-none blur-2xl`}
          animate={{ 
            opacity: needleSettled ? [0.4, 0.8, 0.4] : 0.4,
            scale: needleSettled ? [1, 1.05, 1] : 1
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Radial Glow Overlay */}
        <div className={`absolute inset-0 bg-gradient-radial ${
          activeSegment === 'in-control' ? 'from-blue-500/20' : 
          activeSegment === 'balanced' ? 'from-slate-500/20' : 'from-orange-500/20'
        } via-transparent to-transparent rounded-[2rem] pointer-events-none`} />

        {/* Speedometer SVG Container */}
        <div className="relative w-full aspect-[2/1] flex items-center justify-center mb-4 sm:mb-2">
          <svg viewBox="0 0 240 130" className="w-full h-full overflow-visible drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <defs>
              {/* Ultra Premium Glow Filter */}
              <filter id="ultraGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="8" result="blur1"/>
                <feGaussianBlur stdDeviation="15" result="blur2"/>
                <feGaussianBlur stdDeviation="25" result="blur3"/>
                <feMerge>
                  <feMergeNode in="blur3"/>
                  <feMergeNode in="blur2"/>
                  <feMergeNode in="blur1"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Subtle track glow */}
              <filter id="trackGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"/>
              </filter>

              {/* Needle Glow */}
              <filter id="needleGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feFlood floodColor="white" floodOpacity="0.8"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Background Track with Glow */}
            <path
              d="M 30 120 A 90 90 0 0 1 210 120"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="16"
              strokeLinecap="round"
              filter="url(#trackGlow)"
            />

            {/* Active Segments with Intense Glow */}
            <motion.path 
              d="M 30 120 A 90 90 0 0 1 104.4 31.4"
              fill="none" 
              stroke="#3b82f6"
              strokeWidth="15"
              strokeLinecap="round"
              animate={{ 
                strokeOpacity: activeSegment === 'in-control' ? [0.9, 1, 0.9] : 0.05,
                strokeWidth: activeSegment === 'in-control' ? [15, 19, 15] : 15
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                filter: activeSegment === 'in-control' && needleSettled 
                  ? 'drop-shadow(0 0 25px #3b82f6) drop-shadow(0 0 40px #3b82f6)' 
                  : 'none' 
              }}
            />

            <motion.path 
              d="M 104.4 31.4 A 90 90 0 0 1 135.6 31.4"
              fill="none" 
              stroke="#94a3b8"
              strokeWidth="15"
              strokeLinecap="round"
              animate={{ 
                strokeOpacity: activeSegment === 'balanced' ? [0.9, 1, 0.9] : 0.05,
                strokeWidth: activeSegment === 'balanced' ? [15, 19, 15] : 15
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                filter: activeSegment === 'balanced' && needleSettled 
                  ? 'drop-shadow(0 0 25px #94a3b8) drop-shadow(0 0 40px #94a3b8)' 
                  : 'none' 
              }}
            />

            <motion.path 
              d="M 135.6 31.4 A 90 90 0 0 1 210 120"
              fill="none" 
              stroke="#f97316"
              strokeWidth="15"
              strokeLinecap="round"
              animate={{ 
                strokeOpacity: activeSegment === 'in-charge' ? [0.9, 1, 0.9] : 0.05,
                strokeWidth: activeSegment === 'in-charge' ? [15, 19, 15] : 15
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                filter: activeSegment === 'in-charge' && needleSettled 
                  ? 'drop-shadow(0 0 25px #f97316) drop-shadow(0 0 40px #f97316)' 
                  : 'none' 
              }}
            />

            {/* Center pivot base with glow */}
            {/* <circle cx="120" cy="120" r="12" fill="#0f172a" opacity="0.9" filter="url(#trackGlow)" />
            <circle cx="120" cy="120" r="8" fill="url(#pivotGradient)" /> */}
            
            <defs>
              <radialGradient id="pivotGradient">
                <stop offset="0%" stopColor="#334155"/>
                <stop offset="100%" stopColor="#0f172a"/>
              </radialGradient>
            </defs>
          </svg>

          {/* REFINED NEEDLE WITH INTENSE GLOW */}
          <motion.div
            initial={{ rotate: -80 }}
            animate={{ rotate: angle }}
            transition={{ 
              type: 'spring', 
              stiffness: 50, 
              damping: 25,
              mass: 1.8,
              delay: 0.4
            }}
            style={{ originX: '50%', originY: '100%' }}
            className="absolute left-1/2 bottom-0 w-[3px] sm:w-1 h-[70%] -translate-x-1/2 z-40"
          >
            {/* Sleek Needle with Aura */}
            <motion.div 
              className="w-full h-full relative"
              animate={{
                filter: needleSettled 
                  ? `drop-shadow(0 0 8px ${segmentColors[activeSegment]}) drop-shadow(0 0 15px ${segmentColors[activeSegment]})` 
                  : 'drop-shadow(0 0 0px transparent)'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {/* Main needle body */}
              <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-gray-600 via-gray-100 to-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              
              {/* Glowing Accent Tip */}
              <motion.div 
                className={`absolute top-0 inset-x-0 h-[20%] rounded-t-full bg-gradient-to-b ${
                  activeSegment === 'in-control' ? 'from-blue-500' : 
                  activeSegment === 'balanced' ? 'from-slate-400' : 'from-orange-500'
                } to-transparent`}
                animate={{ 
                  opacity: needleSettled ? [0.8, 1, 0.8] : 0.7,
                  boxShadow: needleSettled 
                    ? [`0 0 10px ${segmentColors[activeSegment]}`, `0 0 20px ${segmentColors[activeSegment]}`, `0 0 10px ${segmentColors[activeSegment]}`]
                    : 'none'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Metallic highlight */}
              <div className="absolute left-[25%] top-0 bottom-0 w-[15%] bg-white/50 blur-[0.5px] rounded-full" />
            </motion.div>

            {/* Hub Cap with Glow */}
            <motion.div 
              className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-400 border border-slate-900 shadow-lg flex items-center justify-center"
              animate={{
                boxShadow: needleSettled 
                  ? [`0 0 8px ${segmentColors[activeSegment]}`, `0 0 15px ${segmentColors[activeSegment]}`, `0 0 8px ${segmentColors[activeSegment]}`]
                  : '0 4px 6px rgba(0,0,0,0.3)'
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                  activeSegment === 'in-control' ? 'bg-blue-500' : 
                  activeSegment === 'balanced' ? 'bg-slate-400' : 'bg-orange-500'
                }`}
                animate={{
                  boxShadow: needleSettled 
                    ? [`0 0 4px ${segmentColors[activeSegment]}`, `0 0 8px ${segmentColors[activeSegment]}`, `0 0 4px ${segmentColors[activeSegment]}`]
                    : 'none'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Labels with Enhanced Glow */}
        <div className="w-full flex justify-between items-center px-2 sm:px-4 mb-6 sm:mb-2">
          <motion.div 
            className="flex flex-col items-center"
            animate={{ 
              scale: activeSegment === 'in-control' ? 1.1 : 1,
              opacity: activeSegment === 'in-control' ? 1 : 0.4
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className={`w-2 h-2 rounded-full mb-1 ${
                activeSegment === 'in-control' ? 'bg-blue-500' : 'bg-blue-500/30'
              }`}
              animate={{
                boxShadow: activeSegment === 'in-control' && needleSettled
                  ? ['0 0 8px #3b82f6', '0 0 16px #3b82f6', '0 0 8px #3b82f6']
                  : '0 0 0px transparent'
              }}
              transition={{ 
                boxShadow: { duration: needleSettled ? 2 : 0.8, repeat: needleSettled ? Infinity : 0, ease: "easeInOut" }
              }}
            />
            <motion.span 
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                activeSegment === 'in-control' ? 'text-blue-500' : 'text-blue-500/60'
              }`}
              animate={{
                textShadow: activeSegment === 'in-control' && needleSettled ? '0 0 10px #3b82f6' : '0 0 0px transparent'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >In-Control</motion.span>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center"
            animate={{ 
              scale: activeSegment === 'balanced' ? 1.1 : 1,
              opacity: activeSegment === 'balanced' ? 1 : 0.4
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className={`w-2 h-2 rounded-full mb-1 ${
                activeSegment === 'balanced' ? 'bg-slate-400' : 'bg-slate-400/30'
              }`}
              animate={{
                boxShadow: activeSegment === 'balanced' && needleSettled
                  ? ['0 0 8px #94a3b8', '0 0 16px #94a3b8', '0 0 8px #94a3b8']
                  : '0 0 0px transparent'
              }}
              transition={{ 
                boxShadow: { duration: needleSettled ? 2 : 0.8, repeat: needleSettled ? Infinity : 0, ease: "easeInOut" }
              }}
            />
            <motion.span 
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                activeSegment === 'balanced' ? 'text-slate-400' : 'text-slate-400/60'
              }`}
              animate={{
                textShadow: activeSegment === 'balanced' && needleSettled ? '0 0 10px #94a3b8' : '0 0 0px transparent'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >Balanced</motion.span>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center"
            animate={{ 
              scale: activeSegment === 'in-charge' ? 1.1 : 1,
              opacity: activeSegment === 'in-charge' ? 1 : 0.4
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className={`w-2 h-2 rounded-full mb-1 ${
                activeSegment === 'in-charge' ? 'bg-orange-500' : 'bg-orange-500/30'
              }`}
              animate={{
                boxShadow: activeSegment === 'in-charge' && needleSettled
                  ? ['0 0 8px #f97316', '0 0 16px #f97316', '0 0 8px #f97316']
                  : '0 0 0px transparent'
              }}
              transition={{ 
                boxShadow: { duration: needleSettled ? 2 : 0.8, repeat: needleSettled ? Infinity : 0, ease: "easeInOut" }
              }}
            />
            <motion.span 
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                activeSegment === 'in-charge' ? 'text-orange-500' : 'text-orange-500/60'
              }`}
              animate={{
                textShadow: activeSegment === 'in-charge' && needleSettled ? '0 0 10px #f97316' : '0 0 0px transparent'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >In-Charge</motion.span>
          </motion.div>
        </div>

        {/* Result Display with Enhanced Glow */}
        <div className="flex flex-col items-center">
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 100 }}
            style={{ 
              backgroundImage: `linear-gradient(135deg, ${
                activeSegment === 'in-control' ? '#3b82f6, #60a5fa, #93c5fd' : 
                activeSegment === 'balanced' ? '#94a3b8, #cbd5e1, #e2e8f0' : '#f97316, #fb923c, #fbbf24'
              })`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: needleSettled 
                ? `drop-shadow(0 10px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${segmentColors[activeSegment]}80)` 
                : 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))'
            }}
          >
            {activeSegment === 'in-control' ? 'In-Control' : 
             activeSegment === 'balanced' ? 'Balanced' : 'In-Charge'}
          </motion.h2>

          {/* Progress Bar with Glow */}
          <div className="w-28 sm:w-36 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <motion.div 
              className={`h-full rounded-full ${
                activeSegment === 'in-control' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
                activeSegment === 'balanced' ? 'bg-gradient-to-r from-slate-500 to-slate-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${normalizedValue * 100}%` }}
              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
              style={{
                boxShadow: needleSettled ? `0 0 10px ${segmentColors[activeSegment]}` : 'none'
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Speedometer;
