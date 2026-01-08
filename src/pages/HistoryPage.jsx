import React, { useEffect, useState } from 'react';
import { getVisitHistory } from '../services/storageService';
import '../styles/index.css';

const HistoryPage = ({ user }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const data = await getVisitHistory(user.uid);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to load history", error);
                }
            }
            setLoading(false);
        };
        fetchHistory();
    }, [user]);

    if (!user) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2 style={{ color: 'var(--color-text-main)' }}>로그인이 필요합니다</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>방문 기록을 보려면 로그인해주세요.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '1rem', paddingBottom: '80px' }}>
            <h2 style={{ color: 'var(--color-text-main)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>방문 히스토리</h2>

            {loading ? (
                <div style={{ color: 'var(--color-text-muted)' }}>로딩 중...</div>
            ) : history.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--color-text-muted)',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                }}>
                    아직 방문한 음식점이 없습니다.
                    <br />
                    지도에서 '방문 체크'를 해보세요!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((visit) => (
                        <div key={visit.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{visit.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    {visit.visitedAt.toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                {visit.vicinity}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
