import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fetchFromOverpass, haversineKm } from '../../utils/osm';

const FullReportCard = ({ pipeline }) => {
  const { step1_packaging, step2_batch, step3_medicineDb, step4_chemists: initialChemists, finalRiskLevel, finalVerdict } = pipeline
  const [showChemistModal, setShowChemistModal] = useState(false)
  
  // Format initialChemists to match the new structure if they exist
  const formattedInitial = (initialChemists || []).map(c => ({
    ...c,
    name: c.shopName || c.name,
    isVerified: true,
    source: 'MediGuard',
    distance: null
  }));
  
  const [chemists, setChemists] = useState(formattedInitial)
  const [isLoadingChemists, setIsLoadingChemists] = useState(false)
  const [hasFetchedOSM, setHasFetchedOSM] = useState(false)

  useEffect(() => {
    if (!hasFetchedOSM) {
      fetchChemists();
    }
  }, [hasFetchedOSM]);

  // Read directly from structured fields
  const fields = step1_packaging.fields || {}
  const medicineName = fields.medicineName || fields.name || 'Not detected'
  const genericName = fields.genericName || 'Not detected'
  const manufacturer = fields.manufacturer || 'Not detected'
  const batchNumber = fields.batchNumber || 'Not visible'
  const expiryDate = fields.expiryDate || 'Not visible'
  const mrp = fields.mrp || 'Not visible'
  const drugLicense = fields.drugLicense || 'Not visible'
  const manufacturerAddress = fields.manufacturerAddress || 'Not visible'
  const requiresPrescription = fields.requiresPrescription || false

  const fetchChemists = async () => {
    if (hasFetchedOSM) {
      setShowChemistModal(true)
      return
    }

    setIsLoadingChemists(true)
    setShowChemistModal(true)

    try {
      // Get current position
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        
        try {
          const osmPlaces = await fetchFromOverpass(lat, lng, 10000);
          const response = await api.get(`/chemists/nearby?lat=${lat}&lng=${lng}&radius=10000`)
          const verified = Array.isArray(response.data?.data) ? response.data.data : [];
          
          const formattedVerified = verified.map(v => ({
            ...v,
            name: v.shopName,
            isVerified: true,
            source: 'MediGuard',
            distance: v.coordinates?.lat ? haversineKm([lat, lng], [v.coordinates.lat, v.coordinates.lng]) : null
          }));
          
          const combined = [...formattedVerified, ...osmPlaces].sort((a,b) => (a.distance ?? 999) - (b.distance ?? 999));
          setChemists(combined);
          setHasFetchedOSM(true);
        } catch (error) {
          console.error('Failed to fetch chemists:', error)
        } finally {
          setIsLoadingChemists(false)
        }
      }, async () => {
        // Fallback without coordinates
        try {
          const response = await api.get('/chemists/nearby')
          const verified = Array.isArray(response.data?.data) ? response.data.data : [];
          setChemists(verified.map(v => ({...v, name: v.shopName, isVerified: true, source: 'MediGuard'})))
          setHasFetchedOSM(true);
        } catch (error) {
          console.error('Failed to fetch chemists fallback:', error)
        } finally {
          setIsLoadingChemists(false)
        }
      })
    } catch (e) {
      setIsLoadingChemists(false)
    }
  }

  // Risk level config
  const riskConfig = {
    CRITICAL: { color: '#D90429', bg: '#FFF0F3', icon: '🚨', label: 'CRITICAL RISK — Do NOT consume' },
    HIGH: { color: '#F77F00', bg: '#FFF8F0', icon: '⛔', label: 'HIGH RISK — Serious concerns detected' },
    MEDIUM: { color: '#FCBF49', bg: '#FFFBF2', icon: '⚠️', label: 'MEDIUM RISK — Verify before consuming' },
    LOW: { color: '#06D6A0', bg: '#F0FFF4', icon: '✅', label: 'LOW RISK — Packaging looks professional' }
  }
  const risk = riskConfig[finalRiskLevel] || riskConfig.MEDIUM

  const textPrimary = '#1A202C' 
  const textSecondary = '#4A5568' 
  const borderLight = '#E2E8F0' 

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* Final Expert Verdict */}
      {finalVerdict && (
        <div style={{
          background: '#F0F9FF',
          border: '1px solid #B9E6FE',
          borderRadius: '12px',
          padding: '16px',
          color: textPrimary,
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <div style={{ color: '#0077B6', fontWeight: '800', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✨ AI Safety Summary
          </div>
          <div style={{ fontStyle: 'italic', color: '#1E293B' }}>
            "{finalVerdict}"
          </div>
        </div>
      )}

      {/* Risk Banner */}
      <div style={{
        background: risk.bg,
        border: `1px solid ${risk.color}30`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '28px' }}>{risk.icon}</span>
        <div>
          <div style={{ color: risk.color, fontWeight: '700', fontSize: '16px' }}>
            {risk.label}
          </div>
          <div style={{ color: textSecondary, fontSize: '12px', marginTop: '2px' }}>
            Confidence Score: {step1_packaging.confidence}%
          </div>
        </div>
      </div>

      {/* Medicine Identity Card */}
      <div style={{
        background: '#F8FAFC',
        border: `1px solid ${borderLight}`,
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>💊</span>
          <span style={{ color: textPrimary, fontWeight: '800', fontSize: '18px' }}>
            {medicineName}
          </span>
          {requiresPrescription && (
            <span style={{
              padding: '2px 8px',
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>Rx Only</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Manufacturer', value: manufacturer, icon: '🏭' },
            { label: 'Batch Number', value: batchNumber, icon: '🔢' },
            { label: 'Expiry Date', value: expiryDate, icon: '📅' },
            { label: 'MRP', value: mrp, icon: '💰' },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: `1px solid ${borderLight}`,
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div style={{ color: '#718096', fontSize: '11px', fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {item.icon} {item.label}
              </div>
              <div style={{ color: textPrimary, fontSize: '13px', fontWeight: '600' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Verification Result */}
      <div style={{
        background: step2_batch.status === 'RECALLED' ? '#FEF2F2' : '#F0FDF4',
        border: `1px solid ${step2_batch.status === 'RECALLED' ? '#FECACA' : '#BBF7D0'}`,
        borderRadius: '12px',
        padding: '14px'
      }}>
        <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: textPrimary }}>
          📋 Batch Verification
        </div>
        <div style={{ color: step2_batch.status === 'RECALLED' ? '#D90429' : '#059669', fontWeight: '700', fontSize: '13px' }}>
          {step2_batch.status === 'RECALLED' ? '🚨 THIS BATCH HAS BEEN RECALLED' : `✅ Batch ${batchNumber} not found in recalled list`}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
        <button 
          onClick={() => window.open(`/batch-verify?batch=${encodeURIComponent(batchNumber)}`, '_blank')}
          style={{ flex: 1, minWidth: '140px', padding: '12px', background: '#F0F9FF', border: '1px solid #B9E6FE', borderRadius: '10px', color: '#0369A1', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          🔍 Verify Batch
        </button>
        <button 
          onClick={fetchChemists}
          style={{ flex: 1, minWidth: '140px', padding: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', color: '#166534', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          🏪 Find Chemist
        </button>
      </div>

      {/* Chemists Display */}
      {(showChemistModal || (initialChemists && initialChemists.length > 0)) && (
        <div style={{
          background: '#F8FAFC',
          border: `1px solid ${borderLight}`,
          borderRadius: '12px',
          padding: '16px',
          marginTop: '12px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
             <div style={{ fontWeight: '800', fontSize: '14px', color: textPrimary }}>
               🏪 Verified Chemists Near You
             </div>
             {showChemistModal && (
               <button onClick={() => setShowChemistModal(false)} style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 'bold' }}>Close</button>
             )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isLoadingChemists ? (
               <div style={{ textAlign: 'center', padding: '20px' }}>
                 <div style={{ width: '24px', height: '24px', border: '3px solid #0077B6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
                 <p style={{ fontSize: '12px', color: textSecondary, marginTop: '8px' }}>Searching for chemists...</p>
               </div>
            ) : (chemists.length > 0 ? (
              chemists.map((chemist, i) => {
                const distanceText = chemist.distance != null ? `${chemist.distance} km` : 'Nearby';
                return (
                <div key={i} style={{
                  background: '#FFFFFF',
                  border: `1px solid ${borderLight}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div>
                    <div style={{ color: textPrimary, fontWeight: '700', fontSize: '14px' }}>
                      {chemist.name}
                    </div>
                    <div style={{ color: textSecondary, fontSize: '12px', marginTop: '2px' }}>
                      {chemist.address}
                      {chemist.city && `, ${chemist.city}`}
                    </div>
                    {chemist.phone && (
                      <div style={{ color: textSecondary, fontSize: '11px', marginTop: '2px' }}>
                        📞 {chemist.phone}
                      </div>
                    )}
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {chemist.rating && (
                        <>
                          <span style={{ color: '#F59E0B' }}>⭐</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: textPrimary }}>{chemist.rating}</span>
                        </>
                      )}
                      <span style={{ color: '#0369A1', fontSize: '12px', fontWeight: '700' }}>{distanceText}</span>
                      {chemist.isVerified ? (
                        <span style={{ color: '#059669', fontSize: '10px', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>✅ VERIFIED</span>
                      ) : (
                        <span style={{ color: '#4A5568', fontSize: '10px', background: '#E2E8F0', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>{chemist.source || 'OSM'}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${chemist.coordinates?.lat || ''},${chemist.coordinates?.lng || ''}`,
                      '_blank'
                    )}
                    style={{
                      padding: '10px 16px',
                      background: '#0077B6',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,119,182,0.15)'
                    }}
                  >
                    📍 Go
                  </button>
                </div>
              )})
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: textSecondary }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
                <p style={{ fontSize: '13px' }}>No verified chemists found nearby.</p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>Try searching in a different area or city.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: '8px',
        padding: '12px',
        borderTop: `1px solid #E2E8F0`,
        display: 'flex', gap: '8px'
      }}>
        <span style={{ fontSize: '14px' }}>⚠️</span>
        <div style={{ color: '#94A3B8', fontSize: '11px', lineHeight: '1.5' }}>
          <strong>Disclaimer: </strong>
          AI analysis results are for guidance only. Helpline: 1800-180-3024
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

export default FullReportCard;
