/* Move Inspiring Change — prototype app (renders from window.MIC_DATA) */
(function () {
  const D = window.MIC_DATA || { recipes: [], catalog: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* offer → destination routing */
  const LINK = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('strong method')) return 'the-strong-method.html';
    if (n.includes('nutrition made simple')) return 'membership.html';
    return 'checkout.html?p=' + slug(name);
  };
  const allOffers = () => Object.values(D.catalog || {}).flat();

  /* ---------- shared chrome (nav + footer) ---------- */
  const NAVLINKS = [['about.html', 'About'], ['recipes.html', 'Recipes'], ['blog.html', 'Blog'], ['programs.html', 'Programs'],
    ['public-health.html', 'Public Health'], ['shop.html', 'Shop'], ['contact.html', 'Contact']];
  function footerHTML() {
    return `<footer><div class="wrap"><div class="fgrid">
        <div><a class="brand brand--light" href="index.html" style="margin-bottom:14px"><span class="logo-move">MOVE</span><span class="logo-div"></span><span class="logo-sub">Inspiring<br>Change</span></a>
          <p style="opacity:.85;max-width:34ch;font-size:.92rem;margin-top:14px">Evidence-based nutrition &amp; strength coaching for women. Bachelor-qualified Nutritionist · Brisbane, Australia.</p></div>
        <div><h4>Explore</h4><a href="recipes.html">Recipes</a><a href="blog.html">Blog</a><a href="programs.html">Programs</a><a href="shop.html">Shop</a><a href="login.html">Member login</a></div>
        <div><h4>Company</h4><a href="about.html">About Rachel</a><a href="public-health.html">Public Health</a><a href="contact.html">Contact</a><a href="terms.html">Terms &amp; Conditions</a><a href="https://www.instagram.com/moveinspiringchange" target="_blank" rel="noopener">Instagram ↗</a></div>
      </div><div class="copy"><span>© Move Inspiring Change</span><span>Prototype preview · not the live site</span></div></div></footer>`;
  }
  function injectChrome() {
    if (document.body.dataset.chrome === 'site') {
      const active = document.body.dataset.page || '';
      const links = NAVLINKS.map(([h, t]) => `<a href="${h}" class="${h.startsWith(active) && active ? 'active' : ''}">${t}</a>`).join('');
      const dlinks = NAVLINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join('');
      document.body.insertAdjacentHTML('afterbegin',
        `<div class="proto-flag">✦ PROTOTYPE PREVIEW — the full Move Inspiring Change site, built with Rachel's real content. Not the live site.</div>
        <header class="nav"><div class="wrap nav-inner">
          <a class="brand" href="index.html"><span class="logo-move">MOVE</span><span class="logo-div"></span><span class="logo-sub">Inspiring<br>Change</span></a>
          <nav class="nav-links">${links}</nav>
          <div class="nav-cta"><a class="nav-login" href="login.html">Member Login</a><a class="btn btn-primary btn-sm" href="programs.html">Work with me</a></div>
          <button class="burger" aria-label="Menu" aria-expanded="false">☰</button>
        </div>
        <div class="nav-drawer">${dlinks}<a class="nav-login" href="login.html">Member Login</a><a class="btn btn-primary btn-sm" href="programs.html">Work with me</a></div>
        </header>`);
      document.body.insertAdjacentHTML('beforeend', footerHTML());
      const burger = $('.burger'), drawer = $('.nav-drawer');
      const setOpen = (o) => { drawer.classList.toggle('open', o); burger.textContent = o ? '✕' : '☰'; burger.setAttribute('aria-expanded', String(o)); };
      burger && burger.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
      drawer && $$('a', drawer).forEach(a => a.addEventListener('click', () => setOpen(false)));
    } else if ($('.dash')) {
      /* members dashboard: give it the shared footer too */
      document.body.insertAdjacentHTML('beforeend', footerHTML());
    }
  }
  injectChrome();

  /* ---------- recipe card + modal ---------- */
  function macroPanel(m) {
    if (!m) return '';
    const e = m.est ? ' is-est' : '';
    const cell = (v, l) => `<div class="macro${e}"><b>${v}</b><small>${l}</small></div>`;
    const flag = m.est ? '<div style="font-size:.66rem;color:var(--accent);text-align:right;margin-top:4px">macros estimated · pending Rachel</div>' : '';
    return `<div class="macros">${cell(m.cal, 'cal')}${cell(m.protein + 'g', 'protein')}${cell(m.carbs + 'g', 'carbs')}${cell(m.fat + 'g', 'fat')}</div>${flag}`;
  }
  function card(r, i) {
    const img = r.image ? `<img src="${r.image}" alt="${r.name}" loading="lazy">` : '';
    return `<article class="rcard" data-i="${i}"><div class="ph">${img}<span class="meal">${r.meal}</span></div>
      <div class="body"><h3>${r.name}</h3><div class="rmeta"><span>⏱ ${r.time || '—'}</span><span>🍽 Serves ${r.serves || '—'}</span></div>
      <p class="blurb">${r.blurb || ''}</p><div class="tags">${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>${macroPanel(r.macros)}</div></article>`;
  }
  function bind(c) { $$('.rcard', c).forEach(el => el.addEventListener('click', () => openModal(D.recipes[+el.dataset.i]))); }
  function openModal(r) {
    let m = $('#recipeModal'); if (!m) { m = document.createElement('div'); m.id = 'recipeModal'; m.className = 'modal'; document.body.appendChild(m); }
    const ing = (r.ingredients || []).map(x => `<li>${x}</li>`).join('') || '<li>Ingredients being finalised</li>';
    const steps = (r.steps || []).map(x => `<li>${x}</li>`).join('') || '<li>Method being finalised</li>';
    m.innerHTML = `<div class="modal-box"><div class="modal-hero">${r.image ? `<img src="${r.image}">` : ''}<button class="modal-x">✕</button></div>
      <div class="modal-body"><span class="eyebrow">${r.meal}</span><h2>${r.name}</h2><p class="lead" style="margin-top:8px;font-size:1rem">${r.blurb || ''}</p>
      <div class="rmeta" style="margin-top:14px"><span>⏱ ${r.time || '—'}</span><span>🍽 Serves ${r.serves || '—'}</span>${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div style="margin-top:18px">${macroPanel(r.macros)}</div>
      <div class="modal-cols"><div><h4>Ingredients</h4><ul>${ing}</ul></div><div><h4>Method</h4><ol>${steps}</ol></div></div></div></div>`;
    m.classList.add('open'); m.querySelector('.modal-x').onclick = () => m.classList.remove('open'); m.onclick = e => { if (e.target === m) m.classList.remove('open'); };
  }

  /* ---------- recipes page ---------- */
  const rgrid = $('#recipeGrid');
  if (rgrid) {
    const fbar = $('#recipeFilters'); let active = 'All';
    const draw = () => {
      const list = D.recipes.map((r, i) => ({ r, i })).filter(o => active === 'All' || o.r.meal === active);
      rgrid.innerHTML = list.length ? list.map(o => card(o.r, o.i)).join('') : `<div class="empty">Fresh ${active.toLowerCase()} recipes are added every week.</div>`; bind(rgrid);
    };
    fbar.innerHTML = ['All', 'Breakfast', 'Lunch', 'Dinner'].map(m => `<button class="pill ${m === 'All' ? 'active' : ''}" data-m="${m}">${m}</button>`).join('');
    $$('.pill', fbar).forEach(p => p.addEventListener('click', () => { $$('.pill', fbar).forEach(x => x.classList.remove('active')); p.classList.add('active'); active = p.dataset.m; draw(); }));
    draw();
  }
  const feat = $('#featuredRecipes'); if (feat) { feat.innerHTML = D.recipes.slice(0, 3).map((r, i) => card(r, i)).join(''); bind(feat); }

  /* ---------- designed offer cover + detail modal ---------- */
  const COVER = { flagship: ['linear-gradient(140deg,#45302C,#7C564F)', 'l'], consult: ['linear-gradient(140deg,#7C564F,#C99B92)', 'l'],
    training: ['linear-gradient(140deg,#5A423D,#9C6F66)', 'l'], member: ['linear-gradient(140deg,#F4E1DB,#E7C9C0)', 'd'],
    guide: ['linear-gradient(140deg,#F1E2DC,#E3C8BF)', 'd'], apparel: ['linear-gradient(140deg,#352A27,#5C4C47)', 'l'] };
  function cover(o) { const c = COVER[o.cover] || COVER.guide; return `<div class="pcover ${c[1] === 'd' ? 'pcover-dark' : ''}" style="background:${c[0]}"><span class="pcover-brand">MOVE · INSPIRING CHANGE</span><span class="pcover-t">${o.name}</span><span class="pcover-cat">${o.category || (o.unit ? '· ' + o.unit : '')}</span>${o.tag ? `<span class="pcover-tag">${o.tag}</span>` : ''}</div>`; }
  function pr(o) { return typeof o.price === 'number' ? `$${o.price}` : o.price; }
  function offerModal(o) {
    if (!o) return; let m = $('#offerModal'); if (!m) { m = document.createElement('div'); m.id = 'offerModal'; m.className = 'modal'; document.body.appendChild(m); }
    const top = o.image ? `<div class="pcover" style="padding:0;overflow:hidden"><img src="${o.image}" style="width:100%;height:100%;object-fit:cover" alt=""></div>` : cover(o);
    m.innerHTML = `<div class="modal-box"><div style="position:relative">${top}<button class="modal-x" style="position:absolute;top:14px;right:14px;z-index:3">✕</button></div>
      <div class="modal-body"><h2>${o.name}</h2><div class="price" style="margin:6px 0">${pr(o)}<small> ${o.unit || ''}</small></div>
      <p class="lead" style="font-size:1rem">${o.desc || ''}</p>
      ${(o.features || []).length ? `<h4 style="margin-top:18px">What's included</h4><ul style="list-style:none;display:flex;flex-direction:column;gap:9px;margin-top:8px">${o.features.map(f => `<li style="display:flex;gap:10px"><span style="color:var(--green);font-weight:800">✓</span>${f}</li>`).join('')}</ul>` : ''}
      <a class="btn btn-primary" style="margin-top:22px" href="${o.link || LINK(o.name)}">Get started →</a></div></div>`;
    m.classList.add('open'); m.querySelector('.modal-x').onclick = () => m.classList.remove('open'); m.onclick = e => { if (e.target === m) m.classList.remove('open'); };
  }
  function wireDetails(root) {
    $$('[data-detail]', root).forEach(b => b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); const c = b.closest('[data-grp]'); offerModal((D.catalog[c.dataset.grp] || [])[+c.dataset.idx]); }));
    $$('.scard', root).forEach(c => c.addEventListener('click', e => { if (e.target.closest('a')) return; offerModal((D.catalog[c.dataset.grp] || [])[+c.dataset.idx]); }));
  }
  function pcard(o, i, grp) {
    const f = (o.tag === 'Most popular' || o.tag === 'Flagship'); const feats = o.features || [];
    return `<div class="pcard ${f ? 'feat' : ''}" data-grp="${grp}" data-idx="${i}">${o.tag ? `<span class="ribbon">${o.tag}</span>` : ''}<h3>${o.name}</h3>
      <div class="price">${pr(o)}<small> ${o.unit || ''}</small></div><p class="desc">${o.desc || ''}</p>
      <ul>${feats.slice(0, 5).map(x => `<li>${x}</li>`).join('')}${feats.length > 5 ? `<li style="list-style:none;color:var(--muted)">+ ${feats.length - 5} more…</li>` : ''}</ul>
      <div style="display:flex;gap:10px;margin-top:auto"><a class="btn btn-primary btn-sm" href="${o.link || LINK(o.name)}">Get started</a><button class="btn btn-ghost btn-sm" data-detail>Details</button></div></div>`;
  }
  function shopCard(o, i, grp) {
    const hasImg = !!o.image;
    const top = hasImg ? `<div class="pcover" style="padding:0;overflow:hidden"><img src="${o.image}" style="width:100%;height:100%;object-fit:cover" alt="${o.name}">${o.tag ? `<span class="pcover-tag">${o.tag}</span>` : ''}</div>` : cover(o);
    const title = hasImg ? `<h3>${o.name}</h3>` : ''; /* designed cover already shows the title — avoid duplicating it */
    const d = o.desc || ''; const desc = d.length > 96 ? d.slice(0, 96).trim() + '…' : d;
    return `<div class="scard" data-grp="${grp}" data-idx="${i}">${top}<div class="scard-b">${title}<p class="desc">${desc}</p><div class="scard-f"><span class="price" style="font-size:1.35rem">${pr(o)}</span><button class="btn btn-primary btn-sm" data-detail>View</button></div></div></div>`;
  }
  const cat = $('#catalog');
  if (cat) {
    const groups = [['programs', 'Signature Programs & Training', 'Transformations and training with real structure and coaching.'],
      ['coaching', '1:1 Coaching & Consultations', 'Work directly with a Bachelor-qualified nutritionist.'],
      ['memberships', 'Memberships & Subscriptions', 'Ongoing recipes, training and support — cancel anytime.']];
    cat.innerHTML = groups.map(([k, h, p]) => { const items = D.catalog[k] || []; if (!items.length) return '';
      return `<div class="cat-group"><h2>${h}</h2><p>${p}</p><div class="price-grid">${items.map((o, i) => pcard(o, i, k)).join('')}</div></div>`; }).join('')
      + ((D.catalog.archived || []).length ? `<div class="cat-group"><h2>Online Programs</h2><p>Returning soon — register your interest.</p><div class="archived-row">${D.catalog.archived.map(n => `<span class="arch">${n}</span>`).join('')}</div></div>` : '');
    wireDetails(cat);
  }
  const shopEl = $('#shop');
  if (shopEl) {
    const cats = {}; (D.catalog.shop || []).forEach(p => { (cats[p.category] = cats[p.category] || []).push(p); });
    let h = ''; const idxOf = {};
    Object.entries(cats).forEach(([c, items]) => { h += `<div class="cat-group"><h2>${c}</h2><div class="shop-grid">${items.map(o => { const gi = (D.catalog.shop || []).indexOf(o); return shopCard(o, gi, 'shop'); }).join('')}</div></div>`; });
    h += `<div class="cat-group"><h2>MIC Apparel <span style="font-size:.66rem;color:var(--accent);vertical-align:super">NEW</span></h2><p>The Move Inspiring Change clothing line — first drop coming soon.</p><div class="shop-grid">${(D.catalog.apparel || []).map((o, i) => shopCard(o, i, 'apparel')).join('')}</div></div>`;
    shopEl.innerHTML = h; wireDetails(shopEl);
  }
  /* ---------- blog page (all posts) ---------- */
  const blogEl = $('#blog');
  if (blogEl && D.blog) {
    blogEl.innerHTML = D.blog.map((p, i) => `<article class="rcard" data-bi="${i}"><div class="ph">${p.image ? `<img src="${p.image}" alt="" loading="lazy">` : ''}</div><div class="body"><div class="rmeta"><span>📅 ${p.date || ''}</span><span>⏱ ${p.read || ''}</span></div><h3>${p.title}</h3><p class="blurb">${p.excerpt || ''}</p></div></article>`).join('');
    $$('.rcard', blogEl).forEach(el => el.addEventListener('click', () => { const p = D.blog[+el.dataset.bi]; let m = $('#blogModal'); if (!m) { m = document.createElement('div'); m.id = 'blogModal'; m.className = 'modal'; document.body.appendChild(m); } m.innerHTML = `<div class="modal-box"><div class="modal-hero"><img src="${p.image}"><button class="modal-x">✕</button></div><div class="modal-body"><div class="rmeta"><span>📅 ${p.date || ''}</span><span>⏱ ${p.read || ''}</span></div><h2>${p.title}</h2><p class="lead" style="font-size:1rem;margin-top:10px">${p.excerpt || ''}</p><p style="color:var(--muted);margin-top:14px">The full article is published on the live Wix blog.</p></div></div>`; m.classList.add('open'); m.querySelector('.modal-x').onclick = () => m.classList.remove('open'); m.onclick = e => { if (e.target === m) m.classList.remove('open'); }; }));
  }

  /* ---------- checkout ---------- */
  const co = $('#checkout');
  if (co) {
    const p = new URLSearchParams(location.search).get('p') || '';
    const priced = allOffers().filter(o => o && o.name && (typeof o.price === 'number' || o.price));
    const item = (p && priced.find(o => slug(o.name) === p)) || priced.find(o => typeof o.price === 'number') || priced[0] || { name: 'Your selection', price: 0 };
    const price = typeof item.price === 'number' ? `$${item.price}.00` : (item.price || 'Free');
    co.innerHTML = `<div class="shead"><span class="eyebrow">Secure checkout</span><h2>You're almost in</h2></div>
      <div style="display:grid;grid-template-columns:1.2fr .9fr;gap:34px;align-items:start" class="checkout-grid">
        <div class="panel"><h3>Your details</h3>
          <div style="display:grid;gap:12px;margin-top:14px">
            <input class="fld" placeholder="Full name"><input class="fld" placeholder="Email address">
            <input class="fld" placeholder="Phone"><input class="fld" placeholder="Promo code (e.g. CONSULT89)"><input class="fld" placeholder="Card number"><div style="display:flex;gap:12px"><input class="fld" placeholder="MM / YY"><input class="fld" placeholder="CVC"></div></div>
          <button class="btn btn-primary" style="margin-top:18px;width:100%" id="payBtn">Pay ${price} securely</button>
          <p style="font-size:.8rem;color:var(--muted);text-align:center;margin-top:10px">🔒 Demo checkout · in the live site this is secure Wix Payments</p></div>
        <div class="panel" style="background:var(--green-deep);color:#fff"><h3 style="color:#fff">Order summary</h3>
          <div class="kv" style="border-color:rgba(255,255,255,.18)"><span style="color:#cdddcb">${item.name}</span><b style="color:#fff">${price}</b></div>
          <p style="color:#cdddcb;font-size:.9rem;margin-top:12px">${item.desc || ''}</p>
          <ul style="list-style:none;margin-top:14px;display:flex;flex-direction:column;gap:8px;font-size:.9rem;color:#dfe9dd">${(item.features || []).map(f => `<li>✓ ${f}</li>`).join('')}</ul></div></div>`;
    $('#payBtn').onclick = () => {
      co.innerHTML = `<div class="panel" style="max-width:520px;margin:40px auto;text-align:center">
        <div class="ico" style="margin:0 auto 14px;background:var(--sage-soft)">✅</div><h2>You're in, welcome 🌿</h2>
        <p class="lead" style="font-size:1rem;margin:10px 0 20px">Payment confirmed for <b>${item.name}</b>. We've emailed your receipt and next steps.</p>
        <a class="btn btn-primary" href="dashboard.html">Go to your dashboard →</a></div>`;
    };
  }

  /* ---------- DASHBOARD ---------- */
  const dview = $('#dashView');
  if (dview) {
    const widgets = `<div class="widgets">
      <div class="widget"><div class="wlabel">Current program</div><div class="wbig" style="font-size:1.25rem">The Strong Method</div><div class="wbar"><i style="width:62%"></i></div><p style="font-size:.82rem;color:var(--muted);margin-top:8px">Month 4 of 6 · on track</p></div>
      <div class="widget"><div class="wlabel">Consistency streak</div><div class="wbig">7 days 🔥</div><p style="font-size:.82rem;color:var(--muted);margin-top:8px">Your best yet — keep going.</p></div>
      <div class="widget"><div class="wlabel">Weight change</div><div class="wbig" style="color:var(--green)">−3.9 kg</div><p style="font-size:.82rem;color:var(--muted);margin-top:8px">Down &amp; holding — perfect.</p></div></div>`;
    const recipeView = (meal) => {
      const list = D.recipes.map((r, i) => ({ r, i })).filter(o => meal === 'All' || o.r.meal === meal);
      const sub = { Breakfast: 'High-protein starts to win your morning.', Lunch: 'Light, fresh and genuinely filling.', Dinner: 'Fast, balanced dinners the whole house will eat.', All: 'Your full high-protein library.' }[meal];
      return `${widgets}<div class="tabwrap"><h2>${meal === 'All' ? 'All Recipes' : meal}</h2><p class="muted">${sub}</p>
        <div class="recipe-grid">${list.length ? list.map(o => card(o.r, o.i)).join('') : `<div class="empty">New ${meal.toLowerCase()} recipes drop every week 🌿</div>`}</div></div>`;
    };
    const av = (n, c) => `<div class="av" style="background:${c}">${n[0]}</div>`;
    const POSTS = [
      { n: 'Rachel · Coach', c: 'var(--green)', t: 'Pinned', pin: 1, b: 'Welcome to the community 🌿 Drop a 👋 and your #1 goal this month. Judgement-free zone.', l: 41, cm: 18 },
      { n: 'Sarah M.', c: 'var(--accent)', t: '2h ago', b: 'Down 4kg and my energy is unreal 🙌 The high-protein breakfasts changed everything.', l: 27, cm: 9, img: 'assets/img/recipe-berry-vanilla-protein-smoothie.png' },
      { n: 'Rachel · Coach', c: 'var(--green)', t: '5h ago', b: '💪 This week: protein at EVERY meal. A palm-sized portion — your recovery will thank you.', l: 33, cm: 6 },
      { n: 'Jess T.', c: 'var(--gold)', t: 'Yesterday', b: 'Made the Greek chicken tonight — the whole family demolished it 😍 lunch sorted too.', l: 19, cm: 5, img: 'assets/img/recipe-slow-cooker-lemon-greek-chicken.jpg' }
    ];
    const communityView = () => `<div class="tabwrap"><h2>The Community</h2><p class="muted">373 women sharing wins, questions and accountability — moderated by Rachel.</p>
      <div class="feed"><div class="composer">${av('S', 'var(--accent)')}<input placeholder="Share a win or ask the community…"><button class="btn btn-ghost btn-sm" data-cta="Add photo">📷 Photo</button><button class="btn btn-primary btn-sm" data-cta="Post to community">Post</button></div>
      ${POSTS.map(p => `<div class="post">${p.pin ? '<div class="pin">📌 Pinned by Rachel</div>' : ''}<div class="post-head">${av(p.n, p.c)}<div><b>${p.n}</b><small>${p.t}</small></div></div>
        <div class="post-body">${p.b}</div>${p.img ? `<img src="${p.img}" style="width:100%;max-height:280px;object-fit:cover;border-radius:12px;margin-top:12px" alt="">` : ''}
        <div class="post-actions"><span>❤ ${p.l}</span><span>💬 ${p.cm} comments</span><span>↗ Share</span></div></div>`).join('')}</div></div>`;
    const savedView = () => `<div class="tabwrap"><h2>Saved Recipes</h2><p class="muted">Your hand-picked favourites.</p><div class="recipe-grid">${[0, 3].map(i => card(D.recipes[i], i)).join('')}</div></div>`;
    const programView = () => `<div class="tabwrap"><h2>My Program — The Strong Method™</h2><p class="muted">Month 4 of 6 · weekly check-ins with Rachel</p>${widgets}
      <div class="panel"><h3>This week's focus</h3><div class="kv"><span>Nutrition</span><b>Protein at every meal · 1.6g/kg</b></div><div class="kv"><span>Training</span><b>3 strength sessions · full-body</b></div>
      <div class="kv"><span>Habit</span><b>10k steps · 5 days</b></div><div class="kv"><span>Next check-in</span><b>Sunday 7:00pm with Rachel</b></div>
      <div style="margin-top:18px"><button class="btn btn-primary btn-sm" data-cta="Submit check-in">Submit weekly check-in</button></div></div></div>`;
    const subView = () => `<div class="tabwrap"><h2>My Subscription</h2><p class="muted">Manage your membership and invoices.</p>
      <div class="panel"><div class="kv"><span>Plan</span><b>Nutrition Made Simple — Monthly</b></div><div class="kv"><span>Price</span><b>$15.00 / month</b></div>
      <div class="kv"><span>Status</span><span class="pill-ok">Active</span></div><div class="kv"><span>Next billing</span><b>1 July 2026</b></div>
      <h3 style="margin:22px 0 4px">Invoices</h3>${['1 Jun', '1 May', '1 Apr'].map(d => `<div class="invoice"><span>${d} 2026 · Monthly membership</span><span>$15.00 · Paid</span></div>`).join('')}
      <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-cta="Update payment">Update payment</button><button class="btn btn-ghost btn-sm" data-cta="Change plan">Change plan</button></div></div></div>`;
    const progressView = () => {
      const w = [82.4, 81.9, 81.1, 80.6, 79.8, 79.2, 78.5]; const max = Math.max(...w), min = Math.min(...w);
      return `<div class="tabwrap"><h2>My Progress</h2><p class="muted">Weekly weigh-ins — trending down, the way it should 📉</p>${widgets}
      <div class="panel"><h3>Weight trend (last 7 weeks)</h3>
      <div class="tracker">${w.map((v, i) => `<div class="bar" style="height:${28 + (v - min) / (max - min) * 96}px"><small>${v}</small></div>`).join('')}</div>
      <p style="text-align:center;color:var(--muted);font-size:.78rem;margin-top:26px">W1 → W7 · each bar = that week's weigh-in</p>
      <div class="kv" style="margin-top:14px"><span>Start</span><b>82.4 kg</b></div><div class="kv"><span>Now</span><b>78.5 kg</b></div><div class="kv"><span>Change</span><b style="color:var(--green)">−3.9 kg 🎉</b></div>
      <div style="margin-top:18px"><button class="btn btn-primary btn-sm" data-cta="Log weigh-in">Log this week's weigh-in</button></div></div></div>`;
    };
    const settingsView = () => `<div class="tabwrap"><h2>Settings</h2><p class="muted">Your profile, preferences &amp; account.</p>
      <div class="panel"><h3>Profile</h3><div class="kv"><span>Name</span><b>Sarah Mitchell</b></div><div class="kv"><span>Email</span><b>sarah@email.com</b></div>
      <div class="kv"><span>Phone</span><b>0412 345 678</b></div><div class="kv"><span>Location</span><b>Brisbane, QLD</b></div>
      <div class="kv"><span>Dietary tags</span><b>High-protein · Gluten-free</b></div><div class="kv"><span>Allergies</span><b>None listed</b></div></div>
      <div class="panel" style="margin-top:18px"><h3>Notifications</h3><div class="kv"><span>New recipe alerts</span><span class="pill-ok">On</span></div>
      <div class="kv"><span>Weekly check-in reminders</span><span class="pill-ok">On</span></div><div class="kv"><span>Community replies</span><span class="pill-ok">On</span></div>
      <div class="kv"><span>Marketing emails</span><span style="color:var(--muted)">Off</span></div></div>
      <div class="panel" style="margin-top:18px"><h3>Account</h3><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><button class="btn btn-ghost btn-sm" data-cta="Change password">Change password</button><button class="btn btn-ghost btn-sm" data-cta="Manage billing">Manage billing</button></div></div></div>`;
    const VIEWS = { Breakfast: () => recipeView('Breakfast'), Lunch: () => recipeView('Lunch'), Dinner: () => recipeView('Dinner'), All: () => recipeView('All'), program: programView, saved: savedView, community: communityView, subscription: subView, progress: progressView, settings: settingsView,
      'browse-programs': () => '<div class="tabwrap"><h2>Programs, Coaching &amp; Plans</h2><p class="muted">Everything available to you — explore or upgrade anytime.</p>' + [['programs', 'Programs & Training'], ['coaching', '1:1 Coaching & Consults'], ['memberships', 'Memberships']].map(g => '<h3 style="margin:24px 0 12px">' + g[1] + '</h3><div class="price-grid">' + (D.catalog[g[0]] || []).map((o, i) => pcard(o, i, g[0])).join('') + '</div>').join('') + '</div>',
      'browse-shop': () => '<div class="tabwrap"><h2>Shop</h2><p class="muted">Guides, plans &amp; masterclasses.</p><div class="shop-grid">' + (D.catalog.shop || []).map((o, i) => shopCard(o, i, 'shop')).join('') + '</div></div>' };
    /* mobile off-canvas drawer */
    const side = $('.dash-side');
    let backdrop = $('.dash-backdrop');
    if (side && !backdrop) { backdrop = document.createElement('div'); backdrop.className = 'dash-backdrop'; document.body.appendChild(backdrop); }
    const drawer = (o) => { if (!side) return; side.classList.toggle('open', o); backdrop && backdrop.classList.toggle('open', o); };
    const showv = (v) => { dview.innerHTML = (VIEWS[v] || VIEWS.Breakfast)(); bind(dview); wireDetails(dview); $$('.dnav button').forEach(b => b.classList.toggle('active', b.dataset.view === v)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    $$('.dnav button[data-view]').forEach(b => b.addEventListener('click', () => { showv(b.dataset.view); drawer(false); }));
    const dburger = $('.dash-burger');
    dburger && dburger.addEventListener('click', () => drawer(!side.classList.contains('open')));
    backdrop && backdrop.addEventListener('click', () => drawer(false));
    showv('Breakfast');
  }

  /* ---------- generic CTA pop (for demo-only buttons) ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cta]'); if (!b) return; e.preventDefault();
    let m = $('#ctaModal'); if (!m) { m = document.createElement('div'); m.id = 'ctaModal'; m.className = 'modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="modal-box" style="max-width:440px"><div class="modal-body" style="text-align:center;padding:36px;position:relative">
      <button class="modal-x" style="position:absolute;top:14px;right:14px">✕</button><div class="ico" style="margin:0 auto 14px;background:var(--sage-soft)">✨</div>
      <h2 style="font-size:1.4rem">${b.dataset.cta}</h2><p class="lead" style="font-size:.96rem;margin:10px 0 20px">This action is wired up in the live site. This is the design preview.</p>
      <button class="btn btn-primary" id="cc">Got it</button></div></div>`;
    m.classList.add('open'); m.querySelector('#cc').onclick = () => m.classList.remove('open'); m.querySelector('.modal-x').onclick = () => m.classList.remove('open'); m.onclick = ev => { if (ev.target === m) m.classList.remove('open'); };
  });
})();
