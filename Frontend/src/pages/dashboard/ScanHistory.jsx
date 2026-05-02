import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, ChevronRight, ExternalLink, X, FileText } from 'lucide-react';
import FullReportCard from '../../components/scanner/FullReportCard';
import { toast } from 'react-hot-toast';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, genuine: 0, fake: 0, suspicious: 0 });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scan/history');
      const data = res.data.data.scans;
      setScans(data);
      
      // Calculate stats
      const s = data.reduce((acc, curr) => {
        acc.total++;
        if (curr.result === 'GENUINE') acc.genuine++;
        else if (curr.result === 'FAKE') acc.fake++;
        else acc.suspicious++;
        return acc;
      }, { total: 0, genuine: 0, fake: 0, suspicious: 0 });
      setStats(s);
    } catch (error) {
      toast.error('Failed to fetch scan history');
    } finally {
      setLoading(false);
    }
  };

  const fetchScanDetails = async (id) => {
    try {
      const res = await api.get(`/scan/history/${id}`);
      setSelectedScan(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch scan details');
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesSearch = (scan.medicineDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterResult === 'ALL' || scan.result === filterResult;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Scan History</h1>
        <p className="text-text-secondary">View and manage all your previous medicine scans.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Scans', val: stats.total, color: 'primary' },
          { label: 'Genuine', val: stats.genuine, color: 'success' },
          { label: 'Fake Detected', val: stats.fake, color: 'danger' },
          { label: 'Suspicious', val: stats.suspicious, color: 'warning' },
        ].map((s, i) => (
          <div key={i} className="bg-bg-secondary p-4 rounded-2xl border border-border-color">
            <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 text-${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search by medicine name..."
            className="w-full bg-bg-secondary border border-border-color rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-bg-secondary border border-border-color rounded-xl py-2.5 px-4 text-sm text-text-primary outline-none focus:border-primary"
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <option value="ALL">All Results</option>
            <option value="GENUINE">Genuine</option>
            <option value="FAKE">Fake</option>
            <option value="SUSPICIOUS">Suspicious</option>
          </select>
        </div>
      </div>

      {/* Scan Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="text-center py-20 bg-bg-secondary rounded-3xl border border-dashed border-border-color">
          <FileText size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
          <p className="text-text-secondary">No scans found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredScans.map((scan) => (
            <motion.div 
              key={scan._id}
              whileHover={{ y: -4 }}
              className="bg-bg-secondary rounded-2xl border border-border-color overflow-hidden group cursor-pointer"
              onClick={() => fetchScanDetails(scan._id)}
            >
              <div className="h-40 relative overflow-hidden">
                <img 
                  src={scan.imageUrl} 
                  alt={scan.medicineDetails?.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    scan.result === 'GENUINE' ? 'bg-success/20 text-success' : 
                    scan.result === 'FAKE' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  } backdrop-blur-md`}>
                    {scan.result}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-black/40 text-white backdrop-blur-md">
                    Risk: {scan.riskLevel || 'LOW'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-text-primary line-clamp-1">{scan.medicineDetails?.name || 'Unknown Medicine'}</h3>
                  <ChevronRight size={18} className="text-text-secondary" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-secondary mb-4">
                  <Calendar size={14} />
                  {new Date(scan.createdAt).toLocaleDateString()} at {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border-color">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${scan.batchStatus === 'RECALLED' ? 'bg-danger' : 'bg-success'}`}></div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">{scan.batchStatus?.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase">View Report</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScan(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-primary rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="p-2">
                <FullReportCard 
                  pipeline={{
                    step1_packaging: {
                      status: selectedScan.result,
                      confidence: selectedScan.confidence,
                      fields: selectedScan.medicineDetails,
                      redFlags: selectedScan.reasons || []
                    },
                    step2_batch: selectedScan.batchDetails || { status: selectedScan.batchStatus },
                    step3_medicineDb: selectedScan.medicineDbResult || { found: false },
                    step4_chemists: selectedScan.nearbyChemists || [],
                    finalRiskLevel: selectedScan.riskLevel || 'LOW',
                    finalStatus: selectedScan.result
                  }}
                  scanId={selectedScan._id}
                />
              </div>

              <div className="p-6 bg-bg-secondary border-t border-border-color flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  Scan ID: <span className="font-mono text-xs">{selectedScan._id}</span>
                </div>
                <button 
                  onClick={() => window.open(selectedScan.imageUrl, '_blank')}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <ExternalLink size={16} />
                  View Original Image
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanHistory;
