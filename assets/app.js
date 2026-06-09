/* Move Inspiring Change — prototype interactivity (renders from window.MIC_DATA) */
(function () {
  const D = window.MIC_DATA || { recipes: [], catalog: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- mobile nav ---------- */
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const links = $('.nav-links');
    if (!links) return;
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
    const cell = (v, l) => `<div class="macro"><b>${v}</b><small>${l}</small></div>`;
    return `<div class="macros">${cell(m.cal, 'cal')}${cell(m.protein + 'g', 'protein')}${cell(m.carbs + 'g', 'carbs')}${cell(m.fat + 'g', 'fat')}</div>`;
  }
  function card(r, i) {
    const img = r.image ? `<img src="${r.image}" alt="${r.name}" loading="lazy">` : '';
    const tags = (r.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    return `<article class="rcard" data-i="${i}">
      <div class="ph">${img}<span class="meal">${r.meal}</span></div>
      <div class="body">
        <h3>${r.name}</h3>
        <div class="rmeta"><span>⏱ ${r.time || '—'}</span><span>🍽 Serves ${r.serves || '—'}</span></div>
        <p class="blurb">${r.blurb || ''}</p>
        <div class="tags">${tags}</div>
        ${macroPanel(r.macros)}
      </div></article>`;
  }
  function bind(container) {
    $$('.rcard', container).forEach(el =>
      el.addEventListener('click', () => openModal(D.recipes[+el.dataset.i])));
  }

  /* ---------- modal ---------- */
  function openModal(r) {
    let m = $('#recipeModal');
    if (!m) { m = document.createElement('div'); m.id = 'recipeModal'; m.className = 'modal'; document.body.appendChild(m); }
    const ing = (r.ingredients || []).map(x => `<li>${x}</li>`).join('') || '<li>Ingredients being finalised</li>';
    const steps = (r.steps || []).map(x => `<li>${x}</li>`).join('') || '<li>Method being finalised</li>';
    const macro = r.macros ? `<div style="margin-top:18px">${macroPanel(r.macros)}</div>`
      : `<p style="margin-top:14px;color:var(--muted);font-size:.88rem">Per-serve macros are being added to every recipe.</p>`;
    m.innerHTML = `<div class="modal-box">
      <div class="modal-hero">${r.image ? `<img src="${r.image}" alt="${r.name}">` : ''}<button class="modal-x" aria-label="Close">✕</button></div>
      <div class="modal-body">
        <span class="eyebrow">${r.meal}</span>
        <h2>${r.name}</h2>
        <p class="lead" style="margin-top:8px;font-size:1rem">${r.blurb || ''}</p>
        <div class="rmeta" style="margin-top:14px"><span>⏱ ${r.time || '—'}</span><span>🍽 Serves ${r.serves || '—'}</span>${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        ${macro}
        <div class="modal-cols">
          <div><h4>Ingredients</h4><ul>${ing}</ul></div>
          <div><h4>Method</h4><ol>${steps}</ol></div>
        </div>
      </div></div>`;
    m.classList.add('open');
    m.querySelector('.modal-x').onclick = () => m.classList.remove('open');
    m.onclick = e => { if (e.target === m) m.classList.remove('open'); };
  }

  /* ---------- recipes page (with filters) ---------- */
  const rgrid = $('#recipeGrid');
  if (rgrid) {
    const meals = ['All', 'Breakfast', 'Lunch', 'Dinner'];
    const fbar = $('#recipeFilters');
    let active = 'All';
    const draw = () => {
      const list = active === 'All' ? D.recipes : D.recipes.filter(r => r.meal === active);
      rgrid.innerHTML = list.length
        ? D.recipes.map((r, i) => ({ r, i })).filter(o => active === 'All' || o.r.meal === active).map(o => card(o.r, o.i)).join('')
        : `<div class="empty">Fresh ${active.toLowerCase()} recipes are added every week — check back soon.</div>`;
      bind(rgrid);
    };
    if (fbar) fbar.innerHTML = meals.map(m => `<button class="pill ${m === 'All' ? 'active' : ''}" data-m="${m}">${m}</button>`).join('');
    $$('.pill', fbar).forEach(p => p.addEventListener('click', () => {
      $$('.pill', fbar).forEach(x => x.classList.remove('active')); p.classList.add('active'); active = p.dataset.m; draw();
    }));
    draw();
  }

  /* ---------- homepage featured ---------- */
  const feat = $('#featuredRecipes');
  if (feat) { feat.innerHTML = D.recipes.slice(0, 3).map((r, i) => card(r, i)).join(''); bind(feat); }

  /* ---------- dashboard ---------- */
  const dgrid = $('#dashRecipes');
  if (dgrid) {
    const tabs = $$('.dnav button[data-meal]');
    const title = $('#dashTabTitle'), sub = $('#dashTabSub');
    const copy = {
      Breakfast: ['Breakfast', 'High-protein starts to win your morning.'],
      Lunch: ['Lunch', 'Light, fresh and genuinely filling.'],
      Dinner: ['Dinner', 'Fast, balanced dinners the whole house will eat.'],
      All: ['All Recipes', 'Your full high-protein library.']
    };
    const draw = (meal) => {
      const list = meal === 'All' ? D.recipes : D.recipes.filter(r => r.meal === meal);
      if (title) title.textContent = copy[meal][0];
      if (sub) sub.textContent = copy[meal][1];
      dgrid.innerHTML = list.length
        ? D.recipes.map((r, i) => ({ r, i })).filter(o => meal === 'All' || o.r.meal === meal).map(o => card(o.r, o.i)).join('')
        : `<div class="empty">New ${meal.toLowerCase()} recipes drop every week. Yours are on the way 🌿</div>`;
      bind(dgrid);
    };
    tabs.forEach(t => t.addEventListener('click', () => {
      $$('.dnav button').forEach(x => x.classList.remove('active')); t.classList.add('active'); draw(t.dataset.meal);
    }));
    draw('Breakfast');
  }

  /* ---------- programs / catalog ---------- */
  const cat = $('#catalog');
  if (cat && D.catalog) {
    const groups = [
      ['programs', 'Signature Programs', 'Transformations with structure, accountability and real coaching.'],
      ['subscriptions', 'Memberships & Subscriptions', 'Ongoing support, recipes and training — cancel anytime.'],
      ['services', 'Coaching & Consultations', '1:1 with a qualified nutritionist.'],
      ['products', 'Shop', 'One-off guides and masterclasses.']
    ];
    cat.innerHTML = groups.map(([key, h, p]) => {
      const items = D.catalog[key] || [];
      if (!items.length) return '';
      return `<div class="cat-group"><h2>${h}</h2><p>${p}</p><div class="price-grid">${items.map(pcard).join('')}</div></div>`;
    }).join('');
  }
  function pcard(o) {
    const feat = (o.tag === 'Most popular' || o.tag === 'Flagship');
    const price = typeof o.price === 'number' ? `$${o.price}` : o.price;
    return `<div class="pcard ${feat ? 'feat' : ''}">
      ${o.tag ? `<span class="ribbon">${o.tag}</span>` : ''}
      <h3>${o.name}</h3>
      <div class="price">${price}<small> ${o.unit || ''}</small></div>
      <p class="desc">${o.desc || ''}</p>
      <ul>${(o.features || []).map(f => `<li>${f}</li>`).join('')}</ul>
      <button class="btn btn-primary">Get started</button>
    </div>`;
  }
})();
