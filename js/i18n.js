/**
 * Starfisher - Internationalization Module
 * Provides translation functionality for the application
 */

// Default language
let currentLanguage = 'fr';

// Translation dictionaries
const translations = {};

// Supported languages and their file paths
let languageFiles = {};

// Default language names and country codes (fallbacks)
const defaultLanguageNames = {
    'fr': 'Français',
    'en': 'English',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어'
};

// Default country codes (fallbacks)
const defaultLanguageToCountry = {
    'fr': 'fr',
    'en': 'gb',
    'es': 'es',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'ru': 'ru',
    'zh': 'cn',
    'ja': 'jp',
    'ko': 'kr'
};

/**
 * Get a translation for a key in the current language
 * @param {string} key - The translation key
 * @returns {string} The translated text
 */
function t(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }

    // Fallback to French if the key doesn't exist in the current language
    if (translations['fr'] && translations['fr'][key]) {
        return translations['fr'][key];
    }

    // Return the key itself if no translation is found
    return key;
}

/**
 * Change the current language
 * @param {string} lang - The language code ('fr' or 'en')
 * @returns {Promise} A promise that resolves when the language is changed
 */
async function setLanguage(lang) {
    if (!languageFiles[lang]) {
        console.error(`Language not supported: ${lang}`);
        return Promise.reject(`Language not supported: ${lang}`);
    }

    // Check if translations for this language are already loaded
    if (Object.keys(translations[lang]).length === 0) {
        // If not loaded yet, try to load them
        try {
            await loadTranslations(lang);
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
            // Continue anyway to allow fallback to work
        }
    }

    currentLanguage = lang;
    updatePageTranslations();

    // Save the language preference
    localStorage.setItem('language', lang);

    return Promise.resolve();
}

/**
 * Get the current language
 * @returns {string} The current language code
 */
function getLanguage() {
    return currentLanguage;
}

/**
 * Update all translations on the page
 */
function updatePageTranslations() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });

    // Update elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });

    // Update elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });

    // Trigger a custom event so that dynamically created elements can update their translations
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
}

/**
 * Load translations for a specific language
 * @param {string} lang - The language code
 * @returns {Promise} A promise that resolves when translations are loaded
 */
async function loadTranslations(lang) {
    if (!languageFiles[lang]) {
        console.error(`No translation file defined for language: ${lang}`);
        return Promise.reject(`No translation file defined for language: ${lang}`);
    }

    try {
        const response = await fetch(languageFiles[lang]);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${lang}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        translations[lang] = data;
        console.log(`Translations loaded for ${lang}`);
        return data;
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);
        return Promise.reject(error);
    }
}

/**
 * Discover available language files in the i18n directory
 * @returns {Promise} A promise that resolves with an array of language codes
 */
async function discoverLanguageFiles() {
    try {
        // Fetch the list of files in the i18n directory
        const response = await fetch('i18n/');

        // If we can't access the directory listing, try to detect languages by attempting to load known files
        if (!response.ok) {
            console.log('Directory listing not available, trying to detect languages by loading known files');
            return detectLanguagesByLoading();
        }

        const html = await response.text();

        // Parse the HTML to extract filenames
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');

        // Extract language codes from filenames (e.g., "en.json" -> "en")
        const langCodes = [];
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.json')) {
                const langCode = href.replace('.json', '');
                if (langCode.length >= 2 && langCode.length <= 5) { // Valid ISO language codes
                    langCodes.push(langCode);
                    languageFiles[langCode] = `i18n/${href}`;
                }
            }
        });

        console.log('Discovered language files:', langCodes);
        return langCodes;
    } catch (error) {
        console.error('Error discovering language files:', error);
        return detectLanguagesByLoading();
    }
}

/**
 * Detect available languages by trying to load known language files
 * @returns {Promise} A promise that resolves with an array of language codes
 */
async function detectLanguagesByLoading() {
    // List of common language codes to try
    const commonLangs = Object.keys(defaultLanguageNames);
    const detectedLangs = [];

    // Try to load each language file
    for (const lang of commonLangs) {
        try {
            const response = await fetch(`i18n/${lang}.json`, { method: 'HEAD' });
            if (response.ok) {
                detectedLangs.push(lang);
                languageFiles[lang] = `i18n/${lang}.json`;
            }
        } catch (error) {
            // Ignore errors, just means the file doesn't exist
        }
    }

    // If no languages were detected, fall back to default languages
    if (detectedLangs.length === 0) {
        console.log('No languages detected, falling back to defaults');
        languageFiles = {
            'fr': 'i18n/fr.json',
            'en': 'i18n/en.json'
        };
        return ['fr', 'en'];
    }

    console.log('Detected languages:', detectedLangs);
    return detectedLangs;
}

/**
 * Get available languages
 * @returns {Array} An array of language objects with code, name, and country
 */
function getAvailableLanguages() {
    return Object.keys(languageFiles).map(langCode => {
        // Get language name and country code from translations if available
        const langName = translations[langCode] && translations[langCode].language_name 
            ? translations[langCode].language_name 
            : defaultLanguageNames[langCode] || langCode;

        const langCountry = translations[langCode] && translations[langCode].language_country 
            ? translations[langCode].language_country 
            : defaultLanguageToCountry[langCode] || langCode;

        return {
            code: langCode,
            name: langName,
            country: langCountry
        };
    });
}

/**
 * Initialize translations by loading all language files
 * @returns {Promise} A promise that resolves when all translations are loaded
 */
async function initTranslations() {
    try {
        // Discover available language files
        await discoverLanguageFiles();

        // Load translations for all discovered languages
        const promises = Object.keys(languageFiles).map(lang => 
            loadTranslations(lang).catch(error => {
                console.error(`Failed to load translations for ${lang}:`, error);
                // Return empty object for failed languages to avoid breaking the app
                return {};
            })
        );

        await Promise.all(promises);
        console.log('All translations loaded');

        // Dispatch an event to notify that languages have been discovered
        document.dispatchEvent(new CustomEvent('languagesDiscovered', { 
            detail: { languages: getAvailableLanguages() } 
        }));

        updatePageTranslations();
    } catch (error) {
        console.error('Error initializing translations:', error);
    }
}

// Initialize translations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && languageFiles[savedLanguage]) {
        currentLanguage = savedLanguage;
    }

    // Load translations and then update the page
    initTranslations().catch(error => {
        console.error('Failed to initialize translations:', error);
        // Even if loading fails, try to update the page with any translations that might be available
        updatePageTranslations();
    });
});

// Export functions for use in other modules
window.i18n = {
    t,
    setLanguage,
    getLanguage,
    loadTranslations,
    initTranslations,
    getAvailableLanguages
};
