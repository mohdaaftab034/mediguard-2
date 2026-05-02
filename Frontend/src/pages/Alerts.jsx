import { useState, useEffect } from 'react'
import api from '../services/api.js'

const severityConfig = {
  CRITICAL: {
    color: '#EF233C',
    bg: 'rgba(239,35,60,0.08)',
    border: 'rgba(239,35,60,0.25)',
    accentBorder: '#EF233C',
    badge: { bg: 'rgba(239,35,60,0.12)', color: '#EF233C', border: 'rgba(239,35,60,0.3)' },
    icon: '🚨',
    label: 'CRITICAL',
    gradient: 'linear-gradient(135deg, rgba(239,35,60,0.1) 0%, transparent 60%)'
  },
  HIGH: {
    color: '#F77F00',
    bg: 'rgba(247,127,0,0.08)',
    border: 'rgba(247,127,0,0.25)',
    accentBorder: '#F77F00',
    badge: { bg: 'rgba(247,127,0,0.12)', color: '#F77F00', border: 'rgba(247,127,0,0.3)' },
    icon: '⛔',
    label: 'HIGH',
    gradient: 'linear-gradient(135deg, rgba(247,127,0,0.08) 0%, transparent 60%)'
  },
  MEDIUM: {
    color: '#E9A800',
    bg: 'rgba(233,168,0,0.08)',
    border: 'rgba(233,168,0,0.25)',
    accentBorder: '#E9A800',
    badge: { bg: 'rgba(233,168,0,0.12)', color: '#B07D00', border: 'rgba(233,168,0,0.3)' },
    icon: '⚠️',
    label: 'MEDIUM',
    gradient: 'linear-gradient(135deg, rgba(233,168,0,0.08) 0%, transparent 60%)'
  },
  LOW: {
    color: '#0077B6',
    bg: 'rgba(0,119,182,0.08)',
    border: 'rgba(0,119,182,0.25)',
    accentBorder: '#0077B6',
    badge: { bg: 'rgba(0,119,182,0.12)', color: '#0077B6', border: 'rgba(0,119,182,0.3)' },
    icon: 'ℹ️',
    label: 'INFO',
    gradient: 'linear-gradient(135deg, rgba(0,119,182,0.08) 0%, transparent 60%)'
  }
}

const filterTabs = [
  { key: 'ALL', label: 'All Alerts', icon: '📋', color: '#0077B6', bg: 'rgba(0,119,182,0.1)', border: 'rgba(0,119,182,0.3)' },
  { key: 'CRITICAL', label: 'Critical', icon: '🚨', color: '#EF233C', bg: 'rgba(239,35,60,0.1)', border: 'rgba(239,35,60,0.3)' },
  { key: 'HIGH', label: 'High', icon: '⛔', color: '#F77F00', bg: 'rgba(247,127,0,0.1)', border: 'rgba(247,127,0,0.3)' },
  { key: 'MEDIUM', label: 'Medium', icon: '⚠️', color: '#E9A800', bg: 'rgba(233,168,0,0.1)', border: 'rgba(233,168,0,0.3)' },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 6 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params = filter !== 'ALL' ? `?severity=${filter}` : ''
      const res = await api.get(`/alerts${params}`)
      setAlerts(res.data.data.alerts)
      setTotal(res.data.data.total)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length
  const highCount = alerts.filter(a => a.severity === 'HIGH').length

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '32px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🚨 Drug Safety Alerts
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px', lineHeight: 1.5 }}>
              Official alerts from CDSCO and State Drug Authorities. Updated every 6 hours.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{
              padding: '6px 14px',
              background: 'rgba(5,150,105,0.1)',
              border: '1px solid rgba(5,150,105,0.25)',
              borderRadius: '20px',
              color: 'var(--success)',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.3px'
            }}>
              🔄 Auto-updates every 6 hrs
            </span>
            {lastUpdated && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Summary chips */}
        {!loading && alerts.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              background: 'rgba(239,35,60,0.1)', color: '#EF233C', border: '1px solid rgba(239,35,60,0.25)'
            }}>
              🚨 {criticalCount} Critical
            </span>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              background: 'rgba(247,127,0,0.1)', color: '#F77F00', border: '1px solid rgba(247,127,0,0.25)'
            }}>
              ⛔ {highCount} High
            </span>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              background: 'rgba(0,119,182,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,119,182,0.25)'
            }}>
              📋 {total} Total
            </span>
          </div>
        )}
      </div>

      {/* ─── Filter Tabs ─── */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap',
        padding: '6px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px'
      }}>
        {filterTabs.map(tab => {
          const isActive = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '9px 18px',
                background: isActive ? tab.bg : 'transparent',
                border: `1px solid ${isActive ? tab.border : 'transparent'}`,
                borderRadius: '10px',
                color: isActive ? tab.color : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── CDSCO Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,35,60,0.06) 0%, rgba(239,35,60,0.02) 100%)',
        border: '1px solid rgba(239,35,60,0.2)',
        borderLeft: '4px solid #EF233C',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>📞</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#EF233C', fontWeight: '700', fontSize: '14px' }}>
            CDSCO Drug Safety Helpline: 1800-180-3024
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
            Report suspected fake medicines • Free helpline • Available 9 AM – 6 PM
          </div>
        </div>
        <a
          href="https://cdsco.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '7px 16px',
            background: 'rgba(239,35,60,0.1)',
            border: '1px solid rgba(239,35,60,0.3)',
            borderRadius: '8px',
            color: '#EF233C',
            fontSize: '12px',
            fontWeight: '700',
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background 0.2s'
          }}
        >
          Visit CDSCO →
        </a>
      </div>

      {/* ─── Alert List ─── */}
      {loading ? (
        // Skeleton loaders — using CSS variables so they respect theme
        Array(5).fill(0).map((_, i) => (
          <div key={i} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '52px', background: 'var(--bg-primary)', borderRadius: '10px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '15px', background: 'var(--bg-primary)', borderRadius: '6px', width: '55%', marginBottom: '10px' }} />
                <div style={{ height: '11px', background: 'var(--bg-primary)', borderRadius: '6px', width: '85%' }} />
              </div>
            </div>
          </div>
        ))
      ) : alerts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>No active alerts</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>No drug safety alerts for the selected filter.</div>
        </div>
      ) : (
        alerts.map(alert => {
          const cfg = severityConfig[alert.severity] || severityConfig.MEDIUM
          const isExpanded = expandedId === alert._id

          return (
            <div
              key={alert._id}
              style={{
                background: isExpanded ? cfg.bg : 'var(--bg-secondary)',
                border: `1px solid ${isExpanded ? cfg.border : 'var(--border-color)'}`,
                borderLeft: `4px solid ${cfg.accentBorder}`,
                borderRadius: '14px',
                marginBottom: '12px',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                boxShadow: isExpanded ? `0 4px 20px ${cfg.accentBorder}18` : '0 1px 4px rgba(0,0,0,0.05)'
              }}
            >
              {/* Alert Header — clickable */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : alert._id)}
                style={{
                  padding: '16px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  background: isExpanded ? cfg.gradient : 'transparent'
                }}
              >
                {/* Severity badge */}
                <div style={{
                  padding: '7px 10px',
                  background: cfg.badge.bg,
                  border: `1px solid ${cfg.badge.border}`,
                  borderRadius: '10px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  minWidth: '52px'
                }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{cfg.icon}</span>
                  <span style={{ color: cfg.badge.color, fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    fontSize: '14px',
                    lineHeight: '1.45',
                    marginBottom: '8px'
                  }}>
                    {alert.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: 'var(--text-secondary)', fontSize: '11px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px', borderRadius: '20px'
                    }}>
                      📅 {new Date(alert.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: 'var(--text-secondary)', fontSize: '11px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px', borderRadius: '20px'
                    }}>
                      🏛️ {alert.source}
                    </span>
                    {alert.affectedMedicine && (
                      <span style={{
                        padding: '2px 9px',
                        background: 'rgba(0,119,182,0.1)',
                        border: '1px solid rgba(0,119,182,0.2)',
                        borderRadius: '20px',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        💊 {alert.affectedMedicine}
                      </span>
                    )}
                    {alert.affectedStates?.includes('All States') && (
                      <span style={{
                        padding: '2px 9px',
                        background: 'rgba(239,35,60,0.1)',
                        border: '1px solid rgba(239,35,60,0.2)',
                        borderRadius: '20px',
                        color: '#EF233C',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        🇮🇳 All India
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand arrow */}
                <div style={{
                  flexShrink: 0,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isExpanded ? cfg.badge.bg : 'var(--bg-primary)',
                  border: `1px solid ${isExpanded ? cfg.badge.border : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isExpanded ? cfg.color : 'var(--text-secondary)',
                  fontSize: '12px',
                  transition: 'all 0.2s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  padding: '0 18px 18px 18px',
                  borderTop: `1px solid ${cfg.border}`,
                  paddingTop: '16px',
                  animation: 'fadeSlideDown 0.2s ease-out'
                }}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    lineHeight: '1.65',
                    marginBottom: '14px'
                  }}>
                    {alert.description}
                  </p>

                  {/* Action Required */}
                  {alert.actionRequired && (
                    <div style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderLeft: `3px solid ${cfg.accentBorder}`,
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '14px'
                    }}>
                      <div style={{ color: cfg.color, fontWeight: '800', fontSize: '11px', marginBottom: '5px', letterSpacing: '0.5px' }}>
                        ⚡ ACTION REQUIRED
                      </div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.5 }}>
                        {alert.actionRequired}
                      </div>
                    </div>
                  )}

                  {/* Batch Numbers */}
                  {alert.batchNumbers?.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{
                        color: 'var(--text-secondary)', fontSize: '11px',
                        fontWeight: '700', letterSpacing: '0.5px',
                        textTransform: 'uppercase', marginBottom: '8px'
                      }}>
                        Affected Batch Numbers
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {alert.batchNumbers.map((bn, i) => (
                          <span key={i} style={{
                            padding: '4px 12px',
                            background: 'rgba(239,35,60,0.08)',
                            border: '1px solid rgba(239,35,60,0.25)',
                            borderRadius: '7px',
                            color: '#EF233C',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                          }}>
                            {bn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affected States */}
                  {alert.affectedStates?.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{
                        color: 'var(--text-secondary)', fontSize: '11px',
                        fontWeight: '700', letterSpacing: '0.5px',
                        textTransform: 'uppercase', marginBottom: '8px'
                      }}>
                        Affected States
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {alert.affectedStates.map((state, i) => (
                          <span key={i} style={{
                            padding: '4px 10px',
                            background: 'rgba(233,168,0,0.08)',
                            border: '1px solid rgba(233,168,0,0.25)',
                            borderRadius: '20px',
                            color: '#B07D00',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            📍 {state}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source link */}
                  {alert.sourceUrl && (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        background: 'rgba(0,119,182,0.08)',
                        border: '1px solid rgba(0,119,182,0.25)',
                        borderRadius: '9px',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        fontWeight: '700',
                        textDecoration: 'none',
                        transition: 'background 0.2s'
                      }}
                    >
                      🔗 View Official CDSCO Notice
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
