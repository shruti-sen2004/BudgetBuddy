const transactions = [];

document.getElementById('form').addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  const text = document.getElementById('text').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const category = e.submitter.textContent.split(' ')[1];

  if (text === '' || isNaN(amount) || date === '') {
    alert('Please add a text and amount');
  } else {
    const transaction = {
      id: generateID(),
      text,
      amount: category === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category,
      date
    };

    transactions.push(transaction);
    
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
        ${transaction.text} <span>${sign} &#8377; ${Math.abs(transaction.amount).toFixed(2)}</span><button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i data-lucide="badge-x" class="lucide"></i></button>
    `; // Reverting to the simpler, original structure now that the date is separate

  return item; // Return the li element
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

function groupTransactionsByDate(transactionsArray) {
  // Sort the transactions first, usually from newest date to oldest
  const sortedTransactions = [...transactionsArray].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return sortedTransactions.reduce((groups, transaction) => {
    // transaction.date is expected to be an ISO string like "YYYY-MM-DD"
    const date = transaction.date; 
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
}

function updateDOM(transactionsToDisplay = transactions) {
  const list = document.getElementById('list');
  list.innerHTML = '';

  const groupedTransactions = groupTransactionsByDate(transactionsToDisplay);

  Object.keys(groupedTransactions).forEach(date => {
    const transactionsOnDate = groupedTransactions[date];

    // Create date header
    const dateHeader = document.createElement('h4');
    dateHeader.classList.add('date-header');
    
    const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short',year: 'numeric'  });
    dateHeader.textContent = formattedDate;
    
    list.appendChild(dateHeader);

    // Append transactions
    transactionsOnDate.forEach(transaction => {
        list.appendChild(addTransactionDOM(transaction));
    });
  });
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

  // <--- NEW: Set default date to today for convenience
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

init();
