interface LocationRecord {
  label: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

const LOCATIONS: LocationRecord[] = [
  { label: 'Chennai, Tamil Nadu, India', city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { label: 'Bengaluru, Karnataka, India', city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { label: 'Hyderabad, Telangana, India', city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.385, longitude: 78.4867 },
  { label: 'Mumbai, Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { label: 'Delhi, Delhi, India', city: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { label: 'Pune, Maharashtra, India', city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567 },
  { label: 'Coimbatore, Tamil Nadu, India', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 },
  { label: 'Madurai, Tamil Nadu, India', city: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198 },
  { label: 'Kochi, Kerala, India', city: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673 },
  { label: 'Colombo, Western Province, Sri Lanka', city: 'Colombo', state: 'Western Province', country: 'Sri Lanka', latitude: 6.9271, longitude: 79.8612 }
];

export interface LocationSearchResult {
  label: string;
  latitude: number;
  longitude: number;
}

const normalise = (value: string) => value.trim().toLowerCase();

export const searchLocations = (query: string): LocationSearchResult[] => {
  if (!query.trim()) {
    return LOCATIONS.slice(0, 5).map(({ label, latitude, longitude }) => ({ label, latitude, longitude }));
  }

  const needle = normalise(query);
  return LOCATIONS.filter(location => {
    const haystack = normalise(`${location.city} ${location.state} ${location.country}`);
    return haystack.includes(needle);
  }).map(({ label, latitude, longitude }) => ({ label, latitude, longitude }));
};
