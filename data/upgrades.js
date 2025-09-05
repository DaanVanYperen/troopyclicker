// Upgrades data - defines all multipliers and synergies
const UPGRADES_DATA = [
    // Global multipliers
    {
        id: 'coffee_machine',
        name: '☕ Coffee Machine',
        description: 'Keeps the team caffeinated and productive. +50% global ticket resolution rate.',
        cost: 500,
        effect: 'global_multiplier',
        value: 1.5,
        unlockAt: 5,
        category: 'global',
        purchased: false
    },
    {
        id: 'better_chairs',
        name: '🪑 Ergonomic Chairs',
        description: 'Comfortable seating reduces fatigue. +25% global productivity.',
        cost: 2000,
        effect: 'global_multiplier',
        value: 1.25,
        unlockAt: 25,
        category: 'global',
        purchased: false
    },
    {
        id: 'team_training',
        name: '📖 Team Training Program',
        description: 'Comprehensive skill development increases efficiency. +75% global rate.',
        cost: 10000,
        effect: 'global_multiplier',
        value: 1.75,
        unlockAt: 100,
        category: 'global',
        purchased: false
    },

    // Scripted Answers series - 1st-Line synergy
    {
        id: 'scripted_answers_1',
        name: '📝 Scripted Answers I',
        description: 'Basic response templates for common issues. +100% 1st-Line Agent productivity.',
        cost: 200,
        effect: 'building_multiplier',
        target: 'firstline',
        value: 2.0,
        unlockAt: 3,
        category: 'synergy',
        purchased: false
    },
    {
        id: 'scripted_answers_2',
        name: '📝 Scripted Answers II',
        description: 'Advanced templates with troubleshooting flowcharts. +150% 1st-Line Agent productivity.',
        cost: 1500,
        effect: 'building_multiplier',
        target: 'firstline',
        value: 2.5,
        unlockAt: 15,
        category: 'synergy',
        purchased: false,
        requires: ['scripted_answers_1']
    },
    {
        id: 'scripted_answers_3',
        name: '📝 Scripted Answers III',
        description: 'AI-generated contextual responses. +200% 1st-Line Agent productivity.',
        cost: 15000,
        effect: 'building_multiplier',
        target: 'firstline',
        value: 3.0,
        unlockAt: 75,
        category: 'synergy',
        purchased: false,
        requires: ['scripted_answers_2']
    },

    // Knowledge Base synergies
    {
        id: 'top_articles',
        name: '⭐ Top Articles System',
        description: 'Every 50 Knowledge Bases boost 1st-Line Agents and Chatbots by +25%.',
        cost: 5000,
        effect: 'kb_synergy',
        value: 0.25,
        threshold: 50,
        targets: ['firstline', 'chatbot'],
        unlockAt: 50,
        category: 'synergy',
        purchased: false
    },
    {
        id: 'search_optimization',
        name: '🔍 Search Optimization',
        description: 'Improved search algorithms make Knowledge Bases 3x more effective.',
        cost: 25000,
        effect: 'building_multiplier',
        target: 'knowledge_base',
        value: 3.0,
        unlockAt: 150,
        category: 'synergy',
        purchased: false
    },

    // 2nd-Line Engineer synergies
    {
        id: 'rubber_duck',
        name: '🦆 Rubber Duck Debugging',
        description: 'Classical debugging technique. Small global boost, bigger if 2nd-Line ≥ 25.',
        cost: 7500,
        effect: 'conditional_multiplier',
        value: 1.1,
        bonusValue: 1.5,
        condition: 'building_count',
        target: 'engineer',
        threshold: 25,
        unlockAt: 60,
        category: 'synergy',
        purchased: false
    },
    {
        id: 'advanced_diagnostics',
        name: '🔬 Advanced Diagnostics',
        description: 'Sophisticated debugging tools. +300% 2nd-Line Engineer productivity.',
        cost: 50000,
        effect: 'building_multiplier',
        target: 'engineer',
        value: 4.0,
        unlockAt: 200,
        category: 'synergy',
        purchased: false
    },

    // Remote Tools synergies
    {
        id: 'remote_culture',
        name: '🏠 Remote-First Culture',
        description: 'Embracing distributed work. +100% click value and Remote Tools output.',
        cost: 3500,
        effect: 'dual_boost',
        clickMultiplier: 2.0,
        target: 'remote_tools',
        value: 2.0,
        unlockAt: 40,
        category: 'synergy',
        purchased: false
    },
    {
        id: 'mobile_support',
        name: '📱 Mobile Support Suite',
        description: 'Support from anywhere. +50% Remote Tools effectiveness.',
        cost: 12000,
        effect: 'building_multiplier',
        target: 'remote_tools',
        value: 1.5,
        unlockAt: 80,
        category: 'synergy',
        purchased: false
    },

    // Monitoring and SRE synergies
    {
        id: 'sre_runbooks',
        name: '📋 SRE Runbooks',
        description: 'Standardized procedures improve incident conversion efficiency by 200%.',
        cost: 75000,
        effect: 'incident_efficiency',
        value: 3.0,
        unlockAt: 400,
        category: 'synergy',
        purchased: false
    },
    {
        id: 'follow_sun',
        name: '🌍 Follow-the-Sun Support',
        description: '24/7 coverage increases uptime. Events last 15 seconds longer.',
        cost: 100000,
        effect: 'event_duration',
        value: 15,
        unlockAt: 600,
        category: 'synergy',
        purchased: false
    },

    // Quirky effects
    {
        id: 'escalate_deescalate',
        name: '⬆️ Escalate to De-escalate',
        description: '1% chance that 1st-Line escalations instantly resolve at 2nd-Line for 10x tickets.',
        cost: 25000,
        effect: 'escalation_bonus',
        chance: 0.01,
        multiplier: 10,
        unlockAt: 150,
        category: 'quirky',
        purchased: false
    },
    {
        id: 'placebo_button',
        name: '🔘 Placebo Button',
        description: 'Mysterious button that somehow makes everything work better. +5% global rate.',
        cost: 500000,
        effect: 'global_multiplier',
        value: 1.05,
        unlockAt: 1000,
        category: 'quirky',
        purchased: false
    },

    // Late game multipliers
    {
        id: 'quantum_computing',
        name: '⚛️ Quantum Computing',
        description: 'Harness quantum effects for exponential problem solving. +1000% global rate.',
        cost: 5000000,
        effect: 'global_multiplier',
        value: 11.0,
        unlockAt: 5000,
        category: 'global',
        purchased: false
    },
    {
        id: 'ai_singularity',
        name: '🌟 AI Singularity',
        description: 'Artificial intelligence surpasses human capability. All automation buildings get +500%.',
        cost: 50000000,
        effect: 'category_multiplier',
        target: 'automation',
        value: 6.0,
        unlockAt: 10000,
        category: 'synergy',
        purchased: false
    }
];

// Helper functions
function getUpgradeData(id) {
    return UPGRADES_DATA.find(upgrade => upgrade.id === id);
}

function getUpgradesByCategory(category) {
    return UPGRADES_DATA.filter(upgrade => upgrade.category === category);
}

function getAvailableUpgrades(lifetimeTickets) {
    return UPGRADES_DATA.filter(upgrade => 
        !upgrade.purchased && 
        lifetimeTickets >= upgrade.unlockAt &&
        (!upgrade.requires || upgrade.requires.every(req => 
            UPGRADES_DATA.find(u => u.id === req)?.purchased
        ))
    );
}