/**
 * Starfisher - Main Application Logic
 * Handles navigation, UI interactions, and application state
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initNavigation();
});

/**
 * Initialize navigation functionality
 */
function initNavigation() {
    // Get all navigation links and page elements
    const navLinks = document.querySelectorAll('.nav-links a, .btn[data-page]');
    const pages = document.querySelectorAll('.page');
    
    // Add click event listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target page from the data-page attribute
            const targetPageId = link.getAttribute('data-page');
            
            // Update active navigation link
            document.querySelectorAll('.nav-links a').forEach(navLink => {
                navLink.classList.remove('active');
                if (navLink.getAttribute('data-page') === targetPageId) {
                    navLink.classList.add('active');
                }
            });
            
            // Hide all pages and show the target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPageId) {
                    page.classList.add('active');
                }
            });
        });
    });
}

/**
 * Display a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-notification';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    notification.appendChild(closeBtn);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export functions for use in other modules
window.app = {
    showNotification
};
