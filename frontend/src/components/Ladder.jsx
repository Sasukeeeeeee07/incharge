import React from 'react';
import { motion } from 'framer-motion';

const Ladder = ({ currentStep }) => {
  const steps = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="ladder-container">
      {steps.map((step) => (
        <div 
          key={step} 
          className={`ladder-step ${step === currentStep ? 'active' : ''}`}
        >
          {step === currentStep && (
            <motion.div
              layoutId="avatar"
              className="avatar"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '40px',
                background: 'white',
                borderRadius: '50%',
                border: '4px solid var(--accent-primary)',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
               👤
            </motion.div>
          )}
        </div>
      ))}
      <style>{`
        .ladder-container {
          height: 600px;
          display: flex;
          flex-direction: column-reverse;
          justify-content: space-between;
          padding: 40px 0;
          position: relative;
        }
        .ladder-step {
          width: 250px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          transition: background 0.3s;
        }
        .ladder-step.active {
          background: var(--accent-primary);
          box-shadow: 0 0 20px var(--accent-primary);
        }
      `}</style>
    </div>
  );
};

export default Ladder;
