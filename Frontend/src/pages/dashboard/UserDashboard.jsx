import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  History, 
  AlertCircle, 
  Search, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalScans: 0,
    genuineScans: 0,
    suspiciousScans: 0,
    unreadAlerts: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch scans, alerts, and popular medicines in parallel
      const [scansRes, alertsRes, popularRes] = await Promise.all([
        api.get('/scan/history?limit=5'),
        api.get('/alerts/unread/count'),
        api.get('/medicines/popular')
      ]);

      const scans = scansRes.data.data.scans;
      setRecentScans(scans);
      setPopularMedicines(popularRes.data.data);
      
      // Calculate stats from scans
      const total = scansRes.data.data.total || scans.length;
      const genuine = scans.filter(s => s.result === 'GENUINE' || s.result === 'LOOKS_PROFESSIONAL').length;
      const suspicious = scans.filter(s => ['FAKE', 'SUSPICIOUS', 'HAS_ISSUES'].includes(s.result)).length;

      setStats({
        totalScans: total,
        genuineScans: genuine,
        suspiciousScans: suspicious,
        unreadAlerts: alertsRes.data.data.count || 0
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Scan Medicine',
      desc: 'Use AI to verify packaging',
      icon: Zap,
      link: '/#scanner-section',
      color: '#00B4D8',
      bg: 'rgba(0,180,216,0.1)'
    },
    {
      title: 'Batch Verify',
      desc: 'Manual recall check',
      icon: Search,
      link: '/batch-verify',
      color: '#06D6A0',
      bg: 'rgba(6,214,160,0.1)'
    },
    {
      title: 'Safety Alerts',
      desc: 'Official CDSCO warnings',
      icon: AlertCircle,
      link: '/alerts',
      color: '#EF233C',
      bg: 'rgba(239,35,60,0.1)',
      badge: stats.unreadAlerts > 0 ? stats.unreadAlerts : null
    },
    {
      title: 'Report Fake',
      desc: 'Submit suspect medicine',
      icon: Shield,
      link: '/report-fake',
      color: '#FFB703',
      bg: 'rgba(255,183,3,0.1)'
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
              User <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-text-secondary mt-1">Your personal medicine safety command center.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDashboardData}
              className="p-2 bg-bg-secondary border border-border-color rounded-lg text-text-secondary hover:text-primary transition-colors"
              title="Refresh Data"
            >
              <Clock size={20} />
            </button>
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold text-sm hover:bg-primary/20 transition-all"
            >
              My Profile <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Scans', value: stats.totalScans, icon: History, color: '#9CA3AF' },
            { label: 'Genuine Found', value: stats.genuineScans, icon: CheckCircle, color: '#06D6A0' },
            { label: 'Suspicious', value: stats.suspiciousScans, icon: XCircle, color: '#EF233C' },
            { label: 'New Alerts', value: stats.unreadAlerts, icon: AlertCircle, color: '#FFB703' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-secondary border border-border-color p-5 rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div style={{ color: stat.color }} className="p-2 bg-bg-primary rounded-lg border border-border-color">
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Quick Actions & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, i) => (
                <Link 
                  key={i}
                  to={action.link}
                  className="group flex items-center gap-4 p-4 bg-bg-secondary border border-border-color rounded-2xl hover:border-primary/50 transition-all"
                >
                  <div style={{ background: action.bg, color: action.color }} className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <action.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{action.title}</p>
                      {action.badge && (
                        <span className="px-2 py-0.5 bg-danger text-white text-[10px] font-bold rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Need Help Card */}
            <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 rounded-3xl mt-8">
              <h4 className="font-bold text-text-primary mb-2">Need help?</h4>
              <p className="text-sm text-text-secondary mb-4">Not sure how to verify a medicine? Check our detailed guide.</p>
              <Link to="/how-it-works" className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight size={14} />
              </Link>
            </div>

            {/* Popular Medicines Card */}
            {popularMedicines.length > 0 && (
              <div className="bg-bg-secondary border border-border-color rounded-3xl p-6 mt-8">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  Trending Medicines
                </h3>
                <div className="space-y-4">
                  {popularMedicines.map((med, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-text-primary truncate">{med.name}</p>
                        <p className="text-[10px] text-text-secondary truncate">{med.manufacturer}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xs font-bold text-primary">{med.searchCount} searches</div>
                        <div className="text-[9px] text-text-secondary">
                          {med.lastSearchedAt ? new Date(med.lastSearchedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/medicine-info" className="mt-6 block text-center py-2 bg-bg-primary border border-border-color rounded-xl text-xs font-bold text-text-secondary hover:text-primary transition-all">
                  Browse All Medicines
                </Link>
              </div>
            )}
          </div>

          {/* Right: Recent Scans History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em]">Recent Activity</h3>
              <Link to="/dashboard/history" className="text-xs font-bold text-primary hover:underline">View All History</Link>
            </div>

            <div className="bg-bg-secondary border border-border-color rounded-3xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-text-secondary">Loading activity...</div>
              ) : recentScans.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
                    <History size={32} className="text-text-secondary" />
                  </div>
                  <p className="text-text-primary font-bold">No Scans Yet</p>
                  <p className="text-text-secondary text-sm mb-6">Start by scanning your first medicine packaging.</p>
                  <Link to="/#scanner-section" className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm">
                    Open Scanner
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border-color">
                  {recentScans.map((scan, i) => (
                    <div key={scan._id} className="p-4 hover:bg-bg-primary/50 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border-color shrink-0">
                        <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-primary truncate">
                          {scan.medicineDetails?.name || 'Unknown Medicine'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md inline-block mb-1 ${
                          scan.result === 'GENUINE' || scan.result === 'LOOKS_PROFESSIONAL' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-danger/10 text-danger'
                        }`}>
                          {scan.result?.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-text-secondary flex items-center justify-end gap-1">
                          Risk: <span className={
                            scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'HIGH' ? 'text-danger font-bold' : 'text-success'
                          }>{scan.riskLevel}</span>
                        </div>
                      </div>
                      <Link 
                        to={`/dashboard/history?scan=${scan._id}`}
                        className="p-2 text-text-secondary hover:text-primary transition-colors"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
               <div className="p-4 bg-bg-secondary border border-border-color rounded-2xl flex gap-3">
                 <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                   <Shield size={18} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-text-primary">Always Check Batch</p>
                   <p className="text-[10px] text-text-secondary leading-tight mt-1">If AI says genuine but batch is recalled, the medicine is unsafe.</p>
                 </div>
               </div>
               <div className="p-4 bg-bg-secondary border border-border-color rounded-2xl flex gap-3">
                 <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                   <AlertCircle size={18} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-text-primary">Report Issues</p>
                   <p className="text-[10px] text-text-secondary leading-tight mt-1">Found a fake? Report it to help others and official authorities.</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
