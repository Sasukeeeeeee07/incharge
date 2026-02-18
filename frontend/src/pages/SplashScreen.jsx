import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ArrowRight } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 font-sans">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-2/5 h-2/5 bg-gradient-radial from-blue-600 to-transparent rounded-full opacity-15 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-orange-500 to-transparent rounded-full opacity-15 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Floating Sparkles */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full"
        animate={{
          y: [0, -30, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 2
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full"
        animate={{
          y: [0, -40, 0],
          opacity: [0, 1, 0],
          scale: [0, 1.2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 3
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-300 rounded-full"
        animate={{
          y: [0, -25, 0],
          opacity: [0, 0.8, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          delay: 2.5
        }}
      />

      {/* Main Splash Card */}
      <motion.div
        className="glass-card w-full max-w-2xl p-8 sm:p-12 md:p-16 relative z-10 mx-4 sm:mx-0 shadow-2xl border-blue-200/10 bg-white/5 backdrop-blur-xl rounded-3xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: 0.2
        }}
      >
        {/* Logo with Glow */}
        <motion.div
          className="flex justify-center mb-8 sm:mb-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.5
          }}
        >
          <motion.div
            className="relative"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                'drop-shadow(0 0 40px rgba(249, 115, 22, 0.6))',
                'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Crown className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-orange-400" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Brand Title replaced with Logo */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div
            className="relative inline-block mb-3 sm:mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.8,
              duration: 1,
              ease: "easeOut"
            }}
          >
            <img
              src="/smmart_Logo.png"
              alt="Smmart Logo"
              className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] mx-auto h-auto object-contain"
            />
            <motion.p
              className="text-white text-lg sm:text-xl font-medium tracking-widest uppercase mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Daily
            </motion.p>
            <motion.h1
              className="text-2xl sm:text-4xl font-black mt-2 tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >

              <span className="text-orange-400">In-Charge</span>
              <span className="text-white/40 mx-3 text-xl sm:text-2xl italic font-light">vs.</span>
              <span className="text-blue-400">In-Control</span>
            </motion.h1>
            <motion.p
              className="text-white text-lg sm:text-xl font-medium tracking-widest uppercase mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              Tracker
            </motion.p>
            <motion.div
              className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.8 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
          </motion.div>


        </div>

        {/* Enter Button */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 1.8,
            type: "spring",
            stiffness: 100
          }}
        >
          <motion.button
            onClick={() => navigate('/login')}
            className="group w-full sm:w-auto min-w-[280px] py-4 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-500/30 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 flex items-center justify-center gap-3"
            whileHover={{
              y: -4,
              scale: 1.02,
              boxShadow: '0 20px 40px -12px rgba(249, 115, 22, 0.4)'
            }}
            whileTap={{
              y: 0,
              scale: 0.98
            }}
            animate={{
              boxShadow: [
                '0 10px 30px -10px rgba(249, 115, 22, 0.3)',
                '0 15px 40px -10px rgba(249, 115, 22, 0.5)',
                '0 10px 30px -10px rgba(249, 115, 22, 0.3)'
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>

          <motion.p
            className="text-white/40 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
          >
            Click to continue
          </motion.p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-8 right-8 w-20 h-20 border-2 border-blue-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-8 left-8 w-16 h-16 border-2 border-orange-400/20 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
