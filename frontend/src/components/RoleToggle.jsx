import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RoleToggle = ({ role, onNext }) => {
  // role: 'In-Charge' | 'In-Control' | null

  const isCharge = role === 'In-Charge';
  const isControl = role === 'In-Control';
  const isActive = isCharge || isControl;

  // Configuration — responsive sizes
  const dotSize = 58;
  const padding = 5;
  const trackHeight = 70;

  // Fit within mobile screen (viewport - card padding ~48px), max 320px
  const containerWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth - 48 : 320, 320);

  // Calculate dot positions
  const maxMove = containerWidth - dotSize - padding * 2;
  const centerPos = maxMove / 2;

  // Dynamic Shadow for container only
  const shadowColor = isCharge ? 'rgba(34, 197, 94, 0.6)' : isControl ? 'rgba(239, 68, 68, 0.6)' : 'rgba(0,0,0,0.3)';

  return (
    <div className="flex flex-col items-center justify-center mt-8 w-full">
      <div className="relative">
        {/* Toggle Background */}
        <motion.div
          animate={{
            backgroundColor: isCharge ? '#22c55e' : isControl ? '#ef4444' : '#334155',
            boxShadow: isActive ? `0 0 20px ${shadowColor}` : 'inset 0 2px 10px rgba(0,0,0,0.3)',
            scale: isActive ? [1, 1.02, 1] : 1
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            scale: { repeat: isActive ? Infinity : 0, duration: 1.5, repeatType: "reverse" }
          }}
          style={{ width: containerWidth, height: trackHeight + padding }}
          className="rounded-full flex items-center relative overflow-hidden border-4 border-white/5"
        >
          {/* Images inside the toggle track */}
          <AnimatePresence>
            {isCharge && (
              <motion.img
                key="win-img"
                src="/win.png"
                alt="Win"
                initial={{ opacity: 0, x: -50, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="absolute left-4 h-[90%] object-contain pointer-events-none"
                style={{ top: '5%' }}
              />
            )}
            {isControl && (
              <motion.img
                key="loss-img"
                src="/loss.jpg"
                alt="Loss"
                initial={{ opacity: 0, x: 50, scale: 0.5, rotate: 20 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="absolute right-4 h-[90%] object-contain pointer-events-none"
                style={{ top: '5%' }}
              />
            )}
          </AnimatePresence>

          {/* Center Text "NEXT" */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNext) onNext();
                }}
              >
                <span className="text-white font-black text-xl tracking-widest uppercase drop-shadow-md bg-black/20 hover:bg-black/40 px-6 py-2 rounded-full transition-colors border border-white/20">
                  Next &gt;&gt;
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sliding Dot */}
          <motion.div
            className="absolute bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.4)] z-10 flex items-center justify-center overflow-hidden"
            style={{
              width: dotSize,
              height: dotSize,
              top: padding / 2 + 2,
              left: padding
            }}
            animate={{
              x: isCharge ? maxMove : isControl ? 0 : centerPos,
              rotate: isActive ? 360 : 0
            }}
            transition={{
              type: "spring", stiffness: 250, damping: 25,
              rotate: { duration: 0.6, ease: "backOut" }
            }}
          >
            {/* Logo always visible inside the dot */}
            <img
              src="/logo1.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>

        </motion.div>
      </div>

      {/* Feedback Text Animation */}
      <div className="h-8 mt-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key={role}
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`text-2xl font-black tracking-widest uppercase drop-shadow-md ${isCharge ? 'text-green-500' : 'text-red-500'}`}
            >
              {role}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoleToggle;
