const transactions = [];

document.getElementById('form').addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  const category = document.getElementById('category').value;
  const text = document.getElementById('text').value;
  let amount = +document.getElementById('amount').value;

  if (text.trim() === '' || amount === 0) {
    alert('Please add a description and amount');
    return;
  }

  // Adjust amount based on category
  if (category === 'expense') {
    amount = -Math.abs(amount);
  } else if (category === 'income') {
    amount = Math.abs(amount);
  }

  const transaction = {
    id: generateID(),
    category,
    text,
    amount
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateBalance();
  updateIncomeExpenses();
  updateLocalStorage();
  document.getElementById('form').reset();
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
        ${transaction.text} <span>${sign} $ ${Math.abs(transaction.amount)}</span><button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

  document.getElementById('list').appendChild(item);
}

function removeTransaction(id) {
  const index = transactions.findIndex(transaction => transaction.id === id);
  if (index !== -1) {
    transactions.splice(index, 1);
    updateDOM();
    updateBalance();
    updateIncomeExpenses();
    updateLocalStorage();
  }
}

function updateDOM() {
  const list = document.getElementById('list');
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
}

function updateBalance() {
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
}

function updateIncomeExpenses() {
  const amounts = transactions.map(transaction => transaction.amount);
  const income = amounts
    .filter(amount => amount > 0)
    .reduce((acc, amount) => acc + amount, 0);
  const expense = amounts
    .filter(amount => amount < 0)
    .reduce((acc, amount) => acc + amount, 0) * -1;

  document.getElementById('money-plus').innerText = `+$${income.toFixed(2)}`;
  document.getElementById('money-minus').innerText = `-$${expense.toFixed(2)}`;
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize the app
function init() {
  const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
  if (localStorageTransactions) {
    transactions.push(...localStorageTransactions);
  }
  updateDOM();
  updateBalance();
  updateIncomeExpenses();
}

init();
