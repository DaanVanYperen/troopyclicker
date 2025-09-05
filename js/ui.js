// UI management and updates
class UI {
    constructor() {
        this.currentTab = 'buildings';
        this.updateInterval = null;
        this.clickEffectTimeouts = [];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Main click button
        const clickBtn = document.getElementById('main-click-btn');
        clickBtn.addEventListener('click', () => this.handleMainClick());
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Buy amount controls
        document.querySelectorAll('.buy-amount').forEach(btn => {
            btn.addEventListener('click', (e) => this.setBuyAmount(e.target.dataset.amount));
        });
        
        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('scientific-notation').addEventListener('change', (e) => {
            game.useScientificNotation = e.target.checked;
        });
        document.getElementById('reduced-motion').addEventListener('change', (e) => {
            game.reducedMotion = e.target.checked;
            document.body.classList.toggle('reduced-motion', e.target.checked);
        });
        
        // Save/Load/Reset buttons
        document.getElementById('save-btn').addEventListener('click', () => {
            game.save();
            Utils.createNotification('Game saved!', 'success');
        });
        document.getElementById('load-btn').addEventListener('click', () => {
            game.load();
            Utils.createNotification('Game loaded!', 'success');
        });
        document.getElementById('reset-btn').addEventListener('click', () => game.reset());
        
        // Prestige button
        document.getElementById('prestige-btn').addEventListener('click', () => this.handlePrestige());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Click outside settings to close
        document.addEventListener('click', (e) => {
            const settingsMenu = document.getElementById('settings-menu');
            const settingsBtn = document.getElementById('settings-btn');
            if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsMenu.classList.add('hidden');
            }
        });
    }
    
    start() {
        this.updateInterval = setInterval(() => this.update(), 100); // 10 FPS UI updates
        this.update(); // Initial update
    }
    
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    update() {
        this.updateHeader();
        this.updateClickButton();
        this.updateActiveEvents();
        this.updateSLA();
        this.updateCurrentTab();
    }
    
    updateHeader() {
        const state = game.state;
        
        document.getElementById('tickets-per-sec').textContent = 
            Utils.formatNumber(state.ticketsPerSec, game.useScientificNotation);
        document.getElementById('budget').textContent = 
            Utils.formatNumber(state.budget, game.useScientificNotation);
        document.getElementById('lifetime-tickets').textContent = 
            Utils.formatNumber(state.lifetimeTickets, game.useScientificNotation);
        document.getElementById('clout').textContent = 
            Utils.formatNumber(state.clout, game.useScientificNotation);
    }
    
    updateClickButton() {
        const clickValue = game.state.clickValue * game.getClickMultiplier();
        document.getElementById('click-value').textContent = 
            Utils.formatNumber(clickValue, game.useScientificNotation);
    }
    
    updateActiveEvents() {
        const container = document.getElementById('active-events');
        container.innerHTML = '';
        
        if (game.activeEvents.length === 0) {
            container.innerHTML = '<div style="color: #666; text-align: center; padding: 2rem;">No active events</div>';
            return;
        }
        
        game.activeEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-item';
            eventEl.style.background = `linear-gradient(90deg, ${event.color}dd, ${event.color}88)`;
            
            eventEl.innerHTML = `
                <span>${event.icon} ${event.name}</span>
                <span>${Utils.formatTime(event.timeRemaining)}</span>
            `;
            
            if (event.stackLevel > 1) {
                eventEl.innerHTML = `
                    <span>${event.icon} ${event.name} (×${event.stackLevel})</span>
                    <span>${Utils.formatTime(event.timeRemaining)}</span>
                `;
            }
            
            container.appendChild(eventEl);
        });
    }
    
    updateSLA() {
        const slaScore = game.state.slaScore;
        const slaFill = document.getElementById('sla-fill');
        const slaScoreEl = document.getElementById('sla-score');
        
        slaFill.style.width = `${slaScore}%`;
        slaScoreEl.textContent = `${slaScore.toFixed(1)}%`;
        
        // Color coding
        if (slaScore >= 90) {
            slaFill.style.background = 'linear-gradient(90deg, #48bb78, #38a169)';
        } else if (slaScore >= 70) {
            slaFill.style.background = 'linear-gradient(90deg, #ed8936, #dd6b20)';
        } else {
            slaFill.style.background = 'linear-gradient(90deg, #e53e3e, #c53030)';
        }
    }
    
    updateCurrentTab() {
        switch (this.currentTab) {
            case 'buildings':
                this.updateBuildingsTab();
                break;
            case 'upgrades':
                this.updateUpgradesTab();
                break;
            case 'prestige':
                this.updatePrestigeTab();
                break;
            case 'achievements':
                this.updateAchievementsTab();
                break;
        }
    }
    
    updateBuildingsTab() {
        const container = document.getElementById('buildings-list');
        container.innerHTML = '';
        
        BUILDINGS_DATA.forEach(building => {
            if (game.state.lifetimeTickets < building.unlockAt) return;
            
            const count = game.state.buildings[building.id] || 0;
            const cost = Utils.calculateBulkCost(
                building.baseCost,
                building.costGrowth,
                count,
                game.buyAmount === 'max' ? 1 : game.buyAmount
            ) * game.getCostMultiplier();
            
            const canAfford = game.state.budget >= cost;
            // Show rate per building, not total rate (which would be 0 if count is 0)
            const rate = building.baseRate * game.getBuildingMultiplier(building.id);
            
            const buildingEl = document.createElement('div');
            buildingEl.className = `building-item ${canAfford ? 'affordable' : ''}`;
            buildingEl.onclick = () => this.buyBuilding(building.id);
            
            // Calculate ROI and payback time
            const nextRate = building.baseRate * game.getBuildingMultiplier(building.id);
            const roi = Utils.calculateROI(cost, nextRate, game.state.ticketsPerSec);
            const payback = Utils.calculatePaybackTime(cost, nextRate);
            
            buildingEl.innerHTML = `
                <div class="building-header">
                    <div class="building-name">${building.icon} ${building.name}</div>
                    <div class="building-count">${count}</div>
                </div>
                <div class="building-description">${building.description}</div>
                <div class="building-stats">
                    <div class="building-stat">
                        <span class="building-stat-label">Cost:</span>
                        <span class="building-stat-value">${Utils.formatNumber(cost, game.useScientificNotation)}</span>
                    </div>
                    <div class="building-stat">
                        <span class="building-stat-label">Rate:</span>
                        <span class="building-stat-value">${Utils.formatNumber(rate, game.useScientificNotation)}/s <span style="font-size: 0.8em; opacity: 0.7;">(tickets per second per unit)</span></span>
                    </div>
                    <div class="building-stat">
                        <span class="building-stat-label">Payback:</span>
                        <span class="building-stat-value">${payback === Infinity ? '∞' : Utils.formatTime(payback)} <span style="font-size: 0.8em; opacity: 0.7;">(time to break even)</span></span>
                    </div>
                </div>
            `;
            
            container.appendChild(buildingEl);
        });
    }
    
    updateUpgradesTab() {
        const container = document.getElementById('upgrades-list');
        container.innerHTML = '';
        
        const availableUpgrades = getAvailableUpgrades(game.state.lifetimeTickets);
        
        availableUpgrades.forEach(upgrade => {
            const canAfford = game.state.budget >= upgrade.cost;
            const purchased = upgrade.purchased;
            
            const upgradeEl = document.createElement('div');
            upgradeEl.className = `upgrade-item ${canAfford && !purchased ? 'affordable' : ''} ${purchased ? 'purchased' : ''}`;
            
            if (!purchased) {
                upgradeEl.onclick = () => this.buyUpgrade(upgrade.id);
            }
            
            upgradeEl.innerHTML = `
                <div class="upgrade-name">${upgrade.name} ${purchased ? '✓' : ''}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-cost">${purchased ? 'PURCHASED' : 'Cost: ' + Utils.formatNumber(upgrade.cost, game.useScientificNotation)}</div>
            `;
            
            container.appendChild(upgradeEl);
        });
        
        if (availableUpgrades.length === 0) {
            container.innerHTML = '<div style="color: #666; text-align: center; padding: 2rem;">No upgrades available</div>';
        }
    }
    
    updatePrestigeTab() {
        // Update prestige info
        const canPrestige = game.canPrestige();
        const cloutGain = game.getPrestigeGain();
        const cloutBonus = game.state.clout;
        
        document.getElementById('clout-gain').textContent = Utils.formatNumber(cloutGain);
        document.getElementById('clout-bonus').textContent = Utils.formatNumber(cloutBonus);
        
        const prestigeBtn = document.getElementById('prestige-btn');
        prestigeBtn.disabled = !canPrestige;
        
        // Update prestige tree
        const container = document.getElementById('prestige-tree');
        container.innerHTML = '';
        
        game.prestigeTree.forEach(node => {
            const canAfford = game.state.clout >= node.cost;
            const purchased = node.purchased;
            const meetsRequirements = !node.requires || node.requires.every(req => 
                game.prestigeTree.find(n => n.id === req)?.purchased
            );
            
            const nodeEl = document.createElement('div');
            nodeEl.className = `prestige-node ${canAfford && meetsRequirements && !purchased ? 'unlocked' : ''} ${purchased ? 'purchased' : ''}`;
            
            if (!purchased && canAfford && meetsRequirements) {
                nodeEl.onclick = () => this.buyPrestigeNode(node.id);
            }
            
            nodeEl.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${node.name.split(' ')[0]}</div>
                <div style="font-weight: 700; margin-bottom: 0.5rem;">${node.name.substring(2)}</div>
                <div style="font-size: 0.9rem; margin-bottom: 1rem; opacity: 0.8;">${node.description}</div>
                <div style="font-weight: 600; color: ${purchased ? '#4fd1c7' : '#e53e3e'};">
                    ${purchased ? 'PURCHASED' : `${node.cost} Clout`}
                </div>
            `;
            
            container.appendChild(nodeEl);
        });
    }
    
    updateAchievementsTab() {
        const container = document.getElementById('achievements-list');
        container.innerHTML = '';
        
        const allAchievements = [...ACHIEVEMENTS_DATA, ...PRESTIGE_ACHIEVEMENTS];
        
        allAchievements.forEach(achievement => {
            const unlocked = achievement.unlocked;
            
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
            
            // Calculate progress
            let progress = 0;
            let target = achievement.target;
            
            switch (achievement.type) {
                case 'lifetime_tickets':
                    progress = game.state.lifetimeTickets;
                    break;
                case 'clicks':
                    progress = game.state.totalClicks;
                    break;
                case 'building_count':
                    progress = game.state.buildings[achievement.building] || 0;
                    break;
                // Add more cases as needed
            }
            
            const progressPercent = target > 0 ? Math.min(100, (progress / target) * 100) : 100;
            
            achievementEl.innerHTML = `
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    ${unlocked ? 'COMPLETED' : `${Utils.formatNumber(progress)} / ${Utils.formatNumber(target)} (${progressPercent.toFixed(1)}%)`}
                </div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">
                    Bonus: +${(achievement.bonus * 100).toFixed(1)}% global rate
                </div>
            `;
            
            container.appendChild(achievementEl);
        });
    }
    
    handleMainClick() {
        const ticketsEarned = game.click();
        this.triggerClickEffect(ticketsEarned);
    }
    
    triggerClickEffect(value) {
        if (game.reducedMotion) return;
        
        const button = document.getElementById('main-click-btn');
        
        // Add click animation class
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 200);
        
        // Show floating text
        const floatingText = document.createElement('div');
        floatingText.textContent = `+${Utils.formatNumber(value)}`;
        floatingText.style.cssText = `
            position: absolute;
            color: #48bb78;
            font-weight: 700;
            font-size: 1.2rem;
            pointer-events: none;
            z-index: 1000;
            animation: floatUp 1s ease-out forwards;
        `;
        
        // Position randomly around the button
        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + Utils.random(-50, 50);
        const y = rect.top + rect.height / 2;
        
        floatingText.style.left = x + 'px';
        floatingText.style.top = y + 'px';
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1000);
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
        
        this.currentTab = tabName;
    }
    
    setBuyAmount(amount) {
        // Update button states
        document.querySelectorAll('.buy-amount').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.amount === amount);
        });
        
        game.buyAmount = amount === 'max' ? 'max' : parseInt(amount);
    }
    
    buyBuilding(buildingId) {
        if (game.buyBuilding(buildingId)) {
            Utils.playSound('purchase');
        }
    }
    
    buyUpgrade(upgradeId) {
        if (game.buyUpgrade(upgradeId)) {
            Utils.playSound('upgrade');
        }
    }
    
    buyPrestigeNode(nodeId) {
        if (game.buyPrestigeNode(nodeId)) {
            Utils.playSound('upgrade');
        }
    }
    
    handlePrestige() {
        if (game.canPrestige()) {
            const cloutGain = game.getPrestigeGain();
            const message = `Are you sure you want to reorganize your department?\n\nYou will gain ${cloutGain} Clout but lose all current progress.\nClout provides permanent bonuses and unlocks.`;
            
            if (confirm(message)) {
                game.prestige();
            }
        }
    }
    
    toggleSettings() {
        const menu = document.getElementById('settings-menu');
        menu.classList.toggle('hidden');
    }
    
    handleKeyboard(e) {
        // Space or Enter for clicking
        if ((e.code === 'Space' || e.code === 'Enter') && !e.target.matches('input, button, select')) {
            e.preventDefault();
            this.handleMainClick();
        }
        
        // Number keys for buy amounts
        if (e.code === 'Digit1') {
            this.setBuyAmount('1');
        } else if (e.code === 'Digit2') {
            this.setBuyAmount('10');
        } else if (e.code === 'Digit3') {
            this.setBuyAmount('100');
        } else if (e.code === 'Digit4') {
            this.setBuyAmount('max');
        }
        
        // Tab switching
        if (e.code === 'KeyB') {
            this.switchTab('buildings');
        } else if (e.code === 'KeyU') {
            this.switchTab('upgrades');
        } else if (e.code === 'KeyP') {
            this.switchTab('prestige');
        } else if (e.code === 'KeyA') {
            this.switchTab('achievements');
        }
    }
}

// Add CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px);
        }
    }
    
    .main-click-button.clicked {
        transform: scale(0.95);
    }
    
    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);

// Global UI instance
window.ui = new UI();