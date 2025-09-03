"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    status: 'completed' | 'pending' | 'in-progress';
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  showCurrentLocation?: boolean;
  className?: string;
}

export function OfflineMap({
  center = [-23.5505, -46.6333], // São Paulo default
  zoom = 13,
  markers = [],
  onLocationSelect,
  showCurrentLocation = true,
  className = ""
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const L = (await import('leaflet')).default;
        
        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapRef.current && !map) {
          const mapInstance = L.map(mapRef.current).setView(center, zoom);

          // Use OpenStreetMap tiles (works offline when cached)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapInstance);

          // Add click handler for location selection
          if (onLocationSelect) {
            mapInstance.on('click', (e: any) => {
              onLocationSelect(e.latlng.lat, e.latlng.lng);
            });
          }

          setMap(mapInstance);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach(marker => {
      const L = require('leaflet');
      
      const color = marker.status === 'completed' ? 'green' : 
                   marker.status === 'in-progress' ? 'orange' : 'red';
      
      const markerIcon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        className: 'custom-marker'
      });

      L.marker(marker.position, { 
        icon: markerIcon,
        isMarker: true 
      })
        .addTo(map)
        .bindPopup(marker.title);
    });
  }, [map, markers]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [latitude, longitude];
        
        setCurrentLocation(location);
        setIsLocating(false);

        if (map) {
          map.setView(location, 16);
          
          // Add current location marker
          const L = require('leaflet');
          const currentLocationIcon = L.divIcon({
            html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);"></div>`,
            iconSize: [16, 16],
            className: 'current-location-marker'
          });

          L.marker(location, { 
            icon: currentLocationIcon,
            isMarker: true 
          })
            .addTo(map)
            .bindPopup('Sua localização atual');
        }

        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error('Error getting location:', error);
        alert('Não foi possível obter sua localização. Verifique as permissões.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa da Área
          </CardTitle>
          {showCurrentLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Navigation className="h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="h-4 w-4" />
              )}
              {isLocating ? 'Localizando...' : 'Minha Localização'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="h-64 w-full rounded-b-lg"
          style={{ minHeight: '256px' }}
        />
      </CardContent>
    </Card>
  );
}