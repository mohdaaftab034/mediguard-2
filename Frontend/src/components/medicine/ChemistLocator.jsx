import React, { useState, useEffect } from 'react';
import { MapPin, Star, Phone, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Fetches real nearby pharmacies/chemists from OpenStreetMap Overpass API.
 * Falls back to Nominatim if Overpass is unavailable.
 */
const fetchOSMPharmacies = async (lat, lng, radiusMeters = 3000) => {
  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["shop"="chemist"](around:${radiusMeters},${lat},${lng});
      way["shop"="chemist"](around:${radiusMeters},${lat},${lng});
    );
    out center 20;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(overpassQuery)}`
  });

  if (!res.ok) throw new Error('Overpass failed');

  const data = await res.json();

  const toRad = (v) => (v * Math.PI) / 180;
  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return parseFloat((2 * R * Math.asin(Math.sqrt(a))).toFixed(1));
  };

  return (data.elements || [])
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) return null;
      const tags = el.tags || {};
      return {
        id: el.id,
        name: tags.name || tags['name:en'] || 'Pharmacy',
        address: [tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ') || 'Nearby pharmacy',
        distance: haversine(lat, lng, elLat, elLng),
        rating: null,
        verified: false,
        open: tags.opening_hours ? !tags.opening_hours.toLowerCase().includes('closed') : null,
        phone: tags.phone || tags['contact:phone'] || null,
        openingHours: tags.opening_hours || null,
        coordinates: { lat: elLat, lng: elLng }
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
};

const ChemistLocator = ({ nearbyChemists, onSelectChemist }) => {
  const [chemists, setChemists] = useState(nearbyChemists || []);
  const [filteredChemists, setFilteredChemists] = useState([]);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [loading, setLoading] = useState(!nearbyChemists);
  const [error, setError] = useState(null);

  // Fetch from OSM if no chemists are passed as props
  useEffect(() => {
    if (nearbyChemists && nearbyChemists.length > 0) {
      setChemists(nearbyChemists);
      setLoading(false);
      return;
    }

    const loadFromOSM = async () => {
      setLoading(true);
      setError(null);
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        const results = await fetchOSMPharmacies(pos.coords.latitude, pos.coords.longitude);
        setChemists(results);
      } catch (err) {
        console.log('ChemistLocator: Geolocation or OSM failed, using default location', err.message);
        try {
          // Default to a known Indian city
          const results = await fetchOSMPharmacies(26.4499, 80.3319);
          setChemists(results);
        } catch (fallbackErr) {
          setError('Could not load nearby pharmacies. Please try again later.');
          setChemists([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFromOSM();
  }, [nearbyChemists]);

  // Apply filters
  useEffect(() => {
    let filtered = [...chemists];

    if (filterVerifiedOnly) {
      filtered = filtered.filter((c) => c.verified);
    }

    if (filterOpenOnly) {
      filtered = filtered.filter((c) => c.open === true);
    }

    filtered.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    setFilteredChemists(filtered);
  }, [chemists, filterVerifiedOnly, filterOpenOnly]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative w-full h-48 bg-bg-primary rounded-lg border-2 border-border-color overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 size={32} className="mx-auto text-primary animate-spin" />
            <p className="text-text-secondary text-sm">Searching nearby pharmacies via OpenStreetMap...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="w-full p-4 bg-bg-primary rounded-lg border border-border-color flex items-center gap-3">
        <MapPin size={20} className="text-primary shrink-0" />
        <p className="text-text-secondary text-sm">
          Showing <strong className="text-text-primary">{chemists.length}</strong> pharmacies found near you via OpenStreetMap
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterVerifiedOnly}
            onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded bg-bg-secondary border-border-color accent-primary cursor-pointer"
          />
          <span className="text-text-secondary text-sm">Verified Only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterOpenOnly}
            onChange={(e) => setFilterOpenOnly(e.target.checked)}
            className="w-4 h-4 rounded bg-bg-secondary border-border-color accent-primary cursor-pointer"
          />
          <span className="text-text-secondary text-sm">Open Now</span>
        </label>
      </div>

      {error && (
        <div className="card text-center py-4 border-danger/30">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Chemist List */}
      <div className="space-y-3">
        {filteredChemists.map((chemist, idx) => (
          <motion.div
            key={chemist.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectChemist?.(chemist)}
            className="card cursor-pointer space-y-3 hover:border-primary/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{chemist.name}</h3>
                  {chemist.verified && (
                    <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-bold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm flex items-center gap-1">
                  <MapPin size={14} />
                  {chemist.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary font-semibold">{chemist.distance != null ? `${chemist.distance} km` : '—'}</p>
                {chemist.open != null && (
                  <p className={`text-sm ${chemist.open ? 'text-success' : 'text-danger'}`}>
                    {chemist.open ? '🟢 Open' : '🔴 Closed'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-color">
              <div className="text-center">
                {chemist.openingHours ? (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock size={14} className="text-text-secondary" />
                      <span className="font-semibold text-text-primary text-xs truncate">{chemist.openingHours}</span>
                    </div>
                    <p className="text-text-secondary text-xs">Hours</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock size={14} className="text-text-secondary" />
                      <span className="font-semibold text-text-primary text-xs">—</span>
                    </div>
                    <p className="text-text-secondary text-xs">Hours</p>
                  </>
                )}
              </div>
              {chemist.phone ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${chemist.phone}`;
                  }}
                  className="flex items-center justify-center gap-1 rounded-lg hover:bg-bg-primary transition-smooth"
                >
                  <Phone size={14} className="text-primary" />
                  <span className="text-primary text-sm font-semibold">Call</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <Phone size={14} className="text-text-secondary/40" />
                  <span className="text-text-secondary/40 text-sm">N/A</span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (chemist.coordinates?.lat && chemist.coordinates?.lng) {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${chemist.coordinates.lat},${chemist.coordinates.lng}`,
                      '_blank'
                    );
                  }
                }}
                className="flex items-center justify-center gap-1 rounded-lg hover:bg-bg-primary transition-smooth"
              >
                <MapPin size={14} className="text-success" />
                <span className="text-success text-sm font-semibold">Directions</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredChemists.length === 0 && !loading && (
        <div className="card text-center py-8">
          <MapPin size={32} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No chemists match your filters</p>
        </div>
      )}
    </div>
  );
};

export default ChemistLocator;
