/**
 * This file handles the initialization of all Material Design Web Components
 */

function initializeMaterialComponents() {
    // Initialize all text fields
    const textFields = document.querySelectorAll('.mdc-text-field');
    textFields.forEach(textField => {
        mdc.textField.MDCTextField.attachTo(textField);
    });
    
    // Initialize all selects
    const selects = document.querySelectorAll('.mdc-select');
    selects.forEach(select => {
        select.MDCSelect = mdc.select.MDCSelect.attachTo(select);
    });
    
    // Initialize all buttons
    const buttons = document.querySelectorAll('.mdc-button');
    buttons.forEach(button => {
        mdc.ripple.MDCRipple.attachTo(button);
    });
    
    // Initialize all dialogs
    const dialogs = document.querySelectorAll('.mdc-dialog');
    dialogs.forEach(dialog => {
        dialog.MDCDialog = mdc.dialog.MDCDialog.attachTo(dialog);
    });
    
    // Initialize tab bar
    const tabBar = document.querySelector('.mdc-tab-bar');
    if (tabBar) {
        tabBar.MDCTabBar = mdc.tabBar.MDCTabBar.attachTo(tabBar);
    }
    
    // Initialize data tables
    const dataTables = document.querySelectorAll('.mdc-data-table');
    dataTables.forEach(dataTable => {
        mdc.dataTable.MDCDataTable.attachTo(dataTable);
    });
    
    // Initialize theme toggle
    initializeThemeToggle();
}

/**
 * Initialize the theme toggle functionality
 */
function initializeThemeToggle() {
    const themeToggleBtn = document.getElementById('toggle-theme-btn');
    
    if (themeToggleBtn) {
        // Check if user has a preferred theme
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Apply the theme on page load
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            themeToggleBtn.querySelector('.material-icons').textContent = 'light_mode';
        }
        
        // Add event listener for theme toggle
        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            const isDarkModeNow = document.body.classList.contains('dark-theme');
            localStorage.setItem('darkMode', isDarkModeNow);
            
            // Update icon
            themeToggleBtn.querySelector('.material-icons').textContent = 
                isDarkModeNow ? 'light_mode' : 'dark_mode';
            
            // Refresh charts if they exist
            if (typeof updateAllCharts === 'function') {
                updateAllCharts();
            }
        });
    }
}

/**
 * Initialize chart tabs
 */
function initializeChartTabs() {
    const tabBar = document.querySelector('.mdc-tab-bar');
    if (!tabBar) return;
    
    const chartContainers = document.querySelectorAll('.chart-container');
    
    // Set up tab click events
    const tabs = {
        'income-expense-tab': 'income-expense-chart-container',
        'expense-categories-tab': 'expense-categories-chart-container',
        'income-categories-tab': 'income-categories-chart-container',
        'trends-tab': 'trends-chart-container'
    };
    
    for (const [tabId, containerId] of Object.entries(tabs)) {
        const tab = document.getElementById(tabId);
        if (tab) {
            tab.addEventListener('click', function() {
                // Hide all chart containers
                chartContainers.forEach(container => {
                    container.classList.add('hidden');
                });
                
                // Show the selected chart container
                const selectedContainer = document.getElementById(containerId);
                if (selectedContainer) {
                    selectedContainer.classList.remove('hidden');
                    
                    // Refresh the chart if it exists
                    if (typeof window.charts !== 'undefined' && window.charts[containerId]) {
                        window.charts[containerId].update();
                    }
                }
            });
        }
    }
}
console.log("MaterialComponents.js loaded");
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    // initialization code...
});