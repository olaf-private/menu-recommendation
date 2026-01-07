const PLACE_RADIUS_METERS = 1000; // 1km

/**
 * Search for nearby restaurants provided a location and map instance (for PlacesService)
 * @param {google.maps.Map} mapInstance 
 * @param {google.maps.LatLngLiteral} location 
 * @returns {Promise<Array>}
 */
export const searchNearbyRestaurants = (mapInstance, location) => {
    return new Promise((resolve, reject) => {
        if (!mapInstance || !location) {
            reject("Map instance or location missing");
            return;
        }

        const service = new window.google.maps.places.PlacesService(mapInstance);

        const request = {
            location: location,
            radius: PLACE_RADIUS_METERS,
            type: ['restaurant', 'cafe', 'bakery', 'meal_takeaway'],
            language: 'ko' // Search in Korean
        };

        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                // ZERO_RESULTS is not technically an error for the app, just empty list
                if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(status);
                }
            }
        });
    });
};

/**
 * Get detailed information for a specific place
 * @param {google.maps.Map} mapInstance 
 * @param {string} placeId 
 * @returns {Promise<Object>}
 */
export const getPlaceDetails = (mapInstance, placeId) => {
    return new Promise((resolve, reject) => {
        if (!mapInstance || !placeId) {
            reject("Map instance or Place ID missing");
            return;
        }

        const service = new window.google.maps.places.PlacesService(mapInstance);

        const request = {
            placeId: placeId,
            fields: ['name', 'rating', 'formatted_address', 'photos', 'geometry', 'opening_hours', 'price_level', 'user_ratings_total', 'url']
        };

        service.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve(place);
            } else {
                reject(status);
            }
        });
    });
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
