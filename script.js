// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('page-title');
const viewAllButtons = document.querySelectorAll('.view-all');
const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
const searchInput = document.getElementById('search-transactions');
const filterCategory = document.getElementById('filter-category');
const filterType = document.getElementById('filter-type');
const toast = document.getElementById('notification-toast');
const notificationBell = document.getElementById('notification-bell');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationList = document.getElementById('notification-list');
const notificationCount = document.getElementById('notification-count');
const clearNotificationsBtn = document.getElementById('clear-notifications');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const closeModalBtn = document.querySelector('.close-modal');
const transactionPreview = document.getElementById('transaction-preview');

// Chart instances
let incomeExpenseChart, categoryChart, monthlyTrendChart, budgetChart;

// State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let currentPage = 'dashboard';
let transactionToDelete = null;
let previousMonthData = JSON.parse(localStorage.getItem('previousMonthData')) || {
    income: 0,
    expense: 0,
    balance: 0,
    savings: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    updateUI();
    initializeCharts();
    updateNotifications();
});

function initializeApp() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('income-date').value = today;
    document.getElementById('expense-date').value = today;
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        themeSwitch.checked = true;
        document.body.classList.add('dark-theme');
    }
    
    // Show dashboard by default
    showPage('dashboard');
}

function setupEventListeners() {
    // Theme toggle
    themeSwitch.addEventListener('change', toggleTheme);
    
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // View all buttons
    viewAllButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(button.dataset.page);
        });
    });
    
    // Form submissions
    incomeForm.addEventListener('submit', handleIncomeSubmit);
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    
    // Filters and search
    searchInput.addEventListener('input', updateTransactionsUI);
    filterCategory.addEventListener('change', updateTransactionsUI);
    filterType.addEventListener('change', updateTransactionsUI);
    
    // Chart period change
    document.getElementById('chart-period').addEventListener('change', updateCharts);
    
    // Notification bell
    notificationBell.addEventListener('click', toggleNotifications);
    
    // Clear notifications
    clearNotificationsBtn.addEventListener('click', clearAllNotifications);
    
    // Delete modal
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    closeModalBtn.addEventListener('click', closeDeleteModal);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBell.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.style.display = 'none';
        }
        
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

function showPage(pageName) {
    // Update active nav item
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    // Update active page
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'add-income': 'Add Income',
        'add-expense': 'Add Expense',
        'analytics': 'Analytics',
        'transactions': 'Transactions'
    };
    pageTitle.textContent = titles[pageName];
    
    currentPage = pageName;
    
    // Update specific page content
    if (pageName === 'transactions') {
        updateTransactionsUI();
    } else if (pageName === 'analytics') {
        updateAnalytics();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
    updateCharts(); // Update charts for new theme
}

function toggleNotifications() {
    const isVisible = notificationDropdown.style.display === 'block';
    notificationDropdown.style.display = isVisible ? 'none' : 'block';
    
    // Mark all as read when opening
    if (!isVisible) {
        markAllNotificationsAsRead();
    }
}

function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const description = document.getElementById('income-description').value.trim();
    const amount = parseFloat(document.getElementById('income-amount').value);
    const category = document.getElementById('income-category').value;
    const date = document.getElementById('income-date').value;
    
    if (!description || !amount || !category || !date) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    addTransaction(description, amount, 'income', category, date);
    incomeForm.reset();
    document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
    
    showToast('Income added successfully!', 'success');
    showPage('dashboard');
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    
    if (!description || !amount || !category || !date) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    addTransaction(description, amount, 'expense', category, date);
    expenseForm.reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    
    showToast('Expense added successfully!', 'success');
    showPage('dashboard');
}

function addTransaction(description, amount, type, category, date) {
    const transaction = {
        id: Date.now().toString(),
        description,
        amount: type === 'income' ? amount : -amount,
        type,
        category,
        date,
        timestamp: new Date().getTime()
    };
    
    transactions.unshift(transaction);
    saveTransactions();
    
    // Add notification
    addNotification(
        type === 'income' ? 'income' : 'expense',
        `${type === 'income' ? 'Income' : 'Expense'} Added`,
        `${type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(amount)} added for ${description}`,
        transaction
    );
    
    updateUI();
}

function deleteTransaction(transactionId) {
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return;
    
    const deletedTransaction = transactions[transactionIndex];
    transactions.splice(transactionIndex, 1);
    saveTransactions();
    
    // Add deletion notification
    addNotification(
        'delete',
        'Transaction Deleted',
        `${deletedTransaction.type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(Math.abs(deletedTransaction.amount))} deleted`,
        deletedTransaction
    );
    
    updateUI();
    closeDeleteModal();
    showToast('Transaction deleted successfully!', 'success');
}

function openDeleteModal(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    transactionToDelete = transactionId;
    
    // Populate preview
    transactionPreview.innerHTML = `
        <div class="preview-item">
            <span class="preview-label">Description:</span>
            <span class="preview-value">${transaction.description}</span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Amount:</span>
            <span class="preview-value ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
            </span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Category:</span>
            <span class="preview-value">${getCategoryName(transaction.category)}</span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Date:</span>
            <span class="preview-value">${formatDate(transaction.date)}</span>
        </div>
    `;
    
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
    transactionToDelete = null;
}

function confirmDelete() {
    if (transactionToDelete) {
        deleteTransaction(transactionToDelete);
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateUI() {
    updateSummary();
    updateRecentTransactions();
    updateCharts();
    
    if (currentPage === 'transactions') {
        updateTransactionsUI();
    }
    
    if (currentPage === 'analytics') {
        updateAnalytics();
    }
}

function updateSummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate current month data
    const currentMonthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const income = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expense = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = income - expense;
    const savings = Math.max(0, income * 0.2 - expense * 0.1);
    
    // Calculate previous month data for comparison
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === previousMonth && 
               transactionDate.getFullYear() === previousYear;
    });
    
    const previousIncome = previousMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const previousExpense = previousMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const previousBalance = previousIncome - previousExpense;
    const previousSavings = Math.max(0, previousIncome * 0.2 - previousExpense * 0.1);
    
    // Calculate percentage changes
    const balanceChange = previousBalance !== 0 ? ((balance - previousBalance) / Math.abs(previousBalance)) * 100 : 0;
    const incomeChange = previousIncome !== 0 ? ((income - previousIncome) / previousIncome) * 100 : (income > 0 ? 100 : 0);
    const expenseChange = previousExpense !== 0 ? ((expense - previousExpense) / previousExpense) * 100 : (expense > 0 ? 100 : 0);
    const savingsChange = previousSavings !== 0 ? ((savings - previousSavings) / previousSavings) * 100 : (savings > 0 ? 100 : 0);
    
    // Update amounts
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expense').textContent = formatCurrency(expense);
    document.getElementById('monthly-savings').textContent = formatCurrency(savings);
    
    // Update trend indicators
    updateTrendIndicator('balance', balanceChange, balance);
    updateTrendIndicator('income', incomeChange, income);
    updateTrendIndicator('expense', expenseChange, expense);
    updateTrendIndicator('savings', savingsChange, savings);
}

function updateTrendIndicator(type, change, currentValue) {
    const trendElement = document.querySelector(`.summary-card.${type} .card-trend`);
    const iconElement = trendElement.querySelector('i');
    const textElement = trendElement.querySelector('span');
    
    // Remove existing classes
    trendElement.classList.remove('positive', 'negative', 'neutral');
    iconElement.className = 'fas';
    
    if (currentValue === 0) {
        // No data case
        trendElement.classList.add('neutral');
        iconElement.classList.add('fa-minus');
        textElement.textContent = '0%';
    } else if (change > 0) {
        // Positive growth
        trendElement.classList.add('positive');
        iconElement.classList.add('fa-arrow-up');
        textElement.textContent = `${Math.abs(change).toFixed(1)}%`;
    } else if (change < 0) {
        // Negative growth
        trendElement.classList.add('negative');
        iconElement.classList.add('fa-arrow-down');
        textElement.textContent = `${Math.abs(change).toFixed(1)}%`;
    } else {
        // No change
        trendElement.classList.add('neutral');
        iconElement.classList.add('fa-minus');
        textElement.textContent = '0%';
    }
}

function updateRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h4>No transactions yet</h4>
                <p>Add your first transaction to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon category-${transaction.category}">
                    <i class="${getCategoryIcon(transaction.category)}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-meta">
                        <span>${formatDate(transaction.date)}</span>
                        <span class="transaction-category">${getCategoryName(transaction.category)}</span>
                    </div>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
            </div>
        </div>
    `).join('');
}

function updateTransactionsUI() {
    const container = document.getElementById('all-transactions');
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    const typeFilter = filterType.value;
    
    let filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        
        return matchesSearch && matchesCategory && matchesType;
    });
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h4>No transactions found</h4>
                <p>Try changing your search or filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-main">
                <div class="transaction-info">
                    <div class="transaction-icon category-${transaction.category}">
                        <i class="${getCategoryIcon(transaction.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <div class="transaction-meta">
                            <span>${formatDate(transaction.date)}</span>
                            <span class="transaction-category">${getCategoryName(transaction.category)}</span>
                        </div>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(transaction.amount))}
                </div>
            </div>
            <div class="transaction-actions">
                <button class="delete-btn" onclick="openDeleteModal('${transaction.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateAnalytics() {
    updateSavingsProgress();
    updateSpendingInsights();
    updateCharts(); // Refresh charts with current data
}

function updateSavingsProgress() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savings = Math.max(0, income * 0.2 - expense * 0.1);
    const progress = Math.min((savings / 10000) * 100, 100); // ₹10,000 goal
    
    document.getElementById('savings-progress').style.width = `${progress}%`;
    document.getElementById('savings-amount').textContent = formatCurrency(savings);
}

function updateSpendingInsights() {
    const categories = ['food', 'shopping', 'transport'];
    const insights = categories.map(category => {
        const total = transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return { category, total };
    });
    
    insights.forEach((insight, index) => {
        const insightElement = document.querySelectorAll('.insight-amount')[index];
        if (insightElement) {
            insightElement.textContent = formatCurrency(insight.total);
        }
    });
}

// Notification Functions
function addNotification(type, title, message, transaction = null) {
    const notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        transaction,
        timestamp: new Date().getTime(),
        read: false
    };
    
    notifications.unshift(notification);
    saveNotifications();
    updateNotifications();
}

function updateNotifications() {
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationCount.textContent = unreadCount;
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }
    
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" onclick="markNotificationAsRead('${notification.id}')">
            <div class="notification-content">
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-details">
                    <p>${notification.message}</p>
                    <div class="notification-time">${formatTime(notification.timestamp)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveNotifications();
        updateNotifications();
    }
}

function markAllNotificationsAsRead() {
    notifications.forEach(notification => {
        notification.read = true;
    });
    saveNotifications();
    updateNotifications();
}

function clearAllNotifications() {
    notifications = [];
    saveNotifications();
    updateNotifications();
    showToast('All notifications cleared', 'info');
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function getNotificationIcon(type) {
    const icons = {
        'income': 'arrow-down',
        'expense': 'arrow-up',
        'delete': 'trash'
    };
    return icons[type] || 'bell';
}

// Dynamic Chart Functions
function initializeCharts() {
    createIncomeExpenseChart();
    createCategoryChart();
    createMonthlyTrendChart();
    createBudgetChart();
}

function updateCharts() {
    if (incomeExpenseChart) incomeExpenseChart.destroy();
    if (categoryChart) categoryChart.destroy();
    if (monthlyTrendChart) monthlyTrendChart.destroy();
    if (budgetChart) budgetChart.destroy();
    
    initializeCharts();
}

function createIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Get actual data from transactions
    const monthlyData = getMonthlyIncomeExpenseData();
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.income,
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: monthlyData.expense,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(100, 116, 139, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Get actual category data from transactions
    const categoryData = getCategorySpendingData();
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.amounts,
                backgroundColor: categoryData.colors,
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = categoryData.amounts.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ₹${context.parsed.toLocaleString()}${total > 0 ? ` (${percentage}%)` : ''}`;
                        }
                    }
                }
            }
        }
    });
}

function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    
    // Get actual monthly balance data
    const monthlyBalance = getMonthlyBalanceData();
    
    monthlyTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyBalance.labels,
            datasets: [{
                label: 'Monthly Balance',
                data: monthlyBalance.balances,
                backgroundColor: monthlyBalance.balances.map(balance => 
                    balance >= 0 ? 'rgba(6, 214, 160, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                ),
                borderColor: monthlyBalance.balances.map(balance => 
                    balance >= 0 ? '#06d6a0' : '#ef4444'
                ),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Balance: ₹${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(100, 116, 139, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createBudgetChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    // Get actual vs budget data
    const budgetData = getBudgetVsActualData();
    
    budgetChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: budgetData.categories,
            datasets: [
                {
                    label: 'Budgeted',
                    data: budgetData.budgeted,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#6366f1'
                },
                {
                    label: 'Actual',
                    data: budgetData.actual,
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    pointBackgroundColor: '#06d6a0',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#06d6a0'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    angleLines: {
                        color: 'rgba(100, 116, 139, 0.1)'
                    },
                    grid: {
                        color: 'rgba(100, 116, 139, 0.1)'
                    },
                    pointLabels: {
                        color: getComputedStyle(document.body).getPropertyValue('--dark')
                    },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--gray'),
                        backdropColor: 'transparent',
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Data Calculation Functions
function getMonthlyIncomeExpenseData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Get last 6 months
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        labels.push(months[monthIndex]);
        
        // Calculate income and expense for each month
        const monthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === monthIndex && 
                   transactionDate.getFullYear() === new Date().getFullYear();
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        incomeData.push(income);
        expenseData.push(expense);
    }
    
    return { labels, income: incomeData, expense: expenseData };
}

function getCategorySpendingData() {
    const categoryColors = {
        'food': '#10b981',
        'transport': '#f59e0b',
        'shopping': '#8b5cf6',
        'entertainment': '#ec4899',
        'bills': '#3b82f6',
        'health': '#ef4444',
        'education': '#06b6d4',
        'other': '#6b7280',
        'salary': '#10b981',
        'freelance': '#f59e0b',
        'investment': '#8b5cf6',
        'business': '#ec4899'
    };
    
    const categoryTotals = {};
    
    // Calculate totals for each category
    transactions.forEach(transaction => {
        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }
        categoryTotals[transaction.category] += Math.abs(transaction.amount);
    });
    
    // Filter out categories with zero amount and sort by amount
    const sortedCategories = Object.entries(categoryTotals)
        .filter(([category, amount]) => amount > 0)
        .sort((a, b) => b[1] - a[1]);
    
    const labels = sortedCategories.map(([category]) => getCategoryName(category));
    const amounts = sortedCategories.map(([_, amount]) => amount);
    const colors = sortedCategories.map(([category]) => categoryColors[category] || '#6b7280');
    
    // If no data, show empty state
    if (labels.length === 0) {
        return {
            labels: ['No Data'],
            amounts: [1],
            colors: ['#cbd5e1']
        };
    }
    
    return { labels, amounts, colors };
}

function getMonthlyBalanceData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const labels = [];
    const balances = [];
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        labels.push(months[monthIndex]);
        
        // Calculate balance for each month
        const monthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === monthIndex && 
                   transactionDate.getFullYear() === new Date().getFullYear();
        });
        
        const balance = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
        balances.push(balance);
    }
    
    return { labels, balances };
}

function getBudgetVsActualData() {
    const mainCategories = ['food', 'shopping', 'transport', 'bills', 'entertainment', 'health'];
    
    const categories = mainCategories.map(getCategoryName);
    const budgeted = [8000, 6000, 4000, 7000, 3000, 2000]; // Sample budget data
    const actual = [];
    
    // Calculate actual spending for each category
    mainCategories.forEach(category => {
        const actualAmount = transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        actual.push(actualAmount);
    });
    
    return { categories, budgeted, actual };
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timestamp) {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
    });
}

function getCategoryIcon(category) {
    const icons = {
        food: 'fas fa-utensils',
        transport: 'fas fa-car',
        shopping: 'fas fa-shopping-bag',
        entertainment: 'fas fa-film',
        bills: 'fas fa-file-invoice-dollar',
        health: 'fas fa-heartbeat',
        education: 'fas fa-graduation-cap',
        salary: 'fas fa-money-bill-wave',
        freelance: 'fas fa-laptop-code',
        investment: 'fas fa-chart-line',
        business: 'fas fa-briefcase',
        other: 'fas fa-circle'
    };
    return icons[category] || 'fas fa-circle';
}

function getCategoryName(category) {
    const names = {
        food: 'Food & Dining',
        transport: 'Transportation',
        shopping: 'Shopping',
        entertainment: 'Entertainment',
        bills: 'Bills & Utilities',
        health: 'Healthcare',
        education: 'Education',
        salary: 'Salary',
        freelance: 'Freelance',
        investment: 'Investment',
        business: 'Business',
        other: 'Other'
    };
    return names[category] || 'Other';
}

function showToast(message, type) {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function loadSampleData() {
    if (transactions.length === 0) {
        const sampleTransactions = [
            {
                id: '1',
                description: 'Monthly Salary',
                amount: 50000,
                type: 'income',
                category: 'salary',
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().getTime() - 86400000
            },
            {
                id: '2',
                description: 'Freelance Project',
                amount: 15000,
                type: 'income',
                category: 'freelance',
                date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
                timestamp: new Date().getTime() - 2 * 86400000
            },
            {
                id: '3',
                description: 'Groceries',
                amount: -2500,
                type: 'expense',
                category: 'food',
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().getTime() - 43200000
            },
            {
                id: '4',
                description: 'Netflix Subscription',
                amount: -649,
                type: 'expense',
                category: 'entertainment',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                timestamp: new Date().getTime() - 86400000
            },
            {
                id: '5',
                description: 'Petrol',
                amount: -1200,
                type: 'expense',
                category: 'transport',
                date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
                timestamp: new Date().getTime() - 3 * 86400000
            }
        ];
        
        transactions = sampleTransactions;
        saveTransactions();
    }
}

// Export for global access
window.openDeleteModal = openDeleteModal;
window.markNotificationAsRead = markNotificationAsRead;