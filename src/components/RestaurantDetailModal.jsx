import React from 'react';
import { X, Star, MapPin, Clock, ExternalLink, MessageSquare, Navigation, ArrowLeft } from 'lucide-react';
import '../styles/index.css';

const RestaurantDetailModal = ({ place, onClose, onToggleFavorite, isFavorite }) => {
    if (!place) return null;

    const photoUrl = place.photos && place.photos.length > 0
        ? place.photos[0].getUrl({ maxWidth: 800 })
        : 'https://via.placeholder.com/800x400?text=No+Image';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Image */}
            <div style={{ height: '200px', flexShrink: 0, position: 'relative' }}>
                <img
                    src={photoUrl}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Back Button (was Close) */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px', // Left side for "Back" feel
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>

                {/* Favorite Button on Image */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(place);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <HeartIcon filled={isFavorite} />
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                <h2 className="text-gradient" style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem' }}>{place.name}</h2>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <Star size={18} fill="#f59e0b" color="#f59e0b" style={{ marginRight: '5px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{place.rating}</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '5px' }}>({place.user_ratings_total} reviews)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                    <MapPin size={16} style={{ marginRight: '8px' }} />
                    <span style={{ marginRight: '8px', cursor: 'text' }}>{place.vicinity}</span>
                    <button
                        onClick={() => {
                            if (place.vicinity) {
                                navigator.clipboard.writeText(place.vicinity);
                                alert("주소가 복사되었습니다.");
                            }
                        }}
                        style={{
                            background: 'none',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.75rem',
                            color: 'var(--color-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        복사
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                    <Clock size={16} style={{ marginRight: '8px' }} />
                    <span>영업 시간 정보는 지도에서 확인하세요</span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                    <button
                        onClick={() => {
                            if (place.geometry && place.geometry.location) {
                                const destLat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
                                const destLng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
                                window.open(url, '_blank');
                            }
                        }}
                        className="btn-primary"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            background: '#3b82f6',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Navigation size={18} style={{ marginRight: '8px' }} />
                        길찾기 (지도 앱)
                    </button>
                    <a
                        href={place.googleMapsURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-panel"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            padding: '12px',
                            color: 'var(--color-text-main)'
                        }}
                    >
                        <ExternalLink size={18} style={{ marginRight: '8px' }} />
                        메뉴/정보
                    </a>
                </div>

                {/* Reviews Section */}
                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                    <MessageSquare size={18} style={{ marginRight: '8px' }} />
                    최근 리뷰
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {place.reviews && place.reviews.length > 0 ? (
                        place.reviews.map((review, index) => (
                            <div key={index} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '600' }}>{review.authorAttribution?.displayName || review.author_name || 'Anonymous'}</span>
                                    <div style={{ display: 'flex' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < review.rating ? "#f59e0b" : "none"} color={i < review.rating ? "#f59e0b" : "#4b5563"} />
                                        ))}
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5', margin: 0 }}>
                                    {review.text?.text || review.text || "No review text."}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.5rem' }}>
                                    {review.relativePublishTimeDescription}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>리뷰가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Internal Heart Component to avoid import mess if icon not passed
const HeartIcon = ({ filled }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={filled ? "#ef4444" : "none"}
        stroke={filled ? "#ef4444" : "#ffffff"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

export default RestaurantDetailModal;
