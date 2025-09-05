// Main game logic and state management
class Game {
    constructor() {
        this.state = this.createInitialState();
        this.lastUpdate = Date.now();
        this.updateInterval = null;
        this.eventSpawnTimer = 0;
        this.activeEvents = [];
        this.notifications = [];
        this.buyAmount = 1;
        this.useScientificNotation = false;
        this.reducedMotion = false;
        
        // Prestige tree data
        this.prestigeTree = this.createPrestigeTree();
        
        // Bind methods
        this.update = this.update.bind(this);
        this.save = Utils.debounce(this.save.bind(this), 1000);
    }
    
    createInitialState() {
        return {
            // Resources
            budget: 0,
            lifetimeTickets: 0,
            sessionTickets: 0,
            clout: 0,
            totalCloutEarned: 0,
            
            // Stats
            ticketsPerSec: 0,
            clickValue: 1,
            totalClicks: 0,
            manualTickets: 0,
            
            // Buildings - initialize with 0 count for each building
            buildings: BUILDINGS_DATA.reduce((acc, building) => {
                acc[building.id] = 0;
                return acc;
            }, {}),
            
            // Upgrades
            purchasedUpgrades: [],
            
            // Prestige
            prestigeCount: 0,
            prestigePoints: 0,
            
            // Game state
            gameStartTime: Date.now(),
            lastSaveTime: Date.now(),
            offlineTime: 0,
            
            // SLA and other metrics
            slaScore: 100,
            incidentsGenerated: 0,
            escalationTriggers: 0,
            rubberDuckResolves: 0,
            
            // Event tracking
            eventCounts: {},
            maxStackedEvents: 0,
            
            // Achievement tracking
            perfectSlaStart: null,
            timeToFirstPrestige: null
        };
    }
    
    createPrestigeTree() {
        return [
            {
                id: 'auto_clicker',
                name: '🖱️ Auto-Clicker',
                description: 'Automatically clicks 1 time per second',
                cost: 1,
                effect: 'auto_click',
                value: 1,
                purchased: false
            },
            {
                id: 'buff_extender',
                name: '⏰ Buff Extender',
                description: 'All timed events last 15 seconds longer',
                cost: 2,
                effect: 'event_duration',
                value: 15,
                purchased: false
            },
            {
                id: 'click_multiplier',
                name: '💪 Click Power',
                description: 'Each click is 50% more effective',
                cost: 3,
                effect: 'click_multiplier',
                value: 1.5,
                purchased: false
            },
            {
                id: 'global_boost_1',
                name: '🚀 Global Boost I',
                description: '+25% to all ticket resolution',
                cost: 2,
                effect: 'global_multiplier',
                value: 1.25,
                purchased: false
            },
            {
                id: 'global_boost_2',
                name: '🚀 Global Boost II',
                description: '+50% to all ticket resolution',
                cost: 5,
                effect: 'global_multiplier',
                value: 1.5,
                purchased: false,
                requires: ['global_boost_1']
            },
            {
                id: 'offline_booster',
                name: '🌙 Offline Booster',
                description: 'Offline progress cap increased to 48 hours',
                cost: 4,
                effect: 'offline_cap',
                value: 48,
                purchased: false
            },
            {
                id: 'building_discount',
                name: '💰 Bulk Discount',
                description: 'All buildings cost 10% less',
                cost: 3,
                effect: 'cost_reduction',
                value: 0.9,
                purchased: false
            },
            {
                id: 'event_frequency',
                name: '🎉 Event Magnet',
                description: 'Events spawn 25% more frequently',
                cost: 4,
                effect: 'event_frequency',
                value: 1.25,
                purchased: false
            },
            {
                id: 'achievement_boost',
                name: '🏆 Achievement Hunter',
                description: 'Achievement bonuses are 50% more effective',
                cost: 6,
                effect: 'achievement_multiplier',
                value: 1.5,
                purchased: false
            },
            {
                id: 'prestige_boost',
                name: '👑 Prestige Master',
                description: 'Gain 25% more Clout from reorganizations',
                cost: 8,
                effect: 'prestige_bonus',
                value: 1.25,
                purchased: false
            }
        ];
    }
    
    start() {
        this.load();
        this.calculateOfflineProgress();
        this.updateInterval = setInterval(this.update, 100); // 10 FPS
        this.eventSpawnTimer = this.getNextEventTime();
        console.log('Game started');
    }
    
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.save();
        console.log('Game stopped');
    }
    
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = now;
        
        // Update tickets per second calculation
        this.calculateTicketsPerSec();
        
        // Generate tickets from automation
        const ticketsGenerated = this.state.ticketsPerSec * deltaTime;
        this.addTickets(ticketsGenerated);
        
        // Update active events
        this.updateEvents(deltaTime);
        
        // Check for event spawning
        this.eventSpawnTimer -= deltaTime;
        if (this.eventSpawnTimer <= 0) {
            this.trySpawnEvent();
            this.eventSpawnTimer = this.getNextEventTime();
        }
        
        // Update SLA score
        this.updateSLA(deltaTime);
        
        // Check achievements
        this.checkAchievements();
        
        // Auto-save periodically
        if (now - this.state.lastSaveTime > 30000) { // Every 30 seconds
            this.save();
        }
    }
    
    calculateTicketsPerSec() {
        let rate = 0;
        
        // Base building rates
        for (const [buildingId, count] of Object.entries(this.state.buildings)) {
            if (count === 0) continue;
            
            const buildingData = getBuildingData(buildingId);
            if (!buildingData) continue;
            
            let buildingRate = buildingData.baseRate * count;
            
            // Apply building-specific multipliers from upgrades
            buildingRate *= this.getBuildingMultiplier(buildingId);
            
            // Apply event bonuses
            buildingRate *= this.getEventBuildingMultiplier(buildingId);
            
            rate += buildingRate;
        }
        
        // Apply global multipliers
        rate *= this.getGlobalMultiplier();
        
        // Apply prestige bonuses
        rate *= this.getPrestigeMultiplier();
        
        // Apply achievement bonuses
        rate *= (1 + calculateAchievementBonus());
        
        this.state.ticketsPerSec = rate;
    }
    
    getBuildingMultiplier(buildingId) {
        let multiplier = 1;
        
        // Check for building-specific upgrades
        for (const upgradeId of this.state.purchasedUpgrades) {
            const upgrade = getUpgradeData(upgradeId);
            if (!upgrade) continue;
            
            if (upgrade.effect === 'building_multiplier' && upgrade.target === buildingId) {
                multiplier *= upgrade.value;
            }
            
            // Knowledge base synergy
            if (upgrade.effect === 'kb_synergy' && upgrade.targets.includes(buildingId)) {
                const kbCount = this.state.buildings.knowledge_base || 0;
                const synergies = Math.floor(kbCount / upgrade.threshold);
                multiplier *= Math.pow(1 + upgrade.value, synergies);
            }
        }
        
        return multiplier;
    }
    
    getGlobalMultiplier() {
        let multiplier = 1;
        
        // Upgrades
        for (const upgradeId of this.state.purchasedUpgrades) {
            const upgrade = getUpgradeData(upgradeId);
            if (!upgrade) continue;
            
            if (upgrade.effect === 'global_multiplier') {
                multiplier *= upgrade.value;
            }
        }
        
        // Events
        multiplier *= this.getEventGlobalMultiplier();
        
        // Clout bonus
        multiplier *= (1 + this.state.clout * 0.01); // 1% per clout
        
        return multiplier;
    }
    
    getPrestigeMultiplier() {
        let multiplier = 1;
        
        for (const node of this.prestigeTree) {
            if (!node.purchased) continue;
            
            if (node.effect === 'global_multiplier') {
                multiplier *= node.value;
            }
        }
        
        return multiplier;
    }
    
    getEventGlobalMultiplier() {
        let multiplier = 1;
        
        for (const event of this.activeEvents) {
            if (event.effects.globalMultiplier) {
                multiplier *= event.effects.globalMultiplier;
            }
        }
        
        return multiplier;
    }
    
    getEventBuildingMultiplier(buildingId) {
        let multiplier = 1;
        
        for (const event of this.activeEvents) {
            if (event.effects.buildingBoosts && event.effects.buildingBoosts[buildingId]) {
                multiplier *= event.effects.buildingBoosts[buildingId];
            }
        }
        
        return multiplier;
    }
    
    getClickMultiplier() {
        let multiplier = 1;
        
        // Base click value modifiers
        const remoteTools = this.state.buildings.remote_tools || 0;
        multiplier *= (1 + remoteTools * 0.1); // 10% per remote tool
        
        // Upgrades
        for (const upgradeId of this.state.purchasedUpgrades) {
            const upgrade = getUpgradeData(upgradeId);
            if (!upgrade) continue;
            
            if (upgrade.effect === 'dual_boost') {
                multiplier *= upgrade.clickMultiplier;
            }
        }
        
        // Events
        for (const event of this.activeEvents) {
            if (event.effects.clickMultiplier) {
                multiplier *= event.effects.clickMultiplier;
            }
        }
        
        // Prestige bonuses
        for (const node of this.prestigeTree) {
            if (node.purchased && node.effect === 'click_multiplier') {
                multiplier *= node.value;
            }
        }
        
        return multiplier;
    }
    
    addTickets(amount) {
        this.state.sessionTickets += amount;
        this.state.lifetimeTickets += amount;
        this.state.budget += amount; // 1:1 ratio for now
    }
    
    click() {
        const clickValue = this.state.clickValue * this.getClickMultiplier();
        this.addTickets(clickValue);
        this.state.totalClicks++;
        this.state.manualTickets += clickValue;
        
        // Trigger click animations or effects
        this.triggerClickEffect();
        
        return clickValue;
    }
    
    triggerClickEffect() {
        // This will be handled by the UI layer
        if (window.ui) {
            window.ui.triggerClickEffect();
        }
    }
    
    buyBuilding(buildingId, amount = null) {
        const buildingData = getBuildingData(buildingId);
        if (!buildingData) return false;
        
        const currentCount = this.state.buildings[buildingId] || 0;
        const buyAmount = amount || this.buyAmount;
        
        let actualAmount = buyAmount;
        if (buyAmount === 'max') {
            actualAmount = Utils.calculateMaxBuyable(
                buildingData.baseCost,
                buildingData.costGrowth,
                currentCount,
                this.state.budget
            );
        }
        
        if (actualAmount === 0) return false;
        
        const cost = Utils.calculateBulkCost(
            buildingData.baseCost,
            buildingData.costGrowth,
            currentCount,
            actualAmount
        );
        
        // Apply cost reduction from prestige
        const finalCost = cost * this.getCostMultiplier();
        
        if (this.state.budget < finalCost) return false;
        
        this.state.budget -= finalCost;
        this.state.buildings[buildingId] = currentCount + actualAmount;
        
        Utils.createNotification(
            `Hired ${actualAmount} ${buildingData.name} for ${Utils.formatNumber(finalCost)}`,
            'success'
        );
        
        return true;
    }
    
    getCostMultiplier() {
        let multiplier = 1;
        
        for (const node of this.prestigeTree) {
            if (node.purchased && node.effect === 'cost_reduction') {
                multiplier *= node.value;
            }
        }
        
        return multiplier;
    }
    
    buyUpgrade(upgradeId) {
        const upgrade = getUpgradeData(upgradeId);
        if (!upgrade || upgrade.purchased) return false;
        
        if (this.state.budget < upgrade.cost) return false;
        
        // Check requirements
        if (upgrade.requires) {
            for (const required of upgrade.requires) {
                if (!this.state.purchasedUpgrades.includes(required)) {
                    return false;
                }
            }
        }
        
        this.state.budget -= upgrade.cost;
        this.state.purchasedUpgrades.push(upgradeId);
        upgrade.purchased = true;
        
        Utils.createNotification(
            `Purchased ${upgrade.name} for ${Utils.formatNumber(upgrade.cost)}`,
            'success'
        );
        
        return true;
    }
    
    canPrestige() {
        return this.state.lifetimeTickets >= 1000000; // 1 million tickets for first prestige
    }
    
    getPrestigeGain() {
        if (!this.canPrestige()) return 0;
        
        let baseGain = Math.floor(Math.sqrt(this.state.lifetimeTickets / 1000000));
        
        // Apply prestige bonus from upgrades
        for (const node of this.prestigeTree) {
            if (node.purchased && node.effect === 'prestige_bonus') {
                baseGain *= node.value;
            }
        }
        
        return baseGain;
    }
    
    prestige() {
        if (!this.canPrestige()) return false;
        
        const cloutGain = this.getPrestigeGain();
        
        // Record time to first prestige
        if (this.state.prestigeCount === 0) {
            this.state.timeToFirstPrestige = Date.now() - this.state.gameStartTime;
        }
        
        // Reset progress but keep prestige bonuses
        const preservedData = {
            clout: this.state.clout + cloutGain,
            totalCloutEarned: this.state.totalCloutEarned + cloutGain,
            prestigeCount: this.state.prestigeCount + 1,
            totalClicks: this.state.totalClicks,
            timeToFirstPrestige: this.state.timeToFirstPrestige
        };
        
        this.state = this.createInitialState();
        Object.assign(this.state, preservedData);
        
        // Reset upgrade purchased flags
        UPGRADES_DATA.forEach(upgrade => upgrade.purchased = false);
        
        this.save();
        
        Utils.createNotification(
            `Department reorganized! Gained ${cloutGain} Clout!`,
            'success',
            5000
        );
        
        return true;
    }
    
    buyPrestigeNode(nodeId) {
        const node = this.prestigeTree.find(n => n.id === nodeId);
        if (!node || node.purchased) return false;
        
        if (this.state.clout < node.cost) return false;
        
        // Check requirements
        if (node.requires) {
            for (const required of node.requires) {
                const requiredNode = this.prestigeTree.find(n => n.id === required);
                if (!requiredNode || !requiredNode.purchased) {
                    return false;
                }
            }
        }
        
        this.state.clout -= node.cost;
        node.purchased = true;
        
        Utils.createNotification(
            `Unlocked ${node.name} for ${node.cost} Clout`,
            'success'
        );
        
        return true;
    }
    
    updateEvents(deltaTime) {
        this.activeEvents = this.activeEvents.filter(event => {
            event.timeRemaining -= deltaTime;
            
            if (event.timeRemaining <= 0) {
                this.endEvent(event);
                return false;
            }
            
            return true;
        });
    }
    
    trySpawnEvent() {
        if (this.activeEvents.length >= 2) return; // Max 2 concurrent events
        
        const event = getRandomEvent();
        if (!event) return;
        
        this.startEvent(event);
    }
    
    startEvent(eventData) {
        const event = {
            ...eventData,
            timeRemaining: eventData.duration,
            startTime: Date.now(),
            stackLevel: 1
        };
        
        // Check for stacking
        const existingEvent = this.activeEvents.find(e => e.id === eventData.id);
        if (existingEvent && eventData.stackable) {
            existingEvent.stackLevel++;
            existingEvent.timeRemaining = Math.max(existingEvent.timeRemaining, eventData.duration);
            event.stackLevel = existingEvent.stackLevel;
        } else {
            this.activeEvents.push(event);
        }
        
        // Apply instant effects
        if (event.effects.instantReward) {
            const reward = this.state.ticketsPerSec * event.effects.rewardMultiplier;
            this.addTickets(reward);
            Utils.createNotification(
                `${event.name} granted ${Utils.formatNumber(reward)} tickets!`,
                'success'
            );
        }
        
        // Track event counts
        this.state.eventCounts[event.id] = (this.state.eventCounts[event.id] || 0) + 1;
        this.state.maxStackedEvents = Math.max(this.state.maxStackedEvents, this.activeEvents.length);
        
        Utils.createNotification(`${event.name} started!`, 'info');
    }
    
    endEvent(event) {
        Utils.createNotification(`${event.name} ended`, 'info');
    }
    
    getNextEventTime() {
        const baseInterval = EVENT_CONFIG.baseSpawnInterval;
        const variation = EVENT_CONFIG.spawnVariation;
        return Utils.random(baseInterval - variation, baseInterval + variation);
    }
    
    updateSLA(deltaTime) {
        // SLA slowly degrades over time but is boosted by resolution rate
        const degradation = deltaTime * 0.1; // 0.1% per second
        const boost = Math.min(this.state.ticketsPerSec * 0.01, 1); // Up to 1% per second
        
        this.state.slaScore = Utils.clamp(this.state.slaScore - degradation + boost, 0, 100);
        
        // Track perfect SLA time
        if (this.state.slaScore >= 100) {
            if (!this.state.perfectSlaStart) {
                this.state.perfectSlaStart = Date.now();
            }
        } else {
            this.state.perfectSlaStart = null;
        }
    }
    
    checkAchievements() {
        const newAchievements = checkAchievements(this.state);
        
        for (const achievement of newAchievements) {
            Utils.createNotification(
                `Achievement unlocked: ${achievement.name}!`,
                'success',
                4000
            );
        }
    }
    
    calculateOfflineProgress() {
        const now = Date.now();
        const offlineTime = (now - this.state.lastSaveTime) / 1000; // seconds
        
        if (offlineTime < 60) return; // Less than 1 minute, ignore
        
        const maxOfflineHours = this.getOfflineCap();
        const cappedOfflineTime = Math.min(offlineTime, maxOfflineHours * 3600);
        
        // Calculate offline efficiency (starts at 100%, drops to 25% after 4 hours)
        let efficiency = 1.0;
        if (cappedOfflineTime > 4 * 3600) {
            efficiency = 0.25;
        } else if (cappedOfflineTime > 1 * 3600) {
            efficiency = Utils.lerp(1.0, 0.25, (cappedOfflineTime - 3600) / (3 * 3600));
        }
        
        this.calculateTicketsPerSec();
        const offlineTickets = this.state.ticketsPerSec * cappedOfflineTime * efficiency;
        
        if (offlineTickets > 0) {
            this.addTickets(offlineTickets);
            
            Utils.createNotification(
                `Welcome back! You earned ${Utils.formatNumber(offlineTickets)} tickets while away`,
                'success',
                6000
            );
        }
        
        this.state.offlineTime = offlineTime;
    }
    
    getOfflineCap() {
        let cap = 24; // Base 24 hours
        
        for (const node of this.prestigeTree) {
            if (node.purchased && node.effect === 'offline_cap') {
                cap = node.value;
            }
        }
        
        return cap;
    }
    
    save() {
        this.state.lastSaveTime = Date.now();
        const success = Utils.saveToStorage('troopyclicker_save', {
            state: this.state,
            prestigeTree: this.prestigeTree,
            upgrades: UPGRADES_DATA.map(u => ({ id: u.id, purchased: u.purchased })),
            achievements: [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS].map(a => ({ id: a.id, unlocked: a.unlocked }))
        });
        
        if (success) {
            console.log('Game saved successfully');
        } else {
            Utils.createNotification('Failed to save game', 'error');
        }
    }
    
    load() {
        const saveData = Utils.loadFromStorage('troopyclicker_save');
        if (!saveData) {
            console.log('No save data found, starting new game');
            return;
        }
        
        try {
            // Load state
            this.state = { ...this.createInitialState(), ...saveData.state };
            
            // Load prestige tree
            if (saveData.prestigeTree) {
                for (const savedNode of saveData.prestigeTree) {
                    const node = this.prestigeTree.find(n => n.id === savedNode.id);
                    if (node) {
                        node.purchased = savedNode.purchased;
                    }
                }
            }
            
            // Load upgrades
            if (saveData.upgrades) {
                for (const savedUpgrade of saveData.upgrades) {
                    const upgrade = UPGRADES_DATA.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.purchased = savedUpgrade.purchased;
                        if (savedUpgrade.purchased) {
                            this.state.purchasedUpgrades.push(savedUpgrade.id);
                        }
                    }
                }
            }
            
            // Load achievements
            if (saveData.achievements) {
                for (const savedAchievement of saveData.achievements) {
                    const achievement = [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS].find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = savedAchievement.unlocked;
                    }
                }
            }
            
            console.log('Game loaded successfully');
        } catch (error) {
            console.error('Failed to load save data:', error);
            Utils.createNotification('Failed to load save data', 'error');
        }
    }
    
    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('troopyclicker_save');
            location.reload();
        }
    }
}

// Global game instance
window.game = new Game();