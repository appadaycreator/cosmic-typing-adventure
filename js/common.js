// Common JavaScript for Cosmic Typing Adventure

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeCommonFeatures();
});

// Initialize common features
function initializeCommonFeatures() {
    initializeNavigation();
    initializeAnimations();
    initializeFormValidation();
    initializeAccessibility();
    initializePerformanceOptimizations();
}

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle (if needed)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation utilities
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.card, .feature-card, .planet-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add hover effects
    addHoverEffects();
}

// Add hover effects to interactive elements
function addHoverEffects() {
    const interactiveElements = document.querySelectorAll('.btn, .nav-link, .planet-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showMessage('フォームにエラーがあります。確認してください。', 'error');
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    // Clear previous errors
    clearFieldError(field);
    
    // Check if required field is empty
    if (required && !value) {
        showFieldError(field, 'この項目は必須です。');
        return false;
    }
    
    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, '有効なメールアドレスを入力してください。');
            return false;
        }
    }
    
    // URL validation
    if (type === 'url' && value) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
            showFieldError(field, '有効なURLを入力してください。');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc3545';
}

// Clear field error
function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '';
}

// Validate entire form
function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Accessibility features
function initializeAccessibility() {
    // Skip to main content link
    addSkipLink();
    
    // Keyboard navigation
    initializeKeyboardNavigation();
    
    // Focus management
    initializeFocusManagement();
    
    // ARIA labels and roles
    enhanceARIA();
}

// Add skip link for accessibility
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'メインコンテンツにスキップ';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #667eea;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
    `;
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not exists
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main-content';
    }
}

// Keyboard navigation
function initializeKeyboardNavigation() {
    // Handle keyboard navigation for custom elements
    const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]');
    
    focusableElements.forEach(element => {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Focus management
function initializeFocusManagement() {
    // Trap focus in modals (if any)
    const modals = document.querySelectorAll('[role="dialog"]');
    
    modals.forEach(modal => {
        const focusableElements = modal.querySelectorAll('button, a, input, textarea, select');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    });
}

// Enhance ARIA attributes
function enhanceARIA() {
    // Add ARIA labels to buttons without text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            const icon = button.querySelector('i, img');
            if (icon) {
                const alt = icon.getAttribute('alt') || icon.className;
                button.setAttribute('aria-label', alt);
            }
        }
    });
    
    // Add ARIA live regions for dynamic content
    const liveRegions = document.querySelectorAll('.message, .results');
    liveRegions.forEach(region => {
        region.setAttribute('aria-live', 'polite');
    });
}

// Performance optimizations
function initializePerformanceOptimizations() {
    // Lazy loading for images
    initializeLazyLoading();
    
    // Debounce scroll events
    debounceScrollEvents();
    
    // Optimize animations
    optimizeAnimations();
}

// Lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Debounce scroll events
function debounceScrollEvents() {
    let ticking = false;
    
    function updateOnScroll() {
        // Handle scroll-based updates here
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
}

// Optimize animations
function optimizeAnimations() {
    // Use transform and opacity for better performance
    const animatedElements = document.querySelectorAll('.card, .btn, .planet-card');
    
    animatedElements.forEach(element => {
        element.style.willChange = 'transform';
    });
}

// Utility functions
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 300px;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Debounce function
function debounce(func, wait) {
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

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Local storage utilities
const Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
        }
    }
};

// Export utilities for use in other modules
window.CosmicUtils = {
    showMessage,
    debounce,
    throttle,
    Storage
}; 