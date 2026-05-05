import emailjs from '@emailjs/browser';

/**
 * Sends a professional security training report to the user.
 * For this to work in production, you'll need an EmailJS Public Key in your .env
 */
export const sendResultEmail = async (user, moduleTitle, score, passed) => {
  if (!user?.email) return;

  const templateParams = {
    to_name: user.user_metadata?.full_name || user.email.split('@')[0],
    to_email: user.email,
    module_name: moduleTitle,
    score: `${score}%`,
    status: passed ? 'PASSED (Secure)' : 'FAILED (Vulnerable)',
    date: new Date().toLocaleDateString(),
    security_tips: passed 
      ? "Excellent work! You've demonstrated high awareness. Stay vigilant against new social engineering tactics." 
      : "We recommend reviewing the module materials. Social engineering often preys on urgency and trust.",
    primary_color: passed ? '#10b981' : '#ef4444'
  };

  try {
    // Note: You must sign up for a free EmailJS account and get these keys
    // ServiceID, TemplateID, and PublicKey
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_report';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!PUBLIC_KEY) {
      console.warn("Email service is in MOCK mode (No VITE_EMAILJS_PUBLIC_KEY found in .env)");
      return { success: true, mocked: true };
    }

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('EMAIL SUCCESS!', response.status, response.text);
    return { success: true };
  } catch (err) {
    console.error('EMAIL FAILED...', err);
    return { success: false, error: err };
  }
};

/**
 * Sends a full aggregated progress report covering all completed and missing modules.
 */
export const sendAggregatedResultEmail = async (user, completedModulesList, missingModulesList, overallCompleteness) => {
  if (!user?.email) return;

  const passedNames = completedModulesList.map(m => `✅ ${m.title}`).join('\n');
  const missingNames = missingModulesList.map(m => `❌ ${m.title}`).join('\n');
  
  const detailedFeedback = `
COMPLETED TRAINING:
${passedNames || 'None yet.'}

PENDING TRAINING:
${missingNames || 'None! You are fully certified.'}

Keep up the great work learning how to defend against modern cyber threats!
  `.trim();

  const templateParams = {
    to_name: user.user_metadata?.full_name || user.email.split('@')[0],
    to_email: user.email,
    module_name: 'Full Security Progress Report',
    score: `${overallCompleteness}%`,
    status: overallCompleteness === 100 ? 'FULLY CERTIFIED' : 'IN PROGRESS',
    date: new Date().toLocaleDateString(),
    security_tips: detailedFeedback,
    primary_color: overallCompleteness === 100 ? '#10b981' : '#6337ff'
  };

  try {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_report';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!PUBLIC_KEY) return { success: true, mocked: true };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Sends a disciplinary/warning email to a user with very low scores from the Admin Dashboard.
 */
export const sendWarningEmail = async (targetUserName, targetEmail, modulesCompleted, avgScore) => {
  if (!targetEmail) return { success: false, error: 'No email provided' };

  const detailedFeedback = `
ADMINISTRATIVE NOTICE:
Your company security metrics are currently below the acceptable threshold.

Modules Completed: ${modulesCompleted}
Average Score: ${avgScore}%

Please log in immediately and resume your security awareness training to avoid further compliance action.
  `.trim();

  const templateParams = {
    to_name: targetUserName,
    to_email: targetEmail,
    module_name: 'ACTION REQUIRED: Security Training Compliance',
    score: `${avgScore}% (Non-Compliant)`,
    status: 'AT RISK',
    date: new Date().toLocaleDateString(),
    security_tips: detailedFeedback,
    primary_color: '#ef4444' // Red warning
  };

  try {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_report';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!PUBLIC_KEY) return { success: true, mocked: true };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};
