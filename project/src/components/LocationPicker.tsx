// Fix for window.L linter errors
declare global {
  interface Window { L: any }
}

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Crosshair, CheckCircle } from 'lucide-react';

interface LocationPickerProps {
  value?: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    country: string;
    locationName: string;
  };
  onChange?: (location: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    country: string;
    locationName: string;
  }) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    value?.latitude ? parseFloat(value.latitude) : 27.7172,
    value?.longitude ? parseFloat(value.longitude) : 85.3240
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>();

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            setMapLoaded(true);
            initializeMap();
          };
          document.head.appendChild(script);
        } else {
          setMapLoaded(true);
          initializeMap();
        }
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    // Fix Leaflet default markers
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = window.L.map(mapRef.current).setView(position, 13);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const marker = window.L.marker(position).addTo(map);

    map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const newPosition: [number, number] = [lat, lng];
      
      setPosition(newPosition);
      marker.setLatLng([lat, lng]);
      
      // Reverse geocode the position
      reverseGeocode(lat, lng);
    });

    // Store map reference for updates
    mapRef.current.leafletMap = map;
    mapRef.current.leafletMarker = marker;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const locationData = {
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: data.display_name?.split(',')[0] || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown City',
        country: data.address?.country || 'Unknown Country',
        locationName: data.display_name?.split(',')[0] || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
      
      onChange?.(locationData);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback location data
      const locationData = {
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: 'Unknown City',
        country: 'Unknown Country',
        locationName: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
      onChange?.(locationData);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=np`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 500);
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPosition: [number, number] = [lat, lng];
    
    setPosition(newPosition);
    setSearchQuery(result.display_name);
    setShowResults(false);
    
    // Update map
    if (mapRef.current?.leafletMap && mapRef.current?.leafletMarker) {
      mapRef.current.leafletMap.setView([lat, lng], 15);
      mapRef.current.leafletMarker.setLatLng([lat, lng]);
    }
    
    const locationData = {
      latitude: lat.toString(),
      longitude: lng.toString(),
      address: result.display_name.split(',')[0],
      city: result.address?.city || result.address?.town || result.address?.village || 'Unknown City',
      country: result.address?.country || 'Nepal',
      locationName: result.display_name.split(',')[0]
    };
    
    onChange?.(locationData);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newPosition: [number, number] = [lat, lng];
        
        setPosition(newPosition);
        
        // Update map
        if (mapRef.current?.leafletMap && mapRef.current?.leafletMarker) {
          mapRef.current.leafletMap.setView([lat, lng], 15);
          mapRef.current.leafletMarker.setLatLng([lat, lng]);
        }
        
        reverseGeocode(lat, lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please select manually.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a location in Nepal..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900">{result.display_name.split(',')[0]}</div>
                    <div className="text-sm text-slate-500">{result.display_name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={isGettingLocation}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Crosshair className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
        <span>{isGettingLocation ? 'Getting location...' : 'Use current location'}</span>
      </button>

      {/* Map Container */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Click on the map to set your exact location
        </label>
        <div className="relative">
          <div 
            ref={mapRef}
            className="w-full h-64 bg-slate-100 rounded-lg border border-slate-300"
            style={{ minHeight: '300px' }}
          >
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Location Info */}
      {value && value.latitude && value.longitude && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <div className="font-medium text-green-800">Selected Location</div>
              <div className="text-sm text-green-700">
                <div>{value.locationName}</div>
                <div>{value.address}, {value.city}, {value.country}</div>
                <div className="font-mono text-xs">
                  {parseFloat(value.latitude).toFixed(6)}, {parseFloat(value.longitude).toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}