/**
 * Starfisher - Dice Roller Module
 * Provides a floating dice roller interface for the application
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the dice roller
    initDiceRoller();
});

/**
 * Initialize the dice roller
 */
function initDiceRoller() {
    // Create the dice roller elements
    createDiceRollerElements();

    // Set up event listeners
    setupDiceRollerEvents();
}

/**
 * Create the dice roller HTML elements
 */
function createDiceRollerElements() {
    // Create the main container
    const diceRoller = document.createElement('div');
    diceRoller.id = 'dice-roller';
    diceRoller.className = 'dice-roller closed right-positioned'; // Add right-positioned class by default

    // Create the toggle button (D20 shape)
    const toggleButton = document.createElement('div');
    toggleButton.className = 'dice-toggle';
    toggleButton.innerHTML = `
        <div class="dice d20">
            <span data-i18n="dice_toggle">${window.i18n ? window.i18n.t('dice_toggle') : 'Dés'}</span>
        </div>
    `;

    // Create the dice panel
    const dicePanel = document.createElement('div');
    dicePanel.className = 'dice-panel';

    // Create dice buttons
    const diceTypes = [4, 6, 8, 10, 12, 20, 100];
    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';

    diceTypes.forEach(type => {
        const diceButton = document.createElement('div');
        diceButton.className = `dice-button d${type}`;
        diceButton.setAttribute('data-dice', type);

        // Create the die shape
        const dieShape = document.createElement('div');
        dieShape.className = `dice d${type}`;
        dieShape.innerHTML = `<span>D${type}</span>`;

        // Create counter reset button
        const resetButton = document.createElement('span');
        resetButton.className = 'dice-reset';
        resetButton.innerHTML = '&times;';
        resetButton.setAttribute('data-dice', type);

        // Create counter
        const counter = document.createElement('span');
        counter.className = 'dice-counter';
        counter.setAttribute('data-dice', type);
        counter.textContent = '0';

        diceButton.appendChild(dieShape);
        diceButton.appendChild(resetButton);
        diceButton.appendChild(counter);
        diceContainer.appendChild(diceButton);
    });

    dicePanel.appendChild(diceContainer);

    // Create roll button
    const rollButton = document.createElement('button');
    rollButton.className = 'btn dice-roll-btn';
    rollButton.textContent = window.i18n ? window.i18n.t('roll_button') : 'Lancer';
    rollButton.setAttribute('data-i18n', 'roll_button');
    dicePanel.appendChild(rollButton);

    // Create results area
    const resultsArea = document.createElement('div');
    resultsArea.className = 'dice-results';
    dicePanel.appendChild(resultsArea);

    // Add elements to the main container
    diceRoller.appendChild(toggleButton);
    diceRoller.appendChild(dicePanel);

    // Add the dice roller to the document
    document.body.appendChild(diceRoller);
}

/**
 * Set up event listeners for the dice roller
 */
function setupDiceRollerEvents() {
    const diceRoller = document.getElementById('dice-roller');
    const toggleButton = diceRoller.querySelector('.dice-toggle');
    const diceButtons = diceRoller.querySelectorAll('.dice-button');
    const resetButtons = diceRoller.querySelectorAll('.dice-reset');
    const rollButton = diceRoller.querySelector('.dice-roll-btn');

    // Toggle open/close
    toggleButton.addEventListener('click', () => {
        diceRoller.classList.toggle('closed');

        // Reset all counters when opening
        if (!diceRoller.classList.contains('closed')) {
            resetAllCounters();
        }
    });

    // Dice buttons (increment counters)
    diceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Ignore clicks on reset button
            if (e.target.classList.contains('dice-reset') || e.target.closest('.dice-reset')) {
                return;
            }

            const diceType = button.getAttribute('data-dice');
            const counter = button.querySelector(`.dice-counter[data-dice="${diceType}"]`);
            let count = parseInt(counter.textContent);
            count++;
            counter.textContent = count;

            // Show counter if greater than 0
            if (count > 0) {
                counter.classList.add('visible');
            }
        });
    });

    // Reset buttons
    resetButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const diceType = button.getAttribute('data-dice');
            resetCounter(diceType);
        });
    });

    // Roll button
    rollButton.addEventListener('click', rollDice);

    // Make the dice roller draggable
    makeDraggable(diceRoller, toggleButton);

    // Listen for language changes to update the text
    document.addEventListener('languageChanged', () => {
        // Update roll button text
        rollButton.textContent = window.i18n.t('roll_button');

        // Update toggle button text
        const toggleText = toggleButton.querySelector('[data-i18n="dice_toggle"]');
        if (toggleText) {
            toggleText.textContent = window.i18n.t('dice_toggle');
        }

        // Update results if visible
        const resultsArea = diceRoller.querySelector('.dice-results');
        if (resultsArea && resultsArea.classList.contains('visible')) {
            // Re-roll to update the results text
            rollDice();
        }
    });
}

/**
 * Reset a specific dice counter
 * @param {string} diceType - The type of dice to reset
 */
function resetCounter(diceType) {
    const counter = document.querySelector(`.dice-counter[data-dice="${diceType}"]`);
    counter.textContent = '0';
    counter.classList.remove('visible');
}

/**
 * Reset all dice counters
 */
function resetAllCounters() {
    const counters = document.querySelectorAll('.dice-counter');
    counters.forEach(counter => {
        counter.textContent = '0';
        counter.classList.remove('visible');
    });

    // Clear results
    const resultsArea = document.querySelector('.dice-results');
    resultsArea.innerHTML = '';
    resultsArea.classList.remove('visible');
}

/**
 * Roll the dice and display results
 */
function rollDice() {
    const diceButtons = document.querySelectorAll('.dice-button');
    const resultsArea = document.querySelector('.dice-results');

    // Clear previous results
    resultsArea.innerHTML = '';
    resultsArea.classList.remove('visible');

    let totalRolls = 0;
    let totalResult = 0;
    let resultDetails = [];

    // Roll each type of dice
    diceButtons.forEach(button => {
        const diceType = button.getAttribute('data-dice');
        const counter = button.querySelector(`.dice-counter[data-dice="${diceType}"]`);
        const count = parseInt(counter.textContent);

        if (count > 0) {
            const diceResults = [];

            // Roll the dice
            for (let i = 0; i < count; i++) {
                const result = rollDie(parseInt(diceType));
                diceResults.push(result);
                totalResult += result;
            }

            totalRolls += count;
            resultDetails.push({
                type: diceType,
                count: count,
                results: diceResults
            });
        }
    });

    // Display results
    if (totalRolls > 0) {
        const resultsTitle = window.i18n ? window.i18n.t('dice_results') : 'Résultats';
        const totalLabel = window.i18n ? window.i18n.t('dice_total') : 'Total';

        let resultHTML = `<h3 data-i18n="dice_results">${resultsTitle}</h3>`;

        // Show detailed results
        resultDetails.forEach(detail => {
            resultHTML += `<div class="dice-result-group">`;
            resultHTML += `<span class="dice-result-label">${detail.count}D${detail.type}: </span>`;
            resultHTML += `<span class="dice-result-values">${detail.results.join(', ')}</span>`;
            resultHTML += `</div>`;
        });

        // Show total
        resultHTML += `<div class="dice-result-total" data-i18n-prefix="dice_total">${totalLabel}: ${totalResult}</div>`;

        resultsArea.innerHTML = resultHTML;
        resultsArea.classList.add('visible');
    }
}

/**
 * Roll a single die with improved randomness using Crypto API
 * @param {number} sides - Number of sides on the die
 * @returns {number} The result of the roll
 */
function rollDie(sides) {
    // Use Crypto API for better randomness if available
    if (window.crypto && window.crypto.getRandomValues) {
        // Create a new Uint32Array with one element
        const randomBuffer = new Uint32Array(1);

        // Fill the array with a random value
        window.crypto.getRandomValues(randomBuffer);

        // Get a random number between 0 and 1 with better distribution
        const randomValue = randomBuffer[0] / (0xFFFFFFFF + 1);

        // Scale to the number of sides and add 1
        return Math.floor(randomValue * sides) + 1;
    } 

    // Fallback to Math.random() if Crypto API is not available
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Make an element draggable
 * @param {HTMLElement} element - The element to make draggable
 * @param {HTMLElement} handle - The element to use as a drag handle
 */
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";

        // Update positioning class based on position
        updatePositioningClass(element);
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        // Update positioning class after drag ends
        updatePositioningClass(element);
    }

    // Initial positioning class update
    updatePositioningClass(element);
}

/**
 * Update the positioning class of the dice-roller based on its position on the screen
 * @param {HTMLElement} element - The dice-roller element
 */
function updatePositioningClass(element) {
    const windowWidth = window.innerWidth;
    const elementRect = element.getBoundingClientRect();
    const elementCenterX = elementRect.left + elementRect.width / 2;

    // If the element is on the left half of the screen, add left-positioned class
    // Otherwise, add right-positioned class
    if (elementCenterX < windowWidth / 2) {
        element.classList.remove('right-positioned');
        element.classList.add('left-positioned');
    } else {
        element.classList.remove('left-positioned');
        element.classList.add('right-positioned');
    }
}

/**
 * Roll attack and damage dice
 * @param {string|number} attackModifier - The attack modifier to add to the D20 roll
 * @param {string} damageNotation - The damage dice notation (e.g., "D10", "2D6+3")
 * @returns {Object} An object containing the formatted result string, attack roll value, and damage roll value
 */
function rollAttackAndDamage(attackModifier, damageNotation) {
    // Convert attackModifier to a number (default to 0 if not provided or invalid)
    const modifier = parseInt(attackModifier) || 0;

    // Roll D20 for attack
    const attackDieResult = rollDie(20);
    const attackRoll = attackDieResult + modifier;

    // Parse and roll damage dice
    const damageRoll = rollDamage(damageNotation);

    // Format the result string
    const resultString = `Attack: ${attackDieResult} + ${modifier} = ${attackRoll}, Damage: ${damageRoll.details} = ${damageRoll.total}`;

    return {
        resultString: resultString,
        attackRoll: attackRoll,
        damageRoll: damageRoll.total
    };
}

/**
 * Roll damage dice based on notation
 * @param {string} notation - The dice notation (e.g., "D10", "2D6+3", "2D10 + 2D6 + 8")
 * @returns {Object} An object containing the total damage and details of the roll
 */
function rollDamage(notation) {
    if (!notation) {
        return { total: 0, details: "No damage" };
    }

    // Normalize the notation by removing spaces
    const normalizedNotation = notation.replace(/\s+/g, '');

    // Split the notation into dice groups (e.g., "2D6+3+1D8" -> ["2D6+3", "1D8"])
    const diceGroups = normalizedNotation.split(/(?=[+\-])/g).map(group => {
        // If the group starts with + or -, remove it for processing but keep track of the sign
        const sign = group.startsWith('-') ? -1 : 1;
        const diceGroup = group.replace(/^[+\-]/, '');
        return { group: diceGroup, sign: sign };
    });

    let totalDamage = 0;
    let rollDetails = [];

    // Process each dice group
    diceGroups.forEach(({ group, sign }) => {
        // Check if it's a static modifier (e.g., "+5")
        if (/^\d+$/.test(group)) {
            const modifier = parseInt(group);
            totalDamage += sign * modifier;
            rollDetails.push(sign > 0 ? `+${modifier}` : `${sign * modifier}`);
            return;
        }

        // Parse dice notation (e.g., "2D6" or "D10+3")
        const diceParts = group.split(/[dD]/);
        const numDice = diceParts[0] ? parseInt(diceParts[0]) : 1;

        // Check if there's a modifier after the dice (e.g., "D10+3")
        const modifierMatch = diceParts[1].match(/^(\d+)([\+\-]\d+)?$/);
        if (!modifierMatch) return;

        const sides = parseInt(modifierMatch[1]);
        const diceModifier = modifierMatch[2] ? parseInt(modifierMatch[2]) : 0;

        // Roll the dice
        const diceResults = [];
        let diceTotal = 0;
        for (let i = 0; i < numDice; i++) {
            const result = rollDie(sides);
            diceResults.push(result);
            diceTotal += result;
        }

        // Add the modifier
        diceTotal += diceModifier;

        // Apply the sign
        totalDamage += sign * diceTotal;

        // Format the roll details
        let groupDetails = `${sign > 0 && rollDetails.length > 0 ? '+' : ''}${sign < 0 ? '-' : ''}${numDice}D${sides}[${diceResults.join(', ')}]`;
        if (diceModifier !== 0) {
            groupDetails += `${diceModifier > 0 ? '+' : ''}${diceModifier}`;
        }
        rollDetails.push(groupDetails);
    });

    return {
        total: totalDamage,
        details: rollDetails.join(' ')
    };
}

// Export functions for use in other modules
window.diceRoller = {
    rollDie,
    rollDice,
    rollAttackAndDamage,
    rollDamage
};
