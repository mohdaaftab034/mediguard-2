import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Database, Search, ArrowRight, Activity, Microscope, Fingerprint, Pill, Globe, Lock, User } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Antigravity from '../components/Antigravity';

const floatingIcons = [Shield, Database, Search, Activity, Microscope, Fingerprint, Pill, Globe, Lock];

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDark = theme.name === 'dark';

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'chemist') return '/dashboard/chemist';
    return '/dashboard/user';
  };

  return (
    <div className={`relative min-h-screen overflow-hidden transition-smooth ${isDark ? 'bg-[#000814] text-white' : 'bg-bg-primary text-text-primary'}`}>

      {/* Header Elements */}
      <div className="absolute top-8 md:top-12 left-8 md:left-12 right-8 md:right-12 z-50 flex justify-between items-center">
        {/* Logo + Site Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={isDark ? '/logo.png' : '/logo-light.png'} 
            alt="MediGuard Logo" 
            className="h-14 md:h-16 object-contain group-hover:scale-105 transition-transform" 
          />
          <span className={`text-lg md:text-xl font-extrabold tracking-tight transition-smooth ${
            isDark ? 'text-white' : 'text-text-primary'
          }`}>
            Medi<span className={`${
              isDark ? 'text-cyan-400' : 'text-primary'
            }`}>Guard</span>
          </span>
        </Link>

        {/* User Avatar */}
        <Link 
          to={getDashboardLink()}
          className={`flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-xl shadow-sm transition-all hover:scale-105 ${
            isDark 
              ? 'bg-white/[0.08] border-white/20 text-white hover:bg-white/[0.15] hover:border-white/30' 
              : 'bg-white/70 border-white/50 text-text-primary hover:bg-white/90'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-primary/10 text-primary'
          }`}>
            <User size={18} />
          </div>
          <span className="font-bold text-sm hidden md:block">
            {user ? user.name : 'Sign In'}
          </span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Classy inner border wrapper for the viewport */}
        <div className={`absolute inset-4 md:inset-6 z-20 pointer-events-none rounded-[2rem] border transition-smooth ${
          isDark ? 'border-white/10 shadow-[inset_0_0_100px_rgba(255,255,255,0.02)]' : 'border-primary/20 shadow-[inset_0_0_100px_rgba(0,119,182,0.05)]'
        }`} />

        {/* Antigravity — scoped to hero viewport only, captures cursor inside hero */}
        <div className="absolute inset-0 z-0">
          <Antigravity
            count={isDark ? 600 : 350}
            magnetRadius={18}
            ringRadius={8}
            waveSpeed={0.3}
            waveAmplitude={1.2}
            particleSize={isDark ? 1.4 : 1}
            lerpSpeed={0.12}
            color={isDark ? '#00D1FF' : '#0077B6'}
            autoAnimate={true}
            particleVariance={0.8}
            rotationSpeed={0.08}
          />
        </div>

        {/* Ambient Overlay to ensure readability */}
        <div className={`absolute inset-0 z-10 pointer-events-none transition-smooth ${
          isDark 
            ? 'bg-gradient-to-b from-[#000814]/30 via-transparent to-[#000814]/60' 
            : 'bg-gradient-to-b from-white/20 via-transparent to-bg-primary/50'
        }`} />

        <div className="relative z-20 w-full max-w-6xl pt-24 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="relative z-10 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] uppercase tracking-[0.4em] font-black mb-10 transition-smooth ${
                  isDark 
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                    : 'bg-primary/5 border-primary/20 text-primary'
                }`}
              >
                <Lock size={12} strokeWidth={3} />
                <span>Next-Gen Verification Protocol</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 leading-[0.9] uppercase transition-smooth ${
                  isDark ? 'text-white' : 'text-text-primary'
                }`}
              >
                Pharmaceutical <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-smooth drop-shadow-sm ${
                  isDark 
                    ? 'from-cyan-300 via-blue-400 to-emerald-400' 
                    : 'from-primary via-secondary to-success'
                }`}>
                  Integrity.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`max-w-xl mx-auto text-base md:text-lg mb-12 leading-relaxed font-medium tracking-wide transition-smooth ${
                  isDark ? 'text-blue-100/50' : 'text-text-secondary'
                }`}
              >
                Counterfeit medicines cost lives. We make sure yours are real.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link
                  to={ROUTES.SCANNER}
                  className={`px-7 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2.5 group ${
                    isDark 
                      ? 'bg-cyan-500 text-[#000814] shadow-[0_8px_30px_rgba(6,182,212,0.25)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.4)]' 
                      : 'bg-primary text-white shadow-[0_8px_30px_rgba(0,119,182,0.15)] hover:shadow-[0_12px_40px_rgba(0,119,182,0.25)]'
                  } hover:scale-[1.05] active:scale-95`}
                >
                  Launch Scanner
                  <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={ROUTES.BATCH_VERIFY}
                  className={`px-7 py-3 rounded-full border font-semibold text-sm transition-all backdrop-blur-xl flex items-center gap-2.5 ${
                    isDark 
                      ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.08]' 
                      : 'bg-white/60 border-border-color text-text-primary hover:bg-white/80'
                  } hover:scale-[1.05] active:scale-95`}
                >
                  <Database size={16} />
                  Verify Batch
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Infinite Icon Wave */}
      <div className={`relative py-8 overflow-hidden border-b border-t backdrop-blur-2xl shadow-lg ${isDark ? 'border-white/10 bg-white/[0.05]' : 'border-white/40 bg-white/40'}`}>
        <div className={`absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r ${isDark ? 'from-[#000814]' : 'from-bg-primary'} to-transparent`} />
        <div className={`absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l ${isDark ? 'from-[#000814]' : 'from-bg-primary'} to-transparent`} />
        <motion.div
          className="flex gap-16 items-center w-max"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {[...floatingIcons, ...floatingIcons, ...floatingIcons, ...floatingIcons].map((Icon, idx) => (
            <div key={idx} className={`transition-colors duration-500 hover:scale-125 ${isDark ? 'text-white/20 hover:text-cyan-400' : 'text-primary/20 hover:text-primary'}`}>
              <Icon size={32} strokeWidth={1.5} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Feature Grid */}
      <section className="relative z-20 py-24 md:py-32 px-6 overflow-hidden">
        {/* Decorative Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className={`absolute top-20 left-10 w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen opacity-50 ${isDark ? 'bg-cyan-900/30' : 'bg-primary/10'}`} />
          <div className={`absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen opacity-50 ${isDark ? 'bg-blue-900/30' : 'bg-secondary/10'}`} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Search,
                title: "Neural Vision",
                desc: "Sub-millimeter analysis of label textures, typography, and holograms using specialized medical vision models.",
                color: "primary"
              },
              {
                icon: Globe,
                title: "Global Sync",
                desc: "Live cross-referencing with international regulatory databases and manufacturer batch repositories.",
                color: "secondary"
              },
              {
                icon: Activity,
                title: "CDSCO Direct",
                desc: "Automated alert triggers and regulatory reporting protocols for pharmaceutical investigations.",
                color: "success"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className={`group relative p-8 rounded-3xl border backdrop-blur-2xl transition-all duration-500 ${
                  isDark 
                    ? 'bg-white/[0.08] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/[0.12] hover:border-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]' 
                    : 'bg-white/70 border-white/50 shadow-[0_8px_32px_rgba(0,119,182,0.1)] hover:bg-white/90 hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,119,182,0.15)]'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border transition-smooth ${
                  isDark 
                    ? `bg-${feature.color}/10 text-primary border-primary/20` 
                    : `bg-primary/5 text-primary border-primary/10`
                } group-hover:scale-110`}>
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className={`text-2xl font-bold mb-5 tracking-tight group-hover:text-primary transition-colors ${isDark ? 'text-white' : 'text-text-primary'}`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed font-medium transition-smooth ${isDark ? 'text-blue-100/40' : 'text-text-secondary'}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Network Section */}
      <section className="relative z-20 py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className={`inline-block px-5 py-2 rounded-full border text-[10px] uppercase tracking-[0.4em] font-black mb-10 transition-smooth ${
            isDark ? 'bg-white/[0.03] border-white/5 text-blue-100/30' : 'bg-primary/5 border-primary/10 text-primary'
          }`}>
            Verified Network
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-12 uppercase tracking-tighter transition-smooth ${isDark ? 'text-white' : 'text-text-primary'}`}>
            Securing the <span className="text-primary">Global</span> Supply Chain
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-16">
             <div className="flex -space-x-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`w-14 h-14 rounded-full border-4 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer hover:z-10 hover:scale-110 ${
                    isDark ? 'border-[#050A1A] bg-white/5' : 'border-white bg-primary/5'
                  }`}>
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="opacity-80 hover:opacity-100" />
                  </div>
                ))}
             </div>
             <div className="text-left">
                <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-text-primary'}`}>2,000+</p>
                <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-blue-100/30' : 'text-text-secondary'}`}>Medical Partners</p>
             </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 opacity-20 hover:opacity-40 transition-opacity duration-1000 ${isDark ? 'text-white' : 'text-text-primary'}`}>
             <div className="flex items-center justify-center font-black text-2xl tracking-tighter">PHARMA-CO</div>
             <div className="flex items-center justify-center font-black text-2xl tracking-tighter">MED-TRUST</div>
             <div className="flex items-center justify-center font-black text-2xl tracking-tighter">BIO-SECURE</div>
             <div className="flex items-center justify-center font-black text-2xl tracking-tighter">HEALTH-NET</div>
          </div>
        </motion.div>
      </section>

      {/* Floating Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: Math.random() * 0.3, 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%' 
            }}
            animate={{ 
              y: [null, '-30px', '30px', '0px'],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute w-1 h-1 rounded-full blur-[1px] ${isDark ? 'bg-cyan-500' : 'bg-primary'}`}
          />
        ))}
      </div>

      {/* Bottom Gradient Fade */}
      {!isDark && <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-bg-primary to-transparent z-10 pointer-events-none" />}
      {isDark && <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050A1A] to-transparent z-10 pointer-events-none" />}
    </div>
  );
};

export default Home;
