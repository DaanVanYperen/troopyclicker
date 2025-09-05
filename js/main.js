// Main initialization and startup
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎫 Troopyclicker - Ticket Triage Tycoon starting...');
    
    // Initialize the game
    game.start();
    ui.start();
    
    console.log('Game initialized successfully!');
    
    // Handle page visibility for performance
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Game will continue running but with reduced UI updates
            console.log('Game backgrounded');
        } else {
            // Force an immediate update when coming back
            console.log('Game foregrounded');
            ui.update();
        }
    });
    
    // Handle page unload for saving
    window.addEventListener('beforeunload', function() {
        game.save();
    });
    
    // Auto-save on blur as well
    window.addEventListener('blur', function() {
        game.save();
    });
    
    // Initialize tooltips and help text
    initializeTooltips();
    
    // Welcome message for new players
    if (game.state.lifetimeTickets === 0) {
        setTimeout(() => {
            Utils.createNotification(
                'Welcome to Troopyclicker! Click the ticket button to get started!',
                'info',
                5000
            );
        }, 1000);
    }
});

function initializeTooltips() {
    // Add helpful tooltips to key UI elements
    const tooltips = [
        {
            selector: '#main-click-btn',
            text: 'Click to resolve tickets manually! Press Space or Enter to click.'
        },
        {
            selector: '[data-tab="buildings"]',
            text: 'Hire staff and deploy tools to automate ticket resolution (Hotkey: B)'
        },
        {
            selector: '[data-tab="upgrades"]',
            text: 'Purchase upgrades to multiply your efficiency (Hotkey: U)'
        },
        {
            selector: '[data-tab="prestige"]',
            text: 'Reorganize your department for permanent bonuses (Hotkey: P)'
        },
        {
            selector: '[data-tab="achievements"]',
            text: 'Track your progress and earn small bonuses (Hotkey: A)'
        },
        {
            selector: '.buy-amount[data-amount="1"]',
            text: 'Buy 1 building at a time (Hotkey: 1)'
        },
        {
            selector: '.buy-amount[data-amount="10"]',
            text: 'Buy 10 buildings at a time (Hotkey: 2)'
        },
        {
            selector: '.buy-amount[data-amount="100"]',
            text: 'Buy 100 buildings at a time (Hotkey: 3)'
        },
        {
            selector: '.buy-amount[data-amount="max"]',
            text: 'Buy as many as you can afford (Hotkey: 4)'
        }
    ];
    
    tooltips.forEach(tooltip => {
        const element = document.querySelector(tooltip.selector);
        if (element) {
            element.title = tooltip.text;
        }
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Game error:', e.error);
    
    // Try to save the game state before potential crash
    try {
        game.save();
        Utils.createNotification('An error occurred, but your progress has been saved', 'error');
    } catch (saveError) {
        console.error('Failed to save after error:', saveError);
        Utils.createNotification('A critical error occurred. Please refresh the page.', 'error');
    }
});

// Performance monitoring
let frameCount = 0;
let lastFpsTime = Date.now();

function checkPerformance() {
    frameCount++;
    const now = Date.now();
    
    if (now - lastFpsTime >= 5000) { // Check every 5 seconds
        const fps = frameCount / 5;
        frameCount = 0;
        lastFpsTime = now;
        
        if (fps < 8) { // Below 8 FPS
            console.warn('Low performance detected, consider enabling reduced motion');
            
            if (!game.reducedMotion) {
                Utils.createNotification(
                    'Performance seems low. Consider enabling "Reduced motion" in settings.',
                    'info',
                    5000
                );
            }
        }
    }
    
    requestAnimationFrame(checkPerformance);
}

// Start performance monitoring
requestAnimationFrame(checkPerformance);

// Development helpers (only available in console)
if (typeof window !== 'undefined') {
    window.debugGame = {
        addBudget: (amount) => {
            game.state.budget += amount;
            Utils.createNotification(`Added ${Utils.formatNumber(amount)} budget`, 'success');
        },
        addTickets: (amount) => {
            game.addTickets(amount);
            Utils.createNotification(`Added ${Utils.formatNumber(amount)} tickets`, 'success');
        },
        addClout: (amount) => {
            game.state.clout += amount;
            Utils.createNotification(`Added ${amount} clout`, 'success');
        },
        triggerEvent: (eventId) => {
            const eventData = getEventData(eventId);
            if (eventData) {
                game.startEvent(eventData);
                Utils.createNotification(`Triggered ${eventData.name}`, 'success');
            } else {
                console.error('Event not found:', eventId);
            }
        },
        unlockAllBuildings: () => {
            game.state.lifetimeTickets = 999999999;
            Utils.createNotification('All buildings unlocked', 'success');
        },
        skipTime: (hours) => {
            const seconds = hours * 3600;
            game.state.lastSaveTime -= seconds * 1000;
            game.calculateOfflineProgress();
            Utils.createNotification(`Simulated ${hours} hours offline`, 'success');
        },
        resetGame: () => {
            if (confirm('Reset all progress?')) {
                game.reset();
            }
        }
    };
    
    console.log('Debug commands available:');
    console.log('debugGame.addBudget(amount) - Add budget');
    console.log('debugGame.addTickets(amount) - Add tickets');
    console.log('debugGame.addClout(amount) - Add clout');
    console.log('debugGame.triggerEvent(eventId) - Trigger specific event');
    console.log('debugGame.unlockAllBuildings() - Unlock all buildings');
    console.log('debugGame.skipTime(hours) - Simulate offline time');
    console.log('debugGame.resetGame() - Reset all progress');
}