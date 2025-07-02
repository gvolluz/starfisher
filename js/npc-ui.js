/**
 * Starfisher - NPC UI Module
 * Provides UI components for displaying and interacting with NPCs
 */

// Global variables
let allAbilities = [];
let selectedAbilities = [];

/**
 * Fetch all abilities from the database
 * @returns {Promise<Array>} A promise that resolves with an array of abilities
 */
async function fetchAbilities() {
    try {
        // Get all abilities from the database
        const abilities = await window.db.getAll('abilities');
        // Sort abilities by name
        abilities.sort((a, b) => a.name.localeCompare(b.name));
        allAbilities = abilities;
        return abilities;
    } catch (error) {
        console.error('Error fetching abilities:', error);
        return [];
    }
}

/**
 * Create the abilities multiselect UI
 * @param {Array} selectedAbilityIds - Array of selected ability IDs
 * @param {boolean} readonly - Whether the UI should be readonly
 * @returns {HTMLElement} The abilities multiselect container
 */
function createAbilitiesMultiselect(selectedAbilityIds = [], readonly = true) {
    // Create the container
    const container = document.createElement('div');
    container.className = 'abilities-multiselect';
    container.id = 'abilities-multiselect';

    // Apply inline styles to the container
    container.style.width = '100%';
    container.style.border = '2px solid #4a90e2';
    container.style.borderRadius = '4px';
    container.style.padding = '8px';
    container.style.minHeight = '40px';
    container.style.backgroundColor = '#fff';
    container.style.position = 'relative';
    container.style.marginTop = '5px';
    container.style.marginBottom = '5px';

    // Create the selected abilities list
    const selectedList = document.createElement('div');
    selectedList.className = 'selected-abilities';

    // Apply inline styles to the selected abilities list
    selectedList.style.display = 'flex';
    selectedList.style.flexWrap = 'wrap';
    selectedList.style.gap = '10px';
    selectedList.style.justifyContent = 'flex-start';
    selectedList.style.backgroundColor = '#f0f8ff';
    selectedList.style.padding = '10px';
    selectedList.style.borderRadius = '4px';

    // Reset the global selectedAbilities array
    selectedAbilities = [];

    // Add selected abilities to the list
    if (selectedAbilityIds && selectedAbilityIds.length > 0) {
        selectedAbilityIds.forEach(abilityId => {
            const ability = allAbilities.find(a => String(a._id) === String(abilityId));
            if (ability) {
                selectedAbilities.push(ability);
            }
        });

        // Sort selected abilities by name
        selectedAbilities.sort((a, b) => a.name.localeCompare(b.name));

        // Create elements for each ability
        selectedAbilities.forEach(ability => {
            const abilityElement = createAbilityElement(ability, readonly);
            selectedList.appendChild(abilityElement);
        });
    } else {
        // If there are no abilities, add a placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'ability-placeholder';
        placeholder.textContent = '-';

        // Apply inline styles to the placeholder
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = '#999';
        placeholder.style.padding = '4px 8px';
        placeholder.style.width = '100%';
        placeholder.style.fontStyle = 'italic';
        placeholder.style.fontSize = '14px';

        selectedList.appendChild(placeholder);
    }

    container.appendChild(selectedList);

    return container;
}

/**
 * Create an element for a selected ability
 * @param {Object} ability - The ability object
 * @param {boolean} readonly - Whether the UI should be readonly
 * @returns {HTMLElement} The ability element
 */
function createAbilityElement(ability, readonly = true) {
    const element = document.createElement('div');
    element.className = 'ability-item';
    element.setAttribute('data-id', ability._id);

    // Apply inline styles to the ability item
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.backgroundColor = '#4a90e2';
    element.style.color = 'white';
    element.style.borderRadius = '6px';
    element.style.padding = '6px 10px';
    element.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    element.style.width = 'fit-content';
    element.style.border = '2px solid #2a70c2';
    element.style.margin = '2px';

    // Create the ability name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'ability-name';
    nameSpan.textContent = ability.name;
    nameSpan.style.marginRight = '8px';
    nameSpan.style.fontWeight = '500';
    nameSpan.style.color = 'white';
    element.appendChild(nameSpan);

    // Create the info button
    const infoButton = document.createElement('button');
    infoButton.className = 'btn btn-small info-ability-btn';
    infoButton.textContent = '❓';
    infoButton.title = 'Voir les détails';

    // Apply inline styles to the info button
    infoButton.style.width = '20px';
    infoButton.style.height = '20px';
    infoButton.style.padding = '0';
    infoButton.style.marginLeft = '6px';
    infoButton.style.fontSize = '10px';
    infoButton.style.lineHeight = '1';
    infoButton.style.borderRadius = '50%';
    infoButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    infoButton.style.color = 'white';
    infoButton.style.border = 'none';
    infoButton.style.display = 'flex';
    infoButton.style.alignItems = 'center';
    infoButton.style.justifyContent = 'center';

    infoButton.addEventListener('click', () => window.npcUI.showAbilityDetails(ability));
    element.appendChild(infoButton);

    // Create the remove button (only in edit mode)
    if (!readonly) {
        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-small remove-ability-btn';
        removeButton.textContent = '✖';
        removeButton.title = 'Retirer';

        // Apply inline styles to the remove button
        removeButton.style.width = '20px';
        removeButton.style.height = '20px';
        removeButton.style.padding = '0';
        removeButton.style.marginLeft = '6px';
        removeButton.style.fontSize = '10px';
        removeButton.style.lineHeight = '1';
        removeButton.style.borderRadius = '50%';
        removeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        removeButton.style.color = 'white';
        removeButton.style.border = 'none';
        removeButton.style.display = 'flex';
        removeButton.style.alignItems = 'center';
        removeButton.style.justifyContent = 'center';

        removeButton.addEventListener('click', () => removeAbility(ability._id));
        element.appendChild(removeButton);
    }

    return element;
}

/**
 * Show the ability selector popup
 */
function showAbilitySelector() {
    // Check if a popup already exists and remove it
    const existingPopup = document.querySelector('.ability-selector-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'ability-selector-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '1000';

    // Create the popup content
    const content = document.createElement('div');
    content.className = 'ability-selector-content';
    content.style.backgroundColor = '#fff';
    content.style.borderRadius = '8px';
    content.style.width = '80%';
    content.style.maxWidth = '80%';
    content.style.maxHeight = '80%';
    content.style.overflow = 'auto';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    content.style.marginTop = '60px'; /* Position below the details-header */

    // Create the header
    const header = document.createElement('div');
    header.className = 'ability-selector-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '12px 16px';
    header.style.borderBottom = '1px solid #eee';

    const title = document.createElement('h3');
    title.textContent = 'Sélectionner une capacité';
    title.style.margin = '0';
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.className = 'btn btn-small close-popup-btn';
    closeButton.textContent = '✖';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.padding = '0';
    closeButton.style.fontSize = '12px';
    closeButton.style.lineHeight = '1';
    closeButton.addEventListener('click', () => popup.remove());
    header.appendChild(closeButton);

    content.appendChild(header);

    // Create the abilities list
    const abilitiesList = document.createElement('div');
    abilitiesList.className = 'abilities-list';
    abilitiesList.style.padding = '16px';
    abilitiesList.style.maxHeight = '400px';
    abilitiesList.style.overflowY = 'auto';

    // Add each ability to the list
    allAbilities.forEach(ability => {
        // Skip if already selected
        if (selectedAbilities.some(a => String(a._id) === String(ability._id))) {
            return;
        }

        const abilityItem = document.createElement('div');
        abilityItem.className = 'ability-selector-item';
        abilityItem.style.display = 'flex';
        abilityItem.style.justifyContent = 'space-between';
        abilityItem.style.alignItems = 'center';
        abilityItem.style.padding = '8px 12px';
        abilityItem.style.borderBottom = '1px solid #eee';
        abilityItem.style.cursor = 'pointer';
        abilityItem.setAttribute('data-id', ability._id);

        // Add hover effect
        abilityItem.addEventListener('mouseover', () => {
            abilityItem.style.backgroundColor = '#f5f5f5';
        });
        abilityItem.addEventListener('mouseout', () => {
            abilityItem.style.backgroundColor = '';
        });

        const nameSpan = document.createElement('span');
        nameSpan.className = 'ability-selector-name';
        nameSpan.textContent = `${ability.name} (${ability.type})`;
        abilityItem.appendChild(nameSpan);

        const infoButton = document.createElement('button');
        infoButton.className = 'btn btn-small info-ability-btn';
        infoButton.textContent = '❓';
        infoButton.title = 'Voir les détails';
        infoButton.addEventListener('click', (e) => {
            e.stopPropagation();
            window.npcUI.showAbilityDetails(ability);
        });
        abilityItem.appendChild(infoButton);

        // Add click event to select the ability
        abilityItem.addEventListener('click', () => {
            addAbility(ability);
            popup.remove();
        });

        abilitiesList.appendChild(abilityItem);
    });

    content.appendChild(abilitiesList);
    popup.appendChild(content);

    // Find the details-header element to position the popup relative to it
    const detailsHeader = document.querySelector('.details-header');
    if (detailsHeader) {
        // Insert the popup after the details-header
        detailsHeader.parentNode.insertBefore(popup, detailsHeader.nextSibling);
    } else {
        // Fallback: Add the popup to the main container
        const mainContainer = document.getElementById('app-container');
        if (mainContainer) {
            mainContainer.appendChild(popup);
        } else {
            // Last resort: Add to body
            document.body.appendChild(popup);
        }
    }

    // Add event listener to close the popup when clicking outside of it
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

/**
 * Show the ability details popup
 * @param {Object} ability - The ability object
 */
function showAbilityDetails(ability) {
    // Check if a popup already exists and remove it
    const existingPopup = document.querySelector('.ability-details-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'ability-details-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '2000';

    // Create the popup content
    const content = document.createElement('div');
    content.className = 'ability-details-content';
    content.style.backgroundColor = '#fff';
    content.style.borderRadius = '8px';
    content.style.width = '80%';
    content.style.maxWidth = '80%';
    content.style.maxHeight = '80%';
    content.style.overflow = 'auto';
    content.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    content.style.marginTop = '60px'; /* Position below the details-header */

    // Create the header
    const header = document.createElement('div');
    header.className = 'ability-details-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '12px 16px';
    header.style.borderBottom = '1px solid #eee';

    const title = document.createElement('h3');
    title.textContent = `${ability.name} (${ability.type})`;
    title.style.margin = '0';
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.className = 'btn btn-small close-popup-btn';
    closeButton.textContent = '✖';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.padding = '0';
    closeButton.style.fontSize = '12px';
    closeButton.style.lineHeight = '1';
    closeButton.addEventListener('click', () => popup.remove());
    header.appendChild(closeButton);

    content.appendChild(header);

    // Create the ability details
    const details = document.createElement('div');
    details.className = 'ability-details';
    details.style.padding = '16px';
    details.style.lineHeight = '1.5';
    details.textContent = ability.text;
    content.appendChild(details);

    popup.appendChild(content);

    // Find the details-header element to position the popup relative to it
    const detailsHeader = document.querySelector('.details-header');
    if (detailsHeader) {
        // Insert the popup after the details-header
        detailsHeader.parentNode.insertBefore(popup, detailsHeader.nextSibling);
    } else {
        // Fallback: Add the popup to the main container
        const mainContainer = document.getElementById('app-container');
        if (mainContainer) {
            mainContainer.appendChild(popup);
        } else {
            // Last resort: Add to body
            document.body.appendChild(popup);
        }
    }

    // Add event listener to close the popup when clicking outside of it
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}

/**
 * Add an ability to the selected abilities
 * @param {Object} ability - The ability object
 */
function addAbility(ability) {
    // Add to the global selectedAbilities array
    selectedAbilities.push(ability);

    // Sort selected abilities by name
    selectedAbilities.sort((a, b) => a.name.localeCompare(b.name));

    // Rebuild the UI with sorted abilities
    const selectedList = document.querySelector('.selected-abilities');
    if (selectedList) {
        // Clear the current list
        selectedList.innerHTML = '';

        // Add all abilities in sorted order
        selectedAbilities.forEach(ability => {
            const abilityElement = createAbilityElement(ability, false);
            selectedList.appendChild(abilityElement);
        });
    }
}

/**
 * Remove an ability from the selected abilities
 * @param {string} abilityId - The ID of the ability to remove
 */
function removeAbility(abilityId) {
    // Remove from the global selectedAbilities array
    selectedAbilities = selectedAbilities.filter(a => String(a._id) !== String(abilityId));

    // Remove from the UI
    const abilityElement = document.querySelector(`.ability-item[data-id="${abilityId}"]`);
    if (abilityElement) {
        abilityElement.remove();
    }
}

/**
 * Add CSS styles for the abilities UI
 */
function addAbilitiesStyles() {
    // Check if styles already exist
    if (document.getElementById('abilities-styles')) {
        return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = 'abilities-styles';
    style.textContent = `
        /* Abilities Multiselect */
        .abilities-multiselect {
            width: 100% !important;
            border: 2px solid #4a90e2 !important;
            border-radius: 4px !important;
            padding: 8px !important;
            min-height: 40px !important;
            background-color: #fff !important;
            position: relative !important;
            margin-top: 5px !important;
            margin-bottom: 5px !important;
        }

        .selected-abilities {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            justify-content: flex-start !important;
            background-color: #f0f8ff !important;
            padding: 10px !important;
            border-radius: 4px !important;
        }

        .ability-item {
            display: flex !important;
            align-items: center !important;
            background-color: #4a90e2 !important;
            color: white !important;
            border-radius: 6px !important;
            padding: 6px 10px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            width: fit-content !important;
            border: 2px solid #2a70c2 !important;
            margin: 2px !important;
        }

        .ability-name {
            margin-right: 8px !important;
            font-weight: 500 !important;
            color: white !important;
        }

        .info-ability-btn, .remove-ability-btn {
            width: 20px !important;
            height: 20px !important;
            padding: 0 !important;
            margin-left: 6px !important;
            font-size: 10px !important;
            line-height: 1 !important;
            border-radius: 50% !important;
            background-color: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background-color 0.2s !important;
        }

        .info-ability-btn:hover, .remove-ability-btn:hover {
            background-color: rgba(255, 255, 255, 0.3) !important;
        }

        /* CSS for add-ability-btn is now applied inline */

        .ability-placeholder {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #999 !important;
            padding: 4px 8px !important;
            width: 100% !important;
            font-style: italic !important;
            font-size: 14px !important;
        }

        /* Ability Selector Popup styles are now applied inline */
    `;

    // Add style to document
    document.head.appendChild(style);
}

/**
 * Initialize the NPCs list
 */
async function initNpcsList() {
    const npcsListElement = document.getElementById('npcs-list');
    if (!npcsListElement) return;

    try {
        // Fetch abilities first
        await fetchAbilities();

        // Add abilities styles
        addAbilitiesStyles();

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
                await showNpcDetails(npc);
            }
        });
    });
}

/**
 * Show the details of an NPC
 * @param {Object} npc - The NPC object
 */
async function showNpcDetails(npc) {
    const detailsContainer = document.getElementById('npc-details');
    if (!detailsContainer) return;

    // Create the details content
    let detailsHTML = `
        <div class="details-header">
            <h2>${npc.name || 'Unknown NPC'}</h2>
            <button id="edit-npc-btn" class="btn">${window.i18n.t('edit_npc')}</button>
            <div class="details-actions" id="npc-edit-actions-top" style="display: none;">
                <button id="save-edit-npc-btn-top" class="btn">${window.i18n.t('save')}</button>
                <button id="cancel-edit-npc-btn-top" class="btn btn-secondary">${window.i18n.t('cancel')}</button>
            </div>
        </div>
        <div class="npc-details-grid" data-npc-id="${npc.id}">
            <!-- First line: name and FP -->
            <div class="npc-detail-row">
                <div class="npc-name-container">
                    <label for="npc-name">${window.i18n.t('npc_name')}</label>
                    <input type="text" id="npc-name" value="${npc.name || ''}" readonly>
                </div>
                <div class="npc-fp-container">
                    <label for="npc-fp">${window.i18n.t('npc_fp')}</label>
                    <input type="number" id="npc-fp" value="${npc.fp || ''}" readonly>
                </div>
            </div>

            <!-- Second line: init, perception, pv, VD -->
            <div class="npc-detail-row">
                <div class="npc-stat-container">
                    <label for="npc-init">${window.i18n.t('npc_init')}</label>
                    <input type="number" id="npc-init" value="${npc.init || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-perception">${window.i18n.t('npc_perception')}</label>
                    <input type="number" id="npc-perception" value="${npc.perception || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-pv">${window.i18n.t('npc_pv')}</label>
                    <input type="number" id="npc-pv" value="${npc.pv || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-vd">${window.i18n.t('npc_vd')}</label>
                    <input type="text" id="npc-vd" value="${npc.vd || ''}" readonly>
                </div>
            </div>

            <!-- Third line: CE, CC, Ref, Vig, Vol -->
            <div class="npc-detail-row">
                <div class="npc-stat-container">
                    <label for="npc-ce">${window.i18n.t('npc_ce')}</label>
                    <input type="number" id="npc-ce" value="${npc.ce || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-cc">${window.i18n.t('npc_cc')}</label>
                    <input type="number" id="npc-cc" value="${npc.cc || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-ref">${window.i18n.t('npc_ref')}</label>
                    <input type="number" id="npc-ref" value="${npc.ref || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-vig">${window.i18n.t('npc_vig')}</label>
                    <input type="number" id="npc-vig" value="${npc.vig || ''}" readonly>
                </div>
                <div class="npc-stat-container">
                    <label for="npc-vol">${window.i18n.t('npc_vol')}</label>
                    <input type="number" id="npc-vol" value="${npc.vol || ''}" readonly>
                </div>
            </div>

            <!-- Fourth line: abilities -->
            <div class="npc-detail-row">
                <div class="npc-abilities-container">
                    <div style="display: flex; align-items: center;">
                        <label>${window.i18n.t('npc_abilities')}</label>
                        <button id="add-ability-btn" class="btn btn-small add-ability-btn" style="margin-left: 8px; display: none;">➕</button>
                    </div>
                    <div id="npc-abilities-container"></div>
                </div>
            </div>

            <!-- Attacks section -->
            <div class="npc-detail-row">
                <div class="npc-attacks-container">
                    <label>${window.i18n.t('npc_attacks')}</label>
                    <div id="npc-attacks-list">
                        ${renderAttacksList(npc.attacks || [])}
                    </div>
                    <div class="attacks-actions" style="display: none;">
                        <button id="add-attack-btn" class="btn btn-small">${window.i18n.t('add_attack')}</button>
                    </div>
                </div>
            </div>

            <!-- Last line: détails -->
            <div class="npc-detail-row">
                <div class="npc-details-container">
                    <label for="npc-details">${window.i18n.t('npc_details')}</label>
                    <textarea id="npc-details" readonly>${npc.details || ''}</textarea>
                </div>
            </div>

            <!-- Save button (hidden by default) -->
            <div class="npc-detail-row">
                <div class="details-actions" id="npc-edit-actions" style="display: none;">
                    <button id="save-edit-npc-btn" class="btn">${window.i18n.t('save')}</button>
                    <button id="cancel-edit-npc-btn" class="btn btn-secondary">${window.i18n.t('cancel')}</button>
                </div>
            </div>
        </div>
    `;

    // Set the HTML and show the container
    detailsContainer.innerHTML = detailsHTML;
    detailsContainer.classList.add('visible');

    // Ensure abilities are loaded before populating the container
    await fetchAbilities();

    // Populate the abilities container
    const abilitiesContainer = document.getElementById('npc-abilities-container');
    if (abilitiesContainer) {
        const selectedAbilityIds = npc.abilities || [];
        const abilitiesMultiselect = createAbilitiesMultiselect(selectedAbilityIds, true);
        abilitiesContainer.appendChild(abilitiesMultiselect);
    }

    // Add event listener for the edit button
    const editBtn = document.getElementById('edit-npc-btn');
    if (editBtn) {
        editBtn.addEventListener('click', async () => await toggleNpcEditMode(true));
    }

    // Add event listeners for the save and cancel buttons (bottom)
    const saveBtn = document.getElementById('save-edit-npc-btn');
    const cancelBtn = document.getElementById('cancel-edit-npc-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveNpcEdit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => await toggleNpcEditMode(false));
    }

    // Add event listeners for the save and cancel buttons (top)
    const saveBtnTop = document.getElementById('save-edit-npc-btn-top');
    const cancelBtnTop = document.getElementById('cancel-edit-npc-btn-top');

    if (saveBtnTop) {
        saveBtnTop.addEventListener('click', saveNpcEdit);
    }

    if (cancelBtnTop) {
        cancelBtnTop.addEventListener('click', async () => await toggleNpcEditMode(false));
    }

    // Add event listener for the add attack button
    const addAttackBtn = document.getElementById('add-attack-btn');
    if (addAttackBtn) {
        addAttackBtn.addEventListener('click', addNewAttack);
    }
}

/**
 * Render the list of attacks for an NPC
 * @param {Array} attacks - The array of attack objects
 * @returns {string} HTML for the attacks list
 */
function renderAttacksList(attacks) {
    if (!attacks || attacks.length === 0) {
        return '<div class="empty-attacks">-</div>';
    }

    let html = '<div class="attacks-list">';
    attacks.forEach((attack, index) => {
        html += `
            <div class="attack-item" data-index="${index}">
                <div class="attack-display">
                    ${attack.name || ''} ${attack.modifier ? '+' + attack.modifier : ''} (${attack.damage || ''} ${attack.type || ''})
                    ${attack.note ? ' ' + attack.note : ''}
                </div>
                <div class="attack-edit" style="display: none;">
                    <div class="attack-edit-row">
                        <div class="attack-field">
                            <label>${window.i18n.t('attack_name')}</label>
                            <input type="text" class="attack-name" value="${attack.name || ''}">
                        </div>
                        <div class="attack-field">
                            <label>${window.i18n.t('attack_modifier')}</label>
                            <input type="text" class="attack-modifier" value="${attack.modifier || ''}">
                        </div>
                    </div>
                    <div class="attack-edit-row">
                        <div class="attack-field">
                            <label>${window.i18n.t('attack_damage')}</label>
                            <input type="text" class="attack-damage" value="${attack.damage || ''}">
                        </div>
                        <div class="attack-field">
                            <label>${window.i18n.t('attack_type')}</label>
                            <input type="text" class="attack-type" value="${attack.type || ''}">
                        </div>
                    </div>
                    <div class="attack-edit-row">
                        <div class="attack-field">
                            <label>${window.i18n.t('attack_note')}</label>
                            <input type="text" class="attack-note" value="${attack.note || ''}">
                        </div>
                        <div class="attack-field attack-actions">
                            <button class="btn btn-small btn-danger remove-attack-btn">${window.i18n.t('remove_attack')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

/**
 * Toggle edit mode for an NPC
 * @param {boolean} editMode - Whether to enable edit mode
 */
async function toggleNpcEditMode(editMode) {
    // Get all input and textarea elements
    const inputs = document.querySelectorAll('#npc-details input, #npc-details textarea');

    // Toggle readonly attribute
    inputs.forEach(input => {
        input.readOnly = !editMode;
    });

    // Show/hide edit button
    const editBtn = document.getElementById('edit-npc-btn');
    if (editBtn) {
        editBtn.style.display = editMode ? 'none' : 'block';
    }

    // Show/hide edit actions (bottom)
    const editActions = document.getElementById('npc-edit-actions');
    if (editActions) {
        editActions.style.display = editMode ? 'flex' : 'none';
    }

    // Show/hide edit actions (top)
    const editActionsTop = document.getElementById('npc-edit-actions-top');
    if (editActionsTop) {
        editActionsTop.style.display = editMode ? 'flex' : 'none';
    }

    // Show/hide add ability button
    const addAbilityBtn = document.getElementById('add-ability-btn');
    if (addAbilityBtn) {
        addAbilityBtn.style.display = editMode ? 'inline-block' : 'none';
        // Add event listener if it doesn't already have one
        if (editMode && !addAbilityBtn._hasClickListener) {
            addAbilityBtn.addEventListener('click', showAbilitySelector);
            addAbilityBtn._hasClickListener = true;
        }
    }

    // Show/hide attacks actions
    const attacksActions = document.querySelector('.attacks-actions');
    if (attacksActions) {
        attacksActions.style.display = editMode ? 'block' : 'none';
    }

    // Show/hide attack edit forms
    const attackDisplays = document.querySelectorAll('.attack-display');
    const attackEdits = document.querySelectorAll('.attack-edit');

    attackDisplays.forEach(display => {
        display.style.display = editMode ? 'none' : 'block';
    });

    attackEdits.forEach(edit => {
        edit.style.display = editMode ? 'block' : 'none';
    });

    // Add event listeners to remove attack buttons
    if (editMode) {
        const removeButtons = document.querySelectorAll('.remove-attack-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', removeAttack);
        });
    }

    // Ensure abilities are loaded before updating the multiselect
    await fetchAbilities();

    // Update abilities multiselect
    const abilitiesContainer = document.getElementById('npc-abilities-container');
    if (abilitiesContainer) {
        // Get the current selected ability IDs
        const selectedAbilityIds = selectedAbilities.map(ability => ability._id);

        // Clear the container
        abilitiesContainer.innerHTML = '';

        // Create a new multiselect with the appropriate mode
        const abilitiesMultiselect = createAbilitiesMultiselect(selectedAbilityIds, !editMode);
        abilitiesContainer.appendChild(abilitiesMultiselect);
    }
}

/**
 * Add a new attack to the NPC
 */
function addNewAttack() {
    const attacksList = document.getElementById('npc-attacks-list');
    if (!attacksList) return;

    // Get the current number of attacks
    const attacks = attacksList.querySelectorAll('.attack-item');
    const newIndex = attacks.length;

    // Create a new attack item
    const newAttack = document.createElement('div');
    newAttack.className = 'attack-item';
    newAttack.setAttribute('data-index', newIndex);

    newAttack.innerHTML = `
        <div class="attack-display" style="display: none;">
            New attack
        </div>
        <div class="attack-edit">
            <div class="attack-edit-row">
                <div class="attack-field">
                    <label>${window.i18n.t('attack_name')}</label>
                    <input type="text" class="attack-name" value="">
                </div>
                <div class="attack-field">
                    <label>${window.i18n.t('attack_modifier')}</label>
                    <input type="text" class="attack-modifier" value="">
                </div>
            </div>
            <div class="attack-edit-row">
                <div class="attack-field">
                    <label>${window.i18n.t('attack_damage')}</label>
                    <input type="text" class="attack-damage" value="">
                </div>
                <div class="attack-field">
                    <label>${window.i18n.t('attack_type')}</label>
                    <input type="text" class="attack-type" value="">
                </div>
            </div>
            <div class="attack-edit-row">
                <div class="attack-field">
                    <label>${window.i18n.t('attack_note')}</label>
                    <input type="text" class="attack-note" value="">
                </div>
                <div class="attack-field attack-actions">
                    <button class="btn btn-small btn-danger remove-attack-btn">${window.i18n.t('remove_attack')}</button>
                </div>
            </div>
        </div>
    `;

    // Add the new attack to the list
    attacksList.appendChild(newAttack);

    // Add event listener to the remove button
    const removeButton = newAttack.querySelector('.remove-attack-btn');
    if (removeButton) {
        removeButton.addEventListener('click', removeAttack);
    }
}

/**
 * Remove an attack from the NPC
 * @param {Event} event - The click event
 */
function removeAttack(event) {
    const attackItem = event.target.closest('.attack-item');
    if (attackItem) {
        attackItem.remove();
    }
}

/**
 * Save the edited NPC
 */
async function saveNpcEdit() {
    // Get the NPC ID
    const npcDetailsGrid = document.querySelector('.npc-details-grid');
    const npcId = npcDetailsGrid.getAttribute('data-npc-id');

    if (!npcId) {
        console.error('NPC ID not found');
        return;
    }

    // Get the form values
    const name = document.getElementById('npc-name').value;
    const fp = document.getElementById('npc-fp').value;
    const init = document.getElementById('npc-init').value;
    const perception = document.getElementById('npc-perception').value;
    const pv = document.getElementById('npc-pv').value;
    const vd = document.getElementById('npc-vd').value;
    const ce = document.getElementById('npc-ce').value;
    const cc = document.getElementById('npc-cc').value;
    const ref = document.getElementById('npc-ref').value;
    const vig = document.getElementById('npc-vig').value;
    const vol = document.getElementById('npc-vol').value;
    const details = document.getElementById('npc-details').value;

    // Get the selected abilities
    const abilities = selectedAbilities.map(ability => ability._id);

    // Validate required fields
    if (!name) {
        alert(window.i18n.t('name_required'));
        return;
    }

    // Get the attacks
    const attacks = [];
    const attackItems = document.querySelectorAll('.attack-item');

    attackItems.forEach(item => {
        const nameInput = item.querySelector('.attack-name');
        const modifierInput = item.querySelector('.attack-modifier');
        const damageInput = item.querySelector('.attack-damage');
        const typeInput = item.querySelector('.attack-type');
        const noteInput = item.querySelector('.attack-note');

        if (nameInput && nameInput.value) {
            attacks.push({
                name: nameInput.value,
                modifier: modifierInput ? modifierInput.value : '',
                damage: damageInput ? damageInput.value : '',
                type: typeInput ? typeInput.value : '',
                note: noteInput ? noteInput.value : ''
            });
        }
    });

    // Create the updated NPC object
    const updatedNpc = {
        id: npcId,
        name,
        fp,
        init,
        perception,
        pv,
        vd,
        ce,
        cc,
        ref,
        vig,
        vol,
        abilities,
        attacks,
        details,
        updatedAt: Date.now()
    };

    try {
        // Update the NPC in the database
        await window.db.update('npcs', updatedNpc);

        // Refresh the NPCs list
        await initNpcsList();

        // Show the updated NPC details
        const npc = await window.db.get('npcs', npcId);
        if (npc) {
            await showNpcDetails(npc);
        }
    } catch (error) {
        console.error('Error updating NPC:', error);
        alert(window.i18n.t('error_saving_npc'));
    }
}

/**
 * Show the form for adding a new NPC
 */
async function showAddNpcForm() {
    const detailsContainer = document.getElementById('npc-details');
    if (!detailsContainer) return;

    // Create the form content
    let formHTML = `
        <div class="details-header">
            <h2>${window.i18n.t('add_npc')}</h2>
        </div>
        <div class="npc-details-grid">
            <!-- First line: name and FP -->
            <div class="npc-detail-row">
                <div class="npc-name-container">
                    <label for="npc-name">${window.i18n.t('npc_name')}</label>
                    <input type="text" id="npc-name" required>
                </div>
                <div class="npc-fp-container">
                    <label for="npc-fp">${window.i18n.t('npc_fp')}</label>
                    <input type="number" id="npc-fp">
                </div>
            </div>

            <!-- Second line: init, perception, pv, VD -->
            <div class="npc-detail-row">
                <div class="npc-stat-container">
                    <label for="npc-init">${window.i18n.t('npc_init')}</label>
                    <input type="number" id="npc-init">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-perception">${window.i18n.t('npc_perception')}</label>
                    <input type="number" id="npc-perception">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-pv">${window.i18n.t('npc_pv')}</label>
                    <input type="number" id="npc-pv">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-vd">${window.i18n.t('npc_vd')}</label>
                    <input type="text" id="npc-vd">
                </div>
            </div>

            <!-- Third line: CE, CC, Ref, Vig, Vol -->
            <div class="npc-detail-row">
                <div class="npc-stat-container">
                    <label for="npc-ce">${window.i18n.t('npc_ce')}</label>
                    <input type="number" id="npc-ce">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-cc">${window.i18n.t('npc_cc')}</label>
                    <input type="number" id="npc-cc">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-ref">${window.i18n.t('npc_ref')}</label>
                    <input type="number" id="npc-ref">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-vig">${window.i18n.t('npc_vig')}</label>
                    <input type="number" id="npc-vig">
                </div>
                <div class="npc-stat-container">
                    <label for="npc-vol">${window.i18n.t('npc_vol')}</label>
                    <input type="number" id="npc-vol">
                </div>
            </div>

            <!-- Fourth line: abilities -->
            <div class="npc-detail-row">
                <div class="npc-abilities-container">
                    <div style="display: flex; align-items: center;">
                        <label>${window.i18n.t('npc_abilities')}</label>
                        <button id="add-ability-btn" class="btn btn-small add-ability-btn" style="margin-left: 8px;">➕</button>
                    </div>
                    <div id="npc-abilities-container"></div>
                </div>
            </div>

            <!-- Attacks section -->
            <div class="npc-detail-row">
                <div class="npc-attacks-container">
                    <label>${window.i18n.t('npc_attacks')}</label>
                    <div id="npc-attacks-list">
                        <!-- Attacks will be added here -->
                    </div>
                    <div class="attacks-actions">
                        <button id="add-attack-btn" class="btn btn-small">${window.i18n.t('add_attack')}</button>
                    </div>
                </div>
            </div>

            <!-- Fifth line: détails -->
            <div class="npc-detail-row">
                <div class="npc-details-container">
                    <label for="npc-details">${window.i18n.t('npc_details')}</label>
                    <textarea id="npc-details"></textarea>
                </div>
            </div>

            <!-- Save button -->
            <div class="npc-detail-row">
                <div class="details-actions">
                    <button id="save-npc-btn" class="btn">${window.i18n.t('save')}</button>
                    <button id="cancel-npc-btn" class="btn btn-secondary">${window.i18n.t('cancel')}</button>
                </div>
            </div>
        </div>
    `;

    // Set the HTML and show the container
    detailsContainer.innerHTML = formHTML;
    detailsContainer.classList.add('visible');

    // Ensure abilities are loaded before populating the container
    await fetchAbilities();

    // Populate the abilities container
    const abilitiesContainer = document.getElementById('npc-abilities-container');
    if (abilitiesContainer) {
        // Reset the global selectedAbilities array
        selectedAbilities = [];

        // Create a new multiselect in edit mode
        const abilitiesMultiselect = createAbilitiesMultiselect([], false);
        abilitiesContainer.appendChild(abilitiesMultiselect);
    }

    // Add event listeners for the save and cancel buttons
    const saveBtn = document.getElementById('save-npc-btn');
    const cancelBtn = document.getElementById('cancel-npc-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveNpc);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            detailsContainer.classList.remove('visible');
        });
    }

    // Add event listener for the add attack button
    const addAttackBtn = document.getElementById('add-attack-btn');
    if (addAttackBtn) {
        addAttackBtn.addEventListener('click', addNewAttack);
    }

    // Add event listener for the add ability button
    const addAbilityBtn = document.getElementById('add-ability-btn');
    if (addAbilityBtn) {
        addAbilityBtn.addEventListener('click', showAbilitySelector);
    }
}

/**
 * Save a new NPC to the database
 */
async function saveNpc() {
    // Get the form values
    const name = document.getElementById('npc-name').value;
    const fp = document.getElementById('npc-fp').value;
    const init = document.getElementById('npc-init').value;
    const perception = document.getElementById('npc-perception').value;
    const pv = document.getElementById('npc-pv').value;
    const vd = document.getElementById('npc-vd').value;
    const ce = document.getElementById('npc-ce').value;
    const cc = document.getElementById('npc-cc').value;
    const ref = document.getElementById('npc-ref').value;
    const vig = document.getElementById('npc-vig').value;
    const vol = document.getElementById('npc-vol').value;
    const details = document.getElementById('npc-details').value;

    // Get the selected abilities
    const abilities = selectedAbilities.map(ability => ability._id);

    // Validate required fields
    if (!name) {
        alert(window.i18n.t('name_required'));
        return;
    }

    // Create the NPC object
    const npc = {
        name,
        fp,
        init,
        perception,
        pv,
        vd,
        ce,
        cc,
        ref,
        vig,
        vol,
        abilities,
        details,
        createdAt: Date.now()
    };

    try {
        // Save the NPC to the database
        await window.db.add('npcs', npc);

        // Refresh the NPCs list
        await initNpcsList();

        // Hide the form
        const detailsContainer = document.getElementById('npc-details');
        if (detailsContainer) {
            detailsContainer.classList.remove('visible');
        }
    } catch (error) {
        console.error('Error saving NPC:', error);
        alert(window.i18n.t('error_saving_npc'));
    }
}

// Export functions for use in other modules
window.npcUI = {
    initNpcsList,
    showAddNpcForm,
    showAbilityDetails
};
