/**
 * JenAI.ru — Main JavaScript
 * Scroll animations, navigation, FAQ, portfolio filter, form, counters
 */

'use strict';

/* ============================================
   NAVIGATION
   ============================================ */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

// Sticky nav on scroll
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  toggleScrollTop();
}, { passive: true });

// Mobile menu toggle
navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu on link click
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// Add logo AI class after parse
document.querySelectorAll('.nav-logo').forEach(logo => {
  const span = logo.querySelector('span');
  if (span && !span.querySelector('.nav-logo-ai')) {
    span.innerHTML = span.textContent.replace('AI', '<span class="nav-logo-ai">AI</span>');
  }
});

/* ============================================
   SCROLL-TO-TOP BUTTON
   ============================================ */
const scrollTopBtn = document.getElementById('scroll-top');

function toggleScrollTop() {
  scrollTopBtn?.classList.toggle('visible', window.scrollY > 600);
}

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================
   HERO PARTICLES
   ============================================ */
function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 12 : 25;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 8 + 8;
    const hue = Math.random() > 0.5 ? '260' : '168';

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      background: hsl(${hue}, 90%, 75%);
      border-radius: 50%;
    `;

    container.appendChild(p);
  }
}

createParticles();

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
const revealOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Text Decrypt Effect
      if (entry.target.classList.contains('decrypt-text') && !entry.target.dataset.decrypted) {
        entry.target.dataset.decrypted = "true";
        runDecryptAnimation(entry.target);
      }
    }
  });
}, revealOptions);

function runDecryptAnimation(el) {
  const textNodes = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  let n;
  while(n = walk.nextNode()) {
    if(n.nodeValue.trim() !== '') {
      textNodes.push({ node: n, original: n.nodeValue });
    }
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§±!@#$%^&*()_+~[]:;?><,./-=';
  let iter = 0;
  const maxIter = 20;
  const interval = setInterval(() => {
    textNodes.forEach(item => {
      let scrambled = '';
      for(let i=0; i<item.original.length; i++) {
        if(item.original[i] === ' ' || item.original[i] === '\n') {
          scrambled += item.original[i];
        } else {
          if (iter > maxIter * (i / item.original.length)) {
             scrambled += item.original[i];
          } else {
             scrambled += chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }
      item.node.nodeValue = scrambled;
    });
    iter++;
    if(iter >= maxIter + 5) {
      clearInterval(interval);
      textNodes.forEach(item => item.node.nodeValue = item.original);
    }
  }, 40);
}

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el, i) => {
  // Stagger based on --i CSS variable
  const stagger = getComputedStyle(el).getPropertyValue('--i');
  if (stagger) {
    el.style.transitionDelay = `${parseFloat(stagger) * 0.12}s`;
  }
  revealObserver.observe(el);
});

/* ============================================
   COUNTER ANIMATION (Hero Stats)
   ============================================ */
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out-expo
    const eased = 1 - Math.pow(2, -10 * progress);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => {
  counterObserver.observe(el);
});

/* ============================================
   PORTFOLIO FILTER
   ============================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = '';
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = '';
        });
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  });
});

/* Portfolio thumbnail style */
document.querySelectorAll('.portfolio-thumb-bg').forEach(el => {
  el.style.cssText += `
    width:100%;
    height:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:220px;
  `;
});

document.querySelectorAll('.portfolio-thumb-wrap').forEach(el => {
  el.style.cssText = `width:100%;height:100%;position:absolute;inset:0;`;
});

/* ============================================
   FAQ ACCORDION
   ============================================ */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question?.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');

    // Close all
    faqItems.forEach(other => {
      other.classList.remove('active');
      const otherAnswer = other.querySelector('.faq-answer');
      const otherQ = other.querySelector('.faq-question');
      if (otherAnswer) otherAnswer.style.maxHeight = '0';
      otherQ?.setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!isOpen) {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ============================================
   CONTACT FORM
   ============================================ */
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('form-submit-btn');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic validation
  const name = document.getElementById('form-name').value.trim();
  const phone = document.getElementById('form-phone').value.trim();

  if (!name) {
    showFieldError('form-name', 'Введите ваше имя');
    return;
  }

  if (!phone) {
    showFieldError('form-phone', 'Введите телефон или Telegram');
    return;
  }

  // Simulate send
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="btn-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Отправляем...
  `;

  // In production: replace with real API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  submitBtn.innerHTML = `
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Заявка отправлена!
  `;
  submitBtn.style.background = 'linear-gradient(135deg, #06D6A0, #0099cc)';

  // Build Telegram message link (fallback)
  const type = document.getElementById('form-type').value;
  const budget = document.getElementById('form-budget').value;
  const message = document.getElementById('form-message').value;

  const tgMsg = encodeURIComponent(
    `Новая заявка с сайта JenAI!\n\nИмя: ${name}\nТелефон: ${phone}\nТип: ${type || 'не указан'}\nБюджет: ${budget || 'не указан'}\nОписание: ${message || 'не указано'}`
  );

  // Open Telegram with pre-filled message
  setTimeout(() => {
    window.open(`https://t.me/zoomexpert`, '_blank', 'noopener');
  }, 800);

  // Reset form after 3s
  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      Отправить заявку
    `;
    submitBtn.style.background = '';
  }, 4000);
});

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.style.borderColor = 'var(--danger)';
  field.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.15)';

  const existing = field.parentElement.querySelector('.field-error');
  if (!existing) {
    const err = document.createElement('p');
    err.className = 'field-error';
    err.textContent = message;
    err.style.cssText = 'font-size:0.78rem;color:var(--danger);margin-top:6px;';
    field.parentElement.appendChild(err);
  }

  field.focus();

  field.addEventListener('input', () => {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    field.parentElement.querySelector('.field-error')?.remove();
  }, { once: true });
}

/* ============================================
   SMOOTH ANCHOR SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================
   SPINNING ICON (for loading state)
   ============================================ */
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin { animation: spin 1s linear infinite; }

  .nav-logo-ai {
    background: linear-gradient(135deg, #7C5CFC, #06D6A0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .portfolio-item {
    aspect-ratio: 16/10;
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    cursor: pointer;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .portfolio-item .portfolio-thumb-wrap {
    position: absolute;
    inset: 0;
  }

  .portfolio-item .portfolio-thumb-bg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .portfolio-item:hover .portfolio-thumb-bg {
    transform: scale(1.08);
  }

  .portfolio-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 30%, rgba(7,7,13,0.9) 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 28px;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 2;
  }

  .portfolio-item:hover .portfolio-overlay {
    opacity: 1;
  }

  .portfolio-play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.85);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(124,92,252,0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    backdrop-filter: blur(8px);
    z-index: 3;
  }

  .portfolio-item:hover .portfolio-play {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .portfolio-play svg {
    width: 24px;
    height: 24px;
    fill: #fff;
    margin-left: 4px;
  }

  .portfolio-overlay h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 4px;
    color: #fff;
  }

  .portfolio-overlay p {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.65);
  }
`;
document.head.appendChild(style);

/* ============================================
   ACTIVE NAV LINK HIGHLIGHT
   ============================================ */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--text-primary)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================
   SERVICE CARD TILT EFFECT
   ============================================ */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

console.log('%c🤖 JenAI — Сайт загружен. Сделано с ❤️ и AI.', 'color:#7C5CFC;font-size:14px;font-weight:bold;');

/* ============================================
   PRICING CALCULATOR
   ============================================ */
const calcFormatBtns = document.querySelectorAll('#calc-format .calc-chip');
const calcQualityBtns = document.querySelectorAll('#calc-quality .calc-tab');
const calcDuration = document.getElementById('calc-duration');
const calcDurationVal = document.getElementById('calc-duration-val');
const calcProgress = document.getElementById('calc-progress');
const calcTotal = document.getElementById('calc-total');
const calcDetail = document.getElementById('calc-detail');
const calcCtaBtn = document.getElementById('calc-cta-btn');

let currentBasePrice = 150;
let currentMultiplier = 1;
let currentFormatName = 'Reels / Shorts';
let currentQualityName = 'Базовая генерация';
let displayTotal = 4500;

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = progress * (2 - progress); // easeOut function
    const current = Math.floor(start + (end - start) * easeProgress);
    obj.innerHTML = current.toLocaleString('ru-RU');
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end.toLocaleString('ru-RU');
    }
  };
  window.requestAnimationFrame(step);
}

function updateCalculator() {
  if (!calcDuration || !calcTotal) return;
  const seconds = parseInt(calcDuration.value, 10);
  if(calcDurationVal) calcDurationVal.textContent = seconds;
  
  // Update progress bar width
  const min = parseInt(calcDuration.min, 10);
  const max = parseInt(calcDuration.max, 10);
  const percent = ((seconds - min) / (max - min)) * 100;
  if(calcProgress) calcProgress.style.width = `${percent}%`;

  // Discount Logic
  let discountMult = 1;
  const badge = document.getElementById('calc-discount-badge');
  const discountRow = document.getElementById('receipt-discount-row');
  
  if(seconds > 60) {
    discountMult = 0.85; // 15% discount
    if(badge) badge.classList.add('show');
    if(discountRow) discountRow.style.display = 'flex';
  } else {
    if(badge) badge.classList.remove('show');
    if(discountRow) discountRow.style.display = 'none';
  }

  // Calculate total
  const pricePerSec = currentBasePrice * currentMultiplier;
  const total = Math.round(seconds * pricePerSec * discountMult);
  
  // Animate number with odometer effect
  animateValue(calcTotal, displayTotal, total, 400); 
  displayTotal = total;
  
  if(calcDetail) calcDetail.textContent = `~ ${Math.round(pricePerSec * discountMult).toLocaleString('ru-RU')} ₽ / сек`;

  // Update Receipt Detail
  const rFormat = document.getElementById('receipt-format');
  const rMult = document.getElementById('receipt-mult');
  if(rFormat) rFormat.textContent = currentFormatName;
  if(rMult) rMult.textContent = currentQualityName;

  // Update CTA link to pre-fill budget if possible
  if (calcCtaBtn) {
    calcCtaBtn.href = `#contact`;
    
    // Attach to click to fill the contact form automatically
    calcCtaBtn.onclick = () => {
      const formType = document.getElementById('form-type');
      const formBudget = document.getElementById('form-budget');
      const formMessage = document.getElementById('form-message');
      
      if(formType) formType.value = currentFormatName;
      if(formBudget) formBudget.value = `${total.toLocaleString('ru-RU')} ₽`;
      if(formMessage && !formMessage.value.includes('Хронометраж:')) {
         formMessage.value = `Прошу рассчитать смету для формата "${currentFormatName}".\nХронометраж: ${seconds} сек.`;
      }
    };
  }
}

if (calcFormatBtns.length > 0 && calcDuration) {
  calcFormatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcFormatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBasePrice = parseInt(btn.dataset.base, 10);
      currentFormatName = btn.textContent; // Using textContent to get Emoji + Name
      updateCalculator();
    });
  });

  calcQualityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcQualityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMultiplier = parseFloat(btn.dataset.mult);
      currentQualityName = btn.textContent; // Emoji + text
      updateCalculator();
    });
  });

  calcDuration.addEventListener('input', updateCalculator);
  // Initial call
  updateCalculator();
}

/* ============================================
   SOCIAL PROOF POPUP
   ============================================ */
const spPopup = document.getElementById('social-proof-popup');
const spName = document.getElementById('sp-name');
const spAction = document.getElementById('sp-action');
const spTime = document.getElementById('sp-time');

const spNames = ['Александр, г. Москва', 'Екатерина, г. СПб', 'ООО "Вектор"', 'Михаил, г. Казань', 'ИП Смирнов', 'Анна, г. Сочи'];
const spActions = ['Только что заказали AI-рекламу', 'Забронировали съемку Reels', 'Запросили КП на видео', 'Оплатили базовый монтаж', 'Заказали YouTube-ролик'];
const spTimes = ['Только что', '1 минуту назад', '2 минуты назад', '5 минут назад'];

function showRandomSocialProof() {
  if (!spPopup) return;
  
  // Randomize data
  if (spName) spName.textContent = spNames[Math.floor(Math.random() * spNames.length)];
  if (spAction) spAction.textContent = spActions[Math.floor(Math.random() * spActions.length)];
  if (spTime) spTime.textContent = spTimes[Math.floor(Math.random() * spTimes.length)];

  // Show
  spPopup.classList.add('show');
  spPopup.setAttribute('aria-hidden', 'false');

  // Hide after 5 seconds
  setTimeout(() => {
    spPopup.classList.remove('show');
    spPopup.setAttribute('aria-hidden', 'true');
  }, 5000);
}

// Start showing popups randomly every ~15-25 seconds
if (spPopup) {
  // Wait 10 seconds before first popup
  setTimeout(() => {
    showRandomSocialProof();
    setInterval(() => {
      showRandomSocialProof();
    }, Math.random() * 10000 + 15000);
  }, 10000);
}

/* ============================================
   STICKY MOBILE CTA
   ============================================ */
const mobileCta = document.getElementById('mobile-sticky-cta');

window.addEventListener('scroll', () => {
  if (!mobileCta) return;
  // Show after scrolling past hero section
  if (window.scrollY > window.innerHeight * 0.8) {
    mobileCta.classList.add('visible');
  } else {
    mobileCta.classList.remove('visible');
  }
}, { passive: true });

/* ============================================
   MODALS & QUIZ LOGIC
   ============================================ */
const quizModal = document.getElementById('quiz-modal');
const exitModal = document.getElementById('exit-modal');
const quizClose = document.getElementById('quiz-close');
const exitClose = document.getElementById('exit-close');
const openQuizBtns = document.querySelectorAll('.open-quiz-btn');

// Open Quiz Modal
openQuizBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    quizModal.classList.add('open');
    quizModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // block scroll
  });
});

// Close logic
function closeModals() {
  if(quizModal) {
    quizModal.classList.remove('open');
    quizModal.setAttribute('aria-hidden', 'true');
  }
  if(exitModal) {
    exitModal.classList.remove('open');
    exitModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = ''; 
}

if(quizClose) quizClose.addEventListener('click', closeModals);
if(exitClose) exitClose.addEventListener('click', closeModals);

// Click outside to close
window.addEventListener('click', (e) => {
  if (e.target === quizModal || e.target === exitModal) {
    closeModals();
  }
});

// Quiz Multi-step logic
const nextBtns = document.querySelectorAll('.btn-next');
const prevBtns = document.querySelectorAll('.btn-prev');
const quizSteps = document.querySelectorAll('.quiz-step');
const quizProgress = document.getElementById('quiz-progress');
const quizRadios = document.querySelectorAll('.quiz-option input[type="radio"]');

const totalSteps = 3;

// Enable Next button if option is selected
quizRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const parentStep = e.target.closest('.quiz-step');
    const nextBtn = parentStep.querySelector('.btn-next');
    if(nextBtn) nextBtn.disabled = false;
  });
});

function goToStep(stepNum) {
  quizSteps.forEach(s => s.classList.remove('active'));
  const target = document.getElementById('quiz-step-' + stepNum);
  if(target) target.classList.add('active');
  
  if (stepNum <= totalSteps) {
    if(quizProgress) quizProgress.style.width = `${(stepNum / totalSteps) * 100}%`;
  } else {
    // Success step
    if(quizProgress) quizProgress.style.width = '100%';
  }
}

nextBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    goToStep(parseInt(btn.dataset.next));
  });
});

prevBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    goToStep(parseInt(btn.dataset.prev));
  });
});

// Quiz Submit
const quizSubmit = document.getElementById('quiz-submit');
if (quizSubmit) {
  quizSubmit.addEventListener('click', () => {
    const contactInput = document.getElementById('quiz-contact');
    if (!contactInput.value) {
      contactInput.style.borderColor = 'red';
      return;
    }
    contactInput.style.borderColor = '';
    
    // Harvest answers
    const purpose = document.querySelector('input[name="q_purpose"]:checked')?.value || 'Не указано';
    const duration = document.querySelector('input[name="q_duration"]:checked')?.value || 'Не указано';
    const contact = contactInput.value;
    
    // Simulate sending logic
    console.log(`QUIZ SUBMIT: Purpose: ${purpose}, Duration: ${duration}, Contact: ${contact}`);
    // Instead of real fetch, we show success step for demo
    goToStep('success');
    
    setTimeout(() => {
      closeModals();
      goToStep(1); // reset after closing
      if(quizProgress) quizProgress.style.width = '33.33%';
      contactInput.value = '';
    }, 4000); 
  });
}

// Exit Intent (Lead Magnet) Logic
let exitPopupShown = false;
const exitSubmit = document.getElementById('exit-submit');

document.addEventListener('mouseleave', (e) => {
  // If moving out towards the top tabs
  if (e.clientY < 5 && !exitPopupShown && exitModal) {
    exitPopupShown = true;
    exitModal.classList.add('open');
    exitModal.setAttribute('aria-hidden', 'false');
  }
});

if (exitSubmit) {
  exitSubmit.addEventListener('click', () => {
    const contactInput = document.getElementById('exit-contact');
    if (!contactInput.value) return;
    
    // Simulate send
    console.log(`LEAD MAGNET SUBMIT: Contact: ${contactInput.value}`);
    exitSubmit.innerHTML = 'Отправлено! ✨';
    exitSubmit.disabled = true;
    
    setTimeout(() => {
      closeModals();
    }, 2000);
  });
}

// ============================================
// AWWWARDS PREMIUM FEATURES (Phase 5)
// ============================================

// 1. Scroll Progress Bar
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = scrollPercent + '%';
});

// 2. Custom Magnetic Cursor
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const cursorText = document.getElementById('cursor-text');

if (cursorDot && cursorRing) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Убираем курсор, когда мышь уходит за пределы окна
  document.addEventListener('mouseleave', () => {
    document.body.classList.add('cursor-hidden');
  });
  document.addEventListener('mouseenter', () => {
    document.body.classList.remove('cursor-hidden');
  });

  // Animation loop for smooth trailing
  function renderCursor() {
    // Dot follows closely
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;
    // Ring follows with lag
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Add hover classes for interactive elements
  const hoverElements = document.querySelectorAll('a, button, .calc-tab, .calc-chip');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // Hide custom cursor on select
  const selectElements = document.querySelectorAll('select');
  selectElements.forEach(select => {
    select.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hidden');
    });
    select.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hidden');
    });
  });

  // Portfolio special hover - removed huge circle
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      if (cursorText) cursorText.textContent = '';
    });
    item.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}

// 3. Portfolio Hover Videos Autoplay
const portfolioVids = document.querySelectorAll('.portfolio-hover-vid');
portfolioVids.forEach(vid => {
  const item = vid.closest('.portfolio-item');
  if (item) {
    item.addEventListener('mouseenter', () => {
      vid.play().catch(e => console.log('Autoplay blocked', e));
    });
    item.addEventListener('mouseleave', () => {
      vid.pause();
      vid.currentTime = 0;
    });
  }
});

// Video Modal Logic
const videoModal = document.getElementById('video-modal');
const modalVideoPlayer = document.getElementById('modal-video-player');
const videoCloseBtn = document.getElementById('video-close');
const allPortfolioItems = document.querySelectorAll('.portfolio-item');

if (videoModal && modalVideoPlayer) {
  allPortfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const vid = item.querySelector('.portfolio-hover-vid');
      if (vid && vid.src) {
        modalVideoPlayer.src = vid.src;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalVideoPlayer.play().catch(e => console.log('Playback blocked', e));
      }
    });
  });

  videoCloseBtn.addEventListener('click', closeVideoModal);
  videoModal.addEventListener('click', (e) => {
    if(e.target === videoModal) {
      closeVideoModal();
    }
  });

  function closeVideoModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    modalVideoPlayer.pause();
    modalVideoPlayer.src = '';
  }
}


// 4. 3D Tilt Effect for Service Cards
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation between -10 and 10 degrees
    const xPct = (x / rect.width - 0.5) * 20;   // rotateX goes inverse to Y
    const yPct = (y / rect.height - 0.5) * -20; // rotateY goes inverse to X
    
    card.style.setProperty('--rotateX', `${yPct}deg`);
    card.style.setProperty('--rotateY', `${xPct}deg`);
    
    // For Glow Spotlight
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rotateX', '0deg');
    card.style.setProperty('--rotateY', '0deg');
  });
});

// 5. App-like Smooth UI Sounds
const soundHover = document.getElementById('sound-hover');
if (soundHover) soundHover.volume = 0.03;

const soundElementsHover = document.querySelectorAll('button, .btn, .calc-tab, .portfolio-item');
soundElementsHover.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if(soundHover) {
      soundHover.currentTime = 0;
      soundHover.play().catch(()=>{});
    }
  });
});

// 6. Lenis Smooth Scroll Initialization
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function lenisRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  }
  requestAnimationFrame(lenisRaf);
}
