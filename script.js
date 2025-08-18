document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInput = document.getElementById('type');
    const dateInput = document.getElementById('date');
    const transactionsList = document.getElementById('transactions-list');
    const totalBalanceElement = document.getElementById('total-balance');
    const totalIncomeElement = document.getElementById('total-income');
    const totalExpenseElement = document.getElementById('total-expense');
    const filterType = document.getElementById('filter-type');
    const filterMonth = document.getElementById('filter-month');
    
    // Set default date to today
    dateInput.valueAsDate = new Date();
    
    // Set default month filter to current month
    const today = new Date();
    filterMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Transactions array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Initialize the app
    updateAll();
    
    // Event Listeners
    transactionForm.addEventListener('submit', addTransaction);
    filterType.addEventListener('change', updateTransactionsList);
    filterMonth.addEventListener('change', updateTransactionsList);
    
    // Functions
    function addTransaction(e) {
        e.preventDefault();
        
        const description = descriptionInput.value.trim();
        const amount = +amountInput.value;
        const type = typeInput.value;
        const date = dateInput.value;
        
        if(description === '' || isNaN(amount) || amount <= 0) {
            alert('Please enter valid description and amount');
            return;
        }
        
        const transaction = {
            id: generateId(),
            description,
            amount,
            type,
            date
        };
        
        transactions.unshift(transaction);
        saveTransactions();
        updateAll();
        
        // Reset form
        transactionForm.reset();
        dateInput.valueAsDate = new Date();
        descriptionInput.focus();
    }
    
    function generateId() {
        return Math.floor(Math.random() * 1000000);
    }
    
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    function updateAll() {
        updateSummary();
        updateTransactionsList();
    }
    
    function updateSummary() {
        const amounts = transactions.map(transaction => ({
            type: transaction.type,
            amount: transaction.amount
        }));
        
        const income = amounts
            .filter(item => item.type === 'income')
            .reduce((sum, item) => sum + item.amount, 0);
        
        const expense = amounts
            .filter(item => item.type === 'expense')
            .reduce((sum, item) => sum + item.amount, 0);
        
        const balance = income - expense;
        
        totalIncomeElement.textContent = formatMoney(income);
        totalExpenseElement.textContent = formatMoney(expense);
        totalBalanceElement.textContent = formatMoney(balance);
        
        // Update balance color based on value
        if(balance > 0) {
            totalBalanceElement.style.color = '#4cc9f0';
        } else if(balance < 0) {
            totalBalanceElement.style.color = '#f72585';
        } else {
            totalBalanceElement.style.color = '#333';
        }
    }
    
    function updateTransactionsList() {
        const type = filterType.value;
        const month = filterMonth.value;
        
        let filteredTransactions = [...transactions];
        
        // Filter by type
        if(type !== 'all') {
            filteredTransactions = filteredTransactions.filter(
                transaction => transaction.type === type
            );
        }
        
        // Filter by month
        if(month) {
            filteredTransactions = filteredTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                return transactionMonth === month;
            });
        }
        
        // Clear the list
        transactionsList.innerHTML = '';
        
        if(filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<p class="empty-message">No transactions found for the selected filters</p>';
            return;
        }
        
        // Add transactions to the list
        filteredTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.classList.add('transaction-item');
            
            const transactionDate = new Date(transaction.date);
            const formattedDate = transactionDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            transactionElement.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${formattedDate}</div>
                </div>
                <div class="transaction-amount ${transaction.type}-amount">
                    ${transaction.type === 'expense' ? '-' : '+'}${formatMoney(transaction.amount)}
                </div>
                <button class="delete-btn" data-id="${transaction.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            transactionsList.appendChild(transactionElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = +this.getAttribute('data-id');
                deleteTransaction(id);
            });
        });
    }
    
    function deleteTransaction(id) {
        if(confirm('Are you sure you want to delete this transaction?')) {
            transactions = transactions.filter(transaction => transaction.id !== id);
            saveTransactions();
            updateAll();
        }
    }
    
    function formatMoney(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
});