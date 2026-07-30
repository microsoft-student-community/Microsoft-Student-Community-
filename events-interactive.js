document.addEventListener('DOMContentLoaded', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. PARTICLE CANVAS BACKGROUND (shared via particles.js)
  // ──────────────────────────────────────────────────────────────────────────
  if (typeof window.initParticleBackground === 'function') {
    window.initParticleBackground('canvas-particles', 'rgba(0, 120, 212, alpha)');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. CURSOR SPOTLIGHT FOR GLOW CARDS
  // ──────────────────────────────────────────────────────────────────────────
  const cards = document.querySelectorAll('.glow-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CASSETTE EXPANSION — Click-to-expand drawers
  // ──────────────────────────────────────────────────────────────────────────
  const eventCards = document.querySelectorAll('.event-cassette');

  eventCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Block expansion if clicking inside the drawer or on any link
      if (e.target.closest('.event-summary-drawer') || e.target.closest('a')) {
        return;
      }

      const wasExpanded = card.classList.contains('expanded');

      // Close all other cards first
      eventCards.forEach(other => {
        if (other !== card && other.classList.contains('expanded')) {
          other.classList.remove('expanded');
          const otherDrawer = other.querySelector('.event-summary-drawer');
          if (otherDrawer) otherDrawer.style.maxHeight = null;
        }
      });

      // Toggle current card
      card.classList.toggle('expanded');
      const drawer = card.querySelector('.event-summary-drawer');
      if (drawer) {
        if (!wasExpanded) {
          // Expanding — compute full height
          drawer.style.maxHeight = drawer.scrollHeight + 40 + 'px';
        } else {
          // Collapsing
          drawer.style.maxHeight = null;
        }
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CATEGORY FILTERING — Smooth fade in/out with filter pills
  // ──────────────────────────────────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevent event bubbling (in case filter bar is inside a card somehow)
      e.stopPropagation();

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      eventCards.forEach(card => {
        const category = card.getAttribute('data-category');

        // Close any expanded drawers during filter
        card.classList.remove('expanded');
        const drawer = card.querySelector('.event-summary-drawer');
        if (drawer) drawer.style.maxHeight = null;

        const shouldShow = (filterVal === 'all' || category === filterVal);

        if (shouldShow) {
          // Show
          card.classList.remove('filtered-out');
          card.style.display = '';
          // Force reflow for clean transition
          void card.offsetWidth;
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        } else {
          // Hide with fade
          card.classList.add('filtered-out');
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px) scale(0.97)';
          setTimeout(() => {
            if (card.classList.contains('filtered-out')) {
              card.style.display = 'none';
            }
          }, 380);
        }
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. STAGGERED REVEAL ANIMATION — Cassettes fade in on page load
  // ──────────────────────────────────────────────────────────────────────────
  eventCards.forEach((card, idx) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';
    card.style.transition = 'opacity 0.55s ease, transform 0.55s var(--ease), border-color 0.3s ease, box-shadow 0.3s ease';
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, idx * 90 + 200);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. FEATURED HERO BANNER — Smooth entrance
  // ──────────────────────────────────────────────────────────────────────────
  const hero = document.querySelector('.featured-event-hero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    hero.style.transition = 'opacity 0.7s ease, transform 0.7s var(--ease)';
    setTimeout(() => {
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    }, 120);
  }
});
