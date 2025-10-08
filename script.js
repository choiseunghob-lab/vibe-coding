const state = {
  user: null,
  consent: { scrape: false, privacy: false },
  sales: [],
  purchases: [],
  returnDoc: null,
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

const btnConsent = document.getElementById('btnConsent');
const btnConnectHometax = document.getElementById('btnConnectHometax');
const btnMakeReturn = document.getElementById('btnMakeReturn');
const btnDownloadXml = document.getElementById('btnDownloadXml');
const btnDownloadPdf = document.getElementById('btnDownloadPdf');
const btnSubmitHometax = document.getElementById('btnSubmitHometax');

btnKakao.addEventListener('click', () => {
  completeLogin('홍길동');
});

btnSignIn.addEventListener('click', () => {
  const name = document.getElementById('loginId').value.trim() || '대표님';
  completeLogin(name);
});

btnConsent.addEventListener('click', () => {
  state.consent.scrape = document.getElementById('agreeScrape').checked;
  state.consent.privacy = document.getElementById('agreePrivacy').checked;
  if (!(state.consent.scrape && state.consent.privacy)) {
    alert('모든 동의 항목을 체크해 주세요.');
    return;
  }
  show('#hometax-section', true);
});

btnConnectHometax.addEventListener('click', async () => {
  const status = document.getElementById('hometaxStatus');
  status.textContent = '연결 시도 중';
  await sleep(500);
  status.textContent = '인증 성공(데모)';
  show('#progress-section', true);
  startScrapeDemo();
});

btnMakeReturn.addEventListener('click', () => {
  const salesTax = state.sales.reduce((sum, row) => sum + row.세액, 0);
  const purchaseTax = state.purchases.reduce((sum, row) => sum + row.세액, 0);
  const payable = Math.max(0, salesTax - purchaseTax);
  state.returnDoc = {
    매출세액: salesTax,
    매입세액: purchaseTax,
    납부세액: payable
  };

  const summary = document.getElementById('returnSummary');
  summary.innerHTML = '';
  Object.entries(state.returnDoc).forEach(([key, value]) => {
    const li = document.createElement('li');
    li.textContent = `${key}: ${formatKRW(value)}`;
    summary.appendChild(li);
  });

  show('#return-section', true);
});

btnDownloadXml.addEventListener('click', () => {
  alert('데모: XML 생성은 서버 구현이 필요합니다.');
});

btnDownloadPdf.addEventListener('click', () => {
  window.print();
});

btnSubmitHometax.addEventListener('click', async () => {
  const status = document.getElementById('submitStatus');
  status.textContent = '제출 중(데모)';
  await sleep(800);
  status.textContent = '제출 완료(데모)';
});

function completeLogin(name) {
  state.user = { name };
  userName.textContent = state.user.name;
  renderAccounts();
  toggleScreens();
  resetWorkflow();
}

function toggleScreens() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
}

function resetWorkflow() {
  document.getElementById('agreeScrape').checked = false;
  document.getElementById('agreePrivacy').checked = false;
  document.getElementById('hometaxStatus').textContent = '';
  document.getElementById('scrapeProgress').value = 0;
  document.getElementById('progressLog').innerHTML = '';
  document.getElementById('salesTotal').textContent = '-';
  document.getElementById('purchaseTotal').textContent = '-';
  document.getElementById('salesTable').innerHTML = '';
  document.getElementById('purchaseTable').innerHTML = '';
  document.getElementById('returnSummary').innerHTML = '';
  document.getElementById('submitStatus').textContent = '';

  state.consent.scrape = false;
  state.consent.privacy = false;
  state.sales = [];
  state.purchases = [];
  state.returnDoc = null;

  show('#consent-section', true);
  show('#hometax-section', false);
  show('#progress-section', false);
  show('#preview-section', false);
  show('#return-section', false);
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
  return formatKRW(value);
}

function formatKRW(value, withSymbol = true) {
  const formatted = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value || 0);
  return withSymbol ? formatted : formatted.replace('₩', '');
}

function $(selector) {
  return document.querySelector(selector);
}

function show(selector, shouldShow = true) {
  const element = typeof selector === 'string' ? $(selector) : selector;
  if (!element) return;
  element.classList[shouldShow ? 'remove' : 'add']('hidden');
}

function table(selector, headers, rows) {
  const element = $(selector);
  if (!element) return;
  element.innerHTML = '';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    headers.forEach((header) => {
      const td = document.createElement('td');
      if (header in row) {
        const value = row[header];
        td.textContent = typeof value === 'number' ? formatKRW(value, false) : value;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  element.appendChild(thead);
  element.appendChild(tbody);
}

function renderPreview() {
  const salesTotal = state.sales.reduce((total, row) => total + row.공급가액 + row.세액, 0);
  const purchaseTotal = state.purchases.reduce((total, row) => total + row.공급가액 + row.세액, 0);

  document.getElementById('salesTotal').textContent = formatKRW(salesTotal);
  document.getElementById('purchaseTotal').textContent = formatKRW(purchaseTotal);

  table('#salesTable', ['구분', '공급가액', '세액', '건수'], state.sales);
  table('#purchaseTable', ['구분', '공급가액', '세액', '건수'], state.purchases);

  show('#preview-section', true);
}

async function startScrapeDemo() {
  const log = (message) => {
    const container = document.getElementById('progressLog');
    container.innerHTML += `<div>${new Date().toLocaleTimeString()} • ${message}</div>`;
    container.scrollTop = container.scrollHeight;
  };

  for (let progress = 0; progress <= 100; progress += 20) {
    document.getElementById('scrapeProgress').value = progress;
    log(`${progress}% 완료`);
    await sleep(400);
  }

  state.sales = [
    { 구분: '전자세금계산서', 공급가액: 12000000, 세액: 1200000, 건수: 12 },
    { 구분: '세금계산서', 공급가액: 3000000, 세액: 300000, 건수: 3 },
    { 구분: '카드', 공급가액: 5000000, 세액: 500000, 건수: 50 },
    { 구분: '현금영수증', 공급가액: 800000, 세액: 80000, 건수: 8 },
    { 구분: '그외', 공급가액: 200000, 세액: 20000, 건수: 2 }
  ];

  state.purchases = [
    { 구분: '전자세금계산서', 공급가액: 7000000, 세액: 700000, 건수: 10 },
    { 구분: '신용카드', 공급가액: 2000000, 세액: 200000, 건수: 25 },
    { 구분: '현금영수증', 공급가액: 600000, 세액: 60000, 건수: 7 }
  ];

  renderPreview();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
