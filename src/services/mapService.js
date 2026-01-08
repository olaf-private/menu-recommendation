const PLACE_RADIUS_METERS = 2000; // 2km

/**
 * Search for nearby restaurants provided a location and map instance (for PlacesService)
 * @param {google.maps.Map} mapInstance 
 * @param {google.maps.LatLngLiteral} location 
 * @returns {Promise<Array>}
 */
/**
 * Search for nearby restaurants provided a location using Places Library v3 (New API)
 * @param {google.maps.Map} mapInstance 
 * @param {google.maps.LatLngLiteral} location 
 * @returns {Promise<Array>}
 */
export const searchNearbyRestaurants = async (mapInstance, location) => {
    if (!mapInstance || !location) {
        throw new Error("Map instance or location missing");
    }

    try {
        const { places } = await window.google.maps.places.Place.searchNearby({
            fields: ['displayName', 'location', 'formattedAddress', 'photos', 'rating', 'userRatingCount', 'regularOpeningHours', 'id', 'types', 'primaryType'],
            locationRestriction: {
                center: location,
                radius: PLACE_RADIUS_METERS,
            },
            includedPrimaryTypes: [
                'restaurant',
                'cafe',
                'bakery',
                'meal_takeaway',
                'bar',
                'korean_restaurant',
                'japanese_restaurant',
                'chinese_restaurant',
                'fast_food_restaurant',
                'pizza_restaurant',
                'hamburger_restaurant',
                'steak_house',
                'barbecue_restaurant',
                'indian_restaurant',
                'italian_restaurant',
                'vietnamese_restaurant',
                'thai_restaurant',
                'mexican_restaurant',
                'asian_restaurant',
                'sushi_restaurant',
                'ramen_restaurant'
            ],
            language: 'ko',
            maxResultCount: 20
        });

        // Map new API response to match stricture expected by UI
        return places.map(place => ({
            place_id: place.id,
            name: place.displayName,
            geometry: {
                location: place.location
            },
            rating: place.rating,
            user_ratings_total: place.userRatingCount,
            vicinity: place.formattedAddress, // Use address as vicinity fallback
            types: place.types, // Pass types
            primaryType: place.primaryType, // Pass primaryType
            photos: place.photos ? place.photos.map(photo => ({
                getUrl: (options) => photo.getURI(options) // Map getURI to getUrl
            })) : [],
            opening_hours: {
                isOpen: null // API v3 'isOpen' method unavailable in current channel
            }
        }));
    } catch (error) {
        console.error("New Places API Error:", error);
        throw error;
    }
};

// getPlaceDetails is no longer needed as searchNearby returns full Place objects with requested fields
// keeping empty or throwing generic error if called legacy wise
/**
 * Get details for a specific place by ID using Places Library v3
 * @param {string} placeId 
 * @returns {Promise<Object>}
 */
export const getPlaceDetails = async (placeId) => {
    if (!placeId) throw new Error("Place ID missing");

    try {
        const place = new window.google.maps.places.Place({ id: placeId });

        await place.fetchFields({
            fields: ['displayName', 'location', 'formattedAddress', 'photos', 'rating', 'userRatingCount', 'regularOpeningHours', 'id', 'reviews', 'googleMapsURI']
        });

        // Map to structure matching searchNearbyRestaurants
        return {
            place_id: place.id,
            name: place.displayName,
            geometry: {
                location: place.location
            },
            rating: place.rating,
            user_ratings_total: place.userRatingCount,
            vicinity: place.formattedAddress,
            photos: place.photos ? place.photos.map(photo => ({
                getUrl: (options) => photo.getURI(options)
            })) : [],
            opening_hours: {
                isOpen: null
            },
            reviews: place.reviews || [],
            googleMapsURI: place.googleMapsURI
        };
    } catch (error) {
        console.error("Get Place Details Error:", error);
        throw error;
    }
};

/**
 * Calculate route between two points
 * @param {google.maps.LatLngLiteral} origin 
 * @param {google.maps.LatLngLiteral} destination 
 * @returns {Promise<google.maps.DirectionsResult>}
 */
export const calculateRoute = (origin, destination) => {
    return new Promise((resolve, reject) => {
        if (!origin || !destination) {
            reject("Origin or destination missing");
            return;
        }

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: window.google.maps.TravelMode.WALKING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    resolve(result);
                } else {
                    reject(status);
                }
            }
        );
    });
};
