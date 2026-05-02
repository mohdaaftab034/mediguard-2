import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { AppContext } from '../../context/AppContext.jsx';
import api from '../../services/api.js';
import { REPORTS, ALERTS, DASHBOARD_STATS } from '../../utils/mockData.js';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalUsers: 0, totalChemists: 0, pendingChemists: 0, activeAlerts: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertDesc, setNewAlertDesc] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      const { stats, recentReports } = res.data.data;
      setStats(stats);
      setReports(recentReports);
    } catch (error) {
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = () => {
    if (!newAlertTitle || !newAlertDesc) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success('Alert added successfully!');
    setNewAlertTitle('');
    setNewAlertDesc('');
  };

  const handleResolveReport = (reportId) => {
    toast.success(`Report ${reportId} marked as resolved`);
  };

  const isMobileView = window.innerWidth < 768;

  if (isMobileView) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Desktop Only</h2>
          <p className="text-text-secondary">Admin panel is optimized for desktop viewing. Please use a larger screen.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Data...</div>;

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">Admin Control Center</h1>
          <p className="text-text-secondary">Manage reports, alerts, and platform users</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Users', value: stats.totalUsers, color: 'primary' },
            { label: 'Total Chemists', value: stats.totalChemists, color: 'success' },
            { label: 'Pending Verification', value: stats.pendingChemists, color: 'warning' },
            { label: 'Active Alerts', value: stats.activeAlerts, color: 'danger' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className={`bg-bg-secondary border border-border-color rounded-xl p-6 text-center shadow-sm`}
            >
              <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-extrabold text-${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border-color">
          {['reports', 'alerts', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-bg-secondary border border-border-color rounded-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4">All Reports</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border-color">
                  <tr>
                    <th className="pb-4 text-text-secondary">ID</th>
                    <th className="pb-4 text-text-secondary">Medicine</th>
                    <th className="pb-4 text-text-secondary">Location</th>
                    <th className="pb-4 text-text-secondary">Status</th>
                    <th className="pb-4 text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-b border-border-color/50 hover:bg-bg-primary/50">
                      <td className="py-4 text-text-primary text-xs font-mono">{report._id.slice(-6)}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-text-primary font-bold">{report.medicineName}</span>
                          <span className="text-[10px] text-text-secondary">{report.reporter?.name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-text-secondary text-sm">{report.location}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            report.status === 'confirmed'
                              ? 'bg-danger/10 text-danger border border-danger/20'
                              : 'bg-warning/10 text-warning border border-warning/20'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleResolveReport(report._id)}
                          className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-text-secondary italic">No recent reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Add Alert Form */}
            <div className="bg-bg-secondary border border-border-color rounded-xl p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Create New Alert</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  placeholder="Alert title"
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <textarea
                  value={newAlertDesc}
                  onChange={(e) => setNewAlertDesc(e.target.value)}
                  placeholder="Alert description"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-color text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleAddAlert}
                  className="w-full px-6 py-3 bg-primary text-bg-primary rounded-lg font-semibold hover:bg-secondary transition-all"
                >
                  Publish Alert
                </button>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-bg-secondary border border-border-color rounded-xl p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Active Alerts</h2>
              <div className="space-y-4">
                {ALERTS.map((alert) => (
                  <div key={alert.id} className="bg-bg-primary rounded-lg p-4 border border-border-color/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-text-primary font-semibold">{alert.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === 'critical'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-bg-secondary border border-border-color rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              User Management
            </h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-bg-primary rounded-lg p-4 text-center border border-border-color/50">
                <p className="text-text-secondary mb-2">Total Users</p>
                <p className="text-3xl font-bold text-primary">2,341</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-4 text-center border border-border-color/50">
                <p className="text-text-secondary mb-2">Verified Chemists</p>
                <p className="text-3xl font-bold text-success">127</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-4 text-center border border-border-color/50">
                <p className="text-text-secondary mb-2">Pending Review</p>
                <p className="text-3xl font-bold text-warning">23</p>
              </div>
            </div>
            <p className="text-text-secondary text-center">User management features coming soon...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
