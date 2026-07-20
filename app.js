(function () {
  var bal = +(localStorage.getItem('sh_bal') || 1234.56);
  var claims = +(localStorage.getItem('sh_claims') || 0);
  var hist = JSON.parse(localStorage.getItem('sh_hist') || '[]');
  function claimBump(){claims++; localStorage.setItem('sh_claims',claims);}
  function save() {
    localStorage.setItem('sh_bal', bal);
    localStorage.setItem('sh_hist', JSON.stringify(hist.slice(0, 30)));
  }
  function dayKey(off) {
    var d = new Date(); d.setDate(d.getDate() + (off || 0));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function bumpStreak() {
    try {
      var s = JSON.parse(localStorage.getItem('sh_streak') || '{}');
      if (!s || typeof s !== 'object') s = { last: null, count: 0 };
      var t = dayKey(0);
      if (s.last === t) { renderStreak(s); return; }
      var y = dayKey(-1), y2 = dayKey(-2), froze = false;
      if (s.last && s.last !== y && s.last === y2 && (s.count || 0) >= 3) {
        var ready = !s.shieldLast || ((new Date(t) - new Date(s.shieldLast)) / 86400000) >= 7;
        if (ready) {
          s.shieldLast = t; s.last = y; froze = true;
          try { if (window.legionTrack) legionTrack('streak_freeze', { count: s.count }); } catch (e) {}
        }
      }
      s.count = (s.last === y) ? (s.count || 0) + 1 : 1;
      s.last = t;
      localStorage.setItem('sh_streak', JSON.stringify(s));
      renderStreak(s);
      try { if (window.legionTrack) legionTrack('streak', { count: s.count, froze: froze }); } catch (e) {}
    } catch (e) {}
  }
  function renderStreak(s) {
    var el = document.getElementById('shStreak');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shStreak';
      el.style.cssText = 'font-size:12px;color:#e0b552;margin:0 0 8px';
      var host = document.querySelector('h1') || document.body;
      host.insertAdjacentElement('afterend', el);
    }
    s = s || JSON.parse(localStorage.getItem('sh_streak') || '{}');
    var c = s.count || 0;
    var ready = !s.shieldLast || ((new Date(dayKey(0)) - new Date(s.shieldLast)) / 86400000) >= 7;
    var now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var rem = Math.max(0, Math.floor((mid - now) / 60000));
    var clock = Math.floor(rem / 60) + 'h ' + (rem % 60) + 'm';
    el.textContent = '🔥 ' + c + 'd sim streak · reset ' + clock + (c >= 3 && ready ? ' · 🛡️' : '') + ' · claim ' + claims + ' · fictional only';
  }
  function weekFee() {
    try {
      var cut = Date.now() - 7 * 864e5;
      return hist.filter(function (h) { return (h.ts || 0) >= cut; }).reduce(function (a, h) { return a + (+h.fee || 0); }, 0);
    } catch (e) { return 0; }
  }
  function dailyClaim() {
    var k = 'sh_daily_claim_' + dayKey(0);
    if (localStorage.getItem(k)) { alert('오늘 일일 가상 리필 완료'); return; }
    localStorage.setItem(k, '1');
    bal = Math.round((bal + 25) * 100) / 100;
    claimBump();
    save();
    bumpStreak();
    render();
    renderStreak();
    try { legionTrack('daily_free', { amt: 25 }); } catch (e) {}
    var n = document.getElementById('fee');
    if (n) n.innerHTML = '🎁 일일 +25 가상 잔고 수령 (fictional)';
  }
  function ensureDailyBtn() {
    if (document.getElementById('dailyClaim')) return;
    var b = document.createElement('button');
    b.id = 'dailyClaim';
    b.className = 'sec';
    b.type = 'button';
    b.textContent = localStorage.getItem('sh_daily_claim_' + dayKey(0)) ? '오늘 리필 ✓' : '일일 +25 리필(가상)';
    if (localStorage.getItem('sh_daily_claim_' + dayKey(0))) b.disabled = true;
    b.onclick = dailyClaim;
    var send = document.getElementById('send');
    if (send && send.parentNode) send.parentNode.appendChild(b);
    else document.body.appendChild(b);
  }
  function feeOf(amt, route) {
    var r = { fast: 0.025, eco: 0.008, night: 0.004 }[route] || 0.01;
    var f = Math.max(0.5, amt * r);
    return Math.round(f * 100) / 100;
  }
  function showMoneyPipe() {
    var el = document.getElementById('moneyPipe');
    if (!el) {
      el = document.createElement('div');
      el.id = 'moneyPipe';
      el.style.cssText = 'margin:12px 0;padding:12px;border:1px solid #67e8f955;border-radius:12px;background:#12161c;text-align:center;font-size:12px';
      var log = document.getElementById('log');
      if (log && log.parentNode) log.parentNode.insertBefore(el, log);
      else document.body.appendChild(el);
    }
    el.innerHTML =
      '<div style="color:#67e8f9;font-weight:700;margin-bottom:6px">💎 Sim loop · dual-track safe</div>' +
      '<p style="opacity:.8;margin:0 0 8px">가상 수수료 시뮬 · 실자금/투자 아님 · 투명 금융 트랙 옆 엔터 링크</p>' +
      '<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/budget-pulse/?utm_source=harvest&utm_medium=pipe">💓 Budget</a>' +
      '<a style="color:#ece8f1;margin:0 6px" href="https://hosuman08-netizen.github.io/coinwallet-sim/?utm_source=harvest&utm_medium=pipe">💳 Wallet sim</a>' +
      '<a style="color:#e0b552;margin:0 6px" href="https://hosuman08-netizen.github.io/legion-hub/?utm_source=harvest&utm_medium=pipe">🎮 Arcade</a>';
    try { if (window.legionTrack) legionTrack('money_pipe_shown', { app: 'harvest' }); } catch (e) {}
  }
  function render() {
    document.getElementById('bal').textContent = bal.toLocaleString(undefined, { maximumFractionDigits: 2 });
    var list = hist.slice().reverse().slice(0, 8).map(function (h) {
      return '<div style="padding:6px 0;border-bottom:1px solid #2a2438;font-size:13px">' + h.t + ' · -' + h.amt + ' (fee ' + h.fee + ')</div>';
    }).join('') || '<div class="empty-cta" style="color:#8a8398;font-size:13px;padding:8px 0">기록 없음 — 첫 가상 송금으로 시작<br><button type="button" class="sec" id="emptySendCta" style="margin-top:8px">금액 입력 후 보내기</button></div>';
    var wf = Math.round(weekFee() * 100) / 100;
    document.getElementById('log').innerHTML = '<b>최근 가상 송금</b> ('+hist.length+'건 · 7일 fee '+wf+')' + list;
    var emptyBtn = document.getElementById('emptySendCta');
    if (emptyBtn) emptyBtn.onclick = function () { var a = document.getElementById('amt'); if (a) { a.focus(); a.value = a.value || '10'; preview(); } };
  }
  function preview() {
    var amt = +document.getElementById('amt').value || 0;
    var route = document.getElementById('route').value;
    var fee = feeOf(amt, route);
    var recv = Math.max(0, amt - fee);
    document.getElementById('fee').innerHTML = (route==='eco'?'Eco 추천 · ':'')+
      '예상 수수료: <b style="color:#67e8f9">' + fee + '</b> · 수취: <b>' + recv + '</b> · 경로 ' + route;
    try { legionTrack('activate', { fee: fee, route: route }); } catch (e) {}
    return { amt: amt, fee: fee, recv: recv, route: route };
  }
  document.getElementById('preview').onclick = preview;
  document.getElementById('amt').oninput = preview;
  document.getElementById('route').onchange = preview;
  document.getElementById('send').onclick = function () {
    var p = preview();
    if (p.amt <= 0) return alert('금액 입력');
    if (p.amt > bal) return alert('가상 잔고 부족');
    bal = Math.round((bal - p.amt) * 100) / 100;
    hist.push({ t: new Date().toLocaleTimeString(), amt: p.amt, fee: p.fee, to: document.getElementById('to').value || '—', ts: Date.now(), route: p.route });
    try{localStorage.setItem('sh_last_route', p.route);}catch(e){}
    save();
    render();
    bumpStreak();
    showMoneyPipe();
    try { legionTrack('money_pipe_shown', { sim: 1 }); } catch (e) {}
    if (!document.getElementById('shareLast')) {
      var b = document.createElement('button');
      b.id = 'shareLast';
      b.className = 'sec';
      b.textContent = '영수증 문구 복사(가상)';
      b.onclick = function () {
        var text = 'StableHarvest sim fee receipt · bal ' + bal + ' · https://hosuman08-netizen.github.io/stable-harvest/?utm_source=share&utm_medium=app';
        if (navigator.share) navigator.share({ text: text }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(text);
        try { if (window.legionTrack) legionTrack('share_peak', {}); } catch (e) {}
      };
      var log = document.getElementById('log');
      if (log) log.appendChild(b);
    }
  };
  try { legionTrack('session_start', {}); } catch (e) {}
  try {
    var lr = localStorage.getItem('sh_last_route');
    var rsel = document.getElementById('route');
    if (lr && rsel) rsel.value = lr;
  } catch (e) {}
  preview();
  render();
  renderStreak();
  ensureDailyBtn();
})();
