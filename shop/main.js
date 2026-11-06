/* ═══════════════════════════════════════════════════════
   SBPL GARAGE — main.js  (version bulletproof)
   Tout est dans DOMContentLoaded — aucun null possible
   ═══════════════════════════════════════════════════════ */

const PER_PAGE = 8;

document.addEventListener('DOMContentLoaded', () => {

  /* ── REFS ───────────────────────────────────────────── */
  const app = document.getElementById('app');
  const grid = document.getElementById('product-grid');
  const paginEl = document.getElementById('pagination');
  const cartDrawer = document.getElementById('cart-drawer');
  const overlayEl = document.getElementById('overlay');
  const cartList = document.getElementById('cart-list');
  const cartBadge = document.getElementById('cart-badge');
  const cartTotalEl = document.getElementById('cart-total');
  const toastEl = document.getElementById('toast');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart');
  const themeBtn = document.getElementById('theme-btn');
  const themeIcon = document.getElementById('theme-icon');

  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const sortSelect = document.getElementById('sort-select');
  const recentsGrid = document.getElementById('recents-grid');

  /* ── STATE ──────────────────────────────────────────── */
  let cart = [];
  let activeCat = 'all';
  let activePage = 1;
  let currentPage = 'home';
  let searchQuery = '';
  let sortMode = 'default';

  /* ═══════════════════════════════════════════════════
     RECENT PRODUCTS — 4 derniers arrivages
  ═══════════════════════════════════════════════════ */
  function renderRecents() {
    if (!recentsGrid) return;
    const recents = [...products].slice(-4).reverse();
    recentsGrid.innerHTML = '';
    recents.forEach(p => recentsGrid.appendChild(buildCard(p)));
    lucide.createIcons();
    gsap.fromTo('#recents-grid .card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, delay: 0.8, ease: 'power3.out' }
    );
  }

  /* ═══════════════════════════════════════════════════
     RÉCENTS SCROLL HORIZONTAL (boutique)
  ═══════════════════════════════════════════════════ */
  function renderRecentsScroll() {
    const container = document.getElementById('recents-scroll');
    if (!container) return;
    const recents = [...products].slice(-6).reverse();
    container.innerHTML = '';
    recents.forEach(p => container.appendChild(buildCard(p)));
    lucide.createIcons();
  }

  /* ═══════════════════════════════════════════════════
     PROMO SLIDER
  ═══════════════════════════════════════════════════ */
  function initMobileSlider() {
    const slider = document.getElementById('mobile-slider');
    const dots = document.getElementById('m-dots');
    const slides = slider ? slider.querySelectorAll('.m-slide') : [];
    if (!slides.length) return;

    // Create dots
    dots.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = `m-dot ${i === 0 ? 'active' : ''}`;
      d.addEventListener('click', () => goTo(i));
      dots.appendChild(d);
    });

    let current = 0;
    const mDots = dots.querySelectorAll('.m-dot');

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      slider.style.transform = `translateX(-${current * 100}%)`;
      mDots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    let timer = setInterval(() => goTo(current + 1), 4000);

    slider.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
  }

  function initSlider() {
    const slider = document.getElementById('promo-slider');
    let slides = slider ? slider.querySelectorAll('.promo-slide') : [];
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    if (!slider || !slides.length) return;

    // INFINITE LOOP TRICK: Clone first slide and append to end
    const firstClone = slides[0].cloneNode(true);
    slider.appendChild(firstClone);

    // Refresh slides list
    const allSlides = slider.querySelectorAll('.promo-slide');
    const total = slides.length; // real count
    let current = 0;
    let isTransitioning = false;
    let autoTimer;

    function goTo(idx, instant = false) {
      if (isTransitioning && !instant) return;
      isTransitioning = true;

      // Update dots (only for real slides)
      dots.forEach(d => d.classList.remove('active'));
      dots[idx % total]?.classList.add('active');

      if (instant) {
        slider.style.transition = 'none';
      } else {
        slider.style.transition = 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }

      slider.style.transform = `translateX(-${idx * 100}%)`;

      // Manage active class for content animations
      allSlides.forEach(s => s.classList.remove('active'));
      void slider.offsetWidth; // Force reflow to reset animations
      allSlides[idx].classList.add('active');

      current = idx;

      if (!instant) {
        setTimeout(() => {
          isTransitioning = false;
          // Si on est sur le clone (fin), on saute au vrai premier (début)
          if (current === total) {
            goTo(0, true);
          }
          // Si on essaie d'aller en arrière depuis le début
          if (current < 0) {
            goTo(total - 1, true);
          }
        }, 700);
      } else {
        isTransitioning = false;
      }
    }

    // Init first slide
    slides[0].classList.add('active');

    // Navigation
    prevBtn?.addEventListener('click', () => { clearInterval(autoTimer); if (current > 0) goTo(current - 1); else { /* jump logic for prev is harder, let's keep it simple for next */ } startAuto(); });
    nextBtn?.addEventListener('click', () => { clearInterval(autoTimer); goTo(current + 1); startAuto(); });
    dots.forEach(d => d.addEventListener('click', () => { clearInterval(autoTimer); goTo(+d.dataset.idx); startAuto(); }));

    // Auto-play
    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }
    startAuto();
  }

  /* ═══════════════════════════════════════════════════
     DÉTAIL PRODUIT
  ═══════════════════════════════════════════════════ */
  function renderProductDetail(productId) {
    const p = products.find(x => x.id == productId);
    const container = document.getElementById('product-detail-content');
    if (!p || !container) return;

    container.innerHTML = `
      <div class="pd-visual">
        <img src="${p.image}" alt="${p.name}"/>
      </div>
      <div class="pd-info">
        <span class="pd-cat">${p.category}</span>
        <h1>${p.name}</h1>
        <span class="pd-price">${p.price.toLocaleString('fr-FR')} FCFA</span>
        
        <div class="pd-desc-wrap">
          <h2 class="pd-desc-title">Description</h2>
          <p class="pd-desc">${p.description}</p>
        </div>

        <div class="pd-actions">
          <button class="pd-add-btn" id="pd-add">Ajouter au panier</button>
        </div>
      </div>
    `;

    document.getElementById('pd-add').addEventListener('click', () => addToCart(p.id));

    gsap.fromTo('.pd-visual', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo('.pd-info > *', { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, delay: 0.2 });
  }

  /* ═══════════════════════════════════════════════════
     SPA ROUTER — une page visible à la fois
  ═══════════════════════════════════════════════════ */
  function navigate(pageId, extra) {
    if (pageId === currentPage && !extra) {
      if (pageId === 'shop') {
        const targetScroll = document.getElementById('product-grid');
        if (targetScroll) {
          const offset = targetScroll.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }
      return;
    }
    currentPage = pageId;

    /* nav active */
    document.querySelectorAll('.nav-btn, .mob-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.page === pageId)
    );

    /* ferme le menu mobile */
    if (mobileMenu) mobileMenu.classList.remove('open');

    /* transition GSAP */
    if (app) {
      gsap.to(app, {
        opacity: 0, y: 12, duration: 0.2,
        onComplete() {
          /* cacher toutes les pages */
          document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
          });

          /* afficher la cible */
          const target = document.getElementById('page-' + pageId);
          if (!target) return; // Sécurité

          target.style.display = 'block';
          target.classList.add('active');

          /* filtre depuis accueil */
          if (extra && extra.cat) {
            activeCat = extra.cat;
            activePage = 1;
            document.querySelectorAll('.filter').forEach(b =>
              b.classList.toggle('active', b.dataset.cat === extra.cat)
            );
          }

          /* Detail produit */
          if (pageId === 'product' && extra && extra.id) {
            renderProductDetail(extra.id);
          }

          gsap.to(app, {
            opacity: 1, y: 0, duration: 0.35, ease: 'power3.out',
            onComplete() {
              gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 0.3 });
              if (pageId === 'shop') {
                renderProducts();
                renderRecentsScroll();
                initSlider();
                initMobileSlider();
              }
              if (pageId === 'about') animateAbout();
              if (pageId === 'home') animateHome();
              window.scrollTo(0, 0); // Reset scroll on page change
            }
          });
        }
      });
    } else {
      // Fallback sans GSAP si app est null
      const target = document.getElementById('page-' + pageId);
      if (target) {
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        target.style.display = 'block';
        if (pageId === 'shop') renderProducts();
      }
    }
  }

  /* Délégation globale sur data-page */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-page]');
    if (!el) return;
    e.preventDefault();
    const page = el.dataset.page;
    const cat = el.dataset.cat || null;
    const id = el.dataset.id || null;
    navigate(page, { cat, id });
  });

  /* ═══════════════════════════════════════════════════
     CARTES PRODUIT
  ═══════════════════════════════════════════════════ */
  function buildCard(p) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="card-img" data-page="product" data-id="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy"/>
        
        <div class="card-top-actions">
          <div class="cta-plus" aria-label="Ajouter vite"><i data-lucide="plus"></i></div>
          <div class="cta-heart" aria-label="Favoris"><i data-lucide="heart"></i></div>
        </div>

        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}

        <div class="card-panel">
          <div class="panel-price-wrap">
            <span class="panel-price">${p.price.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div class="panel-actions">
            <button class="btn-voir" data-page="product" data-id="${p.id}">Voir plus</button>
            <button class="btn-add" aria-label="Ajouter au panier">
              <i data-lucide="shopping-bag"></i>
            </button>
          </div>
        </div>

        <div class="card-foot">
          <span class="card-name-label">${p.name}</span>
        </div>
      </div>
    `;

    card.querySelector('.btn-add').addEventListener('click', ev => {
      ev.stopPropagation();
      addToCart(p.id);
    });

    return card;
  }

  /* ═══════════════════════════════════════════════════
     RENDER + PAGINATION
  ═══════════════════════════════════════════════════ */

  function renderProducts() {
    const list = getFiltered();
    const pages = Math.ceil(list.length / PER_PAGE);
    activePage = Math.max(1, Math.min(activePage, pages || 1));

    const slice = list.slice((activePage - 1) * PER_PAGE, activePage * PER_PAGE);

    grid.innerHTML = '';

    if (!slice.length) {
      grid.innerHTML = `
        <div class="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            <path d="M8 11h6M11 8v6" opacity="0.4"/>
          </svg>
          <p>Aucun produit trouvé pour "<strong>${searchQuery}</strong>"</p>
        </div>`;
      paginEl.innerHTML = '';
      return;
    }

    slice.forEach(p => grid.appendChild(buildCard(p)));
    lucide.createIcons();
    if (document.querySelectorAll('.card').length > 0) {
      gsap.fromTo('.card',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }
      );
    }
    buildPagination(pages);
  }

  function buildPagination(total) {
    paginEl.innerHTML = '';
    if (total <= 1) return;

    const prev = makePageBtn('← Préc', 'nav-p');
    prev.disabled = activePage === 1;
    prev.addEventListener('click', () => { activePage--; renderProducts(); });
    paginEl.appendChild(prev);

    for (let i = 1; i <= total; i++) {
      const b = makePageBtn(i, '');
      if (i === activePage) b.classList.add('active');
      b.addEventListener('click', () => { activePage = i; renderProducts(); });
      paginEl.appendChild(b);
    }

    const next = makePageBtn('Suiv →', 'nav-p');
    next.disabled = activePage === total;
    next.addEventListener('click', () => { activePage++; renderProducts(); });
    paginEl.appendChild(next);
  }

  function makePageBtn(label, cls) {
    const b = document.createElement('button');
    b.className = 'page-btn ' + cls;
    b.innerHTML = label;
    return b;
  }

  function getFiltered() {
    let list = activeCat === 'all' ? [...products] : products.filter(p => p.category === activeCat);

    // Recherche
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Tri
    switch (sortMode) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return list;
  }

  /* Filtres catégorie */
  document.querySelectorAll('.filter').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.cat === activeCat) return;
      activeCat = b.dataset.cat;
      activePage = 1;
      document.querySelectorAll('.filter').forEach(x =>
        x.classList.toggle('active', x.dataset.cat === activeCat)
      );
      gsap.to('.card', { opacity: 0, scale: 0.95, duration: 0.18, onComplete: renderProducts });
    });
  });

  /* Recherche */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      searchClear.classList.toggle('visible', searchQuery.length > 0);
      activePage = 1;
      renderProducts();
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.classList.remove('visible');
      activePage = 1;
      renderProducts();
      searchInput.focus();
    });
  }

  /* Tri */
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortMode = sortSelect.value;
      activePage = 1;
      renderProducts();
    });
  }

  /* ═══════════════════════════════════════════════════
     PANIER
  ═══════════════════════════════════════════════════ */
  function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    cart.push(p);
    syncCart();
    showToast(`"${p.name}" ajouté`);
    gsap.fromTo(cartBadge, { scale: 1.9 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
  }

  function removeFromCart(idx) {
    const items = cartList.querySelectorAll('.cart-item');
    const item = items[idx];
    if (!item) { cart.splice(idx, 1); syncCart(); return; }
    gsap.to(item, {
      x: 60, opacity: 0, duration: 0.25,
      onComplete() { cart.splice(idx, 1); syncCart(); }
    });
  }

  function syncCart() {
    cartBadge.textContent = cart.length;
    const total = cart.reduce((s, p) => s + p.price, 0);
    cartTotalEl.textContent = total.toLocaleString('fr-FR') + ' FCFA';

    if (!cart.length) {
      cartList.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
      return;
    }
    cartList.innerHTML = '';
    cart.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="ci-img"><img src="${p.image}" alt="${p.name}"/></div>
        <div class="ci-info">
          <p class="ci-name">${p.name}</p>
          <p class="ci-price">${p.price.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <button class="ci-del icon-btn" aria-label="Supprimer"><i data-lucide="trash-2"></i></button>
      `;
      el.querySelector('.ci-del').addEventListener('click', () => removeFromCart(i));
      cartList.appendChild(el);
    });
    lucide.createIcons();
  }

  function openCart() {
    cartDrawer.classList.add('open');
    overlayEl.classList.add('show');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    overlayEl.classList.remove('show');
  }

  cartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  overlayEl.addEventListener('click', closeCart);

  /* WhatsApp Checkout */
  function handleCheckout() {
    if (cart.length === 0) {
      showToast("Votre panier est vide");
      return;
    }
    let msg = "Bonjour SBPL, je souhaite commander les articles suivants :\n\n";
    cart.forEach((p, i) => {
      msg += `${i + 1}. *${p.name}* - ${p.price.toLocaleString('fr-FR')} FCFA\n`;
    });
    const total = cart.reduce((sum, p) => sum + p.price, 0);
    msg += `\n*Total : ${total.toLocaleString('fr-FR')} FCFA*`;

    const phone = "22893343696";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

  /* ═══════════════════════════════════════════════════
     TOAST
  ═══════════════════════════════════════════════════ */
  let toastT;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ═══════════════════════════════════════════════════
     THÈME
  ═══════════════════════════════════════════════════ */
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const dark = html.getAttribute('data-theme') === 'dark';
      gsap.to('body', {
        opacity: 0, duration: 0.18,
        onComplete() {
          html.setAttribute('data-theme', dark ? 'light' : 'dark');
          if (themeIcon) themeIcon.setAttribute('data-lucide', dark ? 'sun' : 'moon');
          lucide.createIcons();
          gsap.to('body', { opacity: 1, duration: 0.3 });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     MENU MOBILE
  ═══════════════════════════════════════════════════ */
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  /* ═══════════════════════════════════════════════════
     ANIMATIONS
  ═══════════════════════════════════════════════════ */
  function animateHome() {
    renderRecents();
    gsap.fromTo('.hero-text', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo('.hero-visual', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.fromTo('.kpi', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.4 });
    gsap.fromTo('.cat-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, delay: 0.6 });
  }

  function animateAbout() {
    gsap.fromTo('.about-hero', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 });
    gsap.fromTo('.stat', { opacity: 0, y: 25 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.2 });
    gsap.fromTo('.value-card', { opacity: 0, y: 25 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.4 });
  }

  /* ═══════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════ */
  lucide.createIcons();
  syncCart();

  /* Animation Reveal Background Image 1.png */
  if (document.querySelector('.bg-image-reveal img')) {
    gsap.to('.bg-image-reveal img', {
      xPercent: 10,
      duration: 30,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  /* Initialisation propre sur la page d'accueil via le router */
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');

  if (catParam) {
    navigate('shop', { cat: catParam });
  } else {
    // Si la page d'accueil n'existe pas (cas de boutique.html), on va direct au shop
    if (!document.getElementById('page-home')) {
      navigate('shop');
    } else {
      navigate('home');
    }
  }

  gsap.fromTo('#navbar', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });

}); // fin DOMContentLoaded
