const state = {
  user: null,
  company: {
    name: '(주) 바이브코딩',
    type: '법인사업자',
    regNum: '123-45-67890'
  },
  vat: {
    period: '2024년 1분기',
    amount: 1234567,
    tax: 123456,
    status: '신고완료'
  },
  sales: [
    { 구분: '세금계산서', 건수: 15, 공급가액: 2345678, 세액: 234568 },
    { 구분: '계산서', 건수: 8, 공급가액: 1234567, 세액: 123457 },
    { 구분: '카드', 건수: 45, 공급가액: 4567890, 세액: 456789 },
    { 구분: '현금영수증', 건수: 23, 공급가액: 3456789, 세액: 345679 },
    { 구분: '그 외', 건수: 5, 공급가액: 456789, 세액: 45679 }
  ]
};

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const btnKakao = document.getElementById('btnKakao');
const btnSignIn = document.getElementById('btnSignIn');
const btnLogout = document.getElementById('btnLogout');

const loginId = document.getElementById('loginId');
const loginPw = document.getElementById('loginPw');
const keepLogin = document.getElementById('keepLogin');

const welcomeMessage = document.getElementById('welcomeMessage');
const companyName = document.getElementById('companyName');
const companyType = document.getElementById('companyType');
const companyRegNum = document.getElementById('companyRegNum');
const vatPeriod = document.getElementById('vatPeriod');
const vatAmount = document.getElementById('vatAmount');
const vatTax = document.getElementById('vatTax');
const vatStatus = document.getElementById('vatStatus');
const salesTableBody = document.querySelector('#salesTable tbody');
const documentsGrid = document.getElementById('documentsGrid');

btnKakao.addEventListener('click', () => completeLogin('카카오 사용자'));
btnSignIn.addEventListener('click', () => {
  const name = loginId.value.trim() || '대표님';
  completeLogin(name);
});

btnLogout.addEventListener('click', () => {
  state.user = null;
  loginId.value = '';
  loginPw.value = '';
  keepLogin.checked = false;
  dashboardScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

function completeLogin(name) {
  state.user = { name };
  welcomeMessage.textContent = `${state.user.name}님, 환영해요!`;
  loginId.value = '';
  loginPw.value = '';
  keepLogin.checked = false;
  renderDashboard();
  toggleScreens();
}

function toggleScreens() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
}

function renderDashboard() {
  companyName.textContent = state.company.name;
  companyType.textContent = state.company.type;
  companyRegNum.textContent = state.company.regNum;
  vatPeriod.textContent = state.vat.period;
  vatAmount.textContent = formatKRW(state.vat.amount);
  vatTax.textContent = formatKRW(state.vat.tax);
  vatStatus.textContent = state.vat.status;
  renderSalesTable();
  renderDocuments();
}

function renderSalesTable() {
  salesTableBody.innerHTML = '';
  state.sales.forEach((row) => {
    const tr = document.createElement('tr');
    ['구분', '건수', '공급가액', '세액'].forEach((key) => {
      const td = document.createElement('td');
      const value = row[key];
      td.textContent = typeof value === 'number' && key !== '건수' ? formatKRW(value, false) : value;
      tr.appendChild(td);
    });
    salesTableBody.appendChild(tr);
  });
}

function renderDocuments() {
  documentsGrid.innerHTML = '';
  state.sales.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'document-card';

    const icon = document.createElement('div');
    icon.className = 'document-icon';
    icon.textContent = getIcon(item.구분);
    card.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'document-title';
    title.textContent = item.구분;
    card.appendChild(title);

    const count = document.createElement('div');
    count.className = 'document-count';
    count.textContent = `${item.건수}건`;
    card.appendChild(count);

    const amount = document.createElement('div');
    amount.className = 'document-amount';
    amount.textContent = formatKRW(item.공급가액 + item.세액);
    card.appendChild(amount);

    const button = document.createElement('button');
    button.className = 'btn-outline';
    button.textContent = '상세보기';
    button.type = 'button';
    card.appendChild(button);

    documentsGrid.appendChild(card);
  });
}

function getIcon(type) {
  switch (type) {
    case '세금계산서':
      return '📄';
    case '계산서':
      return '🧾';
    case '카드':
      return '💳';
    case '현금영수증':
      return '🧾';
    default:
      return '📦';
  }
}

function formatKRW(value, withSymbol = true) {
  const formatted = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value || 0);
  return withSymbol ? formatted : formatted.replace('₩', '');
}
