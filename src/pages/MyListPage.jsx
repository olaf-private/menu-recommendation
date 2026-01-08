import React, { useEffect, useState } from 'react';
import { getFavorites, toggleFavorite } from '../services/storageService';
import { MapPin, Heart } from 'lucide-react';
import '../styles/index.css';

const MyListPage = ({ user }) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        if (user) {
            try {
                const data = await getFavorites(user.uid);
                setFavorites(data);
            } catch (error) {
                console.error("Failed to load favorites", error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFavorites();
    }, [user]);

    const handleRemove = async (place) => {
        if (!confirm("삭제하시겠습니까?")) return;
        try {
            await toggleFavorite(user.uid, { place_id: place.placeId }); // Mapping needed
            fetchFavorites(); // Reload
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2 style={{ color: 'var(--color-text-main)' }}>로그인이 필요합니다</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>나만의 맛집 리스트를 만드려면 로그인해주세요.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '1rem', paddingBottom: '80px' }}>
            <h2 style={{ color: 'var(--color-text-main)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>나만의 맛집 ({favorites.length})</h2>

            {loading ? (
                <div style={{ color: 'var(--color-text-muted)' }}>로딩 중...</div>
            ) : favorites.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--color-text-muted)',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                }}>
                    즐겨찾는 맛집이 없습니다.
                    <br />
                    지도에서 ♡ 버튼을 눌러보세요!
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {favorites.map((fav) => (
                        <div key={fav.id} className="glass-panel" style={{ padding: '1rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)', paddingRight: '30px' }}>{fav.name}</h3>
                                <button
                                    onClick={() => handleRemove(fav)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Heart size={20} fill="#ef4444" color="#ef4444" />
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                <MapPin size={14} style={{ marginRight: '4px' }} />
                                {fav.vicinity}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListPage;
