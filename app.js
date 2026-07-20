(function () {
  var bal = +(localStorage.getItem('sh_bal') || 1234.56);
  var hist = JSON.parse(localStorage.getItem('sh_hist') || '[]');
  function save() {
    localStorage.setItem('sh_bal', bal);
    localStorage.setItem('sh_hist', JSON.stringify(hist.slice(0, 30)));
  }
  function feeOf(amt, route) {
    var r = { fast: 0.025, eco: 0.008, night: 0.004 }[route] || 0.01;
    var f = Math.max(0.5, amt * r);
    return Math.round(f * 100) / 100;
  }
  function render() {
    document.getElementById('bal').textContent = bal.toLocaleString(undefined, { maximumFractionDigits: 2 });
    var list = hist.slice().reverse().slice(0, 8).map(function (h) {
      return '<div style="padding:6px 0;border-bottom:1px solid #2a2438;font-size:13px">' + h.t + ' · -' + h.amt + ' (fee ' + h.fee + ')</div>';
    }).join('') || '<span style="color:#8a8398;font-size:12px">기록 없음</span>';
    document.getElementById('log').innerHTML = '<b>최근 가상 송금</b>' + list;
  }
  function preview() {
    var amt = +document.getElementById('amt').value || 0;
    var route = document.getElementById('route').value;
    var fee = feeOf(amt, route);
    var recv = Math.max(0, amt - fee);
    document.getElementById('fee').innerHTML =
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
    hist.push({ t: new Date().toLocaleTimeString(), amt: p.amt, fee: p.fee, to: document.getElementById('to').value || '—' });
    save();
    render();
    try { legionTrack('money_pipe_shown', { sim: 1 }); } catch (e) {}
    if(!document.getElementById('shareLast')){
      var b=document.createElement('button'); b.id='shareLast'; b.className='sec'; b.textContent='영수증 문구 복사(가상)';
      b.onclick=function(){var text='StableHarvest sim fee receipt · bal '+bal+' · https://hosuman08-netizen.github.io/stable-harvest/';
        if(navigator.clipboard)navigator.clipboard.writeText(text);};
      document.querySelector('.card:last-of-type')&&document.getElementById('log').appendChild(b);
    }
  };
  try { legionTrack('session_start', {}); } catch (e) {}
  preview();
  render();
})();
