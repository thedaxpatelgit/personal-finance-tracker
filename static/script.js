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
    
    // Initialize date field with today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Set up category dropdown based on transaction type
    const transactionTypeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('category');
    
    // Populate category dropdown based on transaction type
    function populateCategories(type) {
        // Clear existing options
        categorySelect.innerHTML = '';
        
        // Add new options based on type
        categories[type].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    // Initially populate with income categories (default selection)
    populateCategories('income');
    
    // Update categories when transaction type changes
    transactionTypeSelect.addEventListener('change', function() {
        populateCategories(this.value);
    });
    
    // Load transactions when page loads
    loadTransactions();
    
    // Form submission handler
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('title').value;
        let amount = parseFloat(document.getElementById('amount').value);
        const transactionType = document.getElementById('transaction-type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        
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
    
    // Set up transaction filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected filter
            const filter = this.getAttribute('data-filter');
            
            // Reload transactions with filter
            loadTransactions(filter);
        });
    });
});

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
            
            // Reload transactions to show the new one
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            loadTransactions(activeFilter);
        } else {
            alert('Error saving transaction: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving transaction. Please try again.');
    });
}

// Function to load transactions with optional filter
function loadTransactions(filter = 'all') {
    fetch('/transactions')
    .then(response => response.json())
    .then(data => {
        // Filter transactions if needed
        let filteredData = data;
        if (filter === 'income') {
            filteredData = data.filter(t => t.type === 'income' || t.amount > 0);
        } else if (filter === 'expense') {
            filteredData = data.filter(t => t.type === 'expense' || t.amount < 0);
        }
        
        displayTransactions(filteredData);
        updateSummary(data); // Always show summary based on all transactions
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('transactions-list').innerHTML = '<tr><td colspan="4">Error loading transactions</td></tr>';
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
        return;
    }
    
    noTransactionsMsg.style.display = 'none';
    
    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add each transaction to the table
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Determine transaction type if not explicitly set
        const type = transaction.type || (transaction.amount >= 0 ? 'income' : 'expense');
        row.classList.add('transaction-type-' + type);
        
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
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.title}</td>
            <td>${transaction.category || (type === 'income' ? 'Other Income' : 'Other Expense')}</td>
            <td class="${amountClass}">${formattedAmount}</td>
        `;
        
        transactionsList.appendChild(row);
    });
}

// Function to update summary cards
function updateSummary(transactions) {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(transaction => {
        if (transaction.amount >= 0) {
            income += transaction.amount;
        } else {
            expenses += Math.abs(transaction.amount);
        }
    });
    
    const balance = income - expenses;
    
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expenses').textContent = formatCurrency(expenses);
    document.getElementById('total-balance').textContent = formatCurrency(balance);
}

// Function to format currency (pounds)
function formatCurrency(amount) {
    return '£' + Math.abs(amount).toFixed(2);
}