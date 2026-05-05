import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNewsArticles } from '../lib/supabaseNewsApi';

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHoverBack, setIsHoverBack] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNewsArticles();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      padding: '64px 24px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Threat Intel Bulletin</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Stay informed on the latest cyber traps, scams, and vulnerabilities.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            onMouseEnter={() => setIsHoverBack(true)}
            onMouseLeave={() => setIsHoverBack(false)}
            style={{
              padding: '10px 20px',
              background: isHoverBack ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.3s ease', transform: isHoverBack ? 'translateX(-6px)' : 'translateX(0)' }}>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Loading intelligence feed...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No active alerts.</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Your IT environment is currently secure.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {articles.map((article) => (
              <div key={article.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'background 0.3s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{
                    background: article.tag === 'PHISHING' ? 'rgba(239,68,68,0.15)' : article.tag === 'SCAM' ? 'rgba(234,179,8,0.15)' : 'rgba(99,55,255,0.15)',
                    color: article.tag === 'PHISHING' ? '#f87171' : article.tag === 'SCAM' ? '#fde047' : '#a78bfa',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    {article.tag}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                     {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>{article.title}</h2>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                   <strong>Overview:</strong> {article.summary}
                </div>
                <div style={{ 
                   padding: '16px 20px', 
                   background: 'rgba(0,0,0,0.3)', 
                   borderLeft: '3px solid #6337ff',
                   color: 'rgba(255,255,255,0.5)',
                   fontSize: '15px',
                   lineHeight: '1.6',
                   borderRadius: '0 8px 8px 0'
                }}>
                   {article.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
