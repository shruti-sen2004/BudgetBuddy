const transactions = [];

document.getElementById('form').addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  const text = document.getElementById('text').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = e.submitter.textContent.split(' ')[1];

  if (text === '' || isNaN(amount)) {
    alert('Please add a text and amount');
  } else {
    const transaction = {
      id: generateID(),
      text,
      amount: category === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category
    };

    transactions.push(transaction);
    
    // Remove this line:
    // document.getElementById('filter').value = category;
    
    filterTransactions();
    updateBalance();
    updateIncomeExpenses();
    updateLocalStorage();
    document.getElementById('form').reset();
  }
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
        ${transaction.text} <span>${sign} &#8377; ${Math.abs(transaction.amount)}</span><button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i data-lucide="badge-x" class="lucide"></i></button>
    `;

  document.getElementById('list').prepend(item);
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

function updateDOM(transactionsToDisplay = transactions) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  transactionsToDisplay.forEach(addTransactionDOM);
}

function updateBalance() {
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  document.getElementById('balance').innerHTML = `&#8377;${balance.toFixed(2)}`;
}

function updateIncomeExpenses() {
  const amounts = transactions.map(transaction => transaction.amount);
  const income = amounts
    .filter(amount => amount > 0)
    .reduce((acc, amount) => acc + amount, 0);
  const expense = amounts
    .filter(amount => amount < 0)
    .reduce((acc, amount) => acc + amount, 0) * -1;

  document.getElementById('money-plus').innerHTML = `+&#8377;${income.toFixed(2)}`;
  document.getElementById('money-minus').innerHTML = `-&#8377;${expense.toFixed(2)}`;
  lucide.createIcons();
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function filterTransactions() {
  const filterValue = document.getElementById('filter').value;
  const filteredTransactions = transactions.filter(transaction => {
    if (filterValue === 'all') return true;
    if (filterValue === 'income') return transaction.amount > 0;
    if (filterValue === 'expense') return transaction.amount < 0;
    return false;
  });
  updateDOM(filteredTransactions);
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
  lucide.createIcons();

  // Add event listener for filter dropdown
  document.getElementById('filter').addEventListener('change', filterTransactions);
}

init();
