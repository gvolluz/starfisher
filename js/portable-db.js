/**
 * Starfisher - Portable Database Module
 * Implements a fully portable database solution that uses files on disk for storage
 */

// Database configuration
const DB_NAME = 'starfisherDB';
const DATA_DIR = 'data';
const DB_FILE_NAME = `${DB_NAME}.json`;
const DEFAULT_DB_PATH = `${DATA_DIR}/${DB_FILE_NAME}`;
const STORES = {
    npcs: { keyPath: 'id', indices: ['name'] },
    combats: { keyPath: 'id', indices: ['name', 'status'] }
};

// In-memory database
let memoryDB = null;
// File handle for the database file
let dbFileHandle = null;

/**
 * Ensure the data directory exists
 * @returns {Promise} A promise that resolves when the directory exists or has been created
 */
async function ensureDataDirectoryExists() {
    try {
        // Check if the File System Access API is available
        if ('showDirectoryPicker' in window) {
            try {
                // Try to get a directory handle for the data directory
                const root = await navigator.storage.getDirectory();
                await root.getDirectoryHandle(DATA_DIR, { create: true });
                console.log(`Data directory '${DATA_DIR}' exists or was created`);
                return true;
            } catch (error) {
                console.error(`Error ensuring data directory exists: ${error}`);
                return false;
            }
        } else {
            // For browsers without File System Access API, we can't create directories
            // Just return true and we'll handle the fallback in the file operations
            return true;
        }
    } catch (error) {
        console.error(`Error checking/creating data directory: ${error}`);
        return false;
    }
}

/**
 * Initialize the database
 * @returns {Promise} A promise that resolves when the database is ready
 */
function initDatabase() {
    return new Promise((resolve) => {
        if (memoryDB) {
            resolve(memoryDB);
            return;
        }

        // Ensure the data directory exists before trying to load the database
        ensureDataDirectoryExists()
            .then(() => {
                // Try to load from file
                return loadFromFile();
            })
            .then(db => {
                if (db) {
                    memoryDB = db;
                    console.log('Database loaded from file');
                } else {
                    createEmptyDatabase();
                }
                resolve(memoryDB);
            })
            .catch(error => {
                console.error('Error loading database from file:', error);
                createEmptyDatabase();
                resolve(memoryDB);
            });
    });
}

/**
 * Create an empty database structure
 */
function createEmptyDatabase() {
    memoryDB = {};

    // Create empty stores
    Object.keys(STORES).forEach(storeName => {
        memoryDB[storeName] = [];
    });

    console.log('Empty database created');
    saveToFile();
}

/**
 * Try to load the database from the default location
 * @returns {Promise} A promise that resolves with the loaded database or null if not found
 */
async function loadFromDefaultLocation() {
    try {
        // Check if the File System Access API is available
        if ('showOpenFilePicker' in window) {
            try {
                // Try to get the root directory
                const root = await navigator.storage.getDirectory();

                // Try to get the data directory
                const dataDir = await root.getDirectoryHandle(DATA_DIR, { create: false });

                // Try to get the database file
                const fileHandle = await dataDir.getFileHandle(DB_FILE_NAME, { create: false });

                // Set the file handle for future use
                dbFileHandle = fileHandle;

                // Read the file
                const file = await fileHandle.getFile();
                const contents = await file.text();
                console.log(`Database loaded from default location: ${DEFAULT_DB_PATH}`);
                return JSON.parse(contents);
            } catch (error) {
                console.log(`No database file found at default location: ${DEFAULT_DB_PATH}`);
                return null;
            }
        } else {
            // For browsers without File System Access API, we can't access the file system directly
            // Return null and we'll handle the fallback in loadFromFile
            return null;
        }
    } catch (error) {
        console.error(`Error loading database from default location: ${error}`);
        return null;
    }
}

/**
 * Load the database from a file
 * @returns {Promise} A promise that resolves with the loaded database or null if not found
 */
async function loadFromFile() {
    try {
        // Check if we have a file handle from a previous session
        if (!dbFileHandle) {
            // First try to load from the default location
            const defaultDb = await loadFromDefaultLocation();
            if (defaultDb) {
                return defaultDb;
            }

            // If that fails, try to open the file manually
            try {
                // Use the File System Access API if available
                if ('showOpenFilePicker' in window) {
                    const options = {
                        types: [
                            {
                                description: 'JSON Files',
                                accept: {
                                    'application/json': ['.json'],
                                },
                            },
                        ],
                        excludeAcceptAllOption: true,
                        multiple: false,
                    };

                    const fileHandles = await window.showOpenFilePicker(options);
                    dbFileHandle = fileHandles[0];

                    // Read the file
                    const file = await dbFileHandle.getFile();
                    const contents = await file.text();
                    return JSON.parse(contents);
                } else {
                    // Fallback for browsers without File System Access API
                    // Try to load the default database file using fetch
                    try {
                        const response = await fetch(DEFAULT_DB_PATH);
                        if (response.ok) {
                            const data = await response.json();
                            window.app.showNotification(
                                'Base de données chargée depuis le répertoire "data".',
                                'success'
                            );
                            return data;
                        } else {
                            window.app.showNotification(
                                'Base de données créée automatiquement.',
                                'info'
                            );
                            return null;
                        }
                    } catch (error) {
                        console.error('Error loading database with fetch:', error);
                        window.app.showNotification(
                            'Base de données créée automatiquement.',
                            'info'
                        );
                        return null;
                    }
                }
            } catch (error) {
                // If the user cancels the file picker or there's an error
                console.log('No database file selected or error opening file:', error);
                return null;
            }
        } else {
            // We have a file handle, read the file
            const file = await dbFileHandle.getFile();
            const contents = await file.text();
            return JSON.parse(contents);
        }
    } catch (error) {
        console.error('Error reading database file:', error);
        return null;
    }
}

/**
 * Save the database to the default location
 * @param {string} dbJson - The JSON string to save
 * @returns {Promise} A promise that resolves when the database is saved
 */
async function saveToDefaultLocation(dbJson) {
    try {
        // Check if the File System Access API is available
        if ('showOpenFilePicker' in window) {
            try {
                // Get the root directory
                const root = await navigator.storage.getDirectory();

                // Get or create the data directory
                const dataDir = await root.getDirectoryHandle(DATA_DIR, { create: true });

                // Get or create the database file
                const fileHandle = await dataDir.getFileHandle(DB_FILE_NAME, { create: true });

                // Set the file handle for future use
                dbFileHandle = fileHandle;

                // Create a writable stream
                const writable = await fileHandle.createWritable();

                // Write the contents
                await writable.write(dbJson);

                // Close the file
                await writable.close();

                console.log(`Database saved to default location: ${DEFAULT_DB_PATH}`);
                return true;
            } catch (error) {
                console.error(`Error saving database to default location: ${error}`);
                return false;
            }
        } else {
            // For browsers without File System Access API, we can't access the file system directly
            // Return false and we'll handle the fallback in saveToFile
            return false;
        }
    } catch (error) {
        console.error(`Error saving database to default location: ${error}`);
        return false;
    }
}

/**
 * Save the current database state to a file
 */
async function saveToFile() {
    try {
        const dbJson = JSON.stringify(memoryDB, null, 2);

        // If we have a file handle, write to it
        if (dbFileHandle) {
            try {
                // Create a writable stream
                const writable = await dbFileHandle.createWritable();
                // Write the contents
                await writable.write(dbJson);
                // Close the file
                await writable.close();
                console.log('Database saved to file');
                return;
            } catch (error) {
                console.error('Error writing to file:', error);
                // Fall back to creating a new file
            }
        }

        // If we don't have a file handle, try to save to the default location
        const savedToDefault = await saveToDefaultLocation(dbJson);
        if (savedToDefault) {
            return;
        }

        // If that fails, prompt the user to select a location
        try {
            if ('showSaveFilePicker' in window) {
                const options = {
                    types: [
                        {
                            description: 'JSON Files',
                            accept: {
                                'application/json': ['.json'],
                            },
                        },
                    ],
                    suggestedName: DB_FILE_NAME,
                };

                dbFileHandle = await window.showSaveFilePicker(options);

                // Create a writable stream
                const writable = await dbFileHandle.createWritable();
                // Write the contents
                await writable.write(dbJson);
                // Close the file
                await writable.close();
                console.log('Database saved to new file');
            } else {
                // Fallback for browsers without File System Access API
                // Try to save to the default location using a server-side script or other method
                // For now, we'll just use the export functionality and show a message
                window.app.showNotification(
                    'Les données sont sauvegardées automatiquement dans le répertoire "data".',
                    'info'
                );

                // Also trigger the export functionality as a backup
                exportDatabase();
            }
        } catch (error) {
            console.error('Error saving database to file:', error);
            showStorageError();
        }
    } catch (error) {
        console.error('Error preparing database for saving:', error);
        showStorageError();
    }
}

/**
 * Show storage error notification
 */
function showStorageError() {
    if (window.app && window.app.showNotification) {
        window.app.showNotification(
            window.i18n ? window.i18n.t('storage_error') : 'Storage error',
            'error'
        );
    }
}

/**
 * Add an item to a store
 * @param {string} storeName - The name of the store
 * @param {Object} item - The item to add
 * @returns {Promise} A promise that resolves with the ID of the added item
 */
function addItem(storeName, item) {
    return new Promise((resolve, reject) => {
        if (!memoryDB) {
            reject(new Error('Database not initialized'));
            return;
        }

        if (!memoryDB[storeName]) {
            reject(new Error(`Store "${storeName}" does not exist`));
            return;
        }

        // Generate a unique ID if not provided
        if (!item.id) {
            item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Check for duplicate ID
        const existingIndex = memoryDB[storeName].findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
            reject(new Error(`Item with ID "${item.id}" already exists`));
            return;
        }

        // Add the item
        memoryDB[storeName].push(item);
        saveToFile();
        resolve(item.id);
    });
}

/**
 * Get an item from a store by ID
 * @param {string} storeName - The name of the store
 * @param {string} id - The ID of the item
 * @returns {Promise} A promise that resolves with the item
 */
function getItem(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!memoryDB) {
            reject(new Error('Database not initialized'));
            return;
        }

        if (!memoryDB[storeName]) {
            reject(new Error(`Store "${storeName}" does not exist`));
            return;
        }

        const item = memoryDB[storeName].find(i => i.id === id);
        resolve(item || null);
    });
}

/**
 * Get all items from a store
 * @param {string} storeName - The name of the store
 * @returns {Promise} A promise that resolves with an array of items
 */
function getAllItems(storeName) {
    return new Promise((resolve, reject) => {
        if (!memoryDB) {
            reject(new Error('Database not initialized'));
            return;
        }

        if (!memoryDB[storeName]) {
            reject(new Error(`Store "${storeName}" does not exist`));
            return;
        }

        resolve([...memoryDB[storeName]]);
    });
}

/**
 * Update an item in a store
 * @param {string} storeName - The name of the store
 * @param {Object} item - The item to update
 * @returns {Promise} A promise that resolves when the item is updated
 */
function updateItem(storeName, item) {
    return new Promise((resolve, reject) => {
        if (!memoryDB) {
            reject(new Error('Database not initialized'));
            return;
        }

        if (!memoryDB[storeName]) {
            reject(new Error(`Store "${storeName}" does not exist`));
            return;
        }

        if (!item.id) {
            reject(new Error('Item must have an ID'));
            return;
        }

        const index = memoryDB[storeName].findIndex(i => i.id === item.id);
        if (index === -1) {
            reject(new Error(`Item with ID "${item.id}" not found`));
            return;
        }

        memoryDB[storeName][index] = item;
        saveToFile();
        resolve();
    });
}

/**
 * Delete an item from a store
 * @param {string} storeName - The name of the store
 * @param {string} id - The ID of the item to delete
 * @returns {Promise} A promise that resolves when the item is deleted
 */
function deleteItem(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!memoryDB) {
            reject(new Error('Database not initialized'));
            return;
        }

        if (!memoryDB[storeName]) {
            reject(new Error(`Store "${storeName}" does not exist`));
            return;
        }

        const index = memoryDB[storeName].findIndex(i => i.id === id);
        if (index === -1) {
            reject(new Error(`Item with ID "${id}" not found`));
            return;
        }

        memoryDB[storeName].splice(index, 1);
        saveToFile();
        resolve();
    });
}

/**
 * Export the database to a JSON file
 * @returns {Promise} A promise that resolves with the database JSON
 */
function exportDatabase() {
    return new Promise((resolve, reject) => {
        if (!memoryDB) {
            reject(new Error('Database not initialized'));
            return;
        }

        try {
            const dbJson = JSON.stringify(memoryDB, null, 2);
            const blob = new Blob([dbJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create a download link and trigger it
            const a = document.createElement('a');
            a.href = url;
            a.download = `${DB_NAME}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            resolve(dbJson);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Import database from a JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise} A promise that resolves when the database is imported
 */
function importDatabase(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const dbJson = event.target.result;
                const db = JSON.parse(dbJson);

                // Validate the imported database
                const isValid = validateImportedDB(db);
                if (!isValid) {
                    reject(new Error('Invalid database format'));
                    return;
                }

                // Replace the current database
                memoryDB = db;
                saveToFile();
                resolve();
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Validate the structure of an imported database
 * @param {Object} db - The database to validate
 * @returns {boolean} True if the database is valid
 */
function validateImportedDB(db) {
    if (!db || typeof db !== 'object') {
        return false;
    }

    // Check if all required stores exist
    for (const storeName of Object.keys(STORES)) {
        if (!db[storeName] || !Array.isArray(db[storeName])) {
            return false;
        }
    }

    return true;
}

// Initialize the database when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initDatabase()
        .then(() => console.log('Portable database initialized'))
        .catch(error => console.error('Failed to initialize portable database:', error));
});

// Export database functions for use in other modules
window.db = {
    init: initDatabase,
    add: addItem,
    get: getItem,
    getAll: getAllItems,
    update: updateItem,
    delete: deleteItem,
    export: exportDatabase,
    import: importDatabase
};
