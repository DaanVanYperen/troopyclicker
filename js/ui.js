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
        
        // Event delegation for dynamically created building/upgrade/prestige elements
        this.setupEventDelegation();
        
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
    
    setupEventDelegation() {
        // Use event delegation for buildings
        document.getElementById('buildings-list').addEventListener('click', (e) => {
            const buildingEl = e.target.closest('.building-item');
            if (buildingEl && buildingEl.classList.contains('affordable')) {
                e.preventDefault();
                e.stopPropagation();
                const buildingId = buildingEl.dataset.buildingId;
                this.buyBuilding(buildingId, e);
            }
        });
        
        // Use event delegation for upgrades
        document.getElementById('upgrades-list').addEventListener('click', (e) => {
            const upgradeEl = e.target.closest('.upgrade-item');
            if (upgradeEl && upgradeEl.classList.contains('affordable')) {
                e.preventDefault();
                e.stopPropagation();
                const upgradeId = upgradeEl.dataset.upgradeId;
                this.buyUpgrade(upgradeId, e);
            }
        });
        
        // Use event delegation for prestige nodes
        document.getElementById('prestige-tree').addEventListener('click', (e) => {
            const nodeEl = e.target.closest('.prestige-node');
            if (nodeEl && nodeEl.classList.contains('unlocked')) {
                e.preventDefault();
                e.stopPropagation();
                const nodeId = nodeEl.dataset.nodeId;
                this.buyPrestigeNode(nodeId, e);
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
        
        // Get current buildings that should be visible
        const visibleBuildings = BUILDINGS_DATA.filter(building => 
            game.state.lifetimeTickets >= building.unlockAt
        );
        
        // Remove buildings that are no longer visible
        const existingElements = container.querySelectorAll('.building-item');
        existingElements.forEach(el => {
            const buildingId = el.dataset.buildingId;
            if (!visibleBuildings.find(b => b.id === buildingId)) {
                el.remove();
            }
        });
        
        visibleBuildings.forEach(building => {
            const count = game.state.buildings[building.id] || 0;
            const cost = Utils.calculateBulkCost(
                building.baseCost,
                building.costGrowth,
                count,
                game.buyAmount === 'max' ? 1 : game.buyAmount
            ) * game.getCostMultiplier();
            
            const canAfford = game.state.budget >= cost;
            const rate = building.baseRate * game.getBuildingMultiplier(building.id);
            const nextRate = building.baseRate * game.getBuildingMultiplier(building.id);
            const roi = Utils.calculateROI(cost, nextRate, game.state.ticketsPerSec);
            const payback = Utils.calculatePaybackTime(cost, nextRate);
            
            // Find existing element or create new one
            let buildingEl = container.querySelector(`[data-building-id="${building.id}"]`);
            
            if (!buildingEl) {
                // Create new element only if it doesn't exist
                buildingEl = document.createElement('div');
                buildingEl.className = 'building-item';
                buildingEl.dataset.buildingId = building.id;
                
                buildingEl.innerHTML = `
                    <div class="building-header">
                        <div class="building-name">${building.icon} ${building.name}</div>
                        <div class="building-count">0</div>
                    </div>
                    <div class="building-description">${building.description}</div>
                    <div class="building-stats">
                        <div class="building-stat">
                            <span class="building-stat-label">Cost:</span>
                            <span class="building-stat-value cost-value"></span>
                        </div>
                        <div class="building-stat">
                            <span class="building-stat-label">Rate:</span>
                            <span class="building-stat-value rate-value"></span>
                        </div>
                        <div class="building-stat">
                            <span class="building-stat-label">Payback:</span>
                            <span class="building-stat-value payback-value"></span>
                        </div>
                    </div>
                `;
                
                container.appendChild(buildingEl);
            }
            
            // Update only the dynamic content
            const countEl = buildingEl.querySelector('.building-count');
            const costEl = buildingEl.querySelector('.cost-value');
            const rateEl = buildingEl.querySelector('.rate-value');
            const paybackEl = buildingEl.querySelector('.payback-value');
            
            // Update affordability class
            buildingEl.className = `building-item ${canAfford ? 'affordable' : 'disabled'}`;
            
            // Update dynamic text content only if changed
            if (countEl.textContent !== count.toString()) {
                countEl.textContent = count;
            }
            
            const costText = Utils.formatNumber(cost, game.useScientificNotation);
            if (costEl.textContent !== costText) {
                costEl.textContent = costText;
            }
            
            const rateText = `${Utils.formatNumber(rate, game.useScientificNotation)}/s `;
            const rateWithLabel = rateText + '<span style="font-size: 0.8em; opacity: 0.7;">(tickets per second per unit)</span>';
            if (rateEl.innerHTML !== rateWithLabel) {
                rateEl.innerHTML = rateWithLabel;
            }
            
            const paybackText = payback === Infinity ? '∞' : Utils.formatTime(payback);
            const paybackWithLabel = paybackText + ' <span style="font-size: 0.8em; opacity: 0.7;">(time to break even)</span>';
            if (paybackEl.innerHTML !== paybackWithLabel) {
                paybackEl.innerHTML = paybackWithLabel;
            }
        });
    }
    
    updateUpgradesTab() {
        const container = document.getElementById('upgrades-list');
        const availableUpgrades = getAvailableUpgrades(game.state.lifetimeTickets);
        
        // Remove upgrades that are no longer available
        const existingElements = container.querySelectorAll('.upgrade-item');
        existingElements.forEach(el => {
            const upgradeId = el.dataset.upgradeId;
            if (!availableUpgrades.find(u => u.id === upgradeId)) {
                el.remove();
            }
        });
        
        if (availableUpgrades.length === 0) {
            if (!container.querySelector('.no-upgrades-message')) {
                container.innerHTML = '<div class="no-upgrades-message" style="color: #666; text-align: center; padding: 2rem;">No upgrades available</div>';
            }
            return;
        } else {
            // Remove "no upgrades" message if upgrades are available
            const noUpgradesMsg = container.querySelector('.no-upgrades-message');
            if (noUpgradesMsg) {
                noUpgradesMsg.remove();
            }
        }
        
        availableUpgrades.forEach(upgrade => {
            const canAfford = game.state.budget >= upgrade.cost;
            const purchased = upgrade.purchased;
            
            // Find existing element or create new one
            let upgradeEl = container.querySelector(`[data-upgrade-id="${upgrade.id}"]`);
            
            if (!upgradeEl) {
                // Create new element only if it doesn't exist
                upgradeEl = document.createElement('div');
                upgradeEl.className = 'upgrade-item';
                upgradeEl.dataset.upgradeId = upgrade.id;
                
                upgradeEl.innerHTML = `
                    <div class="upgrade-name-container">
                        <span class="upgrade-name-text">${upgrade.name}</span>
                        <span class="upgrade-checkmark"></span>
                    </div>
                    <div class="upgrade-description">${upgrade.description}</div>
                    <div class="upgrade-cost-container">
                        <span class="upgrade-cost-text"></span>
                    </div>
                `;
                
                container.appendChild(upgradeEl);
            }
            
            // Update affordability and purchased status classes
            upgradeEl.className = `upgrade-item ${canAfford && !purchased ? 'affordable' : ''} ${purchased ? 'purchased' : ''}`;
            
            // Update dynamic content only if changed
            const checkmarkEl = upgradeEl.querySelector('.upgrade-checkmark');
            const costTextEl = upgradeEl.querySelector('.upgrade-cost-text');
            
            const checkmarkText = purchased ? '✓' : '';
            if (checkmarkEl.textContent !== checkmarkText) {
                checkmarkEl.textContent = checkmarkText;
            }
            
            const costText = purchased ? 'PURCHASED' : 'Cost: ' + Utils.formatNumber(upgrade.cost, game.useScientificNotation);
            if (costTextEl.textContent !== costText) {
                costTextEl.textContent = costText;
            }
        });
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
        
        // Remove nodes that no longer exist (unlikely but safe)
        const existingElements = container.querySelectorAll('.prestige-node');
        existingElements.forEach(el => {
            const nodeId = el.dataset.nodeId;
            if (!game.prestigeTree.find(n => n.id === nodeId)) {
                el.remove();
            }
        });
        
        game.prestigeTree.forEach(node => {
            const canAfford = game.state.clout >= node.cost;
            const purchased = node.purchased;
            const meetsRequirements = !node.requires || node.requires.every(req => 
                game.prestigeTree.find(n => n.id === req)?.purchased
            );
            
            // Find existing element or create new one
            let nodeEl = container.querySelector(`[data-node-id="${node.id}"]`);
            
            if (!nodeEl) {
                // Create new element only if it doesn't exist
                nodeEl = document.createElement('div');
                nodeEl.className = 'prestige-node';
                nodeEl.dataset.nodeId = node.id;
                
                nodeEl.innerHTML = `
                    <div class="node-icon" style="font-size: 2rem; margin-bottom: 0.5rem;">${node.name.split(' ')[0]}</div>
                    <div class="node-name" style="font-weight: 700; margin-bottom: 0.5rem;">${node.name.substring(2)}</div>
                    <div class="node-description" style="font-size: 0.9rem; margin-bottom: 1rem; opacity: 0.8;">${node.description}</div>
                    <div class="node-cost" style="font-weight: 600;"></div>
                `;
                
                container.appendChild(nodeEl);
            }
            
            // Update class for states
            nodeEl.className = `prestige-node ${canAfford && meetsRequirements && !purchased ? 'unlocked' : ''} ${purchased ? 'purchased' : ''}`;
            
            // Update cost text and color
            const costEl = nodeEl.querySelector('.node-cost');
            const costText = purchased ? 'PURCHASED' : `${node.cost} Clout`;
            const costColor = purchased ? '#4fd1c7' : '#e53e3e';
            
            if (costEl.textContent !== costText) {
                costEl.textContent = costText;
            }
            if (costEl.style.color !== costColor) {
                costEl.style.color = costColor;
            }
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
    
    // These methods are replaced by enhanced versions below with proper event handling
    
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
    
    // Create material ripple effect
    createRipple(element, event) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    // Animate count badge when building count changes
    animateCountBadge(countElement) {
        countElement.classList.add('updated');
        setTimeout(() => {
            countElement.classList.remove('updated');
        }, 500);
    }
    
    // Enhanced building purchase with effects
    buyBuilding(buildingId, event) {
        const oldCount = game.state.buildings[buildingId] || 0;
        const success = game.buyBuilding(buildingId);
        
        if (success && event) {
            // Find the building element (might be the target or a parent)
            const buildingElement = event.target.closest('.building-item');
            
            if (buildingElement) {
                // Create ripple effect
                this.createRipple(buildingElement, event);
                
                // Play purchase sound
                Utils.playSound('purchase');
                
                // Find and animate the count badge
                const countElement = buildingElement.querySelector('.building-count');
                if (countElement) {
                    this.animateCountBadge(countElement);
                }
            }
        }
        
        return success;
    }
    
    // Enhanced upgrade purchase with effects
    buyUpgrade(upgradeId, event) {
        const success = game.buyUpgrade(upgradeId);
        
        if (success && event) {
            // Find the upgrade element (might be the target or a parent)
            const upgradeElement = event.target.closest('.upgrade-item');
            
            if (upgradeElement) {
                // Create ripple effect
                this.createRipple(upgradeElement, event);
                
                // Play purchase sound
                Utils.playSound('upgrade');
            }
        }
        
        return success;
    }
    
    // Enhanced prestige node purchase with effects
    buyPrestigeNode(nodeId, event) {
        const success = game.buyPrestigeNode(nodeId);
        
        if (success && event) {
            // Find the prestige node element (might be the target or a parent)
            const nodeElement = event.target.closest('.prestige-node');
            
            if (nodeElement) {
                // Create ripple effect
                this.createRipple(nodeElement, event);
                
                // Play purchase sound
                Utils.playSound('upgrade');
            }
        }
        
        return success;
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