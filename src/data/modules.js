export const modulesData = [
  {
    id: 'c3b03692-0b1a-4d22-b5e1-5e921d2b7711',
    type: 'email-inspector',
    title: 'Phishing Email Inspector',
    description: 'Inspect a live email and click the red flags before it is too late.',
    gameData: {
      sender: 'hr-support@company-update.com',
      subject: 'URGENT: Payroll Update Required',
      body: 'Dear employee,\n\nYour paycheck will be delayed if you don\'t click the link below to verify your account.\n\nhttp://login.micro-soft-secure.net/payroll',
      redFlags: ['hr-support@company-update.com', 'URGENT', 'http://login.micro-soft-secure.net/payroll']
    }
  },
  {
    id: 'f4b01021-0b1a-4d22-b5e1-5e921d2b7722',
    type: 'password-forge',
    title: 'Password Forge',
    description: 'Build a password that can withstand a hacker\'s brute force attack.',
    gameData: {
      targetStrength: 4
    }
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    type: 'drag-drop-sort',
    title: 'Data Classification Sorter',
    description: 'Quickly sort these documents into Public or Confidential buckets.',
    gameData: { }
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    type: 'chat-simulator',
    title: 'SMS Smishing Simulator',
    description: 'Navigate a suspicious text conversation without giving up your data.',
    gameData: { }
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    type: 'timeline-order',
    title: 'Incident Response Timeline',
    description: 'Put the incident response steps in the correct order.',
    gameData: { }
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    type: 'url-investigator',
    title: 'URL Investigator',
    description: 'Hover to reveal the true URL and flag the malicious ones.',
    gameData: { }
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    type: 'rapid-fire',
    title: 'Rapid Fire Security',
    description: 'Fast paced True/False game. You have 5 seconds per question!',
    gameData: { }
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    type: 'mcq',
    title: 'Policy Compliance',
    description: 'Standard security policy multiple choice.',
    questions: [
      {
        question: 'Someone tries to tailgate you into the building. Do you let them?',
        options: ['Yes', 'No, direct them to reception'],
        correctAnswer: 1,
        explanation: 'Never allow tailgating.'
      }
    ]
  }
];
