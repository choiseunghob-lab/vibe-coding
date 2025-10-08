const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const btnKakao = document.getElementById('btnKakao');
const btnSignIn = document.getElementById('btnSignIn');
const loginId = document.getElementById('loginId');
const loginPw = document.getElementById('loginPw');
const keepLogin = document.getElementById('keepLogin');

btnKakao.addEventListener('click', showDashboard);
btnSignIn.addEventListener('click', () => {
  showDashboard();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !dashboardVisible()) {
    showDashboard();
  }
});


function dashboardVisible() {
  return !dashboardScreen.classList.contains('hidden');
}

function clearLoginForm() {
  loginId.value = '';
  loginPw.value = '';
  keepLogin.checked = false;
}
