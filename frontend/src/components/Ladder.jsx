import React from 'react';
import { motion } from 'framer-motion';

const Ladder = ({ currentStep, orientation = 'vertical' }) => {
  const steps = Array.from({ length: 10 }, (_, i) => i + 1);
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`relative px-2 flex ${isHorizontal ? 'flex-row w-full justify-between items-center h-16' : 'h-full flex-col-reverse justify-between py-5 w-[150px] mx-auto'}`}>
      {/* Background line for horizontal */}
      {isHorizontal && (
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
      )}
      
      {steps.map((step) => (
        <div 
          key={step} 
          className={`transition-colors duration-300 relative z-10 ${
            isHorizontal 
              ? 'w-2 h-2 rounded-full' 
              : 'w-full h-2 rounded-full'
            } ${step === currentStep ? 'bg-accent-primary shadow-[0_0_20px_theme(colors.accent-primary)]' : 'bg-white/10'}`}
        >
          {step === currentStep && (
            <motion.div
              layoutId="avatar"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`absolute left-1/2 -translate-x-1/2 bg-white rounded-full border-2 border-accent-primary z-10 flex items-center justify-center ${
                isHorizontal ? '-top-10 w-8 h-8 text-sm' : '-top-[30px] w-10 h-10 text-lg'
              }`}
            >
               👤
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Ladder;
