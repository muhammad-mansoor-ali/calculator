// app.js
const inputBox = document.getElementById('inputbox');
const buttons = document.querySelectorAll('button');

let resultShown = false;

const OPERATORS = ['+', '-', '*', '/'];

function isOperator(ch) {
  return OPERATORS.includes(ch);
}

function setDisplay(value) {
  inputBox.value = value;
}

function getDisplay() {
  return inputBox.value || '0';
}

function reset() {
  setDisplay('0');
  resultShown = false;
}

function deleteLast() {
  const val = getDisplay();
  if (val.length <= 1) {
    reset();
  } else {
    setDisplay(val.slice(0, -1));
  }
}

function findLastNumberInfo(str) {
  // Matches last number optionally with a decimal and an optional leading minus wrapped in parentheses
  // Examples matched: 123, -123, 12.3, (-12.3)
  const match = str.match(/(-?\d+(\.\d+)?)\)?$/);
  if (!match) return null;
  const value = match[1];
  const index = match.index;
  return { value, index };
}

function appendDigit(d) {
  let val = getDisplay();
  if (val === '0' && d !== '.') {
    setDisplay(String(d));
    resultShown = false;
    return;
  }
  if (resultShown) {
    // If previous operation was a result and user types a digit, start new calc
    setDisplay(String(d));
    resultShown = false;
    return;
  }
  setDisplay(val + d);
}

function appendOperator(op) {
  let val = getDisplay();
  const lastChar = val.slice(-1);

  if (isOperator(lastChar)) {
    // If last is operator and new operator is '-' then allow negative numbers (like 5 * -3)
    if (op === '-' && lastChar !== '-') {
      setDisplay(val + op);
      resultShown = false;
      return;
    }
    // Replace trailing operator with new operator (for user convenience)
    setDisplay(val.slice(0, -1) + op);
    resultShown = false;
    return;
  }

  // If result was shown and the user pressed an operator, continue with the result
  if (resultShown) {
    resultShown = false;
  }

  setDisplay(val + op);
}

function toggleSign() {
  let val = getDisplay();
  // Find last number in the string and swap its sign
  const numberInfo = findLastNumberInfo(val);
  if (!numberInfo) {
    // If nothing to toggle, toggle whole display
    if (val !== '0') {
      const toggled = String(-parseFloat(val));
      setDisplay(toggled);
    }
    return;
  }
  const { value, index } = numberInfo;
  const n = parseFloat(value);
  const replaced = String((-n));
  const newStr = val.slice(0, index) + replaced;
  setDisplay(newStr);
}

function handlePercent() {
  // Convert last number to percentage (divide by 100)
  let val = getDisplay();
  const numberInfo = findLastNumberInfo(val);
  if (!numberInfo) return;
  const { value, index } = numberInfo;
  const n = parseFloat(value);
  const percentValue = n / 100;
  // Keep max precision safe
  const replaced = String(percentValue);
  const newStr = val.slice(0, index) + replaced;
  setDisplay(newStr);
}

function addDecimal() {
  let val = getDisplay();
  const numberInfo = findLastNumberInfo(val);
  if (!numberInfo) {
    // no number, append 0.
    setDisplay(val + '0.');
    resultShown = false;
    return;
  }
  const { value } = numberInfo;
  if (value.includes('.')) {
    // already has decimal
    return;
  }
  // If resultShown -> start new number
  if (resultShown) {
    setDisplay('0.');
    resultShown = false;
    return;
  }
  setDisplay(val + '.');
}

function evaluateExpression() {
  let expr = getDisplay();

  // avoid ending expression with operators
  while (expr.length && isOperator(expr.slice(-1))) {
    expr = expr.slice(0, -1);
  }

  if (!expr) {
    setDisplay('0');
    return;
  }

  try {
    // Evaluate safely: expression assembled only from buttons
    // (if you want to be extra safe, you can parse and evaluate with mathjs or custom-parser)
    const result = Function('"use strict"; return (' + expr + ')')();

    if (result === Infinity || Number.isNaN(result)) {
      setDisplay('Error');
    } else {
      // Show result without unnecessary decimals
      setDisplay(String(result));
    }
    resultShown = true;
  } catch (e) {
    setDisplay('Error');
    resultShown = true;
  }
}

// Add click handlers to every button
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const t = btn.textContent.trim();

    if (t === 'AC') {
      reset();
      return;
    }
    if (t === 'DEL') {
      deleteLast();
      return;
    }
    if (t === '%') {
      // use percent as percent of the last operand
      handlePercent();
      return;
    }
    if (btn.id === 'plusminus') {
      toggleSign();
      return;
    }
    if (btn.id === 'eqBtn' || t === '=') {
      evaluateExpression();
      return;
    }
    if (t === '.') {
      addDecimal();
      return;
    }
    if (isOperator(t)) {
      appendOperator(t);
      return;
    }
    // digits
    if (/^\d$/.test(t)) {
      appendDigit(t);
      return;
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (/^\d$/.test(key)) {
    appendDigit(key);
    e.preventDefault();
    return;
  }
  if (key === '.') {
    addDecimal();
    e.preventDefault();
    return;
  }
  if (OPERATORS.includes(key)) {
    appendOperator(key);
    e.preventDefault();
    return;
  }
  if (key === 'Enter' || key === '=') {
    evaluateExpression();
    e.preventDefault();
    return;
  }
  if (key === 'Backspace') {
    deleteLast();
    e.preventDefault();
    return;
  }
  if (key === 'Escape') {
    reset();
    e.preventDefault();
    return;
  }
  if (key === '%') {
    handlePercent();
    e.preventDefault();
    return;
  }
  if (key === '±') {
    toggleSign();
    e.preventDefault();
    return;
  }
});

// start with 0
reset();