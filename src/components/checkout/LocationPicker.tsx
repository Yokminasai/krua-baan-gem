"use client";

import { useEffect, useRef, useState } from "react";
import { SHOP_COORDINATES, calculateDistance } from "@/lib/geoUtils";
import { MapPin, Target } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number, lng: number } | null;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet Script and CSS dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      setIsLoaded(true);
    };

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
      }
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || leafletMap.current) return;

    const L = window.L;
    const startPos = initialLocation || SHOP_COORDINATES;

    leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
    }).setView([startPos.lat, startPos.lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(leafletMap.current);

    // Custom Shop Icon
    const shopIcon = L.divIcon({
        html: `<div class="bg-mala-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    // Add Shop Marker
    L.marker([SHOP_COORDINATES.lat, SHOP_COORDINATES.lng], { icon: shopIcon }).addTo(leafletMap.current)
        .bindPopup("<b>Gem's Kitchen (ครัวบ้านเจ็ม)</b><br>เราอยู่ที่นี่!")
        .openPopup();

    // User Marker
    const userIcon = L.divIcon({
        html: `<div class="text-red-600 drop-shadow-lg scale-125"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1"><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
        className: 'user-pin-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    markerRef.current = L.marker([startPos.lat, startPos.lng], { 
        icon: userIcon,
        draggable: true 
    }).addTo(leafletMap.current);

    markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        handleLocationUpdate(position.lat, position.lng);
    });

    leafletMap.current.on('click', (e: any) => {
        markerRef.current.setLatLng(e.latlng);
        handleLocationUpdate(e.latlng.lat, e.latlng.lng);
    });

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

  }, [isLoaded, initialLocation, onLocationSelect]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation || !leafletMap.current) return;
    
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        leafletMap.current.setView([latitude, longitude], 17);
        markerRef.current.setLatLng([latitude, longitude]);
        onLocationSelect(latitude, longitude);
    });
  };

  const handleGoToShop = () => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([SHOP_COORDINATES.lat, SHOP_COORDINATES.lng], 16);
  };

  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (leafletMap.current && markerRef.current) {
        const d = calculateDistance(SHOP_COORDINATES, {
            lat: markerRef.current.getLatLng().lat,
            lng: markerRef.current.getLatLng().lng
        });
        setDistance(d);
    }
  }, [leafletMap.current, markerRef.current]);

  const handleLocationUpdate = (lat: number, lng: number) => {
    onLocationSelect(lat, lng);
    const d = calculateDistance(SHOP_COORDINATES, { lat, lng });
    setDistance(d);
  };

  // ... inside return ...
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2">
        <div className="space-y-0.5">
            <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-mala-600" />
                ปักหมุดตำแหน่งจัดส่ง
            </p>
            {distance !== null && (
                <p className={`text-xs font-bold ${distance > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                    ระยะทาง: {(distance/1000).toFixed(2)} กม. {distance > 1000 ? '(ไกลเกินไป!)' : '(อยู่ในระยะ)'}
                </p>
            )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                type="button"
                onClick={handleGoToShop}
                className="flex-1 sm:flex-none text-[11px] font-bold text-mala-600 bg-mala-50 px-3 py-1.5 rounded-xl hover:bg-mala-100 transition-colors"
            >
                กลับไปที่ร้าน
            </button>
            <button 
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
            >
                <Target className="w-3.5 h-3.5" /> ตำแหน่งปัจจุบัน
            </button>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-64 md:h-80 rounded-2xl border-2 border-slate-100 shadow-inner z-0 overflow-hidden"
        style={{ background: '#f8fafc' }}
      >
        {!isLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-mala-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400 italic text-center">
        *คลิกบนแผนที่ หรือลากหมุดสีแดงเพื่อเลือกจุดรับอาหาร
      </p>
    </div>
  );
}
