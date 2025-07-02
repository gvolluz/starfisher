/**
 * Starfisher - API Database Module
 * Implements a database solution that uses a Node.js backend API for storage
 */

// Default API configuration
const DEFAULT_API_PORT = 3000;
const API_PORT_STORAGE_KEY = 'starfisher_api_port';

// Get the API port from localStorage or use the default
function getApiPort() {
  const storedPort = localStorage.getItem(API_PORT_STORAGE_KEY);
  return storedPort ? parseInt(storedPort, 10) : DEFAULT_API_PORT;
}

// Set the API port in localStorage
function setApiPort(port) {
  localStorage.setItem(API_PORT_STORAGE_KEY, port.toString());
}

// Get the base API URL
function getApiBaseUrl() {
  const port = getApiPort();
  return `http://localhost:${port}/api`;
}

// In-memory cache for database items
const cache = {
  npcs: null,
  combats: null
};

/**
 * Initialize the database connection
 * @returns {Promise} A promise that resolves when the database is ready
 */
async function initDatabase() {
  try {
    // Test the connection to the API
    const response = await fetch(`${getApiBaseUrl()}/npcs`);
    if (!response.ok) {
      throw new Error(`API connection failed: ${response.statusText}`);
    }
    console.log('API database connection established');
    return true;
  } catch (error) {
    console.error('Error connecting to API:', error);
    window.app.showNotification(
      'Erreur de connexion à l\'API. Vérifiez que le serveur est en cours d\'exécution et que le port est correct.',
      'error'
    );
    return false;
  }
}

/**
 * Add an item to a store
 * @param {string} storeName - The name of the store
 * @param {Object} item - The item to add
 * @returns {Promise} A promise that resolves with the ID of the added item
 */
async function addItem(storeName, item) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/${storeName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add item');
    }

    const newItem = await response.json();

    // Update cache
    if (cache[storeName]) {
      cache[storeName].push(newItem);
    }

    return newItem.id;
  } catch (error) {
    console.error(`Error adding item to ${storeName}:`, error);
    throw error;
  }
}

/**
 * Get an item from a store by ID
 * @param {string} storeName - The name of the store
 * @param {string} id - The ID of the item
 * @returns {Promise} A promise that resolves with the item
 */
async function getItem(storeName, id) {
  try {
    // Check cache first
    if (cache[storeName]) {
      const cachedItem = cache[storeName].find(item => item.id === id);
      if (cachedItem) {
        return cachedItem;
      }
    }

    const response = await fetch(`${getApiBaseUrl()}/${storeName}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get item');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error getting item from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Get all items from a store
 * @param {string} storeName - The name of the store
 * @returns {Promise} A promise that resolves with an array of items
 */
async function getAllItems(storeName) {
  try {
    // Use cache if available
    if (cache[storeName]) {
      return [...cache[storeName]];
    }

    const response = await fetch(`${getApiBaseUrl()}/${storeName}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get items');
    }

    const items = await response.json();

    // Update cache
    cache[storeName] = items;

    return items;
  } catch (error) {
    console.error(`Error getting all items from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Update an item in a store
 * @param {string} storeName - The name of the store
 * @param {Object} item - The item to update
 * @returns {Promise} A promise that resolves when the item is updated
 */
async function updateItem(storeName, item) {
  try {
    if (!item.id) {
      throw new Error('Item must have an ID');
    }

    const response = await fetch(`${getApiBaseUrl()}/${storeName}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    const updatedItem = await response.json();

    // Update cache
    if (cache[storeName]) {
      const index = cache[storeName].findIndex(i => i.id === item.id);
      if (index !== -1) {
        cache[storeName][index] = updatedItem;
      }
    }

    return updatedItem;
  } catch (error) {
    console.error(`Error updating item in ${storeName}:`, error);
    throw error;
  }
}

/**
 * Delete an item from a store
 * @param {string} storeName - The name of the store
 * @param {string} id - The ID of the item to delete
 * @returns {Promise} A promise that resolves when the item is deleted
 */
async function deleteItem(storeName, id) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/${storeName}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }

    // Update cache
    if (cache[storeName]) {
      cache[storeName] = cache[storeName].filter(item => item.id !== id);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting item from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Clear the cache for a specific store or all stores
 * @param {string} [storeName] - The name of the store to clear (if omitted, clears all stores)
 */
function clearCache(storeName) {
  if (storeName) {
    cache[storeName] = null;
  } else {
    Object.keys(cache).forEach(store => {
      cache[store] = null;
    });
  }
}


// Export database functions for use in other modules
window.db = {
  init: initDatabase,
  add: addItem,
  get: getItem,
  getAll: getAllItems,
  update: updateItem,
  delete: deleteItem,
  clearCache: clearCache,
  getApiPort: getApiPort,
  setApiPort: setApiPort
};
