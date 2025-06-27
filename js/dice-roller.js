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
    diceRoller.className = 'dice-roller closed';

    // Create the toggle button (D20 shape)
    const toggleButton = document.createElement('div');
    toggleButton.className = 'dice-toggle';
    toggleButton.innerHTML = `
        <div class="dice d20">
            <span>D20</span>
        </div>
    `;

    // Create the dice panel
    const dicePanel = document.createElement('div');
    dicePanel.className = 'dice-panel';

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'dice-close';
    closeButton.innerHTML = '&times;';
    dicePanel.appendChild(closeButton);

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
    const closeButton = diceRoller.querySelector('.dice-close');
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

    // Close button
    closeButton.addEventListener('click', () => {
        diceRoller.classList.add('closed');
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

        // Update results if visible
        const resultsArea = diceRoller.querySelector('.dice-results');
        if (resultsArea && resultsArea.innerHTML) {
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
}

/**
 * Roll the dice and display results
 */
function rollDice() {
    const diceButtons = document.querySelectorAll('.dice-button');
    const resultsArea = document.querySelector('.dice-results');

    // Clear previous results
    resultsArea.innerHTML = '';

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
    }
}

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} The result of the roll
 */
function rollDie(sides) {
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
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
