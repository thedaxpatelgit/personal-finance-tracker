document.addEventListener('DOMContentLoaded', function() {
    // Define categories
    const categories = {
        income: [
            'Salary',
            'Freelance',
            'Investment',
            'Gift',
            'Refund',
            'Other Income'
        ],
        expense: [
            'Food & Dining',
            'Housing',
            'Transportation',
            'Utilities',
            'Entertainment',
            'Shopping',
            'Healthcare',
            'Education',
            'Personal Care',
            'Travel',
            'Gifts & Donations',
            'Other Expense'
        ]
    };
    
    // Initialize Material Components
    initializeMaterialComponents();
    
    // Initialize date field with today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Set up category dropdown based on transaction type
    const transactionTypeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('category');
    const filterCategorySelect = document.getElementById('filter-category');
    
    // Populate category dropdowns (both form and filters)
    function populateCategories(type, categoryElement) {
        // Clear existing options
        categoryElement.innerHTML = '';
        
        // Add new options based on type
        const categoryList = type === 'all' ? [...categories.income, ...categories.expense] : categories[type];
        
        categoryList.forEach(category => {
            const listItem = document.createElement('li');
            listItem.classList.add('mdc-list-item');
            listItem.dataset.value = category;
            
            const rippleSpan = document.createElement('span');
            rippleSpan.classList.add('mdc-list-item__ripple');
            
            const textSpan = document.createElement('span');
            textSpan.classList.add('mdc-list-item__text');
            textSpan.textContent = category;
            
            listItem.appendChild(rippleSpan);
            listItem.appendChild(textSpan);
            categoryElement.appendChild(listItem);
        });
        
        // Make sure to reinitialize the MDC select
        const select = categoryElement.closest('.mdc-select');
        if (select && select.MDCSelect) {
            select.MDCSelect.layoutOptions();
        }
    }
    
    // Initialize form categories (default to income)
    populateCategories('income', categorySelect);
    
    // Initialize filter categories (include all categories)
    populateAllCategories();
    
    // Function to populate all categories in the filter dropdown
    function populateAllCategories() {
        // Add all categories to the filter dropdown
        const allCategories = [...new Set([...categories.income, ...categories.expense])];
        
        // Clear existing options except the "All" option
        while (filterCategorySelect.children.length > 1) {
            filterCategorySelect.removeChild(filterCategorySelect.lastChild);
        }
        
        // Add categories
        allCategories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.classList.add('mdc-list-item');
            listItem.dataset.value = category;
            
            const rippleSpan = document.createElement('span');
            rippleSpan.classList.add('mdc-list-item__ripple');
            
            const textSpan = document.createElement('span');
            textSpan.classList.add('mdc-list-item__text');
            textSpan.textContent = category;
            
            listItem.appendChild(rippleSpan);
            listItem.appendChild(textSpan);
            filterCategorySelect.appendChild(listItem);
        });
        
        // Make sure to reinitialize the MDC select
        const select = filterCategorySelect.closest('.mdc-select');
        if (select && select.MDCSelect) {
            select.MDCSelect.layoutOptions();
        }
    }
    
    // Update categories when transaction type changes
    if (transactionTypeSelect) {
        transactionTypeSelect.addEventListener('MDCSelect:change', function(e) {
            const type = e.detail.value;
            populateCategories(type, categorySelect);
        });
    }
    
    // Load transactions when page loads
    loadTransactions();
    loadSummary();
    
    // Form submission handler
    const form = document.getElementById('transaction-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values from MDC components
            const titleField = document.getElementById('title');
            const amountField = document.getElementById('amount');
            const dateField = document.getElementById('date');
            
            const title = titleField.value;
            let amount = parseFloat(amountField.value);
            const transactionTypeSelect = document.querySelector('#transaction-type').closest('.mdc-select').MDCSelect;
            const categorySelect = document.querySelector('#category').closest('.mdc-select').MDCSelect;
            const transactionType = transactionTypeSelect.value;
            const category = categorySelect.value;
            const date = dateField.value;
            
            // Validate inputs
            if (!title || isNaN(amount) || !date) {
                showFormStatus('Please fill in all required fields', 'error');
                return;
            }
            
            // Convert amount to positive or negative based on transaction type
            if (transactionType === 'expense') {
                amount = -Math.abs(amount); // Ensure it's negative for expenses
            } else {
                amount = Math.abs(amount); // Ensure it's positive for income
            }
            
            // Create transaction object
            const transaction = {
                title: title,
                amount: amount,
                type: transactionType,
                category: category,
                date: date
            };
            
            // Send to backend
            saveTransaction(transaction);
        });
    }
    
    // Set up filter application
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            loadTransactions(getFilterParameters());
            loadSummary(getFilterParameters());
        });
    }
    
    // Set up filter clearing
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearFilters();
            loadTransactions();
            loadSummary();
        });
    }
    
    // Function to get current filter parameters
    function getFilterParameters() {
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const typeSelect = document.querySelector('#filter-type').closest('.mdc-select').MDCSelect;
        const categorySelect = document.querySelector('#filter-category').closest('.mdc-select').MDCSelect;
        
        return {
            start_date: startDate,
            end_date: endDate,
            type: typeSelect.value === 'all' ? '' : typeSelect.value,
            category: categorySelect.value === 'all' ? '' : categorySelect.value
        };
    }
    
    // Function to clear filters
    function clearFilters() {
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        
        const typeSelect = document.querySelector('#filter-type').closest('.mdc-select').MDCSelect;
        const categorySelect = document.querySelector('#filter-category').closest('.mdc-select').MDCSelect;
        
        typeSelect.selectedIndex = 0;
        categorySelect.selectedIndex = 0;
    }
    
    // Initialize chart tab functionality
    initializeChartTabs();
});

// Function to show form status messages
function showFormStatus(message, type) {
    const formStatus = document.getElementById('form-status');
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;
    formStatus.classList.remove('hidden');
    
    // Hide message after 3 seconds
    setTimeout(() => {
        formStatus.classList.add('hidden');
    }, 3000);
}

// Function to save transaction
function saveTransaction(transaction) {
    fetch('/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(data => {
        // Show success message or error
        if (data.success) {
            // Reset form
            document.getElementById('title').value = '';
            document.getElementById('amount').value = '';
            
            // Show success message
            showFormStatus('Transaction added successfully!', 'success');
            
            // Reload transactions and summary
            loadTransactions(getFilterParameters());
            loadSummary();
            
            // Refresh charts
            updateAllCharts();
        } else {
            showFormStatus('Error saving transaction: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showFormStatus('Error saving transaction. Please try again.', 'error');
    });
}

// Function to update transaction
function updateTransaction(transactionId, updatedTransaction) {
    fetch(`/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close the dialog
            const editDialog = document.querySelector('#edit-transaction-dialog').MDCDialog;
            editDialog.close();
            
            // Show success message
            showFormStatus('Transaction updated successfully!', 'success');
            
            // Reload transactions and summary
            loadTransactions(getFilterParameters());
            loadSummary();
            
            // Refresh charts
            updateAllCharts();
        } else {
            showFormStatus('Error updating transaction: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showFormStatus('Error updating transaction. Please try again.', 'error');
    });
}

// Function to delete transaction
function deleteTransaction(transactionId) {
    fetch(`/transactions/${transactionId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close the dialog
            const deleteDialog = document.querySelector('#delete-transaction-dialog').MDCDialog;
            deleteDialog.close();
            
            // Show success message
            showFormStatus('Transaction deleted successfully!', 'success');
            
            // Reload transactions and summary
            loadTransactions(getFilterParameters());
            loadSummary();
            
            // Refresh charts
            updateAllCharts();
        } else {
            showFormStatus('Error deleting transaction: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showFormStatus('Error deleting transaction. Please try again.', 'error');
    });
}

// Function to load transactions with optional filters
function loadTransactions(filters = {}) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            queryParams.append(key, value);
        }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    fetch(`/transactions${queryString}`)
    .then(response => response.json())
    .then(data => {
        displayTransactions(data);
    })
    .catch(error => {
        console.error('Error:', error);
        showFormStatus('Error loading transactions. Please refresh the page.', 'error');
    });
}

// Function to load summary data
function loadSummary(filters = {}) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            queryParams.append(key, value);
        }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    fetch(`/summary${queryString}`)
    .then(response => response.json())
    .then(data => {
        updateSummary(data);
        
        // Update charts with the new data
        updateAllCharts(data);
    })
    .catch(error => {
        console.error('Error:', error);
        showFormStatus('Error loading summary data. Please refresh the page.', 'error');
    });
}

// Function to display transactions in the table
function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactions-list');
    const noTransactionsMsg = document.getElementById('no-transactions');
    
    // Clear existing transactions
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        noTransactionsMsg.style.display = 'block';
        document.getElementById('transactions-table').style.display = 'none';
        return;
    }
    
    noTransactionsMsg.style.display = 'none';
    document.getElementById('transactions-table').style.display = 'table';
    
    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add each transaction to the table
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.classList.add('mdc-data-table__row');
        
        // Determine transaction type if not explicitly set
        const type = transaction.type || (transaction.amount >= 0 ? 'income' : 'expense');
        row.classList.add(`transaction-type-${type}`);
        
        // Format the date
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Determine if income or expense for styling
        const amountClass = type === 'income' ? 'income-amount' : 'expense-amount';
        const formattedAmount = formatCurrency(transaction.amount);
        
        // Create cells
        const dateCell = document.createElement('td');
        dateCell.classList.add('mdc-data-table__cell');
        dateCell.textContent = formattedDate;
        
        const titleCell = document.createElement('td');
        titleCell.classList.add('mdc-data-table__cell');
        titleCell.textContent = transaction.title;
        
        const categoryCell = document.createElement('td');
        categoryCell.classList.add('mdc-data-table__cell');
        categoryCell.textContent = transaction.category || (type === 'income' ? 'Other Income' : 'Other Expense');
        
        const amountCell = document.createElement('td');
        amountCell.classList.add('mdc-data-table__cell', amountClass);
        amountCell.textContent = formattedAmount;
        
        // Action buttons cell
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('mdc-data-table__cell');
        
        // Create edit button
        const editButton = document.createElement('i');
        editButton.classList.add('material-icons', 'action-button', 'edit-button');
        editButton.textContent = 'edit';
        editButton.addEventListener('click', () => openEditDialog(transaction));
        
        // Create delete button
        const deleteButton = document.createElement('i');
        deleteButton.classList.add('material-icons', 'action-button', 'delete-button');
        deleteButton.textContent = 'delete';
        deleteButton.addEventListener('click', () => openDeleteDialog(transaction.id));
        
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        
        // Append cells to row
        row.appendChild(dateCell);
        row.appendChild(titleCell);
        row.appendChild(categoryCell);
        row.appendChild(amountCell);
        row.appendChild(actionsCell);
        
        transactionsList.appendChild(row);
    });
}

// Function to update summary cards
function updateSummary(data) {
    document.getElementById('total-income').textContent = formatCurrency(data.total_income);
    document.getElementById('total-expenses').textContent = formatCurrency(data.total_expenses);
    document.getElementById('total-balance').textContent = formatCurrency(data.balance);
}

// Function to format currency (pounds)
function formatCurrency(amount) {
    return '£' + Math.abs(amount).toFixed(2);
}

// Function to get current filter parameters
function getFilterParameters() {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    
    let type = '';
    let category = '';
    
    const typeSelectElement = document.querySelector('#filter-type').closest('.mdc-select');
    if (typeSelectElement && typeSelectElement.MDCSelect) {
        type = typeSelectElement.MDCSelect.value === 'all' ? '' : typeSelectElement.MDCSelect.value;
    }
    
    const categorySelectElement = document.querySelector('#filter-category').closest('.mdc-select');
    if (categorySelectElement && categorySelectElement.MDCSelect) {
        category = categorySelectElement.MDCSelect.value === 'all' ? '' : categorySelectElement.MDCSelect.value;
    }
    
    return {
        start_date: startDate,
        end_date: endDate,
        type: type,
        category: category
    };
}

// Function to open edit transaction dialog
function openEditDialog(transaction) {
    // Get the dialog
    const editDialog = document.querySelector('#edit-transaction-dialog').MDCDialog;
    
    // Set form values
    document.getElementById('edit-transaction-id').value = transaction.id;
    document.getElementById('edit-title').value = transaction.title;
    document.getElementById('edit-amount').value = Math.abs(transaction.amount);
    document.getElementById('edit-date').value = transaction.date;
    
    // Set transaction type select
    const typeSelect = document.querySelector('#edit-transaction-type').closest('.mdc-select').MDCSelect;
    typeSelect.value = transaction.type;
    
    // Populate categories based on transaction type
    populateEditCategories(transaction.type, document.getElementById('edit-category'));
    
    // Set category select after populating options
    setTimeout(() => {
        const categorySelect = document.querySelector('#edit-category').closest('.mdc-select').MDCSelect;
        categorySelect.value = transaction.category;
    }, 50);
    
    // Open the dialog
    editDialog.open();
}

// Function to populate edit dialog categories
function populateEditCategories(type, categoryElement) {
    // Define categories
    const categories = {
        income: [
            'Salary',
            'Freelance',
            'Investment',
            'Gift',
            'Refund',
            'Other Income'
        ],
        expense: [
            'Food & Dining',
            'Housing',
            'Transportation',
            'Utilities',
            'Entertainment',
            'Shopping',
            'Healthcare',
            'Education',
            'Personal Care',
            'Travel',
            'Gifts & Donations',
            'Other Expense'
        ]
    };
    
    // Clear existing options
    categoryElement.innerHTML = '';
    
    // Add new options based on type
    categories[type].forEach(category => {
        const listItem = document.createElement('li');
        listItem.classList.add('mdc-list-item');
        listItem.dataset.value = category;
        
        const rippleSpan = document.createElement('span');
        rippleSpan.classList.add('mdc-list-item__ripple');
        
        const textSpan = document.createElement('span');
        textSpan.classList.add('mdc-list-item__text');
        textSpan.textContent = category;
        
        listItem.appendChild(rippleSpan);
        listItem.appendChild(textSpan);
        categoryElement.appendChild(listItem);
    });
    
    // Make sure to reinitialize the MDC select
    const select = categoryElement.closest('.mdc-select');
    if (select && select.MDCSelect) {
        select.MDCSelect.layoutOptions();
    }
}

// Function to open delete transaction dialog
function openDeleteDialog(transactionId) {
    // Get the dialog
    const deleteDialog = document.querySelector('#delete-transaction-dialog').MDCDialog;
    
    // Set the transaction ID
    document.getElementById('delete-transaction-id').value = transactionId;
    
    // Open the dialog
    deleteDialog.open();
}

// Initialize event listeners for edit and delete dialogs
document.addEventListener('DOMContentLoaded', function() {
    // Set up edit transaction form submission
    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', function() {
            const transactionId = document.getElementById('edit-transaction-id').value;
            const title = document.getElementById('edit-title').value;
            let amount = parseFloat(document.getElementById('edit-amount').value);
            const typeSelect = document.querySelector('#edit-transaction-type').closest('.mdc-select').MDCSelect;
            const categorySelect = document.querySelector('#edit-category').closest('.mdc-select').MDCSelect;
            const type = typeSelect.value;
            const category = categorySelect.value;
            const date = document.getElementById('edit-date').value;
            
            // Validate inputs
            if (!title || isNaN(amount) || !date) {
                showFormStatus('Please fill in all required fields', 'error');
                return;
            }
            
            // Create updated transaction object
            const updatedTransaction = {
                title: title,
                amount: amount,
                type: type,
                category: category,
                date: date
            };
            
            // Update transaction
            updateTransaction(transactionId, updatedTransaction);
        });
    }
    
    // Set up delete transaction confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const transactionId = document.getElementById('delete-transaction-id').value;
            deleteTransaction(transactionId);
        });
    }
    
    // Handle transaction type change in edit dialog
    const editTypeSelect = document.querySelector('#edit-transaction-type');
    if (editTypeSelect) {
        editTypeSelect.addEventListener('MDCSelect:change', function(e) {
            const type = e.detail.value;
            populateEditCategories(type, document.getElementById('edit-category'));
        });
    }
});