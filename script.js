const EMAIL_REGEX = /^\S+@\S+\.com$/i;
const NAME_REGEX = /^[\p{L}\s]+$/u;
const MIN_PASSWORD_LENGTH = 6;

// getting the error messages and adding them to the form
function showFieldErrors(errors) {
  document.querySelectorAll('input').forEach((input) => {
    const message = errors[input.id] || '';
    document.getElementById('error-' + input.id).textContent = message;
    input.classList.toggle('input-error', message !== '');
  });
}

// for general errors that are not related to a specific field (server or network errors)
function showGeneralError(message) {
  document.getElementById('errors').textContent = message;
}

// fetching data using ajax way
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

// login page 

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const errors = {};

if (email === '') {
  errors.email = 'Email is empty.';
} else if (!EMAIL_REGEX.test(email)) {
  errors.email = 'Please use a valid email format (something@example.com).';
}

if (password === '') {
  errors.password = 'Password is empty.';
} else if (password.trim().length < MIN_PASSWORD_LENGTH) {
  errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
}

showFieldErrors(errors);
showGeneralError('');
if (Object.keys(errors).length > 0) return;

try {
  const { ok, body } = await postJSON('login.php', { email, password });

  if (ok) {
    sessionStorage.setItem('userName', body.name);
    window.location.href = 'home.html';
  } else {
    showGeneralError(body.message || 'Something went wrong.');
  }
} catch {
  showGeneralError('Cannot connect to the server.');
}
  });
}

// register page

const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

const errors = {};

if (name === '') {
  errors.name = 'Name is empty.';
} else if (!NAME_REGEX.test(name)) {
  errors.name = 'Name must contain letters only.';
}

if (email === '') {
  errors.email = 'Email is empty.';
} else if (!EMAIL_REGEX.test(email)) {
  errors.email = 'Please use a valid email format (something@example.com).';
}

if (password === '') {
  errors.password = 'Password is empty.';
} else if (password.trim().length < MIN_PASSWORD_LENGTH) {
  errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
}

if (confirm === '') {
  errors.confirm_password = 'Confirm password is empty.';
} else if (password !== '' && password !== confirm) {
  errors.confirm_password = 'Password and confirm password do not match.';
}

showFieldErrors(errors);
showGeneralError('');
if (Object.keys(errors).length > 0) return;

try {
  const { ok, status, body } = await postJSON('register.php', { name, email, password });

  if (ok) {
    sessionStorage.setItem('userName', body.name);
    window.location.href = 'home.html';
  } else if (status === 409) {
    showFieldErrors({ email: body.message }); 
  } else {
    showGeneralError(body.message || 'Something went wrong.');
  }
} catch {
  showGeneralError('Cannot connect to the server.');
}
  });
}

// Home page

const welcome = document.getElementById('welcome');

if (welcome) {
  const userName = sessionStorage.getItem('userName');

  if (!userName) {
    window.location.href = 'index.html';
  } else {
    welcome.textContent = 'Welcome ' + userName;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('userName');
    window.location.href = 'index.html';
  });
}
