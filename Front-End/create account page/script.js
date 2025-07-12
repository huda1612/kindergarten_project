// إظهار/إخفاء كلمة المرور
const passwordInput = document.querySelector('input[type="password"]');
const lockIcon = document.querySelector('.bxs-lock-alt');
lockIcon.style.cursor = 'pointer';
lockIcon.title = 'إظهار/إخفاء كلمة المرور';
lockIcon.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    lockIcon.classList.remove('bxs-lock-alt');
    lockIcon.classList.add('bxs-lock-open');
  } else {
    passwordInput.type = 'password';
    lockIcon.classList.remove('bxs-lock-open');
    lockIcon.classList.add('bxs-lock-alt');
  }
});

// رسائل خطأ عند ترك الحقول فارغة
const form = document.querySelector('form');
const modal = document.getElementById('success-modal');
const goLoginBtn = document.getElementById('go-login-btn');

form.addEventListener('submit', function(e) {
  const username = form.querySelector('input[type="text"]');
  const password = form.querySelector('input[type="password"], input[type="text"][placeholder="كلمة المرور"]');
  let valid = true;
  form.querySelectorAll('.error-msg').forEach(e => e.remove());
  if (!username.value.trim()) {
    showError(username, 'يرجى إدخال اسم المستخدم');
    valid = false;
  }
  if (!password.value.trim()) {
    showError(password, 'يرجى إدخال كلمة المرور');
    valid = false;
  }
  if (!valid) {
    e.preventDefault();
    return;
  }
  // منع الإرسال الفعلي وإظهار النافذة
  e.preventDefault();
  modal.style.display = 'flex';
});

goLoginBtn.addEventListener('click', function() {
  window.location.href = '../login page/index.html';
});

function showError(input, msg) {
  const error = document.createElement('div');
  error.className = 'error-msg';
  error.textContent = msg;
  error.style.color = 'red';
  error.style.fontSize = '0.9em';
  error.style.marginTop = '4px';
  input.parentNode.appendChild(error);
}

// تحريك العناصر عند الدخول للصفحة
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.wrapper').classList.add('show');
});

