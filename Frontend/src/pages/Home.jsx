import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Database, Search, ArrowRight, Activity, Microscope, Fingerprint, Pill, Globe, Lock, User } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

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
    <div className={`relative min-h-screen overflow-hidden transition-smooth ${isDark ? 'bg-[#050A1A] text-white' : 'bg-bg-primary text-text-primary'}`}>
      {/* Header Elements */}
      <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
        {/* Logo */}
        <img 
          src={isDark ? '/logo.png' : '/logo-light.png'} 
          alt="MediGuard Logo" 
          className="h-12 md:h-16 object-contain" 
        />

        {/* User Avatar */}
        <Link 
          to={getDashboardLink()}
          className={`flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md transition-all hover:scale-105 ${
            isDark 
              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
              : 'bg-white/50 border-primary/20 text-text-primary hover:bg-white/80'
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

      {/* Universal Cinematic Background Layer */}
      <div 
        className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-smooth ${isDark ? 'opacity-40 mix-blend-overlay' : 'opacity-10'}`}
        style={{ backgroundImage: 'url("/hero-visual.png")' }}
      />
      <div className={`fixed inset-0 z-0 pointer-events-none transition-smooth ${
        isDark 
          ? 'bg-gradient-to-b from-[#050A1A] via-[#050A1A]/95 to-[#0A1628]' 
          : 'bg-gradient-to-b from-white via-white/95 to-bg-primary'
      }`} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-12">
        {/* Animated Scan Line Effect */}
        <motion.div 
          initial={{ top: '-10%' }}
          animate={{ top: '110%' }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className={`absolute left-0 right-0 h-[1px] z-10 pointer-events-none ${isDark ? 'bg-cyan-400/20 blur-[1px]' : 'bg-primary/30 blur-[1px]'}`}
        />

        <div className="relative z-20 w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-[40px] border backdrop-blur-[40px] p-12 md:p-24 text-center transition-smooth ${
              isDark 
                ? 'border-white/5 bg-white/[0.03] shadow-2xl shadow-black/50' 
                : 'border-white bg-white/40 shadow-xl shadow-primary/5'
            }`}
          >
            {/* Ambient Glows */}
            <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] transition-smooth ${isDark ? 'bg-cyan-500/10' : 'bg-primary/5'}`} />
            <div className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] transition-smooth ${isDark ? 'bg-blue-600/10' : 'bg-secondary/5'}`} />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.4em] font-black mb-10 transition-smooth ${
                  isDark 
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                    : 'bg-primary/5 border-primary/20 text-primary'
                }`}
              >
                <Lock size={12} strokeWidth={3} />
                <span>Encrypted Forensic Protocol</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-10 leading-[0.9] uppercase transition-smooth ${isDark ? 'text-white' : 'text-text-primary'}`}
              >
                Pharmaceutical <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-smooth ${
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
                className={`max-w-2xl mx-auto text-lg md:text-xl mb-14 leading-relaxed font-medium tracking-tight transition-smooth ${
                  isDark ? 'text-blue-100/40' : 'text-text-secondary'
                }`}
              >
                The gold standard in drug authenticity verification. Deploy 
                advanced neural vision to detect counterfeit medical products instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-6"
              >
                <Link
                  to={ROUTES.SCANNER}
                  className={`px-12 py-6 rounded-2xl font-black text-lg transition-all flex items-center gap-4 group ${
                    isDark 
                      ? 'bg-cyan-500 text-[#050A1A] shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.5)]' 
                      : 'bg-primary text-white shadow-[0_20px_50px_rgba(0,119,182,0.2)] hover:shadow-[0_25px_60px_rgba(0,119,182,0.3)]'
                  } hover:scale-[1.02] active:scale-95`}
                >
                  Launch Forensic Agent
                  <ArrowRight size={22} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={ROUTES.BATCH_VERIFY}
                  className={`px-12 py-6 rounded-2xl border font-bold text-lg transition-all backdrop-blur-xl flex items-center gap-4 ${
                    isDark 
                      ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.08]' 
                      : 'bg-white/60 border-border-color text-text-primary hover:bg-white/80'
                  }`}
                >
                  <Database size={22} />
                  Verify Batch
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-20 py-32 px-6">
        <div className="container mx-auto">
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
                className={`group relative p-10 rounded-[32px] border backdrop-blur-xl transition-all duration-500 ${
                  isDark 
                    ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10' 
                    : 'bg-white/50 border-white hover:bg-white/70 hover:shadow-xl'
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
