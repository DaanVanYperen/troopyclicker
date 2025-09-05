// Events data - defines temporary buffs and special occurrences
const EVENTS_DATA = [
    {
        id: 'coffee_rush',
        name: '☕ Coffee Rush',
        description: 'The team is extra caffeinated and clicking with purpose!',
        duration: 90, // seconds
        effects: {
            clickMultiplier: 5.0,
            buildingBoosts: {
                chatbot: 1.2
            }
        },
        probability: 0.15,
        minInterval: 300, // 5 minutes
        maxInterval: 600, // 10 minutes
        stackable: true,
        stackDecay: 0.7, // each stack is 70% as effective
        icon: '☕',
        color: '#8B4513'
    },
    {
        id: 'all_hands',
        name: '📢 All-Hands Meeting',
        description: 'Company-wide meeting boosts team coordination and productivity!',
        duration: 90,
        effects: {
            globalMultiplier: 3.0,
            buildingBoosts: {
                sre_shift: 1.5
            }
        },
        probability: 0.12,
        minInterval: 420, // 7 minutes
        maxInterval: 720, // 12 minutes
        stackable: true,
        stackDecay: 0.6,
        icon: '📢',
        color: '#4169E1'
    },
    {
        id: 'lucky_pager',
        name: '📟 Lucky Pager',
        description: 'A critical alert turned out to be a false positive!',
        duration: 0, // instant
        effects: {
            instantReward: true,
            rewardMultiplier: 3600 // 1 hour worth of current TR/s
        },
        probability: 0.08,
        minInterval: 240, // 4 minutes
        maxInterval: 480, // 8 minutes
        stackable: false,
        icon: '📟',
        color: '#32CD32'
    },
    {
        id: 'patch_tuesday',
        name: '🔄 Patch Tuesday',
        description: 'System updates create more tickets, but also provide tools to handle them!',
        duration: 120,
        effects: {
            globalMultiplier: 2.5,
            ticketInflowBoost: 1.8 // More tickets to resolve, but net positive
        },
        probability: 0.10,
        minInterval: 600, // 10 minutes
        maxInterval: 900, // 15 minutes
        stackable: true,
        stackDecay: 0.8,
        icon: '🔄',
        color: '#FF6347'
    },
    {
        id: 'power_outage',
        name: '⚡ Power Outage Recovery',
        description: 'Power is restored and systems come back online with a surge of tickets!',
        duration: 60,
        effects: {
            instantReward: true,
            rewardMultiplier: 1800, // 30 minutes worth
            globalMultiplier: 1.5
        },
        probability: 0.05,
        minInterval: 900, // 15 minutes
        maxInterval: 1800, // 30 minutes
        stackable: false,
        icon: '⚡',
        color: '#FFD700'
    },
    {
        id: 'friday_mood',
        name: '🎉 Friday Mood',
        description: 'It\'s Friday! Everyone is motivated to clear their queues before the weekend.',
        duration: 180, // 3 minutes
        effects: {
            globalMultiplier: 2.0,
            clickMultiplier: 3.0
        },
        probability: 0.20, // Higher chance
        minInterval: 180, // 3 minutes
        maxInterval: 360, // 6 minutes
        stackable: true,
        stackDecay: 0.9,
        icon: '🎉',
        color: '#FF69B4'
    },
    {
        id: 'intern_enthusiasm',
        name: '🌟 Intern Enthusiasm',
        description: 'New interns are eager to prove themselves!',
        duration: 75,
        effects: {
            buildingBoosts: {
                intern: 5.0,
                firstline: 1.5
            }
        },
        probability: 0.12,
        minInterval: 300,
        maxInterval: 600,
        stackable: true,
        stackDecay: 0.7,
        icon: '🌟',
        color: '#00CED1'
    },
    {
        id: 'security_drill',
        name: '🔒 Security Drill',
        description: 'Security awareness training generates password reset requests, but improves processes!',
        duration: 90,
        effects: {
            globalMultiplier: 1.8,
            buildingBoosts: {
                auto_triage: 2.0,
                monitoring: 1.5
            }
        },
        probability: 0.08,
        minInterval: 720, // 12 minutes
        maxInterval: 1200, // 20 minutes
        stackable: false,
        icon: '🔒',
        color: '#800080'
    }
];

// Event spawning configuration
const EVENT_CONFIG = {
    baseSpawnInterval: 420, // 7 minutes average
    spawnVariation: 180, // ±3 minutes
    maxConcurrentEvents: 2,
    diminishingReturns: 0.35, // 2nd event gives 35% less benefit
    eventChance: 0.7 // 70% chance to spawn an event when interval expires
};

// Helper functions
function getEventData(id) {
    return EVENTS_DATA.find(event => event.id === id);
}

function getRandomEvent() {
    const availableEvents = EVENTS_DATA.filter(event => Math.random() < event.probability);
    if (availableEvents.length === 0) return null;
    return availableEvents[Math.floor(Math.random() * availableEvents.length)];
}

function calculateEventEffect(event, stackLevel = 1) {
    const effects = { ...event.effects };
    
    if (event.stackable && stackLevel > 1) {
        const decay = Math.pow(event.stackDecay, stackLevel - 1);
        
        if (effects.globalMultiplier) {
            effects.globalMultiplier = 1 + (effects.globalMultiplier - 1) * decay;
        }
        if (effects.clickMultiplier) {
            effects.clickMultiplier = 1 + (effects.clickMultiplier - 1) * decay;
        }
        if (effects.rewardMultiplier) {
            effects.rewardMultiplier *= decay;
        }
        
        // Apply decay to building boosts
        if (effects.buildingBoosts) {
            for (const building in effects.buildingBoosts) {
                effects.buildingBoosts[building] = 1 + (effects.buildingBoosts[building] - 1) * decay;
            }
        }
    }
    
    return effects;
}