const { chromium } = require('playwright');

const BASE = 'file:///C:/Users/ricar/Meus%20Arquivos/Projetos/carelink/index.html';
const ALL  = ['homeScreen','requestScreen','searchingScreen','foundScreen','ratingScreen','historyScreen'];

async function showOnly(page, target) {
  await page.evaluate(({ screens, target }) => {
    screens.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = s === target ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const map = { homeScreen: 'navHome', requestScreen: 'navRequest', historyScreen: 'navHistory' };
    const navId = map[target];
    if (navId) document.getElementById(navId)?.classList.add('active');
    document.getElementById('mainContent').scrollTop = 0;
  }, { screens: ALL, target });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Desativa animações CSS para screenshots consistentes
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
    }
  ` });

  // 0 — Login
  await page.evaluate(() => {
    document.getElementById('loginScreen').style.display = 'flex';
  });
  await page.screenshot({ path: 'telas/tela-login.png' });
  console.log('✓ tela-login.png');

  // helper: show register at a given step
  async function showRegStep(step) {
    await page.evaluate((s) => {
      document.getElementById('loginScreen').style.display = 'none';
      const reg = document.getElementById('registerScreen');
      reg.style.display = 'flex';
      reg.style.flexDirection = 'column';
      [1,2,3].forEach(n => {
        document.getElementById('regStep' + n).style.display = n === s ? 'block' : 'none';
      });
      document.getElementById('regProgressBar').style.width = (s / 3 * 100) + '%';
      document.getElementById('regStepLabel').textContent = s + ' de 3';
      document.getElementById('regNextBtn').innerHTML =
        s === 3 ? 'Criar conta <i class="bi bi-check-lg ms-1"></i>'
                : 'Continuar <i class="bi bi-arrow-right ms-1"></i>';
    }, step);
  }

  // 0b — Cadastro etapa 1
  await showRegStep(1);
  await page.screenshot({ path: 'telas/tela-cadastro-1.png' });
  console.log('✓ tela-cadastro-1.png');

  // 0c — Cadastro etapa 2 (senha preenchida + requisitos marcados)
  await showRegStep(2);
  await page.evaluate(() => {
    const pwd = document.getElementById('regPassword');
    pwd.value = 'Senha@123';
    // Trigger strength display manually
    document.getElementById('passwordStrength').style.display = 'block';
    document.getElementById('strengthFill').style.cssText = 'width:80%;background:#22C55E;';
    document.getElementById('strengthLabel').textContent = 'Forte';
    document.getElementById('strengthLabel').style.color = '#22C55E';
    document.getElementById('req-len').classList.add('ok');
    document.getElementById('req-upper').classList.add('ok');
    document.getElementById('req-num').classList.add('ok');
    document.getElementById('regPasswordConfirm').value = 'Senha@123';
  });
  await page.screenshot({ path: 'telas/tela-cadastro-2.png' });
  console.log('✓ tela-cadastro-2.png');

  // 0d — Cadastro etapa 3 (CPF + tipo + termos)
  await showRegStep(3);
  await page.evaluate(() => {
    document.getElementById('regCpf').value = '123.456.789-00';
    document.getElementById('regTerms').checked = true;
    // Select "Paciente" type
    document.querySelectorAll('.register-type-option').forEach((el, i) => {
      el.classList.toggle('selected', i === 0);
    });
  });
  await page.screenshot({ path: 'telas/tela-cadastro-3.png' });
  console.log('✓ tela-cadastro-3.png');

  // Alias: tela-cadastro.png aponta para etapa 1
  await showRegStep(1);
  await page.screenshot({ path: 'telas/tela-cadastro.png' });

  // Oculta cadastro para capturar as demais telas
  await page.evaluate(() => {
    document.getElementById('registerScreen').style.display = 'none';
  });

  // 0e — Dependentes (lista vazia)
  await page.evaluate(() => {
    localStorage.removeItem('carelink_dependents');
    const el = document.getElementById('dependentsScreen');
    el.style.display = 'flex';
    document.getElementById('depEmptyState').style.display = 'flex';
    document.getElementById('depList').style.display = 'none';
    document.getElementById('depFab').style.display = 'none';
  });
  await page.screenshot({ path: 'telas/tela-dependentes-vazio.png' });
  console.log('✓ tela-dependentes-vazio.png');

  // 0f — Dependentes (com itens)
  await page.evaluate(() => {
    const deps = [
      { name: 'João Oliveira',  relation: 'Pai',      birth: '1948-03-15', cpf: '', notes: 'Hipertenso, diabético' },
      { name: 'Ana Oliveira',   relation: 'Mãe',      birth: '1952-07-22', cpf: '', notes: '' },
      { name: 'Pedro Oliveira', relation: 'Filho(a)', birth: '2010-11-05', cpf: '', notes: 'Alergia a penicilina' }
    ];
    localStorage.setItem('carelink_dependents', JSON.stringify(deps));

    function calcAge(b) {
      if (!b) return null;
      return Math.floor((Date.now() - new Date(b).getTime()) / (365.25*24*3600*1000));
    }
    function ini(n) { return n.trim().split(' ').slice(0,2).map(w=>w[0].toUpperCase()).join(''); }

    const html = deps.map((d, i) => {
      const age = calcAge(d.birth);
      const meta = [d.relation, age ? age+' anos' : null].filter(Boolean).join(' · ');
      return `<div class="dep-card">
        <div class="dep-avatar">${ini(d.name)}</div>
        <div class="dep-info">
          <div class="dep-name">${d.name}</div>
          <div class="dep-meta">${meta}</div>
          ${d.notes ? `<div class="dep-meta" style="margin-top:3px;font-style:italic;">${d.notes}</div>` : ''}
        </div>
        <div class="dep-actions">
          <button class="dep-action-btn"><i class="bi bi-pencil-fill"></i></button>
          <button class="dep-action-btn delete"><i class="bi bi-trash-fill"></i></button>
        </div>
      </div>`;
    }).join('');

    document.getElementById('depEmptyState').style.display = 'none';
    document.getElementById('depList').innerHTML = html;
    document.getElementById('depList').style.display = 'flex';
    document.getElementById('depFab').style.display = 'flex';
  });
  await page.screenshot({ path: 'telas/tela-dependentes.png' });
  console.log('✓ tela-dependentes.png');

  // 0g — Formulário adicionar dependente
  await page.evaluate(() => {
    document.getElementById('depFormTitle').textContent = 'Novo dependente';
    document.getElementById('depEditId').value = '';
    document.getElementById('depName').value = '';
    document.getElementById('depBirth').value = '';
    document.getElementById('depCpf').value = '';
    document.getElementById('depNotes').value = '';
    document.querySelectorAll('.dep-rel-chip').forEach((c,i) => c.classList.toggle('selected', i===0));
    document.getElementById('depFormOverlay').style.display = 'flex';
  });
  await page.screenshot({ path: 'telas/tela-dependentes-form.png' });
  console.log('✓ tela-dependentes-form.png');

  // Oculta dependentes
  await page.evaluate(() => {
    document.getElementById('dependentsScreen').style.display = 'none';
    document.getElementById('depFormOverlay').style.display = 'none';
  });

  // 1 — Home
  await showOnly(page, 'homeScreen');
  await page.screenshot({ path: 'telas/tela-home.png' });
  await page.screenshot({ path: 'telas/principal.png' });
  console.log('✓ tela-home.png + principal.png');

  // 2 — Formulário de solicitação (com dependentes)
  await showOnly(page, 'requestScreen');
  await page.evaluate(() => {
    const deps = [
      { name: 'João Oliveira',  relation: 'Pai',      birth: '1948-03-15' },
      { name: 'Ana Oliveira',   relation: 'Mãe',      birth: '1952-07-22' },
      { name: 'Pedro Oliveira', relation: 'Filho(a)', birth: '2010-11-05' }
    ];
    localStorage.setItem('carelink_dependents', JSON.stringify(deps));

    function calcAge(b) {
      return Math.floor((Date.now() - new Date(b).getTime()) / (365.25*24*3600*1000));
    }
    const sel = document.getElementById('patientSelect');
    sel.querySelectorAll('option:not([value="self"])').forEach(o => o.remove());
    deps.forEach((d, i) => {
      const age = calcAge(d.birth);
      const opt = document.createElement('option');
      opt.value = 'dep_' + i;
      opt.textContent = d.name + ' (' + d.relation + ', ' + age + ' anos)';
      sel.appendChild(opt);
    });
    sel.value = 'dep_0';
  });
  await page.screenshot({ path: 'telas/tela-solicitacao.png' });
  console.log('✓ tela-solicitacao.png');

  // 3 — Buscando profissional
  await showOnly(page, 'searchingScreen');
  await page.screenshot({ path: 'telas/tela-buscando.png' });
  console.log('✓ tela-buscando.png');

  // 4 — Profissional encontrado
  await page.evaluate(() => {
    document.getElementById('trackingProfPin').textContent = 'CE';
    document.getElementById('etaValue').textContent = '12';
    document.getElementById('acceptedProfessional').innerHTML = `
      <div class="professional-header">
        <div class="professional-avatar">CE</div>
        <div class="professional-info">
          <div class="professional-name">Carlos Eduardo</div>
          <div class="professional-category">Técnico de Enfermagem</div>
          <div class="professional-rating">
            <i class="bi bi-star-fill"></i> 4.9
            <span style="color:var(--text-light);font-weight:400;">(238 avaliações)</span>
          </div>
        </div>
      </div>
      <div class="professional-details">
        <div class="detail-chip"><i class="bi bi-geo-alt"></i>1,2 km</div>
        <div class="detail-chip"><i class="bi bi-cash"></i>R$25/h</div>
        <div class="detail-chip"><i class="bi bi-check-circle"></i>Verificado</div>
        <div class="detail-chip"><i class="bi bi-shield-check"></i>COREN 123456-SP</div>
      </div>
      <div style="font-size:0.78rem;color:var(--text-medium);">
        <strong>Especialidades:</strong> Curativos · Medicação · Plantão
      </div>
    `;
  });
  await showOnly(page, 'foundScreen');
  await page.screenshot({ path: 'telas/tela-encontrado.png' });
  console.log('✓ tela-encontrado.png');

  // 5 — Avaliação
  await page.evaluate(() => {
    document.getElementById('ratingProfName').textContent = 'Carlos Eduardo';
    document.getElementById('ratingAvatar').textContent = 'CE';
    document.querySelectorAll('.star').forEach(s => s.classList.add('active'));
    document.getElementById('ratingHint').textContent = 'Excelente!';
    document.getElementById('ratingTags').style.display = 'flex';
    document.getElementById('submitRatingBtn').disabled = false;
    document.querySelectorAll('.rating-tag')[0].classList.add('selected');
    document.querySelectorAll('.rating-tag')[2].classList.add('selected');
  });
  await showOnly(page, 'ratingScreen');
  await page.screenshot({ path: 'telas/tela-avaliacao.png' });
  console.log('✓ tela-avaliacao.png');

  // 6 — Histórico (com solicitações preenchidas)
  await showOnly(page, 'historyScreen');
  await page.evaluate(() => {
    const items = [
      { icon:'💉', bg:'#E0F2FE', service:'Téc. Enfermagem — Plantão 4h',    date:'28/05/2026', patient:'João Oliveira (Pai)',    prof:'Carlos Eduardo',  stars:5, price:'R$ 100,00', status:'Concluído',   statusColor:'#D1FAE5', statusText:'#065F46' },
      { icon:'🤲', bg:'#FEF3C7', service:'Cuidador — Acomp. Hospitalar',    date:'20/05/2026', patient:'Ana Oliveira (Mãe)',     prof:'Juliana Costa',   stars:4, price:'R$ 176,00', status:'Concluído',   statusColor:'#D1FAE5', statusText:'#065F46' },
      { icon:'🩺', bg:'#F0FDF4', service:'Enfermeira — Curativos Complexos', date:'12/05/2026', patient:'Eu mesmo(a)',            prof:'Dra. Amanda Reis', stars:5, price:'R$ 120,00', status:'Concluído',   statusColor:'#D1FAE5', statusText:'#065F46' },
      { icon:'🦴', bg:'#F5F3FF', service:'Fisioterapia — Reabilitação',      date:'05/05/2026', patient:'Pedro Oliveira (Filho)', prof:'Dr. Lucas Mendes', stars:5, price:'R$ 200,00', status:'Concluído',   statusColor:'#D1FAE5', statusText:'#065F46' },
      { icon:'💊', bg:'#FEE2E2', service:'Téc. Enfermagem — Medicação',      date:'28/04/2026', patient:'João Oliveira (Pai)',    prof:'Roberto Lima',    stars:4, price:'R$  75,00', status:'Cancelado',   statusColor:'#FEE2E2', statusText:'#991B1B' },
    ];

    const starsHtml = n => '★'.repeat(n) + '☆'.repeat(5 - n);

    const html = items.map((it, i) => `
      <div class="history-item" style="align-items:flex-start;gap:12px;">
        <div class="history-icon" style="background:${it.bg};flex-shrink:0;">${it.icon}</div>
        <div class="history-info" style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:2px;">
            <p class="history-service" style="margin:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${it.service}</p>
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;border-radius:20px;background:${it.statusColor};color:${it.statusText};flex-shrink:0;">${it.status}</span>
          </div>
          <p class="history-meta" style="margin:0 0 1px;">${it.date} · ${it.patient}</p>
          <p class="history-meta" style="margin:0 0 3px;">Prof: ${it.prof}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div class="history-stars">${starsHtml(it.stars)}</div>
            <span class="history-price">${it.price}</span>
          </div>
        </div>
      </div>
      ${i < items.length - 1 ? '<hr class="my-2">' : ''}
    `).join('');

    // Summary card
    const summary = `
      <div style="background:linear-gradient(135deg,#0891B2,#06B6D4);border-radius:16px;padding:16px;margin-bottom:16px;color:white;display:flex;justify-content:space-around;text-align:center;">
        <div>
          <div style="font-size:1.4rem;font-weight:800;">4</div>
          <div style="font-size:0.72rem;opacity:0.85;">Concluídos</div>
        </div>
        <div style="border-left:1px solid rgba(255,255,255,0.3);"></div>
        <div>
          <div style="font-size:1.4rem;font-weight:800;">R$ 596</div>
          <div style="font-size:0.72rem;opacity:0.85;">Total gasto</div>
        </div>
        <div style="border-left:1px solid rgba(255,255,255,0.3);"></div>
        <div>
          <div style="font-size:1.4rem;font-weight:800;">4.8 ★</div>
          <div style="font-size:0.72rem;opacity:0.85;">Média</div>
        </div>
      </div>
    `;

    const section = document.querySelector('#historyScreen .form-section');
    section.innerHTML = summary + html;
  });
  await page.screenshot({ path: 'telas/tela-historico.png' });
  console.log('✓ tela-historico.png');

  await browser.close();
  console.log('\nTodos os screenshots gerados.');
})().catch(e => { console.error(e.message); process.exit(1); });
