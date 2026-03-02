import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Farm } from '@/types';
import { MapPin } from 'lucide-react';

interface Props {
    farms: Farm[];
    center?: { lat: number; lng: number };
    zoom?: number;
    onFarmClick?: (farm: Farm) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
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
            <div className="bg-sand/30 rounded-2xl h-full flex flex-col items-center justify-center border border-sand">
                <MapPin className="w-10 h-10 text-earth-400 mb-3" />
                <span className="text-earth-600 font-medium">Error loading map</span>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-sand/30 rounded-2xl h-full flex flex-col items-center justify-center border border-sand animate-pulse">
                <MapPin className="w-10 h-10 text-pine-300 mb-3" />
                <span className="text-pine-600 font-medium">Loading map...</span>
            </div>
        );
    }

    const validFarms = farms.filter(farm => farm.latitude && farm.longitude);

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden">
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
                        <div className="p-3 max-w-xs font-sans">
                            <h3 className="font-bold text-pine text-base">
                                {selectedFarm.name}
                            </h3>
                            <p className="text-sm text-earth-600 mt-1">
                                {selectedFarm.city}, {selectedFarm.country}
                            </p>
                            <a
                                href={`/farms/${selectedFarm.id}`}
                                className="inline-flex items-center text-sm font-medium text-pine-600 hover:text-pine-800 mt-3"
                            >
                                View Details →
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
