/**
 * cabinet.js — Кабинет экспертов (авторизация через Telegram, правки, админ-панель).
 * Аддитивный модуль: если бэкенд/KV недоступны — сайт работает на статике,
 * кабинет просто показывает «недоступно».
 */

const BOT_USERNAME = 'AyurvedaReaderBot'; // без @ — для Telegram Login Widget
const LS_TOKEN = 'ayurveda_session';

let _user = null;     // { tgId, name, username, role, photo }
let _token = null;
let _overridesCache = {}; // bookId -> { "sthana|chapter|verse|field": value }

// ── Сессия ──────────────────────────────────────────
function loadSession() {
  try {
    const raw = localStorage.getItem(LS_TOKEN);
    if (!raw) return;
    const { token, user } = JSON.parse(raw);
    _token = token; _user = user;
  } catch (_) {}
}
function saveSession(token, user) {
  _token = token; _user = user;
  try { localStorage.setItem(LS_TOKEN, JSON.stringify({ token, user })); } catch (_) {}
}
function clearSession() {
  _token = null; _user = null;
  try { localStorage.removeItem(LS_TOKEN); } catch (_) {}
}

export function currentUser() { return _user; }
export function isLoggedIn() { return Boolean(_user && _token); }
export function isAdmin() { return _user?.role === 'admin'; }

// ── Telegram Login ──────────────────────────────────
// Глобальный колбэк, который вызывает виджет Telegram
window.onTelegramAuth = async function (tgUser) {
  try {
    const res = await fetch('/api/auth-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgUser),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');
    saveSession(data.token, data.user);
    renderCabinet();
    showToast(`Вход выполнен: ${data.user.name} · роль: ${roleLabel(data.user.role)}`);
  } catch (e) {
    showToast('Не удалось войти: ' + e.message, true);
  }
};

function roleLabel(r) {
  return r === 'admin' ? 'администратор' : r === 'expert' ? 'эксперт' : 'пользователь';
}

function injectTelegramWidget(container) {
  container.innerHTML = '';
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://telegram.org/js/telegram-widget.js?22';
  s.setAttribute('data-telegram-login', BOT_USERNAME);
  s.setAttribute('data-size', 'large');
  s.setAttribute('data-radius', '8');
  s.setAttribute('data-onauth', 'onTelegramAuth(user)');
  s.setAttribute('data-request-access', 'write');
  container.appendChild(s);
}

// ── Overrides (правки поверх статики) ───────────────
export async function loadOverrides(bookId) {
  if (_overridesCache[bookId]) return _overridesCache[bookId];
  try {
    const res = await fetch(`/api/overrides?book=${encodeURIComponent(bookId)}`);
    const data = await res.json();
    _overridesCache[bookId] = data.overrides || {};
  } catch (_) {
    _overridesCache[bookId] = {};
  }
  return _overridesCache[bookId];
}
export function getOverride(bookId, sthana, chapter, verseNumber, field) {
  const m = _overridesCache[bookId];
  if (!m) return null;
  return m[`${sthana}|${chapter}|${verseNumber}|${field}`] ?? null;
}
export function clearOverridesCache(bookId) {
  if (bookId) delete _overridesCache[bookId]; else _overridesCache = {};
}

// ── Отправка правки ─────────────────────────────────
export async function submitProposal(ctx) {
  if (!isLoggedIn()) { showToast('Войдите через Telegram, чтобы предложить правку', true); return false; }
  try {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_token}` },
      body: JSON.stringify(ctx),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка');
    showToast('Спасибо! Правка отправлена на модерацию 🙏');
    return true;
  } catch (e) {
    showToast('Не удалось отправить: ' + e.message, true);
    return false;
  }
}

// ── Модалка «предложить правку» ─────────────────────
export function openProposalModal(ctx) {
  if (!isLoggedIn()) { showToast('Сначала войдите через Telegram (раздел «Кабинет»)', true); return; }
  let modal = document.getElementById('proposal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'proposal-modal';
    document.body.appendChild(modal);
  }
  const fieldLabels = {
    translation: 'Русский перевод', text: 'Основной текст',
    iast: 'IAST-транслитерация', sanskrit: 'Деванагари', comment: 'Комментарий',
  };
  const opts = ['translation', 'text', 'iast', 'sanskrit', 'comment'];
  const def = ctx.defaultField && opts.includes(ctx.defaultField) ? ctx.defaultField : 'translation';
  const isTranslate = def === 'translation';
  // Оригинал для перевода (санскрит + IAST) — чтобы эксперт видел, что переводит
  const origHtml = (ctx.sanskrit || ctx.iast)
    ? `<div class="pm-orig">${ctx.sanskrit ? `<div class="pm-orig-dev">${escapeH(ctx.sanskrit)}</div>` : ''}${ctx.iast ? `<div class="pm-orig-iast">${escapeH(ctx.iast)}</div>` : ''}</div>`
    : '';
  modal.innerHTML = `
    <div class="pm-backdrop"></div>
    <div class="pm-box">
      <div class="pm-head">${isTranslate ? 'Добавить перевод' : 'Предложить правку'}
        <span class="pm-loc">${ctx.sthana}, гл. ${ctx.chapter}, стих ${ctx.verseNumber}</span>
      </div>
      ${origHtml}
      ${ctx.oldValue ? `<div class="pm-old"><b>Текущий перевод:</b> ${escapeH(ctx.oldValue).slice(0,300)}</div>` : ''}
      <label class="pm-label">Тип правки</label>
      <select id="pm-field">${opts.map(o => `<option value="${o}"${o===def?' selected':''}>${fieldLabels[o]}</option>`).join('')}</select>
      <label class="pm-label">Ваш вариант</label>
      <textarea id="pm-value" rows="4" placeholder="${isTranslate ? 'Введите русский перевод этого стиха…' : 'Введите перевод или исправление…'}"></textarea>
      <label class="pm-label">Комментарий (необязательно)</label>
      <input id="pm-comment" type="text" placeholder="Источник, обоснование…" />
      <div class="pm-actions">
        <button class="pm-cancel">Отмена</button>
        <button class="pm-submit">Отправить</button>
      </div>
    </div>`;
  modal.classList.add('open');
  const close = () => modal.classList.remove('open');
  modal.querySelector('.pm-backdrop').onclick = close;
  modal.querySelector('.pm-cancel').onclick = close;
  modal.querySelector('.pm-submit').onclick = async () => {
    const field = modal.querySelector('#pm-field').value;
    const newValue = modal.querySelector('#pm-value').value.trim();
    const comment = modal.querySelector('#pm-comment').value.trim();
    if (!newValue) { showToast('Введите текст правки', true); return; }
    const ok = await submitProposal({
      bookId: ctx.bookId, sthana: ctx.sthana, chapter: ctx.chapter,
      verseNumber: ctx.verseNumber, field, oldValue: ctx.oldValue || '', newValue, comment,
    });
    if (ok) close();
  };
}

// ── Кабинет (вход/выход/админ) ──────────────────────
export function renderCabinet() {
  const view = document.getElementById('cabinet-view');
  if (!view) return;
  if (!isLoggedIn()) {
    view.innerHTML = `
      <div class="cabinet-inner">
        <h2>Кабинет</h2>
        <p class="cabinet-desc">Войдите через Telegram, чтобы предлагать переводы и правки глав.
        Эксперты и администраторы получают расширенные права.</p>
        <div id="tg-login-box"></div>
        <p class="cabinet-note">Вход безопасен: пароль не требуется, используется подпись Telegram.</p>
      </div>`;
    injectTelegramWidget(view.querySelector('#tg-login-box'));
    return;
  }
  const u = _user;
  view.innerHTML = `
    <div class="cabinet-inner">
      <h2>Кабинет</h2>
      <div class="cabinet-user">
        ${u.photo ? `<img src="${u.photo}" class="cabinet-avatar" alt=""/>` : '<div class="cabinet-avatar">👤</div>'}
        <div>
          <div class="cabinet-name">${escapeH(u.name)}${u.username ? ` @${escapeH(u.username)}` : ''}</div>
          <div class="cabinet-role">Роль: ${roleLabel(u.role)}</div>
        </div>
        <button id="cabinet-logout">Выйти</button>
      </div>
      <p class="cabinet-desc">Откройте любую главу и нажмите «✎ Предложить правку» рядом со стихом,
      чтобы добавить перевод или исправление.</p>
      <div id="cabinet-access"></div>
      <div id="cabinet-store"></div>
      ${u.role === 'admin' ? '<div id="admin-panel"></div>' : ''}
    </div>`;
  view.querySelector('#cabinet-logout').onclick = () => { clearSession(); _entLoaded = false; renderCabinet(); };
  if (u.role === 'admin') renderAdminPanel(view.querySelector('#admin-panel'));
  renderAccessAndStore(view);
}

async function renderAccessAndStore(view) {
  await loadEntitlements(true);
  const accessEl = view.querySelector('#cabinet-access');
  const storeEl = view.querySelector('#cabinet-store');
  if (!_paymentsEnabled) {
    if (accessEl) accessEl.innerHTML = '<p class="cabinet-note">Платный доступ пока не активирован — все книги открыты.</p>';
    return;
  }
  // Текущий доступ
  const now = Math.floor(Date.now()/1000);
  let access = [];
  if (_ent?.full) access.push('Полный доступ навсегда ✓');
  if (_ent?.passUntil && _ent.passUntil > now) {
    access.push('Пропуск до ' + new Date(_ent.passUntil*1000).toLocaleDateString('ru-RU'));
  }
  const sub = _ent?.sub;
  const subActive = sub && sub.until > now;
  if (subActive) {
    access.push(sub.autoRenew
      ? `Подписка активна (продлится ${new Date(sub.until*1000).toLocaleDateString('ru-RU')})`
      : `Подписка до ${new Date(sub.until*1000).toLocaleDateString('ru-RU')} (автопродление отключено)`);
  }
  if (Array.isArray(_ent?.books) && _ent.books.length) {
    access.push('Куплены книги: ' + _ent.books.length);
  }
  if (accessEl) {
    let html = access.length
      ? `<div class="cabinet-access-box">🔓 ${access.join(' · ')}</div>`
      : '<p class="cabinet-note">Платный доступ не оформлен.</p>';
    if (subActive && sub.autoRenew) {
      html += '<button id="sub-cancel-btn" class="sub-cancel-btn">Отменить автопродление</button>';
    }
    accessEl.innerHTML = html;
    const cancelBtn = accessEl.querySelector('#sub-cancel-btn');
    if (cancelBtn) cancelBtn.onclick = () => cancelSubscription();
  }
  if (storeEl) {
    storeEl.innerHTML = '<h3 class="store-h">Открыть доступ</h3>';
    const grid = document.createElement('div');
    storeEl.appendChild(grid);
    renderStore(grid, null);
  }
}

async function renderAdminPanel(el) {
  el.innerHTML = '<h3>Модерация правок</h3><p class="cabinet-note">Загрузка…</p>';
  try {
    const res = await fetch('/api/proposals?status=pending', { headers: { 'Authorization': `Bearer ${_token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка');
    const ps = data.proposals || [];
    if (!ps.length) { el.innerHTML = '<h3>Модерация правок</h3><p class="cabinet-note">Нет ожидающих правок.</p>'; return; }
    el.innerHTML = '<h3>Модерация правок (' + ps.length + ')</h3>' + ps.map(p => `
      <div class="admin-card" data-id="${p.id}">
        <div class="admin-meta">${escapeH(p.tgName)} · ${p.bookId} · ${escapeH(p.sthana)} гл.${p.chapter} стих ${p.verseNumber} · <b>${p.field}</b></div>
        ${p.oldValue ? `<div class="admin-old">— ${escapeH(p.oldValue).slice(0,200)}</div>` : ''}
        <div class="admin-new">+ ${escapeH(p.newValue).slice(0,400)}</div>
        ${p.comment ? `<div class="admin-comment">💬 ${escapeH(p.comment)}</div>` : ''}
        <div class="admin-actions">
          <button class="admin-approve">✓ Одобрить</button>
          <button class="admin-reject">✗ Отклонить</button>
        </div>
      </div>`).join('');
    el.querySelectorAll('.admin-card').forEach(card => {
      const id = card.dataset.id;
      card.querySelector('.admin-approve').onclick = () => review(id, 'approve', card);
      card.querySelector('.admin-reject').onclick = () => review(id, 'reject', card);
    });
  } catch (e) {
    el.innerHTML = '<h3>Модерация правок</h3><p class="cabinet-note">' + escapeH(e.message) + '</p>';
  }
}

async function review(id, decision, card) {
  try {
    const res = await fetch('/api/proposals?action=review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_token}` },
      body: JSON.stringify({ id, decision }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка');
    card.style.opacity = '0.4';
    card.querySelector('.admin-actions').innerHTML =
      decision === 'approve' ? '<span class="admin-done">✓ Одобрено</span>' : '<span class="admin-done">✗ Отклонено</span>';
    if (decision === 'approve') clearOverridesCache();
    showToast(decision === 'approve' ? 'Правка одобрена' : 'Правка отклонена');
  } catch (e) { showToast(e.message, true); }
}

// ── Утилиты ─────────────────────────────────────────
function escapeH(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

let _toastT = null;
function showToast(msg, isErr) {
  let t = document.getElementById('cabinet-toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'cabinet-toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => { t.className = ''; }, 4000);
}

// ── Монетизация (YooKassa) ──────────────────────────
let _ent = null;            // entitlements текущего пользователя
let _products = {};
let _freeBooks = ['ashtanga'];
let _paymentsEnabled = false;
let _previewChapters = 1;
let _contentProtection = false;
let _entLoaded = false;

export async function loadEntitlements(force) {
  if (_entLoaded && !force) return;
  try {
    const headers = _token ? { 'Authorization': `Bearer ${_token}` } : {};
    const res = await fetch('/api/entitlements', { headers });
    const d = await res.json();
    _ent = d.entitlements || { full: false, books: [] };
    _products = d.products || {};
    _freeBooks = d.freeBooks || ['ashtanga'];
    _paymentsEnabled = !!d.paymentsEnabled;
    _previewChapters = d.previewChapters ?? 1;
    _contentProtection = !!d.contentProtection;
    _entLoaded = true;
  } catch (_) {
    // Бэкенд недоступен → не блокируем контент
    _paymentsEnabled = false; _contentProtection = false; _entLoaded = true;
  }
}

export function paymentsEnabled() { return _paymentsEnabled; }
export function previewChapters() { return _previewChapters; }
export function contentProtectionEnabled() { return _contentProtection; }
export function getToken() { return _token; }

/** Доступна ли книга. Без платежей/бэкенда — всегда true (сайт открыт). */
export function hasBookAccess(bookId) {
  if (!_paymentsEnabled) return true;
  if (_freeBooks.includes(bookId)) return true;
  if (!_ent) return false;
  if (_ent.full) return true;
  if (_ent.passUntil && _ent.passUntil > Math.floor(Date.now() / 1000)) return true;
  if (Array.isArray(_ent.books) && _ent.books.includes(bookId)) return true;
  return false;
}

/** Купить товар: создаёт платёж и редиректит на YooKassa */
export async function buyProduct(productKey) {
  if (!isLoggedIn()) { showToast('Войдите через Telegram, чтобы оформить покупку', true); return; }
  try {
    const res = await fetch('/api/pay-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_token}` },
      body: JSON.stringify({ productKey }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Ошибка');
    if (d.confirmation_url) window.location.href = d.confirmation_url;
  } catch (e) {
    showToast('Не удалось создать платёж: ' + e.message, true);
  }
}

/** Отменить автопродление подписки (доступ сохранится до конца периода) */
export async function cancelSubscription() {
  if (!isLoggedIn()) return;
  if (!confirm('Отменить автопродление? Доступ сохранится до конца оплаченного периода.')) return;
  try {
    const res = await fetch('/api/sub-cancel', {
      method: 'POST', headers: { 'Authorization': `Bearer ${_token}` },
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Ошибка');
    await loadEntitlements(true);
    showToast('Автопродление отключено. Доступ сохранится до конца периода.');
    renderCabinet();
  } catch (e) {
    showToast('Не удалось отменить: ' + e.message, true);
  }
}

function priceFmt(n) { return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'; }

/** Рендер каталога/paywall в контейнер. Если bookId задан — подсветить покупку этой книги. */
export function renderStore(container, bookId) {
  if (!container) return;
  const P = _products;
  const bookProductKey = Object.keys(P).find(k => P[k].type === 'book' && P[k].bookId === bookId);
  const order = [];
  if (bookProductKey) order.push(bookProductKey);
  // Подписка — первой среди общих вариантов
  for (const k of Object.keys(P)) if (P[k].type === 'subscription') order.push(k);
  if (P.full) order.push('full');
  if (P.pass30) order.push('pass30');
  // прочие книги
  for (const k of Object.keys(P)) if (P[k].type === 'book' && k !== bookProductKey) order.push(k);

  const cards = order.filter(k => P[k]).map(k => {
    const p = P[k];
    const badge = p.type === 'full' ? 'навсегда'
      : p.type === 'pass' ? `${p.days} дней`
      : p.type === 'subscription' ? `${p.price} ₽/мес`
      : 'книга';
    const hl = k === bookProductKey || k === 'full' ? ' store-card--hl' : '';
    return `<div class="store-card${hl}" data-product="${k}">
      <div class="store-badge">${badge}</div>
      <div class="store-title">${escapeH(p.title)}</div>
      <div class="store-desc">${escapeH(p.desc || '')}</div>
      <div class="store-foot"><span class="store-price">${priceFmt(p.price)}</span>
        <button class="store-buy" data-product="${k}">Купить</button></div>
    </div>`;
  }).join('');

  container.innerHTML = `<div class="store-grid">${cards}</div>`;
  container.querySelectorAll('.store-buy').forEach(b => {
    b.onclick = () => buyProduct(b.dataset.product);
  });
}

// Обработка возврата после оплаты (?paid=1) — обновить права
if (typeof window !== 'undefined' && /[?&]paid=1/.test(window.location.search)) {
  setTimeout(async () => {
    await loadEntitlements(true);
    showToast('Оплата получена. Доступ открыт 🙏 Если книга ещё закрыта — обновите через минуту.');
  }, 1200);
}

// ── Инициализация ───────────────────────────────────
loadSession();
