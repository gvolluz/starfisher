/**
 * Starfisher - Server Configuration
 */

// Default configuration
const defaultConfig = {
  port: 3000,
  dbPath: './data/nedb'
};

// Try to load custom configuration from config.json if it exists
let customConfig = {};
try {
  customConfig = require('./config.json');
  console.log('Custom configuration loaded from config.json');
} catch (error) {
  console.log('No custom configuration found, using defaults');
}

// Merge default and custom configurations
const config = {
  ...defaultConfig,
  ...customConfig
};

module.exports = config;
