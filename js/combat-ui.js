/**
 * Starfisher - Combat UI Module
 * Provides UI components for displaying and interacting with Combats
 */

/**
 * Initialize the Combats list
 */
async function initCombatsList() {
    const combatsListElement = document.getElementById('combats-list');
    if (!combatsListElement) return;

    try {
        // Get all Combats from the database
        const combats = await window.db.getAll('combats');

        // Sort by creation date (newest first) and take the 5 most recent
        const recentCombats = combats
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 5);

        // Clear the list
        combatsListElement.innerHTML = '';

        if (recentCombats.length === 0) {
            // Show a message if there are no Combats
            combatsListElement.innerHTML = `<div class="empty-list">${window.i18n.t('no_combats')}</div>`;
            return;
        }

        // Add each Combat to the list
        recentCombats.forEach(combat => {
            const combatElement = createCombatListItem(combat);
            combatsListElement.appendChild(combatElement);
        });

        // Add click event listeners to show details
        addCombatClickListeners();
    } catch (error) {
        console.error('Error initializing Combats list:', error);
        combatsListElement.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

/**
 * Create a list item element for a Combat
 * @param {Object} combat - The Combat object
 * @returns {HTMLElement} The list item element
 */
function createCombatListItem(combat) {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.setAttribute('data-id', combat.id);

    // Create the main info section (scenario, scene)
    const infoSection = document.createElement('div');
    infoSection.className = 'list-item-info';

    // Scenario
    const scenarioSpan = document.createElement('span');
    scenarioSpan.className = 'combat-scenario';
    scenarioSpan.textContent = combat.scenario || 'Unknown';
    infoSection.appendChild(scenarioSpan);

    // Scene
    const sceneSpan = document.createElement('span');
    sceneSpan.className = 'combat-scene';
    sceneSpan.textContent = combat.scene || 'Unknown';
    infoSection.appendChild(sceneSpan);

    listItem.appendChild(infoSection);

    return listItem;
}

/**
 * Add click event listeners to Combat list items
 */
function addCombatClickListeners() {
    const combatItems = document.querySelectorAll('#combats-list .list-item');
    const detailsContainer = document.getElementById('combat-details');

    combatItems.forEach(item => {
        item.addEventListener('click', async () => {
            // Remove active class from all items
            combatItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Get the Combat ID
            const combatId = item.getAttribute('data-id');

            // Get the Combat from the database
            const combat = await window.db.get('combats', combatId);

            // Show the Combat details
            if (combat) {
                showCombatDetails(combat);
            }
        });
    });
}

/**
 * Show the details of a Combat
 * @param {Object} combat - The Combat object
 */
function showCombatDetails(combat) {
    const detailsContainer = document.getElementById('combat-details');
    if (!detailsContainer) return;

    // Create the details content
    let detailsHTML = `
        <div class="details-header">
            <h2>${combat.scenario || 'Unknown Combat'} - ${combat.scene || ''}</h2>
        </div>
        <div class="details-content">
            <div class="details-section">
                <h3>${window.i18n.t('combat_basic_info')}</h3>
                <p><strong>${window.i18n.t('combat_scenario')}:</strong> ${combat.scenario || 'Unknown'}</p>
                <p><strong>${window.i18n.t('combat_scene')}:</strong> ${combat.scene || 'Unknown'}</p>
            </div>
        </div>
    `;

    // Set the HTML and show the container
    detailsContainer.innerHTML = detailsHTML;
    detailsContainer.classList.add('visible');
}

// Export functions for use in other modules
window.combatUI = {
    initCombatsList
};
