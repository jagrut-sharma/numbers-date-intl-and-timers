'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); // floor method does type coercion itself.

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Numberic Separator:

const a = 1_42_000; // '_' is used as separator to understand 1 lakh and 42 thousand.
console.log(a);

const b = 1.5_00;
console.log(b);

// const c = 1._523; // will gove a syntax error
// const c = _1.523; // will gove a syntax error

console.log(Number('245_26')); // NaN --> Does not work when converting string to number
console.log(parseFloat('245_265')); // 245 --> Will transfer upto digits before '_'
console.log(parseInt('245_265')); // 245 --> Will transfer upto digits before '_'
console.log(parseInt('245_265')); // 245 --> Will transfer upto digits before '_'

/*
// Math methods and Rounding:

console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // Also gives same result
console.log(8 ** (1 / 3)); // 2

console.log(Math.max(25, 12, 17, 89, 8, 16, 54)); // 89
console.log(Math.max(25, '12', 17, '89', 8, 16, 54)); // 89
console.log(Math.max(25, '12', 17, '89px', 8, 16, 54)); // NaN

console.log(Math.min(25, '12', 17, '89', '8', 16, 54)); // 8 --> Same as max

console.log(Math.PI); // 3.141592653589793
console.log(Math.PI * Number.parseFloat(10) ** 2); // 314.1592653589793
console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793

console.log(Math.trunc(25.26265)); // 25
console.log(Math.trunc(Math.random() * 10) + 1); // generates a random number between 1 and 10
// random() returns a number between 0(inclusive) and 1(exclusive)

const randomNumGenerator = function (min, max) {
  return Math.trunc(Math.random() * (max - min + 1)) + 1; // max-min+1 is done to include max as well
  // only using max-min does not include max.
};

console.log(randomNumGenerator(1, 6)); // Random no. between 1 & 6, both inclusive
console.log(randomNumGenerator(1, 20)); // // Random no. between 1 & 20, both inclusive

console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

console.log(Math.ceil(24.3)); // 25
console.log(Math.ceil(24.9)); // 25

console.log(Math.floor(24.3)); // 24
console.log(Math.floor('24.9')); // 24

console.log(Math.trunc(23.8)); // 24
console.log(Math.trunc(-23.8)); // -23
console.log(Math.floor(-23.8)); // -24

// Rounding Decimals:

console.log((2.73262).toFixed(0)); // 3
console.log((2.73262).toFixed(2)); // 2.73
console.log(typeof (2.73262).toFixed(3)); // string --> toFixed always returns string
console.log(typeof +(2.73262).toFixed(3)); // number

/*
console.log(23 === 23.0);
console.log(0.1 + 0.2);
console.log(0.3 === 0.1 + 0.2);

// Conversion:
console.log(Number(23)); // 23
console.log('23'); // 23
console.log(+'23'); // 23
console.log(+'23X'); // NaN

//Parsing:
console.log(Number.parseInt('30px')); // 30 --> automatically extracts 30 from string
console.log(Number.parseInt('px35sda')); // NaN --> Number should be first
console.log(Number.parseInt('   50rem    ')); // NaN --> Even if spaces are present, they will be ignored

console.log(Number.parseFloat('2.5rem')); // 2.5
console.log(Number.parseFloat('  2.5rem      ')); // 2.5
console.log(Number.parseInt('  2.5rem      ')); // 2 --> as it is int

// Check if value is NaN

console.log(Number.isNaN(45)); // false
console.log(Number.isNaN('45')); // false
console.log(Number.isNaN(+'50XE')); // true --> because +'50XE' is NaN, only parseInt automatically took value
console.log(Number.isNaN(23 / 0)); // false --> its infinity

// To check if value is number:
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite('20/0')); // false

// TO check if its interger
console.log(Number.isInteger(75)); // true
console.log(Number.isInteger('75')); // false
console.log(Number.isInteger(75.0)); // true --> as it is still a integer
console.log(Number.isInteger(75 / 0)); // false
*/
