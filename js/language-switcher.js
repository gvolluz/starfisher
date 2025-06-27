/**
 * Starfisher - Language Switcher Module
 * Provides a UI for switching between languages
 */

// Add a global variable to track if the language switcher has been created
let languageSwitcherCreated = false;

// Function to create the language switcher if it hasn't been created yet
function ensureLanguageSwitcherExists() {
    if (!languageSwitcherCreated) {
        console.log('Ensuring language switcher exists...');
        createLanguageSwitcher();
        languageSwitcherCreated = true;
    }
}

// Create the language switcher when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    setTimeout(() => {
        console.log('Creating language switcher after DOMContentLoaded with delay');
        ensureLanguageSwitcherExists();
    }, 100);
});

// Fallback: If the DOMContentLoaded event has already fired, create the language switcher now
if (document.readyState === 'loading') {
    console.log('Document is still loading, waiting for DOMContentLoaded event');
} else {
    console.log('Document already loaded, creating language switcher immediately');
    setTimeout(() => {
        console.log('Creating language switcher immediately with delay');
        ensureLanguageSwitcherExists();
    }, 100);
}

// Add a global function to manually create the language switcher
window.createLanguageSwitcherManually = function() {
    console.log('Creating language switcher manually');
    ensureLanguageSwitcherExists();

    // Force creation of language switcher directly in the DOM if it still doesn't exist
    setTimeout(() => {
        if (!document.querySelector('.language-switcher')) {
            console.log('Language switcher still not found in DOM, forcing creation');
            forceCreateLanguageSwitcher();
        }
    }, 200);
};

// Function to force creation of language switcher directly in the DOM
function forceCreateLanguageSwitcher() {
    try {
        console.log('Force creating language switcher directly in DOM');

        // Create the language switcher container
        const languageSwitcher = document.createElement('div');
        languageSwitcher.className = 'language-switcher';
        languageSwitcher.id = 'language-switcher-container';
        languageSwitcher.style.position = 'absolute';
        languageSwitcher.style.top = '10px';
        languageSwitcher.style.right = '20px';
        languageSwitcher.style.zIndex = '1000';

        // Create a simple button for each language
        const languages = [
            { code: 'fr', name: 'Français', country: 'fr' },
            { code: 'en', name: 'English', country: 'gb' },
            { code: 'es', name: 'Español', country: 'es' },
            { code: 'de', name: 'Deutsch', country: 'de' }
        ];

        languages.forEach(lang => {
            const button = document.createElement('button');
            button.textContent = lang.code.toUpperCase();
            button.title = lang.name;
            button.style.margin = '0 5px';
            button.style.padding = '5px 8px';
            button.style.backgroundColor = lang.code === (window.i18n ? window.i18n.getLanguage() : 'fr') ? '#3498db' : 'rgba(255, 255, 255, 0.1)';
            button.style.color = 'white';
            button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.fontWeight = 'bold';
            button.style.minWidth = '40px';
            button.style.textAlign = 'center';

            button.addEventListener('click', () => {
                if (window.i18n && window.i18n.setLanguage) {
                    // Show loading state
                    button.disabled = true;
                    button.style.opacity = '0.7';
                    button.style.cursor = 'wait';

                    // Change language
                    window.i18n.setLanguage(lang.code)
                        .then(() => {
                            // Update all button styles
                            languageSwitcher.querySelectorAll('button').forEach(btn => {
                                btn.disabled = false;
                                btn.style.opacity = '1';
                                btn.style.cursor = 'pointer';
                                btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            });
                            // Highlight the selected language
                            button.style.backgroundColor = '#3498db';

                            console.log(`Language changed to ${lang.code}`);
                        })
                        .catch(error => {
                            console.error(`Error changing language to ${lang.code}:`, error);
                            // Reset button state
                            button.disabled = false;
                            button.style.opacity = '1';
                            button.style.cursor = 'pointer';
                        });
                }
            });

            languageSwitcher.appendChild(button);
        });

        // Add to header or body
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(languageSwitcher);
            console.log('Force added language switcher to header');
        } else {
            document.body.appendChild(languageSwitcher);
            console.log('Force added language switcher to body');
        }
    } catch (error) {
        console.error('Error force creating language switcher:', error);
    }
}

/**
 * Create the language switcher UI
 */
function createLanguageSwitcher() {
    try {
        console.log('Creating language switcher...');

        // Create the language switcher container
        const languageSwitcher = document.createElement('div');
        languageSwitcher.className = 'language-switcher';

        // Add a unique ID for easier debugging
        languageSwitcher.id = 'language-switcher-container';

        console.log('Language switcher container created');

        // Initially create the switcher with available languages
        updateLanguageSwitcher(languageSwitcher);
        console.log('Language switcher updated with available languages');

        // Add the language switcher to the header
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(languageSwitcher);
            console.log('Language switcher added to header');
        } else {
            console.error('Header element not found in the DOM');
            // Try to add it to the body as a fallback
            document.body.appendChild(languageSwitcher);
            console.log('Language switcher added to body as fallback');
        }

        // Add styles
        addLanguageSwitcherStyles();
        console.log('Language switcher styles added');

        // Highlight the current language
        updateActiveLanguage();
        console.log('Active language updated');

        // Listen for language changes
        document.addEventListener('languageChanged', updateActiveLanguage);
        console.log('Added event listener for language changes');

        // Listen for languages discovered event
        document.addEventListener('languagesDiscovered', (event) => {
            console.log('Languages discovered event received', event.detail.languages);
            updateLanguageSwitcher(languageSwitcher, event.detail.languages);
            updateActiveLanguage();
        });
        console.log('Added event listener for languages discovered event');

        console.log('Language switcher creation completed');
    } catch (error) {
        console.error('Error creating language switcher:', error);
    }
}

/**
 * Update the language switcher with available languages
 * @param {HTMLElement} container - The language switcher container
 * @param {Array} languages - Array of language objects (optional)
 */
function updateLanguageSwitcher(container, languages) {
    if (!container) {
        console.error('Language switcher container is null or undefined');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Get available languages from i18n if not provided
    let availableLanguages;
    try {
        availableLanguages = languages || (window.i18n && window.i18n.getAvailableLanguages 
            ? window.i18n.getAvailableLanguages() 
            : [
                { code: 'fr', name: 'Français', country: 'fr' },
                { code: 'en', name: 'English', country: 'gb' }
            ]);
    } catch (error) {
        console.error('Error getting available languages:', error);
        availableLanguages = [
            { code: 'fr', name: 'Français', country: 'fr' },
            { code: 'en', name: 'English', country: 'gb' }
        ];
    }

    // Get current language
    let currentLang;
    try {
        currentLang = window.i18n ? window.i18n.getLanguage() : 'fr';
    } catch (error) {
        console.error('Error getting current language:', error);
        currentLang = 'fr';
    }
    const currentLangObj = availableLanguages.find(lang => lang.code === currentLang) || availableLanguages[0];

    // Create the main dropdown button (shows current language)
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'lang-dropdown-button';
    dropdownButton.setAttribute('aria-haspopup', 'true');
    dropdownButton.setAttribute('aria-expanded', 'false');

    // Add flag image for current language
    const currentFlag = document.createElement('span');
    currentFlag.className = 'flag';

    const currentFlagImg = document.createElement('img');
    currentFlagImg.src = `https://flagcdn.com/16x12/${currentLangObj.country.toLowerCase()}.png`;
    currentFlagImg.alt = currentLangObj.code;
    currentFlagImg.width = 16;
    currentFlagImg.height = 12;
    currentFlag.appendChild(currentFlagImg);

    dropdownButton.appendChild(currentFlag);

    // Add language code for current language
    const currentCode = document.createElement('span');
    currentCode.className = 'lang-code';
    currentCode.textContent = currentLangObj.code.toUpperCase();
    dropdownButton.appendChild(currentCode);

    // Add dropdown arrow
    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    arrow.innerHTML = '&#9662;'; // Down triangle
    dropdownButton.appendChild(arrow);

    // Create dropdown menu container
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'lang-dropdown-menu';
    dropdownMenu.setAttribute('aria-hidden', 'true');

    // Create language options in dropdown
    availableLanguages.forEach(lang => {
        const langOption = document.createElement('button');
        langOption.className = 'lang-option';
        langOption.setAttribute('data-lang', lang.code);
        langOption.title = lang.name;

        // Add flag image
        const flag = document.createElement('span');
        flag.className = 'flag';

        const flagImg = document.createElement('img');
        flagImg.src = `https://flagcdn.com/16x12/${lang.country.toLowerCase()}.png`;
        flagImg.alt = lang.code;
        flagImg.width = 16;
        flagImg.height = 12;
        flag.appendChild(flagImg);

        langOption.appendChild(flag);

        // Add language code
        const code = document.createElement('span');
        code.className = 'lang-code';
        code.textContent = lang.code.toUpperCase();
        langOption.appendChild(code);

        // Add click event to switch language
        langOption.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from bubbling to document
            switchLanguage(lang.code);
            toggleDropdown(false); // Close dropdown after selection
        });

        // Highlight current language in dropdown
        if (lang.code === currentLang) {
            langOption.classList.add('active');
        }

        dropdownMenu.appendChild(langOption);
    });

    // Toggle dropdown when button is clicked
    dropdownButton.addEventListener('click', () => {
        toggleDropdown();
    });

    // Add components to container
    container.appendChild(dropdownButton);
    container.appendChild(dropdownMenu);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            toggleDropdown(false);
        }
    });
}

/**
 * Toggle the language dropdown menu
 * @param {boolean} [force] - Force open (true) or closed (false)
 */
function toggleDropdown(force) {
    const container = document.querySelector('.language-switcher');
    if (!container) {
        console.error('Language switcher container not found');
        return;
    }

    const button = container.querySelector('.lang-dropdown-button');
    const menu = container.querySelector('.lang-dropdown-menu');

    if (!button || !menu) {
        console.error('Language switcher button or menu not found');
        return;
    }

    const isOpen = menu.classList.contains('show');
    const shouldOpen = force !== undefined ? force : !isOpen;

    if (shouldOpen) {
        menu.classList.add('show');
        button.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
    } else {
        menu.classList.remove('show');
        button.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Switch to a different language
 * @param {string} langCode - The language code to switch to
 */
async function switchLanguage(langCode) {
    if (window.i18n && window.i18n.setLanguage) {
        try {
            // Show loading indicator or disable button if needed
            const button = document.querySelector(`.lang-button[data-lang="${langCode}"]`);
            if (button) {
                button.disabled = true;
            }

            // Change the language (this now handles saving to localStorage)
            await window.i18n.setLanguage(langCode);

            // Update the active language button
            updateActiveLanguage();
        } catch (error) {
            console.error(`Failed to switch to language ${langCode}:`, error);
        } finally {
            // Re-enable button
            const button = document.querySelector(`.lang-button[data-lang="${langCode}"]`);
            if (button) {
                button.disabled = false;
            }
        }
    }
}

/**
 * Update the active language button and dropdown
 */
function updateActiveLanguage() {
    try {
        console.log('Updating active language...');

        let currentLang;
        try {
            currentLang = window.i18n ? window.i18n.getLanguage() : 'fr';
            console.log('Current language:', currentLang);
        } catch (error) {
            console.error('Error getting current language:', error);
            currentLang = 'fr';
        }

        // Try to find the language switcher container by ID first, then by class
        let container = document.getElementById('language-switcher-container');
        if (!container) {
            container = document.querySelector('.language-switcher');
        }

        if (!container) {
            console.error('Language switcher container not found');
            return;
        }

        console.log('Language switcher container found');

        // Update dropdown button to show current language
        let availableLanguages;
        try {
            availableLanguages = window.i18n && window.i18n.getAvailableLanguages 
                ? window.i18n.getAvailableLanguages() 
                : [
                    { code: 'fr', name: 'Français', country: 'fr' },
                    { code: 'en', name: 'English', country: 'gb' }
                ];
            console.log('Available languages:', availableLanguages);
        } catch (error) {
            console.error('Error getting available languages:', error);
            availableLanguages = [
                { code: 'fr', name: 'Français', country: 'fr' },
                { code: 'en', name: 'English', country: 'gb' }
            ];
        }

        const currentLangObj = availableLanguages.find(lang => lang.code === currentLang) || availableLanguages[0];
        console.log('Current language object:', currentLangObj);

        // Update dropdown button content
        const dropdownButton = container.querySelector('.lang-dropdown-button');
        if (dropdownButton) {
            console.log('Dropdown button found');

            const flagImg = dropdownButton.querySelector('.flag img');
            if (flagImg) {
                flagImg.src = `https://flagcdn.com/16x12/${currentLangObj.country.toLowerCase()}.png`;
                flagImg.alt = currentLangObj.code;
                console.log('Flag image updated');
            } else {
                console.error('Flag image not found in dropdown button');
            }

            const langCode = dropdownButton.querySelector('.lang-code');
            if (langCode) {
                langCode.textContent = currentLangObj.code.toUpperCase();
                console.log('Language code updated');
            } else {
                console.error('Language code element not found in dropdown button');
            }
        } else {
            console.error('Dropdown button not found in language switcher container');
        }

        // Update active class in dropdown options
        const options = container.querySelectorAll('.lang-option');
        if (options.length > 0) {
            console.log('Found', options.length, 'language options');
            options.forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-lang') === currentLang) {
                    option.classList.add('active');
                    console.log('Set active class on option:', option.getAttribute('data-lang'));
                }
            });
        } else {
            console.error('No language options found in dropdown menu');
        }

        console.log('Active language update completed');
    } catch (error) {
        console.error('Error updating active language:', error);
    }
}

/**
 * Add styles for the language switcher
 */
function addLanguageSwitcherStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .language-switcher {
            position: absolute;
            top: 10px;
            right: 20px;
            z-index: 1000;
        }

        .lang-dropdown-button {
            display: flex;
            align-items: center;
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            color: white;
            padding: 5px 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .lang-dropdown-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .dropdown-arrow {
            margin-left: 5px;
            font-size: 0.8em;
            transition: transform 0.2s;
        }

        .lang-dropdown-button[aria-expanded="true"] .dropdown-arrow {
            transform: rotate(180deg);
        }

        .lang-dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 5px;
            background-color: var(--dark-bg);
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            min-width: 120px;
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        .lang-dropdown-menu.show {
            display: flex;
        }

        .lang-option {
            display: flex;
            align-items: center;
            background: none;
            border: none;
            color: white;
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s;
            text-align: left;
        }

        .lang-option:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .lang-option.active {
            background-color: var(--secondary-color);
        }

        .lang-option:disabled {
            opacity: 0.6;
            cursor: wait;
        }

        .flag {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 5px;
            width: 16px;
            height: 12px;
            overflow: hidden;
            border-radius: 2px;
        }

        .flag img {
            display: block;
            max-width: 100%;
            height: auto;
        }

        .lang-code {
            font-size: 0.8em;
            font-weight: bold;
        }

        @media (max-width: 768px) {
            .language-switcher {
                position: static;
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }

            .lang-dropdown-menu {
                position: absolute;
                left: 50%;
                right: auto;
                transform: translateX(-50%);
            }
        }
    `;

    document.head.appendChild(style);
}
