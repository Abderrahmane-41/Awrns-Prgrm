import React, { useState } from 'react';

const EmailInspector = ({ data, onComplete }) => {
  const [foundFlags, setFoundFlags] = useState([]);
  const expectedFlags = data.gameData.redFlags;

  const handleTextClick = (text) => {
    if (expectedFlags.includes(text) && !foundFlags.includes(text)) {
      setFoundFlags([...foundFlags, text]);
    }
  };

  const getHighlightStyle = (text) => {
    if (foundFlags.includes(text)) {
      return { backgroundColor: 'rgba(239, 68, 68, 0.5)', cursor: 'default', padding: '2px', borderRadius: '4px' };
    }
    return { cursor: 'pointer' };
  };

  const handleSubmit = () => {
    const success = foundFlags.length === expectedFlags.length;
    onComplete(success ? 100 : 0, success);
  };

  return (
    <div className="quiz-card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Fake Email Header */}
      <div style={{ background: '#f3f4f6', padding: '16px', color: '#111' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#333' }}>Inbox - SecureMail</h2>
        <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
          <strong>From: </strong> 
          <span 
            onClick={() => handleTextClick(data.gameData.sender)}
            style={getHighlightStyle(data.gameData.sender)}
          >
            {data.gameData.sender}
          </span>
        </div>
        <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
          <strong>Subject: </strong> 
          <span 
            onClick={() => handleTextClick('URGENT')}
            style={getHighlightStyle('URGENT')}
          >
            {data.gameData.subject}
          </span>
        </div>
      </div>
      
      {/* Fake Email Body */}
      <div style={{ padding: '24px', background: '#fff', color: '#333', minHeight: '200px' }}>
        <p>Dear employee,</p>
        <p>Your paycheck will be delayed if you don't click the link below to verify your account.</p>
        <p>
          <span 
            onClick={() => handleTextClick('http://login.micro-soft-secure.net/payroll')}
            style={{ ...getHighlightStyle('http://login.micro-soft-secure.net/payroll'), color: '#3b82f6', textDecoration: 'underline' }}
          >
            http://login.micro-soft-secure.net/payroll
          </span>
        </p>
      </div>

      {/* Game UI */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ marginBottom: '12px' }}>Mission: Find the {expectedFlags.length} Red Flags</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          Click on the suspicious elements in the email above to flag them.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Found: <span style={{ color: foundFlags.length === expectedFlags.length ? '#10b981' : '#f59e0b' }}>
              {foundFlags.length} / {expectedFlags.length}
            </span>
          </div>
          <button 
            className="quiz-next-btn" 
            style={{ margin: 0 }}
            onClick={handleSubmit}
          >
            Submit Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailInspector;
