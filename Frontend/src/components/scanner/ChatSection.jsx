import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, Shield, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import AnalysisReportCard from './AnalysisReportCard';
import FullReportCard from './FullReportCard';
import ChatMessageBubble from './ChatMessageBubble';

const PipelineProgress = ({ currentStep, stepResults, steps }) => (
  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {steps.map((step, index) => {
      const stepNum = index + 1
      const isDone = currentStep > stepNum
      const isActive = currentStep === stepNum
      const isPending = currentStep < stepNum

      return (
        <motion.div 
          key={step.id} 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: isDone ? 'rgba(var(--success-rgb), 0.1)'
              : isActive ? 'rgba(var(--primary-rgb), 0.1)'
              : 'rgba(var(--text-secondary-rgb), 0.05)',
            border: `1px solid ${isDone ? 'rgba(var(--success-rgb), 0.3)' 
              : isActive ? 'rgba(var(--primary-rgb), 0.4)' 
              : 'rgba(var(--border-color-rgb), 0.1)'}`,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'rgba(var(--text-secondary-rgb), 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isDone ? '14px' : '16px',
            flexShrink: 0,
            color: 'white'
          }}>
            {isDone ? '✓' : isActive ? (
              <div style={{
                width: '14px', height: '14px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            ) : step.icon}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              color: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600', fontSize: '13px'
            }}>
              {step.label}
            </div>
            {isActive && (
              <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>
                {step.description}
              </div>
            )}
            {isDone && stepResults[stepNum] && (
              <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>
                {stepResults[stepNum].summary}
              </div>
            )}
          </div>

          {isDone && stepResults[stepNum] && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              background: stepResults[stepNum].alert ? 'rgba(239,35,60,0.15)' : 'rgba(6,214,160,0.15)',
              color: stepResults[stepNum].alert ? '#EF233C' : '#06D6A0'
            }}>
              {stepResults[stepNum].badge}
            </span>
          )}
        </motion.div>
      )
    })}
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

const ChatSection = ({ messages, onSendMessage, isTyping, hasAnalyzed, onClearHistory, currentStep, stepResults, pipelineSteps }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, currentStep]);

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-bg-primary rounded-2xl border border-border-color overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border-color bg-bg-secondary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-bold text-text-primary">MediGuard AI</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClearHistory}
          className="p-2 hover:bg-danger/10 text-text-secondary hover:text-danger rounded-lg transition-all"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-chat-pattern"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="p-4 rounded-full bg-bg-secondary border border-border-color">
                <Bot size={40} className="text-primary" />
              </div>
              <div className="max-w-xs">
                <p className="text-text-primary font-bold">Welcome to MediGuard Chat</p>
                <p className="text-text-secondary text-sm">Upload a medicine image and click Analyze to get started. You can then ask me any questions about the medicine.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.type === 'separator' || msg.isSeparator) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 my-8"
                  >
                    <div className="flex-1 h-[1px] bg-border-color/50" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap">
                      {msg.content}
                    </span>
                    <div className="flex-1 h-[1px] bg-border-color/50" />
                  </motion.div>
                );
              }

              if (msg.type === 'pipeline_progress') {
                return (
                  <div key={msg.id} className="w-full">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter mb-2">Analysis Progress</p>
                    <PipelineProgress 
                      currentStep={currentStep} 
                      stepResults={stepResults} 
                      steps={pipelineSteps} 
                    />
                  </div>
                );
              }

              if (msg.type === 'full_report') {
                return (
                  <div key={msg.id} className="w-full">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter mb-2">Complete Scan Report</p>
                    <FullReportCard pipeline={msg.pipeline} scanId={msg.scanId} />
                  </div>
                );
              }

              return (
                <ChatMessageBubble key={msg.id} message={msg} />
              );
            })
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center text-primary shadow-sm">
                  <Shield size={14} />
                </div>
                <div className="bg-bg-secondary p-4 rounded-2xl rounded-tl-none border-l-4 border-primary flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  <span className="text-xs text-text-secondary italic">MediGuard AI is analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-color bg-bg-secondary">
        <div className="relative flex items-center gap-2">
          <button className="p-2 text-text-secondary hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyPress}
              placeholder={hasAnalyzed ? "Ask anything about this medicine..." : "Type your message..."}
              disabled={isTyping}
              className="w-full bg-bg-primary border border-border-color rounded-xl py-3 px-4 pr-12 text-text-primary text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none max-h-32 disabled:opacity-50"
              rows={1}
            />
            <div className="absolute right-3 bottom-2.5 flex items-center gap-2">
               {input.length > 400 && (
                 <span className="text-[10px] text-text-secondary font-bold">
                   {input.length}/500
                 </span>
               )}
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${
              !input.trim() || isTyping
                ? 'bg-bg-primary text-text-secondary'
                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
