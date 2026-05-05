import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modulesData } from '../data/modules.js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import ModuleIcon, { LockIcon, CheckIcon } from '../components/Icons';
import Swal from 'sweetalert2';

const LearningPath = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completedModules, setCompletedModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setTimeout(() => {
        const savedProgress = JSON.parse(localStorage.getItem(`progress_${user.id}`)) || [];
        setCompletedModules(savedProgress);
        setLoading(false);
      }, 500);
    };
    fetchProgress();
  }, [user.id]);

  const handleModuleClick = (moduleItem, isLocked) => {
    if (isLocked) {
      Swal.fire({
        iconHtml: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        title: 'Module Locked',
        text: 'Finish the previous modules to unlock this one.',
        background: '#0d0d1a',
        color: '#fff',
        confirmButtonColor: '#6337ff',
        customClass: { icon: 'swal-no-border' }
      });
      return;
    }
    navigate(`/quiz/${moduleItem.id}`);
  };

  if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading Path...</div>;

  const completionPercent = Math.round((completedModules.length / modulesData.length) * 100);

  return (
    <div className="learning-path-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Learning Path</h1>
        <p className="page-subtitle">Your personalized cyber awareness roadmap. Complete scenarios to unlock the next.</p>
      </div>

      {/* Progress Timeline Bar */}
      <div className="lp-progress-bar-container">
        <div className="lp-progress-info">
          <span>{completedModules.length} of {modulesData.length} modules completed</span>
          <span className="lp-progress-percent">{completionPercent}%</span>
        </div>
        <div className="lp-progress-track">
          <div className="lp-progress-fill" style={{ width: `${completionPercent}%` }}></div>
        </div>
      </div>

      <div className="roadmap-container">
        {modulesData.map((mod, index) => {
          const isCompleted = completedModules.includes(mod.id);
          const isUnlocked = index === 0 || completedModules.includes(modulesData[index - 1].id);
          const isLocked = !isUnlocked;

          return (
            <div 
              key={mod.id} 
              className={`roadmap-node ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleModuleClick(mod, isLocked)}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="node-connector"></div>
              <div className="node-icon-wrapper">
                {isLocked ? (
                  <LockIcon size={22} />
                ) : isCompleted ? (
                  <CheckIcon size={22} />
                ) : (
                  <ModuleIcon type={mod.type} size={22} color="#c084fc" />
                )}
              </div>
              <div className="node-content">
                <h3>{index + 1}. {mod.title}</h3>
                <p>{mod.description}</p>
                {isCompleted && <span className="status-badge success">Completed</span>}
                {!isCompleted && isUnlocked && <span className="status-badge pending">In Progress</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LearningPath;
