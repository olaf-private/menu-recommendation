import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { MapPin, Navigation, Search, List, X } from 'lucide-react';
import { searchNearbyRestaurants, calculateRoute, getPlaceDetails } from '../services/mapService';
import RestaurantCard from './RestaurantCard';
import RestaurantDetailModal from './RestaurantDetailModal';
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

const MapView = (props) => {
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [straightLinePath, setStraightLinePath] = useState(null);
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

    // When clicking a card in the list or a marker, fetch full details if needed then open modal.
    const handleCardClick = async (place) => {
        setSelectedPlace(place);

        // If we don't have reviews or URI, fetch them to ensure modal has full info
        if (!place.reviews || !place.googleMapsURI) {
            try {
                setIsLoading(true);
                const fullDetails = await getPlaceDetails(place.place_id);

                // Merge with existing place data to keep any UI state if needed, 
                // but getPlaceDetails returns clean structure.
                // Update the specific item in the restaurants list so cache is warm
                setRestaurants(prev => prev.map(p =>
                    p.place_id === place.place_id ? fullDetails : p
                ));

                setSelectedPlace(fullDetails);
            } catch (error) {
                console.error("Failed to fetch full details:", error);
                // Fallback: still open modal with what we have
            } finally {
                setIsLoading(false);
            }
        }

        setIsModalOpen(true);

        // Pan to location and then offset to make it visible above the modal (60vh height)
        // Center is at 50%. Modal takes bottom 60%. Visible top is 40%. Center of visible is 20%.
        // We want marker at 20% from top. Current is 50%.
        // So we need to shift feature UP by 30% of screen.
        // Feature UP means Map Center DOWN (positive Y).
        // Shift amount = window.innerHeight * 0.25 (approx)
        map.panTo(place.geometry.location);

        // Small delay to allow panTo to start/finish or just sequential
        setTimeout(() => {
            if (map) map.panBy(0, window.innerHeight * 0.2);
        }, 100);
    };

    // handleMarkerClick removed as it is replaced by handleCardClick

    const handleMapClick = async (event) => {
        // If user clicks a POI (Point of Interest)
        if (event.placeId) {
            event.stop(); // Stop default info window if any

            try {
                setIsLoading(true);
                const placeDetails = await getPlaceDetails(event.placeId);

                // Add to list if not present, or replace?
                // Better to just set as selected and ensure it's in the list logic.
                // We'll append it to restaurants so it renders in the drawer.
                setRestaurants(prev => {
                    // Check if already exists to avoid duplicates
                    const exists = prev.find(p => p.place_id === placeDetails.place_id);
                    if (exists) return prev;
                    return [placeDetails, ...prev];
                });

                setSelectedPlace(placeDetails);
                setIsListVisible(true);
                // Optionally pan to it
                map.panTo(placeDetails.geometry.location);

            } catch (error) {
                console.error("Failed to fetch POI details:", error);
                alert("장소 정보를 가져올 수 없습니다.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Normal click - maybe clear selection?
            // setSelectedPlace(null);
        }
    };

    // Haversine Distance Formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
    };

    const handleGetDirections = async (place) => {
        if (!myLocation || !place) {
            alert("사용자 위치를 찾을 수 없습니다.");
            return;
        }

        setIsLoading(true);
        // Reset states
        setDirectionsResponse(null);
        setStraightLinePath(null);

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
            console.warn("Directions API failed, falling back to straight line:", error);

            // Fallback: Straight Line Visualization
            const destLat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
            const destLng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

            setStraightLinePath([
                myLocation,
                { lat: destLat, lng: destLng }
            ]);

            const dist = calculateDistance(myLocation.lat, myLocation.lng, destLat, destLng);
            setRouteInfo({
                distance: dist,
                duration: "직선 거리"
            });
            setIsListVisible(false);

            // Construct Google Maps Directions URL for the user to click if they want real path
            const url = `https://www.google.com/maps/dir/?api=1&origin=${myLocation.lat},${myLocation.lng}&destination=${destLat},${destLng}&travelmode=walking`;

            // Optional: Auto-open or just notify? 
            // The overlay now allows canceling, we can let user decide to open external app via button in Info Overlay (need to add it there)
            // or just rely on the 'Get Directions' button in Modal.
            // For now, satisfy 'Show it' request by showing the line.
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardAction = async (event) => {
        if (event.action === 'directions') {
            handleGetDirections(event.place);
        } else if (event.action === 'checkin') {
            if (!props.user) {
                alert("방문 기록을 저장하려면 로그인이 필요합니다.");
                return;
            }
            try {
                const { recordVisit } = await import('../services/storageService');
                await recordVisit(props.user.uid, event.place);
                alert(`'${event.place.name}' 방문 확인 완료!`);
            } catch (error) {
                console.error("Check-in failed:", error);
                alert("방문 기록 저장 실패");
            }
        }
    };

    // User Favorites State
    const [favorites, setFavorites] = useState(new Set());

    // Load Favorites
    useEffect(() => {
        const loadFavorites = async () => {
            if (props.user) {
                try {
                    const { getFavorites } = await import('../services/storageService');
                    const favs = await getFavorites(props.user.uid);
                    setFavorites(new Set(favs.map(f => f.placeId)));
                } catch (error) {
                    console.error("Failed to load favorites", error);
                }
            } else {
                setFavorites(new Set());
            }
        };
        loadFavorites();
    }, [props.user]);

    const handleToggleFavorite = async (place) => {
        if (!props.user) {
            alert("즐겨찾기를 하려면 로그인이 필요합니다.");
            return;
        }

        try {
            const { toggleFavorite } = await import('../services/storageService');
            const result = await toggleFavorite(props.user.uid, place);

            setFavorites(prev => {
                const next = new Set(prev);
                if (result.action === 'added') next.add(place.place_id);
                else next.delete(place.place_id);
                return next;
            });
        } catch (error) {
            console.error("Toggle favorite failed:", error);
        }
    };

    const clearRoute = () => {
        setDirectionsResponse(null);
        setStraightLinePath(null);
        setRouteInfo(null);
        handleRecenter();
    };

    const [filterCategory, setFilterCategory] = useState('ALL');
    const [sortOption, setSortOption] = useState('DISTANCE'); // DISTANCE, RATING, REVIEW

    // Helper to determine simplified category
    const getCategory = (place) => {
        const types = place.types || [];
        const primary = place.primaryType;

        if (types.includes('korean_restaurant') || primary === 'korean_restaurant') return 'KOREAN';
        if (types.includes('japanese_restaurant') || primary === 'japanese_restaurant' ||
            types.includes('sushi_restaurant') || primary === 'sushi_restaurant' ||
            types.includes('ramen_restaurant') || primary === 'ramen_restaurant') return 'JAPANESE';

        // Combined CHINESE and ASIAN for simplicity
        if (types.includes('chinese_restaurant') || primary === 'chinese_restaurant' ||
            types.includes('asian_restaurant') || primary === 'asian_restaurant' ||
            types.includes('vietnamese_restaurant') || primary === 'vietnamese_restaurant' ||
            types.includes('thai_restaurant') || primary === 'thai_restaurant' ||
            types.includes('indian_restaurant') || primary === 'indian_restaurant') return 'ASIAN';

        if (types.includes('cafe') || types.includes('bakery') || primary === 'cafe') return 'CAFE';
        if (types.includes('bar') || primary === 'bar') return 'BAR';
        if (types.includes('fast_food_restaurant') || types.includes('hamburger_restaurant') ||
            types.includes('pizza_restaurant') || types.includes('steak_house') ||
            types.includes('italian_restaurant') || types.includes('mexican_restaurant')) return 'WESTERN';

        return 'ETC';
    };

    // Filter and Sort Logic
    const processedRestaurants = React.useMemo(() => {
        // Pre-process: Calculate distances for ALL restaurants first
        let result = restaurants.map(place => {
            let distanceValue = Infinity;
            let distanceDisplay = null;

            if (myLocation && place.geometry && place.geometry.location) {
                const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
                const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

                // Haversine calculation
                const R = 6371;
                const dLat = (lat - myLocation.lat) * (Math.PI / 180);
                const dLon = (lng - myLocation.lng) * (Math.PI / 180);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(myLocation.lat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c; // km

                distanceValue = d;
                distanceDisplay = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
            }

            return {
                ...place,
                distanceValue,
                distanceDisplay
            };
        });

        // 1. Filter
        if (filterCategory !== 'ALL') {
            result = result.filter(place => {
                const cat = getCategory(place);
                return cat === filterCategory;
            });
        }

        // 2. Sort
        result.sort((a, b) => {
            if (sortOption === 'RATING') {
                return (b.rating || 0) - (a.rating || 0);
            } else if (sortOption === 'REVIEW') {
                return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
            } else if (sortOption === 'DISTANCE') {
                return a.distanceValue - b.distanceValue;
            }
            return 0;
        });

        return result;
    }, [restaurants, filterCategory, sortOption, myLocation]);


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
                onClick={handleMapClick}
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

                {/* Restaurant Markers - Show ALL or only Filtered? Usually show filtered on map too for consistency */}
                {!directionsResponse && processedRestaurants.map((place) => (
                    <Marker
                        key={place.place_id}
                        position={place.geometry.location}
                        onClick={() => handleCardClick(place)}
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

                {/* Straight Line Visualization Fallback */}
                {straightLinePath && (
                    <Polyline
                        path={straightLinePath}
                        options={{
                            strokeColor: "#f59e0b",
                            strokeOpacity: 0,
                            strokeWeight: 0,
                            icons: [{
                                icon: {
                                    path: 'M 0,-1 0,1',
                                    strokeOpacity: 1,
                                    scale: 4
                                },
                                offset: '0',
                                repeat: '20px'
                            }]
                        }}
                    />
                )}
            </GoogleMap>

            {/* Route Info Overlay */}
            {routeInfo && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '140px', // Moved down to avoid header overlap
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
                    top: '140px', // Moved down to avoid header overlap
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
                        {isLoading ? 'Searching...' : <><Search size={18} style={{ marginRight: '6px' }} /> 현 지도에서 검색</>}
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

            {/* Unified Sidebar (List & Detail) */}
            <div
                className={`sidebar-panel ${!isListVisible && !selectedPlace ? 'hidden' : ''} ${selectedPlace ? 'expanded' : ''}`}
            >
                {selectedPlace ? (
                    // Detail View
                    <RestaurantDetailModal
                        place={selectedPlace}
                        isFavorite={favorites.has(selectedPlace.place_id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClose={() => {
                            setSelectedPlace(null);
                            // Keep list visible when going back?
                            setIsListVisible(true);
                        }}
                    />
                ) : (
                    // List View
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Header / Close for List */}
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span className="text-gradient" style={{ fontWeight: 'bold' }}>주변 맛집 ({processedRestaurants.length})</span>
                                <button
                                    onClick={() => setIsListVisible(false)}
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Filters */}
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                                {[
                                    { id: 'ALL', label: '전체' },
                                    { id: 'KOREAN', label: '한식' },
                                    { id: 'JAPANESE', label: '일식' },
                                    { id: 'ASIAN', label: '중식/아시안' },
                                    { id: 'WESTERN', label: '양식' },
                                    { id: 'CAFE', label: '카페' },
                                    { id: 'BAR', label: '술집' },
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilterCategory(cat.id)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            backgroundColor: filterCategory === cat.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                            color: filterCategory === cat.id ? 'white' : 'var(--color-text-muted)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Options */}
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                <button
                                    onClick={() => setSortOption('DISTANCE')}
                                    style={{ color: sortOption === 'DISTANCE' ? 'var(--color-primary)' : 'inherit', fontWeight: sortOption === 'DISTANCE' ? 'bold' : 'normal' }}
                                >
                                    거리순
                                </button>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <button
                                    onClick={() => setSortOption('RATING')}
                                    style={{ color: sortOption === 'RATING' ? 'var(--color-primary)' : 'inherit', fontWeight: sortOption === 'RATING' ? 'bold' : 'normal' }}
                                >
                                    별점순
                                </button>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <button
                                    onClick={() => setSortOption('REVIEW')}
                                    style={{ color: sortOption === 'REVIEW' ? 'var(--color-primary)' : 'inherit', fontWeight: sortOption === 'REVIEW' ? 'bold' : 'normal' }}
                                >
                                    리뷰많은순
                                </button>
                            </div>
                        </div>

                        {/* Scrolling List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {processedRestaurants.length === 0 && !isLoading && (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
                                    {restaurants.length === 0 ? "지도 탐색 후 '주변 음식점 찾기'를 눌러보세요." : "조건에 맞는 음식점이 없습니다."}
                                </div>
                            )}
                            {processedRestaurants.map((place) => (
                                <RestaurantCard
                                    key={place.place_id}
                                    place={place}
                                    isSelected={false} // List items not highlighted as "selected" since selection transitions view
                                    isFavorite={favorites.has(place.place_id)}
                                    onToggleFavorite={handleToggleFavorite}
                                    onClick={(e) => {
                                        if (e?.action === 'directions') handleCardAction(e);
                                        else if (e?.action === 'checkin') handleCardAction(e);
                                        else handleCardClick(place);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MapView);
