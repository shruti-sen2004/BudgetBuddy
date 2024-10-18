const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const filter = document.getElementById('filter');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function addTransaction(e) {
    e.preventDefault();
    
    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please add a text and amount');
        return;
    }
    
    const transaction = {
        id: generateID(),
        text: text.value,
        amount: +amount.value,
        type: e.submitter.dataset.type
    };
    
    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    text.value = '';
    amount.value = '';
}

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

function addTransactionDOM(transaction) {
    const sign = transaction.type === 'expense' ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add(transaction.type);
    item.innerHTML = `
        ${transaction.text} <span>${sign}₹${Math.abs(transaction.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
            <i data-lucide="x" class="lucide"></i>
        </button>
    `;
    list.appendChild(item);
    lucide.createIcons();
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.type === 'expense' ? -transaction.amount : transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);
    
    balance.textContent = `₹${total}`;
    moneyPlus.textContent = `₹${income}`;
    moneyMinus.textContent = `₹${expense}`;
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function filterTransactions() {
    const filterValue = filter.value;
    const filteredTransactions = transactions.filter(transaction => {
        if (filterValue === 'all') return true;
        return transaction.type === filterValue;
    });
    init(filteredTransactions);
}

function init(transactionsToDisplay = transactions) {
    list.innerHTML = '';
    transactionsToDisplay.forEach(addTransactionDOM);
    updateValues();
    lucide.createIcons(); // Create Lucide icons
}

form.addEventListener('submit', addTransaction);
filter.addEventListener('change', filterTransactions);

init();

// Add smooth scrolling
function scrollToNewTransaction() {
    list.lastElementChild.scrollIntoView({ behavior: 'smooth' });
}

// Animate balance changes
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = `₹${(progress * (end - start) + start).toFixed(2)}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Override updateValues function to include animations
function updateValues() {
    const amounts = transactions.map(transaction => transaction.type === 'expense' ? -transaction.amount : transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);
    
    animateValue(balance, parseFloat(balance.textContent.replace('₹', '')), total, 300);
    animateValue(moneyPlus, parseFloat(moneyPlus.textContent.replace('₹', '')), income, 300);
    animateValue(moneyMinus, parseFloat(moneyMinus.textContent.replace('₹', '')), expense, 300);
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateTheme();
});

function updateTheme() {
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Check for saved theme preference
function loadTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    body.classList.toggle('dark-mode', isDarkMode);
}

// Initialize theme
loadTheme();

// Call lucide.createIcons() after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});
