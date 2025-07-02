/**
 * Starfisher - Database UI Module
 * Provides UI components for database settings
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create API settings UI if using API database
    if (window.db && window.db.getApiPort) {
        createApiSettingsUI();
    }
});


/**
 * Create the API settings UI
 */
function createApiSettingsUI() {
    // Create the API settings section
    const settingsContainer = document.getElementById('settings-content');
    if (!settingsContainer) return;

    // Check if the section already exists
    if (document.getElementById('api-settings-section')) return;

    // Create the section
    const apiSection = document.createElement('div');
    apiSection.className = 'settings-section';
    apiSection.id = 'api-settings-section';

    // Create the section header
    const apiHeader = document.createElement('h2');
    apiHeader.textContent = 'API Backend';
    apiSection.appendChild(apiHeader);

    // Create the form
    const apiForm = document.createElement('div');
    apiForm.className = 'api-form';

    // Create port input
    const portLabel = document.createElement('label');
    portLabel.htmlFor = 'api-port';
    portLabel.textContent = 'Port:';

    const portInput = document.createElement('input');
    portInput.type = 'number';
    portInput.id = 'api-port';
    portInput.min = '1';
    portInput.max = '65535';
    portInput.value = window.db.getApiPort();

    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn db-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
        const port = parseInt(portInput.value, 10);
        if (port >= 1 && port <= 65535) {
            window.db.setApiPort(port);
            window.db.clearCache(); // Clear cache when changing port
            window.app.showNotification('API port updated. Reconnecting...', 'info');

            // Test connection with new port
            window.db.init().then(success => {
                if (success) {
                    window.app.showNotification('Connected to API on port ' + port, 'success');
                } else {
                    window.app.showNotification('Failed to connect to API on port ' + port, 'error');
                }
            });
        } else {
            window.app.showNotification('Invalid port number. Please enter a number between 1 and 65535.', 'error');
        }
    });

    // Create status indicator
    const statusContainer = document.createElement('div');
    statusContainer.className = 'api-status';

    const statusLabel = document.createElement('span');
    statusLabel.textContent = 'Status: ';

    const statusIndicator = document.createElement('span');
    statusIndicator.id = 'api-status-indicator';
    statusIndicator.textContent = 'Checking...';

    statusContainer.appendChild(statusLabel);
    statusContainer.appendChild(statusIndicator);

    // Add elements to the form
    apiForm.appendChild(portLabel);
    apiForm.appendChild(portInput);
    apiForm.appendChild(saveBtn);
    apiForm.appendChild(statusContainer);

    // Add form to the section
    apiSection.appendChild(apiForm);

    // Add the section to the settings container
    settingsContainer.appendChild(apiSection);

    // Check API connection status
    window.db.init().then(success => {
        const indicator = document.getElementById('api-status-indicator');
        if (indicator) {
            if (success) {
                indicator.textContent = 'Connected';
                indicator.className = 'status-connected';
            } else {
                indicator.textContent = 'Disconnected';
                indicator.className = 'status-disconnected';
            }
        }
    });

    // Update styles
    updateStyles();
}


/**
 * Update styles for all UI components
 */
function updateStyles() {
    // Remove existing style if it exists
    const existingStyle = document.getElementById('db-ui-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'db-ui-styles';
    style.textContent = `
        .settings-section {
            margin-bottom: 2rem;
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            box-shadow: var(--box-shadow);
        }

        .settings-section h2 {
            margin-bottom: 1rem;
            color: var(--primary-color);
            border-bottom: 1px solid var(--light-bg);
            padding-bottom: 0.5rem;
        }

        .db-btn {
            background-color: var(--primary-color);
        }

        .db-btn:hover {
            background-color: var(--secondary-color);
        }

        .api-form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .api-form label {
            font-weight: bold;
        }

        .api-form input {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100px;
        }

        .api-status {
            width: 100%;
            margin-top: 1rem;
            font-size: 0.9rem;
        }

        .status-connected {
            color: green;
            font-weight: bold;
        }

        .status-disconnected {
            color: red;
            font-weight: bold;
        }

        @media (max-width: 768px) {
            .api-form {
                flex-direction: column;
                align-items: flex-start;
            }

            .api-form input {
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);
}
