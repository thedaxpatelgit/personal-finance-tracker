/**
 * This file handles all chart visualizations using Chart.js
 */

// Store chart instances globally so they can be updated
window.charts = {};

// Color palette for charts
const chartColors = {
    income: 'rgba(76, 175, 80, 0.8)',
    expense: 'rgba(244, 67, 54, 0.8)',
    balance: 'rgba(25, 118, 210, 0.8)',
    // Category colors
    categoryColors: [
        'rgba(33, 150, 243, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 152, 0, 0.8)',
        'rgba(0, 188, 212, 0.8)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(233, 30, 99, 0.8)',
        'rgba(121, 85, 72, 0.8)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(255, 87, 34, 0.8)',
        'rgba(96, 125, 139, 0.8)',
        'rgba(0, 150, 136, 0.8)',
        'rgba(255, 193, 7, 0.8)'
    ]
};

/**
 * Initialize all charts when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load initial chart data
    loadSummary();
});

/**
 * Update all charts with new data
 * @param {Object} data - Optional summary data object from the server
 */
function updateAllCharts(data) {
    if (!data) {
        // If no data is provided, fetch it
        fetch('/summary')
            .then(response => response.json())
            .then(summaryData => {
                // Create or update all charts
                createOrUpdateIncomeExpenseChart(summaryData);
                createOrUpdateExpenseCategoriesChart(summaryData);
                createOrUpdateIncomeCategoriesChart(summaryData);
                createOrUpdateTrendsChart();
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
    } else {
        // Use the provided data
        createOrUpdateIncomeExpenseChart(data);
        createOrUpdateExpenseCategoriesChart(data);
        createOrUpdateIncomeCategoriesChart(data);
        createOrUpdateTrendsChart();
    }
}

/**
 * Create or update the Income vs Expenses chart
 * @param {Object} data - Summary data object
 */
function createOrUpdateIncomeExpenseChart(data) {
    const chartCanvas = document.getElementById('income-expense-chart');
    if (!chartCanvas) return;
    
    const chartData = {
        labels: ['Income', 'Expenses', 'Balance'],
        datasets: [{
            label: 'Amount (£)',
            data: [data.total_income, data.total_expenses, data.balance],
            backgroundColor: [
                chartColors.income,
                chartColors.expense,
                chartColors.balance
            ],
            borderColor: [
                chartColors.income.replace('0.8', '1'),
                chartColors.expense.replace('0.8', '1'),
                chartColors.balance.replace('0.8', '1')
            ],
            borderWidth: 1
        }]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Income vs Expenses Summary',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `£${context.raw.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '£' + value;
                    }
                }
            }
        }
    };
    
    if (window.charts['income-expense-chart-container']) {
        // Update existing chart
        window.charts['income-expense-chart-container'].data = chartData;
        window.charts['income-expense-chart-container'].update();
    } else {
        // Create new chart
        window.charts['income-expense-chart-container'] = new Chart(chartCanvas, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }
}

/**
 * Create or update the Expense Categories chart
 * @param {Object} data - Summary data object
 */
function createOrUpdateExpenseCategoriesChart(data) {
    const chartCanvas = document.getElementById('expense-categories-chart');
    if (!chartCanvas) return;
    
    // Get expense categories from the data
    const expenseBreakdown = data.expense_breakdown || [];
    
    // Sort by amount (descending)
    expenseBreakdown.sort((a, b) => b.amount - a.amount);
    
    const labels = expenseBreakdown.map(item => item.category);
    const values = expenseBreakdown.map(item => item.amount);
    
    // Generate background colors
    const backgroundColors = [];
    for (let i = 0; i < labels.length; i++) {
        backgroundColors.push(chartColors.categoryColors[i % chartColors.categoryColors.length]);
    }
    
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Amount (£)',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1
        }]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Expense Categories',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `£${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    if (window.charts['expense-categories-chart-container']) {
        // Update existing chart
        window.charts['expense-categories-chart-container'].data = chartData;
        window.charts['expense-categories-chart-container'].update();
    } else {
        // Create new chart
        window.charts['expense-categories-chart-container'] = new Chart(chartCanvas, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });
    }
}

/**
 * Create or update the Income Categories chart
 * @param {Object} data - Summary data object
 */
function createOrUpdateIncomeCategoriesChart(data) {
    const chartCanvas = document.getElementById('income-categories-chart');
    if (!chartCanvas) return;
    
    // Get income categories from the data
    const incomeBreakdown = data.income_breakdown || [];
    
    // Sort by amount (descending)
    incomeBreakdown.sort((a, b) => b.amount - a.amount);
    
    const labels = incomeBreakdown.map(item => item.category);
    const values = incomeBreakdown.map(item => item.amount);
    
    // Generate background colors
    const backgroundColors = [];
    for (let i = 0; i < labels.length; i++) {
        backgroundColors.push(chartColors.categoryColors[i % chartColors.categoryColors.length]);
    }
    
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Amount (£)',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1
        }]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Income Categories',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `£${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    if (window.charts['income-categories-chart-container']) {
        // Update existing chart
        window.charts['income-categories-chart-container'].data = chartData;
        window.charts['income-categories-chart-container'].update();
    } else {
        // Create new chart
        window.charts['income-categories-chart-container'] = new Chart(chartCanvas, {
            type: 'pie',
            data: chartData,
            options: chartOptions
        });
    }
}

/**
 * Create or update the Monthly Trends chart
 */
function createOrUpdateTrendsChart() {
    const chartCanvas = document.getElementById('trends-chart');
    if (!chartCanvas) return;
    
    // Fetch transaction data for trends
    fetch('/transactions')
        .then(response => response.json())
        .then(transactions => {
            // Group transactions by month
            const monthlyData = groupTransactionsByMonth(transactions);
            
            const chartData = {
                labels: monthlyData.months,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyData.incomes,
                        backgroundColor: chartColors.income.replace('0.8', '0.2'),
                        borderColor: chartColors.income.replace('0.8', '1'),
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: monthlyData.expenses,
                        backgroundColor: chartColors.expense.replace('0.8', '0.2'),
                        borderColor: chartColors.expense.replace('0.8', '1'),
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Balance',
                        data: monthlyData.balances,
                        backgroundColor: chartColors.balance.replace('0.8', '0.2'),
                        borderColor: chartColors.balance.replace('0.8', '1'),
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            };
            
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Financial Trends',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: £${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return '£' + value;
                            }
                        }
                    }
                }
            };
            
            if (window.charts['trends-chart-container']) {
                // Update existing chart
                window.charts['trends-chart-container'].data = chartData;
                window.charts['trends-chart-container'].update();
            } else {
                // Create new chart
                window.charts['trends-chart-container'] = new Chart(chartCanvas, {
                    type: 'line',
                    data: chartData,
                    options: chartOptions
                });
            }
        })
        .catch(error => {
            console.error('Error fetching transaction data for trends chart:', error);
        });
}

/**
 * Group transactions by month for the trends chart
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object with arrays for months, incomes, expenses, and balances
 */
function groupTransactionsByMonth(transactions) {
    // Create a map to store data by month
    const monthlyDataMap = new Map();
    
    // Process each transaction
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        // Initialize month in the map if it doesn't exist
        if (!monthlyDataMap.has(monthYear)) {
            monthlyDataMap.set(monthYear, {
                income: 0,
                expense: 0,
                balance: 0
            });
        }
        
        // Update month data based on transaction type
        const monthData = monthlyDataMap.get(monthYear);
        if (transaction.amount > 0) {
            monthData.income += transaction.amount;
        } else {
            monthData.expense += Math.abs(transaction.amount);
        }
        monthData.balance = monthData.income - monthData.expense;
    });
    
    // Sort months chronologically
    const sortedMonths = Array.from(monthlyDataMap.keys()).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
    });
    
    // Create arrays for chart data
    const months = [];
    const incomes = [];
    const expenses = [];
    const balances = [];
    
    sortedMonths.forEach(month => {
        const data = monthlyDataMap.get(month);
        months.push(month);
        incomes.push(data.income);
        expenses.push(data.expense);
        balances.push(data.balance);
    });
    
    return {
        months,
        incomes,
        expenses,
        balances
    };
}
console.log("MaterialComponents.js loaded");
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    // initialization code...
});