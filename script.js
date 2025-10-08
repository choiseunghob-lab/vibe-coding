// 상태
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
      buttons: [{ label: '결제수단 등록', style: 'btn-tonal' }]
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
      buttons: [{ label: '입금계좌', style: 'btn-tonal' }]
    }
  ]
};

// 엘리먼트
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

// 유틸
const $ = (sel) => document.querySelector(sel);
function show(selector, on = true) {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (!el) return;
  el.classList[on ? 'remove' : 'add']('hidden');
}
function formatKRW(value, withSymbol = true) {
  const formatted = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value || 0);
  return withSymbol ? formatted : formatted.replace('₩', '');
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// 로그인
btnKakao.addEventListener('click', () => completeLogin('홍길동'));
btnSignIn.addEventListener('click', () => {
  const name = document.getElementById('loginId').value.trim() || '대표님';
  completeLogin(name);
});

function completeLogin(name) {
  state.user = { name };
  userName.textContent = state.user.name;
  $('#loginId').value = '';
  $('#loginPw').value = '';
  $('#keepLogin').checked = false;
  renderAccounts();
  toggleScreens();
  resetWorkflow();
}

function toggleScreens() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
}

// 동의 → 홈택스
btnConsent.addEventListener('click', () => {
  state.consent.scrape = $('#agreeScrape').checked;
  state.consent.privacy = $('#agreePrivacy').checked;
  if (!(state.consent.scrape && state.consent.privacy)) {
    alert('모든 동의 항목을 체크해 주세요.');
    return;
  }
  show('#consent-section', false);
  show('#hometax-section', true);
});

btnConnectHometax.addEventListener('click', async () => {
  $('#hometaxStatus').textContent = '연결 시도 중';
  await sleep(500);
  $('#hometaxStatus').textContent = '인증 성공(데모)';
  show('#hometax-section', false);
  show('#progress-section', true);
  startScrapeDemo();
});

// 스크래핑 진행 시뮬레이터
async function startScrapeDemo() {
  const log = (t) => ($('#progressLog').innerHTML += `<div>${new Date().toLocaleTimeString()} • ${t}</div>`);
  for (let i = 0; i <= 100; i += 20) {
    $('#scrapeProgress').value = i;
    log(`${i}% 완료`);
    await sleep(400);
  }
  state.sales = [
    { 구분: '전자세금계산서', 공급가액: 12000000, 세액: 1200000, 건수: 12 },
    { 구분: '세금계산서',     공급가액:  3000000, 세액:  300000, 건수:  3 },
    { 구분: '카드',           공급가액:  5000000, 세액:  500000, 건수: 50 },
    { 구분: '현금영수증',     공급가액:   800000, 세액:   80000, 건수:  8 },
    { 구분: '그외',           공급가액:   200000, 세액:   20000, 건수:  2 }
  ];
  state.purchases = [
    { 구분: '전자세금계산서', 공급가액: 7000000, 세액: 700000, 건수: 10 },
    { 구분: '신용카드',       공급가액: 2000000, 세액: 200000, 건수: 25 },
    { 구분: '현금영수증',     공급가액:  600000, 세액:  60000, 건수:  7 }
  ];
  renderPreview();
}

function renderPreview() {
  const salesTotal = state.sales.reduce((s, r) => s + r.공급가액 + r.세액, 0);
  const purchaseTotal = state.purchases.reduce((s, r) => s + r.공급가액 + r.세액, 0);
  $('#salesTotal').textContent = formatKRW(salesTotal);
  $('#purchaseTotal').textContent = formatKRW(purchaseTotal);
  renderTable('#salesTable', ['구분','공급가액','세액','건수'], state.sales);
  renderTable('#purchaseTable', ['구분','공급가액','세액','건수'], state.purchases);
  show('#progress-section', false);
  show('#preview-section', true);
}

function renderTable(selector, headers, rows) {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (!el) return;
  el.innerHTML = '';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach((h) => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    headers.forEach((h) => {
      const td = document.createElement('td');
      if (h in row) {
        const v = row[h];
        td.textContent = typeof v === 'number' ? formatKRW(v, false) : String(v);
      } else {
        td.textContent = '';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  el.appendChild(thead);
  el.appendChild(tbody);
}

// 신고서 생성/다운로드/제출
btnMakeReturn.addEventListener('click', () => {
  const salesTax = state.sales.reduce((s, r) => s + r.세액, 0);
  const purchaseTax = state.purchases.reduce((s, r) => s + r.세액, 0);
  const payable = Math.max(0, salesTax - purchaseTax);
  state.returnDoc = { 매출세액: salesTax, 매입세액: purchaseTax, 납부세액: payable };

  const ul = $('#returnSummary');
  ul.innerHTML = '';
  Object.entries(state.returnDoc).forEach(([k, v]) => {
    const li = document.createElement('li');
    li.textContent = `${k}: ${formatKRW(v)}`;
    ul.appendChild(li);
  });

  show('#preview-section', false);
  show('#return-section', true);
});

btnDownloadXml.addEventListener('click', () => alert('데모: XML 생성은 서버 구현이 필요합니다.'));
btnDownloadPdf.addEventListener('click', () => window.print());
btnSubmitHometax.addEventListener('click', async () => {
  $('#submitStatus').textContent = '제출 중(데모)';
  await sleep(800);
  $('#submitStatus').textContent = '제출 완료(데모)';
});

// 계정 카드 렌더
function renderAccounts() {
  accountList.innerHTML = '';
  state.accounts.forEach((a) => {
    const card = document.createElement('article');
    card.className = 'account-card';

    const meta = document.createElement('div');
    meta.className = 'account-meta';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = a.type;
    meta.appendChild(badge);
    card.appendChild(meta);

    const owner = document.createElement('div');
    owner.className = 'account-owner';
    owner.textContent = a.owner;
    card.appendChild(owner);

    const amount = document.createElement('div');
    amount.className = 'account-amount';
    amount.textContent = formatKRW(a.amount);
    card.appendChild(amount);

    const status = document.createElement('div');
    status.className = 'account-status';
    status.textContent = a.status;
    card.appendChild(status);

    if (a.buttons?.length) {
      const actions = document.createElement('div');
      actions.className = 'account-actions';
      a.buttons.forEach((b) => {
        const btn = document.createElement('button');
        btn.className = b.style;
        btn.textContent = b.label;
        actions.appendChild(btn);
      });
      card.appendChild(actions);
    }
    accountList.appendChild(card);
  });
}

function resetWorkflow() {
  $('#agreeScrape').checked = false;
  $('#agreePrivacy').checked = false;
  $('#hometaxStatus').textContent = '';
  $('#scrapeProgress').value = 0;
  $('#progressLog').innerHTML = '';
  $('#salesTotal').textContent = '-';
  $('#purchaseTotal').textContent = '-';
  $('#salesTable').innerHTML = '';
  $('#purchaseTable').innerHTML = '';
  $('#returnSummary').innerHTML = '';
  $('#submitStatus').textContent = '';

  state.consent = { scrape: false, privacy: false };
  state.sales = [];
  state.purchases = [];
  state.returnDoc = null;

  show('#consent-section', true);
  show('#hometax-section', false);
  show('#progress-section', false);
  show('#preview-section', false);
  show('#return-section', false);
}
