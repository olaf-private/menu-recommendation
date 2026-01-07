import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Navigation, Search, List } from 'lucide-react';
import { searchNearbyRestaurants } from '../services/mapService';
import RestaurantCard from './RestaurantCard';
import '../styles/index.css';

const containerStyle = {
    width: '100%',
    height: '100%',
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

const LIBRARIES = ['places'];

const MapView = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // Default: Seoul City Hall
    const [myLocation, setMyLocation] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isListVisible, setIsListVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const mapRef = useRef(null);

    // Initial Location Fetch
    useEffect(() => {
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

    // Search Function
    const handleSearchNearby = async () => {
        if (!map || !center) return;

        setIsLoading(true);
        try {
            const results = await searchNearbyRestaurants(map, center);
            setRestaurants(results);
            setIsListVisible(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecenter = () => {
        if (myLocation && map) {
            map.panTo(myLocation);
            map.setZoom(16);
            setCenter(myLocation);
        }
    };

    const handleMarkerClick = (place) => {
        setSelectedPlace(place);
        setIsListVisible(true);
        map.panTo(place.geometry.location);
    };

    if (!isLoaded) return <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={16}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                onDragEnd={() => {
                    if (mapRef.current) {
                        setCenter(mapRef.current.getCenter().toJSON());
                    }
                }}
            >
                {/* My Location Marker */}
                {myLocation && (
                    <Marker
                        position={myLocation}
                        zIndex={100}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#3b82f6", // Blue for user
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        }}
                    />
                )}

                {/* Restaurant Markers */}
                {restaurants.map((place) => (
                    <Marker
                        key={place.place_id}
                        position={place.geometry.location}
                        onClick={() => handleMarkerClick(place)}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE, // Simplified marker for performance
                            scale: 6,
                            fillColor: selectedPlace?.place_id === place.place_id ? '#f59e0b' : '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 1,
                        }}
                    />
                ))}
            </GoogleMap>

            {/* Floating Action Button for Search */}
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                gap: '10px'
            }}>
                <button
                    onClick={handleSearchNearby}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-lg)' }}
                >
                    {isLoading ? 'Searching...' : <><Search size={18} style={{ marginRight: '6px' }} /> 주변 음식점 찾기</>}
                </button>
            </div>

            {/* Recenter Button */}
            <button
                onClick={handleRecenter}
                className="glass-panel"
                style={{
                    position: 'absolute',
                    bottom: '100px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <Navigation size={24} />
            </button>

            {/* List Toggle Button (Mobile) */}
            <button
                onClick={() => setIsListVisible(!isListVisible)}
                className="glass-panel"
                style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '20px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <List size={24} />
            </button>

            {/* Restaurant List Overlay (Drawer-like) */}
            <div className={`glass-panel`} style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                height: isListVisible ? '45%' : '0',
                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflowY: 'auto',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                zIndex: 20,
                padding: isListVisible ? '1rem' : '0'
            }}>
                {restaurants.length === 0 && !isLoading && (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
                        지도 탐색 후 '주변 음식점 찾기'를 눌러보세요.
                    </div>
                )}
                ))}
                {/* Version Display */}
                <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    v{__APP_VERSION__}
                </div>
            </div>
        </div>
    );
};

export default React.memo(MapView);
