/**
 * Main Application Entry Point
 */
import { appState } from './state.js';
import { initManualMode } from './modes/manual.js';
import { initAIMode } from './modes/ai.js';
import { initHistoryMode } from './modes/history.js';
import { initSettings } from './settings/manager.js';
import { initPDFGenerator } from './pdf/generator.js';

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Modules
    initManualMode();
    initAIMode();
    initHistoryMode();
    initSettings();
    initPDFGenerator();

    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');
    const previewSection = document.getElementById('preview-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Toggle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;

            // View Toggle
            views.forEach(v => {
                if (v.id === `${target}-view`) v.classList.remove('hidden');
                else v.classList.add('hidden');
            });

            // Handle Global Mode State
            appState.state.currentMode = target; // Simplified, not persisting mode for now

            // Preview Section Visibility
            // Preview should be visible in Manual and AI, but hidden in History?
            // Requirement says "History stores files...". The layout shows preview at bottom.
            // Let's hide Preview section in History mode to be cleaner, or keep it?
            // "History" mode list takes up space. Let's hide preview in history.
            if (target === 'history') {
                previewSection.style.display = 'none';
            } else {
                previewSection.style.display = 'block';
            }
        });
    });

    // Check for "Logo" existence (Visual fix)
    const logoImg = document.querySelector('.app-logo');
    logoImg.onerror = function () {
        this.style.display = 'none';
        // Add a text fallback if needed, or just leave text header
    };

});
