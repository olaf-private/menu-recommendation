import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import '../styles/index.css';

const RestaurantCard = ({ place, onClick, isSelected }) => {
    if (!place) return null;

    const photoUrl = place.photos && place.photos.length > 0
        ? place.photos[0].getUrl({ maxWidth: 400 })
        : 'https://via.placeholder.com/400x300?text=No+Image';

    return (
        <div
            className={`glass-panel restaurant-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                marginBottom: '1rem',
                border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)',
                transform: isSelected ? 'scale(1.02)' : 'none',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={photoUrl}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {place.opening_hours?.isOpen() && (
                    <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.9)', // Emerald 500
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}>
                        Open
                    </span>
                )}
            </div>

            <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>
                    {place.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" style={{ marginRight: '4px' }} />
                    <span style={{ color: 'var(--color-text-main)', fontWeight: '600', marginRight: '4px' }}>
                        {place.rating || 'N/A'}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        ({place.user_ratings_total || 0})
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={14} style={{ marginRight: '6px', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {place.vicinity}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;
