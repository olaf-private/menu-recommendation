import React from 'react';
import { Star, MapPin, Clock, Heart } from 'lucide-react';
import '../styles/index.css';

const RestaurantCard = ({ place, onClick, isSelected, isFavorite, onToggleFavorite }) => {
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
                {/* Open Badge Removed due to API limitation */}
            </div>

            <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                        {place.name}
                    </h3>
                    {place.distanceDisplay && (
                        <span style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-primary)',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            {place.distanceDisplay}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" style={{ marginRight: '4px' }} />
                    <span style={{ color: 'var(--color-text-main)', fontWeight: '600', marginRight: '4px' }}>
                        {place.rating || 'N/A'}
                    </span>

                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        ({place.user_ratings_total || 0})
                    </span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) onToggleFavorite(place);
                    }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px', // Left side as Open is on Right
                        padding: '4px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <Heart size={16} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#ffffff"} />
                </button>

                <div style={{ display: 'flex', alignItems: 'flex-start', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={14} style={{ marginRight: '6px', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {place.vicinity}
                    </span>
                </div>

                {isSelected && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClick) onClick({ action: 'directions', place });
                            }}
                            className="btn-primary"
                            style={{
                                flex: 1,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem'
                            }}
                        >
                            <Clock size={16} style={{ marginRight: '6px' }} />
                            길찾기
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClick) onClick({ action: 'checkin', place });
                            }}
                            className="glass-panel"
                            style={{
                                flex: 1,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                background: 'rgba(59, 130, 246, 0.2)', // Blue tint
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                color: '#60a5fa'
                            }}
                        >
                            방문 완료
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantCard;
