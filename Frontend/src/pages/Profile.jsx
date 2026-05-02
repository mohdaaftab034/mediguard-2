import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Edit2, 
  Camera, 
  CheckCircle, 
  Bell, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Store
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, chemist, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme.name === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalScans: 0, genuineFound: 0, reportsFiled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      // Fetch scan history to calculate genuine count and total scans
      const [dashboardRes, historyRes] = await Promise.all([
        api.get('/dashboard/user'),
        api.get('/scan/history?limit=100')
      ]);

      const dashboardData = dashboardRes.data.data;
      const historyData = historyRes.data.data.scans || [];
      
      const genuineCount = historyData.filter(s => s.result === 'GENUINE' || s.result === 'LOOKS_PROFESSIONAL').length;

      setStats({
        totalScans: dashboardData.totalScans || 0,
        genuineFound: genuineCount,
        reportsFiled: dashboardData.recentReports?.length || 0
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const userInfo = [
    { icon: Mail, label: 'Email Address', value: user?.email || 'Not provided', isEmail: true },
    { icon: Phone, label: 'Phone Number', value: user?.phone || '+91 00000 00000' },
    { icon: MapPin, label: 'Location', value: `${user?.city || 'Unknown'}, ${user?.state || 'Unknown'}` },
    { icon: Shield, label: 'Account Role', value: user?.role?.toUpperCase() || 'PUBLIC' },
  ];

  if (user?.role === 'chemist' && chemist) {
    userInfo.push(
      { icon: Store, label: 'Pharmacy Name', value: chemist.shopName },
      { icon: ShieldCheck, label: 'License Number', value: chemist.licenseNumber },
      { icon: MapPin, label: 'Shop Address', value: chemist.address }
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-bold animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-secondary border border-border-color rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-bg-primary text-4xl font-bold shadow-2xl overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-bg-primary border border-border-color rounded-xl text-primary shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-text-primary">{user?.name || 'User Name'}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                  <ShieldCheck size={14} />
                  Verified Profile
                </span>
              </div>
              <p className="text-text-secondary flex items-center justify-center md:justify-start gap-2 mb-4 max-w-full overflow-hidden">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="truncate">{user?.email}</span>
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-bg-primary rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-bg-primary border border-border-color text-danger rounded-xl font-bold text-sm hover:bg-danger/10 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Account Details */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-bg-secondary border border-border-color rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {userInfo.map((info, i) => (
                  <div key={i} className={`space-y-1 ${info.isEmail ? 'sm:col-span-2' : ''}`}>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{info.label}</p>
                    <div className="flex items-center gap-3 p-3 bg-bg-primary border border-border-color rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors">
                      <info.icon size={18} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
                      <p className={`text-text-primary font-medium ${info.isEmail ? 'break-all' : 'truncate'}`}>{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg-secondary border border-border-color rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Security & Notifications
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Push Notifications', desc: 'Alerts for medicine recalls and safety warnings', enabled: true },
                  { label: 'Email Alerts', desc: 'Weekly summary of reports and new authentications', enabled: true },
                  { label: 'Location Tracking', desc: 'Used to find nearby verified chemists', enabled: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-bg-primary border border-border-color rounded-2xl">
                    <div>
                      <p className="font-bold text-text-primary text-sm">{item.label}</p>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.enabled ? 'bg-success' : 'bg-bg-secondary'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Activity Stats */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-bg-secondary border border-border-color rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-text-primary mb-6">Activity Summary</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-center">
                  <p className="text-3xl font-bold text-primary">{stats.totalScans}</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase mt-1 tracking-widest">Total Scans</p>
                </div>
                <div className="p-4 bg-success/5 border border-success/10 rounded-2xl text-center">
                  <p className="text-3xl font-bold text-success">{stats.genuineFound}</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase mt-1 tracking-widest">Genuine Found</p>
                </div>
                <div className="p-4 bg-danger/5 border border-danger/10 rounded-2xl text-center">
                  <p className="text-3xl font-bold text-danger">{stats.reportsFiled}</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase mt-1 tracking-widest">Reports Filed</p>
                </div>
              </div>
              <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-bg-primary border border-border-color rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all">
                View Full History <ChevronRight size={16} />
              </button>
            </motion.div>

            {/* Safety Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl text-white shadow-xl shadow-teal-500/20"
            >
              <ShieldCheck size={32} className="mb-4 opacity-80" />
              <h4 className="font-bold text-lg mb-2">MediGuard Elite</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                You have contributed {stats.reportsFiled} reports to the safety community. Thank you for making healthcare safer!
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
