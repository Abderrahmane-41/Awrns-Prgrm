import React, { useState } from 'react';

const UrlInvestigator = ({ data, onComplete }) => {
  const [flags, setFlags] = useState([]);
  
  const links = [
    { text: 'Sign In to Google', url: 'http://my-google-login-secure.com/auth', bad: true },
    { text: 'Employee Insurance Portal', url: 'https://hr.ourcompany.com/insurance', bad: false },
    { text: 'Download Invoice PDF', url: 'http://bit.ly/3kX9q8', bad: true }
  ];

  const toggleFlag = (idx) => {
    if (flags.includes(idx)) {
      setFlags(flags.filter(i => i !== idx));
    } else {
      setFlags([...flags, idx]);
    }
  };

  const handleSubmit = () => {
    let correctPlays = 0;
    links.forEach((link, idx) => {
      const flagged = flags.includes(idx);
      if (link.bad && flagged) correctPlays++;
      if (!link.bad && !flagged) correctPlays++;
    });

    const success = correctPlays === links.length;
    onComplete(success ? 100 : 0, success);
  };

  return (
    <div className="quiz-card">
      <h2 style={{ marginBottom: '16px' }}>Hover and Investigate</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
        Hover over the buttons below to reveal where they actually lead. Flag the malicious links!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {links.map((link, idx) => {
          const isFlagged = flags.includes(idx);
          return (
            <div key={idx} style={{ 
              display: 'flex', alignItems: 'center', gap: '16px', 
              background: isFlagged ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)', 
              padding: '16px', borderRadius: '8px',
              border: isFlagged ? '1px solid #ef4444' : '1px solid transparent'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <button style={{ 
                    padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'help'
                  }}
                  title={link.url}
                >
                  {link.text}
                </button>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  Hover to inspect URL (check your browser tooltip).
                </div>
              </div>
              
              <button 
                onClick={() => toggleFlag(idx)}
                style={{ 
                  padding: '12px', background: isFlagged ? '#ef4444' : 'rgba(255,255,255,0.1)', 
                  border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer',
                  fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {isFlagged ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    Flagged
                  </>
                ) : 'Flag as Malicious'}
              </button>
            </div>
          );
        })}
      </div>

      <button className="quiz-next-btn" style={{ width: '100%', marginTop: '32px' }} onClick={handleSubmit}>
        Submit Investigation
      </button>
    </div>
  );
};
export default UrlInvestigator;
