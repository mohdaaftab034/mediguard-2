import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext.jsx';

// Helper to safely render Lucide icons and avoid "undefined" component errors
const SafeIcon = ({ name, ...props }) => {
  const Icon = LucideIcons[name];
  if (!Icon) {
    console.warn(`MediGuard Warning: Icon "${name}" not found in lucide-react.`);
    return null;
  }
  return <Icon {...props} />;
};

const MedicalBackground = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.name === 'dark';

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-smooth ${isDark ? 'opacity-25' : 'opacity-40'}`}>
      {/* Dynamic Glowing Orbs matching medical colors (Cyan/Teal) */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-cyan-600/30 mix-blend-screen' : 'bg-primary/20 mix-blend-multiply'}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-teal-600/30 mix-blend-screen' : 'bg-secondary/20 mix-blend-multiply'}`} style={{ animation: 'pulse 4s infinite' }} />

      {/* Floating Medicine Icons */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[15%] right-[20%] ${isDark ? 'text-teal-400/30' : 'text-primary/20'}`}
      >
        <SafeIcon name="Pill" size={80} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className={`absolute bottom-[25%] left-[15%] ${isDark ? 'text-cyan-400/30' : 'text-secondary/20'}`}
      >
        <SafeIcon name="Syringe" size={100} strokeWidth={1} />
      </motion.div>

      <motion.div
        animate={{ x: [0, 20, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute top-[60%] right-[10%] ${isDark ? 'text-teal-300/20' : 'text-primary/15'}`}
      >
        <SafeIcon name="FlaskConical" size={120} strokeWidth={1} />
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className={`absolute top-[30%] left-[8%] ${isDark ? 'text-cyan-500/20' : 'text-secondary/15'}`}
      >
        <SafeIcon name="Stethoscope" size={90} strokeWidth={1} />
      </motion.div>

      {/* Medical Crosses */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[40%] left-[30%] ${isDark ? 'text-teal-400/30' : 'text-primary/20'}`}
      >
        <SafeIcon name="Plus" size={40} strokeWidth={3} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute bottom-[20%] right-[30%] ${isDark ? 'text-cyan-400/30' : 'text-secondary/20'}`}
      >
        <SafeIcon name="Plus" size={60} strokeWidth={3} />
      </motion.div>

      {/* Additional Medical Icons for Richer Background */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`absolute top-[5%] left-[40%] ${isDark ? 'text-teal-500/15' : 'text-primary/10'}`}
      >
        <SafeIcon name="Microscope" size={140} strokeWidth={0.5} />
      </motion.div>

      <motion.div
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[70%] left-[5%] ${isDark ? 'text-cyan-600/10' : 'text-secondary/10'}`}
      >
        <SafeIcon name="Dna" size={160} strokeWidth={0.5} />
      </motion.div>

      <motion.div
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute bottom-[10%] right-[45%] ${isDark ? 'text-teal-400/20' : 'text-primary/15'}`}
      >
        <SafeIcon name="Thermometer" size={70} strokeWidth={1} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[45%] right-[35%] ${isDark ? 'text-red-500/10' : 'text-danger/10'}`}
      >
        <SafeIcon name="Heart" size={50} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className={`absolute top-[80%] right-[20%] ${isDark ? 'text-cyan-300/15' : 'text-secondary/10'}`}
      >
        <SafeIcon name="ShieldCheck" size={110} strokeWidth={0.5} />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className={`absolute bottom-[40%] right-[5%] ${isDark ? 'text-teal-200/10' : 'text-primary/5'}`}
      >
        <SafeIcon name="Clipboard" size={130} strokeWidth={0.5} />
      </motion.div>

      {/* Dense Icon Layer */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className={`absolute top-[10%] left-[20%] ${isDark ? 'text-cyan-500/10' : 'text-primary/5'}`}
      >
        <SafeIcon name="Droplets" size={40} />
      </motion.div>

      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className={`absolute bottom-[5%] left-[30%] ${isDark ? 'text-teal-500/10' : 'text-secondary/5'}`}
      >
        <SafeIcon name="Vial" size={60} />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className={`absolute top-[25%] left-[50%] ${isDark ? 'text-cyan-400/10' : 'text-primary/5'}`}
      >
        <SafeIcon name="TestTube" size={50} />
      </motion.div>

      <motion.div
        animate={{ x: [-10, 10, -10] }}
        transition={{ duration: 12, repeat: Infinity }}
        className={`absolute top-[55%] left-[25%] ${isDark ? 'text-teal-300/10' : 'text-secondary/5'}`}
      >
        <SafeIcon name="BriefcaseMedical" size={80} strokeWidth={0.5} />
      </motion.div>

      <motion.div
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute top-[15%] left-[10%] ${isDark ? 'text-cyan-200/10' : 'text-primary/5'}`}
      >
        <SafeIcon name="Plus" size={100} strokeWidth={0.5} />
      </motion.div>

      <motion.div
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ duration: 7, repeat: Infinity }}
        className={`absolute bottom-[15%] right-[10%] ${isDark ? 'text-teal-600/10' : 'text-secondary/5'}`}
      >
        <SafeIcon name="Pill" size={120} strokeWidth={0.5} />
      </motion.div>

      {/* Grid Pattern overlay for a laboratory/clinical feel */}
      <div
        className="absolute inset-0 transition-smooth"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: isDark ? 0.3 : 0.5
        }}
      />
    </div>
  );
};

export default MedicalBackground;
