import React, { useState } from 'react';

const DragDropSorter = ({ data, onComplete }) => {
  const items = [
    { id: '1', name: 'Cafeteria Weekly Menu', bucket: 'public' },
    { id: '2', name: 'Q3 Earnings Report Draft', bucket: 'confidential' },
    { id: '3', name: 'Employee Home Addresses', bucket: 'confidential' },
    { id: '4', name: 'Company Logo Press Kit', bucket: 'public' },
    { id: '5', name: 'Server Root Passwords', bucket: 'confidential' },
    { id: '6', name: 'Job Posting for LinkedIn', bucket: 'public' },
  ];

  const [unsorted, setUnsorted] = useState([...items]);
  const [publicBucket, setPublicBucket] = useState([]);
  const [confidentialBucket, setConfidentialBucket] = useState([]);

  const moveItem = (item, targetBucket) => {
    setUnsorted(prev => prev.filter(i => i.id !== item.id));
    if (targetBucket === 'public') {
      setPublicBucket(prev => [...prev, item]);
    } else {
      setConfidentialBucket(prev => [...prev, item]);
    }
  };

  const handleSubmit = () => {
    if (unsorted.length > 0) return;

    let correct = 0;
    publicBucket.forEach(item => { if (item.bucket === 'public') correct++; });
    confidentialBucket.forEach(item => { if (item.bucket === 'confidential') correct++; });
    
    const score = Math.round((correct / items.length) * 100);
    onComplete(score, score >= 80);
  };

  return (
    <div className="quiz-card">
      <h2 style={{ marginBottom: '8px' }}>Data Classification Challenge</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
        Sort each document into the correct bucket. Click Public or Confidential for each item.
      </p>

      {/* Unsorted Items */}
      {unsorted.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ marginBottom: '12px', color: '#fbbf24' }}>Unsorted Documents ({unsorted.length} remaining)</h4>
          {unsorted.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={{marginRight:'8px', verticalAlign:'middle'}}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {item.name}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => moveItem(item, 'public')}
                  style={{ padding: '8px 16px', background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Public
                </button>
                <button
                  onClick={() => moveItem(item, 'confidential')}
                  style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Confidential
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ color: '#3b82f6', marginBottom: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{marginRight:'6px', verticalAlign:'middle'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Public ({publicBucket.length})
          </h4>
          {publicBucket.map(item => (
            <div key={item.id} style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: '6px', marginBottom: '6px', fontSize: '14px' }}>
              {item.name}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ color: '#ef4444', marginBottom: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{marginRight:'6px', verticalAlign:'middle'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Confidential ({confidentialBucket.length})
          </h4>
          {confidentialBucket.map(item => (
            <div key={item.id} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', marginBottom: '6px', fontSize: '14px' }}>
              {item.name}
            </div>
          ))}
        </div>
      </div>

      <button 
        className="quiz-next-btn" 
        style={{ width: '100%', opacity: unsorted.length > 0 ? 0.4 : 1 }}
        onClick={handleSubmit}
        disabled={unsorted.length > 0}
      >
        {unsorted.length > 0 ? `Sort all ${unsorted.length} remaining items first` : 'Submit Classification'}
      </button>
    </div>
  );
};
export default DragDropSorter;
