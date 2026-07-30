document.addEventListener('DOMContentLoaded', () => {
  // 1. Particle Canvas Background (shared via particles.js)
  if (typeof window.initParticleBackground === 'function') {
    window.initParticleBackground('canvas-particles', 'rgba(0, 120, 212, alpha)');
  }

  // 2. Cursor Spotlight (Tilt & Highlight)
  const cards = document.querySelectorAll('.glow-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 3. Staggered Word Reveal (Custom Hero)
  const heroWords = document.querySelectorAll('.editorial-word');
  heroWords.forEach((word, idx) => {
    setTimeout(() => {
      word.classList.add('visible');
    }, idx * 100 + 200);
  });

  // 4. Blueprint Timeline Scroll Progression & In-view Reveals
  const timelinePhases = document.querySelectorAll('.timeline-phase');
  const progressLine = document.querySelector('.timeline-progress-fill');
  
  const handleScroll = () => {
    if (timelinePhases.length === 0) return;
    
    let activeIndex = -1;
    const triggerPoint = window.innerHeight * 0.7;

    timelinePhases.forEach((phase, index) => {
      const rect = phase.getBoundingClientRect();
      if (rect.top < triggerPoint) {
        phase.classList.add('in-view');
        activeIndex = index;
      }
    });

    if (progressLine && activeIndex !== -1) {
      const totalPhases = timelinePhases.length;
      const progressPercent = ((activeIndex + 1) / totalPhases) * 100;
      progressLine.style.height = `${progressPercent}%`;
    }
  };

  window.addEventListener('scroll', handleScroll);
  setTimeout(handleScroll, 100);

  // 5. Dynamic Stats Counter Simulation
  const counterElements = document.querySelectorAll('.stat-counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseInt(target.getAttribute('data-target'), 10);
        let current = 0;
        const duration = 1200; // ms
        const steps = 25;
        const increment = Math.ceil(targetVal / steps);
        const stepTime = duration / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetVal) {
            target.textContent = targetVal + "+";
            clearInterval(timer);
          } else {
            target.textContent = current;
          }
        }, stepTime);
        
        counterObserver.unobserve(target);
      }
    });
  }, { threshold: 0.4 });

  counterElements.forEach(el => counterObserver.observe(el));
});
