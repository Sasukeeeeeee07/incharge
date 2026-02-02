import React from 'react';
import { motion } from 'framer-motion';
import { ArrowBigUp, ArrowBigDown, ArrowBigRight, ArrowBigLeft, GripHorizontal } from 'lucide-react';

const Ladder = ({ currentStep, totalSteps = 10, orientation = 'vertical' }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const middleStep = Math.ceil(totalSteps / 2);
  const isHorizontal = orientation === 'horizontal';

  const getStepColor = (step) => {
    if (step === middleStep) return 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]'; // Grey Middle
    
    // In-Charge Zone (Orange) - Active if step is between middle and current (inclusive)
    if (step > middleStep && step <= currentStep) {
      return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]';
    }
    
    // In-Control Zone (Blue) - Active if step is between current and middle (inclusive)
    if (step < middleStep && step >= currentStep) {
      return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]';
    }

    return 'bg-white/10'; // Inactive
  };

  const getAvatarBorder = () => {
    if (currentStep === middleStep) return 'border-slate-400 bg-slate-500';
    if (currentStep > middleStep) return 'border-green-500 bg-green-500';
    return 'border-red-500 bg-red-500';
  };

  return (
    <div className={`relative flex h-full ${isHorizontal ? 'w-full flex-col justify-center px-4' : 'w-[120px] flex-col-reverse justify-between py-5 mx-auto'}`}>
      {/* Background line for horizontal */}
      {isHorizontal && (
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
      )}
      
      <div className={`relative flex flex-1 ${isHorizontal ? 'flex-row justify-between items-center' : 'flex-col-reverse justify-between items-center w-full h-full'}`}>
        {steps.map((step) => (
          <div 
            key={step} 
            className={`transition-colors duration-300 relative ${step === currentStep ? 'z-50' : 'z-10'} ${
              isHorizontal 
                ? 'w-2 h-2 rounded-full' 
                : 'w-full h-2 rounded-full'
              } ${getStepColor(step)}`}
          >
            {step === currentStep && (
              <motion.div
                layoutId="avatar"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`absolute left-1/2 -translate-x-1/2 rounded-full border-2 ${getAvatarBorder()} z-30 flex items-center justify-center shadow-lg transform ${
                  isHorizontal ? '-top-10 w-8 h-8 -ml-3' : '-top-[30px] w-10 h-10'
                }`}
              >
                 {currentStep === middleStep && (
                   <GripHorizontal className="text-white w-2/3 h-2/3" />
                 )}
                 {currentStep > middleStep && (
                   <motion.div
                     animate={isHorizontal ? { x: [0, 3, 0] } : { y: [0, -3, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                   >
                     {isHorizontal ? (
                       <ArrowBigRight className="text-white fill-white w-full h-full p-1" />
                     ) : (
                       <ArrowBigUp className="text-white fill-white w-full h-full p-1" />
                     )}
                   </motion.div>
                 )}
                 {currentStep < middleStep && (
                   <motion.div
                     animate={isHorizontal ? { x: [0, -3, 0] } : { y: [0, 3, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                   >
                     {isHorizontal ? (
                       <ArrowBigLeft className="text-white fill-white w-full h-full p-1" />
                     ) : (
                       <ArrowBigDown className="text-white fill-white w-full h-full p-1" />
                     )}
                   </motion.div>
                 )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ladder;
