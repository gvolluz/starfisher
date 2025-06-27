/**
 * Starfisher - List UI Module
 * Provides UI components for displaying and interacting with lists of NPCs and Combats
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the lists when the database is ready
    if (window.db) {
        try {
            await window.db.init();

            // Initialize Combat list first since it's the default page
            if (window.combatUI && window.combatUI.initCombatsList) {
                window.combatUI.initCombatsList();
            }

            // Initialize NPC list if the NPC UI module is available
            if (window.npcUI && window.npcUI.initNpcsList) {
                window.npcUI.initNpcsList();
            }

            // Add event listener for the "Add NPC" button
            const addNpcBtn = document.getElementById('add-npc-btn');
            if (addNpcBtn && window.npcUI && window.npcUI.showAddNpcForm) {
                addNpcBtn.addEventListener('click', window.npcUI.showAddNpcForm);
            }
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }
});

// Add event listeners to update lists when pages are shown
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to update lists when the page is shown
    const navLinks = document.querySelectorAll('.nav-links a, .btn[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetPageId = link.getAttribute('data-page');
            if (targetPageId === 'npcs') {
                // Update the NPCs list when the NPCs page is shown
                if (window.npcUI && window.npcUI.initNpcsList) {
                    window.npcUI.initNpcsList();
                }
            } else if (targetPageId === 'combats') {
                // Update the Combats list when the Combats page is shown
                if (window.combatUI && window.combatUI.initCombatsList) {
                    window.combatUI.initCombatsList();
                }
            }
        });
    });
});
