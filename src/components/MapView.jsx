import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';
import '../styles/index.css';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: 'var(--radius-lg)'
};

// Dark Mode Map Style
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
    ],
};

const MapView = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // Default: Seoul City Hall
    const [myLocation, setMyLocation] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        // Get Current Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setMyLocation(pos);
                },
                () => {
                    console.error("Error fetching location");
                }
            );
        }
    }, []);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
        mapRef.current = null;
    }, []);

    const handleRecenter = () => {
        if (myLocation && map) {
            map.panTo(myLocation);
            map.setZoom(16);
        }
    };

    if (!isLoaded) return <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={16}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {/* My Location Marker */}
                {myLocation && (
                    <Marker
                        position={myLocation}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#f59e0b",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        }}
                    />
                )}
            </GoogleMap>

            {/* Floating Action Button for Recenter */}
            <button
                onClick={handleRecenter}
                className="glass-panel"
                style={{
                    position: 'absolute',
                    bottom: '100px', // Above the nav bar
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                <Navigation size={24} />
            </button>
        </div>
    );
};

export default React.memo(MapView);
