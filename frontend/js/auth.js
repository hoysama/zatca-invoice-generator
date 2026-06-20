// ZATCA Invoice - Main JavaScript 2026

const API = 'https://zatca-invoice-worker.hoysamax.workers.dev';

// Utility functions
function getToken() {
  const match = document.cookie.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

function logout() {
  document.cookie = 'auth_token=; path=/; max-age=0';
  window.location.href = '/login';
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function showSuccess(msg) {
  const el = document.getElementById('successMsg');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function hideAlerts() {
  const e = document.getElementById('errorMsg');
  const s = document.getElementById('successMsg');
  if (e) e.style.display = 'none';
  if (s) s.style.display = 'none';
}

// Auth handlers
function handleRegister(e) {
  e.preventDefault();
  hideAlerts();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري الإنشاء...</span>';
  
  fetch(API + '/api/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    document.cookie = 'auth_token=' + data.token + '; path=/; max-age=' + (7*24*60*60) + '; secure; samesite=lax';
    showSuccess('تم إنشاء الحساب بنجاح! جاري التحويل...');
    setTimeout(() => window.location.href = '/dashboard', 1000);
  })
  .catch(err => {
    showError(err.message);
    btn.disabled = false;
    btn.innerHTML = '<span>إنشاء الحساب</span><span>→</span>';
  });
  
  return false;
}

function handleLogin(e) {
  e.preventDefault();
  hideAlerts();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري تسجيل الدخول...</span>';
  
  fetch(API + '/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    document.cookie = 'auth_token=' + data.token + '; path=/; max-age=' + (7*24*60*60) + '; secure; samesite=lax';
    window.location.href = '/dashboard';
  })
  .catch(err => {
    showError(err.message);
    btn.disabled = false;
    btn.innerHTML = '<span>تسجيل الدخول</span><span>→</span>';
  });
  
  return false;
}

// Dashboard
function loadDashboard() {
  const token = getToken();
  if (!token) { window.location.href = '/login'; return; }
  
  // Load invoices
  fetch(API + '/api/invoices', { headers: { 'Authorization': 'Bearer ' + token } })
  .then(r => r.status === 401 ? logout() : r.json())
  .then(data => {
    if (!data) return;
    const invoices = data.invoices || [];
    
    document.getElementById('totalInvoices').textContent = invoices.length;
    
    let total = 0;
    invoices.forEach(i => total += i.total);
    document.getElementById('totalAmount').textContent = total.toFixed(2) + ' ر.س';
    
    const now = new Date();
    const monthInvoices = invoices.filter(i => {
      const d = new Date(i.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    document.getElementById('monthInvoices').textContent = monthInvoices.length;
    
    if (invoices.length === 0) {
      document.getElementById('emptyState').style.display = 'block';
    } else {
      document.getElementById('invoicesTable').style.display = 'table';
      let html = '';
      invoices.slice(0, 10).forEach(inv => {
        html += '<tr>' +
          '<td><strong>' + inv.invoice_number + '</strong></td>' +
          '<td>' + (inv.client_name || '-') + '</td>' +
          '<td>' + inv.total.toFixed(2) + ' ر.س</td>' +
          '<td><span class="status-badge draft">مسودة</span></td>' +
          '<td>' + new Date(inv.created_at).toLocaleDateString('ar-SA') + '</td>' +
        '</tr>';
      });
      document.getElementById('invoicesBody').innerHTML = html;
    }
  })
  .catch(() => logout());
  
  // Load clients count
  fetch(API + '/api/clients', { headers: { 'Authorization': 'Bearer ' + token } })
  .then(r => r.json())
  .then(data => {
    document.getElementById('totalClients').textContent = (data.clients || []).length;
  })
  .catch(() => {});
}

// Client form
function handleClientSubmit(e) {
  e.preventDefault();
  hideAlerts();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'جاري الإضافة...';
  
  fetch(API + '/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      vatNumber: document.getElementById('vatNumber').value,
      address: document.getElementById('address').value
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    showSuccess('تم إضافة العميل بنجاح!');
    document.getElementById('clientForm').reset();
    setTimeout(() => window.location.href = '/dashboard', 1000);
  })
  .catch(err => {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = 'إضافة العميل';
  });
  
  return false;
}

// Invoice form
function loadClientsForInvoice() {
  fetch(API + '/api/clients', { headers: { 'Authorization': 'Bearer ' + getToken() } })
  .then(r => r.json())
  .then(data => {
    const clients = data.clients || [];
    const select = document.getElementById('clientId');
    if (clients.length === 0) {
      document.getElementById('noClientsMsg').style.display = 'block';
    }
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name + (c.vat_number ? ' (ضريبي: ' + c.vat_number + ')' : '');
      select.appendChild(opt);
    });
  })
  .catch(() => {});
}

function addItemRow() {
  const row = document.querySelector('#itemsList > div').cloneNode(true);
  row.querySelectorAll('input').forEach(i => i.value = '');
  row.querySelector('input[type=number]').value = '1';
  row.querySelector('.item-total').textContent = '0.00';
  document.getElementById('itemsList').appendChild(row);
}

function calculateTotals() {
  let subtotal = 0;
  document.querySelectorAll('#itemsList > div').forEach(row => {
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = qty * price;
    row.querySelector('.item-total').textContent = total.toFixed(2);
    subtotal += total;
  });
  const tax = subtotal * 0.15;
  document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ر.س';
  document.getElementById('tax').textContent = tax.toFixed(2) + ' ر.س';
  document.getElementById('total').textContent = (subtotal + tax).toFixed(2) + ' ر.س';
}

function handleInvoiceSubmit(e) {
  e.preventDefault();
  hideAlerts();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'جاري الإنشاء...';
  
  const items = [];
  document.querySelectorAll('#itemsList > div').forEach(row => {
    const desc = row.querySelector('.item-desc').value;
    const qty = parseFloat(row.querySelector('.item-qty').value);
    const price = parseFloat(row.querySelector('.item-price').value);
    if (desc && qty > 0 && price > 0) {
      items.push({ description: desc, quantity: qty, unitPrice: price });
    }
  });
  
  if (items.length === 0) {
    showError('يرجى إضافة صنف واحد على الأقل');
    btn.disabled = false;
    btn.textContent = 'إنشاء الفاتورة';
    return false;
  }
  
  fetch(API + '/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({
      clientId: document.getElementById('clientId').value,
      items: items,
      notes: document.getElementById('notes').value
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    window.location.href = '/dashboard';
  })
  .catch(err => {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = 'إنشاء الفاتورة';
  });
  
  return false;
}
