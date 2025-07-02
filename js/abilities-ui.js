/**
 * Starfisher - Abilities UI Module
 * Provides UI components for displaying and managing abilities
 */

// Global variables
let abilitiesList = [];
let currentAbility = null;

/**
 * Initialize the abilities management UI
 */
function initAbilitiesUI() {
    console.log('Initializing abilities UI...');

    // Check if the settings page is visible
    const settingsPage = document.getElementById('settings');
    if (settingsPage) {
        console.log('Settings page visibility:', settingsPage.classList.contains('active') ? 'visible' : 'hidden');
    } else {
        console.error('Settings page not found');
    }

    // Create the abilities management section in the settings page
    const settingsContainer = document.getElementById('settings-content');
    if (!settingsContainer) {
        console.error('Settings container not found');
        return;
    }

    // Check if the section already exists
    if (document.getElementById('abilities-management-section')) {
        console.log('Abilities management section already exists');
        return;
    }

    // Create the section
    const abilitiesSection = document.createElement('div');
    abilitiesSection.className = 'settings-section';
    abilitiesSection.id = 'abilities-management-section';

    // Create the section header
    const abilitiesHeader = document.createElement('h2');
    abilitiesHeader.textContent = 'Gestion des Capacités';
    abilitiesSection.appendChild(abilitiesHeader);

    // Create the abilities list container
    const abilitiesContainer = document.createElement('div');
    abilitiesContainer.className = 'abilities-container';
    abilitiesContainer.innerHTML = `
        <div class="abilities-list-container">
            <div class="abilities-list-header">
                <h3>Liste des Capacités</h3>
                <button id="add-ability-btn" class="btn">Ajouter une Capacité</button>
            </div>
            <div class="abilities-list" id="abilities-list">
                <div class="loading">Chargement des capacités...</div>
            </div>
        </div>
        <div class="ability-details-container" id="ability-details-container">
            <div class="ability-details-placeholder">Sélectionnez une capacité pour voir ses détails</div>
        </div>
    `;
    abilitiesSection.appendChild(abilitiesContainer);

    // Add the section to the settings container
    settingsContainer.appendChild(abilitiesSection);
    console.log('Abilities management section added to settings container');

    // Verify that the section was added correctly
    if (document.getElementById('abilities-management-section')) {
        console.log('Abilities management section found in DOM after adding');
    } else {
        console.error('Abilities management section not found in DOM after adding');
    }

    // Add styles
    addAbilitiesStyles();
    console.log('Abilities styles added');

    // Load abilities
    console.log('Starting to load abilities');
    loadAbilities();

    // Add event listeners
    document.getElementById('add-ability-btn').addEventListener('click', showAddAbilityForm);
}

/**
 * Load abilities from the database
 */
async function loadAbilities() {
    console.log('Loading abilities...');
    try {
        // Check if window.db exists
        if (!window.db) {
            console.error('Database API not available (window.db is undefined)');
            const abilitiesListElement = document.getElementById('abilities-list');
            if (abilitiesListElement) {
                abilitiesListElement.innerHTML = `<div class="error">API de base de données non disponible (window.db est indéfini)</div>`;
            }
            return;
        }

        if (!window.db.getAll) {
            console.error('Database API method getAll not available');
            const abilitiesListElement = document.getElementById('abilities-list');
            if (abilitiesListElement) {
                abilitiesListElement.innerHTML = `<div class="error">Méthode getAll de l'API de base de données non disponible</div>`;
            }
            return;
        }

        // Get all abilities from the database
        console.log('Fetching abilities from database...');
        try {
            abilitiesList = await window.db.getAll('abilities');
            console.log(`Fetched ${abilitiesList.length} abilities`);
            // Log the abilities to see their structure
            console.log('Abilities:', abilitiesList);
        } catch (dbError) {
            console.error('Error fetching abilities from database:', dbError);
            const abilitiesListElement = document.getElementById('abilities-list');
            if (abilitiesListElement) {
                abilitiesListElement.innerHTML = `<div class="error">Erreur lors de la récupération des capacités: ${dbError.message}</div>`;
            }
            return;
        }

        // Sort abilities by name
        abilitiesList.sort((a, b) => a.name.localeCompare(b.name));

        // Render the abilities list
        renderAbilitiesList();
    } catch (error) {
        console.error('Error loading abilities:', error);
        const abilitiesListElement = document.getElementById('abilities-list');
        if (abilitiesListElement) {
            abilitiesListElement.innerHTML = `<div class="error">Erreur lors du chargement des capacités: ${error.message}</div>`;
        }
    }
}

/**
 * Render the abilities list
 */
function renderAbilitiesList() {
    const abilitiesListElement = document.getElementById('abilities-list');
    if (!abilitiesListElement) return;

    if (abilitiesList.length === 0) {
        abilitiesListElement.innerHTML = '<div class="empty-list">Aucune capacité trouvée</div>';
        return;
    }

    let html = '';
    console.debug('abilities: ', abilitiesList)
    abilitiesList.forEach(ability => {
        html += `
            <div class="ability-item" data-id="${ability._id}">
                <div class="ability-item-name">${ability.name}</div>
                <div class="ability-item-type">${ability.type}</div>
            </div>
        `;
    });

    abilitiesListElement.innerHTML = html;

    // Add click event listeners
    const abilityItems = abilitiesListElement.querySelectorAll('.ability-item');
    abilityItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            abilityItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Show ability details
            const abilityId = this.getAttribute('data-id');

            // Convert abilityId to string for comparison to handle both string and number IDs
            const ability = abilitiesList.find(a => String(a._id) === String(abilityId));

            if (ability) {
                // Pass a copy of the ability object to avoid reference issues
                const abilityCopy = JSON.parse(JSON.stringify(ability));
                showAbilityDetails(abilityCopy);
            } else {
                console.error('Ability not found with ID:', abilityId);
            }
        });
    });
}

/**
 * Show ability details
 * @param {Object} ability - The ability object
 */
function showAbilityDetails(ability) {
    currentAbility = ability;

    const detailsContainer = document.getElementById('ability-details-container');
    if (!detailsContainer) {
        console.error('ability-details-container not found');
        return;
    }

    const html = `
        <div class="ability-details">
            <div class="ability-details-header">
                <h3>${ability.name} (${ability.type})</h3>
                <div class="ability-actions">
                    <button id="edit-ability-btn" class="btn">Modifier</button>
                    <button id="delete-ability-btn" class="btn btn-danger">Supprimer</button>
                </div>
            </div>
            <div class="ability-details-content">
                <p>${ability.text}</p>
            </div>
        </div>
    `;
    detailsContainer.innerHTML = html;

    // Add event listeners
    const editBtn = document.getElementById('edit-ability-btn');
    const deleteBtn = document.getElementById('delete-ability-btn');


    if (editBtn) {
        editBtn.addEventListener('click', () => showEditAbilityForm(ability));
    } else {
        console.error('Edit button not found');
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => confirmDeleteAbility(ability));
    } else {
        console.error('Delete button not found');
    }
}

/**
 * Show the form to add a new ability
 */
function showAddAbilityForm() {
    const detailsContainer = document.getElementById('ability-details-container');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <div class="ability-form">
            <h3>Ajouter une Capacité</h3>
            <form id="ability-form">
                <div class="form-group">
                    <label for="ability-name">Nom</label>
                    <input type="text" id="ability-name" required>
                </div>
                <div class="form-group">
                    <label for="ability-type">Type</label>
                    <select id="ability-type" required>
                        <option value="EXT">EXT</option>
                        <option value="SUR">SUR</option>
                        <option value="MAG">MAG</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ability-text">Description</label>
                    <textarea id="ability-text" rows="10" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn">Enregistrer</button>
                    <button type="button" id="cancel-ability-btn" class="btn btn-secondary">Annuler</button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners
    document.getElementById('ability-form').addEventListener('submit', saveNewAbility);
    document.getElementById('cancel-ability-btn').addEventListener('click', () => {
        detailsContainer.innerHTML = '<div class="ability-details-placeholder">Sélectionnez une capacité pour voir ses détails</div>';
    });
}

/**
 * Show the form to edit an ability
 * @param {Object} ability - The ability object
 */
function showEditAbilityForm(ability) {
    const detailsContainer = document.getElementById('ability-details-container');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <div class="ability-form">
            <h3>Modifier une Capacité</h3>
            <form id="ability-form">
                <div class="form-group">
                    <label for="ability-name">Nom</label>
                    <input type="text" id="ability-name" value="${ability.name}" required>
                </div>
                <div class="form-group">
                    <label for="ability-type">Type</label>
                    <select id="ability-type" required>
                        <option value="EXT" ${ability.type === 'EXT' ? 'selected' : ''}>EXT</option>
                        <option value="SUR" ${ability.type === 'SUR' ? 'selected' : ''}>SUR</option>
                        <option value="MAG" ${ability.type === 'MAG' ? 'selected' : ''}>MAG</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ability-text">Description</label>
                    <textarea id="ability-text" rows="10" required>${ability.text}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn">Enregistrer</button>
                    <button type="button" id="cancel-ability-btn" class="btn btn-secondary">Annuler</button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners
    document.getElementById('ability-form').addEventListener('submit', saveEditedAbility);
    document.getElementById('cancel-ability-btn').addEventListener('click', () => {
        showAbilityDetails(ability);
    });
}

/**
 * Save a new ability
 * @param {Event} event - The form submit event
 */
async function saveNewAbility(event) {
    event.preventDefault();

    const name = document.getElementById('ability-name').value;
    const type = document.getElementById('ability-type').value;
    const text = document.getElementById('ability-text').value;

    if (!name || !type || !text) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        // Create the ability object
        const ability = {
            name,
            type,
            text
        };

        // Save to database
        const abilityId = await window.db.add('abilities', ability);

        // Reload abilities
        await loadAbilities();

        // Show success message
        alert('Capacité ajoutée avec succès');

        // Clear the form
        const detailsContainer = document.getElementById('ability-details-container');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<div class="ability-details-placeholder">Sélectionnez une capacité pour voir ses détails</div>';
        }
    } catch (error) {
        console.error('Error saving ability:', error);
        alert(`Erreur lors de l'enregistrement de la capacité: ${error.message}`);
    }
}

/**
 * Save an edited ability
 * @param {Event} event - The form submit event
 */
async function saveEditedAbility(event) {
    event.preventDefault();

    if (!currentAbility) {
        alert('Aucune capacité sélectionnée');
        return;
    }

    const name = document.getElementById('ability-name').value;
    const type = document.getElementById('ability-type').value;
    const text = document.getElementById('ability-text').value;

    if (!name || !type || !text) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        // Update the ability object
        const updatedAbility = {
            ...currentAbility,
            name,
            type,
            text
        };

        // Save to database
        await window.db.update('abilities', updatedAbility);

        // Reload abilities
        await loadAbilities();

        // Show success message
        alert('Capacité mise à jour avec succès');

        // Show the updated ability details
        showAbilityDetails(updatedAbility);
    } catch (error) {
        console.error('Error updating ability:', error);
        alert(`Erreur lors de la mise à jour de la capacité: ${error.message}`);
    }
}

/**
 * Confirm deletion of an ability
 * @param {Object} ability - The ability object
 */
function confirmDeleteAbility(ability) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la capacité "${ability.name}" ?`)) {
        deleteAbility(ability);
    }
}

/**
 * Delete an ability
 * @param {Object} ability - The ability object
 */
async function deleteAbility(ability) {
    try {
        // Delete from database
        await window.db.delete('abilities', ability.id);

        // Reload abilities
        await loadAbilities();

        // Show success message
        alert('Capacité supprimée avec succès');

        // Clear the details container
        const detailsContainer = document.getElementById('ability-details-container');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<div class="ability-details-placeholder">Sélectionnez une capacité pour voir ses détails</div>';
        }
    } catch (error) {
        console.error('Error deleting ability:', error);
        alert(`Erreur lors de la suppression de la capacité: ${error.message}`);
    }
}

/**
 * Add CSS styles for the abilities UI
 */
function addAbilitiesStyles() {
    // Check if styles already exist
    if (document.getElementById('abilities-ui-styles')) {
        return;
    }

    // Create style element
    const style = document.createElement('style');
    style.id = 'abilities-ui-styles';
    style.textContent = `
        .abilities-container {
            display: flex;
            gap: 20px;
            margin-top: 20px;
        }

        .abilities-list-container {
            flex: 1;
            max-width: 300px;
        }

        .abilities-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .abilities-list-header h3 {
            margin: 0;
        }

        .abilities-list {
            border: 1px solid #ccc;
            border-radius: 4px;
            max-height: 500px;
            overflow-y: auto;
        }

        .ability-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
        }

        .ability-item:hover {
            background-color: #f5f5f5;
        }

        .ability-item.active {
            background-color: #e0e0e0;
        }

        .ability-item-name {
            font-weight: bold;
        }

        .ability-item-type {
            font-size: 0.8em;
            color: #666;
        }

        .ability-details-container {
            flex: 2;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 20px;
            min-height: 300px;
        }

        .ability-details-placeholder {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: #999;
        }

        .ability-details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .ability-details-header h3 {
            margin: 0;
        }

        .ability-actions {
            display: flex;
            gap: 10px;
        }

        .ability-form {
            width: 100%;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }

        .btn-danger {
            background-color: #dc3545;
        }

        .btn-danger:hover {
            background-color: #c82333;
        }

        .loading, .error, .empty-list {
            padding: 20px;
            text-align: center;
        }

        .error {
            color: #dc3545;
        }

        @media (max-width: 768px) {
            .abilities-container {
                flex-direction: column;
            }

            .abilities-list-container {
                max-width: 100%;
            }
        }
    `;

    // Add style to document
    document.head.appendChild(style);
}

// Initialize when the DOM is loaded and when the settings page is shown
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing abilities UI');
    initAbilitiesUI();

    // Also initialize when the settings page is shown
    const settingsLink = document.querySelector('a[data-page="settings"]');
    if (settingsLink) {
        settingsLink.addEventListener('click', () => {
            console.log('Settings link clicked');

            // Check if the settings page is shown after a small delay
            setTimeout(() => {
                const settingsPage = document.getElementById('settings');
                if (settingsPage) {
                    console.log('Settings page visibility after click:', settingsPage.classList.contains('active') ? 'visible' : 'hidden');

                    if (settingsPage.classList.contains('active')) {
                        console.log('Settings page is active, initializing abilities UI');
                        initAbilitiesUI();
                    } else {
                        console.error('Settings page is not active after click');
                    }
                } else {
                    console.error('Settings page not found after click');
                }
            }, 100); // Small delay to ensure the page is fully shown
        });
    } else {
        console.error('Settings link not found');
    }
});

// Export functions for use in other modules
window.abilitiesUI = {
    initAbilitiesUI,
    loadAbilities
};

// Make initAbilitiesUI globally accessible
window.initAbilitiesUI = initAbilitiesUI;
