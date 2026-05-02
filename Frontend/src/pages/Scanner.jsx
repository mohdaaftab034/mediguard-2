import React, { useMemo, useState, useEffect } from 'react';
import api from '../services/api.js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ImageSection from '../components/scanner/ImageSection';
import ChatSection from '../components/scanner/ChatSection';
import { scanMedicine, chatFollowUp } from '../services/scannerService';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, ShieldAlert, ArrowRight, Search, History, Trash2 } from 'lucide-react';


const ANALYSIS_DISCLAIMER = 'AI packaging analysis cannot confirm if medicine contents are genuine. Combine this with batch verification and purchase from verified chemists for maximum safety.';

const statusConfig = {
  LOOKS_PROFESSIONAL: {
    color: 'green',
    icon: CheckCircle,
    title: 'Packaging Looks Professional',
    subtitle: 'No visual red flags detected. Verify batch number for more certainty.'
  },
  HAS_ISSUES: {
    color: 'red',
    icon: ShieldAlert,
    title: 'Packaging Issues Detected',
    subtitle: 'Visual problems found. Do not consume without further verification.'
  },
  HIGH_QUALITY_SUPER_FAKE: {
    color: 'red',
    icon: ShieldAlert,
    title: 'High-Quality Super-Fake Detected',
    subtitle: 'Batch appears valid, but packaging contains printing errors.'
  },
  UNCLEAR: {
    color: 'amber',
    icon: AlertTriangle,
    title: 'Image Too Unclear to Analyze',
    subtitle: 'Please upload a clearer photo of the medicine packaging.'
  }
};

const parseAnalysisText = (text = '') => {
  const value = (pattern) => text.match(pattern)?.[1]?.trim() || 'Not visible';
  const batchNumber = value(/Batch(?:\s*Number|)?:\s*(.+)/i);
  const redFlagsMatch = text.match(/VISUAL RED FLAGS FOUND\s*\n([\s\S]*?)(?=MEDICINE DETAILS READ FROM IMAGE|IMPORTANT DISCLAIMER|$)/i);
  const redFlags = redFlagsMatch
    ? redFlagsMatch[1]
        .split('\n')
        .map((line) => line.replace(/^[-•*\d.\s]+/, '').trim())
        .filter((line) => line.length > 5 && !/^No visual red flags detected$/i.test(line))
    : [];
  const confidence = Number(text.match(/Confidence:\s*(\d+)%/i)?.[1] || 70);

  return {
    batchNumber,
    confidence,
    fields: {
      medicineName: value(/Name:\s*(.+)/i),
      manufacturer: value(/Manufacturer:\s*(.+)/i),
      mrp: value(/MRP:\s*(.+)/i),
      batchNumber,
      expiryDate: value(/Expiry:\s*(.+)/i),
      drugLicense: value(/Drug License No:\s*(.+)/i),
      manufacturerAddress: value(/Manufacturer Address:\s*(.+)/i)
    },
    redFlags
  };
};

const formatAnalysisForUser = (scanStatus, confidence, parsed) => {
  const statusText = statusConfig[scanStatus]?.title || 'Image Too Unclear to Analyze';
  const flagsText = parsed.redFlags?.length
    ? parsed.redFlags.map((flag, index) => `${index + 1}. ${flag}`).join('\n')
    : 'No visual red flags detected';

  return [
    'PACKAGING INSPECTION REPORT',
    '',
    'OVERALL STATUS',
    `Result: ${statusText}`,
    `Confidence: ${confidence}%`,
    '',
    'MEDICINE DETAILS',
    `Medicine Name: ${parsed.fields?.medicineName || 'Not visible'}`,
    `Manufacturer: ${parsed.fields?.manufacturer || 'Not visible'}`,
    `Batch Number: ${parsed.fields?.batchNumber || 'Not visible'}`,
    `Expiry Date: ${parsed.fields?.expiryDate || 'Not visible'}`,
    `MRP: ${parsed.fields?.mrp || 'Not visible'}`,
    `Drug License Number: ${parsed.fields?.drugLicense || 'Not visible'}`,
    `Manufacturer Address: ${parsed.fields?.manufacturerAddress || 'Not visible'}`,
    ''
  ].join('\n');
};

const STEPS = [
  { id: 1, label: 'AI Packaging Analysis', icon: '🔍', description: 'Analyzing packaging quality and visual elements...' },
  { id: 2, label: 'Batch Verification', icon: '📋', description: 'Checking batch number against recalled medicines database...' },
  { id: 3, label: 'Medicine Database Check', icon: '💊', description: 'Looking up medicine information and warnings...' },
  { id: 4, label: 'Nearby Chemist Search', icon: '🏪', description: 'Finding verified chemists near you...' },
];

const Scanner = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('mediguard_scan_history_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState({});
  const [pipelineComplete, setPipelineComplete] = useState(() => {
    return localStorage.getItem('mediguard_scan_complete') === 'true';
  });
  const [userLocation, setUserLocation] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [currentScanId, setCurrentScanId] = useState(() => {
    return localStorage.getItem('mediguard_current_scan_id');
  });

  useEffect(() => {
    localStorage.setItem('mediguard_scan_history_messages', JSON.stringify(messages));
    localStorage.setItem('mediguard_scan_complete', pipelineComplete);
    if (currentScanId) localStorage.setItem('mediguard_current_scan_id', currentScanId);
  }, [messages, pipelineComplete, currentScanId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setUserLocation({ lat, lng });
          
          try {
            // Simple reverse geocoding to get city for fallback search
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await res.json();
            if (data.city || data.locality) {
              setUserLocation(prev => ({ ...prev, city: data.city || data.locality }));
            }
          } catch (e) {
            console.error('Reverse geocoding failed', e);
          }
        },
        () => setUserLocation(null)
      );
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setMessages([]);
      localStorage.removeItem('mediguard_scan_history_messages');
      toast.success('History cleared');
    }
  };

  const handleNewImageUpload = (file) => {
    setUploadedImage(file);
    setPipelineComplete(false);
    setCurrentStep(0);

    if (messages.length > 0) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'system',
        type: 'separator',
        content: `New medicine uploaded — ${new Date().toLocaleTimeString()}`,
        timestamp: new Date()
      }]);
    }
  };

  const handleAnalyze = async (file) => {
    if (!file) return toast.error('Please upload a medicine image first');

    setIsAnalyzing(true);
    setCurrentStep(1);
    setStepResults({});
    setPipelineComplete(false);
    setMessages([]); // Clear previous chat for a new session

    // Add pipeline progress message to chat
    const progressId = Date.now();
    setMessages(prev => [...prev, {
      id: progressId,
      role: 'ai',
      type: 'pipeline_progress',
      content: 'Starting complete medicine analysis...',
      timestamp: new Date()
    }]);

    try {
      // Simulate step progress while API call runs
      const step1Timer = setTimeout(() => setCurrentStep(2), 2000);
      const step2Timer = setTimeout(() => setCurrentStep(3), 4000);
      const step3Timer = setTimeout(() => setCurrentStep(4), 6000);

      const response = await scanMedicine(file, userLocation);
      
      // Clear timers and finish steps
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      const { pipeline, scanId } = response.data;
      setCurrentScanId(scanId);
      
      // Show all steps as done
      setCurrentStep(5);

      setStepResults({
        1: {
          summary: `${pipeline.step1_packaging.status} — ${pipeline.step1_packaging.confidence}% confidence`,
          badge: pipeline.step1_packaging.status === 'GENUINE' ? 'Professional' : pipeline.step1_packaging.status,
          alert: pipeline.step1_packaging.status === 'FAKE'
        },
        2: {
          summary: pipeline.step2_batch.status === 'RECALLED' 
            ? `⚠️ RECALLED — ${pipeline.step2_batch.recallReason?.substring(0, 50)}` 
            : pipeline.step2_batch.status === 'NOT_DETECTED'
            ? 'Batch not visible in image'
            : 'Not in recalled list',
          badge: pipeline.step2_batch.status === 'RECALLED' ? 'RECALLED' 
            : pipeline.step2_batch.status === 'NOT_DETECTED' ? 'Not Detected'
            : 'Clear',
          alert: pipeline.step2_batch.status === 'RECALLED'
        },
        3: {
          summary: pipeline.step3_medicineDb.found 
            ? `Found in ${pipeline.step3_medicineDb.source}`
            : 'Not found in database',
          badge: pipeline.step3_medicineDb.found ? 'Found' : 'Not Found',
          alert: false
        },
        4: {
          summary: pipeline.step4_chemists.length > 0
            ? `${pipeline.step4_chemists.length} verified chemist(s) nearby`
            : 'No verified chemists found nearby',
          badge: pipeline.step4_chemists.length > 0 ? `${pipeline.step4_chemists.length} Found` : 'None',
          alert: false
        }
      });

      setPipelineComplete(true);

      // Replace progress message with full report
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== progressId);
        return [...filtered, {
          id: Date.now(),
          role: 'ai',
          type: 'full_report',
          pipeline,
          scanId,
          timestamp: new Date()
        }];
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentStep(0);
      toast.error(error?.response?.data?.message || 'Analysis failed. Please try again.');
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== progressId);
        return [...filtered, {
          id: Date.now(),
          role: 'ai',
          type: 'error',
          content: 'Analysis failed. Please upload a clearer image and try again.',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMedicineContext = () => {
    if (!stepResults || !pipelineComplete) return ''
    const fields = stepResults[1]?.fields || {} // or from pipelineResult if available
    // Using pipeline results directly if we have them
    const p = messages.find(m => m.type === 'full_report')?.pipeline
    const f = p?.step1_packaging?.fields || {}
    
    return `Medicine Name: ${f.medicineName || 'Unknown'}
Generic Name: ${f.genericName || 'Unknown'}
Manufacturer: ${f.manufacturer || 'Unknown'}
MRP: ${f.mrp || 'Unknown'}
Category: ${f.category || 'Unknown'}
Batch Status: ${p?.step2_batch?.status || 'NOT_CHECKED'}
Risk Level: ${p?.finalRiskLevel || 'UNKNOWN'}`
  }



  const handleSendMessage = async (content) => {
    if (!content.trim() || isTyping) return
    if (!pipelineComplete) {
      toast.error('Please analyze a medicine first before asking questions')
      return
    }

    const userMessage = content.trim()

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      type: 'chat',
      content: userMessage,
      timestamp: new Date()
    }])

    setIsTyping(true)

    try {
      const response = await api.post('/scan/chat', {
        message: userMessage,
        scanId: currentScanId,
        medicineContext: getMedicineContext(),
        conversationHistory: messages
          .filter(m => m.type === 'chat')
          .slice(-6)
          .map(m => ({ role: m.role, content: m.content }))
      })

      const { reply, sources } = response.data.data

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ai',
        type: 'chat',
        content: reply,
        sources: sources || [],
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Chat failed:', error)
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ai',
        type: 'chat',
        content: 'Sorry, I could not get information right now. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[60%] right-[0%] w-[40%] h-[50%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">
            MediGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Scanner.</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg">
            Complete 4-step medicine verification pipeline using AI, Batch Databases, and Official Registries.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-[95%] 2xl:max-w-[1400px] mx-auto">
          {/* Left Section: Image Upload */}
          <div className="w-full lg:w-[45%]">
            <motion.div
              layout
              className="bg-bg-secondary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-color shadow-2xl sticky top-24"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Analysis Protocol Active</span>
                </div>
                <button 
                  onClick={() => navigate('/dashboard/history')}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary hover:text-primary transition-all uppercase"
                >
                  <History size={14} />
                  Scan History
                </button>
              </div>
            
              <ImageSection 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                onImageUpload={handleNewImageUpload}
              />

              {!isAnalyzing && !pipelineComplete && (
                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Search size={16} className="text-primary" />
                    How the pipeline works
                  </h3>
                  <div className="space-y-4">
                    {STEPS.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-bg-primary border border-border-color flex items-center justify-center text-xs text-primary shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{step.label}</p>
                          <p className="text-[11px] text-text-secondary">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Section: Chat Window */}
          <div className="w-full lg:w-[55%]">
            <ChatSection 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isTyping={isTyping}
              hasAnalyzed={pipelineComplete}
              onClearHistory={handleClearHistory}
              currentStep={currentStep}
              stepResults={stepResults}
              pipelineSteps={STEPS}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
