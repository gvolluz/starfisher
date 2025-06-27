/**
 * Starfisher - Database UI Module
 * Provides UI components for database file management functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create database management UI
    createDatabaseUI();
});

/**
 * Create the database management UI
 */
function createDatabaseUI() {
    // Create the database management section
    const dbSection = document.createElement('div');
    dbSection.className = 'db-management';

    // Create export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn db-btn';
    exportBtn.textContent = window.i18n.t('export_db');
    exportBtn.setAttribute('data-i18n', 'export_db');
    exportBtn.addEventListener('click', handleSaveDB);

    // Create import container (button + file input)
    const importContainer = document.createElement('div');
    importContainer.className = 'import-container';

    const importBtn = document.createElement('button');
    importBtn.className = 'btn db-btn';
    importBtn.textContent = window.i18n.t('import_db');
    importBtn.setAttribute('data-i18n', 'import_db');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'db-import';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', handleLoadDB);

    importBtn.addEventListener('click', () => fileInput.click());

    importContainer.appendChild(importBtn);
    importContainer.appendChild(fileInput);

    // Add info text about automatic saving
    const infoText = document.createElement('div');
    infoText.className = 'db-info';
    infoText.textContent = window.i18n.t('db_auto_save');
    infoText.setAttribute('data-i18n', 'db_auto_save');

    // Add buttons and info text to the section
    dbSection.appendChild(exportBtn);
    dbSection.appendChild(importContainer);
    dbSection.appendChild(infoText);

    // Listen for language changes to update the text
    document.addEventListener('languageChanged', () => {
        exportBtn.textContent = window.i18n.t('export_db');
        importBtn.textContent = window.i18n.t('import_db');
        infoText.textContent = window.i18n.t('db_auto_save');
    });

    // Add the section to the footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.insertBefore(dbSection, footer.firstChild);
    }

    // Add styles
    addStyles();
}

/**
 * Handle database save (manual export)
 */
function handleSaveDB() {
    if (!window.db || !window.db.export) {
        window.app.showNotification(window.i18n.t('export_unavailable'), 'error');
        return;
    }

    window.app.showNotification(window.i18n.t('export_progress'), 'info');

    window.db.export()
        .then(() => {
            window.app.showNotification(window.i18n.t('export_success'), 'success');
        })
        .catch(error => {
            console.error('Export error:', error);
            window.app.showNotification(window.i18n.t('export_error') + ': ' + error.message, 'error');
        });
}

/**
 * Handle database load (manual import)
 * @param {Event} event - The change event from the file input
 */
function handleLoadDB(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!window.db || !window.db.import) {
        window.app.showNotification(window.i18n.t('import_unavailable'), 'error');
        return;
    }

    window.app.showNotification(window.i18n.t('import_progress'), 'info');

    window.db.import(file)
        .then(() => {
            window.app.showNotification(window.i18n.t('import_success'), 'success');
            // Reset the file input
            event.target.value = '';
        })
        .catch(error => {
            console.error('Import error:', error);
            window.app.showNotification(window.i18n.t('import_error') + ': ' + error.message, 'error');
            // Reset the file input
            event.target.value = '';
        });
}

/**
 * Add styles for the database management UI
 */
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .db-management {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .db-btn {
            background-color: var(--primary-color);
        }

        .db-btn:hover {
            background-color: var(--secondary-color);
        }

        .import-container {
            position: relative;
        }

        .db-info {
            width: 100%;
            text-align: center;
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #666;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .db-management {
                flex-direction: column;
                align-items: center;
            }
        }
    `;

    document.head.appendChild(style);
}
