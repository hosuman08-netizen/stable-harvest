let balance = 1234.56;
let history = JSON.parse(localStorage.getItem('p10_history') || '[]');

function updateBalance() {
  document.getElementById('balance').textContent = balance.toFixed(2);
  localStorage.setItem('p10_balance', balance);
}

function previewSend() {
  const amount = parseFloat(document.getElementById('amount').value);
  const asset = document.getElementById('asset').value;
  // Simple fee model: 2.5% + small fixed
  const feePercent = 0.025;
  const fee = amount * feePercent + 0.5;
  const receive = amount - fee;
  document.getElementById('fee').textContent = `${fee.toFixed(2)} (${(feePercent*100).toFixed(1)}% + fixed)`;
  document.getElementById('receive').textContent = receive.toFixed(2);
}

function sendWithVoice() {
  const to = document.getElementById('to').value || 'demo';
  const amount = parseFloat(document.getElementById('amount').value);
  const asset = document.getElementById('asset').value;
  
  // p6 voice stub
  alert('🎙 p6 Voice: "Confirm send ' + amount + ' ' + asset + ' to ' + to + '"');
  
  // Simulate send + fee
  const fee = amount * 0.025 + 0.5;
  if (balance < amount) {
    alert('Insufficient balance');
    return;
  }
  balance -= amount;
  updateBalance();
  
  const entry = {
    time: new Date().toLocaleString(),
    to: to,
    amount: amount,
    asset: asset,
    fee: fee.toFixed(2),
    type: 'send'
  };
  history.unshift(entry);
  localStorage.setItem('p10_history', JSON.stringify(history));
  
  renderHistory();
  alert('Sent! Fee ' + fee.toFixed(2) + ' eaten by Harvest. Cross p7/p9 ready.');
}

function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  history.slice(0, 5).forEach(h => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `${h.time}: ${h.type} ${h.amount} ${h.asset} to ${h.to} (fee ${h.fee})`;
    list.appendChild(div);
  });
}

function init() {
  const saved = localStorage.getItem('p10_balance');
  if (saved) balance = parseFloat(saved);
  updateBalance();
  renderHistory();
  // p6 cross stub
  console.log('p6 voice integration ready for tx confirm');
}

init();
