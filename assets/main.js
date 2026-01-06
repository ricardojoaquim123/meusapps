// Dynamic carousel driven by assets/apps.json
(function () {
  const track = document.querySelector('.carousel-track');
  if (!track) return;
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let cards = [];
  let index = 0;
  let autoplay = false; // change to true to enable autoplay
  let autoplayInterval = 5000;
  let autoplayTimer = null;

  function clamp(i) { return Math.max(0, Math.min(i, cards.length - 1)); }

  function buildCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';

    const content = document.createElement('div');
    content.className = 'app-card-content';

    const header = document.createElement('div');
    header.className = 'app-header';
    const img = document.createElement('img'); img.className = 'app-logo'; img.src = app.logo; img.alt = app.name;
    const h3 = document.createElement('h3'); h3.textContent = app.name;
    header.appendChild(img); header.appendChild(h3);

    const desc = document.createElement('p'); desc.className = 'app-description'; desc.textContent = app.description;

    const ul = document.createElement('ul'); ul.className = 'features-list';
    (app.features || []).forEach(f => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });

    content.appendChild(header); content.appendChild(desc); content.appendChild(ul);

    const footer = document.createElement('div'); footer.className = 'app-card-footer';
    const details = document.createElement('a'); details.className = 'details-button'; details.href = app.detailsUrl; details.textContent = 'Ver mais';
    footer.appendChild(details);
    if (app.storeUrl) {
      const store = document.createElement('a'); store.className = 'play-store-button'; store.href = app.storeUrl; store.target = '_blank';
      const badge = document.createElement('img'); badge.src = 'https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png'; badge.alt = 'Disponível no Google Play';
      store.appendChild(badge); footer.appendChild(store);
    }

    card.appendChild(content); card.appendChild(footer);
    return card;
  }

  function renderApps(apps) {
    track.innerHTML = '';
    apps.forEach(app => track.appendChild(buildCard(app)));
    cards = Array.from(track.children);
    createDots();
    update();
  }

  function update() {
    if (!cards.length) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const cardWidth = cards[0].getBoundingClientRect().width + gap;
    const translateX = -index * cardWidth;
    track.style.transform = `translateX(${translateX}px)`;
    updateDots();
  }

  function prev() { index = clamp(index - 1); update(); }
  function next() { index = clamp(index + 1); update(); }

  prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });

  window.addEventListener('resize', () => { setTimeout(update, 80); });

  // swipe support
  let startX = 0; let isTouch = false;
  track.addEventListener('touchstart', (e) => { isTouch = true; startX = e.touches[0].clientX; });
  track.addEventListener('touchend', (e) => { if (!isTouch) return; const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 40) { index = clamp(index + (dx < 0 ? 1 : -1)); update(); } isTouch = false; resetAutoplay(); });

  // dots
  let dotsContainer = null;
  function createDots() {
    if (dotsContainer) dotsContainer.remove();
    dotsContainer = document.createElement('div'); dotsContainer.className = 'carousel-dots';
    cards.forEach((_, i) => {
      const b = document.createElement('button'); b.className = 'dot'; b.setAttribute('aria-label', `Ir para ${i+1}`);
      b.addEventListener('click', () => { index = i; update(); resetAutoplay(); });
      dotsContainer.appendChild(b);
    });
    track.parentElement.parentElement.appendChild(dotsContainer);
  }
  function updateDots() { if (!dotsContainer) return; Array.from(dotsContainer.children).forEach((b, i) => b.classList.toggle('active', i === index)); }

  // autoplay
  function startAutoplay() { if (!autoplay) return; stopAutoplay(); autoplayTimer = setInterval(() => { index = (index + 1) % cards.length; update(); }, autoplayInterval); }
  function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function resetAutoplay() { stopAutoplay(); startAutoplay(); }

  // fetch apps and init
  fetch('assets/apps.json').then(r => r.json()).then(apps => { renderApps(apps); startAutoplay(); }).catch(err => { console.error('Erro carregando apps.json', err); });

})();
