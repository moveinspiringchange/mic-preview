/* Move Inspiring Change — prototype interactivity (renders from window.MIC_DATA) */
(function () {
  const D = window.MIC_DATA || { recipes: [], catalog: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- mobile nav ---------- */
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const links = $('.nav-links'); if (!links) return;
    const open = links.style.display === 'flex';
    Object.assign(links.style, open ? { display: '' } : {
      display: 'flex', position: 'absolute', top: '72px', left: 0, right: 0,
      flexDirection: 'column', background: 'var(--cream)', padding: '18px 24px',
      borderBottom: '1px solid var(--line)', gap: '16px'
    });
  });

  /* ---------- recipe card ---------- */
  function macroPanel(m) {
    if (!m) return '';
    const est = m.est ? ' is-est' : '';
    const cell = (v, l) => `<div class="macro${est}"><b>${v}</b><small>${l}</small></div>`;
    const flag = m.est ? '<div style="font-size:.66rem;color:var(--accent);text-align:right;margin-top:4px">macros estimated · pending Rachel</div>' : '';
    return `<div class="macros">${cell(m.cal, 'cal')}${cell(m.protein + 'g', 'protein')}${cell(m.carbs + 'g', 'carbs')}${cell(m.fat + 'g', 'fat')}</div>${flag}`;
  }
  function card(r, i) {
    const img = r.image ? `<img src="${r.image}" alt="${r.name}" loading="lazy">` : '';
    const tags = (r.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    return `<article class="rcard" data-i="${i}">
      <div class="ph">${img}<span class="meal">${r.meal}</span></div>
      <div class="body"><h3>${r.name}</h3>
        <div class="rmeta"><span>⏱ ${r.time || '—'}</span><span>🍽 Serves ${r.serves || '—'}</span></div>
        <p class="blurb">${r.blurb || ''}</p><div class="tags">${tags}</div>${macroPanel(r.macros)}
      </div></article>`;
  }
  function bind(c) { $$('.rcard', c).forEach(el => el.addEventListener('click', () => openModal(D.recipes[+el.dataset.i]))); }

  /* ---------- recipe modal ---------- */
  function openModal(r) {
    let m = $('#recipeModal');
    if (!m) { m = document.createElement('div'); m.id = 'recipeModal'; m.className = 'modal'; document.body.appendChild(m); }
    const ing = (r.ingredients || []).map(x => `<li>${x}</li>`).join('') || '<li>Ingredients being finalised</li>';
    const steps = (r.steps || []).map(x => `<li>${x}</li>`).join('') || '<li>Method being finalised</li>';
    m.innerHTML = `<div class="modal-box"><div class="modal-hero">${r.image ? `<img src="${r.image}" alt="${r.name}">` : ''}<button class="modal-x">✕</button></div>
      <div class="modal-body"><span class="eyebrow">${r.meal}</span><h2>${r.name}</h2>
        <p class="lead" style="margin-top:8px;font-size:1rem">${r.blurb || ''}</p>
        <div class="rmeta" style="margin-top:14px"><span>⏱ ${r.time || '—'}</span><span>🍽 Serves ${r.serves || '—'}</span>${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div style="margin-top:18px">${macroPanel(r.macros)}</div>
        <div class="modal-cols"><div><h4>Ingredients</h4><ul>${ing}</ul></div><div><h4>Method</h4><ol>${steps}</ol></div></div>
      </div></div>`;
    m.classList.add('open');
    m.querySelector('.modal-x').onclick = () => m.classList.remove('open');
    m.onclick = e => { if (e.target === m) m.classList.remove('open'); };
  }

  /* ---------- CTA modal (so Get Started / subscribe buttons do something) ---------- */
  function ctaModal(name) {
    let m = $('#ctaModal');
    if (!m) { m = document.createElement('div'); m.id = 'ctaModal'; m.className = 'modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="modal-box" style="max-width:460px"><div class="modal-body" style="text-align:center;padding:38px">
      <div class="ico" style="margin:0 auto 14px;background:var(--sage-soft)">🛒</div>
      <h2 style="font-size:1.5rem">${name || 'Get started'}</h2>
      <p class="lead" style="font-size:.98rem;margin:10px 0 22px">In the live site this opens <b>secure Wix checkout &amp; booking</b> — the member pays and is taken straight to their dashboard. This is the design preview.</p>
      <button class="btn btn-primary" id="ctaClose">Got it</button>
    </div></div>`;
    m.classList.add('open');
    m.querySelector('#ctaClose').onclick = () => m.classList.remove('open');
    m.querySelector('.modal-body').insertAdjacentHTML('afterbegin', '<button class="modal-x" style="position:absolute;top:14px;right:14px">✕</button>');
    m.querySelector('.modal-x').onclick = () => m.classList.remove('open');
    m.onclick = e => { if (e.target === m) m.classList.remove('open'); };
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cta]');
    if (b) { e.preventDefault(); ctaModal(b.dataset.cta || b.textContent.trim()); }
  });

  /* ---------- recipes page ---------- */
  const rgrid = $('#recipeGrid');
  if (rgrid) {
    const meals = ['All', 'Breakfast', 'Lunch', 'Dinner']; const fbar = $('#recipeFilters'); let active = 'All';
    const draw = () => {
      const list = D.recipes.map((r, i) => ({ r, i })).filter(o => active === 'All' || o.r.meal === active);
      rgrid.innerHTML = list.length ? list.map(o => card(o.r, o.i)).join('')
        : `<div class="empty">Fresh ${active.toLowerCase()} recipes are added every week — check back soon.</div>`;
      bind(rgrid);
    };
    if (fbar) fbar.innerHTML = meals.map(m => `<button class="pill ${m === 'All' ? 'active' : ''}" data-m="${m}">${m}</button>`).join('');
    $$('.pill', fbar).forEach(p => p.addEventListener('click', () => { $$('.pill', fbar).forEach(x => x.classList.remove('active')); p.classList.add('active'); active = p.dataset.m; draw(); }));
    draw();
  }

  /* ---------- homepage featured ---------- */
  const feat = $('#featuredRecipes');
  if (feat) { feat.innerHTML = D.recipes.slice(0, 3).map((r, i) => card(r, i)).join(''); bind(feat); }

  /* ---------- programs / catalog ---------- */
  const cat = $('#catalog');
  if (cat && D.catalog) {
    const groups = [
      ['programs', 'Signature Programs', 'Transformations with structure, accountability and real coaching.'],
      ['subscriptions', 'Memberships & Subscriptions', 'Ongoing support, recipes and training — cancel anytime.'],
      ['services', 'Coaching & Consultations', '1:1 with a qualified nutritionist.'],
      ['products', 'Shop', 'One-off guides and masterclasses.']
    ];
    cat.innerHTML = groups.map(([k, h, p]) => {
      const items = D.catalog[k] || []; if (!items.length) return '';
      return `<div class="cat-group"><h2>${h}</h2><p>${p}</p><div class="price-grid">${items.map(pcard).join('')}</div></div>`;
    }).join('');
  }
  function pcard(o) {
    const feat = (o.tag === 'Most popular' || o.tag === 'Flagship');
    const price = typeof o.price === 'number' ? `$${o.price}` : o.price;
    return `<div class="pcard ${feat ? 'feat' : ''}">${o.tag ? `<span class="ribbon">${o.tag}</span>` : ''}
      <h3>${o.name}</h3><div class="price">${price}<small> ${o.unit || ''}</small></div>
      <p class="desc">${o.desc || ''}</p><ul>${(o.features || []).map(f => `<li>${f}</li>`).join('')}</ul>
      <button class="btn btn-primary" data-cta="${o.name}">Get started</button></div>`;
  }

  /* ---------- DASHBOARD (multi-view) ---------- */
  const dview = $('#dashView');
  if (dview) {
    const widgets = `<div class="widgets">
      <div class="widget"><div class="wlabel">Current program</div><div class="wbig" style="font-size:1.25rem">The Strong Method</div><div class="wbar"><i style="width:62%"></i></div><p style="font-size:.82rem;color:var(--muted);margin-top:8px">Month 4 of 6 · on track</p></div>
      <div class="widget"><div class="wlabel">Consistency streak</div><div class="wbig">7 days 🔥</div><p style="font-size:.82rem;color:var(--muted);margin-top:8px">Your best yet — keep going.</p></div>
      <div class="widget"><div class="wlabel">This week</div><div class="wbig">5 recipes</div><p style="font-size:.82rem;color:var(--muted);margin-top:8px">Saved &amp; ready to cook.</p></div></div>`;

    const recipeView = (meal) => {
      const list = D.recipes.map((r, i) => ({ r, i })).filter(o => meal === 'All' || o.r.meal === meal);
      const sub = { Breakfast: 'High-protein starts to win your morning.', Lunch: 'Light, fresh and genuinely filling.', Dinner: 'Fast, balanced dinners the whole house will eat.', All: 'Your full high-protein library.' }[meal];
      return `${widgets}<div class="tabwrap"><h2>${meal === 'All' ? 'All Recipes' : meal}</h2><p class="muted">${sub}</p>
        <div class="recipe-grid" id="dg">${list.length ? list.map(o => card(o.r, o.i)).join('') : `<div class="empty">New ${meal.toLowerCase()} recipes drop every week. Yours are on the way 🌿</div>`}</div></div>`;
    };

    const COMMUNITY = [
      { n: 'Rachel · Coach', c: 'var(--green)', t: 'Pinned', pin: 1, b: 'Welcome to the community 🌿 Drop a 👋 below and tell us your #1 goal this month. This is your safe, judgement-free space.', l: 41, cm: 18 },
      { n: 'Sarah M.', c: 'var(--accent)', t: '2h ago', b: 'Down 4kg and my energy is unreal 🙌 The high-protein breakfasts genuinely changed everything for me.', l: 27, cm: 9 },
      { n: 'Rachel · Coach', c: 'var(--green)', t: '5h ago', b: '💪 This week\'s focus: protein at EVERY meal. Aim for a palm-sized portion — your recovery (and cravings) will thank you.', l: 33, cm: 6 },
      { n: 'Jess T.', c: 'var(--gold)', t: 'Yesterday', b: 'Quick one — anyone got a go-to lunch for busy work days? Trying to stop reaching for the vending machine 😅', l: 12, cm: 14 },
      { n: 'Mel K.', c: 'var(--sage)', t: '2 days ago', b: 'First time my macros hit all week and I didn\'t feel deprived once. The broccoli salad is a new staple ❤️', l: 19, cm: 5 }
    ];
    const av = p => `<div class="av" style="background:${p.c}">${p.n[0]}</div>`;
    const communityView = () => `<div class="tabwrap"><h2>The Community</h2><p class="muted">373 women sharing wins, questions and accountability — moderated by Rachel.</p>
      <div class="feed"><div class="composer">${av({ n: 'S', c: 'var(--accent)' })}<input placeholder="Share a win or ask the community…"><button class="btn btn-primary btn-sm" data-cta="Post to community">Post</button></div>
      ${COMMUNITY.map(p => `<div class="post">${p.pin ? '<div class="pin">📌 Pinned by Rachel</div>' : ''}
        <div class="post-head">${av(p)}<div><b>${p.n}</b><small>${p.t}</small></div></div>
        <div class="post-body">${p.b}</div>
        <div class="post-actions"><span>❤ ${p.l}</span><span>💬 ${p.cm} comments</span><span>↗ Share</span></div></div>`).join('')}</div></div>`;

    const savedView = () => `<div class="tabwrap"><h2>Saved Recipes</h2><p class="muted">Your hand-picked favourites, ready to cook.</p>
      <div class="recipe-grid">${[0, 3].map(i => card(D.recipes[i], i)).join('')}</div></div>`;

    const programView = () => `<div class="tabwrap"><h2>My Program — The Strong Method™</h2><p class="muted">Month 4 of 6 · weekly check-ins with Rachel</p>
      ${widgets}<div class="panel" style="margin-top:8px"><h3>This week's focus</h3>
      <div class="kv"><span>Nutrition</span><b>Protein at every meal · 1.6g/kg</b></div>
      <div class="kv"><span>Training</span><b>3 strength sessions · full-body</b></div>
      <div class="kv"><span>Habit</span><b>10k steps · 5 days</b></div>
      <div class="kv"><span>Next check-in</span><b>Sunday 7:00pm with Rachel</b></div>
      <div style="margin-top:18px"><button class="btn btn-primary btn-sm" data-cta="Submit check-in">Submit weekly check-in</button></div></div></div>`;

    const subView = () => `<div class="tabwrap"><h2>My Subscription</h2><p class="muted">Manage your membership and invoices.</p>
      <div class="panel"><div class="kv"><span>Plan</span><b>Nutrition Made Simple — Monthly</b></div>
      <div class="kv"><span>Price</span><b>$15.00 / month</b></div>
      <div class="kv"><span>Status</span><span class="pill-ok">Active</span></div>
      <div class="kv"><span>Next billing</span><b>1 July 2026</b></div>
      <h3 style="margin:22px 0 4px">Invoices</h3>
      <div class="invoice"><span>1 Jun 2026 · Monthly membership</span><span>$15.00 · Paid</span></div>
      <div class="invoice"><span>1 May 2026 · Monthly membership</span><span>$15.00 · Paid</span></div>
      <div class="invoice"><span>1 Apr 2026 · Monthly membership</span><span>$15.00 · Paid</span></div>
      <div style="margin-top:18px;display:flex;gap:10px"><button class="btn btn-ghost btn-sm" data-cta="Update payment">Update payment</button><button class="btn btn-ghost btn-sm" data-cta="Manage plan">Change plan</button></div></div></div>`;

    const progressView = () => {
      const w = [82.4, 81.9, 81.1, 80.6, 79.8, 79.2, 78.5];
      const max = Math.max(...w), min = Math.min(...w);
      return `<div class="tabwrap"><h2>My Progress</h2><p class="muted">Weekly weigh-ins &amp; measurements — visualise the trend, not the day-to-day.</p>
      ${widgets}<div class="panel"><h3>Weight trend (last 7 weeks)</h3>
      <div class="tracker">${w.map((v, i) => `<div class="bar" style="height:${20 + (max - v) / (max - min) * 100}px"><small>W${i + 1}</small></div>`).join('')}</div>
      <div class="kv" style="margin-top:14px"><span>Start</span><b>82.4 kg</b></div><div class="kv"><span>Now</span><b>78.5 kg</b></div><div class="kv"><span>Change</span><b style="color:var(--green)">−3.9 kg 🎉</b></div>
      <div style="margin-top:18px"><button class="btn btn-primary btn-sm" data-cta="Log weigh-in">Log this week's weigh-in</button></div></div></div>`;
    };

    const settingsView = () => `<div class="tabwrap"><h2>Settings</h2><p class="muted">Your profile &amp; preferences.</p>
      <div class="panel"><div class="kv"><span>Name</span><b>Sarah Mitchell</b></div><div class="kv"><span>Email</span><b>sarah@email.com</b></div>
      <div class="kv"><span>Dietary tags</span><b>High-protein · Gluten-free</b></div>
      <div class="kv"><span>Email reminders</span><span class="pill-ok">On</span></div>
      <div class="kv"><span>New recipe alerts</span><span class="pill-ok">On</span></div></div></div>`;

    const VIEWS = {
      Breakfast: () => recipeView('Breakfast'), Lunch: () => recipeView('Lunch'), Dinner: () => recipeView('Dinner'), All: () => recipeView('All'),
      program: programView, saved: savedView, community: communityView, subscription: subView, progress: progressView, settings: settingsView
    };
    const show = (v) => { dview.innerHTML = (VIEWS[v] || VIEWS.Breakfast)(); bind(dview); $$('.dnav button').forEach(b => b.classList.toggle('active', b.dataset.view === v)); };
    $$('.dnav button[data-view]').forEach(b => b.addEventListener('click', () => show(b.dataset.view)));
    show('Breakfast');
  }
})();
