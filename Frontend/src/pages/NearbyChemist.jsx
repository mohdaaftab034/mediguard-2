import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ShieldCheck, ListFilter, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const verifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});
const osmIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const DEFAULT_LOCATION = [28.6139, 77.2090]; // New Delhi as default

import { haversineKm, fetchFromOverpass } from '../utils/osm';

// Sub-component to auto-center map when location changes
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14); }, [center, map]);
  return null;
};

const AMENITY_COLORS = {
  hospital: 'text-red-400',
  clinic: 'text-purple-400',
  pharmacy: 'text-green-400',
  chemist: 'text-green-400',
  default: 'text-blue-400'
};

const NearbyChemist = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('requesting'); // 'requesting' | 'granted' | 'denied' | 'default'
  const [verifiedChemists, setVerifiedChemists] = useState([]);
  const [osmPlaces, setOsmPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // default to 'all' so OSM results are visible
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmError, setOsmError] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10000);

  const effectiveLoc = userLocation || DEFAULT_LOCATION;

  // Fetch MediGuard verified chemists from backend
  const fetchVerifiedChemists = useCallback(async (lat, lng) => {
    setDbLoading(true);
    try {
      const res = await api.get(`/chemists/nearby?lat=${lat}&lng=${lng}&radius=10000`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setVerifiedChemists(data);
    } catch (err) {
      console.log('Verified chemists fetch failed:', err.message);
      setVerifiedChemists([]);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // Fetch from Overpass / OpenStreetMap
  const fetchOSMPlaces = useCallback(async (lat, lng, radius = 10000) => {
    setOsmLoading(true);
    setOsmError(null);
    try {
      const results = await fetchFromOverpass(lat, lng, radius);
      setOsmPlaces(results);

      // If still no results, try with a larger radius
      if (results.length === 0 && radius < 20000) {
        console.log('No results found within', radius, 'm, expanding to 20km...');
        const wider = await fetchFromOverpass(lat, lng, 20000);
        setOsmPlaces(wider);
        if (wider.length === 0) {
          setOsmError('No pharmacies, hospitals, or clinics found within 20km via OpenStreetMap.');
        }
      }
    } catch (err) {
      setOsmError(`Could not reach OpenStreetMap servers: ${err.message}`);
    } finally {
      setOsmLoading(false);
    }
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('default');
      setUserLocation(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setLocationStatus('granted');
        fetchVerifiedChemists(loc[0], loc[1]);
        fetchOSMPlaces(loc[0], loc[1]);
      },
      () => {
        setLocationStatus('denied');
        setUserLocation(DEFAULT_LOCATION);
        fetchVerifiedChemists(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1]);
        fetchOSMPlaces(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1]);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [fetchVerifiedChemists, fetchOSMPlaces]);

  const allPlaces = useMemo(() => {
    const verified = verifiedChemists.map((c) => ({
      ...c,
      id: c._id,
      name: c.shopName || 'Verified Chemist',
      typeLabel: '✅ MediGuard Verified',
      amenityType: 'pharmacy',
      isVerified: true,
      source: 'MediGuard',
      coordinates: c.coordinates || null,
      distance: c.coordinates?.lat
        ? haversineKm([effectiveLoc[0], effectiveLoc[1]], [c.coordinates.lat, c.coordinates.lng])
        : null
    }));

    return [...verified, ...osmPlaces].sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [verifiedChemists, osmPlaces, effectiveLoc]);

  const displayedPlaces = activeTab === 'verified'
    ? allPlaces.filter((p) => p.isVerified)
    : allPlaces;

  const getDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleRefresh = () => {
    if (userLocation) {
      fetchOSMPlaces(userLocation[0], userLocation[1], searchRadius);
      fetchVerifiedChemists(userLocation[0], userLocation[1]);
    }
  };

  const isLoading = osmLoading || dbLoading || locationStatus === 'requesting';

  return (
    <div className="bg-bg-primary py-12" id="nearby-chemist-section">
      {/* Header */}
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Find Nearby{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Pharmacies & Hospitals
            </span>
          </h1>
          <p className="text-text-secondary">
            Live data from OpenStreetMap — pharmacies, chemists, hospitals and clinics near you
          </p>
          {locationStatus === 'denied' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm mt-2">
              <AlertCircle size={14} />
              Location access denied — showing results for New Delhi. Enable location for accurate results.
            </div>
          )}
          {locationStatus === 'granted' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success text-sm mt-2">
              📍 Using your current location
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8">
        {/* Map */}
        <div className="space-y-6">
          <div className="rounded-3xl overflow-hidden border border-border-color bg-bg-secondary shadow-2xl">
            {locationStatus === 'requesting' ? (
              <div style={{ height: '560px' }} className="flex items-center justify-center bg-bg-secondary">
                <div className="text-center space-y-3">
                  <Loader2 size={36} className="mx-auto text-primary animate-spin" />
                  <p className="text-text-secondary text-sm">Getting your location...</p>
                </div>
              </div>
            ) : (
              <MapContainer center={effectiveLoc} zoom={13} style={{ height: '560px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapController center={effectiveLoc} />

                {/* User location */}
                <Marker position={effectiveLoc} icon={userIcon}>
                  <Popup>📍 You are here</Popup>
                </Marker>
                <Circle center={effectiveLoc} radius={searchRadius} color="cyan" fillOpacity={0.04} dashArray="6 4" />

                {/* MediGuard verified chemists */}
                {verifiedChemists.map((c) =>
                  c.coordinates?.lat && c.coordinates?.lng ? (
                    <Marker
                      key={c._id}
                      position={[c.coordinates.lat, c.coordinates.lng]}
                      icon={verifiedIcon}
                    >
                      <Popup>
                        <strong>✅ {c.shopName}</strong><br />
                        MediGuard Verified<br />
                        License: {c.licenseNumber}<br />
                        {c.address}<br />
                        {c.phone && <>📞 {c.phone}</>}
                      </Popup>
                    </Marker>
                  ) : null
                )}

                {/* OSM places */}
                {osmPlaces.map((place) => (
                  <Marker
                    key={place.id}
                    position={[place.coordinates.lat, place.coordinates.lng]}
                    icon={osmIcon}
                  >
                    <Popup>
                      <strong>{place.name}</strong><br />
                      {place.typeLabel}<br />
                      {place.address}<br />
                      {place.phone && <>📞 {place.phone}<br /></>}
                      {place.openingHours && <>🕐 {place.openingHours}<br /></>}
                      <span style={{ fontSize: '11px', color: '#888' }}>Source: OpenStreetMap</span>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: 'Verified Chemists', value: verifiedChemists.length, icon: ShieldCheck },
              { title: 'OSM Pharmacies', value: osmPlaces.filter(p => ['pharmacy','chemist'].includes(p.amenityType)).length, icon: MapPin },
              { title: 'Hospitals / Clinics', value: osmPlaces.filter(p => ['hospital','clinic'].includes(p.amenityType)).length, icon: Navigation },
              { title: 'Search Radius', value: `${searchRadius / 1000} km`, icon: Navigation },
            ].map((item) => (
              <div key={item.title} className="card flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">{item.title}</p>
                  <p className="text-text-primary font-bold text-xl">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-bg-secondary rounded-3xl border border-border-color p-5 lg:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Nearby Places</h2>
              <p className="text-text-secondary text-sm">
                {osmPlaces.length > 0
                  ? `${osmPlaces.length} places found via OpenStreetMap`
                  : 'Pharmacies, hospitals & clinics near you'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
              title="Refresh results"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            </button>
          </div>

          {/* Radius control */}
          <div className="flex items-center gap-3">
            <label className="text-text-secondary text-sm shrink-0">Search radius:</label>
            <select
              value={searchRadius}
              onChange={(e) => {
                const r = parseInt(e.target.value);
                setSearchRadius(r);
                if (userLocation) fetchOSMPlaces(userLocation[0], userLocation[1], r);
              }}
              className="flex-1 bg-bg-primary border border-border-color text-text-primary rounded-xl px-3 py-2 text-sm"
            >
              <option value={3000}>3 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={15000}>15 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-2xl bg-bg-primary border border-border-color">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              All Nearby ({allPlaces.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verified')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'verified' ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              Verified ({verifiedChemists.length})
            </button>
          </div>

          {/* Error banner */}
          {osmError && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/30">
              <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
              <p className="text-warning text-sm">{osmError}</p>
            </div>
          )}

          {/* Loading state */}
          {osmLoading && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Loader2 size={16} className="text-primary animate-spin shrink-0" />
              <p className="text-text-secondary text-sm">Searching OpenStreetMap for nearby places...</p>
            </div>
          )}

          {/* List */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {displayedPlaces.map((place) => {
              const coords = place.coordinates;
              const distance = place.distance != null ? `${place.distance} km` : 'Nearby';

              return (
                <div
                  key={place._id || place.id}
                  className="p-4 rounded-2xl border border-border-color bg-bg-primary/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-bold truncate">{place.name}</p>
                      <p className="text-text-secondary text-xs mt-0.5">{place.typeLabel || place.amenityType}</p>
                      <p className="text-text-secondary text-xs mt-1 leading-relaxed">{place.address}</p>
                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          className="text-primary text-xs mt-1 block hover:underline"
                        >
                          📞 {place.phone}
                        </a>
                      )}
                      {place.openingHours && (
                        <p className="text-text-secondary text-xs mt-0.5">🕐 {place.openingHours}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-primary font-bold text-sm">{distance}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold block ${place.isVerified ? 'bg-success/20 text-success' : 'bg-text-secondary/15 text-text-secondary'}`}>
                        {place.isVerified ? '✅ Verified' : place.source || 'OSM'}
                      </span>
                    </div>
                  </div>

                  {coords?.lat && coords?.lng && (
                    <button
                      type="button"
                      onClick={() => getDirections(coords.lat, coords.lng)}
                      className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      📍 Get Directions
                    </button>
                  )}
                </div>
              );
            })}

            {!isLoading && displayedPlaces.length === 0 && (
              <div className="text-center py-10 text-text-secondary space-y-3">
                <ListFilter size={28} className="mx-auto" />
                <p className="text-sm">
                  {activeTab === 'verified'
                    ? 'No verified MediGuard chemists in this area yet.'
                    : 'No places found. Try increasing the search radius.'}
                </p>
                {activeTab === 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchRadius(20000);
                      if (userLocation) fetchOSMPlaces(userLocation[0], userLocation[1], 20000);
                    }}
                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
                  >
                    Expand to 20 km
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyChemist;