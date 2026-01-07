import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Navigation, Search, List, X } from 'lucide-react';
import { searchNearbyRestaurants, calculateRoute } from '../services/mapService';
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
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

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
        setDirectionsResponse(null); // Clear previous route
        setRouteInfo(null);
        try {
            const results = await searchNearbyRestaurants(map, center);
            setRestaurants(results);
            setIsListVisible(true);
        } catch (error) {
            console.error("Search failed:", error);
            // Translate error codes for better UX
            let errorMsg = "주변 음식점을 찾을 수 없습니다.";
            if (error === 'ZERO_RESULTS') errorMsg = "주변에 음식점이 없습니다.";
            else if (error === 'REQUEST_DENIED' || error === 'OVER_QUERY_LIMIT') errorMsg = `API 오류 (${error}). 관리자에게 문의하세요.`;
            else errorMsg += ` (${error})`;

            alert(errorMsg);
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

    const handleGetDirections = async (place) => {
        if (!myLocation || !place) return;

        setIsLoading(true);
        try {
            const result = await calculateRoute(myLocation, place.geometry.location);
            setDirectionsResponse(result);

            // Extract info
            const route = result.routes[0].legs[0];
            setRouteInfo({
                distance: route.distance.text,
                duration: route.duration.text
            });

            setIsListVisible(false); // Hide list to show map route
        } catch (error) {
            console.error("Directions failed:", error);
            let errorMsg = "경로를 찾을 수 없습니다.";
            if (error === 'ZERO_RESULTS') errorMsg = "경로를 찾을 수 없습니다 (너무 멀거나 경로 없음).";
            else if (error === 'REQUEST_DENIED') errorMsg = "API 권한 오류입니다. (Directions API)";

            alert(`${errorMsg}\n상세: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardAction = (event) => {
        if (event.action === 'directions') {
            handleGetDirections(event.place);
        }
    };

    const clearRoute = () => {
        setDirectionsResponse(null);
        setRouteInfo(null);
        handleRecenter();
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
                {!directionsResponse && restaurants.map((place) => (
                    <Marker
                        key={place.place_id}
                        position={place.geometry.location}
                        onClick={() => handleMarkerClick(place)}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: selectedPlace?.place_id === place.place_id ? '#f59e0b' : '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 1,
                        }}
                    />
                ))}

                {/* Directions Renderer */}
                {directionsResponse && (
                    <DirectionsRenderer
                        options={{
                            directions: directionsResponse,
                            suppressMarkers: false, // Show markers A/B
                            polylineOptions: {
                                strokeColor: "#f59e0b",
                                strokeWeight: 5,
                                strokeOpacity: 0.8
                            }
                        }}
                    />
                )}
            </GoogleMap>

            {/* Route Info Overlay */}
            {routeInfo && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '200px'
                }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {routeInfo.duration}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                        도보 {routeInfo.distance}
                    </span>
                    <button
                        onClick={clearRoute}
                        style={{ marginTop: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.8rem', textDecoration: 'underline' }}
                    >
                        경로 취소
                    </button>
                </div>
            )}

            {/* Floating Action Button for Search (Hidden if Route Active) */}
            {!directionsResponse && (
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
            )}

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
            {!directionsResponse && (
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
            )}

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
                {isListVisible && (
                    <button
                        onClick={() => setIsListVisible(false)}
                        style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--color-text-muted)' }}
                    >
                        <X size={20} />
                    </button>
                )}

                {restaurants.length === 0 && !isLoading && (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
                        지도 탐색 후 '주변 음식점 찾기'를 눌러보세요.
                    </div>
                )}
                {restaurants.map((place) => (
                    <RestaurantCard
                        key={place.place_id}
                        place={place}
                        isSelected={selectedPlace?.place_id === place.place_id}
                        onClick={(e) => {
                            // If event has action (directions), handle it, else select marker
                            if (e?.action === 'directions') {
                                handleCardAction(e);
                            } else {
                                handleMarkerClick(place);
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default React.memo(MapView);
