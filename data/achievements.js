// Achievements data - defines goals and milestones with tiny passive bonuses
const ACHIEVEMENTS_DATA = [
    // Quantity achievements - closing tickets
    {
        id: 'first_ticket',
        name: '🎫 First Resolution',
        description: 'Resolve your first ticket',
        target: 1,
        type: 'lifetime_tickets',
        bonus: 0.001, // +0.1% global
        unlocked: false,
        category: 'quantity'
    },
    {
        id: 'inbox_zero_1',
        name: '📭 Inbox Zero I',
        description: 'Resolve 100 tickets',
        target: 100,
        type: 'lifetime_tickets',
        bonus: 0.002,
        unlocked: false,
        category: 'quantity'
    },
    {
        id: 'inbox_zero_2',
        name: '📭 Inbox Zero II',
        description: 'Resolve 1,000 tickets',
        target: 1000,
        type: 'lifetime_tickets',
        bonus: 0.003,
        unlocked: false,
        category: 'quantity'
    },
    {
        id: 'inbox_zero_3',
        name: '📭 Inbox Zero III',
        description: 'Resolve 10,000 tickets',
        target: 10000,
        type: 'lifetime_tickets',
        bonus: 0.005,
        unlocked: false,
        category: 'quantity'
    },
    {
        id: 'inbox_zero_4',
        name: '📭 Inbox Zero IV',
        description: 'Resolve 100,000 tickets',
        target: 100000,
        type: 'lifetime_tickets',
        bonus: 0.008,
        unlocked: false,
        category: 'quantity'
    },
    {
        id: 'inbox_zero_5',
        name: '📭 Inbox Zero V',
        description: 'Resolve 1,000,000 tickets',
        target: 1000000,
        type: 'lifetime_tickets',
        bonus: 0.010,
        unlocked: false,
        category: 'quantity'
    },

    // Speed achievements
    {
        id: 'quick_reorg',
        name: '⚡ First Reorg < 2h',
        description: 'Complete your first reorganization in under 2 hours',
        target: 7200, // 2 hours in seconds
        type: 'time_to_prestige',
        bonus: 0.005,
        unlocked: false,
        category: 'speed'
    },
    {
        id: 'speed_demon',
        name: '🏃 Speed Demon',
        description: 'Reach 100 tickets/sec',
        target: 100,
        type: 'tickets_per_sec',
        bonus: 0.003,
        unlocked: false,
        category: 'speed'
    },
    {
        id: 'click_master',
        name: '👆 Click Master',
        description: 'Click 1,000 times',
        target: 1000,
        type: 'clicks',
        bonus: 0.002,
        unlocked: false,
        category: 'speed'
    },

    // Building achievements
    {
        id: 'hiring_spree',
        name: '👥 Hiring Spree',
        description: 'Employ 50 staff members',
        target: 50,
        type: 'staff_count',
        bonus: 0.004,
        unlocked: false,
        category: 'building'
    },
    {
        id: 'automation_king',
        name: '🤖 Automation King',
        description: 'Own 25 automation buildings',
        target: 25,
        type: 'automation_count',
        bonus: 0.006,
        unlocked: false,
        category: 'building'
    },
    {
        id: 'intern_army',
        name: '🧑‍💼 Intern Army',
        description: 'Hire 100 interns',
        target: 100,
        type: 'building_count',
        building: 'intern',
        bonus: 0.003,
        unlocked: false,
        category: 'building'
    },
    {
        id: 'knowledge_hoarder',
        name: '📚 Knowledge Hoarder',
        description: 'Build 50 Knowledge Bases',
        target: 50,
        type: 'building_count',
        building: 'knowledge_base',
        bonus: 0.004,
        unlocked: false,
        category: 'building'
    },

    // Mastery achievements
    {
        id: 'no_escalation',
        name: '🚫 No Escalation!',
        description: 'Resolve 10,000 tickets without owning any 2nd-Line Engineers',
        target: 10000,
        type: 'tickets_without_building',
        building: 'engineer',
        bonus: 0.008,
        unlocked: false,
        category: 'mastery'
    },
    {
        id: 'pure_automation',
        name: '🔄 Pure Automation',
        description: 'Reach 1,000 tickets/sec with only automation buildings',
        target: 1000,
        type: 'automation_only_rate',
        bonus: 0.010,
        unlocked: false,
        category: 'mastery'
    },
    {
        id: 'manual_labor',
        name: '💪 Manual Labor',
        description: 'Click to resolve 50,000 tickets personally',
        target: 50000,
        type: 'manual_tickets',
        bonus: 0.005,
        unlocked: false,
        category: 'mastery'
    },

    // Event achievements
    {
        id: 'triple_shot',
        name: '🎯 Triple Shot',
        description: 'Stack 3 buffs simultaneously',
        target: 3,
        type: 'max_stacked_events',
        bonus: 0.004,
        unlocked: false,
        category: 'event'
    },
    {
        id: 'coffee_addict',
        name: '☕ Coffee Addict',
        description: 'Experience 25 Coffee Rush events',
        target: 25,
        type: 'event_count',
        event: 'coffee_rush',
        bonus: 0.003,
        unlocked: false,
        category: 'event'
    },
    {
        id: 'meeting_veteran',
        name: '👔 Meeting Veteran',
        description: 'Attend 15 All-Hands meetings',
        target: 15,
        type: 'event_count',
        event: 'all_hands',
        bonus: 0.003,
        unlocked: false,
        category: 'event'
    },

    // Upgrade achievements
    {
        id: 'big_spender',
        name: '💰 Big Spender',
        description: 'Purchase 20 upgrades',
        target: 20,
        type: 'upgrades_purchased',
        bonus: 0.005,
        unlocked: false,
        category: 'upgrade'
    },
    {
        id: 'synergy_master',
        name: '🔗 Synergy Master',
        description: 'Purchase all synergy upgrades',
        target: -1, // Special: count all synergy upgrades
        type: 'synergy_complete',
        bonus: 0.012,
        unlocked: false,
        category: 'upgrade'
    },

    // Prestige achievements
    {
        id: 'first_reorg',
        name: '👑 First Reorganization',
        description: 'Complete your first department reorganization',
        target: 1,
        type: 'prestige_count',
        bonus: 0.005,
        unlocked: false,
        category: 'prestige'
    },
    {
        id: 'clout_collector',
        name: '⭐ Clout Collector',
        description: 'Accumulate 1,000 total Clout',
        target: 1000,
        type: 'total_clout',
        bonus: 0.008,
        unlocked: false,
        category: 'prestige'
    },
    {
        id: 'reorganization_expert',
        name: '🏆 Reorganization Expert',
        description: 'Complete 10 reorganizations',
        target: 10,
        type: 'prestige_count',
        bonus: 0.015,
        unlocked: false,
        category: 'prestige'
    },

    // Quirky achievements
    {
        id: 'rubber_duck_mvp',
        name: '🦆 Rubber Duck MVP',
        description: 'Let rubber duck debugging resolve 1,000 tickets',
        target: 1000,
        type: 'rubber_duck_resolves',
        bonus: 0.003,
        unlocked: false,
        category: 'quirky'
    },
    {
        id: 'escalation_artist',
        name: '⬆️ Escalation Artist',
        description: 'Trigger "Escalate to De-escalate" 100 times',
        target: 100,
        type: 'escalation_triggers',
        bonus: 0.004,
        unlocked: false,
        category: 'quirky'
    },
    {
        id: 'sla_perfectionist',
        name: '📊 SLA Perfectionist',
        description: 'Maintain 100% SLA for 1 hour',
        target: 3600,
        type: 'perfect_sla_duration',
        bonus: 0.006,
        unlocked: false,
        category: 'quirky'
    },
    {
        id: 'incident_magnet',
        name: '🚨 Incident Magnet',
        description: 'Generate 500 incidents from monitoring systems',
        target: 500,
        type: 'incidents_generated',
        bonus: 0.004,
        unlocked: false,
        category: 'quirky'
    },

    // Budget achievements
    {
        id: 'budget_conscious',
        name: '💵 Budget Conscious',
        description: 'Accumulate 1,000,000 budget',
        target: 1000000,
        type: 'total_budget_earned',
        bonus: 0.005,
        unlocked: false,
        category: 'budget'
    },
    {
        id: 'millionaire',
        name: '💎 Millionaire',
        description: 'Have 10,000,000 budget at once',
        target: 10000000,
        type: 'max_budget',
        bonus: 0.008,
        unlocked: false,
        category: 'budget'
    }
];

// Prestige achievements that unlock after first reorganization
const PRESTIGE_ACHIEVEMENTS = [
    {
        id: 'veteran_manager',
        name: '🎖️ Veteran Manager',
        description: 'Reach 1 million tickets/sec after reorganization',
        target: 1000000,
        type: 'post_prestige_rate',
        bonus: 0.020,
        unlocked: false,
        category: 'prestige',
        requiresPrestige: true
    },
    {
        id: 'efficiency_expert',
        name: '📈 Efficiency Expert',
        description: 'Complete second reorganization in under 30 minutes',
        target: 1800,
        type: 'prestige_speed_improvement',
        bonus: 0.015,
        unlocked: false,
        category: 'prestige',
        requiresPrestige: true
    }
];

// Helper functions
function getAchievementData(id) {
    return [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS].find(achievement => achievement.id === id);
}

function getAchievementsByCategory(category) {
    return [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS].filter(achievement => achievement.category === category);
}

function calculateAchievementBonus() {
    return [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS]
        .filter(achievement => achievement.unlocked)
        .reduce((total, achievement) => total + achievement.bonus, 0);
}

function checkAchievements(gameState) {
    const newUnlocks = [];
    
    [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS].forEach(achievement => {
        if (achievement.unlocked || (achievement.requiresPrestige && gameState.prestigeCount === 0)) {
            return;
        }
        
        let progress = 0;
        let target = achievement.target;
        
        switch (achievement.type) {
            case 'lifetime_tickets':
                progress = gameState.lifetimeTickets;
                break;
            case 'tickets_per_sec':
                progress = gameState.ticketsPerSec;
                break;
            case 'clicks':
                progress = gameState.totalClicks;
                break;
            case 'staff_count':
                progress = Object.values(gameState.buildings)
                    .filter((_, index) => getBuildingData(Object.keys(gameState.buildings)[index])?.category === 'staff')
                    .reduce((sum, count) => sum + count, 0);
                break;
            case 'automation_count':
                progress = Object.values(gameState.buildings)
                    .filter((_, index) => getBuildingData(Object.keys(gameState.buildings)[index])?.category === 'automation')
                    .reduce((sum, count) => sum + count, 0);
                break;
            case 'building_count':
                progress = gameState.buildings[achievement.building] || 0;
                break;
            case 'upgrades_purchased':
                progress = gameState.purchasedUpgrades.length;
                break;
            case 'prestige_count':
                progress = gameState.prestigeCount;
                break;
            case 'total_clout':
                progress = gameState.totalCloutEarned;
                break;
            // Add more achievement types as needed
        }
        
        if (progress >= target) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
        }
    });
    
    return newUnlocks;
}