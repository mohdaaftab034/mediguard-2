export const haversineKm = ([lat1, lng1], [lat2, lng2]) => {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return parseFloat((2 * R * Math.asin(Math.sqrt(a))).toFixed(2));
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

export const buildOverpassQuery = (lat, lng, radiusMeters = 10000) => `
[out:json][timeout:25];
(
  node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
  way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
  node["shop"="chemist"](around:${radiusMeters},${lat},${lng});
  way["shop"="chemist"](around:${radiusMeters},${lat},${lng});
  node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
  way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
  node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
  way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
  node["healthcare"="pharmacy"](around:${radiusMeters},${lat},${lng});
  node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
);
out center 40;
`;

export const parseOSMElement = (el, userLat, userLng) => {
  const elLat = el.lat ?? el.center?.lat;
  const elLng = el.lon ?? el.center?.lon;
  if (!elLat || !elLng) return null;

  const tags = el.tags || {};
  const amenity = tags.amenity || tags.shop || tags.healthcare || 'pharmacy';

  const typeLabel =
    amenity === 'hospital' ? '🏥 Hospital' :
    amenity === 'clinic' ? '🩺 Clinic' :
    amenity === 'chemist' ? '💊 Chemist' :
    '💊 Pharmacy';

  return {
    id: el.id,
    name: tags.name || tags['name:en'] || typeLabel,
    address: [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:city']
    ].filter(Boolean).join(', ') || 'Address not listed on OpenStreetMap',
    phone: tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null,
    openingHours: tags.opening_hours || null,
    website: tags.website || tags['contact:website'] || null,
    amenityType: amenity,
    typeLabel,
    coordinates: { lat: elLat, lng: elLng },
    isVerified: false,
    source: 'OpenStreetMap',
    distance: haversineKm([userLat, userLng], [elLat, elLng])
  };
};

export const fetchFromOverpass = async (lat, lng, radiusMeters = 10000) => {
  const query = buildOverpassQuery(lat, lng, radiusMeters);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) continue;
      const data = await res.json();

      const results = (data.elements || [])
        .map((el) => parseOSMElement(el, lat, lng))
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      if (results.length > 0 || endpoint === OVERPASS_ENDPOINTS[OVERPASS_ENDPOINTS.length - 1]) {
        return results;
      }
    } catch (err) {
      console.warn(`Overpass endpoint ${endpoint} failed:`, err.message);
    }
  }
  return [];
};
