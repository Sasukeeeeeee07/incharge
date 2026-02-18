import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ConfigurableGauge = ({ score, total, label, color, delay }) => {
  const percentage = total > 0 ? (score / total) : 0;
  const angle = percentage * 180 - 90; // -90 to +90 degrees for semi-circle

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {/* Glow Background */}
      <div className={`absolute inset-0 bg-${color}-500/10 blur-3xl rounded-full`} />

      <div className="relative w-40 h-24 sm:w-48 sm:h-28 overflow-hidden">
        {/* SVG Arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {/* Track */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />

          {/* Progress Bar */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color === 'blue' ? '#3b82f6' : '#f97316'}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage }}
            transition={{ duration: 1.5, delay: delay, ease: "easeOut" }}
            className="drop-shadow-[0_0_10px_currentColor]"
          />
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute bottom-2 left-1/2 w-1 h-20 origin-bottom bg-gradient-to-t from-gray-500 to-white rounded-full z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 20, delay: delay + 0.2 }}
          style={{ translateX: "-50%" }}
        >
          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-${color}-400 shadow-[0_0_10px_currentColor]`} />
        </motion.div>

        {/* Pivot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-200 rounded-full z-20 shadow-lg border border-slate-900" />
      </div>

      {/* Text Stats */}
      <div className="mt-2 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5 }}
          className={`text-3xl font-black text-${color}-400 tracking-tighter`}
          style={{ textShadow: `0 0 20px ${color === 'blue' ? 'rgba(59,130,246,0.5)' : 'rgba(249,115,22,0.5)'}` }}
        >
          {Math.round(percentage * 100)}%
        </motion.div>
        <div className="text-xs uppercase tracking-widest text-text-secondary font-bold mt-1">{label}</div>
        <div className={`text-xs font-mono mt-1 text-${color}-500/60`}>({score} / {total})</div>
      </div>
    </div>
  );
};

const Speedometer = ({ result, score }) => {
  const charge = score?.inCharge || 0;
  const control = score?.inControl || 0;
  const total = charge + control; // Should be 10 usually

  // If no score data (legacy or error), assume 0 to avoid confusing fake data
  const isFallback = !score;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-slate-900/30 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-50" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-text-secondary mb-2">Performance Analysis</h2>
          <div className={`text-4xl sm:text-5xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${result === 'In-Control' ? 'from-blue-400 to-blue-200' : result === 'In-Charge' ? 'from-orange-400 to-orange-200' : 'from-slate-300 via-white to-slate-300'}`}>
            {result}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          {/* In-Control Gauge */}
          <ConfigurableGauge
            score={control}
            total={total}
            label="In-Control"
            color="blue"
            delay={0.2}
          />

          {/* VS Divider (Visual Only) */}
          <div className="hidden md:flex flex-col items-center opacity-30">
            <div className="w-px h-12 bg-white/50" />
            <div className="my-2 font-black text-white/50 italic text-xl">VS</div>
            <div className="w-px h-12 bg-white/50" />
          </div>

          {/* In-Charge Gauge */}
          <ConfigurableGauge
            score={charge}
            total={total}
            label="In-Charge"
            color="orange"
            delay={0.4}
          />
        </div>

      </motion.div>
    </div>
  );
};

export default Speedometer;
