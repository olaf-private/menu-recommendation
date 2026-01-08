import { db } from "../firebase";
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, deleteDoc, doc } from "firebase/firestore";

const COLLECTION_NAME = "users";

// Helper to get user's visit collection ref
const getVisitCollection = (userId) => collection(db, COLLECTION_NAME, userId, "visits");

export const recordVisit = async (userId, place) => {
    if (!userId || !place) throw new Error("Missing userId or place data");

    const visitData = {
        placeId: place.place_id,
        name: place.name,
        location: place.geometry.location, // { lat, lng }
        vicinity: place.vicinity || "",
        visitedAt: Timestamp.now()
    };

    try {
        const docRef = await addDoc(getVisitCollection(userId), visitData);
        return docRef.id;
    } catch (error) {
        console.error("Error recording visit:", error);
        throw error;
    }
};

export const getVisitHistory = async (userId) => {
    if (!userId) return [];

    try {
        const q = query(
            getVisitCollection(userId),
            orderBy("visitedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            visitedAt: doc.data().visitedAt.toDate() // Convert Timestamp to Date
        }));
    } catch (error) {
        console.error("Error fetching history:", error);
        throw error;
    }
}

const getFavoriteCollection = (userId) => collection(db, COLLECTION_NAME, userId, "favorites");

export const toggleFavorite = async (userId, place) => {
    if (!userId || !place) throw new Error("Missing data");

    const favRef = getFavoriteCollection(userId);
    const q = query(favRef, where("placeId", "==", place.place_id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Already exists -> Remove
        const docId = querySnapshot.docs[0].id;
        await deleteDoc(doc(db, COLLECTION_NAME, userId, "favorites", docId));
        return { action: 'removed', docId };
    } else {
        // Add
        const favData = {
            placeId: place.place_id,
            name: place.name,
            location: place.geometry.location,
            vicinity: place.vicinity || "",
            createdAt: Timestamp.now()
        };
        await addDoc(favRef, favData);
        return { action: 'added' };
    }
};

export const getFavorites = async (userId) => {
    if (!userId) return [];
    const q = query(getFavoriteCollection(userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const checkIsFavorite = async (userId, placeId) => {
    if (!userId || !placeId) return false;
    const q = query(getFavoriteCollection(userId), where("placeId", "==", placeId));
    const snap = await getDocs(q);
    return !snap.empty;
};
