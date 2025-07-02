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

    // Create the selected abilities list
    const selectedList = document.createElement('div');
    selectedList.className = 'selected-abilities';

    // Reset the global selectedAbilities array
    selectedAbilities = [];

    // Add selected abilities to the list
    if (selectedAbilityIds && selectedAbilityIds.length > 0) {
        selectedAbilityIds.forEach(abilityId => {
            const ability = allAbilities.find(a => a.id === abilityId);
            if (ability) {
                selectedAbilities.push(ability);
                const abilityElement = createAbilityElement(ability, readonly);
                selectedList.appendChild(abilityElement);
            }
        });
    }

    container.appendChild(selectedList);

    // Add button to add new abilities (only in edit mode)
    if (!readonly) {
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-small add-ability-btn';
        addButton.textContent = '➕';
        addButton.title = 'Ajouter une capacité';
        addButton.addEventListener('click', showAbilitySelector);
        container.appendChild(addButton);
    }

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
    element.setAttribute('data-id', ability.id);

    // Create the ability name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'ability-name';
    nameSpan.textContent = ability.name;
    element.appendChild(nameSpan);

    // Create the info button
    const infoButton = document.createElement('button');
    infoButton.className = 'btn btn-small info-ability-btn';
    infoButton.textContent = '❓';
    infoButton.title = 'Voir les détails';
    infoButton.addEventListener('click', () => showAbilityDetails(ability));
    element.appendChild(infoButton);

    // Create the remove button (only in edit mode)
    if (!readonly) {
        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-small remove-ability-btn';
        removeButton.textContent = '✖';
        removeButton.title = 'Retirer';
        removeButton.addEventListener('click', () => removeAbility(ability.id));
        element.appendChild(removeButton);
    }

    return element;
}

/**
 * Show the ability selector popup
 */
function showAbilitySelector() {
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'ability-selector-popup';

    // Create the popup content
    const content = document.createElement('div');
    content.className = 'ability-selector-content';

    // Create the header
    const header = document.createElement('div');
    header.className = 'ability-selector-header';

    const title = document.createElement('h3');
    title.textContent = 'Sélectionner une capacité';
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.className = 'btn btn-small close-popup-btn';
    closeButton.textContent = '✖';
    closeButton.addEventListener('click', () => document.body.removeChild(popup));
    header.appendChild(closeButton);

    content.appendChild(header);

    // Create the abilities list
    const abilitiesList = document.createElement('div');
    abilitiesList.className = 'abilities-list';

    // Add each ability to the list
    allAbilities.forEach(ability => {
        // Skip if already selected
        if (selectedAbilities.some(a => a.id === ability.id)) {
            return;
        }

        const abilityItem = document.createElement('div');
        abilityItem.className = 'ability-selector-item';
        abilityItem.setAttribute('data-id', ability.id);

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
            showAbilityDetails(ability);
        });
        abilityItem.appendChild(infoButton);

        // Add click event to select the ability
        abilityItem.addEventListener('click', () => {
            addAbility(ability);
            document.body.removeChild(popup);
        });

        abilitiesList.appendChild(abilityItem);
    });

    content.appendChild(abilitiesList);
    popup.appendChild(content);

    // Add the popup to the body
    document.body.appendChild(popup);
}

/**
 * Show the ability details popup
 * @param {Object} ability - The ability object
 */
function showAbilityDetails(ability) {
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'ability-details-popup';

    // Create the popup content
    const content = document.createElement('div');
    content.className = 'ability-details-content';

    // Create the header
    const header = document.createElement('div');
    header.className = 'ability-details-header';

    const title = document.createElement('h3');
    title.textContent = `${ability.name} (${ability.type})`;
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.className = 'btn btn-small close-popup-btn';
    closeButton.textContent = '✖';
    closeButton.addEventListener('click', () => document.body.removeChild(popup));
    header.appendChild(closeButton);

    content.appendChild(header);

    // Create the ability details
    const details = document.createElement('div');
    details.className = 'ability-details';
    details.textContent = ability.text;
    content.appendChild(details);

    popup.appendChild(content);

    // Add the popup to the body
    document.body.appendChild(popup);
}

/**
 * Add an ability to the selected abilities
 * @param {Object} ability - The ability object
 */
function addAbility(ability) {
    // Add to the global selectedAbilities array
    selectedAbilities.push(ability);

    // Add to the UI
    const selectedList = document.querySelector('.selected-abilities');
    if (selectedList) {
        const abilityElement = createAbilityElement(ability, false);
        selectedList.appendChild(abilityElement);
    }
}

/**
 * Remove an ability from the selected abilities
 * @param {string} abilityId - The ID of the ability to remove
 */
function removeAbility(abilityId) {
    // Remove from the global selectedAbilities array
    selectedAbilities = selectedAbilities.filter(a => a.id !== abilityId);

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
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            min-height: 40px;
            background-color: #fff;
            position: relative;
        }

        .selected-abilities {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .ability-item {
            display: flex;
            align-items: center;
            background-color: #f0f0f0;
            border-radius: 4px;
            padding: 4px 8px;
            margin-bottom: 4px;
        }

        .ability-name {
            margin-right: 8px;
        }

        .info-ability-btn, .remove-ability-btn {
            width: 24px;
            height: 24px;
            padding: 0;
            margin-left: 4px;
            font-size: 12px;
            line-height: 1;
        }

        .add-ability-btn {
            margin-top: 8px;
        }

        /* Ability Selector Popup */
        .ability-selector-popup, .ability-details-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .ability-selector-content, .ability-details-content {
            background-color: #fff;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            max-height: 80%;
            overflow: auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .ability-selector-header, .ability-details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
        }

        .ability-selector-header h3, .ability-details-header h3 {
            margin: 0;
        }

        .close-popup-btn {
            width: 24px;
            height: 24px;
            padding: 0;
            font-size: 12px;
            line-height: 1;
        }

        .abilities-list {
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        }

        .ability-selector-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
        }

        .ability-selector-item:hover {
            background-color: #f5f5f5;
        }

        .ability-details {
            padding: 16px;
            line-height: 1.5;
        }
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
            <button id="edit-npc-btn" class="btn">${window.i18n.t('edit_npc')}</button>
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
                    <label>${window.i18n.t('npc_abilities')}</label>
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
        editBtn.addEventListener('click', () => toggleNpcEditMode(true));
    }

    // Add event listeners for the save and cancel buttons
    const saveBtn = document.getElementById('save-edit-npc-btn');
    const cancelBtn = document.getElementById('cancel-edit-npc-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveNpcEdit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => toggleNpcEditMode(false));
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
function toggleNpcEditMode(editMode) {
    // Get all input and textarea elements
    const inputs = document.querySelectorAll('#npc-details input, #npc-details textarea');

    // Toggle readonly attribute
    inputs.forEach(input => {
        input.readOnly = !editMode;
    });

    // Show/hide edit actions
    const editActions = document.getElementById('npc-edit-actions');
    if (editActions) {
        editActions.style.display = editMode ? 'flex' : 'none';
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

    // Update abilities multiselect
    const abilitiesContainer = document.getElementById('npc-abilities-container');
    if (abilitiesContainer) {
        // Get the current selected ability IDs
        const selectedAbilityIds = selectedAbilities.map(ability => ability.id);

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
    const abilities = selectedAbilities.map(ability => ability.id);

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
            showNpcDetails(npc);
        }
    } catch (error) {
        console.error('Error updating NPC:', error);
        alert(window.i18n.t('error_saving_npc'));
    }
}

/**
 * Show the form for adding a new NPC
 */
function showAddNpcForm() {
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
                    <label>${window.i18n.t('npc_abilities')}</label>
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
    const abilities = selectedAbilities.map(ability => ability.id);

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
    showAddNpcForm
};
