import { useState } from 'react'
import api from '../services/api.js'

const severityConfig = {
  CRITICAL: { color: '#EF233C', bg: 'rgba(239,35,60,0.1)', border: 'rgba(239,35,60,0.3)', label: 'CRITICAL ALERT', icon: '🚨' },
  HIGH: { color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)', label: 'HIGH RISK', icon: '⛔' },
  MEDIUM: { color: '#FFB703', bg: 'rgba(255,183,3,0.1)', border: 'rgba(255,183,3,0.3)', label: 'WARNING', icon: '⚠️' }
}

export default function BatchVerify() {
  const [batchNumber, setBatchNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!batchNumber.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      // Direct call to scan controller's internal logic or new dedicated batch endpoint
      const response = await api.get(`/scan/verify-batch?batchNumber=${batchNumber.trim()}`)
      setResult(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Batch Verification Portal
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: '15px' }}>
          Instantly check if your medicine batch is in the official CDSCO recalled or spurious list.
        </p>
      </div>

      {/* Input Section */}
      <div style={{
        background: 'var(--bg-card, #111827)',
        border: '1px solid var(--border, #1F2937)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enter Batch Number
            </label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
              placeholder="e.g., BN2024KL001"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--bg-primary, #030712)',
                border: '1px solid var(--border, #1F2937)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00B4D8'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !batchNumber.trim()}
            style={{
              padding: '0 24px',
              height: '52px',
              marginTop: '25px',
              background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
              opacity: (loading || !batchNumber.trim()) ? 0.6 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Verifying...' : 'Check Status'}
            {!loading && <span>🔍</span>}
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>ℹ️</span> Batch numbers are usually printed on the side or back of the medicine packaging.
        </p>
      </div>

      {/* Result Section */}
      <div style={{ marginTop: '24px' }}>
        {error && (
          <div style={{
            background: 'rgba(239,35,60,0.1)',
            border: '1px solid rgba(239,35,60,0.3)',
            borderRadius: '12px',
            padding: '16px',
            color: '#EF233C',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={{
            animation: 'fadeIn 0.4s ease-out'
          }}>
            {result.status === 'RECALLED' ? (
              <div style={{
                background: severityConfig[result.severity]?.bg || 'rgba(239,35,60,0.1)',
                border: `1px solid ${severityConfig[result.severity]?.border || 'rgba(239,35,60,0.3)'}`,
                borderRadius: '20px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{severityConfig[result.severity]?.icon || '🚨'}</div>
                <h2 style={{ color: severityConfig[result.severity]?.color || '#EF233C', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                  {severityConfig[result.severity]?.label || 'RECALLED MEDICINE'}
                </h2>
                <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
                  Batch {result.batchNumber} has been officially RECALLED.
                </p>

                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  textAlign: 'left',
                  marginBottom: '24px'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' }}>Medicine Name</span>
                    <div style={{ color: 'white', fontWeight: '600' }}>{result.medicine}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' }}>Reason for Recall</span>
                    <div style={{ color: 'white', fontWeight: '600' }}>{result.recallReason}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' }}>Authority</span>
                    <div style={{ color: 'white', fontWeight: '600' }}>{result.recallAuthority}</div>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' }}>Affected States</span>
                    <div style={{ color: 'white', fontWeight: '600' }}>{result.affectedStates?.join(', ')}</div>
                  </div>
                </div>

                <div style={{ color: '#EF233C', fontWeight: '700', fontSize: '14px', padding: '12px', border: '1px dashed #EF233C', borderRadius: '8px' }}>
                  ⚠️ DO NOT CONSUME THIS MEDICINE. Return it to the medical store immediately and report to CDSCO.
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(6,214,160,0.1)',
                border: '1px solid rgba(6,214,160,0.3)',
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ color: '#06D6A0', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                  NOT IN RECALLED LIST
                </h2>
                <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6' }}>
                  The batch number <strong style={{ color: 'white' }}>{batchNumber}</strong> is not present in our database of recalled or substandard medicines.
                </p>
                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px', color: '#6B7280' }}>
                  Note: This only means the batch is not flagged in the latest CDSCO alerts. Please also use our AI Packaging Scanner to check for visual counterfeiting signs.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
