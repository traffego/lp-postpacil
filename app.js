/* =====================================================================
   Post Fácil I.A. — JS
   Navbar · FAQ · Smooth scroll · Plan selection · CTA form redirect
   ===================================================================== */

(function () {
  'use strict';

  const CHECKOUT = 'https://olive-locust-173119.hostingersite.com/license-server-wp-post/checkout.php';

  /* ── Hero Background Crossfade ──────────────────────────────── */
  (function initHeroBg() {
    const slides = document.querySelectorAll('.hero-bg-slide');
    if (slides.length < 2) return;
    let index = 0;
    setInterval(() => {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    }, 5000);
  })();

  /* ── Navbar scroll ───────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── FAQ accordion ───────────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen   = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = document.getElementById(answerId);

      document.querySelectorAll('.faq-question').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        const a = document.getElementById(b.getAttribute('aria-controls'));
        if (a) a.hidden = true;
      });

      if (!isOpen && answer) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  /* ── Smooth scroll em âncoras ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 72,
        behavior: 'smooth',
      });
    });
  });

  /* ── Seleção de plano ────────────────────────────────────────── */
  const planInput   = document.getElementById('selected-plan-id');
  const planCards   = document.querySelectorAll('.plan-card');
  const planTitle   = document.getElementById('cta-plan-title');
  const planList    = document.getElementById('cta-plan-includes');

  const PLAN_DETAILS = {
    '1': {
      title: 'Plano Mensal Starter.<br>30 dias de acesso.',
      includes: [
        '✓ Acesso a todos os provedores de texto e imagem',
        '✓ Uso em 1 site WordPress',
        '✓ Atualizações incluídas no período',
        '✓ Garantia incondicional de 7 dias'
      ]
    },
    '2': {
      title: 'Plano Trimestral Pro.<br>90 dias de acesso.',
      includes: [
        '✓ Economia de 13% em relação ao plano mensal',
        '✓ Acesso a todos os provedores de texto e imagem',
        '✓ Uso em 1 site WordPress',
        '✓ Atualizações incluídas no período',
        '✓ Garantia incondicional de 7 dias'
      ]
    },
    '3': {
      title: 'Plano Anual Agência.<br>365 dias de acesso.',
      includes: [
        '✓ Maior economia (~R$ 33,25 por mês)',
        '✓ Acesso a todos os provedores de texto e imagem',
        '✓ Uso em 1 site WordPress',
        '✓ Atualizações incluídas no período',
        '✓ Garantia incondicional de 7 dias'
      ]
    }
  };

  function updatePlanDisplay(planId) {
    const data = PLAN_DETAILS[planId];
    if (!data) return;

    if (planTitle) {
      planTitle.innerHTML = data.title;
    }
    if (planList) {
      planList.innerHTML = data.includes.map(item => `<li>${item}</li>`).join('');
    }
  }

  planCards.forEach((card) => {
    card.addEventListener('click', () => {
      // Remover seleção anterior
      planCards.forEach((c) => {
        c.classList.remove('plan-card--selected');
        c.setAttribute('aria-pressed', 'false');
      });

      // Selecionar o clicado
      card.classList.add('plan-card--selected');
      card.setAttribute('aria-pressed', 'true');

      const planId = card.dataset.planId;

      // Atualizar o hidden input
      if (planInput) planInput.value = planId;

      // Atualizar texto e vantagens à esquerda
      updatePlanDisplay(planId);
    });
  });

  /* ── CTA Form — valida e redireciona para checkout ───────────── */
  const form   = document.getElementById('cta-form');
  const errBox = document.getElementById('cta-form-error');
  const submit = document.getElementById('cta-submit-btn');

  function showError(msg) {
    if (!errBox) return;
    errBox.textContent = msg;
    errBox.hidden = false;
  }
  function clearError() {
    if (!errBox) return;
    errBox.hidden = true;
    errBox.textContent = '';
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();

      const name  = form.querySelector('#f-name');
      const email = form.querySelector('#f-email');
      const cpf   = form.querySelector('#f-cpf');
      const phone = form.querySelector('#f-phone');

      if (!name.value.trim() || name.value.trim().split(' ').length < 2) {
        name.setAttribute('aria-invalid', 'true');
        name.focus();
        showError('Informe seu nome completo (nome e sobrenome).');
        return;
      }
      name.removeAttribute('aria-invalid');

      if (!email.validity.valid || !email.value.trim()) {
        email.setAttribute('aria-invalid', 'true');
        email.focus();
        showError('Informe um e-mail válido.');
        return;
      }
      email.removeAttribute('aria-invalid');

      const cpfClean = cpf.value.replace(/\D/g, '');
      if (cpfClean.length < 11) {
        cpf.setAttribute('aria-invalid', 'true');
        cpf.focus();
        showError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
        return;
      }
      cpf.removeAttribute('aria-invalid');

      submit.disabled = true;
      submit.textContent = 'Redirecionando…';

      const params = new URLSearchParams({
        name:    name.value.trim(),
        email:   email.value.trim(),
        cpfCnpj: cpfClean,
        phone:   phone.value.replace(/\D/g, ''),
        plan_id: planInput ? planInput.value : '1',
      });

      window.open(CHECKOUT + '?' + params.toString(), '_blank', 'noopener');

      setTimeout(() => {
        submit.disabled = false;
        submit.textContent = 'Ir para o checkout';
      }, 1500);
    });

    // Limpar erro ao corrigir campo
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        clearError();
      });
    });
  }

  /* ── Compare items — stagger ao entrar no viewport ──────────── */
  const compareItems = document.querySelectorAll('.compare-item');
  if (compareItems.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const items = entry.target.querySelectorAll('.compare-item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 80);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.compare-card').forEach((card) => {
      observer.observe(card);
    });
  } else {
    // fallback sem observer
    compareItems.forEach((item) => item.classList.add('visible'));
  }

  /* ── Metabox + Editor animation (sincronizados com texto real) ── */
  (function initMetabox() {
    // Metabox
    const mbTopic   = document.getElementById('mb-topic');
    const mbOutput  = document.getElementById('mb-output');
    const mbLines   = document.getElementById('mb-lines');
    const mbBtnText = document.getElementById('mb-btn-text');
    const mbBtnImg  = document.getElementById('mb-btn-img');
    const mbImgPrev = document.getElementById('mb-img-preview');
    const mbImgInner= document.getElementById('mb-img-inner');
    // Editor
    const edTitlePh = document.getElementById('ed-title-ph');
    const edTitle   = document.getElementById('ed-title');
    const edFeat    = document.getElementById('ed-featured');
    const edFeatIn  = document.getElementById('ed-featured-inner');
    const edStatus  = document.getElementById('ed-status');
    const edBlocks  = {
      intro: document.getElementById('ed-block-intro'),
      sec1:  document.getElementById('ed-block-sec1'),
      sec2:  document.getElementById('ed-block-sec2'),
    };

    if (!mbTopic || !edTitle) return;

    const TITLE  = 'Como a IA está mudando o jornalismo em 2025';
    const MB_WIDTHS = ['full','full','partial-80','full','partial-60','full','partial-45'];

    const CONTENT = [
      {
        h2: 'Introdução',
        p: 'A inteligência artificial está redefinindo a rotina de jornalistas e criadores de conteúdo. Ferramentas modernas permitem gerar artigos completos em minutos, sem abrir uma nova aba.'
      },
      {
        h2: 'Como funciona na prática',
        p: 'O repórter insere o tema no painel do WordPress. O modelo escolhido — GPT-4o, Gemini ou Claude — redige introdução, desenvolvimento e conclusão com H2 e H3 já formatados.'
      },
      {
        h2: 'Resultados e impacto',
        p: 'Redações que adotaram a geração assistida por IA publicam até 4× mais conteúdo por semana, mantendo qualidade editorial e consistência de SEO.'
      }
    ];

    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function typeInto(el, text, speed = 35) {
      el.textContent = '';
      for (const ch of text) { el.textContent += ch; await delay(speed); }
    }

    async function typeBlock(h2El, pEl, data) {
      h2El.textContent = '';
      for (const ch of data.h2) { h2El.textContent += ch; await delay(25); }
      pEl.textContent = '';
      const words = data.p.split(' ');
      for (const word of words) {
        pEl.textContent += (pEl.textContent ? ' ' : '') + word;
        await delay(18);
      }
    }

    function buildMbLines() {
      mbLines.innerHTML = '';
      MB_WIDTHS.forEach(w => {
        const d = document.createElement('div');
        d.className = 'mb-line';
        mbLines.appendChild(d);
      });
    }

    async function animateMbLines() {
      mbOutput.classList.add('visible');
      const els = [...mbLines.querySelectorAll('.mb-line')];
      for (const [i, el] of els.entries()) {
        await delay(90 + i * 60);
        el.classList.add(MB_WIDTHS[i]);
      }
    }

    async function loop() {
      // ① Digitar tema no metabox → título aparece no editor
      await delay(500);
      edStatus.textContent = 'Digitando assunto…';
      await typeInto(mbTopic, TITLE, 30);
      await delay(200);
      edTitlePh.classList.add('hidden');
      await typeInto(edTitle, TITLE, 20);
      edStatus.textContent = 'Aguardando geração…';
      await delay(500);

      // ② Clicar Gerar Texto
      mbBtnText.classList.add('mb-btn--active');
      mbBtnText.textContent = 'Gerando texto…';
      edStatus.textContent = 'Gerando com GPT-4o…';
      await delay(350);
      mbBtnText.classList.remove('mb-btn--active');

      // ③ Editor preenche blocos com texto real + metabox mostra linhas em paralelo
      buildMbLines();
      const mbAnim = animateMbLines();

      const keys = ['intro', 'sec1', 'sec2'];
      for (const [i, key] of keys.entries()) {
        const block = edBlocks[key];
        if (!block) continue;
        block.style.display = 'block';
        const h2El = document.getElementById('ed-h2-' + key);
        const pEl  = document.getElementById('ed-p-' + key);
        if (h2El && pEl) {
          await typeBlock(h2El, pEl, CONTENT[i]);
        }
        await delay(120);
      }

      await mbAnim;
      edStatus.textContent = 'Texto inserido no editor ✓';
      await delay(600);

      // ④ Botão Gerar Capa aparece
      mbBtnImg.style.display = 'block';
      await delay(600);

      // ⑤ Clicar Gerar Capa
      mbBtnImg.classList.add('mb-btn--active');
      mbBtnImg.textContent = 'Gerando capa…';
      edStatus.textContent = 'Gerando imagem com DALL·E…';
      await delay(350);
      mbBtnImg.classList.remove('mb-btn--active');
      await delay(600);

      // ⑥ Imagem real aparece nos dois lados
      mbImgPrev.style.display = 'block';
      edFeat.style.display = 'block';
      await delay(300);
      mbImgInner.classList.add('loaded');
      edFeatIn.classList.add('loaded');
      edStatus.textContent = '✓ Imagem salva · pronto para publicar';
    }

    loop();
  })();

})();

