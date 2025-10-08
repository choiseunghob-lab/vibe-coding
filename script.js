// 상태
const state = {
  user: null,
  consent: { scrape: false, privacy: false },
  sales: [],
  purchases: [],
  returnDoc: null,
};

// 유틸
const $ = (sel) => document.querySelector(sel);
const show = (selector, on = true) => {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (!el) return;
  el.classList[on ? 'remove' : 'add']('hidden');
};
const formatKRW = (n) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n || 0);

// 로그인
$('#btnKakao').addEventListener('click', async () => {
  // 실제: Kakao.Auth.login으로 교체
  state.user = { id: 'demo-user-1', name: '홍길동', phone: '010-0000-0000' };
  $('#loginStatus').textContent = `${state.user.name} 로그인됨`;
  document
    .querySelectorAll('.step')
    .forEach((s, i) => s.classList.toggle('is-active', i === 0));
  show('#consent-section', true);
});

// 동의
$('#btnConsent').addEventListener('click', () => {
  state.consent.scrape = $('#agreeScrape').checked;
  state.consent.privacy = $('#agreePrivacy').checked;
  if (!(state.consent.scrape && state.consent.privacy)) return alert('모든 동의 항목을 체크하세요');
  show('#hometax-section', true);
});

// 홈택스 연결 시뮬레이션
$('#btnConnectHometax').addEventListener('click', async () => {
  $('#hometaxStatus').textContent = '연결 시도 중';
  await sleep(500);
  $('#hometaxStatus').textContent = '인증 성공(데모)';
  show('#progress-section', true);
  startScrapeDemo();
});

// 스크래핑 진행 시뮬레이터
async function startScrapeDemo() {
  const log = (t) =>
    ($('#progressLog').innerHTML += `<div>${new Date().toLocaleTimeString()} • ${t}</div>`);
  for (let i = 0; i <= 100; i += 20) {
    $('#scrapeProgress').value = i;
    log(`${i}% 완료`);
    await sleep(400);
  }
  // 데모 데이터
  state.sales = [
    { 구분: '전자세금계산서', 공급가액: 12_000_000, 세액: 1_200_000, 건수: 12 },
    { 구분: '세금계산서', 공급가액: 3_000_000, 세액: 300_000, 건수: 3 },
    { 구분: '카드', 공급가액: 5_000_000, 세액: 500_000, 건수: 50 },
    { 구분: '현금영수증', 공급가액: 800_000, 세액: 80_000, 건수: 8 },
    { 구분: '그외', 공급가액: 200_000, 세액: 20_000, 건수: 2 },
  ];
  state.purchases = [
    { 구분: '전자세금계산서', 공급가액: 7_000_000, 세액: 700_000, 건수: 10 },
    { 구분: '신용카드', 공급가액: 2_000_000, 세액: 200_000, 건수: 25 },
    { 구분: '현금영수증', 공급가액: 600_000, 세액: 60_000, 건수: 7 },
  ];
  renderPreview();
}

function renderPreview() {
  // 합계
  const salesSum = state.sales.reduce((sum, row) => sum + row.공급가액 + row.세액, 0);
  const purchSum = state.purchases.reduce((sum, row) => sum + row.공급가액 + row.세액, 0);
  $('#salesTotal').textContent = formatKRW(salesSum);
  $('#purchaseTotal').textContent = formatKRW(purchSum);

  // 테이블 렌더
  renderTable('#salesTable', ['구분', '공급가액', '세액', '건수'], state.sales);
  renderTable('#purchaseTable', ['구분', '공급가액', '세액', '건수'], state.purchases);

  // 다음 단계 노출
  show('#preview-section', true);
  document
    .querySelectorAll('.step')
    .forEach((s, i) => s.classList.toggle('is-active', i === 2));
}

$('#btnMakeReturn').addEventListener('click', () => {
  const 매출세액 = state.sales.reduce((sum, row) => sum + row.세액, 0);
  const 매입세액 = state.purchases.reduce((sum, row) => sum + row.세액, 0);
  const 납부세액 = Math.max(0, 매출세액 - 매입세액);
  state.returnDoc = { 매출세액, 매입세액, 납부세액 };
  const ul = $('#returnSummary');
  ul.innerHTML = '';
  Object.entries(state.returnDoc).forEach(([key, value]) => {
    const li = document.createElement('li');
    li.textContent = `${key}: ${formatKRW(value)}`;
    ul.appendChild(li);
  });
  show('#return-section', true);
  document
    .querySelectorAll('.step')
    .forEach((s, i) => s.classList.toggle('is-active', i === 3));
});

$('#btnDownloadXml').addEventListener('click', () => {
  // 실제: 서버에서 생성된 전자신고 XML을 다운로드
  alert('데모: XML 생성은 서버 구현 필요');
});

$('#btnDownloadPdf').addEventListener('click', () => {
  // 실제: 서버 PDF 미리보기
  window.print();
});

$('#btnSubmitHometax').addEventListener('click', async () => {
  $('#submitStatus').textContent = '제출 중(데모)';
  await sleep(800);
  $('#submitStatus').textContent = '제출 완료(데모)';
  document
    .querySelectorAll('.step')
    .forEach((s, i) => s.classList.toggle('is-active', i === 4));
});

function renderTable(selector, headers, rows) {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (!el) return;
  el.innerHTML = '';

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
        td.textContent =
          typeof value === 'number' ? formatKRW(value).replace('₩', '') : String(value);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
