import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Farm } from '@/types';

interface Props {
    farms: Farm[];
    center?: { lat: number; lng: number };
    zoom?: number;
    onFarmClick?: (farm: Farm) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: 3.139,
    lng: 101.6869,
};

export default function FarmMap({ 
    farms, 
    center = defaultCenter, 
    zoom = 10,
    onFarmClick 
}: Props) {
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    const onMarkerClick = useCallback((farm: Farm) => {
        setSelectedFarm(farm);
        onFarmClick?.(farm);
    }, [onFarmClick]);

    if (loadError) {
        return (
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Error loading map</span>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">Loading map...</span>
            </div>
        );
    }

    const validFarms = farms.filter(farm => farm.latitude && farm.longitude);

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
            }}
        >
            {validFarms.map((farm) => (
                <Marker
                    key={farm.id}
                    position={{
                        lat: farm.latitude!,
                        lng: farm.longitude!,
                    }}
                    onClick={() => onMarkerClick(farm)}
                />
            ))}

            {selectedFarm && (
                <InfoWindow
                    position={{
                        lat: selectedFarm.latitude!,
                        lng: selectedFarm.longitude!,
                    }}
                    onCloseClick={() => setSelectedFarm(null)}
                >
                    <div className="p-2 max-w-xs">
                        <h3 className="font-semibold text-gray-900">
                            {selectedFarm.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {selectedFarm.city}, {selectedFarm.country}
                        </p>
                        <a
                            href={`/farms/${selectedFarm.id}`}
                            className="text-sm text-green-600 hover:underline mt-2 block"
                        >
                            View Details
                        </a>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
