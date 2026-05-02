import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, Calendar, MapPin } from 'lucide-react';
import ReportForm from '../components/report/ReportForm.jsx';
import ReportSuccess from '../components/report/ReportSuccess.jsx';
import { useReport } from '../hooks/useReport.js';
import { AppContext } from '../context/AppContext.jsx';

const ReportFake = () => {
  const { submitting, success, caseId, submitFakeReport, resetForm } = useReport();
  const { recentReports } = useContext(AppContext);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    const response = await submitFakeReport(formData);
    if (response?.success) {
      setShowSuccess(true);
    }
  };

  return (
    <div className="bg-bg-primary py-12" id="report-fake-section">
      {/* Header */}
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Report <span className="text-danger">Fake Medicine</span>
          </h1>
          <p className="text-text-secondary">
            Help us protect India by reporting counterfeit medicines you've encountered
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {showSuccess && caseId ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReportSuccess
                  caseId={caseId}
                  onStartNew={() => {
                    setShowSuccess(false);
                    resetForm();
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReportForm onSubmit={handleSubmit} loading={submitting} />
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-bg-secondary border border-border-color rounded-2xl p-6 h-full flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color">
                <FileText className="text-primary" size={24} />
                <h3 className="text-xl font-bold text-text-primary">Recent Reports</h3>
              </div>
              
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '600px' }}>
                {recentReports.slice(0, 6).map((report, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-bg-primary border border-border-color hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-text-primary truncate pr-2">{report.medicineName}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        report.status === 'confirmed' ? 'bg-danger/20 text-danger' :
                        report.status === 'investigating' ? 'bg-warning/20 text-warning' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-text-secondary">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                          Batch: {report.batch}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} />
                        <span className="truncate">{report.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border-color">
                <div className="p-3 bg-primary/10 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/90">
                    These are recently generated reports verified by MediGuard's system. Submitting false reports is a punishable offense.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFake;
