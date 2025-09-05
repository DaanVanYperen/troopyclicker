// Utility functions for the game
class Utils {
    // Format large numbers with suffixes or scientific notation
    static formatNumber(num, useScientific = false) {
        if (num === 0 || num === undefined || num === null || isNaN(num)) return '0';
        
        if (useScientific && num >= 1e6) {
            return num.toExponential(2);
        }
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
        
        if (magnitude === 0) {
            return num.toFixed(num < 10 ? 2 : num < 100 ? 1 : 0);
        }
        
        if (magnitude >= suffixes.length) {
            return num.toExponential(2);
        }
        
        const scaled = num / Math.pow(1000, magnitude);
        const decimals = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;
        
        return scaled.toFixed(decimals) + suffixes[magnitude];
    }
    
    // Format time duration
    static formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }
    
    // Calculate percentage with color coding
    static formatPercentage(value, max = 100) {
        const percentage = Math.min(100, (value / max) * 100);
        return {
            value: percentage.toFixed(1) + '%',
            color: percentage >= 90 ? '#48bb78' : percentage >= 70 ? '#ed8936' : '#e53e3e'
        };
    }
    
    // Calculate cost of buying multiple buildings
    static calculateBulkCost(baseCost, growth, currentCount, buyAmount) {
        if (buyAmount === 1) {
            return baseCost * Math.pow(growth, currentCount);
        }
        
        let totalCost = 0;
        for (let i = 0; i < buyAmount; i++) {
            totalCost += baseCost * Math.pow(growth, currentCount + i);
        }
        return totalCost;
    }
    
    // Calculate how many buildings can be bought with given budget
    static calculateMaxBuyable(baseCost, growth, currentCount, budget) {
        let count = 0;
        let remainingBudget = budget;
        
        while (remainingBudget >= baseCost * Math.pow(growth, currentCount + count)) {
            remainingBudget -= baseCost * Math.pow(growth, currentCount + count);
            count++;
            
            // Prevent infinite loops for very large numbers
            if (count > 10000) break;
        }
        
        return count;
    }
    
    // Calculate return on investment
    static calculateROI(cost, rateIncrease, currentRate) {
        if (currentRate === 0) return Infinity;
        return cost / rateIncrease;
    }
    
    // Calculate payback time in seconds
    static calculatePaybackTime(cost, rateIncrease) {
        if (rateIncrease <= 0) return Infinity;
        return cost / rateIncrease;
    }
    
    // Generate a random value between min and max
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Clamp a value between min and max
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Linear interpolation
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Easing function for smooth animations
    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Deep clone an object
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    // Debounce function calls
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function calls
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Save data to localStorage with compression
    static saveToStorage(key, data) {
        try {
            const jsonString = JSON.stringify(data);
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }
    
    // Load data from localStorage
    static loadFromStorage(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            if (stored === null) return defaultValue;
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }
    
    // Create a notification element
    static createNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notifications');
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
        
        return notification;
    }
    
    // Generate a unique ID
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    // Check if an element is visible in the viewport
    static isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Smooth scroll to element
    static scrollToElement(element, duration = 500) {
        const start = window.pageYOffset;
        const target = element.offsetTop;
        const distance = target - start;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = Utils.easeOutCubic(progress);
            
            window.scrollTo(0, start + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    // Color interpolation
    static interpolateColor(color1, color2, factor) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(Utils.lerp(r1, r2, factor));
        const g = Math.round(Utils.lerp(g1, g2, factor));
        const b = Math.round(Utils.lerp(b1, b2, factor));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}