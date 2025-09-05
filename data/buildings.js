// Buildings data - defines all automated income sources
const BUILDINGS_DATA = [
    {
        id: 'intern',
        name: '🧑‍💼 Intern',
        description: 'Fresh-faced college graduate who resolves simple password resets and printer issues.',
        baseRate: 0.1,
        baseCost: 15,
        costGrowth: 1.07,
        unlockAt: 0,
        icon: '🧑‍💼',
        category: 'staff',
        synergies: ['scripted_answers']
    },
    {
        id: 'firstline',
        name: '📞 1st-Line Agent',
        description: 'Experienced support agent with scripted responses and standard troubleshooting procedures.',
        baseRate: 1,
        baseCost: 100,
        costGrowth: 1.08,
        unlockAt: 1,
        icon: '📞',
        category: 'staff',
        synergies: ['scripted_answers', 'knowledge_base', 'remote_tools']
    },
    {
        id: 'engineer',
        name: '👨‍💻 2nd-Line Engineer',
        description: 'Technical specialist who handles complex issues escalated from 1st-line support.',
        baseRate: 8,
        baseCost: 1100,
        costGrowth: 1.09,
        unlockAt: 25,
        icon: '👨‍💻',
        category: 'staff',
        synergies: ['rubber_duck', 'sre_runbooks']
    },
    {
        id: 'knowledge_base',
        name: '📚 Knowledge Base',
        description: 'Centralized repository of solutions that helps agents resolve tickets faster.',
        baseRate: 0,
        baseCost: 500,
        costGrowth: 1.10,
        unlockAt: 10,
        icon: '📚',
        category: 'tools',
        effect: 'multiplier',
        synergies: ['top_articles']
    },
    {
        id: 'remote_tools',
        name: '🖥️ Remote Access Tools',
        description: 'Screen sharing and remote control software for hands-on problem solving.',
        baseRate: 0,
        baseCost: 750,
        costGrowth: 1.11,
        unlockAt: 20,
        icon: '🖥️',
        category: 'tools',
        effect: 'click_boost',
        synergies: ['remote_culture']
    },
    {
        id: 'chatbot',
        name: '🤖 Chatbot',
        description: 'AI-powered first response system that handles basic inquiries automatically.',
        baseRate: 4,
        baseCost: 5000,
        costGrowth: 1.12,
        unlockAt: 100,
        icon: '🤖',
        category: 'automation',
        synergies: ['coffee_rush_boost']
    },
    {
        id: 'monitoring',
        name: '📊 Monitoring System',
        description: 'Proactive alerting system that generates incident reports for resolution.',
        baseRate: 0,
        baseCost: 15000,
        costGrowth: 1.13,
        unlockAt: 300,
        icon: '📊',
        category: 'tools',
        effect: 'incident_generator',
        synergies: ['sre_runbooks']
    },
    {
        id: 'sre_shift',
        name: '🔧 SRE Team',
        description: 'Site Reliability Engineers who maintain system stability and reduce incident volume.',
        baseRate: 20,
        baseCost: 50000,
        costGrowth: 1.14,
        unlockAt: 500,
        icon: '🔧',
        category: 'staff',
        synergies: ['all_hands_boost', 'follow_sun']
    },
    {
        id: 'auto_triage',
        name: '🎯 Auto-Triage AI',
        description: 'Machine learning system that automatically categorizes and routes tickets.',
        baseRate: 0,
        baseCost: 200000,
        costGrowth: 1.14,
        unlockAt: 1000,
        icon: '🎯',
        category: 'automation',
        effect: 'crit_chance',
        synergies: ['ai_orchestrator']
    },
    {
        id: 'ai_orchestrator',
        name: '🧠 AI Orchestrator',
        description: 'Advanced AI system that coordinates all automated processes and optimizes workflows.',
        baseRate: 0,
        baseCost: 1000000,
        costGrowth: 1.15,
        unlockAt: 2500,
        icon: '🧠',
        category: 'automation',
        effect: 'meta_multiplier',
        synergies: ['micro_scripts']
    }
];

// Helper function to get building data by ID
function getBuildingData(id) {
    return BUILDINGS_DATA.find(building => building.id === id);
}

// Helper function to get buildings by category
function getBuildingsByCategory(category) {
    return BUILDINGS_DATA.filter(building => building.category === category);
}