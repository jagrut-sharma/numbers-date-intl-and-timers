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

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const dateMov = `${date.getDate()}`.padStart(2, 0);
    const displayDate = `${dateMov}/${month}/${year}`;

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
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
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// Fake Login
currentAccount = account1;
containerApp.style.opacity = 100;
updateUI(account1);

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

    // Date

    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const date = `${now.getDate()}`.padStart(2, 0);
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${date}/${month}/${year}, ${hour}:${min}`;

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

    // Adding dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

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

    // Add Date
    currentAccount.movementsDates.push(new Date().toISOString());

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
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
// DATE AND TIME:

const now = new Date();
console.log(now); // Will print current date e.g.: Tue Dec 20 2022 20:32:21 GMT+0530 (India Standard Time)
// Willtake a string to give date output --> Automatically detects output
console.log(new Date('Dec 20 2022 20:31:41')); // Tue Dec 20 2022 20:31:41 GMT+0530 (India Standard Time)
console.log(new Date('Dec 25 2022'));
console.log(new Date(account1.movementsDates[0]));

// by using parameters
console.log(new Date(2022, 6, 13, 12, 54, 23));
console.log(new Date(2022, 3, 31)); // Was supposed to be Apr 31 but since it doesn't exist, automatically switches to 1 May.

// In milliseconds
console.log(new Date(0)); // 0 is in milliseconds --> Thu Jan 01 1970 05:30:00 GMT+0530 (India Standard Time)
console.log(new Date(2000)); // 2000ms = 2s, --> Thu Jan 01 1970 05:30:02 GMT+0530 (India Standard Time) --> See time is increased by 2s
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // 3 days after unix time

// Working with Dates
console.log('------------------------------------------');
const future = new Date(2037, 4, 13, 16, 15, 12);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // Converts to ISO string --> this string can be passed as parameter to convert to date.
console.log(future.getTime()); // Gives timestamp for a date --> milliseconds passed since 1st Jan, 1970 --> 2125824312000
console.log(new Date(2125824312000)); // --> Gives same date
console.log(Date.now()); // Timestamp for current time

future.setFullYear(2040);
console.log(future); // set Year to 2040 --> Similarly other methods exist

/*
// BigINT:

console.log(2 ** 53 - 1); // Biggest possible integer
console.log(Number.MAX_SAFE_INTEGER); // will also give same result

console.log(2 ** 53 + 7); // Will give wrong result

// To make a big int use n as suffix
console.log(4862162619849131322649851612226265151616518432316n);
console.log(BigInt(4862162619849131322649851612226265151616518432316));
// Will give wrong result because the number needs  to be stored as int first and then is converted to BigInt and since it is larger than 2^53, it gives wrong results. So use BigInt() method for small numbers only.

// Operations

console.log(10000n + 10000n);
console.log(26446565162154164264n * 6646616161616465456n); // 175780167426016847622872151319305664384n

// console.log(100 + 10000n); // Gives error

const a = 10;
const b = 100n;
// console.log(a * b); // gives error --> Can't mix bigint and int
console.log(BigInt(a) * b); // 1000n

console.log(typeof b); // bigint
console.log(typeof a); // number

console.log(20n > 15); // true
console.log(20n === 20); // false --> as one on bigint and another number
console.log(20n == 20); // true --> as bigint will be type coerced

// console.log(Math.sqrt(b)); // gives type error --> Math functions do not work as they are bigint and not regular number

console.log(b + ' is really big'); // 100 is really big

// divisions

console.log(10n / 3n); // 3n --> omits the decimal part.
console.log(10 / 3); // 3.3333333333333335

/*
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
