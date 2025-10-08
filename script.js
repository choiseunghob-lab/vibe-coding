const state = {
  user: null,
  accounts: [
    {
      type: '개인사업자',
      owner: '정지인 대표님',
      amount: 1234567,
      status: '환급 예상',
      buttons: [
        { label: '환급신청', style: 'btn-light' },
        { label: '정기세 신고', style: 'btn-outline' }
      ]
    },
    {
      type: '개인사업자',
      owner: '김유린 대표님',
      amount: 1234567,
      status: '환급 예정 D-70',
      buttons: [
        { label: '결제수단 등록', style: 'btn-tonal' }
      ]
    },
    {
      type: '개인사업자',
      owner: '김아름 대표님',
      amount: 1234567,
      status: '환급 확정',
      buttons: [
        { label: '결제대기', style: 'btn-outline' },
        { label: '입금계좌', style: 'btn-tonal' }
      ]
    },
    {
      type: '개인사업자',
      owner: '강지윤 대표님',
      amount: 1234567,
      status: '환급 확정',
      buttons: [
        { label: '입금계좌', style: 'btn-tonal' }
      ]
    }
  ]
};

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const btnKakao = document.getElementById('btnKakao');
const btnSignIn = document.getElementById('btnSignIn');
const userName = document.getElementById('userName');
const accountList = document.getElementById('accountList');

btnKakao.addEventListener('click', () => {
  completeLogin('홍길동');
});

btnSignIn.addEventListener('click', () => {
  const name = document.getElementById('loginId').value.trim() || '대표님';
  completeLogin(name);
});

function completeLogin(name) {
  state.user = { name };
  userName.textContent = state.user.name;
  renderAccounts();
  toggleScreens();
}

function toggleScreens() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
}

function renderAccounts() {
  accountList.innerHTML = '';
  state.accounts.forEach((account) => {
    const card = document.createElement('article');
    card.className = 'account-card';

    const meta = document.createElement('div');
    meta.className = 'account-meta';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = account.type;
    meta.appendChild(badge);
    card.appendChild(meta);

    const owner = document.createElement('div');
    owner.className = 'account-owner';
    owner.textContent = account.owner;
    card.appendChild(owner);

    const amount = document.createElement('div');
    amount.className = 'account-amount';
    amount.textContent = formatCurrency(account.amount);
    card.appendChild(amount);

    const status = document.createElement('div');
    status.className = 'account-status';
    status.textContent = account.status;
    card.appendChild(status);

    if (account.buttons?.length) {
      const actions = document.createElement('div');
      actions.className = 'account-actions';
      account.buttons.forEach((btn) => {
        const actionBtn = document.createElement('button');
        actionBtn.className = btn.style;
        actionBtn.textContent = btn.label;
        actions.appendChild(actionBtn);
      });
      card.appendChild(actions);
    }

    accountList.appendChild(card);
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value);
}
