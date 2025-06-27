/**
 * Starfisher - List UI Module
 * Provides UI components for displaying and interacting with lists of NPCs and Combats
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the lists when the database is ready
    if (window.db) {
        window.db.init().then(() => {
            initNpcsList();
            initCombatsList();
        });
    }
});

/**
 * Initialize the NPCs list
 */
async function initNpcsList() {
    const npcsListElement = document.getElementById('npcs-list');
    if (!npcsListElement) return;

    try {
        // Get all NPCs from the database
        const npcs = await window.db.getAll('npcs');
        
        // Sort by creation date (newest first) and take the 5 most recent
        const recentNpcs = npcs
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 5);
        
        // Clear the list
        npcsListElement.innerHTML = '';
        
        if (recentNpcs.length === 0) {
            // Show a message if there are no NPCs
            npcsListElement.innerHTML = `<div class="empty-list">${window.i18n.t('no_npcs')}</div>`;
            return;
        }
        
        // Add each NPC to the list
        recentNpcs.forEach(npc => {
            const npcElement = createNpcListItem(npc);
            npcsListElement.appendChild(npcElement);
        });
        
        // Add click event listeners to show details
        addNpcClickListeners();
    } catch (error) {
        console.error('Error initializing NPCs list:', error);
        npcsListElement.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

/**
 * Create a list item element for an NPC
 * @param {Object} npc - The NPC object
 * @returns {HTMLElement} The list item element
 */
function createNpcListItem(npc) {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.setAttribute('data-id', npc.id);
    
    // Create the main info section (name, class, FP)
    const infoSection = document.createElement('div');
    infoSection.className = 'list-item-info';
    
    // Name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'npc-name';
    nameSpan.textContent = npc.name || 'Unknown';
    infoSection.appendChild(nameSpan);
    
    // Class
    const classSpan = document.createElement('span');
    classSpan.className = 'npc-class';
    classSpan.textContent = npc.class || 'Unknown';
    infoSection.appendChild(classSpan);
    
    // FP (Challenge Rating)
    const fpSpan = document.createElement('span');
    fpSpan.className = 'npc-fp';
    fpSpan.textContent = npc.fp || 'Unknown';
    infoSection.appendChild(fpSpan);
    
    listItem.appendChild(infoSection);
    
    return listItem;
}

/**
 * Add click event listeners to NPC list items
 */
function addNpcClickListeners() {
    const npcItems = document.querySelectorAll('#npcs-list .list-item');
    const detailsContainer = document.getElementById('npc-details');
    
    npcItems.forEach(item => {
        item.addEventListener('click', async () => {
            // Remove active class from all items
            npcItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get the NPC ID
            const npcId = item.getAttribute('data-id');
            
            // Get the NPC from the database
            const npc = await window.db.get('npcs', npcId);
            
            // Show the NPC details
            if (npc) {
                showNpcDetails(npc);
            }
        });
    });
}

/**
 * Show the details of an NPC
 * @param {Object} npc - The NPC object
 */
function showNpcDetails(npc) {
    const detailsContainer = document.getElementById('npc-details');
    if (!detailsContainer) return;
    
    // Create the details content
    let detailsHTML = `
        <div class="details-header">
            <h2>${npc.name || 'Unknown NPC'}</h2>
        </div>
        <div class="details-content">
            <div class="details-section">
                <h3>${window.i18n.t('npc_basic_info')}</h3>
                <p><strong>${window.i18n.t('npc_class')}:</strong> ${npc.class || 'Unknown'}</p>
                <p><strong>${window.i18n.t('npc_fp')}:</strong> ${npc.fp || 'Unknown'}</p>
            </div>
        </div>
    `;
    
    // Set the HTML and show the container
    detailsContainer.innerHTML = detailsHTML;
    detailsContainer.classList.add('visible');
}

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

// Add functions to the home page to show recent NPCs and Combats
document.addEventListener('DOMContentLoaded', () => {
    // Add NPCs and Combats lists to the home page
    initHomePageLists();
});

/**
 * Initialize the lists on the home page
 */
async function initHomePageLists() {
    // Add event listener to update lists when the page is shown
    const navLinks = document.querySelectorAll('.nav-links a, .btn[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetPageId = link.getAttribute('data-page');
            if (targetPageId === 'home') {
                // Update the lists when the home page is shown
                initNpcsList();
                initCombatsList();
            } else if (targetPageId === 'npcs') {
                // Update the NPCs list when the NPCs page is shown
                initNpcsList();
            } else if (targetPageId === 'combats') {
                // Update the Combats list when the Combats page is shown
                initCombatsList();
            }
        });
    });
}
