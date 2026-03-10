import React, { useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface LatLng {
    lat: number;
    lng: number;
}

interface Props {
    value: LatLng | null;
    onChange: (coords: LatLng) => void;
    height?: string;
}

const mapContainerStyle = { width: '100%', height: '100%' };

const defaultCenter: LatLng = { lat: 3.139, lng: 101.6869 };

export default function MapPicker({ value, onChange, height = '320px' }: Props) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const handleMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
        },
        [onChange],
    );

    const center = value ?? defaultCenter;

    if (loadError) {
        return (
            <div className="flex h-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                <MapPin className="mr-2 h-4 w-4" /> Error loading map
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className="flex animate-pulse items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-400"
                style={{ height }}
            >
                <MapPin className="mr-2 h-4 w-4" /> Loading map…
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200" style={{ height }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={value ? 13 : 5}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                {value && <Marker position={value} draggable onDragEnd={handleMapClick} />}
            </GoogleMap>
        </div>
    );
}
